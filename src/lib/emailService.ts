import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface FittingReportEmail {
  to: string;
  userName: string;
  sessionId: string;
  recommendations: {
    clubLengthAdj: string;
    lieAngleAdj: string;
    gripSizeRec: string;
    shaftFlexRec: string;
    shaftWeight: string;
    clubTypeRec: string;
    advisoryNotes: string;
  };
}

interface FittingReportEmailWithPDF {
  to: string;
  userName: string;
  sessionId: string;
  pdfBase64: string;
  recommendations: any;
}

export async function sendFittingReportEmail(data: FittingReportEmail) {
  const { to, userName, sessionId, recommendations } = data;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Prime Swing Fits Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #0A1628;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #0A1628;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #0A1628;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #0A1628;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #2E7D4F;
    }
    .recommendation-grid {
      display: grid;
      gap: 12px;
    }
    .recommendation-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #2E7D4F;
    }
    .recommendation-label {
      font-weight: 600;
      color: #0A1628;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .recommendation-value {
      color: #4a5568;
      font-size: 16px;
    }
    .advisory-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .advisory-title {
      font-weight: 600;
      color: #856404;
      margin-bottom: 8px;
    }
    .advisory-text {
      color: #856404;
      font-size: 14px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background: #2E7D4F;
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
      text-align: center;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #2E7D4F;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prime Swing Fits</h1>
      <p>Your Personalized Golf Club Fitting Report</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${userName},
      </div>
      
      <p>Great news! Your personalized golf club fitting analysis is complete. Based on your measurements, playing style, and goals, here are your custom recommendations:</p>
      
      <div class="section">
        <div class="section-title">Your Fitting Recommendations</div>
        <div class="recommendation-grid">
          <div class="recommendation-item">
            <div class="recommendation-label">Club Length Adjustment</div>
            <div class="recommendation-value">${recommendations.clubLengthAdj}</div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-label">Lie Angle</div>
            <div class="recommendation-value">${recommendations.lieAngleAdj}</div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-label">Grip Size</div>
            <div class="recommendation-value">${recommendations.gripSizeRec}</div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-label">Shaft Flex</div>
            <div class="recommendation-value">${recommendations.shaftFlexRec}</div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-label">Shaft Weight</div>
            <div class="recommendation-value">${recommendations.shaftWeight}</div>
          </div>
          <div class="recommendation-item">
            <div class="recommendation-label">Club Type</div>
            <div class="recommendation-value">${recommendations.clubTypeRec}</div>
          </div>
        </div>
        
        ${recommendations.advisoryNotes ? `
        <div class="advisory-box">
          <div class="advisory-title">⚠️ Important Advisory Notes</div>
          <div class="advisory-text">${recommendations.advisoryNotes}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="section">
        <p>Ready to see your full detailed report with product recommendations?</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://primeswingfits.softgen.ai'}/fitting/${sessionId}/results" class="cta-button">
          View Full Report & Recommendations
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
        This report is based on the information you provided during your fitting session. For the most accurate results, we recommend getting professionally fitted at your local pro shop with these recommendations as a starting point.
      </p>
    </div>
    
    <div class="footer">
      <p>
        <strong>Prime Swing Fits</strong><br>
        Professional Golf Club Fitting, Simplified<br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://primeswingfits.softgen.ai'}">primeswingfits.softgen.ai</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent because you completed a fitting session at Prime Swing Fits.<br>
        Questions? Contact us at support@primeswingfits.com
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    // Send email via Supabase Edge Function
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject: `Your Prime Swing Fits Report is Ready, ${userName}!`,
        html: htmlContent,
      },
    });

    // Log email send attempt to database
    await supabase.from('email_logs').insert({
      email_type: 'fitting_report',
      recipient_email: to,
      subject: `Your Prime Swing Fits Report is Ready, ${userName}!`,
      status: error ? 'failed' : 'sent',
      error_message: error ? JSON.stringify(error) : null,
      session_id: sessionId,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Email service error:', error);
    
    // Log failed attempt
    try {
      await supabase.from('email_logs').insert({
        email_type: 'fitting_report',
        recipient_email: to,
        subject: `Your Prime Swing Fits Report is Ready, ${userName}!`,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        session_id: sessionId,
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }
    
    return { success: false, error };
  }
}

export async function sendFittingReportWithPDF(data: FittingReportEmailWithPDF) {
  const { to, userName, sessionId, pdfBase64, recommendations } = data;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Prime Swing Fits Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #0A1628;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: #0A1628;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #0A1628;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #0A1628;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #22C55E;
    }
    .highlight-box {
      background: #f0fdf4;
      border-left: 4px solid #22C55E;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .highlight-text {
      font-size: 16px;
      color: #0A1628;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background: #22C55E;
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
      text-align: center;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #22C55E;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prime Swing Fits</h1>
      <p>Your Personalized Golf Club Fitting Report</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${userName},
      </div>
      
      <p>Great news! Your personalized golf club fitting analysis is complete. Your detailed report is attached to this email as a PDF.</p>
      
      <div class="highlight-box">
        <p class="highlight-text">
          📎 <strong>Your fitting report PDF is attached</strong><br>
          Open the attachment to see your complete recommendations for driver, woods, hybrids, irons, wedges, and putter.
        </p>
      </div>
      
      <div class="section">
        <div class="section-title">What's Inside Your Report</div>
        <ul style="color: #4a5568; line-height: 1.8;">
          <li>Personalized specs for every club in your bag</li>
          <li>Recommended shaft flex, length, lie angle, and grip size</li>
          <li>Plain-English explanations for each recommendation</li>
          <li>Top matching products from leading brands</li>
          <li>Golf ball recommendations matched to your swing</li>
        </ul>
      </div>
      
      <div class="section">
        <p>You can also view your report online anytime:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://primeswingfits.softgen.ai'}/fitting/${sessionId}/results" class="cta-button">
          View Online Report
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
        <strong>Pro Tip:</strong> Take this report to your local pro shop or club fitter. They can use these recommendations as a starting point to fine-tune your perfect setup with hands-on testing.
      </p>
    </div>
    
    <div class="footer">
      <p>
        <strong>Prime Swing Fits</strong><br>
        Professional Golf Club Fitting, Simplified<br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://primeswingfits.softgen.ai'}">primeswingfits.softgen.ai</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent because you completed a fitting session at Prime Swing Fits.<br>
        Questions? Contact us at support@primeswingfits.com
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    // Send email via Supabase Edge Function with PDF attachment
    const { data: responseData, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject: `Your Prime Swing Fits Report is Ready, ${userName}!`,
        html: htmlContent,
        attachments: [
          {
            filename: `PrimeSwingFits-Report-${sessionId}.pdf`,
            content: pdfBase64,
            type: 'application/pdf',
            disposition: 'attachment',
          }
        ],
      },
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    // Update fitting session with email sent timestamp
    await supabase
      .from('fitting_sessions')
      .update({ 
        report_emailed_at: new Date().toISOString() 
      })
      .eq('id', sessionId);

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(to: string, userName: string) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #0A1628;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #0A1628;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .cta-button {
      display: inline-block;
      background: #2E7D4F;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Prime Swing Fits!</h1>
    </div>
    <div class="content">
      <h2>Hi ${userName},</h2>
      <p>Welcome to Prime Swing Fits! We're excited to help you find your perfect golf club setup.</p>
      <p>Getting started is easy:</p>
      <ol>
        <li>Complete our 6-step fitting wizard (takes about 5 minutes)</li>
        <li>Get your personalized club recommendations</li>
        <li>Download your detailed PDF report</li>
      </ol>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://primeswingfits.softgen.ai'}/fitting/new" class="cta-button">
        Start Your Fitting
      </a>
      <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
        Questions? Reply to this email or visit our help center.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject: 'Welcome to Prime Swing Fits!',
        html: htmlContent,
      },
    });

    if (error) {
      console.error('Welcome email send error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Welcome email service error:', error);
    return { success: false, error };
  }
}