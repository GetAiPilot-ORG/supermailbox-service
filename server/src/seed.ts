import { supabase } from './supabase.js';

const DEMO_TEMPLATES = [
  {
    key: 'payment_success',
    name: 'Payment Receipt / Success Notice',
    category: 'transactional',
    versions: [
      {
        version_number: 3,
        status: 'live',
        created_by: 'Tanishq (DevOps)',
        subject: 'Receipt for your SupermailBox payment ({{invoice_id}})',
        html_source: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e10; color: #e5e1e4; padding: 40px; border-radius: 16px; border: 1px solid #2a2a2c;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 999px; font-weight: bold; font-size: 18px; letter-spacing: -0.5px;">⚡ SupermailBox</div>
  </div>
  <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Payment Confirmed</h2>
  <p style="color: #c7c4d7; font-size: 16px; line-height: 1.6;">Hi <strong>{{name}}</strong>,</p>
  <p style="color: #c7c4d7; font-size: 16px; line-height: 1.6;">We have successfully processed your payment of <strong style="color: #4edea3;">{{amount}}</strong> for invoice <code style="background: #201f21; padding: 2px 8px; border-radius: 4px; color: #c0c1ff;">{{invoice_id}}</code>.</p>
  <div style="background: #1c1b1d; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #6366f1;">
    <p style="margin: 0; font-size: 14px; color: #908fa0;">Current Wallet Balance:</p>
    <p style="margin: 4px 0 0; font-size: 22px; font-weight: bold; color: #ffffff;">{{wallet_balance}}</p>
  </div>
  <p style="color: #908fa0; font-size: 13px; text-align: center; margin-top: 40px; border-top: 1px solid #201f21; padding-top: 20px;">Sent via SupermailBox CPaaS Infrastructure &bull; Metabull Universe</p>
</div>`
      }
    ]
  },
  {
    key: 'otp_login',
    name: 'Two-Factor Authentication / Login OTP',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Security Bot',
        subject: 'Your authentication code is {{otp_code}}',
        html_source: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #131315; color: #e5e1e4; padding: 40px; border-radius: 20px; border: 1px solid #353437; text-align: center;">
  <h2 style="color: #ffffff; font-size: 22px;">Verification Required</h2>
  <p style="color: #c7c4d7; font-size: 15px;">Hello {{name}}, enter the code below to complete your login attempt:</p>
  <div style="background: #201f21; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #464554;">
    <span style="font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: bold; color: #a855f7; letter-spacing: 6px;">{{otp_code}}</span>
  </div>
  <p style="color: #ffb4ab; font-size: 13px;">⚠️ This code expires in <strong>{{expires_in}}</strong>. Never share this code with anyone.</p>
</div>`
      }
    ]
  },
  {
    key: 'welcome_email',
    name: 'Developer Onboarding Welcome Blast',
    category: 'marketing',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Elena Rostova',
        subject: 'Welcome to SupermailBox CPaaS Infrastructure, {{name}}! 🚀',
        html_source: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0c; color: #e5e1e4; padding: 40px; border-radius: 16px; border: 1px solid #6366f1;">
  <h1 style="color: #ffffff; font-size: 28px;">Welcome aboard, {{name}}!</h1>
  <p style="color: #c7c4d7; font-size: 16px;">You are now enrolled in the <strong style="color: #6ffbbe;">{{plan}}</strong> tier. You have full access to our global transactional email routing engines and 99.99% SLA queues.</p>
  <div style="margin: 32px 0; text-align: center;">
    <a href="{{setup_url}}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Developer Console &rarr;</a>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'getaipilot_verify_account',
    name: 'GetAiPilot Account Verification',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Admin',
        subject: 'Verify your GetAiPilot Account',
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GetAiPilot Email Template</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  </style>
</head>

<body style="background-color:#f3f4f6; margin:0; padding:10px 16px; font-family: 'Outfit', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- PRE-HEADER (seen in inbox preview, hidden in the email body) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#ffffff;line-height:1px;">
    Don't miss out — verify your GetAiPilot account now!
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px 0;">

        <div style="width:100%; max-width:480px; background-color:#ffffff; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); overflow:hidden; margin:0 auto; text-align:left; box-sizing:border-box;">

          <!-- Logo -->
          <div style="padding:16px 0; text-align:center; box-sizing:border-box;">
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle; padding-right:8px;">
                  <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height:28px; display:block;" alt="GetAiPilot Logo">
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-weight:bold; color:#1f2937; font-size:22px;">getaipilot</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Hero -->
          <div style="margin:0; overflow:hidden; background: linear-gradient(to bottom right, #10183f, #1b2360, #8b3cff); color:#ffffff; padding:24px 20px; min-height:160px; position:relative; box-sizing:border-box;">

            <p style="font-size:16px; margin:0 0 4px 0; color:rgba(255,255,255,0.8);">Hi there,</p>

            <h1 style="font-size:28px; font-weight:bold; line-height:1.2; margin:0;">
              Your account is <br />
              almost <span style="color:#d8b4fe;">ready!</span>
            </h1>

            <p style="margin:8px 0 0 0; font-size:16px; color:rgba(255,255,255,0.8); max-width:210px; line-height:1.2;">
              Just one quick step left before you can start using GetAiPilot.
            </p>

            <!-- Paper plane -->
            <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/34.png" alt="Paper plane" style="position:absolute; top:12px; right:12px; width:24px;" >

            <!-- Envelope Card -->
            <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/10.png" style="position:absolute; right:8px; bottom:8px; width:140px; height:120px; border-radius:16px; transform:rotate(-8deg); box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);" >

          </div>

          <!-- Content -->
          <div style="padding:24px 16px 12px 16px; box-sizing:border-box;">
            <h2 style="text-align:center; font-weight:bold; color:#1f2937; margin:0 0 16px 0; font-size:16px;">
              Here's why verifying matters:
            </h2>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td style="width:48px; vertical-align:top;">
                  <div style="width:32px; height:32px; border-radius:12px; background-color:#f3e8ff; text-align:center; line-height:32px; box-sizing:border-box;">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/16.png" style="width:100%; height:100%; object-fit:contain; display:block;">
                  </div>
                </td>
                <td style="vertical-align:top; padding-top:4px;">
                  <h3 style="font-weight:bold; color:#1f2937; font-size:16px; margin:0;">Unlock full access</h3>
                  <p style="font-size:14px; color:#6b7280; margin:2px 0 0 0; line-height:1.2;">
                    Verifying your email unlocks every feature GetAiPilot has to offer.
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td style="width:48px; vertical-align:top;">
                  <div style="width:32px; height:32px; border-radius:12px; background-color:#f3e8ff; text-align:center; padding:6px; box-sizing:border-box;">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/34.png" style="width:100%; height:100%; object-fit:contain; display:block;">
                  </div>
                </td>
                <td style="vertical-align:top; padding-top:4px;">
                  <h3 style="font-weight:bold; color:#1f2937; font-size:16px; margin:0;">Keep your account secure</h3>
                  <p style="font-size:14px; color:#6b7280; margin:2px 0 0 0; line-height:1.2;">
                    Verification helps us keep your data safe and your account protected.
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="width:48px; vertical-align:top;">
                  <div style="width:32px; height:32px; border-radius:12px; background-color:#f3e8ff; text-align:center; line-height:24px;  box-sizing:border-box;">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/32.png" style="width:100%; height:100%; object-fit:contain; display:block;">
                  </div>
                </td>
                <td style="vertical-align:top; padding-top:4px;">
                  <h3 style="font-weight:bold; color:#1f2937; font-size:16px; margin:0;">It only takes a second</h3>
                  <p style="font-size:14px; color:#6b7280; margin:2px 0 0 0; line-height:1.2;">
                    One click is all it takes to confirm your account and get started.
                  </p>
                </td>
              </tr>
            </table>

          </div>

          <!-- CTA -->
          <div style="margin:0 16px 24px 16px; padding:24px 0 12px 0; border-top:1px solid #f3f4f6; box-sizing:border-box; display:flex; align-items:center; gap:20px;">
            <div style="flex:0 0 180px; width:180px; overflow:hidden; box-sizing:border-box;">
              <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/8.png" style="width:100%; height:auto; object-fit:contain; display:block;">
            </div>

            <div style="flex:1; text-align:left;">
              <h3 style="font-weight:bold; color:#1f2937; font-size:22px; margin:0;">Don't miss out!</h3>
              <p style="font-size:16px; color:#6b7280; margin:8px 0 20px 0; line-height:1.4;">
                Verify your account now to start exploring everything GetAiPilot has to offer.
              </p>

              <a href="{{ .ConfirmationURL }}" style="display:inline-block; background: linear-gradient(to right, #f43f5e, #8b5cf6); color:#ffffff; font-size:16px; font-weight:bold; padding:12px 24px; border-radius:8px; text-decoration:none; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); box-sizing:border-box;">
                Verify My Account &rarr;
              </a>
            </div>
          </div>

          <!-- Help -->
          <div style="margin:0 16px 16px 16px; background-color:#faf5ff; border-radius:12px; padding:16px; box-sizing:border-box;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:24px; vertical-align:top; padding-top:2px;">
                  <svg style="width:20px; height:20px; color:#8b5cf6;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </td>
                <td style="vertical-align:top; padding-left:12px;">
                  <h3 style="font-weight:bold; color:#1f2937; font-size:15px; margin:0;">Trouble verifying your account?</h3>
                  <p style="font-size:14px; color:#6b7280; margin:4px 0 0 0; line-height:1.4;">
                    Check out our <a href="#" style="color:#8b5cf6; text-decoration:none;">Help Center</a> or reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Fallback link -->
          <div style="margin:0 16px 12px 16px; padding:0 8px; text-align:center; box-sizing:border-box;">
            <p style="font-size:13px; color:#9ca3af; line-height:1.4; margin:0;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="{{ .ConfirmationURL }}" style="color:#8b5cf6; word-break:break-all;">{{ .ConfirmationURL }}</a>
            </p>
          </div>

        </div>

        <!-- Outside Footer -->
        <div style="width:100%; max-width:400px; margin:24px auto 0 auto; text-align:center; box-sizing:border-box;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
            <tr>
              <td style="text-align:left; vertical-align:middle;">
                <!-- Social Icons -->
                <a href="#" style="display:inline-block; margin-right:12px; text-decoration:none;">
                  <div style="width:48px; height:48px; background-color:#ffffff; border-radius:12px; display:inline-block; text-align:center; line-height:48px; box-shadow:0 2px 5px rgba(0,0,0,0.08);">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/22.png" alt="Twitter" style="width:38px; height:38px; vertical-align:middle; display:inline-block;">
                  </div>
                </a>
                <a href="#" style="display:inline-block; margin-right:12px; text-decoration:none;">
                  <div style="width:48px; height:48px; background-color:#ffffff; border-radius:12px; display:inline-block; text-align:center; line-height:48px; box-shadow:0 2px 5px rgba(0,0,0,0.08);">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/23.png" alt="LinkedIn" style="width:38px; height:38px; vertical-align:middle; display:inline-block;">
                  </div>
                </a>
                <a href="#" style="display:inline-block; text-decoration:none;">
                  <div style="width:48px; height:48px; background-color:#ffffff; border-radius:12px; display:inline-block; text-align:center; line-height:48px; box-shadow:0 2px 5px rgba(0,0,0,0.08);">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/24.png" alt="Instagram" style="width:38px; height:38px; vertical-align:middle; display:inline-block;">
                  </div>
                </a>
              </td>
              <td style="text-align:right; vertical-align:middle; font-size:13px; color:#6b7280;">
                Made with <span style="color:#8b5cf6;">&hearts;</span> by GetAiPilot team
              </td>
            </tr>
          </table>

          <p style="font-size:13px; color:#9ca3af; margin:0 0 4px 0; line-height:1.4;">
            You're receiving this email because you signed up for GetAiPilot and haven't verified your account yet.<br>
            If you didn't sign up for this, you can safely ignore this email.
          </p>
          <p style="font-size:13px; color:#9ca3af; margin:0;">
            &copy; 2026 GetAiPilot. All rights reserved.
          </p>

        </div>

      </td>
    </tr>
  </table>
</body>
</html>`
      }
    ]
  },
  {
    key: 'broadcast_success',
    name: 'GAP WhatsApp Broadcast Published Success',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GAP WhatsApp Engine',
        subject: 'WhatsApp Campaign Published: {{campaign_name}} 🚀',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #075e54 0%, #128c7e 50%, #10b981 100%); padding: 32px 28px; color: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="https://wb.getaipilot.in/logo.png" alt="GAP WhatsApp Logo" style="height: 32px; width: 32px; border-radius: 8px; background: #ffffff; padding: 4px; display: block;" onerror="this.style.display='none'">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">GAP <span style="color: #6ee7b7; font-weight: 400;">WhatsApp Automation</span></span>
        </div>
        <span style="background: rgba(52, 211, 153, 0.25); border: 1px solid rgba(52, 211, 153, 0.5); color: #a7f3d0; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 999px; letter-spacing: 0.05em; text-transform: uppercase;">💬 DELIVERED</span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #ffffff;">Hey {{full_name}}, your WhatsApp broadcast is live! 🚀</h1>
      <p style="font-size: 14px; color: #dcfce7; margin: 0;">Your campaign <strong>{{campaign_name}}</strong> was successfully dispatched to all target contacts.</p>
    </div>
    <div style="padding: 28px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
          <span style="font-size: 13px; font-weight: 700; color: #334155;">WhatsApp Delivery Channel</span>
          <span style="font-size: 12px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 3px 10px; border-radius: 20px;">Meta Cloud API</span>
        </div>
        <p style="font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0; background: #f0fdf4; padding: 14px; border-radius: 8px; border-left: 3px solid #22c55e;">
          Campaign <strong>"{{campaign_name}}"</strong> completed execution cleanly. All message queues have been processed.
        </p>
      </div>
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://wb.getaipilot.in/broadcasts" style="display: inline-block; background: linear-gradient(135deg, #128c7e 0%, #075e54 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(18, 140, 126, 0.35);">
          View Campaign Reports & Performance &rarr;
        </a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent to admin via <strong>GAP WhatsApp Automation Engine</strong> &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'broadcast_failed',
    name: 'GAP WhatsApp Broadcast Execution Failed Alert',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GAP WhatsApp Engine',
        subject: '⚠️ Alert: WhatsApp Broadcast Failed - {{campaign_name}}',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%); padding: 32px 28px; color: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="https://wb.getaipilot.in/logo.png" alt="GAP WhatsApp Logo" style="height: 32px; width: 32px; border-radius: 8px; background: #ffffff; padding: 4px; display: block;" onerror="this.style.display='none'">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">GAP <span style="color: #fca5a5; font-weight: 400;">WhatsApp Engine</span></span>
        </div>
        <span style="background: rgba(254, 226, 226, 0.25); border: 1px solid rgba(254, 226, 226, 0.5); color: #fecaca; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 999px; letter-spacing: 0.05em; text-transform: uppercase;">⚠️ FAILED</span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #ffffff;">Broadcast Attention Required</h1>
      <p style="font-size: 14px; color: #fee2e2; margin: 0;">Hey {{full_name}}, campaign <strong>{{campaign_name}}</strong> encountered an issue during execution.</p>
    </div>
    <div style="padding: 28px;">
      <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <span style="font-size: 12px; font-weight: 700; color: #9f1239; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Error Diagnostic Details</span>
        <p style="font-size: 14px; color: #881337; font-family: monospace; line-height: 1.5; margin: 0; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #ffe4e6;">
          {{error_message}}
        </p>
      </div>
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://wb.getaipilot.in/broadcasts" style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
          Troubleshoot Campaign & Retry &rarr;
        </a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent via <strong>GAP WhatsApp Automation Engine</strong> &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'team_invite',
    name: 'GAP WhatsApp Team Member Invitation',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GAP WhatsApp Engine',
        subject: 'You are invited to join GAP WhatsApp Automation as {{role}}',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
      <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 8px 18px; border-radius: 999px; margin-bottom: 20px;">
        <img src="https://wb.getaipilot.in/logo.png" alt="WhatsApp Logo" style="height: 24px; width: 24px; border-radius: 6px; background: #ffffff; padding: 2px;" onerror="this.style.display='none'">
        <span style="font-size: 15px; font-weight: 800; color: #ffffff;">GAP <span style="color: #dcfce7; font-weight: 400;">WhatsApp Team</span></span>
      </div>
      <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 10px 0; color: #ffffff;">Team Invitation for {{full_name}}! 🎉</h1>
      <p style="font-size: 15px; color: #dcfce7; margin: 0; max-width: 480px; margin: 0 auto;">You have been invited to join the WhatsApp Automation workspace as an official <strong>{{role}}</strong>.</p>
    </div>
    <div style="padding: 32px 28px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0;">Your Account Credentials:</h3>
        <div style="display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 12px;">
          <span style="font-size: 13px; color: #64748b;">Assigned Role:</span>
          <strong style="font-size: 14px; color: #128c7e;">{{role}}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 12px;">
          <span style="font-size: 13px; color: #64748b;">Temporary Password:</span>
          <code style="font-size: 14px; color: #0f172a; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">{{password}}</code>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 13px; color: #64748b;">Invitation Expires:</span>
          <span style="font-size: 13px; color: #ef4444; font-weight: 600;">{{expires_at}}</span>
        </div>
      </div>
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="{{invite_link}}" style="display: inline-block; background: linear-gradient(135deg, #128c7e 0%, #075e54 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(18, 140, 126, 0.35);">
          Accept Invitation & Sign In &rarr;
        </a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">GAP WhatsApp Automation &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'gap_whatsapp_welcome',
    name: 'GAP WhatsApp Onboarding Alert',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GAP_WHATSAPP Bot',
        subject: 'Welcome to GetAiPilot on WhatsApp!',
        html_source: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #075e54; color: #ffffff; padding: 24px; border-radius: 16px;">
  <h3 style="margin-top: 0; color: #25d366;">💬 GetAiPilot WhatsApp Alert</h3>
  <p>Hi <strong>{{name}}</strong>, welcome to GetAiPilot on WhatsApp! 🚀</p>
  <p style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">Your account setup is complete. Reply <strong>START</strong> to receive real-time autonomous alerts and updates directly on WhatsApp.</p>
  <p style="font-size: 12px; opacity: 0.8; margin-bottom: 0;">Sent via GAP_WHATSAPP &bull; Metabull CPaaS</p>
</div>`
      }
    ]
  },
  {
    key: 'gap_whatsapp_otp',
    name: 'GAP WhatsApp OTP Security Code',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GAP_WHATSAPP Bot',
        subject: 'Your WhatsApp Security Code: {{otp_code}}',
        html_source: `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #128c7e; color: #ffffff; padding: 24px; border-radius: 16px; text-align: center;">
  <h3 style="margin-top: 0; color: #25d366;">🔒 WhatsApp Authentication Code</h3>
  <p>Hello {{name}}, your security code for GetAiPilot WhatsApp login is:</p>
  <div style="background: #075e54; padding: 16px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 16px 0; color: #25d366;">
    {{otp_code}}
  </div>
  <p style="font-size: 13px; opacity: 0.9;">Code valid for 10 minutes. Do not share this code.</p>
</div>`
      }
    ]
  },
  {
    key: 'account_connected',
    name: 'SocialPilot Social Account Connected',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'SocialPilot Engine',
        subject: 'New Social Account Connected: {{platform}}',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 32px 28px; color: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="https://social.getaipilot.in/logo.png" alt="SocialPilot Logo" style="height: 28px; width: 28px; border-radius: 6px; background: #ffffff; padding: 2px;" onerror="this.style.display='none'">
          <span style="font-size: 18px; font-weight: 800; color: #ffffff;">SocialPilot</span>
        </div>
        <span style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 999px;">✓ CONNECTED</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">New Channel Connected! 🔗</h1>
      <p style="font-size: 14px; color: #c7d2fe; margin: 0;">Hey {{name}}, your <strong>{{platform}}</strong> account is ready to publish.</p>
    </div>
    <div style="padding: 28px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 15px; color: #1e293b; margin: 0 0 12px 0;">You can now schedule posts, auto-publish campaigns, and track analytics for <strong>{{platform}}</strong>.</p>
        <span style="display: inline-block; background: #e0e7ff; color: #3730a3; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px;">Channel Status: Active</span>
      </div>
      <div style="text-align: center;">
        <a href="https://social.getaipilot.in/accounts" style="display: inline-block; background: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">View All Connected Accounts &rarr;</a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">SocialPilot Engine &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'auth_welcome',
    name: 'SocialPilot Auth Welcome',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'SocialPilot Auth',
        subject: 'Welcome to QuickPost! 🚀',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
      <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.1); padding: 8px 18px; border-radius: 999px; margin-bottom: 20px;">
        <img src="https://social.getaipilot.in/logo.png" alt="SocialPilot Logo" style="height: 24px; width: 24px; border-radius: 6px; background: #ffffff; padding: 2px;" onerror="this.style.display='none'">
        <span style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">SocialPilot <span style="color: #a5b4fc; font-weight: 400;">QuickPost</span></span>
      </div>
      <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 10px 0; color: #ffffff;">Welcome Aboard, {{name}}! 🎉</h1>
      <p style="font-size: 15px; color: #c7d2fe; margin: 0; max-width: 480px; margin: 0 auto;">Your social broadcasting superpower is ready. Start publishing, scheduling, and automating post campaigns in seconds.</p>
    </div>
    <div style="padding: 32px 28px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0;">What you can do right now:</h3>
        <div style="display: flex; gap: 12px; margin-bottom: 14px;">
          <div style="background: #e0e7ff; color: #4338ca; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0; line-height: 28px; text-align: center;">1</div>
          <div>
            <strong style="font-size: 14px; color: #1e293b;">Connect Social Accounts</strong>
            <p style="font-size: 13px; color: #64748b; margin: 2px 0 0 0;">Link Instagram, LinkedIn, Twitter/X, and Facebook in one click.</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 14px;">
          <div style="background: #e0e7ff; color: #4338ca; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0; line-height: 28px; text-align: center;">2</div>
          <div>
            <strong style="font-size: 14px; color: #1e293b;">Create & Schedule Campaigns</strong>
            <p style="font-size: 13px; color: #64748b; margin: 2px 0 0 0;">Draft posts with AI assistance and schedule multi-channel blasts.</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="background: #e0e7ff; color: #4338ca; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0; line-height: 28px; text-align: center;">3</div>
          <div>
            <strong style="font-size: 14px; color: #1e293b;">Enable AutoDM Automations</strong>
            <p style="font-size: 13px; color: #64748b; margin: 2px 0 0 0;">Automatically send DMs to users who comment on your posts.</p>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://social.getaipilot.in/dashboard" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
          Launch SocialPilot Dashboard &rarr;
        </a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Account Status: <strong style="color: #10b981;">✓ {{otp_code}}</strong> &bull; SuperMailBox Infrastructure</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'automation_created',
    name: 'SocialPilot AutoDM Automation Created',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'SocialPilot AutoDM',
        subject: 'AutoDM Automation Active: {{automation_name}} ⚡',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 28px; color: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="https://social.getaipilot.in/logo.png" alt="SocialPilot Logo" style="height: 28px; width: 28px; border-radius: 6px; background: #ffffff; padding: 2px;" onerror="this.style.display='none'">
          <span style="font-size: 18px; font-weight: 800; color: #ffffff;">AutoDM <span style="color: #a7f3d0; font-weight: 400;">Automation</span></span>
        </div>
        <span style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 999px;">⚡ ACTIVE</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">New AutoDM Engine Configured!</h1>
      <p style="font-size: 14px; color: #cbd5e1; margin: 0;">Your automation rule <strong>{{automation_name}}</strong> is now active and responding to triggers.</p>
    </div>
    <div style="padding: 28px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 12px;">
          <span style="font-size: 13px; color: #64748b;">Automation Rule:</span>
          <strong style="font-size: 14px; color: #1e293b;">{{automation_name}}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 13px; color: #64748b;">Trigger Condition:</span>
          <strong style="font-size: 14px; color: #4f46e5;">{{trigger_type}}</strong>
        </div>
      </div>
      <div style="text-align: center; margin-top: 28px;">
        <a href="https://social.getaipilot.in/autodm" style="display: inline-block; background: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">Manage AutoDM Automations &rarr;</a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">SocialPilot AutoDM Engine &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'broadcast_notification',
    name: 'SocialPilot Broadcast Published Notification',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'QuickPost Broadcast',
        subject: 'Post Published: {{campaign_name}}',
        html_source: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
  <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%); padding: 32px 28px; color: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="https://social.getaipilot.in/logo.png" alt="SocialPilot Logo" style="height: 32px; width: 32px; border-radius: 8px; background: #ffffff; padding: 4px; display: block;" onerror="this.style.display='none'">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">SocialPilot <span style="color: #818cf8; font-weight: 400;">QuickPost</span></span>
        </div>
        <span style="background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); color: #34d399; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 999px; letter-spacing: 0.05em; text-transform: uppercase;">✓ PUBLISHED</span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #ffffff;">Hey {{full_name}}, your post is live! 🚀</h1>
      <p style="font-size: 14px; color: #c7d2fe; margin: 0;">Your broadcast campaign <strong>{{campaign_name}}</strong> was successfully published across your connected channels.</p>
    </div>
    <div style="padding: 28px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 12px;">Target Channels</span>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="background: linear-gradient(135deg, #e1306c, #fd1d1d, #f56040); color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">📸 Instagram</span>
          <span style="background: #0a66c2; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">💼 LinkedIn</span>
          <span style="background: #000000; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">𝕏 Twitter</span>
          <span style="background: #1877f2; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">📘 Facebook</span>
        </div>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
          <span style="font-size: 13px; font-weight: 700; color: #334155;">Post Caption Preview</span>
          <span style="font-size: 12px; color: #94a3b8;">{{platforms}}</span>
        </div>
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0; font-style: italic; background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 3px solid #6366f1;">
          "{{caption}}"
        </p>
      </div>
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://social.getaipilot.in/broadcasts" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
          View Analytics & Post Performance &rarr;
        </a>
      </div>
    </div>
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent to {{email}} via <strong>SocialPilot Broadcast Engine</strong> &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'getaipilot_welcome',
    name: 'GetAiPilot Platform Welcome',
    category: 'marketing',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GetAiPilot Team',
        subject: 'Welcome to GetAiPilot Autonomous Platform! 🚀',
        html_source: `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto; font-family: 'Host Grotesk', sans-serif;">
  <div style="text-align: center; margin-bottom: 22px;">
    <span style="background: #2357D8; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">GETAIPILOT CORE</span>
  </div>
  <h1 style="color: #252722; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">Welcome Aboard! 🎉</h1>
  <p style="color: #676D63; font-size: 15px; line-height: 1.6; text-align: center;">Your GetAiPilot account is active and ready to deploy autonomous agents and workflows.</p>
</div>`
      }
    ]
  },
  {
    key: 'getaipilot_feature_announce',
    name: 'GetAiPilot Feature Announcement',
    category: 'marketing',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Product Team',
        subject: 'Exciting New Features Released on GetAiPilot! ✨',
        html_source: `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto; font-family: 'Host Grotesk', sans-serif;">
  <div style="text-align: center; margin-bottom: 22px;">
    <span style="background: #0D4F3C; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">PRODUCT UPDATE</span>
  </div>
  <h1 style="color: #252722; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">New Autonomous Features Live 🚀</h1>
  <p style="color: #676D63; font-size: 15px; line-height: 1.6; text-align: center;">We've launched new AI orchestration features to boost your agent productivity.</p>
</div>`
      }
    ]
  },
  {
    key: 'billing_receipt',
    name: 'GetAiPilot Billing Receipt',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Billing System',
        subject: 'Payment Confirmed - Receipt 💳',
        html_source: `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 22px;">
    <span style="background: #24754E; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">
      PAYMENT CONFIRMED
    </span>
  </div>
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #252722; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.02em; font-family: 'Host Grotesk', sans-serif;">Payment Received Successfully! 💳</h1>
  </div>
  <div style="color: #676D63; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center; font-family: 'Host Grotesk', sans-serif;">
    Hi {{name}}, we have processed your payment successfully. Here is your transaction summary:
  </div>
  <div style="background: #FFFFFC; border: 1px solid #D9D6CD; border-radius: 12px; padding: 24px; margin: 24px 0; font-family: 'Host Grotesk', sans-serif;">
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1EFEA; padding-bottom: 12px; margin-bottom: 14px;">
      <span style="color: #676D63; font-size: 14px;">Invoice Number</span>
      <strong style="color: #252722; font-size: 14px;">{{invoice_id}}</strong>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #676D63; font-size: 14px;">Total Paid</span>
      <strong style="color: #24754E; font-size: 22px; font-weight: 700;">{{amount}}</strong>
    </div>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://getaipilot.com/billing" style="display: inline-block; background: #24754E; color: #FFFFFC; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-family: 'Host Grotesk', sans-serif;">
      Download Invoice PDF →
    </a>
  </div>
  <div style="border-top: 1px solid #F1EFEA; margin-top: 36px; padding-top: 24px; text-align: center;">
    <p style="color: #8B9187; font-size: 12px; line-height: 1.6; margin: 0; font-family: 'Host Grotesk', sans-serif;">© 2026 GetAIPilot Billing Services. All rights reserved.</p>
  </div>
</div>`
      }
    ]
  },
  {
    key: 'product_announcement',
    name: 'GetAiPilot Product Update Announcement',
    category: 'marketing',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Product Team',
        subject: 'Exciting New Features Released on GetAiPilot! ✨',
        html_source: `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto; font-family: 'Host Grotesk', sans-serif;">
  <div style="text-align: center; margin-bottom: 22px;">
    <span style="background: #0D4F3C; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">PRODUCT UPDATE</span>
  </div>
  <h1 style="color: #252722; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">New Autonomous Features Live 🚀</h1>
  <p style="color: #676D63; font-size: 15px; line-height: 1.6; text-align: center;">We've launched new AI orchestration features to boost your agent productivity.</p>
</div>`
      }
    ]
  },
  {
    key: 'getaipilot_welcome',
    name: 'GetAiPilot Platform Welcome',
    category: 'marketing',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'GetAiPilot Team',
        subject: 'Welcome to GetAiPilot Autonomous Platform! 🚀',
        html_source: `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto; font-family: 'Host Grotesk', sans-serif;">
  <div style="text-align: center; margin-bottom: 22px;">
    <span style="background: #2357D8; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">GETAIPILOT CORE</span>
  </div>
  <h1 style="color: #252722; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">Welcome Aboard! 🎉</h1>
  <p style="color: #676D63; font-size: 15px; line-height: 1.6; text-align: center;">Your GetAiPilot account is active and ready to deploy autonomous agents and workflows.</p>
</div>`
      }
    ]
  }
];

async function runSeed() {
  console.log('Seeding templates into Supabase...');

  // Get the product ID for getaipilot
  const { data: product } = await supabase.from('products').select('id').eq('code', 'getaipilot').single();
  
  if (!product) {
    console.error('Error: Product getaipilot not found. Cannot seed templates.');
    process.exit(1);
  }

  // Explicitly delete ONLY redundant social media duplicate keys
  const obsoleteSocialKeys = ['quickpost_publish_success', 'quickpost_account_connected', 'socialpilot_broadcast_published', 'socialpilot_whatsapp_broadcast', 'test'];

  const { data: existingTemplates } = await supabase
    .from('email_templates')
    .select('id, key')
    .eq('product_id', product.id);

  if (existingTemplates && existingTemplates.length > 0) {
    const toDelete = existingTemplates.filter(t => obsoleteSocialKeys.includes(t.key));
    for (const obsolete of toDelete) {
      console.log(`Cleaning up redundant social template from DB: ${obsolete.key}`);
      await supabase.from('template_versions').delete().eq('template_id', obsolete.id);
      await supabase.from('email_templates').delete().eq('id', obsolete.id);
    }
  }

  for (const tmpl of DEMO_TEMPLATES) {
    // Upsert Template
    const { data: insertedTmpl, error: tmplErr } = await supabase
      .from('email_templates')
      .upsert({
        product_id: product.id,
        key: tmpl.key,
        category: tmpl.category
      }, { onConflict: 'product_id,key' })
      .select('id').single();

    if (tmplErr) {
      console.error('Error inserting template', tmpl.key, tmplErr);
      continue;
    }

    const templateId = insertedTmpl.id;

    // Insert Version
    for (const v of tmpl.versions) {
      const { error: vErr } = await supabase
        .from('template_versions')
        .upsert({
          template_id: templateId,
          version_number: v.version_number,
          subject: v.subject,
          html_source: v.html_source,
          status: v.status,
          created_by: v.created_by
        }, { onConflict: 'template_id,version_number' });

      if (vErr) {
        console.error('Error inserting version for', tmpl.key, vErr);
      }
    }
  }

  console.log('Seed complete!');
}

runSeed().catch(console.error);
