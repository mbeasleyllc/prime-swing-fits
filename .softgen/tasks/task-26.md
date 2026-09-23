---
title: Validation Schemas & Test Fixtures
status: todo
priority: high
type: feature
tags: [validation, testing, fixtures]
created_by: agent
created_at: 2026-09-23T00:22:00Z
position: 3
---

## Notes
Update all Zod schemas to match new fields, create 4 test fixture profiles, run through recommendation engine, verify consistency, and add automated tests.

## Checklist
- [ ] Update Zod schemas for all 8 wizard sections
- [ ] Cross-reference with fitting_sessions field list from Prompt 1
- [ ] Create Game Improvement Player fixture (18 HC, slow swing, slice)
- [ ] Create Distance Player fixture (12 HC, moderate-fast swing)
- [ ] Create Player's Iron User fixture (5 HC, consistent striker)
- [ ] Create Tour-Oriented Player fixture (plus HC, fast aggressive)
- [ ] Run all fixtures through recommendation engine
- [ ] Verify output consistency per profile
- [ ] Add automated test cases (Jest/Vitest)

## Acceptance
- All Zod schemas validate correctly
- 4 test fixtures produce consistent recommendations
- Automated tests pass
- No contradictions in recommendations per player type