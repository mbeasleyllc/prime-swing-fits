# Club Fitting Workflow Revision - Implementation Plan

## Phase 1: Database Schema & Club Category Selection (Priority: Critical)

### 1.1 Database Changes
**New tables needed:**
- `club_category_selections` - Track which club types user wants fitted
- Update `fitting_sessions` with subscription tier tracking

**New columns in `fitting_sessions`:**
- `selected_categories` (JSONB) - Array of selected club categories
- `subscription_tier` (TEXT) - Track fitting plan tier
- `clubs_fitted_count` (INTEGER) - For single club starter tracking

**Club categories to support:**
- driver
- fairway_woods
- hybrids
- irons
- wedges
- putter
- golf_ball

### 1.2 New Step 0: Club Category Selection
**Create:** `src/pages/fitting/[id]/step/0.tsx`
- Display subscription tier info
- Multi-select checkboxes for club categories
- Visual club icons/images
- Description of what gets fitted in each category
- Validation: Must select at least one category
- Save selections to database before proceeding

### 1.3 Update Navigation
- Insert Step 0 before current Step 1
- Update ProgressBar to show "Club Selection" as step 0
- Adjust all step numbers (current 1-8 becomes 1-9)

---

## Phase 2: Enhanced Universal Questions (Priority: High)

### 2.1 Update Step 1: Player Profile & Experience
**Add to step 1:**
- Experience level with detailed tooltips:
  * Beginner/Novice (120+ score)
  * High Handicap/Intermediate (90-110, HCP 20-30+)
  * Mid Handicap/Competent Amateur (80-89, HCP 10-19)
  * Low Handicap/Advanced (72-79, HCP <10)
  * Scratch/Professional Elite (Par or better)
- Handicap Index field (required)
- Handicap Goals field (optional)
- Average Score range selector
- Years Playing Golf
- Playing Frequency (Less than 1/month, 1-2/month, Weekly, Multiple/week)
- Ball-striking quality assessment

### 2.2 Update Step 2: Current Club Situation
**Add to step 2:**
- "Do you have current clubs?" (Yes/No)
- If yes: "How old and what brand?"
- "Are you looking to replace your whole bag or one club at a time?"

---

## Phase 3: Category-Specific Questionnaires (Priority: High)

### 3.1 Dynamic Step Insertion Logic
**Create routing system:**
- After Step 2 (physical measurements), dynamically route based on `selected_categories`
- Insert category-specific steps only for selected categories
- Maintain step sequence: Universal → Category-Specific → Golf Ball → Review

### 3.2 Driver Questionnaire (Step 3a - conditional)
**Create:** `src/pages/fitting/[id]/step/3-driver.tsx`
- Current driver specs (loft, shaft flex, weight, length)
- Distance assessment (avg carry, avg total, best drive)
- Ball flight characteristics (straight/fade/draw/slice/hook)
- Trajectory (very low/low/mid/high/very high)
- Most common miss (pull/hook/push/slice/thin/top/balloon/line drive)
- Miss percentage (fairway hit rate)
- Swing speed estimate
- Transition tempo (smooth/moderate/aggressive)
- Swing type (sweeper/neutral/hitter)
- Performance goals ranking (distance/accuracy/lower spin/higher launch/straighter/forgiveness/shot shaping)
- Preferred head shape (large/traditional 460cc/compact)
- Preferred appearance (square/slightly closed/slightly open face)

### 3.3 Fairway Woods Questionnaire (Step 3b - conditional)
**Create:** `src/pages/fitting/[id]/step/3-fairway-woods.tsx`
- Current fairway woods carried (3W/4W/5W/7W/9W)
- Primary usage (off tee/off fairway/from rough/equal mix)
- Main goal (distance/accuracy/higher launch/forgiveness/better gapping/easier from turf)
- Which club trying to replace/improve
- Yardage gap trying to fill
- Typical shot shape
- Typical miss
- Struggle to get airborne? (Yes/No)
- Preferred trajectory
- Preferred head size (compact/mid-size/maximum forgiveness)
- Draw bias preference (Yes/No/Unsure)
- Adjustability preference (fixed/adjustable loft/adjustable weighting)

### 3.4 Hybrids Questionnaire (Step 3c - conditional)
**Create:** `src/pages/fitting/[id]/step/3-hybrids.tsx`
- Current hybrids carried (2H-6H, select multiple)
- Current fairway woods
- Longest iron played comfortably (3i-7i)
- Which club gives most trouble (3i/4i/5i/fairway woods/none)
- Biggest miss with long irons (thin/fat/slice/hook/low trajectory/inconsistent)
- Distance evaluation (driver/3W/5W/4i/5i/current hybrid carries)
- Distance gap trying to fill (170-180y through 220+y)
- Primary usage (off tee/fairway approach/rough recovery/long par 3s/all-around)
- Biggest struggle (long approaches/carrying hazards/hitting from rough/tight tee shots/holding greens)
- Desired ball flight (lower penetrating/mid/higher launch/maximum height)
- Current ball flight tendency (fade/slice/straight/draw/hook)
- What's most important (distance/forgiveness/workability/consistency)

### 3.5 Irons Questionnaire (Step 3d - conditional)
**Create:** `src/pages/fitting/[id]/step/3-irons.tsx`
- Current iron specs (manufacturer/model/shaft/flex)
- Custom fitted? (Yes/No, modifications if yes)
- Current length (standard/longer/shorter/unsure)
- Choke down frequency (always/frequently/sometimes/never)
- Typical ball flight (low/mid/high/varies)
- Common miss (slice/push/fade/pull/hook/thin/fat/toe/heel/multiple)
- Which miss hurts score most
- Shot shape typically played (straight/draw/fade/inconsistent)
- Performance goals ranking (distance/accuracy/forgiveness/consistency/feel/workability/higher flight/lower flight)
- Most want to improve (distance/accuracy/dispersion/consistent contact/feel/turf interaction/easier launch/more spin/less spin)
- Swing characteristics (tempo: smooth/moderate/aggressive)
- Transition (smooth/average/quick/very aggressive)
- 7-iron carry distance
- Typical 7-iron ball flight (too low/ideal/too high/unsure)

### 3.6 Wedges Questionnaire (Step 3e - conditional)
**Create:** `src/pages/fitting/[id]/step/3-wedges.tsx`
- Current wedges (PW/GW/SW/LW lofts)
- Around greens preference (max spin/moderate spin with rollout/minimal spin)
- Use spin to stop ball? (Yes/Sometimes/No)
- Greenside feel importance (very/somewhat/not important)
- Bunker shots typically (stop quickly/release moderately/roll out significantly)

### 3.7 Putter Questionnaire (Step 3f - conditional)
**Create:** `src/pages/fitting/[id]/step/3-putter.tsx`
- Current putter specs (model/length/grip size)
- Satisfaction with current (yes/somewhat/no)
- Eye position (directly over/slightly inside/outside/unsure)
- Posture (upright/moderate bend/significant bend)
- Arms hang naturally? (Yes/No/Not sure)
- Sole sits flat? (Yes/toe raised/heel raised/unsure)
- Stroke pattern (straight/slight arc/moderate arc/strong arc/unsure)
- Face rotation (very little/some/significant/unsure)
- Typical miss (push right/pull left/distance control/inconsistent strike)
- Preferred head style (blade/mid-mallet/mallet/no preference)
- Alignment aid preference (single line/multiple lines/geometric/dot/center-shaft/unsure)
- Forgiveness importance (very/moderately/not a priority)
- Preferred feel (very soft/soft/medium/firm/very firm)
- Green speed typically played (slow/medium/fast/varies)
- Forward press? (Always/Sometimes/Never)
- Current length (cm)
- Grip size preference (standard/midsize/oversize/unsure)
- Hand activity (very active/somewhat/minimal)

---

## Phase 4: Golf Ball Fitting (Priority: Medium)

### 4.1 Enhanced Golf Ball Step
**Update existing Step 7 (now Step 8):**
- Current ball information (what playing, how long, likes/dislikes)
- Driver performance (carry distance categories, estimated swing speed)
- Typical driver shot shape
- Ball flight (low/mid/high)
- Iron play (7-iron carry, ball striking quality)
- What's most important with irons (distance/accuracy/stopping power/feel)
- Short game assessment (around greens preference, use spin?, greenside feel importance, bunker play)
- Putting feel (very soft/soft/medium/firm)
- What gives confidence on greens
- Course conditions (soft/firm/mixed greens, weather)
- Budget (under $25, $25-40, $40-55, $55+)
- Balls lost per round (0-1, 2-3, 4-5, 6+)
- Priority ranking (distance off tee, greenside spin, feel, durability/cost)

---

## Phase 5: Recommendation Engine Updates (Priority: Critical)

### 5.1 Category-Based Recommendation Logic
**Update:** `src/pages/api/generate-recommendations.ts`

**New functions needed:**
- `generateDriverRecommendations()` - Uses driver-specific data
- `generateFairwayWoodRecommendations()` - Gapping logic + loft selection
- `generateHybridRecommendations()` - Iron replacement logic
- `generateIronRecommendations()` - Set selection + lie/length
- `generateWedgeRecommendations()` - Loft gapping from PW
- `generatePutterRecommendations()` - Head style + toe hang + length
- `generateGolfBallRecommendations()` - Enhanced matching

**Each function returns:**
```typescript
{
  category: string;
  recommendations: Array<{
    productType: string;
    specs: Record<string, string>;
    explanation: string;
    priority: number;
  }>;
  overallFit: number; // 0-100 confidence
}
```

### 5.2 Update Database Schema for Category Results
**New table:** `fitting_recommendations_v2`
```sql
- session_id (UUID FK)
- user_id (UUID FK)
- category (TEXT) - driver/fairway_woods/hybrids/irons/wedges/putter/golf_ball
- recommendations (JSONB) - Array of recommendation objects
- confidence_score (INTEGER) - 0-100
- generated_at (TIMESTAMPTZ)
```

---

## Phase 6: Results & Report Updates (Priority: High)

### 6.1 Category-Filtered Results Page
**Update:** `src/pages/fitting/[id]/results.tsx`
- Display only categories user selected
- Tabs/sections for each category
- Category-specific recommendation cards
- Comparison tables where applicable
- "Add more categories" CTA if not full bag

### 6.2 Category-Filtered PDF Report
**Update:** `src/pages/fitting/[id]/report.tsx`
- Generate PDF with only fitted categories
- Category-specific pages/sections
- Include category selection summary page
- Subscription tier badge/logo

---

## Phase 7: Subscription Tier Integration (Priority: Medium)

### 7.1 Pricing Page Updates
**Update:** `src/pages/pricing.tsx`
- Update pricing tiers to match document:
  * Free Trial: 1 complimentary fitting
  * Single Club Starter: $29.99 (1 club + add-ons at $9.99)
  * Full Bag Premium: $49.99 (up to 14 clubs)
  * Full Bag Executive: $64.99 (unlimited re-evaluations)

### 7.2 Fitting Session Tier Enforcement
- Check user's subscription tier before allowing new fitting
- Limit club count for Single Club Starter
- Track add-on purchases
- Allow re-fittings for Executive tier

---

## Phase 8: Testing & Validation (Priority: Critical)

### 8.1 Test Scenarios
1. Free trial user - single category
2. Single club starter - driver only
3. Single club starter - add second club
4. Full bag premium - all categories
5. Full bag executive - re-evaluation
6. Partial bag (3 categories)
7. Each category individually

### 8.2 Data Migration
- Existing sessions: mark as "legacy_full_bag"
- New sessions: use category selection
- Recommendation compatibility layer

---

## Implementation Order (Staged Rollout)

### Stage 1: Foundation (Days 1-2)
- Database schema changes
- Step 0 club category selection
- Renumber existing steps
- Basic routing logic

### Stage 2: Category Questionnaires (Days 3-5)
- Create all 6 category-specific step files
- Implement conditional routing
- Update progress bar logic

### Stage 3: Recommendation Engine (Days 6-7)
- Split recommendation logic by category
- Update API endpoint
- New database table for results

### Stage 4: Results & Reports (Day 8)
- Category-filtered results page
- Category-filtered PDF generation
- Visual improvements

### Stage 5: Subscription Integration (Day 9)
- Pricing page updates
- Tier enforcement logic
- Add-on purchase flow

### Stage 6: Testing & Polish (Day 10)
- End-to-end testing
- Bug fixes
- Documentation updates

---

## Files to Create/Modify Summary

### New Files (7):
1. `.softgen/backups/pre-fitting-revision-backup.md` ✓
2. `src/pages/fitting/[id]/step/0.tsx` - Club category selection
3. `src/pages/fitting/[id]/step/3-driver.tsx`
4. `src/pages/fitting/[id]/step/3-fairway-woods.tsx`
5. `src/pages/fitting/[id]/step/3-hybrids.tsx`
6. `src/pages/fitting/[id]/step/3-irons.tsx`
7. `src/pages/fitting/[id]/step/3-wedges.tsx`
8. `src/pages/fitting/[id]/step/3-putter.tsx`

### Modified Files (10+):
1. `supabase/migrations/[new]_category_selection.sql`
2. `src/pages/fitting/[id]/step/1.tsx` - Enhanced universal questions
3. `src/pages/fitting/[id]/step/2.tsx` - Club situation questions
4. `src/pages/fitting/[id]/step/[7-8].tsx` - Enhanced golf ball
5. `src/pages/api/generate-recommendations.ts` - Category-based logic
6. `src/pages/fitting/[id]/results.tsx` - Category filtering
7. `src/pages/fitting/[id]/report.tsx` - Category filtering
8. `src/pages/fitting/new.tsx` - Session creation with tier
9. `src/pages/pricing.tsx` - Updated tiers
10. `src/components/wizard/ProgressBar.tsx` - Step 0 support

---

## Risk Mitigation

### Backwards Compatibility
- Legacy sessions work with old flow
- New flag: `uses_category_selection: boolean`
- Graceful degradation for missing data

### Data Validation
- Validate category selections before proceeding
- Ensure at least one category selected
- Prevent duplicate questionnaires

### Performance
- Lazy load category-specific components
- Optimize recommendation engine queries
- Cache user selections

---

## Success Criteria

- ✓ User can select specific club categories to fit
- ✓ Dynamic workflow based on selections
- ✓ Category-specific questionnaires capture detailed data
- ✓ Recommendations relevant only to selected categories
- ✓ Results/reports show only fitted categories
- ✓ Subscription tiers properly enforced
- ✓ All existing fittings continue to work
- ✓ No breaking changes to database
- ✓ Test coverage for all scenarios