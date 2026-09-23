---
title: Restructure Wizard Step Files (Sections 1-4)
status: done
priority: urgent
type: feature
tags: [wizard, frontend, ux]
created_by: agent
created_at: 2026-09-22T21:11:00Z
position: 2
---

## Notes
Implement Sections 1-4 of the restructured 8-section wizard with short sub-screens, conditional logic, auto-save, help tooltips, and unit toggle.

## Checklist
- [x] Section 1 (Player Profile): name, age, handedness, height with ft/in + cm toggle, wrist-to-floor, glove size, optional hand measurements, physical limitations
- [x] Section 2 (Golf Experience): handicap/score, years playing, playing/practice frequency
- [x] Section 3 (Current Bag): multi-select clubs carried, make/model/loft/flex fields (optional), current 7-iron carry, current putter info
- [x] Section 4 (Swing Characteristics): swing speed, tempo, transition, swing type, athletic background, ball flight, trajectory, miss patterns
- [x] Add inline help tooltips for all technical terms
- [x] Implement auto-save on every sub-step
- [x] Add imperial/metric unit toggle
- [x] Create reusable wizard components (MeasurementTooltip, UnitToggle)
- [x] Ensure no single screen exceeds 5 fields
- [x] Progress indicator shows "Section X of 8"

## Acceptance
- All 4 sections save data correctly to fitting_sessions
- Help tooltips explain technical terms clearly
- Unit toggle converts and displays measurements correctly
- Auto-save prevents data loss on page exit