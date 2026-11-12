---
title: Dynamic Step Routing Based on Selected Categories
status: in_progress
priority: urgent
type: feature
tags: [fitting, routing, phase3]
created_by: agent
created_at: 2026-11-12T16:00:00Z
position: 31
---

## Checklist
- [ ] Create routing utility function that maps categories to step numbers
- [ ] Update Step 1, 2 next buttons to route to first selected category
- [ ] Update category step files to route to next selected category (not hardcoded step 4)
- [ ] Handle "back" navigation across dynamic steps
- [ ] Update ProgressBar to show accurate step count based on selected categories
- [ ] Test routing with various category combinations

## Notes
Critical blocking infrastructure. Without this, category-specific questionnaires won't show.
Must check selected_categories array and route accordingly.

## Implementation Strategy
1. Create `/lib/fittingStepRouter.ts` with routing logic
2. Each category step uses the router to determine next step
3. Universal steps (0, 1, 2) route to first category step
4. Last category step routes to universal closing steps