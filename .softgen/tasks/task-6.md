---
title: User Dashboard
status: todo
priority: medium
type: feature
tags: [dashboard, sessions]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 6
---

## Notes
Create user dashboard showing all fitting sessions with status badges, progress indicators, and action buttons.

## Checklist
- [ ] Create /dashboard route with session list
- [ ] Display session cards/table with date, status, progress
- [ ] Show status badges (In Progress yellow / Completed green)
- [ ] Add Resume button for in-progress sessions
- [ ] Add View Results + Download Report for completed
- [ ] Create Start New Fitting CTA button
- [ ] Show empty state for users with no sessions
- [ ] Add skeleton loaders during fetch

## Acceptance
- Dashboard lists all user sessions correctly
- Action buttons navigate to appropriate routes
- Empty state shows for new users