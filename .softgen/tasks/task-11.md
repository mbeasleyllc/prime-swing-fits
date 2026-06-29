---
title: Swing DNA - Phase 1: Database Schema & Core Infrastructure
status: in_progress
priority: high
type: feature
tags: [analytics, database, schema]
created_by: agent
created_at: 2026-06-29T20:07:26Z
position: 11
---

## Notes
Build the database foundation for Swing DNA Analytics & Progress Tracking. This phase creates all necessary tables, RLS policies, and calculation functions for tracking swing metrics over time.

**Revenue Model:**
- Core Tier ($59): $12.99/month add-on
- Premium Tier ($99): Included
- Premium Plus ($220): Included with unlimited history

**Technical Requirements:**
- Supabase PostgreSQL
- Row Level Security (RLS)
- Database functions for calculations
- TimescaleDB extension (optional, for time-series optimization)

## Checklist

### Database Tables
- [x] Create `swing_sessions` table (user sessions with device tracking)
- [x] Create `swing_metrics` table (individual shot data per session)
- [x] Create `swing_goals` table (user-defined improvement goals)
- [x] Create `achievement_badges` table (gamification badges earned)
- [x] Create `user_swing_subscriptions` table (tier-based access control)

### Row Level Security
- [x] Enable RLS on all 5 swing tables
- [x] Create user-owned data policies (users see only their data)
- [x] Create admin read-all policy for support access

### Database Functions
- [x] Create `calculate_consistency_score()` function (0-100 score based on variance)
- [x] Create `get_improvement_trend()` function (linear regression analysis)
- [x] Create `check_badge_eligibility()` trigger function (auto-award achievements)

### Migration File
- [x] Generate Supabase migration with all schema changes
- [x] Test migration on development database
- [x] Verify all tables, policies, and functions work correctly

## Acceptance
- All 5 tables exist in Supabase with proper columns and constraints
- RLS policies prevent unauthorized data access
- Database functions return accurate calculations
- Migration file runs without errors