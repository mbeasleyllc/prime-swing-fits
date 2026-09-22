# Prime Swing Fits - Application Reference

## Overview
Professional golf club fitting web application providing personalized equipment recommendations through a self-guided digital fitting process. Tablet-first (768px primary), fully responsive.

**Core Features**:
- 6-step guided fitting wizard with deterministic recommendations
- Equipment database with comparison tools
- Swing analytics & progress tracking (premium subscription)
- Gamification (badges, goals)
- Admin panel for platform management
- PDF report export

---

## Tech Stack

**Frontend**:
- Next.js 15.5 (Page Router) + React 19.2 + TypeScript
- Tailwind CSS 3.4 + shadcn/ui components
- Forms: react-hook-form + Zod validation
- Charts: Custom SVG radar charts
- PDF: html2canvas + jsPDF

**Backend**:
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email/password + Google OAuth)
- Storage: Supabase Storage (avatars)
- Payments: Stripe (swing analytics subscription)
- Email: Supabase Edge Functions
- Hosting: Vercel + PM2

**Key Dependencies**:
- `@supabase/supabase-js`: v2.108.2
- `@stripe/stripe-js`: Stripe integration  
- `lucide-react`: v0.577 icons
- `framer-motion`: v12.0.6 animations
- `papaparse`: CSV parsing

---

## Database Schema (10 Tables)

### 1. profiles
User profile linked to auth.users
- Fields: id, email, full_name, avatar_url, skill_level, wrist_to_floor, is_admin, subscription_status, subscription_end_date
- RLS: Users read/update own profile only

### 2. fitting_sessions
Wizard responses and fitting data
- Fields: id, user_id, gender, age, height, weight, wrist_to_floor, skill_level, swing_speed, ball_flight, current_clubs, goals, recommendations (JSON), completed_at
- RLS: Private per-user

### 3. fitting_rules
Admin-managed fitting logic
- Fields: id, rule_type, condition, value, recommendation, priority, active
- RLS: Public read, admin write

### 4. products
Golf equipment database
- Fields: id, name, brand, category, specs (JSON), price, image_url, active
- RLS: Public read, admin write

### 5. swing_sessions
Practice/round sessions (premium)
- Fields: id, user_id, session_date, session_type, location, duration_minutes, notes
- RLS: Private per-user

### 6. swing_data
Individual shot metrics (premium)
- Fields: id, swing_session_id, user_id, club_type, ball_speed, club_speed, smash_factor, launch_angle, spin_rate, carry_distance, total_distance, shot_shape
- RLS: Private per-user

### 7. swing_goals
User improvement goals (premium)
- Fields: id, user_id, goal_type, target_value, current_value, start_date, target_date, status, notes
- RLS: Private per-user

### 8. user_badges
Achievement badges
- Fields: id, user_id, badge_type, badge_name, badge_description, earned_at
- RLS: Private per-user

### 9. support_requests
Support ticket system
- Fields: id, user_id, email, subject, message, status, admin_response, resolved_at
- RLS: Users see own, admins see all

### 10. user_activity_logs
Admin monitoring
- Fields: id, user_id, action, details, created_at

---

## Core Features

### 1. Fitting Wizard (6 Steps)
**Routes**: `/fitting/new` → `/fitting/[id]/step/[1-6]` → `/fitting/[id]/results`

**Steps**: Playing Profile → Experience → Current Equipment → Swing Characteristics → Preferences → Goals

**Recommendation Engine** (`/api/generate-recommendations`):
- Calculates: club length, lie angle, grip size, shaft flex/weight, club type
- Top 5 golf ball matches from `src/data/golfBallDatabase.ts` (678 lines)
- Stores JSON in `fitting_sessions.recommendations`
- Deterministic algorithm based on proven club fitting principles

**Results**: Personalized specs + explanations + PDF export

### 2. Equipment Database
**Routes**: `/clubs`, `/clubs/[id]`, `/clubs/compare`
- Browse/filter clubs (brand, category, price)
- Side-by-side comparison (up to 3)
- Fitting match indicators
- Data: `src/data/clubDatabase.ts` (752 lines pre-populated)

### 3. Swing Analytics (Premium - $9.99/mo)
**Routes**: `/swing-analytics`, `/swing-analytics/[id]`, `/swing-data/import`

**Features**:
- Swing DNA Radar: 6-axis performance viz (club speed, ball speed, smash factor, launch, spin, distance)
- Weekly Summary: Session tracking with heat maps
- Manual Entry: Form-based shot input
- CSV Import: Bulk upload with validation (`src/lib/swingDataValidation.ts`)
- Device Integration: Connect Trackman, Foresight, FlightScope via OAuth

**Subscription Flow**:
1. Checkout: `/api/create-swing-checkout`
2. Stripe hosted payment
3. Webhook: `/api/webhooks/stripe-swing-analytics`
4. Update `profiles.subscription_status`
5. Portal: `/api/manage-swing-subscription`

### 4. Admin Panel
**Routes**: `/admin/*` (requires `is_admin` flag)

**Modules**:
- Users (`/admin/users`) - Manage profiles, roles, subscriptions (1795 lines)
- Products (`/admin/products`) - CRUD equipment catalog
- Rules (`/admin/rules`) - Edit fitting logic
- Support (`/admin/support-requests`) - Ticket responses
- Sessions (`/admin/sessions`) - View all fittings
- Coupons (`/admin/coupons`) - Discount codes
- Logs (`/admin/logs`) - Activity monitoring

### 5. Gamification
- Badges: Milestone/achievement unlocks via `src/lib/insightGenerator.ts`
- Goals: User-defined targets with progress tracking
- Email reminders: `src/lib/goalEmailService.ts`
- Components: BadgeShelf, GoalWizard, InsightsPanel

### 6. User Dashboard
**Route**: `/dashboard` (1939 lines)
- Recent fitting sessions
- Swing analytics overview (premium)
- Quick actions (New fitting, Compare, Import)
- Goal progress widgets
- Badge showcase

---

## Design System

**Colors** (`src/styles/globals.css`):
```css
--primary: 0 0% 4% (rich black #0A0A0A)
--accent: 142 71% 45% (vibrant green #22C55E)  
--gold: 43 74% 53% (luxe gold #D4AF37)
--background: 0 0% 100% (white)
--muted: 0 0% 96% (light gray)
```

**Typography**: Inter (400, 500, 600, 700) for headings and body

**Style**: Premium golf luxury - bold black foundations, vibrant green accent, gold premium touches, high-end country club sophistication

**Responsive**: Tablet-first 768px, mobile 375px+, desktop 1024px+

---

## Key File Locations

**Pages** (`src/pages/`):
- `index.tsx` - Landing page (392 lines)
- `dashboard.tsx` - User dashboard (1939 lines)
- `profile.tsx`, `profile/settings.tsx` - Profile management
- `fitting/[id]/` - Wizard steps and results
- `clubs/` - Equipment browsing
- `swing-analytics/` - Premium analytics
- `admin/` - Admin modules
- `api/` - Server-side routes

**Components** (`src/components/`):
- `Navigation.tsx`, `Footer.tsx` - Site chrome
- `AppLayout.tsx`, `AppSidebar.tsx` - Dashboard layout
- `ProtectedRoute.tsx` - Auth guard
- `ui/` - shadcn/ui library
- `analytics/` - Charts (SwingDNARadar, WeeklySummary, ProgressCharts)
- `gamification/` - Badges/goals
- `device-integration/` - Launch monitor connection
- `swing-data/` - CSV import, manual entry

**Services** (`src/services/`):
- `authService.ts` - Supabase auth wrappers
- `productService.ts` - Product CRUD

**Libraries** (`src/lib/`):
- `emailService.ts` - Email notifications (357 lines)
- `insightGenerator.ts` - Badge award logic
- `swingDataValidation.ts` - CSV validation
- `supabaseAdmin.ts` - Service role client
- `deviceIntegration/deviceService.ts` - Launch monitor SDKs (265 lines)

**Data** (`src/data/`):
- `clubDatabase.ts` - Club specs (752 lines)
- `golfBallDatabase.ts` - Ball ratings (678 lines)

**Supabase**:
- Client: `src/integrations/supabase/client.ts`
- Types: `src/integrations/supabase/database.types.ts` (1585 lines auto-generated)
- Migrations: `supabase/migrations/` (30+ files)
- Functions: `supabase/functions/send-email/`, `data-retention-cleanup/`

---

## API Routes

**Public**:
- `POST /api/generate-recommendations` - Generate fitting specs
- `POST /api/create-swing-checkout` - Stripe checkout session
- `POST /api/manage-swing-subscription` - Customer portal
- `POST /api/webhooks/stripe-swing-analytics` - Stripe webhook

**Admin** (require admin auth):
- `POST /api/admin/update-user` - Modify user profiles/roles

**Device**:
- `GET /api/device/oauth/callback` - OAuth callback
- `POST /api/device/sync` - Sync device data

---

## Integration Points

### Supabase
- **Client**: `src/integrations/supabase/client.ts` (anon key, browser use)
- **Admin**: `src/lib/supabaseAdmin.ts` (service role, server-side only)
- **Auth Flow**: Email/password + Google OAuth → profile auto-created via trigger
- **RLS**: All tables enabled, user data isolated by `auth.uid()`

### Stripe
- **Product**: Swing Analytics - $9.99/month recurring
- **Flow**: Upgrade → Checkout Session → Payment → Webhook → Update subscription_status
- **Management**: Customer Portal for cancel/update payment

### Email Service
- **Implementation**: `src/lib/emailService.ts` (357 lines)
- **Types**: Welcome, fitting report, support responses, goal reminders, badge notifications
- **Delivery**: Supabase Edge Function with Resend/SendGrid

### Device Integration
- **Devices**: Trackman, Foresight GC3, FlightScope, SkyTrak
- **Flow**: Initiate → OAuth → Store credentials → Sync endpoint pulls data → Validate → Insert swing_data
- **Implementation**: `src/lib/deviceIntegration/deviceService.ts` (265 lines)

---

## Business Logic

### Recommendation Algorithm
**Location**: `/api/generate-recommendations.ts` (308 lines)

**Inputs**: Physical measurements, swing characteristics, skill level, current equipment, goals

**Calculations**:
1. Club Length - wrist-to-floor + height ratio
2. Lie Angle - height + swing plane
3. Grip Size - hand size proxy
4. Shaft Flex - swing speed + tempo
5. Shaft Weight - flex + strength
6. Club Type - blade vs game improvement

**Golf Ball Matching**: Filter by swing speed (slow <85, med 85-105, fast 105+) + skill level → top 5 rated

### Swing DNA Radar
**Location**: `src/components/analytics/SwingDNARadar.tsx` (389 lines)

**Metrics**: Club Speed, Ball Speed, Smash Factor, Launch Angle, Spin Rate, Distance

**Visualization**: SVG 6-axis radar with baseline/current/target overlays, color-coded zones

---

## User Flows

### New User
1. Land on homepage → Start fitting → Register
2. Dashboard welcome → Begin wizard
3. Complete 6 steps (5-10 min)
4. View recommendations + download PDF
5. Explore club comparison
6. (Optional) Subscribe to analytics

### Admin
1. Login with admin account
2. Access `/admin` panel
3. Respond to support tickets
4. Manage products/rules
5. Review activity logs

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_SWING_ANALYTICS_PRICE_ID=
```

---

## Security

**Auth**: Supabase secure hashing, session auto-refresh, OAuth state validation, CSRF protection

**Authorization**: RLS on all tables, admin explicit role checks, service role never client-exposed

**Data**: Encrypted at rest, no card storage (Stripe), avatar validation, parameterized queries

**API**: Rate limiting, webhook signature verification, CORS restrictions, env vars for secrets

---

## Common Modifications

### Add Wizard Field
1. Add column to fitting_sessions (migration)
2. Regenerate Supabase types
3. Add form field to step component
4. Update validation schema
5. Update recommendation algorithm
6. Update results template

### Add Product Category
1. Insert rows via admin panel
2. Update clubDatabase.ts
3. Add filter in clubs index
4. Update comparison tool
5. Update recommendation engine

### Modify Recommendation Logic
1. Edit `/api/generate-recommendations.ts`
2. Update fitting_rules table
3. Test with profiles
4. Document in admin notes

### Add Admin Feature
1. Create page in `src/pages/admin/`
2. Add route to AppSidebar
3. Implement CRUD via API
4. Apply admin middleware
5. Log to activity

---

## Critical Patterns

**Always**:
- Use TypeScript throughout
- Follow shadcn/ui patterns
- Respect RLS policies
- Use Next.js Page Router conventions (not App Router)
- Mobile-first responsive design
- Keep admin operations server-side

**Key References**:
- `.softgen/project.md` - Project brief
- `src/integrations/supabase/database.types.ts` - Schema types
- `src/data/clubDatabase.ts` - Product structure
- `/api/generate-recommendations.ts` - Core logic
- `src/styles/globals.css` - Design tokens