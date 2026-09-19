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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to GetAiPilot</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
      width: 100% !important;
      background-color: #ffffff;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    table {
      border-collapse: collapse !important;
    }
    @media screen and (max-width: 620px) {
      .full-width-table {
        width: 100% !important;
      }
      .mobile-hero-padding {
        padding: 24px 16px !important;
      }
      .mobile-padding {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .mobile-center {
        text-align: center !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .cta-button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>

<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- PRE-HEADER -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff; line-height:1px;">
    Verify your GetAiPilot account – unlock Telegram, WhatsApp, SocialPilot & AI automation!
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 0; margin: 0;">
        
        <!-- Main Full Width 600px Container (Flat, No Card Box) -->
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          
          <!-- 1. Logo Header -->
          <tr>
            <td align="center" style="padding: 20px 16px; background-color: #ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 30px; width: auto; display: block;" alt="GetAiPilot Logo">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-weight: 700; color: #111827; font-size: 22px; letter-spacing: -0.5px;">getaipilot</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. Hero Banner (Flat Full Width, Seamless Gradient) -->
          <tr>
            <td class="mobile-hero-padding" style="background: #1e1b4b; background: linear-gradient(135deg, #10183f 0%, #1b2360 50%, #8b3cff 100%); padding: 32px 28px; color: #ffffff; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <p style="font-size: 15px; margin: 0 0 4px 0; color: rgba(255,255,255,0.85); font-weight: 400;">Hi there,</p>
                    <h1 style="font-size: 28px; font-weight: 700; line-height: 1.25; margin: 0; color: #ffffff; letter-spacing: -0.3px;">
                      Welcome to <br />
                      Get<span style="color: #d8b4fe;">AiPilot</span>!
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.4; max-width: 320px;">
                      You’re one step closer to automating messaging, scaling with SocialPilot, and growing your audience.
                    </p>
                  </td>
                  <!-- Envelope Illustration -->
                  <td class="mobile-hide" width="130" align="right" style="vertical-align: middle;">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/5.png" width="120" style="display: block;" alt="Envelope">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. Features Section -->
          <tr>
            <td class="mobile-padding" style="padding: 28px 28px 12px 28px; background-color: #ffffff;">
              <h2 style="text-align: center; font-weight: 700; color: #1f2937; margin: 0 0 24px 0; font-size: 18px;">
                Here’s what you can do with GetAiPilot:
              </h2>

              <!-- Feature 1: Telegram & WhatsApp -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 18px;">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <table role="presentation" width="38" height="38" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3e8ff; border-radius: 10px;">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/16.png" width="22" height="22" style="display: block;" alt="Icon">
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: top; padding-left: 10px;">
                    <h3 style="font-weight: 700; color: #1f2937; font-size: 15px; margin: 0 0 2px 0;">Telegram &amp; WhatsApp Automation</h3>
                    <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">
                      Set up auto-forwarding rules, auto-approve join requests, and broadcast messages across channels seamlessly.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 2: SocialPilot Multi-Platform Publishing -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 18px;">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <table role="presentation" width="38" height="38" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3e8ff; border-radius: 10px;">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/34.png" width="22" height="22" style="display: block;" alt="Icon">
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: top; padding-left: 10px;">
                    <h3 style="font-weight: 700; color: #1f2937; font-size: 15px; margin: 0 0 2px 0;">SocialPilot Multi-Platform Growth</h3>
                    <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">
                      Schedule, automate, and publish content across Instagram, LinkedIn, X, Facebook, and YouTube with AutoDM.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 3: Monetization (Telesub) & AI CRM -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <table role="presentation" width="38" height="38" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3e8ff; border-radius: 10px;">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/32.png" width="22" height="22" style="display: block;" alt="Icon">
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: top; padding-left: 10px;">
                    <h3 style="font-weight: 700; color: #1f2937; font-size: 15px; margin: 0 0 2px 0;">Monetize with Telesub &amp; AI CRM</h3>
                    <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">
                      Launch subscription bots, collect recurring member payments, deploy 24/7 AI bots, and manage contacts in CRM.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4. CTA Block (Ready to take off?) -->
          <tr>
            <td class="mobile-padding" style="padding: 20px 28px 24px 28px; border-top: 1px solid #f3f4f6; background-color: #ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left Illustration -->
                  <td class="mobile-stack mobile-center" width="140" align="center" style="vertical-align: middle; padding-bottom: 12px;">
                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/8.png" width="125" style="display: block; margin: 0 auto; height: auto;" alt="GetAiPilot Mascot">
                  </td>
                  <!-- Right Text & Button -->
                  <td class="mobile-stack mobile-center" style="vertical-align: middle; padding-left: 16px;">
                    <h3 style="font-weight: 700; color: #1f2937; font-size: 18px; margin: 0 0 4px 0;">Ready to take off?</h3>
                    <p style="font-size: 13px; color: #6b7280; margin: 0 0 16px 0; line-height: 1.4;">
                      Confirm your email to activate your dashboard and deploy your first automation.
                    </p>

                    <!-- Confirmation Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="mobile-center" style="margin: 0;">
                      <tr>
                        <td align="center" style="border-radius: 8px; background: linear-gradient(to right, #f43f5e, #8b5cf6); box-shadow: 0 4px 10px rgba(244, 63, 94, 0.25);">
                          <a href="{{ .ConfirmationURL }}" class="cta-button" target="_blank" style="display: inline-block; color: #ffffff; font-size: 15px; font-weight: 700; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                            Confirm Your Email &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5. Help Callout -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 20px 28px; background-color: #ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf5ff; border-radius: 12px; padding: 14px;">
                <tr>
                  <td width="24" style="vertical-align: top; padding-top: 2px;">
                    <span style="font-size: 16px; line-height: 1;">💡</span>
                  </td>
                  <td style="vertical-align: top; padding-left: 8px;">
                    <h4 style="font-weight: 700; color: #1f2937; font-size: 14px; margin: 0 0 2px 0;">Need help getting started?</h4>
                    <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">
                      Check out our Help Center or reply directly to this email anytime.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. Confirmation URL Link Fallback -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 24px 28px; text-align: center; background-color: #ffffff;">
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.4; margin: 0; word-break: break-all;">
                If the button doesn’t work, copy and paste this URL into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #8b5cf6; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- 7. Footer -->
          <tr>
            <td align="center" style="padding: 24px 28px; border-top: 1px solid #f3f4f6; text-align: center; background-color: #ffffff;">
              <!-- Social Icons -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com" target="_blank" style="text-decoration: none;">
                      <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/22.png" width="36" height="36" style="display: block; border-radius: 10px;" alt="Twitter">
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com" target="_blank" style="text-decoration: none;">
                      <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/23.png" width="36" height="36" style="display: block; border-radius: 10px;" alt="LinkedIn">
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com" target="_blank" style="text-decoration: none;">
                      <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/24.png" width="36" height="36" style="display: block; border-radius: 10px;" alt="Instagram">
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Made with <span style="color: #8b5cf6;">&hearts;</span> by the GetAiPilot team</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af;">You're receiving this email because you signed up for GetAiPilot.</p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">&copy; 2026 GetAiPilot. All rights reserved.</p>
            </td>
          </tr>

        </table>

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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WhatsApp Campaign Published</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    WhatsApp Campaign Festive Community Launch was successfully published to 4,850 contacts.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="GetAiPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">getaipilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">✓ DELIVERED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #064e3b; background: linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #10b981 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Broadcast Dispatch</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      Broadcast Successfully Sent! 🚀
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #ccfbf1; line-height: 1.5; max-width: 460px;">
                      Your WhatsApp campaign <strong>Festive Community Launch</strong> was delivered to all target recipients.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <h3 style="font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 14px 0;">Campaign Dispatch Summary:</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Campaign Name</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">Festive Community Launch</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Target Audience</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">4,850 contacts</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Delivery Channel</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">WhatsApp Cloud API Tier 2 (High Speed)</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: none;">Dispatch Status</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: none; text-align: right;"><span style="color: #059669; font-weight: 700;">✓ Completed (100%)</span></td>
  </tr>
              </table>

              <!-- WhatsApp Chat Message Preview Bubble -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px;">WhatsApp Message Preview</span>
                <div style="background: #e7fce9; border-left: 4px solid #25d366; padding: 14px; border-radius: 8px; font-size: 13.5px; color: #0f172a; line-height: 1.5;">
                  "Hey! 🚀 Exclusive VIP early access is now live for all GetAiPilot members. Tap below to claim your early bird pass before it expires tonight!"
                </div>
              </div>

              <!-- Metrics highlight -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="33%" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase;">Sent</div>
                    <div style="font-size: 18px; color: #15803d; font-weight: 800; margin-top: 2px;">4,850</div>
                  </td>
                  <td width="5%">&nbsp;</td>
                  <td width="33%" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase;">Delivered</div>
                    <div style="font-size: 18px; color: #15803d; font-weight: 800; margin-top: 2px;">4,812</div>
                  </td>
                  <td width="5%">&nbsp;</td>
                  <td width="33%" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase;">Read Rate</div>
                    <div style="font-size: 18px; color: #15803d; font-weight: 800; margin-top: 2px;">86.4%</div>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://wb.getaipilot.in/broadcasts" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); white-space: nowrap;">
                  View Live Campaign Analytics &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">GetAiPilot WhatsApp Automation &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alert: WhatsApp Broadcast Failed</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    Alert: WhatsApp Campaign Weekend Flash Sale Blast paused due to an access token exception.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="GetAiPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">getaipilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">⚠️ ATTENTION REQUIRED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #450a0a; background: linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #dc2626 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Delivery Alert</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      Broadcast Execution Failed ⚠️
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #fecaca; line-height: 1.5; max-width: 460px;">
                      Campaign <strong>Weekend Flash Sale Blast</strong> encountered a provider issue during execution and paused.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <!-- Error Diagnostic Details Card -->
              <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
                <span style="font-size: 12px; font-weight: 700; color: #9f1239; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Error Diagnostic Details</span>
                <p style="font-size: 13.5px; color: #881337; font-family: monospace; line-height: 1.5; margin: 0; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #ffe4e6;">
                  META_OAUTH_TOKEN_EXPIRED: The Meta WhatsApp Cloud API access token expired. Re-authentication required in Settings.
                </p>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Campaign Name</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">Weekend Flash Sale Blast</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Failed Contacts</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><span style="color: #dc2626; font-weight: 700;">124 / 2,500 contacts</span></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: none;">Current Status</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: none; text-align: right;"><span style="color: #dc2626; font-weight: 700;">Halted (Action Required)</span></td>
  </tr>
              </table>

              <!-- Troubleshooting Steps -->
              <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0;">Recommended Resolution Steps:</h4>
                <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
                  1. Refresh your Meta WhatsApp Cloud API access token in Settings > Channels.<br>
                  2. Verify template parameters match the approved Meta WhatsApp template.<br>
                  3. Resume the campaign queue to dispatch remaining contacts.
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://wb.getaipilot.in/broadcasts" class="cta-button" style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35); white-space: nowrap;">
                  Troubleshoot Campaign & Retry &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">GAP WhatsApp Automation &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Team Invitation for WhatsApp Automation</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    You are invited to join the GetAiPilot Growth Team on WhatsApp Automation as Marketing Manager.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="GetAiPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">getaipilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">👥 TEAM INVITATION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #064e3b; background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">WhatsApp Workspace</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      You are Invited to the Team! 🎉
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #dcfce7; line-height: 1.5; max-width: 460px;">
                      You have been invited to join the <strong>GetAiPilot Growth Team</strong> as an official <strong>Marketing Manager</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <h3 style="font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 14px 0;">Invitation & Credentials:</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Workspace Name</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">GetAiPilot Growth Team</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Assigned Role</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><span style="color: #059669; font-weight: 700;">Marketing Manager</span></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Temporary Access Key</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: monospace;">GAP-SEC-9284</code></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: none;">Invitation Validity</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: none; text-align: right;"><span style="color: #059669; font-weight: 600;">24 hours from issuance</span></td>
  </tr>
              </table>

              <!-- What you can access -->
              <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">Your Role Permissions Include:</h4>
                <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
                  &bull; <strong>Multi-Agent Shared Inbox:</strong> Manage customer live chats and assign conversations.<br>
                  &bull; <strong>Campaign Broadcasting:</strong> Schedule and monitor verified WhatsApp marketing blasts.<br>
                  &bull; <strong>AI Bot Orchestration:</strong> Review automated agent responses and contact synchronizations.
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://wb.getaipilot.in/auth/join" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); white-space: nowrap;">
                  Accept Invitation & Set Password &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">GetAiPilot WhatsApp Automation &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to GetAiPilot on WhatsApp!</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    Welcome to GetAiPilot WhatsApp Automation. Deploy 24/7 AI chat agents, broadcast campaigns, and sync contacts seamlessly.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="GetAiPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">getaipilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">💬 CLOUD API READY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #064e3b; background: linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #10b981 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">GetAiPilot Ecosystem</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      Automate WhatsApp at Scale! 💬
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #ccfbf1; line-height: 1.5; max-width: 460px;">
                      Your WhatsApp Automation engine is configured. Connect your number, launch AI bots, and engage customers 24/7.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <h3 style="font-weight: 700; color: #0f172a; font-size: 16px; margin: 0 0 16px 0;">3 Steps to Launch Your WhatsApp Automation:</h3>
              
              
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
    <tr>
      <td width="48" style="vertical-align: top; width: 48px; min-width: 48px;">
        <div style="width: 40px; min-width: 40px; height: 40px; min-height: 40px; background-color: #f1f5f9; border-radius: 10px; text-align: center; display: table-cell; vertical-align: middle;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/16.png" width="20" height="20" style="display: block; margin: 0 auto; width: 20px; height: 20px;" alt="Icon">
        </div>
      </td>
      <td style="vertical-align: top; padding-left: 12px;">
        <h4 style="font-weight: 700; color: #0f172a; font-size: 14.5px; margin: 0 0 2px 0; line-height: 1.3;">1. Connect WhatsApp Cloud API</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45;">Bind your official Meta Business Cloud API number or scan QR to activate instant webhook listening.</p>
      </td>
    </tr>
  </table>
  <div style="border-bottom: 1px solid #f1f5f9; margin: 12px 0;"></div>
              
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
    <tr>
      <td width="48" style="vertical-align: top; width: 48px; min-width: 48px;">
        <div style="width: 40px; min-width: 40px; height: 40px; min-height: 40px; background-color: #f1f5f9; border-radius: 10px; text-align: center; display: table-cell; vertical-align: middle;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/robo.png" width="20" height="20" style="display: block; margin: 0 auto; width: 20px; height: 20px;" alt="Icon">
        </div>
      </td>
      <td style="vertical-align: top; padding-left: 12px;">
        <h4 style="font-weight: 700; color: #0f172a; font-size: 14.5px; margin: 0 0 2px 0; line-height: 1.3;">2. Deploy 24/7 AI Auto-Replies</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45;">Train AI agents with your company knowledge base to handle FAQs, bookings, and customer support.</p>
      </td>
    </tr>
  </table>
  <div style="border-bottom: 1px solid #f1f5f9; margin: 12px 0;"></div>
              
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 4px;">
    <tr>
      <td width="48" style="vertical-align: top; width: 48px; min-width: 48px;">
        <div style="width: 40px; min-width: 40px; height: 40px; min-height: 40px; background-color: #f1f5f9; border-radius: 10px; text-align: center; display: table-cell; vertical-align: middle;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/18.png" width="20" height="20" style="display: block; margin: 0 auto; width: 20px; height: 20px;" alt="Icon">
        </div>
      </td>
      <td style="vertical-align: top; padding-left: 12px;">
        <h4 style="font-weight: 700; color: #0f172a; font-size: 14.5px; margin: 0 0 2px 0; line-height: 1.3;">3. Broadcast High-Converting Campaigns</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45;">Send template-approved broadcasts and rich catalog notifications to thousands of opted-in contacts.</p>
      </td>
    </tr>
  </table>
  

              <!-- Feature Highlight Box -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-top: 20px;">
                <h4 style="font-size: 14px; font-weight: 700; color: #166534; margin: 0 0 6px 0;">🚀 Built-in Growth Engines:</h4>
                <p style="font-size: 13px; color: #15803d; margin: 0; line-height: 1.5;">
                  &bull; <strong>Telesub Monetization:</strong> Collect subscription payments and manage paid member channels.<br>
                  &bull; <strong>Ecosystem Contact Sync:</strong> Automatically push leads from WhatsApp conversations directly to your CRM.
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://wb.getaipilot.in/dashboard" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); white-space: nowrap;">
                  Launch WhatsApp Dashboard &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">GetAiPilot WhatsApp Automation &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your WhatsApp Verification Code</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .otp-display { font-size: 30px !important; letter-spacing: 6px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    Your GetAiPilot WhatsApp verification code is 849 204. Valid for 10 minutes.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="GetAiPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">getaipilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">🔒 SECURE AUTH</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #064e3b; background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">WhatsApp Automation</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      Your Security Verification Code
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #d1fae5; line-height: 1.5; max-width: 440px;">
                      Use this one-time code to authenticate your WhatsApp Business API session and connect your workspace.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">One-Time Verification Code</p>
                <div class="otp-display" style="background: #064e3b; color: #34d399; font-size: 34px; font-weight: 800; letter-spacing: 8px; font-family: monospace; padding: 14px 24px; border-radius: 10px; display: inline-block; border: 1px solid #047857; margin-bottom: 12px;">
                  849 204
                </div>
                <p style="font-size: 12.5px; color: #64748b; margin: 0;">
                  ⏱️ <strong>Valid for 10 minutes</strong> &bull; Single-use only
                </p>
              </div>

              <!-- Security Tips Box -->
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="24" style="vertical-align: top; font-size: 16px; width: 24px;">🛡️</td>
                    <td style="vertical-align: top; padding-left: 10px; font-size: 13px; color: #92400e; line-height: 1.45;">
                      <strong>Security Advisory:</strong> Never share this verification code with anyone. GetAiPilot representatives will never contact you to ask for your OTP or login credentials.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Audit Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 20px;">
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Service</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">GAP WhatsApp Engine Cloud API</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Action</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">Account Authentication & Device Binding</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: none;">Security Standard</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: none; text-align: right;">End-to-End Encrypted Session</td>
  </tr>
              </table>

              <div style="text-align: center; margin: 24px 0 12px 0;">
                <a href="https://wb.getaipilot.in/security" style="display: inline-block; background: #065f46; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 11px 28px; border-radius: 8px;">
                  Manage Account Security &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">GetAiPilot WhatsApp Automation &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Social Account Connected</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    Your Instagram account (@getaipilot_official) has been successfully connected to SocialPilot.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="SocialPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">socialpilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">✓ CONNECTED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0f172a; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Channel Integration</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      New Channel Active & Linked! 🔗
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #dbeafe; line-height: 1.5; max-width: 460px;">
                      Your <strong>Instagram Business</strong> account (@getaipilot_official) has been authorized and is ready for automated broadcasting.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <h3 style="font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 14px 0;">Account Connection Details:</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Platform</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">Instagram Business</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Account Handle</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><strong style="color: #2563eb;">@getaipilot_official</strong></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Publishing Status</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><span style="color: #059669; font-weight: 700;">✓ Active & Synchronized</span></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: none;">Permissions Granted</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: none; text-align: right;">Feed Posts, Stories, Reels, AutoDM</td>
  </tr>
              </table>

              <!-- Next Steps Box -->
              <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0;">Next Recommended Actions:</h4>
                <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
                  1. Schedule your first draft campaign in the SocialPilot composer.<br>
                  2. Configure AutoDM keyword triggers to automatically capture leads from comments.<br>
                  3. Track post performance metrics and engagement in the analytics tab.
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://social.getaipilot.in/accounts" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); white-space: nowrap;">
                  Manage Connected Accounts &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">SocialPilot Engine &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        subject: 'Welcome to SocialPilot! 🚀',
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SocialPilot</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    Welcome to SocialPilot! Connect Instagram, LinkedIn, Twitter, Facebook, and YouTube with AI auto-publishing.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="SocialPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">socialpilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">🚀 SOCIAL SUITE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0f172a; background: linear-gradient(135deg, #0f172a 0%, #312e81 50%, #6366f1 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">All-in-One Publishing</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      Welcome to SocialPilot! 🎉
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #c7d2fe; line-height: 1.5; max-width: 460px;">
                      Your multi-channel social broadcasting command center is ready. Start publishing, scheduling, and automating post campaigns in seconds.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <h3 style="font-weight: 700; color: #0f172a; font-size: 16px; margin: 0 0 16px 0;">Here is what you can do right now:</h3>
              
              
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
    <tr>
      <td width="48" style="vertical-align: top; width: 48px; min-width: 48px;">
        <div style="width: 40px; min-width: 40px; height: 40px; min-height: 40px; background-color: #f1f5f9; border-radius: 10px; text-align: center; display: table-cell; vertical-align: middle;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/34.png" width="20" height="20" style="display: block; margin: 0 auto; width: 20px; height: 20px;" alt="Icon">
        </div>
      </td>
      <td style="vertical-align: top; padding-left: 12px;">
        <h4 style="font-weight: 700; color: #0f172a; font-size: 14.5px; margin: 0 0 2px 0; line-height: 1.3;">1. Connect Social Channels</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45;">Link Instagram, LinkedIn, 𝕏 Twitter, Facebook, and YouTube in one click with official OAuth.</p>
      </td>
    </tr>
  </table>
  <div style="border-bottom: 1px solid #f1f5f9; margin: 12px 0;"></div>
              
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
    <tr>
      <td width="48" style="vertical-align: top; width: 48px; min-width: 48px;">
        <div style="width: 40px; min-width: 40px; height: 40px; min-height: 40px; background-color: #f1f5f9; border-radius: 10px; text-align: center; display: table-cell; vertical-align: middle;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/18.png" width="20" height="20" style="display: block; margin: 0 auto; width: 20px; height: 20px;" alt="Icon">
        </div>
      </td>
      <td style="vertical-align: top; padding-left: 12px;">
        <h4 style="font-weight: 700; color: #0f172a; font-size: 14.5px; margin: 0 0 2px 0; line-height: 1.3;">2. AI Caption & Scheduling Studio</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45;">Draft engaging posts with AI assistance, generate hashtags, and schedule multi-channel blasts.</p>
      </td>
    </tr>
  </table>
  <div style="border-bottom: 1px solid #f1f5f9; margin: 12px 0;"></div>
              
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 4px;">
    <tr>
      <td width="48" style="vertical-align: top; width: 48px; min-width: 48px;">
        <div style="width: 40px; min-width: 40px; height: 40px; min-height: 40px; background-color: #f1f5f9; border-radius: 10px; text-align: center; display: table-cell; vertical-align: middle;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/5.png" width="20" height="20" style="display: block; margin: 0 auto; width: 20px; height: 20px;" alt="Icon">
        </div>
      </td>
      <td style="vertical-align: top; padding-left: 12px;">
        <h4 style="font-weight: 700; color: #0f172a; font-size: 14.5px; margin: 0 0 2px 0; line-height: 1.3;">3. Enable AutoDM Lead Generation</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45;">Turn comments into customers by automatically sending direct messages when users interact with your posts.</p>
      </td>
    </tr>
  </table>
  

              <!-- Supported Networks Badge Row -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 20px; text-align: center;">
                <span style="font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px;">Supported Platforms</span>
                <span style="background: #fce7f3; color: #be185d; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 2px; display: inline-block;">📸 Instagram</span>
                <span style="background: #e0e7ff; color: #3730a3; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 2px; display: inline-block;">💼 LinkedIn</span>
                <span style="background: #f1f5f9; color: #0f172a; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 2px; display: inline-block;">𝕏 Twitter</span>
                <span style="background: #dbeafe; color: #1d4ed8; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 2px; display: inline-block;">📘 Facebook</span>
                <span style="background: #fee2e2; color: #b91c1c; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 2px; display: inline-block;">▶️ YouTube</span>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://social.getaipilot.in/dashboard" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); white-space: nowrap;">
                  Launch SocialPilot Dashboard &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">SocialPilot &bull; SuperMailBox Infrastructure</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AutoDM Automation Active</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    AutoDM Automation VIP Early Access is now active and responding to user comments.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="SocialPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">socialpilot <span style="color: #4f46e5; font-weight: 400;">autodm</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">⚡ ACTIVE RULE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0f172a; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4f46e5 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Direct Message Trigger</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      AutoDM Engine Activated! ⚡
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #c7d2fe; line-height: 1.5; max-width: 460px;">
                      Your automation rule <strong>VIP Early Access</strong> is live and actively converting post commenters into private leads.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <h3 style="font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 14px 0;">Automation Configuration:</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Automation Rule</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;">VIP Early Access AutoDM</td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Trigger Keyword</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><code style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-weight: 700;">ACCESS</code></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Trigger Type</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-align: right;"><strong style="color: #4f46e5;">Keyword Match (Exact & Comments)</strong></td>
  </tr>
                
  <tr>
    <td style="padding: 10px 14px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: none;">Follower Gate</td>
    <td align="right" style="padding: 10px 14px; font-size: 13.5px; color: #0f172a; font-weight: 700; border-bottom: none; text-align: right;">Active (Must follow @getaipilot to receive link)</td>
  </tr>
              </table>

              <!-- Real Engine Highlights Box -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-size: 13.5px; font-weight: 700; color: #166534; margin: 0 0 6px 0;">⚡ Active Engine Capabilities:</h4>
                <p style="font-size: 13px; color: #15803d; margin: 0; line-height: 1.6;">
                  &bull; <strong>Dual-Action Reply:</strong> Dispatches public comment reply + instant private DM.<br>
                  &bull; <strong>Follower-Gate Verification:</strong> Checks if user follows your account before delivering the link.<br>
                  &bull; <strong>Ecosystem CRM Sync:</strong> Automatically captures commenter details into GetAiPilot CRM.
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://social.getaipilot.in/autodm" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); white-space: nowrap;">
                  Manage AutoDM Automations &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">SocialPilot AutoDM Engine &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Post Published: Autonomous Launch Campaign</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");
    body { margin: 0 !important; padding: 0 !important; background-color: #ffffff; font-family: "Outfit", -apple-system, sans-serif; }
    table { border-collapse: collapse !important; }
    @media screen and (max-width: 620px) {
      .full-width-table { width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hero-padding { padding: 22px 16px !important; }
      .mobile-hero-title { font-size: 22px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 13px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; font-family: 'Outfit', -apple-system, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#ffffff;">
    Your post Autonomous Launch Campaign has been successfully published across connected channels.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 16px 0 32px 0;">
        <table class="full-width-table" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="SocialPilot Logo">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-weight: 700; color: #0f172a; font-size: 19px; letter-spacing: -0.5px;">socialpilot</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle; text-align: right;">
                    <span style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase;">✓ POST LIVE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Hero Banner -->
          <tr>
            <td style="padding: 0 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0f172a; background: linear-gradient(135deg, #0f172a 0%, #2e1065 50%, #7c3aed 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td class="mobile-hero-padding" style="padding: 28px 24px; color: #ffffff; text-align: left;">
                    <div style="margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Publishing Notification</span>
                    </div>
                    <h1 class="mobile-hero-title" style="font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 8px 0; color: #ffffff; letter-spacing: -0.4px;">
                      Your Post is Officially Live! 🚀
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #e9d5ff; line-height: 1.5; max-width: 460px;">
                      Your broadcast campaign <strong>Autonomous Launch Campaign</strong> was successfully published across all selected channels.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height: 20px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 24px;">
              <!-- Target Channels Badges -->
              <div style="margin-bottom: 18px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Published Target Channels</span>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 10px;">
                  <span style="background: #fce7f3; color: #be185d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-right: 6px; display: inline-block;">📸 Instagram</span>
                  <span style="background: #e0e7ff; color: #3730a3; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-right: 6px; display: inline-block;">💼 LinkedIn</span>
                  <span style="background: #f1f5f9; color: #0f172a; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-right: 6px; display: inline-block;">𝕏 Twitter</span>
                  <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; display: inline-block;">📘 Facebook</span>
                </div>
              </div>

              <!-- Post Caption Preview Card -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px;">
                  <span style="font-size: 13px; font-weight: 700; color: #334155;">Post Caption Preview</span>
                  <span style="font-size: 12px; color: #94a3b8;">Instagram, LinkedIn, X, Facebook</span>
                </div>
                <p style="font-size: 14.5px; color: #1e293b; line-height: 1.6; margin: 0; font-style: italic; background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 3px solid #7c3aed;">
                  "🚀 Excited to announce our newest AI automation features are officially live on GetAiPilot! Automate Telegram, WhatsApp, and social publishing in one unified dashboard. Check out the link in bio for early access! #AI #Automation #GetAiPilot"
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://social.getaipilot.in/broadcasts" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%); color: #ffffff; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35); white-space: nowrap;">
                  View Live Post Performance &rarr;
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">SocialPilot Broadcast Engine &bull; SuperMailBox CPaaS</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">&copy; 2026 GetAiPilot Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
  },

  {
    key: 'getaipilot_complete_onboarding',
    name: 'GetAiPilot Complete Onboarding',
    category: 'transactional',
    versions: [
      {
        version_number: 1,
        status: 'live',
        created_by: 'Admin',
        subject: 'Action Required: Complete your GetAiPilot Setup!',
        html_source: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Complete your onboarding</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f3ee; font-family: 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3ee; padding:40px 0;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 40px 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="padding-right:12px;">
                    <div style="width:44px; height:44px; border-radius:50%; background-color:#f47c20;"></div>
                  </td>
                  <td valign="middle">
                    <span style="font-size:26px; font-weight:600; color:#2b2b2b; letter-spacing:-0.5px;">getaipilot</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Illustration -->
          <tr>
            <td align="center" style="padding:0 40px 30px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7d451; border-radius:16px;">
                <tr>
                  <td align="center" style="padding:50px 20px; position:relative;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:28px; padding-right:15px; vertical-align:top;">&#10022;</td>
                        <td style="vertical-align:middle;">
                          <div style="width:90px; height:90px; border-radius:50%; background-color:#f47c20; position:relative;">
                            <div style="position:relative; top:38px; left:22px; width:45px; height:8px; border-top:4px solid #d9631a; border-radius:50%; border-bottom:none; transform:rotate(0deg);"></div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding:0 40px 20px 40px;">
              <h1 style="margin:0; font-size:34px; line-height:1.3; color:#2b2b2b; font-weight:700;">
                Complete your<br>onboarding
              </h1>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td align="center" style="padding:0 50px 30px 50px;">
              <p style="margin:0; font-size:16px; line-height:1.6; color:#5b5b5b;">
                You're just a few steps away from getting the most out of GetAiPilot. Finish setting up your profile and preferences so we can personalize your AI workflow automation.
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:0 40px 50px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#f47c20; border-radius:30px;">
                    <a href="https://getaipilot.in" style="display:inline-block; padding:16px 40px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none;">
                      Complete onboarding
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help text -->
          <tr>
            <td align="center" style="padding:0 50px 30px 50px;">
              <p style="margin:0; font-size:14px; line-height:1.6; color:#8a8a8a;">
                If you have any questions, please visit our
                <a href="#" style="color:#f47c20; text-decoration:none;">FAQs</a>
                or email us at
                <a href="mailto:support@getaipilot.com" style="color:#f47c20; text-decoration:none;">support@getaipilot.com</a>.
                Our team can answer questions about your account or help you with your setup.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 50px;">
              <hr style="border:none; border-top:1px solid #e5e5e5; margin:0;">
            </td>
          </tr>

          <!-- Social icons -->
          <tr>
            <td align="center" style="padding:30px 40px 20px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 10px;"><a href="#" style="color:#2b2b2b; text-decoration:none; font-size:18px;">&#9679;</a></td>
                  <td style="padding:0 10px;"><a href="#" style="color:#2b2b2b; text-decoration:none; font-size:18px;">&#9633;</a></td>
                  <td style="padding:0 10px;"><a href="#" style="color:#2b2b2b; text-decoration:none; font-size:18px;">&#9673;</a></td>
                  <td style="padding:0 10px;"><a href="#" style="color:#2b2b2b; text-decoration:none; font-size:18px;">&#9654;</a></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer links -->
          <tr>
            <td align="center" style="padding:0 40px 25px 40px;">
              <p style="margin:0; font-size:13px; color:#2b2b2b;">
                <a href="#" style="color:#2b2b2b; text-decoration:none; font-weight:600;">My Account</a>
                &nbsp;|&nbsp;
                <a href="#" style="color:#2b2b2b; text-decoration:none; font-weight:600;">How it works</a>
                &nbsp;|&nbsp;
                <a href="#" style="color:#2b2b2b; text-decoration:none; font-weight:600;">FAQs</a>
                &nbsp;|&nbsp;
                <a href="#" style="color:#2b2b2b; text-decoration:none; font-weight:600;">T&amp;Cs</a>
                &nbsp;|&nbsp;
                <a href="#" style="color:#2b2b2b; text-decoration:none; font-weight:600;">Privacy Policy</a>
              </p>
            </td>
          </tr>

          <!-- Legal footer -->
          <tr>
            <td align="center" style="padding:0 40px 40px 40px;">
              <p style="margin:0; font-size:11px; line-height:1.7; color:#b0b0b0;">
                You have received this email as a registered user of GetAiPilot&reg;<br>
                GetAiPilot, Inc., 123 Main Street, San Francisco, CA 94105 United States.<br>
                Delaware Corporation State File # 5271511<br>
                &copy; 2026 GetAiPilot Inc.<br>
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
      }
    ]
  },
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
