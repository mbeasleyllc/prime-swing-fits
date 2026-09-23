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
Extend /admin/rules so admins can view and edit per-category rule tables as structured rows in fitting_rules table (using actual schema: rule_name, input_field, input_value, output_field, output_value).

## Checklist
- [x] Create tabbed UI for 7 rule categories
- [x] Display rules in editable table format
- [x] Add CRUD operations (Create, Read, Update, Delete)
- [x] Implement rule form matching actual schema
- [x] Add priority field to control rule application order
- [x] Add confirmation dialogs for destructive actions
- [x] Display helpful guidance for rule creation

## Acceptance
- Admins can view all fitting rules by category
- Admins can add, edit, and delete rules
- Form uses correct database field names (rule_name, input_field, input_value, output_field, output_value)
- Rules filtered by category prefix in rule_name