---
title: Gamefication & Goals
status: todo
---

## Notes
Add achievement badge system and goal-setting to drive user engagement. Auto-award badges via database triggers. Goals with progress tracking and deadline reminders.

**Badge Categories:**
- Milestone badges (session count)
- Performance badges (speed/distance)
- Consistency badges (variance)
- Dedication badges (frequency)

## Checklist
### Achievement System
- [x] Design 10 badge types with 3-4 levels each (bronze/silver/gold/platinum)
- [x] Create badge images/icons (SVG or PNG)
- [x] Build badge display shelf on dashboard
- [x] Implement unlock progress bars
- [x] Create pop-up notification component for new badges earned
- [x] Update `check_badge_eligibility()` trigger with all badge logic

### Badge Types to Implement
- [x] First Steps (first session logged)
- [x] Speed Demon (club speed: 110/115/120/125 mph)
- [x] Consistency King (80/85/90/95 consistency score)
- [x] Distance Master (250/275/300/325 yards)
- [x] Dedicated (10/50/100/500 sessions)
- [x] Optimizer (track all 14 clubs in one session)
- [x] Launch Perfect (hit optimal launch window 5/10/20 times)

### Goal Setting System
- [x] Create goal creation wizard (metric, target, deadline)
- [x] Build goal tracking widget with progress bar
- [x] Add "days remaining" countdown
- [x] Implement pace indicator (on track / behind / ahead)
- [x] Suggest practice frequency based on goal
- [x] Email reminders at 50%, 75%, 90% to deadline

### Insights & Recommendations (Premium+)
- [x] Build AI insight generator (template-based for MVP)
- [x] 10 insight templates based on data patterns
- [x] Practice drill recommendations
- [x] Links to instructional content (YouTube)
- [x] Weekly insight email digest

## Acceptance
- Badges auto-award within 5 seconds of qualifying action
- Goal progress updates in real-time after session import
- Pace indicator accurately predicts goal completion
- Insights appear for 80%+ of users with 10+ sessions
