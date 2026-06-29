---
title: Fitting Integration
status: in_progress
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
- [x] Modify `/api/generate-recommendations.ts` to query swing data
- [x] Use actual club speed instead of estimated (when available)
- [x] Factor consistency score into shaft flex recommendation
- [x] Use launch angle data for loft recommendations
- [ ] Add "Based on your swing data" indicator to results
- [ ] Create "Update from Swing Data" button on results page
- [ ] Show comparison: estimates vs actual data

### Dashboard Integration
- [x] Add Swing Analytics card to `/dashboard`
- [x] Display: last session date, consistency score, latest achievement
- [x] Quick link to full analytics dashboard
- [x] Show upgrade prompt for Entry tier users

### Sidebar Navigation
- [x] Update `AppSidebar.tsx` with "Swing Analytics" menu item
- [x] Add TrendingUp icon
- [x] Badge indicator for new achievements (red dot)
- [x] Highlight when on analytics pages

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
