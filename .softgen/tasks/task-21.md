---
title: Restructure Wizard Step Files (Sections 5-8)
status: done
priority: urgent
type: feature
tags: [wizard, frontend, ux]
created_by: agent
created_at: 2026-09-22T21:12:00Z
position: 3
---

## Notes
Implement Sections 5-8 of the restructured wizard covering long game, irons/wedges, putter fitting, and goals prioritization.

## Checklist
- [x] Section 5 (Long Game): carry distances (driver, woods, irons for gap calc), trouble clubs, miss types, hybrid use cases, driver preferences
- [x] Section 6 (Iron & Wedge): 7-iron carry/flight, choke-down frequency, iron length, miss patterns with tooltips, wedge pain points, PW loft
- [x] Section 7 (Putter): eye position, posture, arm hang, sole flush check, stroke type, face rotation, miss patterns, head style/alignment/feel/forgiveness preferences, green speed, forward press, grip size, hand activity, current length/satisfaction
- [x] Section 8 (Goals): slider-based ranking UI (1-5 scale) for all 9 priority dimensions, NOT checkboxes
- [x] Conditional logic: skip clubs not carried, collapse optional fields behind toggles
- [x] All technical terms (toe/heel/thin/fat/bounce/face rotation) have plain-English tooltips
- [x] Multi-select UI for arrays (trouble clubs, wedge pain points)
- [x] Help text explains why each measurement matters

## Acceptance
- All sections save data correctly to fitting_sessions
- Conditional fields hide/show based on user selections
- Goals ranking UI is intuitive (drag or slider, not checkboxes)
- All technical terms have helpful tooltips