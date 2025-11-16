import { replaceScheduleData, type NewBiologicsCombination } from '../services/biologicsService.js';

// PBS API v3 Configuration
// Base URL for the Australian Department of Health PBS API
// Documentation: https://data-api-portal.health.gov.au/api-details#api=pbs-api-public-v3&operation=get-api-v3
// API Specification: OpenAPI 3.0.1 (see pbs-api-public-v3.yaml)
const PBS_API_BASE_URL = process.env.PBS_API_BASE_URL || 'https://data-api.health.gov.au/pbs/api/v3';
// Default subscription key for unregistered public users (can be overridden via environment variable)
const PBS_API_SUBSCRIPTION_KEY = process.env.PBS_API_SUBSCRIPTION_KEY || '2384af7c667342ceb5a736fe29f1dc6b';

// API endpoint paths (from OpenAPI spec)
const API_ENDPOINTS = {
  items: '/items',
  indications: '/indications',
  prescribingTexts: '/prescribing-texts',
  itemPrescribingTexts: '/item-prescribing-text-relationships',
  restrictions: '/restrictions',
  itemRestrictions: '/item-restriction-relationships',
  restrictionPrescribingTexts: '/restriction-prescribing-text-relationships',
  schedules: '/schedules'
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

/**
 * Fetches data from a PBS API endpoint
 * Handles pagination if the API supports it
 * 
 * TODO: Adjust this function based on actual API response structure:
 * - Check if API uses pagination (page, offset, cursor, etc.)
 * - Verify response format (data wrapper, direct array, etc.)
 * - Handle authentication headers if required
 */
const fetchApiData = async <T = CsvRow>(
  endpoint: string,
  scheduleCode?: string
): Promise<T[]> => {
  // Construct full URL - base URL is https://data-api.health.gov.au/pbs/api/v3
  // endpoint should be like '/schedules' or 'schedules'
  const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Simply concatenate - base URL already includes the full path
  const fullUrl = `${PBS_API_BASE_URL}${endpointPath}`;
  const url = new URL(fullUrl);
  
  // Add schedule_code filter if provided (API supports filtering by schedule_code)
  // Note: schedule_code is a string identifier, not a date
  // To get the schedule_code for a date, query the /schedules endpoint first
  if (scheduleCode) {
    url.searchParams.set('schedule_code', scheduleCode);
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // Add subscription key (API uses Subscription-Key header per OpenAPI spec)
  if (PBS_API_SUBSCRIPTION_KEY) {
    headers['Subscription-Key'] = PBS_API_SUBSCRIPTION_KEY;
  }

  // Set default limit (API supports limit parameter)
  // Note: Public API has rate limits (check x-rate-limit-remaining header)
  const limit = 1000; // Maximum reasonable page size
  url.searchParams.set('limit', String(limit));

  const allData: T[] = [];
  let hasMore = true;
  let page = 1;
  const maxPages = 1000; // Safety limit

  while (hasMore && page <= maxPages) {
    // API uses page-based pagination
    if (page > 1) {
      url.searchParams.set('page', String(page));
    }

    try {
      const response = await fetch(url.toString(), { 
        headers
      });
      
      // Handle rate limiting (429) with retry
      if (response.status === 429) {
        const rateLimitReset = response.headers.get('x-rate-limit-reset');
        const waitTime = rateLimitReset 
          ? Math.max(Number.parseInt(rateLimitReset, 10) * 1000, 10000) 
          : 10000;
        console.log(`[BiologicsIngestion] Rate limit exceeded, waiting ${Math.ceil(waitTime / 1000)}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Retry the same request
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        throw new Error(
          `PBS API request failed for ${endpoint}: ${response.status} ${response.statusText}\n${errorText.substring(0, 500)}`
        );
      }

      const data = await response.json();
      
      // API returns { _meta: {...}, _links: {...}, data: [...] }
      let items: T[] = [];
      if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data)) {
        // Fallback: direct array response
        items = data;
      } else {
        console.warn(`Unexpected API response structure for ${endpoint}:`, Object.keys(data));
        items = [];
      }
      
      // Log pagination info from _meta if available
      if (data._meta) {
        console.log(`[BiologicsIngestion] Fetched page ${data._meta.page || page} of ${endpoint}: ${items.length} items (total: ${data._meta.total_records || 'unknown'})`);
      }

      allData.push(...items);

      // Check if there are more pages based on _meta or item count
      const totalRecords = data._meta?.total_records;
      const currentPage = data._meta?.page || page;
      const itemsPerPage = data._meta?.count || items.length;
      
      if (totalRecords !== undefined) {
        const totalPages = Math.ceil(totalRecords / limit);
        hasMore = currentPage < totalPages;
      } else {
        // Fallback: if we got fewer items than the limit, we've reached the last page
        hasMore = items.length >= limit;
      }

      // If no items returned, assume no more pages
      if (items.length === 0) {
        hasMore = false;
      }
      
      // Rate limiting: Check remaining requests from response headers
      const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
      const rateLimitLimit = response.headers.get('x-rate-limit-limit');
      const rateLimitReset = response.headers.get('x-rate-limit-reset');
      
      if (rateLimitRemaining && Number.parseInt(rateLimitRemaining, 10) <= 1 && hasMore) {
        const waitTime = rateLimitReset 
          ? Math.max(Number.parseInt(rateLimitReset, 10) * 1000, 10000) 
          : 10000; // Default 10 seconds if no reset time provided
        console.log(`[BiologicsIngestion] Rate limit low (${rateLimitRemaining}/${rateLimitLimit}), waiting ${Math.ceil(waitTime / 1000)}s before next request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      if (hasMore) {
        page += 1;
      }
    } catch (error) {
      // Retry network errors (but not too many times)
      const maxRetries = 3;
      let retryCount = 0;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        while (retryCount < maxRetries) {
          retryCount += 1;
          console.log(`[BiologicsIngestion] Network error on ${endpoint}, retry ${retryCount}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 5000 * retryCount)); // Exponential backoff
          
          try {
            const retryResponse = await fetch(url.toString(), { headers });
            if (retryResponse.ok) {
              // Success, continue with normal processing
              const retryData = await retryResponse.json();
              let retryItems: T[] = [];
              if (retryData.data && Array.isArray(retryData.data)) {
                retryItems = retryData.data;
              } else if (Array.isArray(retryData)) {
                retryItems = retryData;
              }
              
              if (retryData._meta) {
                console.log(`[BiologicsIngestion] Fetched page ${retryData._meta.page || page} of ${endpoint}: ${retryItems.length} items (total: ${retryData._meta.total_records || 'unknown'})`);
              }
              
              allData.push(...retryItems);
              
              const totalRecords = retryData._meta?.total_records;
              const currentPage = retryData._meta?.page || page;
              if (totalRecords !== undefined) {
                const totalPages = Math.ceil(totalRecords / limit);
                hasMore = currentPage < totalPages;
              } else {
                hasMore = retryItems.length >= limit;
              }
              
              if (retryItems.length === 0) {
                hasMore = false;
              }
              
              if (hasMore) {
                page += 1;
              }
              
              continue; // Successfully retried, continue the loop
            }
          } catch (retryError) {
            // Retry also failed, continue to next retry attempt
            if (retryCount >= maxRetries) {
              throw new Error(`Failed to fetch data from ${endpoint} after ${maxRetries} retries: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      } else {
        // Not a network error, throw immediately
        throw new Error(`Failed to fetch data from ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return allData;
};

/**
 * Finds the schedule_code for a given date by querying the /schedules endpoint
 */
const findScheduleCode = async (targetDate: Date, lookbackMonths: number): Promise<string | null> => {
  console.log('[BiologicsIngestion] Finding schedule code...');
  
  // Query schedules endpoint to find matching schedule_code
  const schedules = await fetchApiData<{ schedule_code: string; effective_year: number; effective_month: number }>(
    API_ENDPOINTS.schedules
  );
  
  // Try to find schedule matching target date, then look back
  for (let offset = 0; offset < lookbackMonths; offset += 1) {
    const candidateYear = targetDate.getUTCFullYear();
    const candidateMonth = targetDate.getUTCMonth() + 1 - offset;
    
    // Handle month/year rollover
    let year = candidateYear;
    let month = candidateMonth;
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    
    const matchingSchedule = schedules.find(
      (s) => s.effective_year === year && s.effective_month === month
    );
    
    if (matchingSchedule) {
      console.log(`[BiologicsIngestion] Found schedule_code ${matchingSchedule.schedule_code} for ${year}-${String(month).padStart(2, '0')}`);
      return matchingSchedule.schedule_code;
    }
  }
  
  // If no match found, try to get the latest schedule
  if (schedules.length > 0) {
    // Sort by year and month descending to get latest
    const sorted = schedules.sort((a, b) => {
      if (a.effective_year !== b.effective_year) {
        return b.effective_year - a.effective_year;
      }
      return b.effective_month - a.effective_month;
    });
    const latest = sorted[0];
    console.log(`[BiologicsIngestion] Using latest available schedule_code ${latest.schedule_code} (${latest.effective_year}-${String(latest.effective_month).padStart(2, '0')})`);
    return latest.schedule_code;
  }
  
  return null;
};

/**
 * Fetches all required tables from the PBS API
 */
const fetchTables = async (scheduleCode: string): Promise<RequiredTables> => {
  console.log(`[BiologicsIngestion] Fetching data from PBS API for schedule_code ${scheduleCode}...`);
  
  // Note: Due to rate limiting, we fetch sequentially
  // The API returns rate limit info in response headers (x-rate-limit-remaining)
  console.log('[BiologicsIngestion] Fetching items...');
  const items = await fetchApiData<CsvRow>(API_ENDPOINTS.items, scheduleCode);
  
  console.log('[BiologicsIngestion] Fetching indications...');
  const indications = await fetchApiData<CsvRow>(API_ENDPOINTS.indications, scheduleCode);
  
  console.log('[BiologicsIngestion] Fetching prescribing texts...');
  const prescribingTexts = await fetchApiData<CsvRow>(API_ENDPOINTS.prescribingTexts, scheduleCode);
  
  console.log('[BiologicsIngestion] Fetching item-prescribing-text relationships...');
  const itemPrescribingTexts = await fetchApiData<CsvRow>(API_ENDPOINTS.itemPrescribingTexts, scheduleCode);
  
  console.log('[BiologicsIngestion] Fetching restrictions...');
  const restrictions = await fetchApiData<CsvRow>(API_ENDPOINTS.restrictions, scheduleCode);
  
  console.log('[BiologicsIngestion] Fetching item-restriction relationships...');
  const itemRestrictions = await fetchApiData<CsvRow>(API_ENDPOINTS.itemRestrictions, scheduleCode);
  
  console.log('[BiologicsIngestion] Fetching restriction-prescribing-text relationships...');
  const restrictionPrescribingTexts = await fetchApiData<CsvRow>(API_ENDPOINTS.restrictionPrescribingTexts, scheduleCode);

  return {
    items,
    indications,
    prescribingTexts,
    itemPrescribingTexts,
    restrictions,
    itemRestrictions,
    restrictionPrescribingTexts
  };
};

/**
 * Resolves schedule information from schedule_code
 * Fetches schedule details to get the actual date
 */
const resolveScheduleFromCode = async (scheduleCode: string): Promise<{ date: Date; code: string; year: number; month: string }> => {
  const schedules = await fetchApiData<{ 
    schedule_code: string; 
    effective_year: number; 
    effective_month: number;
    effective_date?: string;
  }>(API_ENDPOINTS.schedules);
  
  const schedule = schedules.find((s) => s.schedule_code === scheduleCode);
  
  if (!schedule) {
    throw new Error(`Schedule code ${scheduleCode} not found`);
  }
  
  const date = new Date(Date.UTC(schedule.effective_year, schedule.effective_month - 1, 1));
  const code = `${schedule.effective_year}-${String(schedule.effective_month).padStart(2, '0')}`;
  
  return {
    date,
    code,
    year: schedule.effective_year,
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

  // Find the schedule_code for the target date
  const scheduleCode = await findScheduleCode(targetDate, lookbackMonths);
  
  if (!scheduleCode) {
    throw new Error(`Unable to find a valid schedule_code within ${lookbackMonths} months of target date`);
  }

  // Fetch all data for this schedule_code
  const tables = await fetchTables(scheduleCode);
  
  // Resolve schedule metadata from schedule_code
  const scheduleInfo = await resolveScheduleFromCode(scheduleCode);
  const schedule: ScheduleMeta = {
    code: scheduleInfo.code,
    year: scheduleInfo.year,
    month: scheduleInfo.month
  };
  
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
