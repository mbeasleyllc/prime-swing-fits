---
title: Implement Full-Bag Recommendation Engine
status: done
priority: urgent
type: feature
tags: [api, recommendation, algorithm]
created_by: agent
created_at: 2026-09-23T00:05:00Z
position: 1
---

## Notes
Rewrite /api/generate-recommendations.ts to implement comprehensive rules-based decision tree producing full-bag specs (driver, woods, hybrids, irons, wedges, putter) based on 8-section wizard data.

## Checklist
- [x] Create modular calculation functions for each spec category
- [x] Implement club length calculation (height + wrist-to-floor + adjustments)
- [x] Implement lie angle calculation (wrist-to-floor + miss-pattern fine-tune)
- [x] Implement shaft flex calculation (swing speed + tempo modifier)
- [x] Implement shaft weight calculation (dual path: speed + carry distance)
- [x] Implement driver head selection (miss pattern + priorities)
- [x] Implement fairway wood/hybrid gapping (distance gap analysis)
- [x] Implement wedge gapping (PW loft + swing type + conditions)
- [x] Implement putter fitting (stroke type + miss + eye position)
- [x] Implement player category classification (goals ranking)
- [x] Store results in fitting_sessions.recommendations as JSON
- [x] Keep existing golf ball matching logic
- [x] Add plain-English explanations for each recommendation

## Acceptance
- API generates complete full-bag recommendations from wizard data
- All calculation functions are modular and unit-testable
- Results save correctly to fitting_sessions.recommendations
- Golf ball matching still works alongside new recommendations