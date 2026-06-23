# Prime Swing Fits — Golf Club Fitting Application

## Vision
Prime Swing Fits is a self-guided, static golf club fitting tool that empowers golfers to receive personalized club fitting recommendations without visiting a pro shop. Built for tablet-first use (768px primary), fully responsive for mobile and desktop.

## Design
**Palette:** Premium golf luxury — rich black (#0A0A0A) primary for sophistication, vibrant golf-course green (#22C55E) accent for energy and the game, luxe gold (#D4AF37) for premium touches.

**shadcn tokens:**
--primary: 0 0% 4% (rich black #0A0A0A)
--primary-foreground: 0 0% 100% (white)
--accent: 142 71% 45% (vibrant green #22C55E)
--accent-foreground: 0 0% 100% (white)
--gold: 43 74% 53% (luxe gold #D4AF37)
--gold-foreground: 0 0% 4% (black)
--background: 0 0% 100% (white)
--foreground: 0 0% 4% (black)
--muted: 0 0% 96% (light gray)
--muted-foreground: 0 0% 45% (medium gray)
--card: 0 0% 100% (white)
--border: 0 0% 90% (subtle gray)

**Fonts:** 
Heading: Inter (600, 700) — clean, modern confidence
Body: Inter (400, 500) — optimized readability

**Style direction:** Premium golf luxury with high-end country club sophistication. Bold black foundations, vibrant green energy, gold premium accents. Golf imagery throughout — courses, clubs, precision equipment. Rich visual hierarchy with generous spacing.

## Features
- 6-step guided fitting wizard with validation and progress tracking
- Deterministic recommendation engine (club length, lie angle, grip, shaft flex/weight, club type)
- PDF report export with html2canvas + jsPDF
- User dashboard showing all fitting sessions
- Admin panel for managing sessions, rules, and products
- Supabase Auth with email/password + Google OAuth
- RLS-protected database with 10 tables
- Tablet-first responsive design (768px primary, 375px+ mobile, desktop)