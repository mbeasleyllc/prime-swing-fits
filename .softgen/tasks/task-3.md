---
title: 6-Step Fitting Wizard
status: todo
priority: high
type: feature
tags: [wizard, forms, ux]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 3
---

## Notes
Build complete 6-step guided wizard with progress bar, validation, step navigation, and auto-save to Supabase.

## Checklist
- [x] Create WizardLayout with step progress bar (1-6)
- [x] Step 1: Player Profile form (name, age, hand, experience, handicap, goal)
- [x] Step 2: Swing Profile form (shot shape, miss, flight, tempo, strength)
- [x] Step 3: Course Conditions form (turf, weather, ball type)
- [x] Step 4: Physical Measurements with YouTube embed toggles
- [x] Step 5: Current Equipment with star rating component
- [x] Step 6: Review & Submit with editable summary
- [x] Implement Next/Back navigation with validation gating
- [x] Auto-save on Next button to corresponding table
- [x] Resume in-progress session detection
- [x] Skeleton loaders during saves

## Acceptance
- All 6 steps save data to correct tables
- User cannot proceed without filling required fields
- Resume flow works for incomplete sessions