---
title: Data Import System
status: todo
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
- [ ] Create CSV template with standardized columns
- [ ] Build drag-and-drop file upload component (react-dropzone)
- [ ] Implement CSV parser with PapaParse
- [ ] Auto-detect and map flexible column headers
- [ ] Preview first 5 rows before import
- [ ] Validate data ranges (ball speed 80-200mph, etc.)
- [ ] Bulk insert validated data to database

### Manual Entry Form
- [ ] Create quick single-shot entry form
- [ ] Add club selection dropdown (all 14 clubs)
- [ ] Essential metrics: club speed, ball speed, carry distance
- [ ] Optional expandable section for advanced metrics
- [ ] Range session batch mode (multiple shots to same session)
- [ ] Session summary before save

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
