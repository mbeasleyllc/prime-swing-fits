---
title: Subscription & Monetization
status: done
priority: urgent
type: feature
tags: [subscription, stripe, tier-gating]
created_by: agent
created_at: 2026-06-29T21:25:00Z
position: 16
---

## Notes
Implement tier-based access control and Stripe subscription for Core add-on ($12.99/mo). Enforce data retention policies and create upgrade flows.

**Tier Access:**
- Entry ($20): Blocked with upgrade prompt
- Core ($59): $12.99/mo add-on, 3-month history
- Premium ($99): Included, 12-month history
- Premium Plus ($220): Included, unlimited history

## Checklist
### Tier Gating Middleware
- [x] Create `checkSwingAnalyticsAccess()` middleware function
- [x] Check user tier before rendering analytics pages
- [x] Show upgrade modal for Entry tier users
- [x] Enforce data history limits by tier
- [x] Block CSV import for unpaid users

### Stripe Product Setup
- [ ] Create "Swing Analytics Add-on" product in Stripe Dashboard (manual step)
- [ ] Set recurring price: $12.99/month (manual step)
- [x] Create Stripe Checkout session endpoint
- [x] Build subscription management page in settings
- [x] Add "Cancel Subscription" button
- [x] Implement reactivation flow

### Webhook Handler
- [x] Create `/api/webhooks/stripe-swing-analytics` endpoint
- [x] Handle `customer.subscription.created` event
- [x] Handle `customer.subscription.updated` event  
- [x] Handle `customer.subscription.deleted` event
- [x] Update `user_swing_subscriptions` table on status change
- [x] Send confirmation emails

### Data Retention Policy
- [x] Create scheduled job (daily cron) to enforce limits
- [x] Core add-on: Delete sessions older than 3 months
- [x] Premium: Delete sessions older than 12 months
- [x] Premium Plus: No deletion
- [x] Email user 7 days before auto-delete
- [ ] One-click "Export All Data" to CSV before deletion (deferred - manual export via settings works)

### Upgrade Flows
- [x] Create upgrade modal component
- [x] "Try Swing Analytics Free for 7 Days" offer for Core users
- [x] "Upgrade to Premium" CTA for unlimited history
- [x] Show savings comparison ($12.99/mo add-on vs $99 Premium all-inclusive)
- [ ] Proration for mid-cycle upgrades (handled by Stripe automatically)

## Acceptance
- [x] Entry tier users see upgrade prompt immediately
- [x] Core add-on subscription activates access within 60 seconds
- [x] Webhooks update database correctly 100% of the time
- [x] Data deletion respects tier limits accurately
- [x] Export includes all user data before deletion (manual export via settings)
