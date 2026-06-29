---
title: Data Import System
status: in_progress
---

## Notes
Create plug-and-play data import system supporting CSV drag-drop, launch monitor APIs, and manual entry. Goal: Users can import swing data in under 2 minutes.

**Integration Methods:**
1. CSV Import (universal fallback) - Priority 1
2. Manual Entry Form (immediate value) - Priority 1  
3. Golf Daddy API (Premium Plus feature) - Priority 2
4. Generic JSON Import (TrackMan/FlightScope/SkyTrak) - Priority 3

## Checklist
### CSV Import (Universal)
- [x] Create CSV template with standardized columns
- [x] Build drag-and-drop file upload component (react-dropzone)
- [x] Implement CSV parser with PapaParse
- [x] Auto-detect and map flexible column headers
- [x] Preview first 5 rows before import
- [x] Validate data ranges (ball speed 80-200mph, etc.)
- [x] Bulk insert validated data to database

### Manual Entry Form
- [x] Create quick single-shot entry form
- [x] Add club selection dropdown (all 14 clubs)
- [x] Essential metrics: club speed, ball speed, carry distance
- [x] Optional expandable section for advanced metrics
- [x] Range session batch mode (multiple shots to same session)
- [x] Session summary before save

### Launch Monitor Integrations
- [ ] Research Golf Daddy API documentation
- [ ] Create OAuth/API key setup page
- [ ] Build daily auto-sync function
- [ ] Create generic JSON parser for common formats
- [ ] Test with sample data from 3+ devices

## Acceptance
- CSV import works with 5 different file formats tested
- Manual entry form takes <60 seconds for single shot
- Validation catches all out-of-range values
- Import preview accurately shows first 5 rows
