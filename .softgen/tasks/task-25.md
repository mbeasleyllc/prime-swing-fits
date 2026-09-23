---
title: Admin Rules Management UI
status: done
priority: high
type: feature
tags: [admin, rules, ui]
created_by: agent
created_at: 2026-09-23T00:21:00Z
position: 2
---

## Notes
Extend /admin/rules so admins can view and edit per-category rule tables as structured rows in fitting_rules table rather than hardcoded logic.

## Checklist
- [x] Create tabbed UI for 7 rule categories
- [x] Display rules in editable table format
- [x] Add CRUD operations (Create, Read, Update, Delete)
- [x] Add active/inactive toggle per rule
- [x] Implement rule form with validation
- [x] Add priority field to control rule application order
- [x] Log all rule changes to user_activity_logs
- [x] Add confirmation dialogs for destructive actions
- [x] Display helpful guidance for rule creation

## Acceptance
- Admins can view all fitting rules by category
- Admins can add, edit, delete, and toggle rules
- Validation prevents invalid rule configurations
- All rule changes logged to user_activity_logs