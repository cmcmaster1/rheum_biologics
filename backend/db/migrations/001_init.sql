CREATE TABLE IF NOT EXISTS biologics_combinations (
    id SERIAL PRIMARY KEY,
    pbs_code VARCHAR(20) NOT NULL,
    drug VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    formulation TEXT NOT NULL,
    indication TEXT NOT NULL,
    treatment_phase VARCHAR(50),
    streamlined_code VARCHAR(20),
    authority_method VARCHAR(50),
    online_application BOOLEAN,
    hospital_type VARCHAR(20),
    maximum_prescribable_pack INTEGER,
    maximum_quantity_units INTEGER,
    number_of_repeats INTEGER,
    schedule_code VARCHAR(10) NOT NULL,
    schedule_year INTEGER NOT NULL,
    schedule_month VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_biologics_schedule ON biologics_combinations(schedule_year, schedule_month);
CREATE INDEX IF NOT EXISTS idx_biologics_drug ON biologics_combinations(drug);
CREATE INDEX IF NOT EXISTS idx_biologics_indication ON biologics_combinations(indication);
CREATE INDEX IF NOT EXISTS idx_biologics_pbs_code ON biologics_combinations(pbs_code);
