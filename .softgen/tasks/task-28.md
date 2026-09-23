---
title: Email Fitting Report PDF
status: in_progress
priority: high
type: feature
tags: [email, pdf, results]
created_by: agent
created_at: 2026-09-23T00:38:00Z
position: 5
---

## Notes
Add feature to send the generated fitting report PDF via email upon completion. Use existing email infrastructure (emailService.ts and send-email Edge Function).

## Checklist
- [ ] Review existing email service implementation
- [ ] Create PDF email template with branding
- [ ] Add email sending function to results page
- [ ] Add "Email Report" button to results page
- [ ] Handle PDF generation and base64 encoding
- [ ] Send email with PDF attachment via Edge Function
- [ ] Add success/error toast notifications
- [ ] Store email send status in fitting_sessions

## Acceptance
- Users can email their fitting report PDF
- Email includes branded template with PDF attachment
- Success/error feedback provided
- Email delivery logged