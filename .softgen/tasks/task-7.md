---
title: Admin Panel
status: todo
priority: low
type: feature
tags: [admin, management]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 7
---

## Notes
Build admin panel with dashboard overview, session management, rules CRUD, and products CRUD. Role-gated to users.role = 'admin'.

## Checklist
- [ ] Create /admin route with overview stats
- [ ] Show total fittings, users, common recommendations
- [ ] Create /admin/sessions with filterable data table
- [ ] Add flag for review functionality
- [ ] Create CSV export button
- [ ] Create /admin/rules CRUD interface
- [ ] Create /admin/products CRUD interface
- [ ] Add confirmation dialogs for deletions
- [ ] Implement admin role check middleware

## Acceptance
- Admin routes redirect non-admin users to /dashboard
- All CRUD operations work correctly
- Filters and exports function properly