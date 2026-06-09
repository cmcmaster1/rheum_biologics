export type Combination = {
  id: number;
  pbs_code: string;
  drug: string;
  brand: string;
  formulation: string;
  indication: string;
  treatment_phase: string | null;
  streamlined_code: string | null;
  authority_method: string | null;
  online_application: boolean | null;
  hospital_type: string | null;
  maximum_prescribable_pack: number | null;
  maximum_quantity_units: number | null;
  number_of_repeats: number | null;
  company_or_sponsor: string | null;
  patient_support_program: string | null;
  patient_support_url: string | null;
  patient_support_type: string | null;
  compassionate_access_program: string | null;
  compassionate_access_url: string | null;
  compassionate_access_type: string | null;
  support_access_notes: string | null;
  schedule_code: string;
  schedule_year: number;
  schedule_month: string;
};

export type CombinationResponse = {
  data: Combination[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
