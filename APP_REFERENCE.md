# Prime Swing Fits - Application Reference Document

## Application Overview

**Prime Swing Fits** is a professional golf club fitting web application that provides personalized equipment recommendations through a self-guided digital fitting process. The platform combines expert club fitting methodology with modern web technology to deliver a premium, tablet-first user experience.

### Core Purpose
- Enable golfers to receive professional-grade club fitting recommendations without visiting a pro shop
- Provide deterministic, science-based club recommendations based on player characteristics and swing data
- Offer equipment comparison tools and downloadable fitting reports
- Track swing data analytics and progress (premium feature)
- Gamification elements with badges and goal tracking

### Target Users
1. **Golfers** - Primary users seeking club fitting recommendations
2. **Admins** - Platform administrators managing content, users, and support
3. **Premium Users** - Subscribers with access to advanced swing analytics

---

## Tech Stack & Architecture

### Frontend
- **Framework**: Next.js 15.5 (Page Router, not App Router)
- **React**: v19.2
- **TypeScript**: Fully typed throughout
- **Styling**: Tailwind CSS 3.4 with shadcn/ui component library
- **State Management**: React Context (AuthContext, ThemeProvider)
- **Forms**: react-hook-form with Zod validation
- **PDF Generation**: html2canvas + jsPDF
- **Charts**: Custom SVG-based radar charts and progress visualizations

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Storage**: Supabase Storage (avatar uploads)
- **Payments**: Stripe (for swing analytics subscription)
- **Email**: Custom email service via Supabase Edge Functions
- **Hosting**: Vercel (with PM2 for dev server management)

### Key Dependencies
- `@supabase/supabase-js`: v2.108.2
- `@stripe/stripe-js` & `@stripe/react-stripe-js`: Stripe integration
- `lucide-react`: v0.577 for icons
- `framer-motion`: v12.0.6 for animations
- `papaparse`: CSV parsing for swing data import
- `date-fns`: Date manipulation

---

## Database Schema (10 Tables)

### Authentication & User Management
1. **profiles** - User profile data linked to auth.users
   - Fields: id, email, full_name, avatar_url, skill_level, wrist_to_floor, created_at, updated_at, is_admin, subscription_status, subscription_end_date
   - RLS: Users can only read/update their own profile

2. **user_activity_logs** - Tracks user actions for admin monitoring
   - Fields: id, user_id, action, details, created_at

### Club Fitting System
3. **fitting_sessions** - Stores wizard responses and fitting data
   - Fields: id, user_id, gender, age, height, weight, wrist_to_floor, skill_level, swing_speed, ball_flight, current_clubs, goals, additional_notes, recommendations, completed_at, created_at, updated_at
   - RLS: Users can only access their own sessions

4. **fitting_rules** - Admin-managed fitting logic rules
   - Fields: id, rule_type, condition, value, recommendation, priority, active, created_at, updated_at
   - Public read, admin-only write

5. **products** - Golf equipment database
   - Fields: id, name, brand, category, specs, price, image_url, active, created_at, updated_at
   - Public read, admin-only write

### Swing Analytics (Premium Feature)
6. **swing_sessions** - Individual practice/round sessions
   - Fields: id, user_id, session_date, session_type, location, duration_minutes, notes, created_at, updated_at
   - RLS: Private per-user data

7. **swing_data** - Detailed swing metrics per shot
   - Fields: id, swing_session_id, user_id, club_type, ball_speed, club_speed, smash_factor, launch_angle, spin_rate, carry_distance, total_distance, shot_shape, created_at
   - RLS: Private per-user data

8. **swing_goals** - User-set improvement goals
   - Fields: id, user_id, goal_type, target_value, current_value, start_date, target_date, status, notes, created_at, updated_at
   - RLS: Private per-user data

### Gamification
9. **user_badges** - Achievement badges earned by users
   - Fields: id, user_id, badge_type, badge_name, badge_description, earned_at, created_at
   - RLS: Private per-user data

### Support
10. **support_requests** - User support tickets
    - Fields: id, user_id, email, subject, message, status, admin_response, created_at, updated_at, resolved_at
    - RLS: Users see own requests, admins see all

---

## Authentication & Authorization

### Auth Flow
- **Registration**: Email/password via Supabase Auth, creates profile record automatically via trigger
- **Login**: Email/password or Google OAuth
- **Password Reset**: Email-based reset flow
- **Session Management**: Supabase session cookies, persisted client-side
- **Protected Routes**: `<ProtectedRoute>` wrapper component checks auth status

### User Roles
- **Regular User**: Can create fitting sessions, view own data, submit support requests
- **Admin**: Full access to admin panel (`is_admin` flag in profiles table)
  - Manage users (view, edit roles, subscription status)
  - Manage products and fitting rules
  - View/respond to support requests
  - View activity logs
  - Manage discount coupons

### Row Level Security (RLS)
- All tables have RLS enabled
- User data isolated by `user_id = auth.uid()` policies
- Admin operations use service role key via API routes
- Public tables (products, fitting_rules) readable by all, writable by admins only

---

## Core Features & User Flows

### 1. Club Fitting Wizard (6 Steps)
**Route**: `/fitting/new` → `/fitting/[id]/step/[1-6]` → `/fitting/[id]/results`

**Steps**:
1. **Playing Profile** - Gender, age, height, weight, wrist-to-floor measurement
2. **Experience** - Skill level (beginner to professional), typical ball flight
3. **Current Equipment** - What clubs user currently plays
4. **Swing Characteristics** - Swing speed (driver), swing tempo, primary miss
5. **Preferences** - Grip preference, shaft feel preference, budget range
6. **Goals** - What user wants to improve

**Logic Flow**:
- Creates `fitting_session` record on wizard start
- Saves responses to database after each step
- Progress tracked in ProgressBar component
- Validation at each step before allowing next
- Final step triggers recommendation generation

**Recommendation Engine** (`/api/generate-recommendations`):
- Deterministic algorithm based on user inputs
- Calculates: club length, lie angle, grip size, shaft flex, shaft weight, club type recommendations
- Matches against products database
- Includes top 5 golf ball recommendations from golfBallDatabase
- Stores results in `fitting_sessions.recommendations` JSON field

### 2. Fitting Results & Report
**Routes**: `/fitting/[id]/results`, `/fitting/[id]/report`

**Features**:
- Display personalized recommendations with explanations
- Club specifications breakdown (length, lie, grip, shaft)
- Top 5 golf ball matches based on swing speed and skill
- Product cards with images, specs, and "Why this fits" rationale
- PDF export functionality (html2canvas → jsPDF)
- Save/bookmark fitting for later reference

### 3. User Dashboard
**Route**: `/dashboard`

**Sections**:
- Welcome banner with user stats
- Recent fitting sessions (view, retry, download report)
- Swing analytics overview (premium users only)
- Quick actions (New fitting, Compare clubs, Import data)
- Activity feed
- Goal progress widgets (premium users)
- Badge showcase

### 4. Equipment Database & Comparison
**Routes**: `/clubs`, `/clubs/[id]`, `/clubs/compare`

**Features**:
- Browse all golf clubs with filters (brand, category, price)
- Detailed product pages with full specs
- Side-by-side comparison tool (up to 3 clubs)
- Fitting match indicator (if user has completed fitting)
- Performance ratings and reviews

**Data Source**: 
- `src/data/clubDatabase.ts` (752 lines) - Pre-populated club database
- `src/data/golfBallDatabase.ts` (678 lines) - Golf ball specs and ratings

### 5. Swing Analytics (Premium Feature)
**Routes**: `/swing-analytics`, `/swing-analytics/[id]`, `/swing-data/import`

**Features**:
- **Swing DNA Radar Chart** - Multi-dimensional performance visualization
  - Club speed, ball speed, smash factor, launch angle, spin rate, distance
  - Baseline vs current vs target overlays
- **Weekly Summary** - Session-by-session progress tracking
  - Heat maps, trend lines, session comparisons
- **Manual Entry** - Form-based data input for individual shots
- **CSV Import** - Bulk import from launch monitors
  - Template: `public/swing-data-template.csv`
  - Validation via `swingDataValidation.ts`
- **Device Integration** - Connect launch monitors (Trackman, Foresight, etc.)
  - OAuth flow for device authorization
  - Automatic sync of shot data

**Subscription**:
- Stripe-powered monthly subscription ($9.99/mo)
- Checkout: `/api/create-swing-checkout`
- Management: `/api/manage-swing-subscription`
- Webhook: `/api/webhooks/stripe-swing-analytics`
- Non-subscribers see upgrade modal with feature comparison

### 6. Gamification System
**Components**: BadgeShelf, BadgeCard, BadgeNotification, GoalsList, GoalWizard, InsightsPanel

**Badge Types**:
- Milestone badges (1st fitting, 10th fitting, 100 sessions)
- Achievement badges (consistency, improvement, mastery)
- Automated award via `insightGenerator.ts`
- Toast notifications on unlock

**Goals**:
- User-defined improvement targets (e.g., "Increase club speed to 105 mph")
- Progress tracking with visual indicators
- Email reminders (via `goalEmailService.ts`)
- Completion celebrations

### 7. Admin Panel
**Routes**: `/admin/*` (admin-only)

**Modules**:
- **Users** (`/admin/users`) - User management table
  - View all users, edit profiles, change roles
  - Update subscription status manually
  - Activity log viewer
  - 1795 lines - complex data table with filters
- **Products** (`/admin/products`) - Equipment database management
  - Add/edit/delete clubs
  - Bulk import via CSV
  - Image upload via Supabase Storage
- **Fitting Rules** (`/admin/rules`) - Recommendation logic editor
  - CRUD for fitting_rules table
  - Priority ordering
  - Active/inactive toggle
- **Support Requests** (`/admin/support-requests`) - Ticket system
  - View all tickets, respond, mark resolved
  - Email notification on response
- **Sessions** (`/admin/sessions`) - View all fitting sessions
  - Analytics on completion rates
  - Export data
- **Coupons** (`/admin/coupons`) - Discount code management
  - Create promo codes
  - Usage limits and expiry dates
  - Track redemptions

### 8. Content Pages
**Routes**: `/about`, `/how-it-works`, `/faq`, `/blog`, `/testimonials`, `/contact`, `/support`, `/pricing`, `/privacy`, `/terms`

**Features**:
- Marketing content with premium design
- FAQ accordion
- Contact form (creates support_request)
- Pricing tiers explanation
- Legal documents

---

## Design System

### Color Palette (Premium Golf Luxury)
**shadcn CSS Variables** (defined in `src/styles/globals.css`):
```css
--primary: 0 0% 4% (rich black #0A0A0A)
--accent: 142 71% 45% (vibrant green #22C55E)
--gold: 43 74% 53% (luxe gold #D4AF37)
--background: 0 0% 100% (white)
--foreground: 0 0% 4% (black)
--muted: 0 0% 96% (light gray)
--card: 0 0% 100% (white)
--border: 0 0% 90% (subtle gray)
```

### Typography
- **Headings**: Inter (600, 700) - modern, confident
- **Body**: Inter (400, 500) - optimized readability
- Import from Google Fonts (already configured in globals.css)

### Component Library
- **shadcn/ui** components in `src/components/ui/`
- Fully themed with custom variants
- Key components: Button, Card, Dialog, Form inputs, Table, Tabs, Toast
- Icons: lucide-react (v0.577)

### Responsive Breakpoints
- **Primary target**: 768px (tablet)
- **Mobile**: 375px+
- **Desktop**: 1024px+
- Mobile-first Tailwind utilities (sm:, md:, lg:, xl:)

### Animation Patterns
- **Scroll-triggered**: useScrollAnimation hook for fade-in-up effects
- **Parallax**: useParallax hook for hero sections
- **Micro-interactions**: Hover states, scale transforms, color transitions
- **Page transitions**: Framer Motion for modal and route animations

---

## File Structure & Organization

### Pages (`src/pages/`)
- **Next.js Page Router** (not App Router)
- `index.tsx` - Landing page with hero, features, CTA
- `dashboard.tsx` - User dashboard
- `profile.tsx`, `profile/settings.tsx` - User profile management
- `fitting/` - Wizard and results pages
- `clubs/` - Equipment browsing and comparison
- `swing-analytics/` - Premium analytics feature
- `admin/` - Admin panel modules
- `auth/` - Login, register, password reset
- `api/` - API routes for server-side operations

### Components (`src/components/`)
- `Navigation.tsx` - Header with auth-aware menu
- `Footer.tsx` - Site footer with links
- `AppLayout.tsx`, `AppHeader.tsx`, `AppSidebar.tsx` - Dashboard layout
- `ProtectedRoute.tsx` - Auth guard wrapper
- `SEO.tsx` - Meta tags and Open Graph
- `ui/` - shadcn/ui components
- `wizard/` - Fitting wizard components
- `analytics/` - Swing analytics charts
- `gamification/` - Badges and goals
- `device-integration/` - Launch monitor connection
- `swing-data/` - Data import components

### Services (`src/services/`)
- `authService.ts` - Supabase auth wrappers
- `productService.ts` - Product CRUD operations

### Libraries (`src/lib/`)
- `utils.ts` - Tailwind class merging (cn)
- `emailService.ts` - Email notification system (357 lines)
- `goalEmailService.ts` - Goal reminder emails
- `insightGenerator.ts` - Badge award logic
- `subscriptionMiddleware.ts` - Stripe subscription helpers
- `swingDataValidation.ts` - CSV validation rules
- `supabaseAdmin.ts` - Admin client with service role key
- `deviceIntegration/` - Launch monitor SDK wrappers

### Data (`src/data/`)
- `clubDatabase.ts` - Pre-populated club specs (752 lines)
- `golfBallDatabase.ts` - Ball specs and ratings (678 lines)

### Hooks (`src/hooks/`)
- `useAuth.tsx` - Auth context consumer
- `useScrollAnimation.tsx` - Scroll-triggered animations
- `useParallax.tsx` - Parallax scroll effects
- `use-mobile.tsx` - Responsive breakpoint detection
- `use-toast.ts` - Toast notification system

---

## Integration Points

### Supabase
**Client**: `src/integrations/supabase/client.ts`
- Initialized with anon key for browser use
- Used in all client-side components
- Handles auth state, queries, mutations

**Admin Client**: `src/lib/supabaseAdmin.ts`
- Uses service role key (server-side only)
- For admin operations bypassing RLS
- Used in API routes

**Types**: `src/integrations/supabase/database.types.ts`
- Auto-generated from schema (1585 lines)
- Typed queries and mutations

**Migrations**: `supabase/migrations/`
- 30+ migration files
- Schema evolution history

**Edge Functions**: `supabase/functions/`
- `send-email/` - Email dispatch via Resend/SendGrid
- `data-retention-cleanup/` - GDPR data deletion

### Stripe
**Products**:
- Swing Analytics Subscription - $9.99/month recurring
- Product ID and price ID stored in environment variables

**Flow**:
1. User clicks "Upgrade" in app
2. API creates Stripe Checkout Session (`/api/create-swing-checkout`)
3. Redirect to Stripe hosted checkout
4. User completes payment
5. Webhook receives event (`/api/webhooks/stripe-swing-analytics`)
6. Update user's `subscription_status` and `subscription_end_date` in profiles
7. Redirect back to dashboard

**Management**: 
- Customer Portal via `/api/manage-swing-subscription`
- Users can cancel, update payment method

### Email Service
**Implementation**: `src/lib/emailService.ts` (357 lines)

**Email Types**:
- Welcome email on registration
- Fitting report download link
- Support ticket responses
- Goal reminder emails
- Badge unlock notifications
- Admin alerts

**Delivery**: Supabase Edge Function (`send-email`) with Resend or SendGrid

### Device Integration
**Supported Devices**: Trackman, Foresight GC3, FlightScope, SkyTrak

**Flow**:
1. User initiates connection in dashboard
2. OAuth authorization to device provider
3. Callback handler (`/api/device/oauth/callback`) exchanges token
4. Store credentials in Supabase
5. Sync endpoint (`/api/device/sync`) pulls shot data
6. Data validated and inserted into swing_data table

**Implementation**: `src/lib/deviceIntegration/deviceService.ts` (265 lines)

---

## API Routes (`src/pages/api/`)

### Public Endpoints
- `POST /api/generate-recommendations` - Generate fitting recommendations
- `POST /api/create-swing-checkout` - Create Stripe checkout session
- `POST /api/manage-swing-subscription` - Access customer portal
- `POST /api/webhooks/stripe-swing-analytics` - Stripe webhook handler

### Admin Endpoints (require admin auth)
- `POST /api/admin/update-user` - Modify user profiles/roles

### Device Integration
- `GET /api/device/oauth/callback` - OAuth callback handler
- `POST /api/device/sync` - Sync device data

---

## Environment Variables (.env.local)

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

## Key Business Logic

### Recommendation Algorithm
**Location**: `/api/generate-recommendations.ts` (308 lines)

**Inputs**:
- Physical measurements (height, wrist-to-floor)
- Swing characteristics (speed, tempo, ball flight)
- Skill level
- Current equipment
- Goals

**Calculations**:
1. **Club Length** - Based on wrist-to-floor and height ratio
2. **Lie Angle** - Adjusted for height and swing plane
3. **Grip Size** - Hand size proxy from wrist-to-floor
4. **Shaft Flex** - Mapped from swing speed and tempo
5. **Shaft Weight** - Matches flex and player strength
6. **Club Type** - Blade vs game improvement based on skill

**Output**: JSON object with specifications + explanations

### Golf Ball Matching
**Logic**: 
- Filter balls by swing speed range (slow <85, med 85-105, fast 105+)
- Filter by skill level (beginner = low spin, advanced = workability)
- Return top 5 rated balls matching criteria
- Include compression, spin, feel ratings

### Swing DNA Calculation
**Location**: `src/components/analytics/SwingDNARadar.tsx` (389 lines)

**Metrics**:
- Club Speed (mph)
- Ball Speed (mph)
- Smash Factor (efficiency ratio)
- Launch Angle (degrees)
- Spin Rate (rpm)
- Total Distance (yards)

**Visualization**: 
- SVG radar chart with 6 axes
- Overlay baseline, current, target values
- Color-coded performance zones (red/yellow/green)

---

## User Experience Flows

### New User Journey
1. Land on homepage → See hero with clear value prop
2. Click "Start Your Fitting" → Redirected to `/auth/register`
3. Register with email/password or Google
4. Redirected to `/dashboard` with welcome message
5. Click "New Fitting Session" → Start wizard
6. Complete 6 steps (5-10 minutes)
7. View results with recommendations
8. Download PDF report
9. Explore club comparison tool
10. (Optional) Subscribe to swing analytics

### Returning User Journey
1. Login at `/auth/login`
2. Dashboard shows previous fittings
3. Can retry wizard with updated info
4. Can compare clubs against recommendations
5. (Premium) Import swing data and track progress

### Admin Workflow
1. Login with admin account
2. Access admin panel at `/admin`
3. Monitor new user signups
4. Respond to support tickets
5. Manage product catalog
6. Review activity logs for issues
7. Update fitting rules based on feedback

---

## Performance Optimization

### Database
- Indexes on user_id, session_id, created_at for fast queries
- RLS policies optimized to avoid recursion
- Connection pooling via Supabase

### Frontend
- Next.js automatic code splitting per route
- Image optimization with next/image (when applicable)
- Lazy loading for heavy components (charts, comparison tool)
- React.memo for expensive renders
- Debounced search inputs

### Caching
- Static page generation for content pages
- SWR-like patterns for data fetching
- Browser storage for form draft saves

---

## Testing & Quality

### Type Safety
- Full TypeScript coverage
- Strict mode enabled in tsconfig.json
- Database types auto-generated from Supabase schema

### Validation
- Zod schemas for all forms
- CSV validation with detailed error messages
- API input validation at route level

### Error Handling
- React Error Boundaries on dashboard
- Try-catch in all async operations
- Toast notifications for user-facing errors
- Admin error logging to user_activity_logs

---

## Deployment

### Vercel Configuration (vercel.json)
- Environment variables injection
- API route rewrites
- Build optimization settings

### PM2 (Development)
- Process management via ecosystem.config.js
- Auto-restart on crashes
- Log aggregation in logs/ directory

### Database Migrations
- Managed via Supabase CLI
- Applied on each deploy automatically
- Rollback capability via tracked changes

---

## Security Considerations

### Authentication
- Secure password hashing via Supabase Auth
- Session tokens with automatic refresh
- OAuth state validation
- CSRF protection on forms

### Authorization
- Row Level Security on all tables
- Admin operations require explicit role check
- Service role key never exposed to client
- API routes validate user permissions

### Data Protection
- Personal data encrypted at rest (Supabase)
- No credit card storage (Stripe handles)
- Avatar uploads validated for file type/size
- SQL injection prevention via parameterized queries

### API Security
- Rate limiting on Stripe webhooks
- Webhook signature verification
- CORS restrictions
- Environment variables for secrets

---

## Future Considerations

### Planned Features (from task files)
- Multi-language support
- Mobile app (React Native)
- Video swing analysis
- AI-powered insights
- Social features (share fittings)
- Marketplace integration (buy recommended clubs)

### Scalability
- Database connection pooling configured
- CDN for static assets
- Edge Functions for global low latency
- Potential Redis caching layer

---

## Common Modification Scenarios

### Adding a New Field to Fitting Wizard
1. Update database schema (add column to fitting_sessions)
2. Run migration
3. Regenerate Supabase types
4. Add form field to appropriate step component
5. Update validation schema
6. Update recommendation algorithm if field affects output
7. Update results display template

### Adding a New Product Category
1. Add rows to products table via admin panel
2. Update clubDatabase.ts for static references
3. Add filtering option in clubs index page
4. Update comparison tool to handle new category
5. Update recommendation engine to include new category

### Modifying the Recommendation Logic
1. Edit `/api/generate-recommendations.ts`
2. Update fitting_rules table for new conditions
3. Test with various user profiles
4. Document changes in admin notes
5. Consider versioning (store algorithm version in session)

### Adding a New Admin Feature
1. Create new page in src/pages/admin/
2. Add route to AppSidebar navigation
3. Implement CRUD operations via API route
4. Apply admin-only middleware
5. Add to admin activity logging

### Integrating a New Device
1. Add device to deviceService.ts
2. Implement OAuth flow in callback handler
3. Map device data format to swing_data schema
4. Add device logo to DeviceConnectionCard
5. Test sync with sample data
6. Document setup in how-it-works page

---

## Support & Maintenance

### Monitoring
- Supabase Dashboard for database metrics
- Vercel Analytics for traffic
- Stripe Dashboard for payment health
- User activity logs for behavior tracking

### User Support Channels
- In-app support form (`/support`)
- Email via support_requests table
- Admin response system
- FAQ page for common questions

### Data Retention
- GDPR compliance via data-retention-cleanup function
- User data exportable on request
- Deletion cascade rules on user removal

---

## Conclusion

Prime Swing Fits is a feature-rich, production-ready golf club fitting platform combining professional-grade recommendation algorithms with premium UX and comprehensive analytics tools. The architecture is scalable, secure, and maintainable, with clear separation of concerns and modern best practices throughout.

For any modifications, always:
1. Review this reference document
2. Check existing implementations for patterns
3. Maintain type safety
4. Update database schema first
5. Regenerate types
6. Test auth/RLS implications
7. Update documentation

**Key Files to Reference**:
- `.softgen/project.md` - Project brief
- `src/integrations/supabase/database.types.ts` - Schema types
- `src/data/clubDatabase.ts` - Product data structure
- `/api/generate-recommendations.ts` - Core business logic
- `src/styles/globals.css` - Design tokens

**Critical Patterns**:
- Always use TypeScript
- Follow shadcn/ui component patterns
- Respect RLS policies
- Use proper Next.js Page Router conventions
- Maintain mobile-first responsive design
- Keep admin operations server-side only