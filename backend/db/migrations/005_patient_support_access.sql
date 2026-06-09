ALTER TABLE biologics_combinations
ADD COLUMN IF NOT EXISTS company_or_sponsor TEXT,
ADD COLUMN IF NOT EXISTS patient_support_program TEXT,
ADD COLUMN IF NOT EXISTS patient_support_url TEXT,
ADD COLUMN IF NOT EXISTS patient_support_type TEXT,
ADD COLUMN IF NOT EXISTS compassionate_access_program TEXT,
ADD COLUMN IF NOT EXISTS compassionate_access_url TEXT,
ADD COLUMN IF NOT EXISTS compassionate_access_type TEXT,
ADD COLUMN IF NOT EXISTS support_access_notes TEXT;
