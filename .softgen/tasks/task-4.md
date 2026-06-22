---
title: Recommendation Engine Edge Function
status: done
priority: high
type: feature
tags: [api, logic, recommendations]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 4
---

## Notes
Create generate_recommendations Edge Function with deterministic IF/THEN logic for club length, lie angle, grip size, shaft flex/weight, club type, and advisory notes.

## Checklist
- [x] Create /api/generate-recommendations endpoint
- [x] Implement club length logic (wrist-to-floor based)
- [x] Implement lie angle logic (height based)
- [x] Implement grip size logic (hand size mapping)
- [x] Implement shaft flex logic (point-based scoring)
- [x] Implement shaft weight logic (strength + experience)
- [x] Implement club type logic (experience + handicap)
- [x] Build advisory notes logic with all conditions
- [x] Write recommendation row to fitting_recommendations table
- [x] Product matching query (up to 3 items by flex/grip/tags)

## Acceptance
- Function correctly calculates all 6 recommendation fields
- Advisory notes include all applicable warnings
- Product matching returns up to 3 relevant items