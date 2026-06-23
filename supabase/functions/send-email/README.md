# Send Email Edge Function

This Supabase Edge Function sends emails using the Resend API service.

## Setup Instructions

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Link your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set the Resend API key as a secret
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### 4. Deploy the function
```bash
supabase functions deploy send-email
```

## Get a Resend API Key

1. Sign up at https://resend.com
2. Verify your sending domain (or use their test domain for development)
3. Create an API key in the Resend dashboard
4. Add the API key as a Supabase secret (see step 3 above)

## Testing the Function

You can test the function locally:

```bash
supabase functions serve send-email --env-file supabase/.env.local
```

Then send a test request:

```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello World</h1>"
  }'
```

## Alternative: Use SMTP Instead of Resend

If you prefer using SMTP (Gmail, SendGrid SMTP, etc.), replace the Resend API call with an SMTP client like:

```typescript
// Using SendGrid SMTP
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: to,
  from: 'noreply@primeswingfits.com',
  subject: subject,
  html: html,
});
```

## Email Templates

The email templates are defined in `src/lib/emailService.ts`:
- `sendFittingReportEmail()` - Sends fitting report after completion
- `sendWelcomeEmail()` - Sends welcome email to new users

## Email Logging

All sent emails are logged to the `email_logs` table in the database for tracking and debugging.