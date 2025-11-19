# PBS Biologics Lookup - Comprehensive Application Summary

## Executive Overview

**PBS Biologics Lookup** is a modern web application designed for Australian medical specialists (rheumatologists, dermatologists, and gastroenterologists) to quickly search and reference PBS (Pharmaceutical Benefits Scheme) authority requirements for biologic medications and specialty therapies. The application replaces a legacy Gradio prototype with a production-grade, server-hosted solution.

## Target Audience & Use Cases

### Primary Users

- **Rheumatologists**: Prescribing biologics for rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, juvenile idiopathic arthritis, systemic lupus erythematosus, ANCA-associated vasculitis, giant cell arteritis, etc.
- **Dermatologists**: Prescribing biologics and specialty drugs for psoriasis, hidradenitis suppurativa, atopic dermatitis, chronic spontaneous urticaria, acne
- **Gastroenterologists**: Prescribing biologics for inflammatory bowel disease (Crohn's disease, ulcerative colitis), short bowel syndrome, gastrointestinal stromal tumors, VIPomas

### Key Use Cases

1. **Clinical Decision Support**: Quickly determine which biologics are PBS-approved for a specific indication
2. **Authority Requirements Lookup**: Check if a medication requires phone or streamlined authority, and what the treatment phase requirements are
3. **Prescribing Information**: View maximum quantities, repeats, pack sizes, and hospital type restrictions
4. **Brand Comparison**: Compare different brand formulations of the same generic drug
5. **Historical Schedule Comparison**: View how PBS listings have changed over time by selecting different schedule months/years

## Data Sources

### Primary Data Source: PBS (Pharmaceutical Benefits Scheme) CSV Exports

**Source URL Pattern**: `https://www.pbs.gov.au/downloads/{YYYY}/{MM}/{YYYY}-{MM}-01-PBS-API-CSV-files.zip`

**Data Update Frequency**: Monthly (on the 1st of each month)

**Required CSV Files** (extracted from ZIP archive):

1. `tables_as_csv/items.csv` - PBS items (drugs, brands, formulations, PBS codes)
2. `tables_as_csv/indications.csv` - Medical indications/conditions
3. `tables_as_csv/prescribing-texts.csv` - Prescribing text descriptions
4. `tables_as_csv/item-prescribing-text-relationships.csv` - Links items to prescribing texts
5. `tables_as_csv/restrictions.csv` - Authority restrictions and requirements
6. `tables_as_csv/item-restriction-relationships.csv` - Links items to restrictions
7. `tables_as_csv/restriction-prescribing-text-relationships.csv` - Links restrictions to prescribing texts

**Data Processing Logic**:

- **Drug Filtering**: Only items matching a curated list of ~62 target drug names (biologics and specialty therapies) are ingested
- **Indication Matching**: Free-text indication descriptions are normalized into ~25 standardized indication labels using keyword matching
- **Brand Aggregation**: Multiple brands for the same PBS code are expanded into separate rows
- **Authority Classification**: Authority methods are normalized (STREAMLINED, TELEPHONE, etc.)
- **Hospital Type Derivation**: Derived from program codes (HS=Private, HB=Public, others=Any)
- **Online Application Detection**: Determined by presence/absence of specific text in schedule HTML

### Specialty Scopes

The application organizes medications into three specialty categories:

**Rheumatology** (19 drugs, 8 indications):

- Drugs: Adalimumab, Etanercept, Infliximab, Certolizumab, Golimumab, Rituximab, Abatacept, Tocilizumab, Secukinumab, Ixekizumab, Ustekinumab, Guselkumab, Tofacitinib, Baricitinib, Upadacitinib, Anifrolumab, Bimekizumab, Avacopan, Risankizumab
- Indications: Rheumatoid Arthritis, Psoriatic Arthritis, Ankylosing Spondylitis, Non-radiographic Axial Spondyloarthritis, Giant Cell Arteritis, Juvenile Idiopathic Arthritis, Systemic Lupus Erythematosus, ANCA Associated Vasculitis

**Dermatology** (18 drugs, 6 indications):

- Drugs: Adalimumab, Etanercept, Infliximab, Ustekinumab, Secukinumab, Ixekizumab, Guselkumab, Risankizumab, Tildrakizumab, Bimekizumab, Deucravacitinib, Apremilast, Dupilumab, Ciclosporin, Pimecrolimus, Acitretin, Isotretinoin, Methotrexate, Omalizumab, Upadacitinib
- Indications: Psoriasis, Hidradenitis Suppurativa, Atopic Dermatitis, Chronic Spontaneous Urticaria, Cystic Acne, Acne

**Gastroenterology** (19 drugs, 7 indications):

- Drugs: Adalimumab, Infliximab, Ustekinumab, Vedolizumab, Golimumab, Upadacitinib, Tofacitinib, Ozanimod, Etrasimod, Budesonide, Mesalazine, Balsalazide, Olsalazine, Imatinib, Sunitinib, Ripretinib, Octreotide, Teduglutide, Vancomycin
- Indications: Crohn Disease, Ulcerative Colitis, Gastrointestinal Stromal Tumour, Short Bowel Syndrome, Intestinal Failure, Pseudomembranous Colitis, Vasoactive Intestinal Peptide Secreting Tumour

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                          │
│   - React 18 + Vite                                              │
│   - Material-UI (MUI) components                                 │
│   - React Query for data fetching                                │
│   - Zustand for state management                                 │
│   - React Router for navigation                                  │
└───────────────────────────────┬──────────────────────────────────┘
                                │ REST API (HTTP/JSON)
                                │
┌───────────────────────────────┴──────────────────────────────────┐
│                    Backend (Node.js/Express)                      │
│   - Express.js REST API                                          │
│   - TypeScript                                                   │
│   - Node-cron scheduler                                          │
│   - Background ingestion job                                     │
└───────────────────────────────┬──────────────────────────────────┘
                                │ pg (PostgreSQL driver)
                                │
┌───────────────────────────────┴──────────────────────────────────┐
│                      PostgreSQL Database                          │
│   - Single table: biologics_combinations                         │
│   - Indexes: schedule, drug, indication, pbs_code                │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                    External Data Source
                                │
                    ┌───────────┴──────────┐
                    │   PBS Website        │
                    │   (pbs.gov.au)       │
                    │   Monthly CSV exports│
                    └──────────────────────┘
```

### Technology Stack

**Frontend**:

- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.2
- **UI Library**: Material-UI (MUI) 5.15
- **State Management**: Zustand 4.5 (global filters), React Query 5.45 (server state)
- **Routing**: React Router DOM 6.23
- **HTTP Client**: Axios 1.6

**Backend**:

- **Runtime**: Node.js 18+
- **Framework**: Express 4.19 with TypeScript
- **Database Client**: pg (node-postgres) 8.12
- **Task Scheduling**: node-cron 3.0
- **CSV Parsing**: PapaParse 5.4
- **Archive Handling**: unzipper 0.11
- **Validation**: Zod 3.23
- **GitHub Integration**: @octokit/rest 22.0 (for feedback system)

**Database**:

- **RDBMS**: PostgreSQL 14+
- **Schema**: Single normalized table with indexes

**Infrastructure**:

- **Deployment**: Railway (recommended), Docker, or traditional hosting
- **Build**: Docker, Nixpacks, or native npm build
- **Process Management**: Native Node.js (no PM2/Forever required)

## Database Schema

### Table: `biologics_combinations`

```sql
CREATE TABLE biologics_combinations (
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

-- Indexes
CREATE INDEX idx_biologics_schedule ON biologics_combinations(schedule_year, schedule_month);
CREATE INDEX idx_biologics_drug ON biologics_combinations(drug);
CREATE INDEX idx_biologics_indication ON biologics_combinations(indication);
CREATE INDEX idx_biologics_pbs_code ON biologics_combinations(pbs_code);
```

**Field Descriptions**:

- `pbs_code`: PBS item code (e.g., "14251H")
- `drug`: Generic drug name (title case)
- `brand`: Brand name
- `formulation`: Dosage form and strength (e.g., "injection 40 mg/0.8 mL")
- `indication`: Standardized indication label
- `treatment_phase`: "Initial", "Continuing", or null
- `streamlined_code`: Treatment of code for streamlined authority (if applicable)
- `authority_method`: "STREAMLINED", "TELEPHONE", "WRITTEN", etc.
- `online_application`: Whether online application is available (true) or requires calling Services Australia (false)
- `hospital_type`: "Private", "Public", "Any", or null
- `maximum_prescribable_pack`: Maximum number of packs
- `maximum_quantity_units`: Maximum quantity in units
- `number_of_repeats`: Number of repeats allowed
- `schedule_code`: PBS schedule identifier (e.g., "2025-10")
- `schedule_year`: Year of PBS schedule
- `schedule_month`: Month name in uppercase (e.g., "OCTOBER")

## REST API Specification

### Base URL

`/api` (all routes prefixed)

### Endpoints

#### 1. **GET /api/combinations**

Search biologics combinations with filtering and pagination.

**Query Parameters**:

- `specialty` (string, optional): "rheumatology" | "dermatology" | "gastroenterology" - Filters by specialty scope
- `schedule_year` (integer, optional): Filter by PBS schedule year
- `schedule_month` (string, optional): Filter by PBS schedule month (e.g., "OCTOBER")
- `drug` (string[], optional): Filter by drug name(s) - comma-separated or array
- `brand` (string[], optional): Filter by brand name(s)
- `formulation` (string[], optional): Filter by formulation(s)
- `indication` (string[], optional): Filter by indication(s)
- `treatment_phase` (string[], optional): Filter by treatment phase(s)
- `hospital_type` (string[], optional): Filter by hospital type(s)
- `authority_method` (string[], optional): Filter by authority method(s)
- `pbs_code` (string[], optional): Filter by PBS code(s)
- `sort` (string, optional): "drug" | "brand" | "formulation" | "indication" | "schedule" - Sort order
- `limit` (integer, optional, default=25): Results per page
- `offset` (integer, optional, default=0): Pagination offset

**Response**:

```json
{
  "data": [
    {
      "id": 123,
      "pbs_code": "14251H",
      "drug": "Adalimumab",
      "brand": "Humira",
      "formulation": "injection 40 mg/0.8 mL",
      "indication": "Rheumatoid Arthritis",
      "treatment_phase": "Initial",
      "streamlined_code": "XD123",
      "authority_method": "STREAMLINED",
      "online_application": true,
      "hospital_type": "Any",
      "maximum_prescribable_pack": 2,
      "maximum_quantity_units": 2,
      "number_of_repeats": 5,
      "schedule_code": "2025-10",
      "schedule_year": 2025,
      "schedule_month": "OCTOBER",
      "created_at": "2025-10-01T00:00:00.000Z",
      "updated_at": "2025-10-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 456,
    "limit": 25,
    "offset": 0
  }
}
```

#### 2. **GET /api/schedules**

Get all available PBS schedules.

**Response**:

```json
[
  {
    "schedule_year": 2025,
    "schedule_month": "OCTOBER",
    "schedule_code": "2025-10",
    "latest": true
  },
  {
    "schedule_year": 2025,
    "schedule_month": "SEPTEMBER",
    "schedule_code": "2025-09",
    "latest": false
  }
]
```

#### 3. **GET /api/drugs**

Get distinct drug values (dynamic lookup based on current filters).

**Query Parameters**: Same filter parameters as `/api/combinations` (except `drug` itself)

**Response**:

```json
["Adalimumab", "Etanercept", "Infliximab"]
```

#### 4. **GET /api/brands**

Get distinct brand values (dynamic lookup).

**Query Parameters**: Same filter parameters as `/api/combinations` (except `brand` itself)

**Response**:

```json
["Humira", "Amgevita", "Hyrimoz"]
```

#### 5. **GET /api/formulations**

Get distinct formulation values (dynamic lookup).

**Response**: Array of strings

#### 6. **GET /api/indications**

Get distinct indication values (dynamic lookup).

**Response**: Array of strings

#### 7. **GET /api/treatment-phases**

Get distinct treatment phase values (dynamic lookup).

**Response**: Array of strings

#### 8. **GET /api/hospital-types**

Get distinct hospital type values (dynamic lookup).

**Response**: Array of strings

#### 9. **GET /api/pbs-codes**

Get distinct PBS codes (dynamic lookup).

**Response**: Array of strings

#### 10. **POST /api/feedback**

Submit user feedback (creates GitHub issue).

**Request Body**:

```json
{
  "type": "bug" | "feature" | "new_medication" | "new_indication",
  "message": "User feedback message",
  "contact": "user@example.com" (optional)
}
```

**Response** (202 Accepted):

```json
{
  "ok": true,
  "queued": true
}
```

## User Experience (UX) Design

### Navigation Structure

```
Home (/)
├── Landing Page
│   ├── Hero Section
│   ├── Specialty Cards (Rheumatology, Dermatology, Gastroenterology)
│   └── Sponsor Banner
│
├── Rheumatology (/rheumatology)
│   ├── Specialty Hero
│   ├── Search Filters Panel
│   └── Results Grid
│
├── Dermatology (/dermatology)
│   ├── Specialty Hero
│   ├── Search Filters Panel
│   └── Results Grid
│
└── Gastroenterology (/gastroenterology)
    ├── Specialty Hero
    ├── Search Filters Panel
    └── Results Grid
```

### Key UI Components

#### 1. **App Bar** (Persistent Header)

- **Branding**: "PBS Biologics Lookup" title
- **Navigation Tabs**: Home, Rheumatology, Dermatology, Gastroenterology
- **Actions**: Dark mode toggle, "Send Feedback" button
- **Sponsor Banner**: Advertisement space placeholder
- **Design**: Sticky positioning, frosted glass effect (backdrop blur), transparent background

#### 2. **Landing Page**

- **Hero Section**: Large title and subtitle explaining the app's purpose
- **Specialty Cards**: Three cards (one per specialty) with:
  - Specialty name
  - Brief description
  - "Explore" button linking to specialty page

#### 3. **Specialty Pages**

Each specialty page contains:

- **Hero**: Specialty title and description
- **Filters Panel**: Advanced search interface
- **Results Grid**: Two-column card grid of matching medications

#### 4. **Filters Panel** (Core UX Component)

A bordered paper panel containing:

- **Schedule Selector**: Dropdown to select PBS schedule (year/month)
- **Drug Filter**: Multi-select autocomplete
- **Brand Filter**: Multi-select autocomplete
- **Indication Filter**: Multi-select autocomplete
- **Formulation Filter**: Multi-select autocomplete
- **Treatment Phase Filter**: Multi-select autocomplete
- **Hospital Type Filter**: Multi-select autocomplete
- **PBS Code Filter**: Multi-select autocomplete
- **Reset Button**: Clears all filters (preserves specialty)

**Key Behaviors**:

- **Dynamic Cascading Filters**: As you select values in one filter, the options in other filters update to show only combinations that exist in the database. This prevents users from selecting incompatible combinations.
- **Multi-Selection**: All filters support selecting multiple values (OR logic)
- **Loading States**: Filters show loading indicators while fetching options
- **Responsive Layout**: Filters stack vertically on mobile, arrange in rows on desktop

#### 5. **Results Grid**

- **Layout**: Two-column grid on desktop, single column on mobile
- **Result Cards**: Material-UI cards displaying:
  - Drug name (with optional "ARA Info" link for rheumatology drugs)
  - Brand name
  - PBS code (linked to official PBS website)
  - Formulation
  - Indication
  - Treatment phase (if applicable)
  - Hospital type (if applicable)
  - Authority method
  - Streamlined code (if applicable)
  - Maximum pack/quantity
  - Number of repeats
  - Online application availability
- **Pagination**: Material-UI pagination component (if > 25 results)
- **Result Count**: Shows "X of Y results" and current schedule

#### 6. **Feedback Dialog**

Modal dialog for submitting feedback:

- **Type Selector**: Bug report, Feature request, New medication, New indication
- **Message Field**: Multi-line text input
- **Contact Field**: Optional email address
- **Submit Button**: Creates GitHub issue asynchronously

#### 7. **Dark Mode**

- Full theme switching between light and dark modes
- Persisted preference (browser storage)
- Toggle button in app bar

### UX Patterns

#### Filter-First Approach

The application uses a **filter-first** design philosophy:

1. User selects a specialty (which pre-filters by indication/drug)
2. User narrows down using additional filters
3. Results update dynamically as filters change
4. All filter changes reset pagination to page 1

#### Progressive Disclosure

- Start broad (specialty level)
- Add filters as needed
- See immediate feedback (result count updates)

#### Keyboard & Accessibility

- Material-UI components provide ARIA attributes
- Keyboard navigation supported in all filters
- Focus management in dialogs

### Visual Design System

**Theme**:

- **Typography**: Roboto font family (Material-UI default)
- **Color Palette**: Material-UI primary/secondary colors
- **Spacing**: 8px baseline grid
- **Elevation**: Subtle shadows for cards and panels
- **Borders**: 1px solid divider color for outlined components

**Responsive Breakpoints**:

- `xs`: < 600px (mobile)
- `sm`: 600px - 900px (tablet)
- `md`: 900px - 1200px (small desktop)
- `lg`: 1200px+ (desktop)

## Workflow & Data Flow

### 1. Data Ingestion Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Scheduled Trigger (or Manual)                           │
│ - Cron job runs monthly (default: 1st of month at 4:00 AM AEST) │
│ - Or: npm run ingest:run                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Resolve PBS Schedule to Download                        │
│ - Target: Current month (or specified --date=YYYY-MM)           │
│ - Lookback: Try current month, then up to N months back         │
│ - Check HEAD request to PBS URL until available schedule found  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Download ZIP Archive                                    │
│ - GET https://www.pbs.gov.au/downloads/YYYY/MM/...              │
│ - Download entire ZIP file to memory                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Extract Required CSV Files                              │
│ - Unzip archive in-memory                                       │
│ - Extract 7 required CSV files                                  │
│ - Parse CSV with PapaParse                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Build In-Memory Indexes                                 │
│ - Index restrictions by res_code                                │
│ - Index indications by prescribing_text_id                      │
│ - Index restriction-prescribing relationships                   │
│ - Index item-restriction relationships                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Filter & Transform Items                                │
│ - FOR EACH item in items.csv:                                   │
│   - Match drug_name against TARGET_DRUGS list                   │
│   - Skip if not a target biologic                               │
│   - Normalize drug name to title case                           │
│   - Extract PBS code, brand, formulation, quantities, repeats   │
│   - Classify hospital type from program_code                    │
│   - Aggregate multiple brands per PBS code                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Match Indications                                       │
│ - FOR EACH PBS code:                                            │
│   - Get linked restriction codes                                │
│   - FOR EACH restriction:                                       │
│     - Get linked prescribing text IDs                           │
│     - Look up indication condition text                         │
│     - Match condition against INDICATION_MATCHERS               │
│     - Use first matched standardized indication label           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: Build Combination Rows                                  │
│ - FOR EACH valid PBS code + indication match:                   │
│   - Extract authority method, streamlined code                  │
│   - Detect online application availability                      │
│   - Normalize treatment phase                                   │
│   - FOR EACH brand:                                             │
│     - Create combination row object                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 9: Database Transaction                                    │
│ - BEGIN TRANSACTION                                             │
│ - DELETE all rows with matching schedule_code                   │
│ - INSERT new rows in chunks of 500                              │
│ - COMMIT TRANSACTION                                            │
│ - (On error: ROLLBACK)                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 10: Log Success                                            │
│ - Log: "Stored N combinations for schedule YYYY-MM"            │
└─────────────────────────────────────────────────────────────────┘
```

**Ingestion Configuration** (Environment Variables):

- `BIOLOGICS_INGEST_ENABLED` (boolean): Enable/disable scheduler
- `BIOLOGICS_INGEST_CRON` (string): Cron expression (default: `0 4 1 * *`)
- `BIOLOGICS_INGEST_TZ` (string): Timezone (default: `Australia/Sydney`)
- `BIOLOGICS_INGEST_LOOKBACK` (integer): Months to look back (default: 6)

### 2. User Search Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User Navigates to Specialty Page                        │
│ - Click specialty card or tab                                   │
│ - Router navigates to /rheumatology, /dermatology, or /gastro   │
│ - Zustand store updates specialty filter                        │
│ - All other filters reset to defaults                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Initial Data Load                                       │
│ - React Query: useCombinationSearch hook executes               │
│ - API: GET /api/combinations?specialty=X                        │
│ - Database: Filter by specialty indication scope                │
│ - Return: First 25 results + total count                        │
│ - UI: Display results in grid                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Load Filter Options (Parallel)                          │
│ - useLookupOptions hooks execute for each filter                │
│ - API: GET /api/drugs?specialty=X                               │
│ - API: GET /api/brands?specialty=X                              │
│ - API: GET /api/indications?specialty=X                         │
│ - API: GET /api/formulations?specialty=X                        │
│ - API: GET /api/treatment-phases?specialty=X                    │
│ - API: GET /api/hospital-types?specialty=X                      │
│ - API: GET /api/pbs-codes?specialty=X                           │
│ - Database: SELECT DISTINCT for each field with specialty scope │
│ - UI: Populate autocomplete options                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: User Selects Filter Values                              │
│ - User types in autocomplete field                              │
│ - User selects one or more values                               │
│ - Zustand: setFilter(key, values) updates store                 │
│ - Zustand: page resets to 1                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Cascading Filter Update                                 │
│ - React Query: useCombinationSearch re-executes automatically   │
│ - API: GET /api/combinations?specialty=X&drug=Y&brand=Z...      │
│ - Database: Complex WHERE clause with AND logic                 │
│ - Return: Updated results + new total count                     │
│ - UI: Results grid updates                                      │
│                                                                  │
│ - React Query: useLookupOptions hooks re-execute (for each)     │
│ - API: GET /api/[field]?specialty=X&drug=Y&brand=Z... (excl.)   │
│   Note: Exclude the field being looked up from query params     │
│ - Database: SELECT DISTINCT with other filters applied          │
│ - Return: Updated option list (only valid combinations)         │
│ - UI: Autocomplete options update (cascading effect)            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: User Changes Page                                       │
│ - User clicks pagination button                                 │
│ - Zustand: setPage(N) updates store                             │
│ - React Query: useCombinationSearch re-executes                 │
│ - API: GET /api/combinations?...&limit=25&offset=(N-1)*25       │
│ - Database: Same query with LIMIT and OFFSET                    │
│ - Return: Next page of results                                  │
│ - UI: Results grid updates, scroll to top                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: User Clicks Result Card Links                           │
│ - "PBS [code]" link: Opens pbs.gov.au/medicine/item/[code]      │
│ - "ARA Info" link: Opens rheumatology.org.au/...                │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Feedback Submission Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User Clicks "Send Feedback"                             │
│ - Open feedback dialog modal                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: User Fills Form                                         │
│ - Select type: Bug, Feature, New Medication, New Indication     │
│ - Enter message (required, min 5 chars)                         │
│ - Enter email (optional)                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Submit Feedback                                         │
│ - API: POST /api/feedback with type, message, contact           │
│ - Backend: Validate with Zod schema                             │
│ - Backend: Queue GitHub issue creation (setImmediate)           │
│ - Backend: Return 202 Accepted immediately                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Async GitHub Issue Creation                             │
│ - Octokit: Create issue in GitHub repository                    │
│ - Title: Emoji + "[Feedback] " + type                           │
│ - Body: Formatted markdown with message, contact, metadata      │
│ - Labels: Type-specific labels (e.g., bug, feedback)            │
│ - On error: Log to console (don't block response)               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: User Sees Success Message                               │
│ - UI: Display "Thank you! Feedback sent." alert                 │
│ - Form clears                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Backend Environment Variables

**Required**:

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`)
- `PORT`: API server port (default: 3001)

**Ingestion Configuration**:

- `BIOLOGICS_INGEST_ENABLED`: `true` | `false` (enable scheduler)
- `BIOLOGICS_INGEST_CRON`: Cron expression (default: `0 4 1 * *` = 1st day of month at 4:00 AM)
- `BIOLOGICS_INGEST_TZ`: Timezone string (default: `Australia/Sydney`)
- `BIOLOGICS_INGEST_LOOKBACK`: Number of months to look back (default: 6)

**Optional**:

- `NODE_ENV`: `production` | `development`
- `CORS_ORIGIN`: CORS allowed origin (default: `*` in dev, should be specific in production)
- `GITHUB_TOKEN`: GitHub personal access token (for feedback feature)
- `GITHUB_OWNER`: GitHub username/org (default: `cmcmaster`)
- `GITHUB_REPO`: GitHub repository name (default: `rheum_biologics`)

### Frontend Environment Variables

**Required**:

- `VITE_API_BASE_URL`: Backend API base URL (e.g., `http://localhost:3001/api` or `https://api.example.com/api`)

## Deployment Architecture

### Recommended: Railway

**Services**:

1. **PostgreSQL Database** (Railway managed)

   - Automated backups
   - Automatic DATABASE_URL injection
2. **Backend Service** (Node.js)

   - Root directory: `backend/`
   - Build: `npm run build`
   - Start: `npm start`
   - Nixpacks or Docker build
   - Automatic scheduling (in-process)
3. **Frontend Service** (Static/Nginx)

   - Root directory: `frontend/`
   - Build: `npm run build`
   - Serve: Static files or nginx
   - Environment variable injection at build time

**Deployment Steps**:

1. Create Railway project
2. Add PostgreSQL database
3. Deploy backend service (point to `backend/` folder)
4. Deploy frontend service (point to `frontend/` folder)
5. Configure environment variables
6. Run database migrations
7. Trigger initial ingestion

### Alternative: Docker Compose

Both frontend and backend include Dockerfiles for container deployment.

**docker-compose.yml structure**:

- `db` service (PostgreSQL)
- `backend` service (Node.js API)
- `frontend` service (Nginx serving built static files)

### Traditional Hosting

**Requirements**:

- Node.js 18+ server
- PostgreSQL 14+ database
- Reverse proxy (nginx/Apache) for production
- Process manager (systemd/PM2) for backend
- Static file hosting for frontend

## Security Considerations

### API Security

- **Helmet.js**: Security headers enabled
- **CORS**: Configurable origin restrictions
- **Input Validation**: Zod schemas for all POST endpoints
- **SQL Injection Protection**: Parameterized queries (pg library)
- **Rate Limiting**: Not currently implemented (recommended addition)

### Database Security

- **Connection Pooling**: pg pool with configurable limits
- **Prepared Statements**: All queries use placeholders
- **No ORM**: Direct SQL with parameter binding

### Frontend Security

- **XSS Protection**: React's built-in escaping
- **HTTPS**: Enforced in production deployments
- **No Sensitive Data**: All data is public PBS information

### GitHub Integration

- **Token Security**: GITHUB_TOKEN stored as environment variable
- **Graceful Degradation**: If no token, feedback is logged (not emailed/issued)
- **Async Processing**: GitHub API calls don't block responses

## Performance Characteristics

### Backend

- **Database Indexes**: Optimized for common filter combinations
- **Batch Inserts**: Ingestion uses 500-row chunks
- **Connection Pooling**: Reusable database connections
- **Async Operations**: Non-blocking I/O throughout

### Frontend

- **React Query Caching**: Automatic cache management (5-minute default)
- **Debounced Filters**: Prevents excessive API calls
- **Pagination**: Limits result set size
- **Code Splitting**: Vite automatic splitting

### Expected Scale

- **Data Volume**: ~2,000-5,000 combinations per schedule
- **Concurrent Users**: Suitable for 100-1,000+ concurrent users
- **Response Times**: < 100ms for filtered searches (with proper indexes)

## Testing Strategy

### Backend Testing

- **Unit Tests**: Vitest for service functions
- **Integration Tests**: API endpoint tests
- **Data Validation**: Tests for ingestion transform logic

### Frontend Testing

- **Component Tests**: React Testing Library (not currently implemented)
- **E2E Tests**: Playwright/Cypress (not currently implemented)

### Manual Testing

- **Ingestion Test**: `npm run ingest:run` with known good schedule
- **API Tests**: cURL/Postman for endpoint validation
- **Browser Testing**: Cross-browser compatibility checks

## Monitoring & Observability

### Current State

- **Logging**: Console logs to stdout/stderr
- **Error Handling**: Centralized error handler middleware
- **Ingestion Logs**: Detailed logs during PBS data ingestion

### Recommended Additions

- **Application Monitoring**: Sentry, Datadog, New Relic
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Database Monitoring**: pgAdmin, Railway dashboard
- **Log Aggregation**: Papertrail, Loggly, CloudWatch

## Future Enhancements (Roadmap)

### Phase 1 (Completed)

✅ Core filtering and search
✅ Dynamic cascading filters
✅ Pagination
✅ Feedback system
✅ Dark mode
✅ Responsive design

### Phase 2 (In Progress)

- Australian Rheumatology Association (ARA) medication info links
- PBS official documentation links

### Phase 3 (Planned)

- PDF export of filtered results
- CSV export functionality
- Offline mode / PWA
- Print-friendly views

### Phase 4 (Planned)

- User authentication
- Saved searches / bookmarks
- Email alerts for PBS changes
- Comparison view (side-by-side drugs)

### Phase 5 (Future)

- Dosing calculators
- Medication interaction warnings
- Clinical guidelines integration
- Mobile app (React Native)

## Replication Guide

To replicate this application from scratch:

### 1. Set Up Infrastructure

**Database**:

- PostgreSQL 14+ instance
- Create database: `rheum_biologics`
- Run migrations: `001_init.sql`, `002_alter_column_lengths.sql`

**Hosting** (choose one):

- Railway (recommended): Create project, add PostgreSQL, deploy backend + frontend services
- Docker: Use docker-compose.yml with 3 services (db, backend, frontend)
- Traditional: Node.js server, nginx reverse proxy, systemd process manager

### 2. Backend Development

**Initialize Project**:

```bash
mkdir backend
cd backend
npm init -y
npm install express pg cors helmet dotenv node-cron papaparse unzipper zod @octokit/rest
npm install -D typescript @types/node @types/express @types/pg tsx
```

**Create Structure**:

- `src/db/pool.ts` - PostgreSQL connection pool
- `src/services/biologicsService.ts` - Database query logic
- `src/jobs/biologicsIngestion.ts` - PBS data ingestion
- `src/jobs/scheduler.ts` - Cron scheduler
- `src/routes/` - Express route definitions
- `src/controllers/` - Request handlers
- `src/middleware/` - Error handling, CORS
- `src/app.ts` - Express app setup
- `src/index.ts` - Server entry point

**Implement Core Logic**:

1. **Database Layer**: Connection pooling, parameterized queries
2. **Ingestion Job**:
   - Download PBS ZIP from `https://www.pbs.gov.au/downloads/{YYYY}/{MM}/...`
   - Parse 7 CSV files
   - Filter for target drugs
   - Match indications via keyword lookup
   - Build combination rows
   - Transactional database replace (DELETE + INSERT)
3. **API Endpoints**:
   - GET /api/combinations (with filtering, pagination)
   - GET /api/schedules
   - GET /api/{field} (dynamic lookups)
   - POST /api/feedback
4. **Scheduler**: node-cron with configurable schedule

**Environment**:

- Load from .env file
- Validate required variables

### 3. Frontend Development

**Initialize Project**:

```bash
mkdir frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @tanstack/react-query axios react-router-dom zustand
```

**Create Structure**:

- `src/api/` - Axios API client functions
- `src/store/searchStore.ts` - Zustand global state (filters, pagination)
- `src/hooks/` - Custom hooks (useLookupOptions, useCombinationSearch)
- `src/components/` - Reusable UI components
  - `filters/FiltersPanel.tsx` - Filter interface
  - `filters/MultiFilter.tsx` - Autocomplete multi-select
  - `filters/ScheduleSelect.tsx` - Schedule dropdown
  - `DarkModeToggle.tsx` - Theme switcher
  - `FeedbackDialog.tsx` - Feedback modal
- `src/features/combinations/` - Combinations feature module
  - `components/SearchResults.tsx` - Results grid
  - `hooks/useCombinationSearch.ts` - React Query hook
- `src/App.tsx` - Main app component with routing
- `src/main.tsx` - React entry point

**Implement Core Features**:

1. **Routing**: React Router with routes for home + 3 specialties
2. **State Management**:
   - Zustand for filters (specialty, drug, brand, indication, etc.)
   - React Query for server state (combinations, lookups)
3. **Filter Panel**:
   - Multi-select autocompletes for each field
   - Dynamic cascading (exclude current field from lookup query)
   - Reset button
4. **Results Display**:
   - Grid of medication cards
   - Pagination component
   - Loading and error states
5. **Theme**:
   - Material-UI ThemeProvider
   - Light/dark mode toggle
   - Responsive breakpoints

**Environment**:

- Vite environment variables (VITE_API_BASE_URL)
- Build-time injection

### 4. Data Seeding

**Initial Ingestion**:

1. Deploy backend with DATABASE_URL configured
2. Run migrations
3. Execute: `npm run ingest:run` (or trigger from API)
4. Verify data in database: `SELECT COUNT(*) FROM biologics_combinations;`

**Scheduled Updates**:

- Configure cron schedule (e.g., monthly)
- Enable scheduler: `BIOLOGICS_INGEST_ENABLED=true`
- Monitor logs for successful ingestions

### 5. Deployment

**Railway** (Recommended):

1. Push code to GitHub
2. Create Railway project
3. Add PostgreSQL database
4. Create backend service (root: `backend/`)
5. Create frontend service (root: `frontend/`)
6. Configure environment variables
7. Deploy both services
8. Run database migrations via Railway CLI

**Docker**:

1. Build images: `docker-compose build`
2. Start services: `docker-compose up -d`
3. Run migrations: `docker-compose exec backend npm run migrate`
4. Trigger ingestion: `docker-compose exec backend npm run ingest:run`

**Manual**:

1. Set up PostgreSQL database
2. Deploy backend: `npm run build && npm start` (with process manager)
3. Deploy frontend: `npm run build` → serve `dist/` with nginx
4. Configure nginx reverse proxy for backend API
5. Set up systemd service for backend auto-restart

### 6. Configuration

**Backend .env**:

```
DATABASE_URL=postgresql://user:pass@host:5432/rheum_biologics
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
BIOLOGICS_INGEST_ENABLED=true
BIOLOGICS_INGEST_CRON=0 4 1 * *
BIOLOGICS_INGEST_TZ=Australia/Sydney
BIOLOGICS_INGEST_LOOKBACK=6
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
```

**Frontend .env**:

```
VITE_API_BASE_URL=https://your-backend.com/api
```

### 7. Testing & Validation

1. **Test Ingestion**: Manually trigger and verify data
2. **Test API**: Use Postman/cURL to validate endpoints
3. **Test Filters**: Verify cascading filter behavior
4. **Test Pagination**: Ensure correct page navigation
5. **Test Feedback**: Submit test feedback, verify GitHub issue
6. **Cross-Browser**: Test on Chrome, Firefox, Safari
7. **Responsive**: Test on mobile, tablet, desktop breakpoints

### 8. Monitoring Setup

1. **Enable logging**: Configure log aggregation service
2. **Set up alerts**: Database errors, ingestion failures, API errors
3. **Monitor metrics**: Response times, error rates, database queries
4. **Schedule health checks**: Uptime monitoring for frontend + backend

## Key Design Decisions

### Why Single Table?

- All queries involve full row data (no joins needed)
- Simplifies schema and reduces query complexity
- Indexes provide sufficient performance
- PBS data is denormalized by nature

### Why No Authentication?

- All PBS data is public information
- Removes barrier to entry for medical professionals
- Simplifies deployment and maintenance
- Future: Add auth for bookmarking/saved searches

### Why Dynamic Cascading Filters?

- Prevents invalid filter combinations
- Improves UX by showing only achievable results
- Mirrors mental model: "What drugs are available for this indication?"

### Why Monthly Schedule Ingestion?

- PBS updates monthly (official release schedule)
- Full replace strategy ensures data consistency
- Historical schedules preserved for comparison

### Why GitHub Issues for Feedback?

- No additional infrastructure needed
- Automatic issue tracking and triage
- Transparent feedback handling
- Integrated with development workflow

### Why React Query?

- Automatic caching reduces API calls
- Handles loading/error states
- Deduplicates concurrent requests
- Simplifies complex async logic

### Why Zustand?

- Lightweight (no boilerplate)
- TypeScript-friendly
- Minimal learning curve
- Sufficient for simple filter state

## Common Customization Scenarios

### Adding a New Specialty

1. **Backend**: Add to `SPECIALTY_SCOPES` in `biologicsService.ts`
   - Define indication list
   - Define drug list
2. **Frontend**: Add route in `App.tsx`
   - Create specialty page component
   - Add to navigation tabs
3. **Ingestion**: Add target drugs to `TARGET_DRUGS` in `biologicsIngestion.ts`
4. **Ingestion**: Add indication matchers to `INDICATION_MATCHERS`

### Adding a New Filter Field

1. **Database**: Verify field exists in schema (add column if needed)
2. **Backend**:
   - Add to `LOOKUP_COLUMNS` in `biologicsService.ts`
   - Add to filter type definitions
3. **Frontend**:
   - Add to `FilterState` in `searchStore.ts`
   - Add MultiFilter component to `FiltersPanel.tsx`
   - Create lookup API route in `src/api/`

### Changing Ingestion Schedule

- Update `BIOLOGICS_INGEST_CRON` environment variable
- Format: Standard cron expression
- Examples:
  - `0 4 1 * *` = 4:00 AM on 1st of every month
  - `0 2 * * 0` = 2:00 AM every Sunday
  - `0 */6 * * *` = Every 6 hours

### Adding Export Functionality

1. **Backend**: Create export endpoint (e.g., GET /api/combinations/export)
   - Accept same filters as combinations endpoint
   - Generate CSV/PDF with filtered results
   - Stream response
2. **Frontend**: Add export button to results panel
   - Trigger download on click
   - Show progress indicator

### Integrating Analytics

1. **Add Analytics Library**: Google Analytics, Plausible, Fathom
2. **Track Events**:
   - Page views (specialty navigation)
   - Filter usage
   - Result clicks
   - Feedback submissions
3. **Privacy**: Ensure compliance with healthcare privacy regulations

## Glossary

- **PBS**: Pharmaceutical Benefits Scheme (Australian government program)
- **Biologic**: Medication derived from living organisms (vs. synthetic small molecules)
- **Authority**: PBS approval required before prescribing certain medications
- **Streamlined Authority**: Simplified approval process (electronic)
- **Telephone Authority**: Approval requires phone call to Services Australia
- **Treatment Phase**: Initial vs. continuing treatment phases with different criteria
- **Schedule**: Monthly PBS formulary update
- **Indication**: Medical condition for which a drug is approved
- **Formulation**: Specific dosage form and strength of a drug
- **PBS Code**: Unique identifier for a PBS item

## Support & Maintenance

### Regular Maintenance Tasks

1. **Monthly**: Verify ingestion ran successfully
2. **Quarterly**: Review feedback GitHub issues
3. **Semi-annually**: Update dependencies (security patches)
4. **Annually**: Review PBS API for schema changes

### Troubleshooting Common Issues

**Ingestion Fails**:

- Check PBS website accessibility
- Verify schedule exists for target month
- Increase lookback window
- Check database connection

**No Results on Specialty Page**:

- Verify ingestion ran successfully
- Check database has data: `SELECT COUNT(*) FROM biologics_combinations;`
- Verify specialty scope definitions match database

**Filters Not Updating**:

- Check network tab for API errors
- Verify React Query cache invalidation
- Clear browser cache

**GitHub Feedback Not Creating Issues**:

- Verify `GITHUB_TOKEN` is set and valid
- Check token has `repo` scope
- Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct

## Contact & Contributions

**Project Repository**: https://github.com/cmcmaster1/rheum_biologics
**Author**: Christopher McMaster
**Email**: admin@rheumai.com

---

*This summary document contains all information necessary to understand, replicate, and deploy the PBS Biologics Lookup application without access to the source code.*
