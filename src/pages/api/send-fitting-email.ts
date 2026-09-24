import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, userName, sessionId, pdfBase64, recommendations } = req.body;

  if (!to || !userName || !sessionId || !pdfBase64) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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
    const { data, error } = await supabase.functions.invoke('send-email', {
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
      return res.status(500).json({ success: false, error: error.message });
    }

    await supabase
      .from('fitting_sessions')
      .update({ 
        report_emailed_at: new Date().toISOString() 
      })
      .eq('id', sessionId);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Email service error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}