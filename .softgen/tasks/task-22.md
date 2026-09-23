---
title: Update Validation Schemas for New Wizard
status: done
priority: high
type: chore
tags: [validation, zod, types]
created_by: agent
created_at: 2026-09-22T21:13:00Z
position: 4
---

## Notes
Create comprehensive Zod validation schemas for all 8 wizard sections matching the new database schema fields.

## Checklist
- [x] Create playerProfileSchema (Section 1)
- [x] Create golfExperienceSchema (Section 2)
- [x] Create currentBagSchema (Section 3)
- [x] Create swingCharacteristicsSchema (Section 4)
- [x] Create longGameSchema (Section 5)
- [x] Create ironWedgeFittingSchema (Section 6)
- [x] Create putterFittingSchema (Section 7)
- [x] Create goalsPrioritiesSchema (Section 8)
- [x] Add unit conversion utilities (inches ↔ cm, lbs ↔ kg)
- [x] Export TypeScript types for all schemas
- [x] Ensure validation messages are user-friendly
- [x] Handle optional fields correctly

## Acceptance
- All schemas validate form data correctly
- Error messages are user-friendly
- Unit conversions work correctly
- Forms submit successfully with valid data