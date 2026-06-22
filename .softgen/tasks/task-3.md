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
- [ ] Create WizardLayout with step progress bar (1-6)
- [ ] Step 1: Player Profile form (name, age, hand, experience, handicap, goal)
- [ ] Step 2: Swing Profile form (shot shape, miss, flight, tempo, strength)
- [ ] Step 3: Course Conditions form (turf, weather, ball type)
- [ ] Step 4: Physical Measurements with YouTube embed toggles
- [ ] Step 5: Current Equipment with star rating component
- [ ] Step 6: Review & Submit with editable summary
- [ ] Implement Next/Back navigation with validation gating
- [ ] Auto-save on Next button to corresponding table
- [ ] Resume in-progress session detection
- [ ] Skeleton loaders during saves

## Acceptance
- All 6 steps save data to correct tables
- User cannot proceed without filling required fields
- Resume flow works for incomplete sessions