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
