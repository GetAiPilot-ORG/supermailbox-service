# Email Templates Collection

This document contains all HTML email templates configured in SuperMailBox service for Metabull Universe / GetAiPilot.

---

## Table of Contents
1. [GetAiPilot Account Verification (`getaipilot_verify_account`)](#1-getaipilot-account-verification-getaipilot_verify_account)
2. [Payment Receipt / Success Notice (`payment_success`)](#2-payment-receipt--success-notice-payment_success)
3. [Two-Factor Authentication / Login OTP (`otp_login`)](#3-two-factor-authentication--login-otp-otp_login)
4. [Developer Onboarding Welcome Blast (`welcome_email`)](#4-developer-onboarding-welcome-blast-welcome_email)
5. [Auth Welcome Template (`auth_welcome`)](#5-auth-welcome-template-auth_welcome)
6. [Billing Receipt Template (`billing_receipt`)](#6-billing-receipt-template-billing_receipt)
7. [Product Update Announcement (`product_announcement`)](#7-product-update-announcement-product_announcement)

---

## 1. GetAiPilot Account Verification (`getaipilot_verify_account`)
* **Category:** Transactional
* **Subject:** `Verify your GetAiPilot Account`
* **Variables:** `{{ .ConfirmationURL }}`, `{{name}}`

```html
<!DOCTYPE html>
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
</html>
```

---

## 2. Payment Receipt / Success Notice (`payment_success`)
* **Category:** Transactional
* **Subject:** `Receipt for your SupermailBox payment ({{invoice_id}})`
* **Variables:** `{{name}}`, `{{amount}}`, `{{invoice_id}}`, `{{wallet_balance}}`

```html
<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e10; color: #e5e1e4; padding: 40px; border-radius: 16px; border: 1px solid #2a2a2c;">
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
</div>
```

---

## 3. Two-Factor Authentication / Login OTP (`otp_login`)
* **Category:** Transactional
* **Subject:** `Your authentication code is {{otp_code}}`
* **Variables:** `{{name}}`, `{{otp_code}}`, `{{expires_in}}`

```html
<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #131315; color: #e5e1e4; padding: 40px; border-radius: 20px; border: 1px solid #353437; text-align: center;">
  <h2 style="color: #ffffff; font-size: 22px;">Verification Required</h2>
  <p style="color: #c7c4d7; font-size: 15px;">Hello {{name}}, enter the code below to complete your login attempt:</p>
  <div style="background: #201f21; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #464554;">
    <span style="font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: bold; color: #a855f7; letter-spacing: 6px;">{{otp_code}}</span>
  </div>
  <p style="color: #ffb4ab; font-size: 13px;">⚠️ This code expires in <strong>{{expires_in}}</strong>. Never share this code with anyone.</p>
</div>
```

---

## 4. Developer Onboarding Welcome Blast (`welcome_email`)
* **Category:** Marketing
* **Subject:** `Welcome to SupermailBox CPaaS Infrastructure, {{name}}! 🚀`
* **Variables:** `{{name}}`, `{{plan}}`, `{{setup_url}}`

```html
<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0c; color: #e5e1e4; padding: 40px; border-radius: 16px; border: 1px solid #6366f1;">
  <h1 style="color: #ffffff; font-size: 28px;">Welcome aboard, {{name}}!</h1>
  <p style="color: #c7c4d7; font-size: 16px;">You are now enrolled in the <strong style="color: #6ffbbe;">{{plan}}</strong> tier. You have full access to our global transactional email routing engines and 99.99% SLA queues.</p>
  <div style="margin: 32px 0; text-align: center;">
    <a href="{{setup_url}}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Developer Console &rarr;</a>
  </div>
</div>
```

---

## 5. Auth Welcome Template (`auth_welcome`)
* **Category:** Transactional
* **Subject:** `Welcome to GetAIPilot! 🚀`
* **Variables:** `{{name}}`, `{{otp_code}}`

```html
<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 22px;">
    <span style="background: #2357D8; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">
      ACCOUNT VERIFICATION
    </span>
  </div>
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #252722; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.02em; font-family: 'Host Grotesk', sans-serif;">Welcome Aboard, {{name}}! 🎉</h1>
  </div>
  <div style="color: #676D63; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center; font-family: 'Host Grotesk', sans-serif;">
    We are thrilled to have you onboard. Please use the security verification code below to confirm your login session.
  </div>
  <div style="margin: 28px auto; text-align: center; background: #F8F8F6; border: 1px solid #D9D6CD; padding: 24px; border-radius: 12px; max-width: 280px;">
    <div style="font-size: 12px; font-weight: 600; color: #676D63; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; font-family: 'Host Grotesk', sans-serif;">Security Code</div>
    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; color: #2357D8; letter-spacing: 0.1em;">{{otp_code}}</span>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://getaipilot.com/app" style="display: inline-block; background: #2357D8; color: #FFFFFC; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-family: 'Host Grotesk', sans-serif;">
      Launch Dashboard →
    </a>
  </div>
  <div style="border-top: 1px solid #F1EFEA; margin-top: 36px; padding-top: 24px; text-align: center;">
    <p style="color: #8B9187; font-size: 12px; line-height: 1.6; margin: 0; font-family: 'Host Grotesk', sans-serif;">© 2026 GetAIPilot Core Platform. All rights reserved.</p>
  </div>
</div>
```

---

## 6. Billing Receipt Template (`billing_receipt`)
* **Category:** Transactional
* **Subject:** `Payment Confirmed - Receipt 💳`
* **Variables:** `{{name}}`, `{{invoice_id}}`, `{{amount}}`

```html
<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto;">
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
</div>
```

---

---

## 8. QuickPost AutoDM Automation Active (`automation_created`)
* **Category:** Transactional
* **Subject:** `AutoDM Automation Active: {{automation_name}} ⚡`
* **Variables:** `{{automation_name}}`, `{{trigger_type}}`, `{{name}}`

```html
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
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
</div>
```

---

## 9. QuickPost Broadcast Published Notification (`broadcast_notification`)
* **Category:** Transactional
* **Subject:** `Post Published: {{campaign_name}}`
* **Variables:** `{{campaign_name}}`, `{{full_name}}`, `{{email}}`, `{{caption}}`, `{{platforms}}`

```html
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
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
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent to {{email}} via <strong>SocialPilot Broadcast Engine</strong> &bull; SuperMailBox CPaaS</p>
    </div>
  </div>
</div>
```
