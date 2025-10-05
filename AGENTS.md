# Rheumatology Biologics App Development Plan

## Project Overview
This project involves creating a modern, server-hosted web application for rheumatologists to look up PBS (Pharmaceutical Benefits Scheme) biologics data. The current Gradio-based app will be replaced with a clean, efficient JavaScript-based solution.

## Current System Analysis
The existing system consists of:
1. **Data Pipeline** (`data_old.py`): Python script that pulls PBS data from Hugging Face datasets monthly
2. **Frontend App** (`old_app.py`): Gradio-based interface with limitations and workarounds

### Key Issues with Current System
- Gradio limitations require complex workarounds for filtering and UI interactions
- Data is loaded entirely into memory from Hugging Face datasets
- No persistent database storage
- Limited customization and user experience
- Runs locally rather than being server-hosted

## New Architecture Plan

### 1. Backend Infrastructure
**Technology Stack:**
- **Database**: PostgreSQL for persistent storage of biologics data
- **API Server**: Node.js with Express.js or Python with FastAPI
- **Data Pipeline**: Automated monthly data ingestion service
- **Hosting**: Cloud server (AWS, DigitalOcean, or similar)

**Database Schema:**
```sql
-- Main biologics combinations table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_biologics_schedule ON biologics_combinations(schedule_year, schedule_month);
CREATE INDEX idx_biologics_drug ON biologics_combinations(drug);
CREATE INDEX idx_biologics_indication ON biologics_combinations(indication);
CREATE INDEX idx_biologics_pbs_code ON biologics_combinations(pbs_code);
```

### 2. Data Pipeline Service
**Monthly Data Ingestion:**
- Automated service that runs monthly (1st of each month)
- Pulls latest PBS data from Hugging Face datasets
- Processes and validates data
- Updates database with new schedule data
- Maintains historical data for reference
- Sends notifications on successful/failed updates

**Key Features:**
- Data validation and error handling
- Incremental updates (only new schedules)
- Rollback capability if data issues detected
- Comprehensive logging and monitoring

### 3. Frontend Application
**Technology Stack:**
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI (MUI) or Tailwind CSS with Headless UI
- **State Management**: Redux Toolkit or Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Build Tool**: Vite
- **Deployment**: Static hosting (Vercel, Netlify, or CDN)

**Key Features:**
- **Responsive Design**: Mobile-first approach for tablet/phone use in clinical settings
- **Advanced Filtering**: Multi-criteria search with real-time filtering
- **Schedule Selection**: Dropdown to select specific PBS schedule periods
- **Export Functionality**: PDF/CSV export of search results
- **Bookmarking**: Save frequently used combinations
- **Offline Support**: Service worker for basic offline functionality
- **Accessibility**: WCAG 2.1 AA compliance for clinical environments

### 4. API Design
**RESTful Endpoints:**
```
GET /api/schedules - Get available schedule periods
GET /api/combinations - Search biologics combinations
GET /api/drugs - Get available drugs for current schedule
GET /api/indications - Get available indications
GET /api/brands - Get available brands
GET /api/formulations - Get available formulations
GET /api/treatment-phases - Get available treatment phases
GET /api/hospital-types - Get available hospital types
```

**Search Parameters:**
- `schedule_year` and `schedule_month` for specific schedule
- `drug`, `brand`, `formulation`, `indication`, `treatment_phase`, `hospital_type` for filtering
- `limit` and `offset` for pagination
- `sort` for result ordering

### 5. User Experience Improvements
**Enhanced Search Interface:**
- Multi-select dropdowns with search functionality
- Real-time result filtering as user types
- Clear visual hierarchy and typography
- Loading states and error handling
- Keyboard navigation support

**Results Display:**
- Card-based layout for better readability
- Expandable details for each combination
- Direct links to PBS website for each item
- Copy-to-clipboard functionality for PBS codes
- Print-friendly formatting

**Performance Optimizations:**
- Lazy loading of dropdown options
- Debounced search inputs
- Efficient database queries with proper indexing
- CDN for static assets
- Caching strategies for frequently accessed data

### 6. Development Phases

**Phase 1: Backend Foundation**
- Set up database schema and migrations
- Create API server with basic endpoints
- Implement data pipeline service
- Set up automated testing

**Phase 2: Frontend Core**
- Create React application with routing
- Implement search interface
- Connect to API endpoints
- Basic responsive design

**Phase 3: Enhanced Features**
- Advanced filtering and search
- Schedule selection functionality
- Export capabilities
- Performance optimizations

**Phase 4: Production Deployment**
- Set up production database
- Deploy API server
- Deploy frontend application
- Set up monitoring and logging
- Configure automated data pipeline

**Phase 5: Advanced Features**
- User authentication (if needed)
- Bookmarking functionality
- Offline support
- Mobile app (if required)

### 7. Technical Considerations

**Security:**
- Input validation and sanitization
- Rate limiting for API endpoints
- HTTPS enforcement
- CORS configuration
- SQL injection prevention

**Performance:**
- Database query optimization
- API response caching
- Frontend bundle optimization
- Image optimization
- CDN implementation

**Monitoring:**
- Application performance monitoring
- Error tracking and logging
- Database performance metrics
- User analytics (privacy-compliant)
- Uptime monitoring

**Backup and Recovery:**
- Automated database backups
- Data retention policies
- Disaster recovery procedures
- Version control for all code

## Migration Strategy
1. **Parallel Development**: Build new system alongside existing Gradio app
2. **Data Migration**: Migrate existing Hugging Face dataset data to new database
3. **Testing**: Comprehensive testing with real rheumatologist users
4. **Gradual Rollout**: Deploy to staging environment first
5. **User Training**: Provide documentation and training materials
6. **Sunset Old System**: Retire Gradio app after successful migration

## Success Metrics
- **Performance**: Page load times < 2 seconds
- **Usability**: User task completion rate > 95%
- **Reliability**: 99.9% uptime
- **User Satisfaction**: Positive feedback from rheumatologist users
- **Data Accuracy**: 100% accuracy compared to PBS source data