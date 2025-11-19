# PBS Biologics Lookup - Application Overview

## What Is This Application?

**PBS Biologics Lookup** is a web application that helps Australian medical specialists quickly find and reference PBS (Pharmaceutical Benefits Scheme) authority requirements for biologic medications and specialty therapies. The application provides a searchable database of PBS-listed medications with their approved indications, authority requirements, treatment phases, and prescribing restrictions.

## Who Is It For?

### Primary Users

- **Rheumatologists**: Prescribing biologics for rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, juvenile idiopathic arthritis, systemic lupus erythematosus, ANCA-associated vasculitis, giant cell arteritis, etc.

- **Dermatologists**: Prescribing biologics and specialty drugs for psoriasis, hidradenitis suppurativa, atopic dermatitis, chronic spontaneous urticaria, acne

- **Gastroenterologists**: Prescribing biologics for inflammatory bowel disease (Crohn's disease, ulcerative colitis), short bowel syndrome, gastrointestinal stromal tumors, VIPomas

### How They Use It

1. **Clinical Decision Support**: Quickly determine which biologics are PBS-approved for a specific indication

2. **Authority Requirements Lookup**: Check if a medication requires phone or streamlined authority, and what the treatment phase requirements are

3. **Prescribing Information**: View maximum quantities, repeats, pack sizes, and hospital type restrictions

4. **Brand Comparison**: Compare different brand formulations of the same generic drug

5. **Historical Schedule Comparison**: View how PBS listings have changed over time by selecting different schedule months/years

## User Workflow

1. **Select Specialty**: User navigates to their specialty page (Rheumatology, Dermatology, or Gastroenterology)

2. **Apply Filters**: User narrows down results using filters:
   - PBS Schedule (year/month)
   - Drug name
   - Brand name
   - Indication (medical condition)
   - Formulation (dosage form)
   - Treatment phase (Initial, Continuing)
   - Hospital type (Private, Public, Any)
   - PBS code

3. **View Results**: Results display as cards showing:
   - Drug and brand name
   - PBS code (linked to official PBS website)
   - Formulation details
   - Approved indication
   - Authority method (Streamlined, Telephone, etc.)
   - Treatment phase requirements
   - Maximum quantities and repeats
   - Online application availability

4. **Refine Search**: As filters are applied, the available options in other filters automatically update to show only valid combinations (cascading filters)

5. **Navigate Results**: Users can paginate through results and click links to official PBS documentation

## Data Source

### PBS CSV Exports

The application uses monthly CSV data exports from the official PBS website.

**Source URL Pattern**: `https://www.pbs.gov.au/downloads/{YYYY}/{MM}/{YYYY}-{MM}-01-PBS-API-CSV-files.zip`

**Update Frequency**: Monthly (on the 1st of each month)

**Required CSV Files** (extracted from ZIP archive):

1. `tables_as_csv/items.csv` - PBS items (drugs, brands, formulations, PBS codes)
2. `tables_as_csv/indications.csv` - Medical indications/conditions
3. `tables_as_csv/prescribing-texts.csv` - Prescribing text descriptions
4. `tables_as_csv/item-prescribing-text-relationships.csv` - Links items to prescribing texts
5. `tables_as_csv/restrictions.csv` - Authority restrictions and requirements
6. `tables_as_csv/item-restriction-relationships.csv` - Links items to restrictions
7. `tables_as_csv/restriction-prescribing-text-relationships.csv` - Links restrictions to prescribing texts

## Data Processing: From CSV to Database

### Step 1: Download and Extract

1. Download the ZIP archive from PBS website for target month (with lookback fallback if current month unavailable)
2. Extract the 7 required CSV files from the archive

### Step 2: Filter Target Drugs

From `items.csv`, filter rows where `drug_name` (case-insensitive) matches any drug in the **Target Drugs List** (see below). This narrows the dataset from ~10,000+ PBS items to ~200-500 relevant biologics.

### Step 3: Build Item Aggregates

For each unique `pbs_code` in the filtered items:

- Extract: `drug_name`, `brand_name`, `li_form` (or `schedule_form`), `manner_of_administration`, `maximum_prescribable_pack`, `maximum_quantity_units`, `number_of_repeats`, `program_code`
- Normalize `drug_name` to title case (e.g., "adalimumab" → "Adalimumab")
- Collect all `brand_name` values for this PBS code (multiple brands per code)
- Derive `hospital_type` from `program_code`:
  - `HS` → "Private"
  - `HB` → "Public"
  - Other → "Any"

### Step 4: Link Items to Restrictions

Using `item-restriction-relationships.csv`:

- For each PBS code, collect all linked `res_code` values
- This creates a many-to-many relationship: one PBS code can have multiple restrictions

### Step 5: Extract Restriction Details

From `restrictions.csv`, for each `res_code`:

- Extract: `authority_method`, `treatment_phase`, `treatment_of_code`, `schedule_html_text`
- Normalize `authority_method` to uppercase (e.g., "STREAMLINED", "TELEPHONE")
- Derive `streamlined_code`: If `authority_method` is "STREAMLINED", use `treatment_of_code`, otherwise null
- Derive `online_application`: If `schedule_html_text` exists and does NOT contain "HOBART TAS 7001", then `true`, otherwise `false`

### Step 6: Link Restrictions to Prescribing Texts

Using `restriction-prescribing-text-relationships.csv`:

- For each `res_code`, collect all linked `prescribing_text_id` values
- This allows finding which indications apply to each restriction

### Step 7: Match Indications

For each restriction's prescribing text IDs:

1. Look up `prescribing_text_id` in `indications.csv` to get `condition` field
2. Match `condition` text (case-insensitive) against **Indication Matchers** (see below)
3. Use the first matched standardized indication label
4. If no match found, skip this restriction (it's not a target indication)

**Indication Matching Logic**:
- Each matcher has keywords (array) and a standardized label
- If any keyword appears in the condition text, use that label
- Example: Condition "chronic plaque psoriasis" matches keywords ["psoriasis", "chronic plaque psoriasis"] → Label "Psoriasis"

### Step 8: Build Combination Rows

For each valid combination of:
- PBS code + Restriction + Matched Indication

Create one row per brand:

```
For each PBS code:
  For each linked restriction:
    If indication matched:
      For each brand of this PBS code:
        Create combination row with:
          - pbs_code
          - drug (normalized)
          - brand
          - formulation (li_form or schedule_form)
          - indication (matched label)
          - treatment_phase (from restriction)
          - streamlined_code (if applicable)
          - authority_method
          - online_application
          - hospital_type
          - maximum_prescribable_pack
          - maximum_quantity_units
          - number_of_repeats
          - schedule_code (YYYY-MM format)
          - schedule_year
          - schedule_month (uppercase month name)
```

### Step 9: Store in Database

- Delete all existing rows for this `schedule_code`
- Insert all new combination rows in a single transaction
- This ensures data consistency (no partial updates)

## Target Drugs List

The following 62 drug names (case-insensitive matching) are filtered from the PBS items:

### Rheumatology (19 drugs)
- adalimumab
- etanercept
- infliximab
- certolizumab
- golimumab
- rituximab
- abatacept
- tocilizumab
- secukinumab
- ixekizumab
- ustekinumab
- guselkumab
- tofacitinib
- baricitinib
- upadacitinib
- anifrolumab
- bimekizumab
- avacopan
- risankizumab

### Dermatology (20 drugs)
- adalimumab
- etanercept
- infliximab
- ustekinumab
- secukinumab
- ixekizumab
- guselkumab
- risankizumab
- tildrakizumab
- bimekizumab
- deucravacitinib
- apremilast
- dupilumab
- ciclosporin
- pimecrolimus
- acitretin
- isotretinoin
- methotrexate
- omalizumab
- upadacitinib

### Gastroenterology (19 drugs)
- adalimumab
- infliximab
- ustekinumab
- vedolizumab
- golimumab
- upadacitinib
- tofacitinib
- ozanimod
- etrasimod
- budesonide
- mesalazine
- balsalazide
- olsalazine
- imatinib
- sunitinib
- ripretinib
- octreotide
- teduglutide
- vancomycin

## Indication Matchers

The following keyword-to-label mappings are used to normalize free-text indications into standardized labels:

### Rheumatology Indications (8)

| Keywords | Standardized Label |
|----------|-------------------|
| anti-neutrophil cytoplasmic autoantibody (anca) associated vasculitis | Anti-neutrophil Cytoplasmic Autoantibody (ANCA) Associated Vasculitis |
| systemic lupus erythematosus | Systemic Lupus Erythematosus |
| juvenile idiopathic arthritis | Juvenile Idiopathic Arthritis |
| giant cell arteritis | Giant Cell Arteritis |
| non-radiographic axial spondyloarthritis | Non-radiographic Axial Spondyloarthritis |
| ankylosing spondylitis | Ankylosing Spondylitis |
| psoriatic arthritis | Psoriatic Arthritis |
| rheumatoid arthritis | Rheumatoid Arthritis |

### Dermatology Indications (6)

| Keywords | Standardized Label |
|----------|-------------------|
| hidradenitis suppurativa | Hidradenitis Suppurativa |
| psoriasis, chronic plaque psoriasis, scalp psoriasis, intractable psoriasis | Psoriasis |
| atopic dermatitis | Atopic Dermatitis |
| chronic spontaneous urticaria | Chronic Spontaneous Urticaria |
| cystic acne | Cystic Acne |
| acne | Acne |

### Gastroenterology Indications (7)

| Keywords | Standardized Label |
|----------|-------------------|
| fistulising crohn, crohn disease, crohn's disease | Crohn Disease |
| ulcerative colitis | Ulcerative Colitis |
| gastrointestinal stromal tumour | Gastrointestinal Stromal Tumour |
| short bowel syndrome | Short Bowel Syndrome |
| intestinal failure | Intestinal Failure |
| pseudomembranous colitis | Pseudomembranous Colitis |
| vasoactive intestinal peptide secreting tumour, vipoma | Vasoactive Intestinal Peptide Secreting Tumour |

## Specialty Scopes

The application organizes medications into three specialty categories. When a user selects a specialty, the application automatically filters to show only drugs and indications relevant to that specialty.

### Rheumatology Scope

**Drugs** (19): Adalimumab, Etanercept, Infliximab, Certolizumab, Golimumab, Rituximab, Abatacept, Tocilizumab, Secukinumab, Ixekizumab, Ustekinumab, Guselkumab, Tofacitinib, Baricitinib, Upadacitinib, Anifrolumab, Bimekizumab, Avacopan, Risankizumab

**Indications** (8): Rheumatoid Arthritis, Psoriatic Arthritis, Ankylosing Spondylitis, Non-radiographic Axial Spondyloarthritis, Giant Cell Arteritis, Juvenile Idiopathic Arthritis, Systemic Lupus Erythematosus, ANCA Associated Vasculitis

### Dermatology Scope

**Drugs** (20): Adalimumab, Etanercept, Infliximab, Ustekinumab, Secukinumab, Ixekizumab, Guselkumab, Risankizumab, Tildrakizumab, Bimekizumab, Deucravacitinib, Apremilast, Dupilumab, Ciclosporin, Pimecrolimus, Acitretin, Isotretinoin, Methotrexate, Omalizumab, Upadacitinib

**Indications** (6): Psoriasis, Hidradenitis Suppurativa, Atopic Dermatitis, Chronic Spontaneous Urticaria, Cystic Acne, Acne

### Gastroenterology Scope

**Drugs** (19): Adalimumab, Infliximab, Ustekinumab, Vedolizumab, Golimumab, Upadacitinib, Tofacitinib, Ozanimod, Etrasimod, Budesonide, Mesalazine, Balsalazide, Olsalazine, Imatinib, Sunitinib, Ripretinib, Octreotide, Teduglutide, Vancomycin

**Indications** (7): Crohn Disease, Ulcerative Colitis, Gastrointestinal Stromal Tumour, Short Bowel Syndrome, Intestinal Failure, Pseudomembranous Colitis, Vasoactive Intestinal Peptide Secreting Tumour

## Data Update Process

The application is designed to ingest new PBS schedules monthly:

1. **Automatic Scheduling**: A scheduled job runs monthly (default: 1st of month at 4:00 AM Australia/Sydney time)

2. **Schedule Resolution**: Attempts to download the current month's schedule. If unavailable, looks back up to 6 months (configurable) to find the most recent available schedule.

3. **Full Replace Strategy**: For each schedule, all existing data for that schedule code is deleted and replaced with new data. This ensures consistency and handles both new listings and removals.

4. **Historical Preservation**: Multiple schedules can coexist in the database, allowing users to compare how PBS listings changed over time.

## Key Data Relationships

The PBS data structure involves several many-to-many relationships:

- **One PBS code** → **Many brands** (same drug, different manufacturers)
- **One PBS code** → **Many restrictions** (different authority requirements)
- **One restriction** → **Many prescribing texts** (different indication descriptions)
- **One prescribing text** → **One indication** (condition description)

The ingestion process flattens these relationships into a single table where each row represents one unique combination of:
- PBS code + Brand + Restriction + Indication

This denormalized structure allows fast filtering and searching without complex joins.

