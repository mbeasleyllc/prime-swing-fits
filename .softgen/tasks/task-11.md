<![CDATA[
---
title: Swing DNA Analytics & Progress Tracking - Build Plan
status: todo
priority: high
type: feature
tags: [analytics, tracking, integration, gamification]
created_by: agent
created_at: 2026-06-29T20:07:26Z
position: 11
---

## Feature Overview
Build comprehensive swing analytics and progress tracking system that allows users to track swing metrics over time, connect launch monitor data, and receive AI-driven insights for continuous improvement.

## Revenue Model Integration
- **Entry Tier ($20)**: Not available (teaser message)
- **Core Tier ($59)**: $12.99/month add-on (3-month history, basic charts)
- **Premium Tier ($99)**: Included (12-month history, trend analysis, consistency scores)
- **Premium Plus ($220)**: Included (unlimited history, AI insights, manufacturer benchmarking)

## Build Steps

### Phase 1: Database Schema & Core Infrastructure

#### 1.1 Database Tables (Supabase)
- [ ] Create `swing_sessions` table
  - id (uuid, primary key)
  - user_id (uuid, foreign key to auth.users)
  - session_date (timestamp)
  - session_type (manual, imported, launch_monitor)
  - device_source (text: golf_daddy, trackman, flightscope, skytrak, garmin, manual)
  - notes (text)
  - created_at, updated_at

- [ ] Create `swing_metrics` table
  - id (uuid, primary key)
  - session_id (uuid, foreign key to swing_sessions)
  - club_type (text: driver, 7iron, pitching_wedge, etc.)
  - ball_speed (decimal, mph)
  - club_speed (decimal, mph)
  - launch_angle (decimal, degrees)
  - spin_rate (integer, rpm)
  - carry_distance (decimal, yards)
  - total_distance (decimal, yards)
  - smash_factor (decimal)
  - swing_path (decimal, degrees, in-to-out or out-to-in)
  - face_angle (decimal, degrees)
  - attack_angle (decimal, degrees)
  - created_at

- [ ] Create `swing_goals` table
  - id (uuid, primary key)
  - user_id (uuid, foreign key to auth.users)
  - goal_type (club_speed, consistency, distance, accuracy)
  - target_value (decimal)
  - current_value (decimal)
  - deadline (date)
  - status (active, completed, abandoned)
  - created_at, updated_at

- [ ] Create `achievement_badges` table
  - id (uuid, primary key)
  - user_id (uuid, foreign key to auth.users)
  - badge_type (first_session, speed_demon, consistency_king, distance_milestone, etc.)
  - badge_level (bronze, silver, gold, platinum)
  - earned_at (timestamp)
  - created_at

- [ ] Create `user_swing_subscriptions` table
  - id (uuid, primary key)
  - user_id (uuid, foreign key to auth.users)
  - subscription_tier (core_addon, premium, premium_plus)
  - status (active, cancelled, expired)
  - started_at (timestamp)
  - expires_at (timestamp)
  - stripe_subscription_id (text, nullable)

#### 1.2 RLS Policies
- [ ] Enable RLS on all swing tables
- [ ] Create policies for user-owned data only
- [ ] Admin read-all policy for support

#### 1.3 Database Functions
- [ ] Create `calculate_consistency_score()` function
  - Analyzes variance in swing metrics over last 10 sessions
  - Returns 0-100 score (lower variance = higher consistency)
  
- [ ] Create `get_improvement_trend()` function
  - Calculates linear regression on metric over time
  - Returns trend direction (improving, stable, declining) and rate

- [ ] Create `check_badge_eligibility()` trigger function
  - Auto-awards badges when conditions met
  - Conditions: 10 sessions = bronze, 50 = silver, 100 = gold, etc.

### Phase 2: Data Import System (Plug & Play Integration)

#### 2.1 CSV Import (Universal Fallback)
- [ ] Create CSV template with standardized columns
  - Date, Club, Ball Speed, Club Speed, Launch Angle, Spin Rate, Carry, Total Distance
  - Optional: Smash Factor, Swing Path, Face Angle, Attack Angle
  
- [ ] Build CSV parser component
  - Drag-and-drop file upload
  - Auto-detect column mapping (flexible headers)
  - Preview before import (show first 5 rows)
  - Validation (reasonable ranges: ball speed 80-200mph, etc.)
  - Bulk insert to database

#### 2.2 Launch Monitor Integrations (API-Based)

**Option A: Golf Daddy Integration (Priority - included in Premium Plus)**
- [ ] Research Golf Daddy API/export format
- [ ] Create OAuth flow or API key setup page
- [ ] Build sync function to pull session data
- [ ] Auto-import on schedule (daily sync)

**Option B: TrackMan/FlightScope/SkyTrak (Generic Golf Monitor Support)**
- [ ] Create generic .json import (most monitors export JSON)
- [ ] Build device-specific parsers for common formats
- [ ] Test with sample data from each device

**Option C: Garmin/Arccos (Smart Shot Tracking Apps)**
- [ ] CSV export instructions for users
- [ ] One-click "Export to Prime Swing Fits" button (if API available)

#### 2.3 Manual Entry Form
- [ ] Simple form for quick single-shot entry
  - Club selection dropdown
  - Essential metrics only (speed, distance)
  - Optional advanced metrics (expandable)
  - Save to current session or create new
  
- [ ] Range session entry (batch mode)
  - Add multiple shots to same session
  - Quick-add previous club
  - Session summary before save

### Phase 3: Analytics Dashboard

#### 3.1 Main Dashboard Page (`/swing-analytics`)
- [ ] Session history list (table view)
  - Date, Device, Club Count, Session Type
  - Quick stats: Avg Driver Speed, Best Carry, Consistency Score
  - Filter by date range, club type, device source
  
- [ ] Key Performance Indicators (KPI Cards)
  - Current Consistency Score (0-100)
  - 30-day improvement trend (+3.2 mph club speed)
  - Best metrics (personal records)
  - Total sessions logged

- [ ] Quick Actions
  - Import CSV button
  - Manual entry button
  - Connect device button
  - View goals button

#### 3.2 Swing DNA Profile
- [ ] Create visual "DNA" representation
  - Radar chart showing 6 key attributes:
    1. Power (club speed)
    2. Consistency (variance score)
    3. Efficiency (smash factor)
    4. Launch (optimal launch angle)
    5. Spin Control (spin rate consistency)
    6. Accuracy (swing path/face angle)
  
- [ ] Comparison to benchmarks
  - Your profile vs PGA Tour average
  - Your profile vs same handicap peers (anonymized data)
  - Color coding: green (above average), yellow (average), red (needs work)

- [ ] Share DNA profile (social)
  - Generate shareable image
  - "My Swing DNA" badge for forums/social

#### 3.3 Progress Charts (Chart.js)
- [ ] Club Speed Over Time
  - Line chart with trend line
  - Toggle between clubs (driver, 7i, etc.)
  - Mark goal line if set
  
- [ ] Distance Progression
  - Carry vs Total distance
  - Compare clubs side-by-side
  
- [ ] Consistency Tracker
  - Variance visualization (narrowing = improving)
  - Show standard deviation over time
  
- [ ] Launch Conditions Matrix
  - Scatter plot: Launch Angle vs Spin Rate
  - Optimal zone overlay (manufacturer data)
  - Color by distance achieved

#### 3.4 Detailed Session View
- [ ] Individual session drill-down
  - Table of all shots in session
  - Shot-by-shot comparison
  - Best/worst shot highlights
  - Session notes
  
- [ ] Shot Dispersion Pattern
  - Visual representation of carry distances
  - Consistency visualization

### Phase 4: Gamification & Goals

#### 4.1 Achievement System
- [ ] Badge types:
  - **First Steps**: First session logged (bronze)
  - **Speed Demon**: Club speed milestones (110/115/120/125 mph)
  - **Consistency King**: Achieve 80+ consistency score
  - **Distance Master**: Total distance milestones (250/275/300 yards)
  - **Dedicated**: Session count milestones (10/50/100/500)
  - **Optimizer**: Track all 14 clubs in one session
  - **Launch Perfect**: Hit optimal launch window 5 times
  
- [ ] Badge display
  - Dashboard badge shelf (earned badges highlighted)
  - Unlock progress bars for next level
  - Pop-up notification on earn

#### 4.2 Goal Setting
- [ ] Goal creation wizard
  - Select metric (club speed, distance, consistency)
  - Set target value
  - Choose deadline (30/60/90 days)
  
- [ ] Goal tracking widget
  - Progress bar to goal
  - Days remaining
  - Current pace indicator (on track / behind)
  - Suggested practice frequency

#### 4.3 Insights & Recommendations
- [ ] AI-driven insights (Premium+)
  - "Your driver speed increased 4% in the last month"
  - "Your 7-iron consistency is 15% better than similar handicaps"
  - "Try increasing swing speed - your smash factor is already optimal"
  
- [ ] Practice recommendations
  - Based on weak areas in DNA profile
  - Suggested drills (links to YouTube/instruction)

### Phase 5: Integration with Existing Fitting System

#### 5.1 Update Fitting Recommendations
- [ ] Modify recommendation engine to consider swing data
  - Use actual club speed vs estimated (if available)
  - Factor in consistency score for shaft flex
  - Use launch angle for loft recommendations
  
- [ ] Add "Update from Swing Data" button to fitting results
  - Re-run recommendations with latest swing metrics
  - Show comparison: "Based on estimates" vs "Based on your data"

#### 5.2 Dashboard Integration
- [ ] Add Swing Analytics card to main dashboard
  - Last session date
  - Current consistency score
  - Quick link to full analytics
  
- [ ] Update sidebar navigation
  - New "Swing Analytics" menu item
  - Badge indicator for new achievements

#### 5.3 Results & Report Integration
- [ ] Include swing data summary in fitting report PDF
  - Last 10 sessions overview
  - Current DNA profile
  - How swing data informed recommendations

### Phase 6: Subscription & Monetization

#### 6.1 Tier Gating
- [ ] Create subscription check middleware
  - Check user tier before accessing analytics
  - Show upgrade prompt for Entry users
  - Enforce data history limits (3-month for Core)
  
- [ ] Upgrade flow
  - In-app purchase for Core add-on ($12.99/mo)
  - Upgrade to Premium includes analytics
  - Premium Plus gets all features

#### 6.2 Stripe Integration (for Core Add-on)
- [ ] Create Stripe product & pricing
  - Swing Analytics Add-on product
  - $12.99/month recurring
  
- [ ] Build subscription management
  - Subscribe button (Stripe Checkout)
  - Cancel/reactivate in settings
  - Webhook handler for status updates

#### 6.3 Data Retention Policy
- [ ] Implement tier-based limits
  - Core addon: 3 months (auto-delete older)
  - Premium: 12 months
  - Premium Plus: Unlimited
  
- [ ] Export all data before deletion
  - Email user before auto-delete
  - One-click export to CSV

### Phase 7: Testing & Polish

#### 7.1 Data Validation
- [ ] Test CSV import with various formats
- [ ] Validate metric ranges (catch impossible values)
- [ ] Handle missing data gracefully

#### 7.2 Performance Testing
- [ ] Query optimization for large datasets
  - Index on user_id, session_date
  - Pagination for session list
  
- [ ] Chart rendering performance
  - Limit data points displayed (weekly aggregates for 1yr+)

#### 7.3 Mobile Responsiveness
- [ ] All charts responsive (touch-friendly)
- [ ] Manual entry form optimized for mobile
- [ ] Session list mobile layout

#### 7.4 User Testing
- [ ] Import test data for 3 user profiles
  - Beginner (inconsistent data)
  - Intermediate (improving trend)
  - Advanced (high consistency)
- [ ] Verify all calculations correct
- [ ] Test upgrade/downgrade flows

## Recommended Features Priority

### Must-Have (MVP)
1. Manual entry form
2. CSV import
3. Session history list
4. Basic charts (club speed, distance over time)
5. Consistency score calculation
6. Tier-based access control

### Should-Have (Phase 2)
1. Swing DNA profile visualization
2. Achievement badges (basic set)
3. Goal setting
4. Integration with fitting recommendations
5. Golf Daddy sync (for Premium Plus)

### Nice-to-Have (Future)
1. AI insights and recommendations
2. Peer benchmarking
3. Video swing analysis upload
4. Social sharing
5. Export analytics to PDF

## Integration Workflow (Plug & Play Approach)

### For Users:
1. **Option 1 - Launch Monitor with App**
   - User exports session from monitor app (CSV/JSON)
   - Drag & drop to Prime Swing Fits import page
   - Auto-mapped, preview, confirm import
   
2. **Option 2 - Launch Monitor with API**
   - User connects device via OAuth/API key (one-time setup)
   - Daily auto-sync pulls new sessions
   - User reviews and confirms imports
   
3. **Option 3 - Manual Entry**
   - User fills simple form after range session
   - Essential metrics only, optional advanced
   - Quick multi-shot entry mode

### Implementation Order:
1. Manual entry (immediate value, no dependencies)
2. CSV import (universal compatibility, 80% of users)
3. Golf Daddy sync (Premium Plus feature, high-value integration)
4. Generic JSON import (covers most other monitors)

## Success Metrics
- 30% of Premium users add monthly tracking
- 20% of Core users upgrade for analytics add-on
- Average 5+ sessions logged per active user per month
- 85% user satisfaction with import process

## Technical Stack
- Database: Supabase (TimescaleDB for time-series optimization)
- Charts: Chart.js or Recharts
- CSV Parsing: PapaParse
- File Upload: react-dropzone
- Date Handling: date-fns
- Stripe SDK for subscriptions

## Acceptance Criteria
- User can import swing data via CSV in under 2 minutes
- Charts render smoothly with 100+ data points
- Consistency score accurately reflects swing variance
- Subscription upgrades work end-to-end
- All tier restrictions properly enforced
- Mobile-responsive on tablet and phone
- PDF reports include swing data when available
</file_content>
