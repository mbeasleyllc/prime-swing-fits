---
title: Category-Specific Questionnaires (Fairway Woods, Hybrids, Irons)
status: in_progress
priority: high
type: feature
tags: [fitting, phase3]
created_by: agent
created_at: 2026-11-12T16:00:00Z
position: 29
---

## Notes
Create 3 additional category-specific questionnaire files for clubs that require detailed fitting data.

## Checklist
- [ ] Create src/pages/fitting/[id]/step/3-fairway-woods.tsx with fields for current woods, usage, goals, yardage gaps, shot shape, airborne struggles, head size preferences
- [ ] Create src/pages/fitting/[id]/step/3-hybrids.tsx with fields for current hybrids/irons, distance gaps, primary usage, ball flight tendencies
- [ ] Create src/pages/fitting/[id]/step/3-irons.tsx with fields for current specs, custom fitting status, ball flight, miss patterns, shot shape, swing characteristics, 7-iron distance

## Acceptance
- All 3 category questionnaires follow same pattern as 3-driver.tsx
- Forms save data to fitting_sessions with proper validation
- Navigation flows properly between steps