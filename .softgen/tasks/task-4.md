---
title: Recommendation Engine Edge Function
status: todo
priority: high
type: feature
tags: [edge-function, logic, backend]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 4
---

## Notes
Create generate_recommendations Edge Function with deterministic IF/THEN logic for club length, lie angle, grip size, shaft flex/weight, club type, and advisory notes.

## Checklist
- [ ] Create Edge Function file structure
- [ ] Implement club length logic (wrist-to-floor ranges)
- [ ] Implement lie angle logic (height-based)
- [ ] Implement grip size logic (hand size mapping)
- [ ] Implement shaft flex point-based scoring system
- [ ] Implement shaft weight logic
- [ ] Implement club type recommendation logic
- [ ] Build advisory notes conditional text builder
- [ ] Query and match products from catalog
- [ ] Write recommendations row to database
- [ ] Deploy function to Supabase

## Acceptance
- Function correctly calculates all 6 recommendation fields
- Advisory notes include all applicable warnings
- Product matching returns up to 3 relevant items