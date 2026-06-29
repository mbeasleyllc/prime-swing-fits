---
title: Subscription & Monetization
status: todo
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
- [ ] Create `checkSwingAnalyticsAccess()` middleware function
- [ ] Check user tier before rendering analytics pages
- [ ] Show upgrade modal for Entry tier users
- [ ] Enforce data history limits by tier
- [ ] Block CSV import for unpaid users

### Stripe Product Setup
- [ ] Create "Swing Analytics Add-on" product in Stripe Dashboard
- [ ] Set recurring price: $12.99/month
- [ ] Create Stripe Checkout session endpoint
- [ ] Build subscription management page in settings
- [ ] Add "Cancel Subscription" button
- [ ] Implement reactivation flow

### Webhook Handler
- [ ] Create `/api/webhooks/stripe-swing-analytics` endpoint
- [ ] Handle `customer.subscription.created` event
- [ ] Handle `customer.subscription.updated` event  
- [ ] Handle `customer.subscription.deleted` event
- [ ] Update `user_swing_subscriptions` table on status change
- [ ] Send confirmation emails

### Data Retention Policy
- [ ] Create scheduled job (daily cron) to enforce limits
- [ ] Core add-on: Delete sessions older than 3 months
- [ ] Premium: Delete sessions older than 12 months
- [ ] Premium Plus: No deletion
- [ ] Email user 7 days before auto-delete
- [ ] One-click "Export All Data" to CSV before deletion

### Upgrade Flows
- [ ] Create upgrade modal component
- [ ] "Try Swing Analytics Free for 7 Days" offer for Core users
- [ ] "Upgrade to Premium" CTA for unlimited history
- [ ] Show savings comparison ($12.99/mo add-on vs $99 Premium all-inclusive)
- [ ] Proration for mid-cycle upgrades

## Acceptance
- Entry tier users see upgrade prompt immediately
- Core add-on subscription activates access within 60 seconds
- Webhooks update database correctly 100% of the time
- Data deletion respects tier limits accurately
- Export includes all user data before deletion
