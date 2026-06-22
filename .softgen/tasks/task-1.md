---
title: Database Schema & Authentication Setup
status: in_progress
priority: urgent
type: feature
tags: [database, auth, supabase]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 1
---

## Notes
Set up complete Supabase backend with all 10 tables, RLS policies, and auth configuration for ProSwing golf fitting tool.

## Checklist
- [ ] Create users table with role field
- [ ] Create fitting_sessions table with status tracking
- [ ] Create player_profile table
- [ ] Create swing_profile table
- [ ] Create course_conditions table
- [ ] Create physical_profile table
- [ ] Create current_equipment table
- [ ] Create fitting_recommendations table
- [ ] Create fitting_rules static lookup table
- [ ] Create products catalog table
- [ ] Enable RLS on all tables with user_id policies
- [ ] Configure Supabase Auth for email/password + Google OAuth
- [ ] Generate TypeScript types from schema
- [ ] Create auth trigger to insert users table row on signup

## Acceptance
- All tables exist in Supabase with proper foreign keys and constraints
- RLS policies prevent cross-user data access
- User registration creates both auth.users and public.users rows