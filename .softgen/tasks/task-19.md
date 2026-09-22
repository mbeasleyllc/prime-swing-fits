---
title: Extend Database Schema for Full-Bag Fitting
status: in_progress
priority: urgent
type: feature
tags: [database, schema, migration]
created_by: agent
created_at: 2026-09-22T21:10:00Z
position: 1
---

## Notes
Extend fitting_sessions table and related tables to support comprehensive full-bag fitting questionnaire with 8 sections covering driver, fairway woods, hybrids, irons, wedges, and putter specifications.

## Checklist
- [x] Create migration adding new fields to fitting_sessions
- [ ] Update current_step constraint to support 8 sections
- [ ] Add unit_preference field (imperial/metric)
- [ ] Add driver-specific fields (loft, flex, shaft weight, length, carry, ball flight, miss, preferences)
- [ ] Add fairway wood/hybrid fields (carries, trouble clubs, use cases, distance gaps)
- [ ] Add iron fields (length, choke frequency, flight, miss, launch monitor data)
- [ ] Add wedge fields (challenges, miss, PW loft)
- [ ] Add putter fields (eye position, posture, stroke type, preferences)
- [ ] Add goals ranking structure (9 priority dimensions)
- [ ] Regenerate Supabase types
- [ ] Verify RLS policies cover new fields

## Acceptance
- Database schema includes all new fields for 8-section wizard
- Types are regenerated and build passes
- Existing data is preserved (migration is additive only)