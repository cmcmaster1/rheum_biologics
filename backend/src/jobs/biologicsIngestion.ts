import { Open } from 'unzipper';
import Papa from 'papaparse';

import { replaceScheduleData, type NewBiologicsCombination } from '../services/biologicsService.js';

const REQUIRED_FILES = {
  items: 'tables_as_csv/items.csv',
  indications: 'tables_as_csv/indications.csv',
  prescribingTexts: 'tables_as_csv/prescribing-texts.csv',
  itemPrescribingTexts: 'tables_as_csv/item-prescribing-text-relationships.csv',
  restrictions: 'tables_as_csv/restrictions.csv',
  itemRestrictions: 'tables_as_csv/item-restriction-relationships.csv',
  restrictionPrescribingTexts: 'tables_as_csv/restriction-prescribing-text-relationships.csv'
} as const;

const BIOLOGICS = [
  'adalimumab',
  'etanercept',
  'infliximab',
  'certolizumab',
  'golimumab',
  'rituximab',
  'abatacept',
  'tocilizumab',
  'secukinumab',
  'ixekizumab',
  'ustekinumab',
  'guselkumab',
  'tofacitinib',
  'baricitinib',
  'upadacitinib',
  'anifrolumab',
  'bimekizumab',
  'avacopan',
  'risankizumab'
];

const RHEUMATIC_DISEASES = [
  'rheumatoid arthritis',
  'psoriatic arthritis',
  'ankylosing spondylitis',
  'non-radiographic axial spondyloarthritis',
  'giant cell arteritis',
  'juvenile idiopathic arthritis',
  'systemic lupus erythematosus',
  'anti-neutrophil cytoplasmic autoantibody (anca) associated vasculitis'
];

type CsvRow = Record<string, string | null>;

type RequiredTables = {
  items: CsvRow[];
  indications: CsvRow[];
  prescribingTexts: CsvRow[];
  itemPrescribingTexts: CsvRow[];
  restrictions: CsvRow[];
  itemRestrictions: CsvRow[];
  restrictionPrescribingTexts: CsvRow[];
};

type ScheduleMeta = {
  code: string;
  year: number;
  month: string;
};

type IngestionOptions = {
  targetDate?: Date;
  lookbackMonths?: number;
};

const monthName = (date: Date, locale = 'en-AU'): string =>
  date
    .toLocaleString(locale, { month: 'long', timeZone: 'UTC' })
    .toUpperCase();

const toNull = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;
  return trimmed;
};

const toNumber = (value: string | null | undefined): number | null => {
  const normalized = toNull(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeAuthority = (value: string | null | undefined): string | null => {
  const normalized = toNull(value);
  return normalized ? normalized.toUpperCase() : null;
};

const classifyHospitalType = (programCode: string | null | undefined): string | null => {
  const normalized = toNull(programCode)?.toUpperCase();
  if (!normalized) return null;
  if (normalized === 'HS') return 'Private';
  if (normalized === 'HB') return 'Public';
  return 'Any';
};

const toTitleCase = (value: string): string =>
  value
    .split(/\s+/)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');

const matchesBiologic = (drugName: string): boolean => {
  const lowered = drugName.toLowerCase();
  return BIOLOGICS.some((name) => lowered.includes(name));
};

const matchRheumaticIndication = (condition: string | null | undefined): string | null => {
  if (!condition) return null;
  const lowered = condition.toLowerCase();
  for (const disease of RHEUMATIC_DISEASES) {
    if (lowered.includes(disease)) {
      return disease
        .split(' ')
        .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
        .join(' ');
    }
  }
  return null;
};

const getDownloadUrl = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `https://www.pbs.gov.au/downloads/${year}/${month}/${year}-${month}-01-PBS-API-CSV-files.zip`;
};

const resolveScheduleToDownload = async (
  targetDate: Date,
  lookbackMonths: number
): Promise<{ date: Date; url: string }> => {
  const start = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1));

  for (let offset = 0; offset < lookbackMonths; offset += 1) {
    const candidate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - offset, 1));
    const url = getDownloadUrl(candidate);

    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return { date: candidate, url };
      }
    } catch (error) {
      console.warn(`Failed to reach PBS download for ${url}:`, error);
    }
  }

  throw new Error(`Unable to locate a downloadable PBS schedule within ${lookbackMonths} months`);
};

const downloadZip = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PBS archive ${url} (status ${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const parseCsv = (content: string): CsvRow[] => {
  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (result.errors.length > 0) {
    console.warn('Encountered CSV parse errors:', result.errors.slice(0, 3));
  }

  return result.data.filter((row) =>
    Object.values(row).some((value) => {
      if (value === undefined || value === null) return false;
      return String(value).trim() !== '' && String(value).trim().toLowerCase() !== 'null';
    })
  );
};

const extractTables = async (zipBuffer: Buffer): Promise<RequiredTables> => {
  const archive = await Open.buffer(zipBuffer);
  const tables: Partial<RequiredTables> = {};

  for (const [key, expectedPath] of Object.entries(REQUIRED_FILES)) {
    const entry = archive.files.find((file) => file.path.toLowerCase().endsWith(expectedPath));
    if (!entry) {
      throw new Error(`PBS archive missing required file: ${expectedPath}`);
    }

    const buffer = await entry.buffer();
    tables[key as keyof RequiredTables] = parseCsv(buffer.toString('utf-8'));
  }

  return tables as RequiredTables;
};

const buildScheduleMeta = (date: Date): ScheduleMeta => {
  const year = date.getUTCFullYear();
  const code = `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return {
    code,
    year,
    month: monthName(date)
  };
};

const buildCombinationRows = (tables: RequiredTables, schedule: ScheduleMeta): NewBiologicsCombination[] => {
  const restrictionLookup = new Map<string, CsvRow>();
  for (const restriction of tables.restrictions) {
    const resCode = toNull(restriction.res_code as string | null | undefined);
    if (resCode) {
      restrictionLookup.set(resCode, restriction);
    }
  }

  const indicationLookup = new Map<string, CsvRow>();
  for (const indication of tables.indications) {
    const key =
      toNull(indication.prescribing_text_id as string | null | undefined) ??
      toNull(indication.indication_prescribing_txt_id as string | null | undefined);
    if (key) {
      indicationLookup.set(key, indication);
    }
  }

  const restrictionPrescribingLookup = new Map<string, Set<string>>();
  for (const relation of tables.restrictionPrescribingTexts) {
    const resCode = toNull(relation.res_code as string | null | undefined);
    const prescribingId = toNull(relation.prescribing_text_id as string | null | undefined);
    if (!resCode || !prescribingId) continue;
    if (!restrictionPrescribingLookup.has(resCode)) {
      restrictionPrescribingLookup.set(resCode, new Set());
    }
    restrictionPrescribingLookup.get(resCode)?.add(prescribingId);
  }

  const resCodesByPbsCode = new Map<string, Set<string>>();
  for (const relation of tables.itemRestrictions) {
    const pbsCode = toNull(relation.pbs_code as string | null | undefined);
    const resCode = toNull(relation.res_code as string | null | undefined);
    if (!pbsCode || !resCode) continue;
    if (!resCodesByPbsCode.has(pbsCode)) {
      resCodesByPbsCode.set(pbsCode, new Set());
    }
    resCodesByPbsCode.get(pbsCode)?.add(resCode);
  }

  type ItemAggregate = {
    drug: string;
    liForm: string;
    scheduleForm: string;
    mannerOfAdministration: string;
    maximumPack: number | null;
    maximumQuantity: number | null;
    repeats: number | null;
    hospitalType: string | null;
    brands: Set<string>;
  };

  const itemsByPbsCode = new Map<string, ItemAggregate>();

  for (const item of tables.items) {
    const drugName = toNull(item.drug_name as string | null | undefined);
    if (!drugName || !matchesBiologic(drugName)) continue;

    const normalizedDrugName = toTitleCase(drugName);
    const pbsCode = toNull(item.pbs_code as string | null | undefined);
    const brandName = toNull(item.brand_name as string | null | undefined);
    if (!pbsCode || !brandName) continue;

    const aggregate = itemsByPbsCode.get(pbsCode) ?? {
      drug: normalizedDrugName,
      liForm: toNull(item.li_form as string | null | undefined) ?? '',
      scheduleForm: toNull(item.schedule_form as string | null | undefined) ?? '',
      mannerOfAdministration: toNull(item.manner_of_administration as string | null | undefined) ?? '',
      maximumPack: toNumber(item.maximum_prescribable_pack as string | null | undefined),
      maximumQuantity: toNumber(item.maximum_quantity_units as string | null | undefined),
      repeats: toNumber(item.number_of_repeats as string | null | undefined),
      hospitalType: classifyHospitalType(item.program_code as string | null | undefined),
      brands: new Set<string>()
    };

    aggregate.drug = normalizedDrugName;
    aggregate.brands.add(brandName);
    itemsByPbsCode.set(pbsCode, aggregate);
  }

  const combinations: NewBiologicsCombination[] = [];

  for (const [pbsCode, item] of itemsByPbsCode.entries()) {
    const linkedResCodes = resCodesByPbsCode.get(pbsCode);
    if (!linkedResCodes) continue;

    for (const resCode of linkedResCodes) {
      const restriction = restrictionLookup.get(resCode);
      if (!restriction) continue;

      const prescribingIds = restrictionPrescribingLookup.get(resCode);
      if (!prescribingIds || prescribingIds.size === 0) continue;

      let matchedIndication: string | null = null;
      for (const prescribingId of prescribingIds) {
        const indicationRow = indicationLookup.get(prescribingId);
        const indication = matchRheumaticIndication(
          indicationRow?.condition as string | null | undefined
        );
        if (indication) {
          matchedIndication = indication;
          break;
        }
      }

      if (!matchedIndication) continue;

      const authorityMethod =
        normalizeAuthority(restriction.authority_method as string | null | undefined) ?? null;
      const streamlinedCode =
        authorityMethod === 'STREAMLINED'
          ? toNull(restriction.treatment_of_code as string | null | undefined)
          : null;

      const scheduleHtml = toNull(
        restriction.schedule_html_text as string | null | undefined
      );
      const onlineApplication =
        scheduleHtml === null
          ? null
          : !scheduleHtml.includes('HOBART TAS 7001');

      for (const brand of item.brands) {
        combinations.push({
          pbs_code: pbsCode,
          drug: item.drug,
          brand,
          formulation: item.liForm || item.scheduleForm,
          indication: matchedIndication,
          treatment_phase: (() => {
            const phase = toNull(restriction.treatment_phase as string | null | undefined);
            return phase ? toTitleCase(phase.toLowerCase()) : null;
          })(),
          streamlined_code: streamlinedCode,
          authority_method: authorityMethod,
          online_application: onlineApplication,
          hospital_type: item.hospitalType,
          maximum_prescribable_pack: item.maximumPack,
          maximum_quantity_units: item.maximumQuantity,
          number_of_repeats: item.repeats,
          schedule_code: schedule.code,
          schedule_year: schedule.year,
          schedule_month: schedule.month
        });
      }
    }
  }

  return combinations;
};

export const runBiologicsIngestion = async (
  options: IngestionOptions = {}
): Promise<{ schedule: ScheduleMeta; count: number }> => {
  const targetDate = options.targetDate ?? new Date();
  const lookbackMonths = options.lookbackMonths ?? 6;

  const { date, url } = await resolveScheduleToDownload(targetDate, lookbackMonths);
  console.log(`[BiologicsIngestion] Downloading PBS schedule from ${url}`);

  const zip = await downloadZip(url);
  const tables = await extractTables(zip);
  const schedule = buildScheduleMeta(date);
  const combinations = buildCombinationRows(tables, schedule);

  if (combinations.length === 0) {
    throw new Error('PBS ingestion produced no biologics combinations');
  }

  await replaceScheduleData(schedule.code, combinations);

  console.log(
    `[BiologicsIngestion] Stored ${combinations.length} combinations for schedule ${schedule.code}`
  );

  return { schedule, count: combinations.length };
};
