---
title: Dynamic Step Routing Based on Selected Categories
status: todo
priority: urgent
type: feature
tags: [fitting, routing, phase3]
created_by: agent
created_at: 2026-11-12T16:00:00Z
position: 31
---

## Notes
Implement conditional step routing so users only see questionnaires for categories they selected in Step 0. This is critical for the category-based fitting experience.

## Checklist
- [ ] Update Step 2 to read `selected_categories` from session and route to first selected category questionnaire
- [ ] Create routing logic that maps category names to step URLs (driver → 3-driver, irons → 3-irons, etc.)
- [ ] Skip category steps that weren't selected
- [ ] Ensure back/next navigation respects selected categories
- [ ] Update ProgressBar to show only relevant steps

## Acceptance
- If user selects only "driver" and "putter", they see: Step 0 → 1 → 2 → 3-driver → 3-putter → results
- All unselected category questionnaires are skipped
- Progress bar accurately reflects actual workflow length