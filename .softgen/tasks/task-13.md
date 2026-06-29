---
title: Swing DNA - Phase 3: Analytics Dashboard
status: todo
priority: high
type: feature
tags: [analytics, dashboard, charts]
created_by: agent
created_at: 2026-06-29T20:14:00Z
position: 13
---

## Notes
Build comprehensive analytics dashboard at `/swing-analytics` with session history, KPI cards, Swing DNA radar chart, and progress charts. Mobile-responsive with Chart.js visualization.

**Dashboard Sections:**
1. Session history table (filterable)
2. KPI cards (4 key metrics)
3. Swing DNA profile (radar chart)
4. Progress charts (4 chart types)
5. Detailed session drill-down

## Checklist

### Main Dashboard Page
- [ ] Create `/swing-analytics` page with protected route
- [ ] Build session history table with filters (date, club, device)
- [ ] Add pagination (20 sessions per page)
- [ ] Create 4 KPI cards: Consistency Score, 30-Day Trend, Best Metrics, Total Sessions
- [ ] Quick action buttons: Import CSV, Manual Entry, Connect Device, View Goals

### Swing DNA Profile
- [ ] Create radar chart component (Chart.js)
- [ ] Calculate 6 DNA attributes: Power, Consistency, Efficiency, Launch, Spin Control, Accuracy
- [ ] Add benchmark comparison (PGA Tour average, same handicap peers)
- [ ] Color coding: green (above avg), yellow (avg), red (needs work)
- [ ] Generate shareable image export

### Progress Charts
- [ ] Club Speed Over Time line chart with trend line
- [ ] Distance Progression chart (carry vs total)
- [ ] Consistency Tracker showing variance over time
- [ ] Launch Conditions Matrix scatter plot (launch angle vs spin rate)
- [ ] All charts responsive and touch-friendly

### Detailed Session View
- [ ] Individual session drill-down page
- [ ] Shot-by-shot table with all metrics
- [ ] Best/worst shot highlights
- [ ] Session notes display
- [ ] Shot dispersion pattern visualization

## Acceptance
- Dashboard loads in <2 seconds with 100+ sessions
- All charts render smoothly on mobile (375px width)
- Filters update table without full page reload
- Swing DNA accurately reflects user's swing profile