---
title: Swing DNA - Phase 5: Fitting System Integration
status: todo
priority: medium
type: feature
tags: [analytics, fitting, integration]
created_by: agent
created_at: 2026-06-29T20:14:00Z
position: 15
---

## Notes
Integrate Swing DNA data into the existing fitting recommendation engine. Use actual swing metrics (when available) instead of estimates for more accurate club recommendations.

**Integration Points:**
1. Recommendation engine (use actual club speed)
2. Main dashboard (add Swing Analytics card)
3. Fitting report PDF (include swing data summary)
4. Sidebar navigation (new menu item)

## Checklist

### Update Fitting Recommendations
- [ ] Modify `/api/generate-recommendations.ts` to query swing data
- [ ] Use actual club speed instead of estimated (when available)
- [ ] Factor consistency score into shaft flex recommendation
- [ ] Use launch angle data for loft recommendations
- [ ] Add "Based on your swing data" indicator to results
- [ ] Create "Update from Swing Data" button on results page
- [ ] Show comparison: estimates vs actual data

### Dashboard Integration
- [ ] Add Swing Analytics card to `/dashboard`
- [ ] Display: last session date, consistency score, latest achievement
- [ ] Quick link to full analytics dashboard
- [ ] Show upgrade prompt for Entry tier users

### Sidebar Navigation
- [ ] Update `AppSidebar.tsx` with "Swing Analytics" menu item
- [ ] Add TrendingUp icon
- [ ] Badge indicator for new achievements (red dot)
- [ ] Highlight when on analytics pages

### Results & Report Integration
- [ ] Update fitting results page with swing data section
- [ ] Include last 10 sessions overview table
- [ ] Show current Swing DNA radar chart
- [ ] Add "How swing data informed recommendations" explanation
- [ ] Update PDF report generation to include swing summary

## Acceptance
- Recommendations update automatically when swing data exists
- Dashboard card shows accurate latest stats
- PDF reports include swing data when user has 5+ sessions
- Navigation badge clears when user views new achievement