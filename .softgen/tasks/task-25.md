---
title: Admin Rules Management UI
status: todo
priority: high
type: feature
tags: [admin, rules, audit-log]
created_by: agent
created_at: 2026-09-23T00:21:00Z
position: 2
---

## Notes
Extend /admin/rules to allow editing per-category rule tables as structured rows in fitting_rules table with validation and audit logging.

## Checklist
- [ ] Create editable UI for length adjustment rules
- [ ] Create editable UI for lie angle rules
- [ ] Create editable UI for shaft flex rules
- [ ] Create editable UI for shaft weight rules
- [ ] Create editable UI for hybrid/wood gap rules
- [ ] Create editable UI for wedge gapping/bounce rules
- [ ] Create editable UI for putter toe-hang/stroke mapping rules
- [ ] Add validation for numeric ranges (no invalid overlaps)
- [ ] Add audit log entry (user_activity_logs) on rule changes
- [ ] Test rule updates flow through recommendation engine

## Acceptance
- Admins can edit all rule categories through UI
- Changes save to fitting_rules table
- Validation prevents invalid rule configurations
- All rule changes logged to user_activity_logs