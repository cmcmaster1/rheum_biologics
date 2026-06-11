export type PatientSupportAccess = {
  brand: string;
  generic_name: string;
  therapy_class: string;
  company_or_sponsor: string;
  patient_support_program?: string;
  patient_support_url?: string;
  patient_support_type?: string;
  compassionate_or_managed_access_program?: string;
  compassionate_or_managed_access_url?: string;
  compassionate_access_type?: string;
  notes?: string;
};

export const patientSupportAccess: PatientSupportAccess[] = [
  {
    brand: 'Orencia / Orencia ClickJect',
    generic_name: 'abatacept',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Bristol Myers Squibb',
    patient_support_program: 'ORENCIA Go Patient Materials',
    patient_support_url: 'https://www.bms.com/au/gated/OrenciaGO.html',
    patient_support_type: 'Patient education/resources',
    compassionate_or_managed_access_program: 'BMS Medical Information/contact',
    compassionate_or_managed_access_url: 'https://www.bms.com/au/about-us/contact-us.html',
    compassionate_access_type: 'No public AU CAP found; contact/medical information only',
    notes: 'Patient booklet and self-injection videos rather than a full public PSP.'
  },
  {
    brand: 'Abrilada',
    generic_name: 'adalimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Pfizer',
    patient_support_program: 'PfizerFlex',
    patient_support_url: 'https://www.pfizerflex.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_or_managed_access_program: 'Pfizer Access Programs',
    compassionate_or_managed_access_url: 'https://www.pfizeraccessprograms.com.au/',
    compassionate_access_type: 'HCP-only compassionate/access portal'
  },
  {
    brand: 'Amgevita',
    generic_name: 'adalimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Arrotex Biologics',
    patient_support_program: 'SupportEd',
    patient_support_url: 'https://www.supportedpsp.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_or_managed_access_program: 'Arrotex Biologics Compassionate Access Program - Amgevita',
    compassionate_or_managed_access_url: 'https://arrotexbiologics.pharmaprograms.com.au/compassionate-access/amgevita/',
    compassionate_access_type: 'Public CAP page'
  },
  {
    brand: 'Hadlima',
    generic_name: 'adalimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Arrotex Biologics / Samsung Bioepis',
    patient_support_program: 'SupportEd',
    patient_support_url: 'https://www.supportedpsp.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Humira',
    generic_name: 'adalimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'AbbVie',
    patient_support_program: 'AbbVie Care',
    patient_support_url: 'https://www.abbviecare.com.au/patientenrolment',
    patient_support_type: 'Patient support program',
    compassionate_or_managed_access_program: 'AbbVie Compassionate Access Portal',
    compassionate_or_managed_access_url: 'https://foc.abbvie.com.au/s/login/?startURL=compassionate',
    compassionate_access_type: 'Portal/login-based CAP'
  },
  {
    brand: 'Hyrimoz',
    generic_name: 'adalimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Sandoz',
    patient_support_program: 'Startz / Hyrimoz Pharmacy Care',
    patient_support_url: 'https://startz.sandoz.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Yuflyma',
    generic_name: 'adalimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Celltrion',
    patient_support_program: 'CelltrionCare',
    patient_support_url: 'https://celltrion.psphere.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Kineret',
    generic_name: 'anakinra',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Sobi',
    patient_support_program: 'Kineret Prescriber Guide and Patient Information Booklet via Sobi Medical Information',
    patient_support_url: 'https://www.sobi.com/australia/en/products-available-australia',
    patient_support_type: 'Patient information on request; no full public PSP found',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Saphnelo',
    generic_name: 'anifrolumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'AstraZeneca',
    patient_support_program: 'Saphnelo medicine information / CMI',
    patient_support_url: 'https://www.safetyandquality.gov.au/medicine-finder/saphnelo',
    patient_support_type: 'Product/CMI information only; no public AU PSP found',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Olumiant',
    generic_name: 'baricitinib',
    therapy_class: 'tsDMARD',
    company_or_sponsor: 'Eli Lilly',
    patient_support_program: 'LillyPlus Australia',
    patient_support_url: 'https://lilly.inserviohome.com.au/',
    patient_support_type: 'General patient support portal; Olumiant-specific public page not verified',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Bimzelx',
    generic_name: 'bimekizumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'UCB',
    patient_support_program: 'BE SUPPORTED',
    patient_support_url: 'https://ucbaustralia.com.au/product/bimzelx',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Cimzia',
    generic_name: 'certolizumab pegol',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'UCB',
    patient_support_program: 'Everyday Support Program',
    patient_support_url: 'https://ucbaustralia.com.au/product/cimzia',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Brenzys',
    generic_name: 'etanercept',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Organon',
    patient_support_program: 'Organon Connect',
    patient_support_url: 'https://org-connect.app.link/register',
    patient_support_type: 'Patient support app',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Enbrel',
    generic_name: 'etanercept',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Pfizer / SupportEd',
    patient_support_program: 'Enbrel PSP via SupportEd',
    patient_support_url: 'https://www.enbrel.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Erelzi',
    generic_name: 'etanercept',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Sandoz',
    patient_support_program: 'Startz',
    patient_support_url: 'https://startz.sandoz.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Nepexto',
    generic_name: 'etanercept',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Viatris / Mylan',
    patient_support_program: 'Nepexto medicine information / CMI',
    patient_support_url: 'https://www.safetyandquality.gov.au/medicine-finder/nepexto',
    patient_support_type: 'Product/CMI information only; no public AU PSP found',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Simponi',
    generic_name: 'golimumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Janssen',
    patient_support_program: 'Janssen Patient Support / Janssen Immunology PSP',
    patient_support_url: 'https://www.janssenpatientsupport.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_or_managed_access_program: 'JanssenPro Product Access',
    compassionate_or_managed_access_url: 'https://www.janssenpro.com.au/',
    compassionate_access_type: 'HCP product access / managed access route'
  },
  {
    brand: 'Tremfya',
    generic_name: 'guselkumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Janssen',
    patient_support_program: 'Janssen Patient Support / Janssen Immunology PSP',
    patient_support_url: 'https://www.janssenpatientsupport.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_or_managed_access_program: 'JanssenPro Product Access',
    compassionate_or_managed_access_url: 'https://www.janssenpro.com.au/',
    compassionate_access_type: 'HCP product access / managed access route'
  },
  {
    brand: 'Inflectra',
    generic_name: 'infliximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Pfizer',
    patient_support_type: 'No current public AU PSP found',
    compassionate_access_type: 'No public Inflectra-specific AU CAP found'
  },
  {
    brand: 'Ixifi',
    generic_name: 'infliximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Pfizer',
    patient_support_program: 'iXtend',
    patient_support_url: 'https://www.pfizeraccessprograms.com.au/ixtend',
    patient_support_type: 'HCP-only access portal; no patient PSP found',
    compassionate_or_managed_access_program: 'Pfizer Access Programs / iXtend',
    compassionate_or_managed_access_url: 'https://www.pfizeraccessprograms.com.au/ixtend',
    compassionate_access_type: 'HCP-only access program'
  },
  {
    brand: 'Remicade',
    generic_name: 'infliximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Janssen',
    patient_support_type: 'No public AU PSP found',
    compassionate_or_managed_access_program: 'JanssenPro Product Access',
    compassionate_or_managed_access_url: 'https://www.janssenpro.com.au/',
    compassionate_access_type: 'HCP product access / managed access route'
  },
  {
    brand: 'Remsima',
    generic_name: 'infliximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Celltrion',
    patient_support_program: 'CelltrionCare',
    patient_support_url: 'https://celltrion.psphere.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Remsima SC',
    generic_name: 'infliximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Celltrion',
    patient_support_program: 'CelltrionCare / Remsima-specific patient support brochure',
    patient_support_url: 'https://www.remsimate.com.au/PP/library/download.php?doc=Welcome-to-CelltrionCare-Patient-Brochure&id=326188',
    patient_support_type: 'Patient support program / patient brochure',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Renflexis',
    generic_name: 'infliximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Organon',
    patient_support_program: 'OrganonPro Renflexis resources',
    patient_support_url: 'https://organonpro.com/au-en/',
    patient_support_type: 'HCP product/patient resources only; no public patient PSP found',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Taltz',
    generic_name: 'ixekizumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Eli Lilly',
    patient_support_program: 'TaltzTogether Australia',
    patient_support_url: 'https://au.lilly.com/taltz',
    patient_support_type: 'Patient support/resources',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Skyrizi',
    generic_name: 'risankizumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'AbbVie',
    patient_support_program: 'Skyrizi AbbVieCare',
    patient_support_url: 'https://www.skyrizi.abbviecare.com.au/',
    patient_support_type: 'Patient support program / patient resource',
    compassionate_or_managed_access_program: 'AbbVie Compassionate Access Portal',
    compassionate_or_managed_access_url: 'https://foc.abbvie.com.au/s/login/?startURL=compassionate',
    compassionate_access_type: 'Portal/login-based CAP'
  },
  {
    brand: 'Riximyo',
    generic_name: 'rituximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Sandoz',
    patient_support_type: 'No public AU PSP found',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Ruxience',
    generic_name: 'rituximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Pfizer',
    patient_support_type: 'No public AU PSP found',
    compassionate_or_managed_access_program: 'Pfizer Access Programs',
    compassionate_or_managed_access_url: 'https://www.pfizeraccessprograms.com.au/',
    compassionate_access_type: 'Potential HCP-only Pfizer access route; Ruxience-specific page not verified'
  },
  {
    brand: 'Truxima',
    generic_name: 'rituximab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Celltrion',
    patient_support_program: 'CelltrionCare',
    patient_support_url: 'https://celltrion.psphere.com.au/',
    patient_support_type: 'Patient support program; brand-specific inclusion inferred from sponsor route',
    compassionate_access_type: 'No public AU CAP found'
  },
  {
    brand: 'Cosentyx',
    generic_name: 'secukinumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Novartis',
    patient_support_type: 'No public AU Cosentyx PSP found',
    compassionate_or_managed_access_program: 'Novartis Connect / Paid Managed Access Program',
    compassionate_or_managed_access_url: 'https://www.novartis.com/au-en/patients-and-caregivers/access-our-medicines',
    compassionate_access_type: 'Managed access route'
  },
  {
    brand: 'Actemra',
    generic_name: 'tocilizumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Roche',
    patient_support_program: 'Actemra Australian patient site / Roche patient education',
    patient_support_url: 'https://www.actemra.com.au/index.html',
    patient_support_type: 'Patient education/resource site; access-code/password style',
    compassionate_or_managed_access_program: 'Roche Access to Medicines',
    compassionate_or_managed_access_url: 'https://www.roche-australia.com/about/sustainability/access-to-medicines-and-diagnostics',
    compassionate_access_type: 'Alternative access mechanisms via HCP where not privately or publicly funded'
  },
  {
    brand: 'Xeljanz',
    generic_name: 'tofacitinib',
    therapy_class: 'tsDMARD',
    company_or_sponsor: 'Pfizer',
    patient_support_program: 'PfizerFlex / Xeljanz patient support',
    patient_support_url: 'https://www.pfizermedicalinformation.com.au/patient/xeljanz',
    patient_support_type: 'Patient support/resources',
    compassionate_or_managed_access_program: 'Pfizer Access Programs / Xtend',
    compassionate_or_managed_access_url: 'https://www.pfizeraccessprograms.com.au/',
    compassionate_access_type: 'HCP-only access portal'
  },
  {
    brand: 'Rinvoq',
    generic_name: 'upadacitinib',
    therapy_class: 'tsDMARD',
    company_or_sponsor: 'AbbVie',
    patient_support_program: 'Rinvoq Australia / AbbVie Care',
    patient_support_url: 'https://www.rinvoq.com.au/',
    patient_support_type: 'Patient support/resources',
    compassionate_or_managed_access_program: 'AbbVie Compassionate Access Portal',
    compassionate_or_managed_access_url: 'https://foc.abbvie.com.au/s/login/?startURL=compassionate',
    compassionate_access_type: 'Portal/login-based CAP'
  },
  {
    brand: 'Stelara',
    generic_name: 'ustekinumab',
    therapy_class: 'bDMARD',
    company_or_sponsor: 'Janssen',
    patient_support_program: 'Janssen Patient Support / Janssen Immunology PSP',
    patient_support_url: 'https://www.janssenpatientsupport.com.au/',
    patient_support_type: 'Patient support program',
    compassionate_or_managed_access_program: 'JanssenPro Product Access',
    compassionate_or_managed_access_url: 'https://www.janssenpro.com.au/',
    compassionate_access_type: 'HCP product access / managed access route'
  }
];

const normalizeBrand = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const brandAliases = patientSupportAccess
  .flatMap((entry) =>
    entry.brand.split('/').map((brand) => ({
      alias: normalizeBrand(brand),
      entry
    }))
  )
  .sort((left, right) => right.alias.length - left.alias.length);

export const findPatientSupportAccess = (brand: string) => {
  const normalizedBrand = normalizeBrand(brand);
  return brandAliases.find(
    ({ alias }) =>
      normalizedBrand === alias ||
      normalizedBrand.startsWith(`${alias} `) ||
      alias.startsWith(`${normalizedBrand} `)
  )?.entry;
};
