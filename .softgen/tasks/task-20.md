---
title: Restructure Wizard Step Files (Sections 1-4)
status: todo
priority: urgent
type: feature
tags: [wizard, ui, forms]
created_by: agent
created_at: 2026-09-22T21:10:00Z
position: 2
---

## Notes
Replace generic 6-step wizard with 8-section branching flow. Each section broken into short sub-screens (3-5 questions max). Add tooltips for technical terms, unit toggle, auto-save.

## Checklist
- [ ] Section 1 - Player Profile: name, age, handedness, height (ft/in + cm toggle), wrist-to-floor (with tooltip/diagram), glove size, hand length/finger (advanced toggle), injuries (yes/no + text)
- [ ] Section 2 - Golf Experience: handicap/score, years playing, play frequency, practice frequency
- [ ] Section 3 - Current Bag: multi-select carried clubs (driver, woods, hybrids, irons, wedges, putter) with make/model/loft/flex, 7-iron carry, putter length/model
- [ ] Section 4 - Swing Characteristics: swing speed, tempo, transition, swing type, athletic background, ball flight, trajectory, miss, miss percentage/accuracy
- [ ] Add measurement tooltips component with plain-English explanations
- [ ] Add unit toggle component (imperial/metric)
- [ ] Implement auto-save on each sub-step
- [ ] Update progress indicator to show "Section X of 8"

## Acceptance
- Sections 1-4 functional with validation
- All tooltips working with clear explanations
- Unit toggle converts and displays measurements correctly
- Auto-save prevents data loss on page exit