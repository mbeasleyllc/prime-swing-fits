---
title: User Dashboard
status: done
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
- [x] Create /dashboard page for authenticated users
- [x] Display welcome message with user name
- [x] Show "Start New Fitting" CTA button
- [x] List all user's fitting sessions in cards
- [x] Show status badges (In Progress / Completed)
- [x] Display step progress for in-progress sessions
- [x] Add Resume button for in-progress sessions
- [x] Add View Results + Download Report buttons for completed sessions
- [x] Show empty state for new users with CTA
- [x] Skeleton loaders during fetch

## Acceptance
- Dashboard lists all user sessions correctly
- Action buttons navigate to appropriate routes
- Empty state shows for new users