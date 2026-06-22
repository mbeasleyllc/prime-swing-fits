# ProSwing — Golf Club Fitting Application

## Vision
ProSwing is a self-guided, static golf club fitting tool that empowers golfers to receive personalized club fitting recommendations without visiting a pro shop. Built for tablet-first use (768px primary), fully responsive for mobile and desktop.

## Design
**Palette:** Deep navy (#0A1628) primary for trust and technical authority, forest green (#2E7D4F) accent representing the fairway, white backgrounds for clarity.

**shadcn tokens:**
--primary: 207 100% 10% (deep navy #0A1628)
--primary-foreground: 0 0% 100% (white)
--accent: 152 47% 34% (forest green #2E7D4F)
--accent-foreground: 0 0% 100% (white)
--background: 0 0% 100% (white)
--foreground: 207 100% 10% (deep navy)
--muted: 210 17% 95% (light gray)
--muted-foreground: 210 15% 40% (dark gray)
--card: 0 0% 100% (white)
--border: 210 20% 88% (subtle gray)

**Fonts:** 
Heading: Inter (600, 700) — geometric confidence for technical precision
Body: Inter (400, 500) — optimized for form readability

**Style direction:** Clean, sports-oriented SaaS with professional equipment precision. Generous whitespace, card-based wizard steps, prominent progress indicators.

## Features
- 6-step guided fitting wizard with validation and progress tracking
- Deterministic recommendation engine (club length, lie angle, grip, shaft flex/weight, club type)
- PDF report export with html2canvas + jsPDF
- User dashboard showing all fitting sessions
- Admin panel for managing sessions, rules, and products
- Supabase Auth with email/password + Google OAuth
- RLS-protected database with 10 tables
- Tablet-first responsive design (768px primary, 375px+ mobile, desktop)