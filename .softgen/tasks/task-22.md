---
title: Update Validation Schemas for New Wizard
status: todo
priority: high
type: chore
tags: [validation, zod]
created_by: agent
created_at: 2026-09-22T21:10:00Z
position: 4
---

## Notes
Create Zod validation schemas for each of the 8 wizard sections matching the new database fields. Ensure proper type safety and error messages.

## Checklist
- [ ] Create validation schema for Section 1 (Player Profile)
- [ ] Create validation schema for Section 2 (Golf Experience)
- [ ] Create validation schema for Section 3 (Current Bag)
- [ ] Create validation schema for Section 4 (Swing Characteristics)
- [ ] Create validation schema for Section 5 (Long Game)
- [ ] Create validation schema for Section 6 (Iron & Wedge)
- [ ] Create validation schema for Section 7 (Putter)
- [ ] Create validation schema for Section 8 (Goals)
- [ ] Add unit conversion utilities for height and measurements
- [ ] Test all validations with edge cases

## Acceptance
- All 8 sections have proper Zod schemas
- Validation error messages are user-friendly
- Unit conversions work correctly
- Forms submit successfully with valid data