import { supabase } from '../supabase.js';
import { addResponsiveEmailFixes } from './responsiveEmail.js';
import {
  generateSupabaseAuthLink,
  isSupabaseAuthLinkConfigured,
  shouldGenerateSupabaseAuthLink
} from './authLinks.js';
import { resolveCategoryDefaultTemplateKey } from './emailTemplateRepository.js';

export async function renderTemplate(
  templateKey: string,
  variables: Record<string, any>
): Promise<{ subject: string; html: string }> {
  let normalizedVariables = withDefaultTemplateVariables(variables);

  if (
    (!normalizedVariables.ConfirmationURL || !normalizedVariables.Token) &&
    normalizedVariables.email &&
    shouldGenerateSupabaseAuthLink(templateKey, normalizedVariables.campaign_name || normalizedVariables.subject) &&
    isSupabaseAuthLinkConfigured()
  ) {
    try {
      const authLinkResult = await generateSupabaseAuthLink(
        normalizedVariables.email,
        normalizedVariables.full_name || normalizedVariables.name,
        {
          templateKey,
          campaignName: normalizedVariables.campaign_name || normalizedVariables.subject
        }
      );
      if (authLinkResult.url || authLinkResult.otpCode) {
        normalizedVariables = withDefaultTemplateVariables({
          ...normalizedVariables,
          ...(authLinkResult.url ? { ConfirmationURL: authLinkResult.url } : {}),
          ...(authLinkResult.otpCode && !normalizedVariables.otp_code ? { otp_code: authLinkResult.otpCode } : {})
        });
      }
    } catch (err) {
      console.warn('[renderTemplate] Could not auto-generate Supabase auth link:', err);
    }
  }

  let resolvedKey = templateKey;
  try {
    resolvedKey = await resolveCategoryDefaultTemplateKey(templateKey);
  } catch (err) {
    console.warn('[renderTemplate] resolveCategoryDefaultTemplateKey warning:', err);
  }

  try {
    // Attempt to lookup template by ID or key from database
    let dbRow: any = null;

    // Check by ID first if resolvedKey is a UUID/ID
    const { data: byId } = await supabase
      .from('email_templates')
      .select('id, key, name, subject, compiled_html, mjml_content, current_version_id')
      .eq('id', resolvedKey)
      .maybeSingle();

    if (byId) {
      dbRow = byId;
    } else {
      const { data: byKey } = await supabase
        .from('email_templates')
        .select('id, key, name, subject, compiled_html, mjml_content, current_version_id')
        .eq('key', resolvedKey)
        .maybeSingle();
      dbRow = byKey;
    }

    if (!dbRow && resolvedKey !== templateKey) {
      const { data: byOrigKey } = await supabase
        .from('email_templates')
        .select('id, key, name, subject, compiled_html, mjml_content, current_version_id')
        .eq('key', templateKey)
        .maybeSingle();
      dbRow = byOrigKey;
    }

    if (dbRow) {
      let html = dbRow.compiled_html || '';
      let subject = dbRow.subject || dbRow.name || '';

      // Check current_version_id or latest template_version if compiled_html is empty
      if (!html && dbRow.current_version_id) {
        const { data: ver } = await supabase
          .from('template_versions')
          .select('subject, html_source')
          .eq('id', dbRow.current_version_id)
          .maybeSingle();
        if (ver) {
          if (ver.html_source) html = ver.html_source;
          if (ver.subject) subject = ver.subject;
        }
      }

      if (!html) {
        const { data: latestVer } = await supabase
          .from('template_versions')
          .select('subject, html_source')
          .eq('template_id', dbRow.id)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestVer) {
          if (latestVer.html_source) html = latestVer.html_source;
          if (latestVer.subject) subject = latestVer.subject;
        }
      }

      if (html) {
        const interpolatedSubject = interpolateVariables(subject, normalizedVariables);
        let interpolatedHtml = interpolateVariables(html, normalizedVariables);
        if (normalizedVariables.ConfirmationURL) {
          interpolatedHtml = injectActionLinkFallback(interpolatedHtml, normalizedVariables.ConfirmationURL);
        }
        return {
          subject: interpolatedSubject,
          html: addResponsiveEmailFixes(interpolatedHtml),
        };
      }
    }
  } catch (err) {
    console.warn('[renderTemplate] Database lookup exception:', err);
  }

  // Fallback Templates if not found in DB
  let finalSubject = '';
  let finalHtml = '';

  const campaignName = normalizedVariables.campaign_name || normalizedVariables.campaignName || 'Announcement Blast';
  const name = normalizedVariables.full_name || normalizedVariables.name || normalizedVariables.email?.split('@')[0] || 'Member';

  const k = (templateKey || '').toLowerCase();

  if (k === 'auth_welcome' || k.includes('quickpost_welcome') || k.includes('quickpost_auth')) {
    finalSubject = 'Welcome to QuickPost! 🚀';
    finalHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
        <div style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
            <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.1); padding: 8px 18px; border-radius: 999px; margin-bottom: 20px;">
              <img src="https://social.getaipilot.in/logo.png" alt="SocialPilot Logo" style="height: 24px; width: 24px; border-radius: 6px; background: #ffffff; padding: 2px;" onerror="this.style.display='none'">
              <span style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">SocialPilot <span style="color: #a5b4fc; font-weight: 400;">QuickPost</span></span>
            </div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 10px 0; color: #ffffff;">Welcome Aboard, ${name}! 🎉</h1>
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
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Account Status: <strong style="color: #10b981;">✓ Active</strong> &bull; SuperMailBox Infrastructure</p>
          </div>
        </div>
      </div>
    `;
  } else if (k === 'broadcast_notification' || k.includes('quickpost_publish') || k.includes('quickpost_broadcast') || k.includes('socialpilot_broadcast')) {
    finalSubject = 'Post Published: {{campaign_name}}';
    finalHtml = `
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
            <h1 style="font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #ffffff;">Your Social Post is Live! 🚀</h1>
            <p style="font-size: 14px; color: #c7d2fe; margin: 0;">Hey ${name}, your campaign <strong>{{campaign_name}}</strong> has been broadcasted across your social channels.</p>
          </div>
          <div style="padding: 28px;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 12px;">Published Channels</span>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="background: linear-gradient(135deg, #e1306c, #fd1d1d, #f56040); color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">📸 Instagram</span>
                <span style="background: #0a66c2; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">💼 LinkedIn</span>
                <span style="background: #000000; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">𝕏 Twitter</span>
                <span style="background: #1877f2; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block;">📘 Facebook</span>
              </div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
                <span style="font-size: 13px; font-weight: 700; color: #334155;">Post Preview</span>
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
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent via <strong>SocialPilot Broadcast Engine</strong> &bull; SuperMailBox CPaaS</p>
          </div>
        </div>
      </div>
    `;
  } else if (k === 'account_connected' || k.includes('quickpost_account')) {
    finalSubject = 'New Social Account Connected: {{platform}}';
    finalHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 32px 16px;">
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
            <p style="font-size: 14px; color: #c7d2fe; margin: 0;">Hey ${name}, your <strong>{{platform}}</strong> account is ready to publish.</p>
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
      </div>
    `;
  } else if (k === 'automation_created' || k.includes('quickpost_autodm') || k.includes('autodm')) {
    finalSubject = 'AutoDM Automation Created: {{automation_name}}';
    finalHtml = `
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
    `;
  } else if (k.includes('wap_welcome') || k.includes('gap_whatsapp_welcome') || k.includes('wap_onboard')) {
    finalSubject = 'Welcome to GetAiPilot on WhatsApp!';
    finalHtml = `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #075e54; color: #ffffff; padding: 24px; border-radius: 16px;">
        <h3 style="margin-top: 0; color: #25d366;">💬 GetAiPilot WhatsApp Alert</h3>
        <p>Hi <strong>${name}</strong>, welcome to GetAiPilot on WhatsApp! 🚀</p>
        <p style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">Your account setup is complete. Reply <strong>START</strong> to receive real-time autonomous alerts and updates directly on WhatsApp.</p>
        <p style="font-size: 12px; opacity: 0.8; margin-bottom: 0;">Sent via GAP_WHATSAPP &bull; SuperMailBox CPaaS</p>
      </div>
    `;
  } else if (k.includes('wap_otp') || k.includes('gap_whatsapp_otp') || k.includes('wap_verify')) {
    finalSubject = 'Your WhatsApp Security Code: {{otp_code}}';
    finalHtml = `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #128c7e; color: #ffffff; padding: 24px; border-radius: 16px; text-align: center;">
        <h3 style="margin-top: 0; color: #25d366;">🔒 WhatsApp Authentication Code</h3>
        <p>Hello ${name}, your security code for GetAiPilot WhatsApp login is:</p>
        <div style="background: #075e54; padding: 16px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 16px 0; color: #25d366;">
          {{otp_code}}
        </div>
        <p style="font-size: 13px; opacity: 0.9;">Code valid for 10 minutes. Do not share this code.</p>
      </div>
    `;
  } else if (k.includes('wap_broadcast') || k.includes('socialpilot_whatsapp') || k.includes('gap_whatsapp_broadcast')) {
    finalSubject = 'New Social Broadcast Published: {{campaign_name}}';
    finalHtml = `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #0f2027; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #25d366;">
        <h3 style="margin-top: 0; color: #25d366;">📢 SocialPilot WhatsApp Notification</h3>
        <p>Hey ${name}, your social broadcast campaign <strong>{{campaign_name}}</strong> is now published across channels!</p>
        <div style="background: rgba(37, 211, 102, 0.1); border-left: 4px solid #25d366; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px;">Total WhatsApp Audience Reached: <strong>{{audience_count}}</strong></p>
        </div>
      </div>
    `;
  } else if (
    k === 'getaipilot_confirm_email_otp' ||
    k === 'confirm_email_otp' ||
    k === 'getaipilot_confirm_email' ||
    k === 'confirm_email' ||
    k.includes('confirm_email') ||
    k.includes('confirm_email_otp')
  ) {
    finalSubject = normalizedVariables.subject || 'Confirm Your GetAiPilot Account: {{ .Token }}';
    finalHtml = `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm Your Email - GetAIPilot</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;700&display=swap');

        body {
            margin: 0;
            padding: 0;
            min-width: 100%;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            background-color: #fafafa;
        }

        table {
            border-spacing: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        a {
            text-decoration: none;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .webkit {
            max-width: 600px;
            margin: 0 auto;
        }

        .outer {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            color: #111827;
            margin: 0 auto;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
            overflow: hidden;
        }

        @media screen and (max-width: 600px) {
            .feedback-table td {
                display: block;
                width: 100% !important;
                text-align: center !important;
            }

            .feedback-btn-container {
                margin-top: 15px;
            }

            .content-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0; background-color: #fafafa;">
    <center class="wrapper"
        style="width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #fafafa; padding-top: 40px; padding-bottom: 40px;">
        <div class="webkit" style="max-width: 600px; margin: 0 auto;">
            <!--[if (gte mso 9)|(IE)]>
            <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td>
            <![endif]-->
            <table class="outer" align="center"
                style="margin: 0 auto; width: 100%; max-width: 600px; background-color: #ffffff;">

                <!-- Logo -->
                <tr>
                    <td align="center" style="padding: 40px 20px 20px 20px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                            <tr>
                                <td style="padding-right: 10px;">
                                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png"
                                        alt="GetAIPilot Logo" width="36" height="36"
                                        style="width: 36px; height: 36px; display: block;">
                                </td>
                                <td style="vertical-align: middle;">
                                    <span
                                        style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Get
                                        AI Pilot</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Titles -->
                <tr>
                    <td align="center" class="content-padding"
                        style="padding: 10px 40px 20px 40px; text-align: center;">
                        <h1 style="font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 5px 0;">Confirm Email with
                        </h1>
                        <h2 style="font-size: 22px; font-weight: 700; color: #065f46; margin: 0 0 20px 0;">Verification Code</h2>

                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0;">
                            Welcome to <strong>GetAIPilot</strong>! Enter this verification code in your mobile app to confirm your email and complete your registration:
                        </p>

                        <div style="background-color: #f0fdf4; border: 2px dashed #065f46; border-radius: 12px; padding: 18px 24px; margin: 24px auto; display: inline-block; min-width: 200px;">
                            <div style="font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Verification Code</div>
                            <span style="font-family: 'JetBrains Mono', Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; color: #065f46; letter-spacing: 8px; display: block;">{{ .Token }}</span>
                        </div>

                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                            Or, use this verification code: <strong>{{ .Token }}</strong>
                        </p>
                    </td>
                </tr>

                <!-- Subtext -->
                <tr>
                    <td align="center" class="content-padding" style="padding: 0 40px 25px 40px; text-align: center;">
                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0;">
                            If you did not request this verification code, you can safely ignore this email.
                        </p>
                    </td>
                </tr>

                <!-- Main CTA -->
                <tr>
                    <td align="center" style="padding: 0 40px 30px 40px;">
                        <a href="{{ .ConfirmationURL }}"
                            style="display: inline-block; background-color: #065f46; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 4px; box-shadow: 0 2px 4px rgba(6, 95, 70, 0.2);">Confirm Email</a>
                    </td>
                </tr>

                <!-- Fallback link -->
                <tr>
                    <td align="center" style="padding: 0 40px 45px 40px;">
                        <p style="font-size:13px; color:#9ca3af; line-height:1.4; margin:0;">
                            If the button doesn't work, copy and paste this URL into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color:#065f46; word-break:break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                    </td>
                </tr>

                <!-- Help Section (Light Green/Gray Bg) -->
                <tr>
                    <td
                        style="background-color: #f0fdf4; padding: 35px 40px; border-top: 1px solid #dcfce7; border-bottom: 1px solid #dcfce7;">
                        <table class="feedback-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center" valign="middle" style="text-align: center;">
                                    <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">
                                        Need Help?</h3>
                                    <p style="font-size: 13px; color: #4b5563; margin: 0 0 15px 0; line-height: 1.5;">
                                        Check out our <a href="#" style="color:#065f46; text-decoration:none; font-weight:bold;">Help Center</a> or contact support directly if you have any questions. Call us at <strong>8982285510</strong>.
                                    </p>
                                    <a href="tel:8982285510"
                                        style="display: inline-block; background-color: #ffffff; color: #065f46; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 4px; border: 1px solid #065f46;">Contact
                                        Support</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer Section -->
                <tr>
                    <td align="center" class="content-padding" style="background-color: #ffffff; padding: 45px 40px;">

                        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">Stay
                            Connected</h3>
                        <p style="font-size: 13px; color: #6b7280; margin: 0 0 25px 0; line-height: 1.5;">
                            Follow us for the latest AI automation updates and tips.
                        </p>

                        <!-- Social Links -->
                        <table width="100%" style="max-width: 250px; margin: 0 auto;" cellpadding="0" cellspacing="0"
                            border="0">
                            <tr>
                                <td align="center">
                                    <a href="https://facebook.com/getaipilot.in"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/facebook-new.png"
                                            width="24" alt="Facebook" /></a>
                                    <a href="https://www.linkedin.com/company/getaipilot"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/linkedin.png" width="24"
                                            alt="LinkedIn" /></a>
                                    <a href="https://www.instagram.com/getaipilot/"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/instagram-new.png"
                                            width="24" alt="Instagram" /></a>
                                    <a href="https://youtube.com/@getaipilot.in"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/youtube-play.png"
                                            width="24" alt="YouTube" /></a>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size: 12px; color: #9ca3af; margin: 25px 0 0 0;">
                            &copy; 2026 GetAIPilot. All rights reserved.
                        </p>

                    </td>
                </tr>

            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </div>
    </center>
</body>

</html>`;
  } else if (
    k === 'getaipilot_magic_link_otp' ||
    k === 'magic_link_otp' ||
    k === 'otp_login' ||
    k === 'magic_link' ||
    k === 'magiclink' ||
    k === 'otp' ||
    k === 'getaipilot_magic_link' ||
    k === 'getaipilot_otp' ||
    k === 'gap_whatsapp_otp' ||
    k.includes('magic_link_otp') ||
    k.includes('auth_otp') ||
    k.includes('login_otp') ||
    k.includes('otp_')
  ) {
    finalSubject = normalizedVariables.subject || 'Your GetAiPilot Magic Login Code: {{ .Token }}';
    finalHtml = `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Magic Link Login - GetAIPilot</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;700&display=swap');

        body {
            margin: 0;
            padding: 0;
            min-width: 100%;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            background-color: #fafafa;
        }

        table {
            border-spacing: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        a {
            text-decoration: none;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .webkit {
            max-width: 600px;
            margin: 0 auto;
        }

        .outer {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            color: #111827;
            margin: 0 auto;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
            overflow: hidden;
        }

        @media screen and (max-width: 600px) {
            .feedback-table td {
                display: block;
                width: 100% !important;
                text-align: center !important;
            }

            .feedback-btn-container {
                margin-top: 15px;
            }

            .content-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0; background-color: #fafafa;">
    <center class="wrapper"
        style="width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #fafafa; padding-top: 40px; padding-bottom: 40px;">
        <div class="webkit" style="max-width: 600px; margin: 0 auto;">
            <!--[if (gte mso 9)|(IE)]>
            <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td>
            <![endif]-->
            <table class="outer" align="center"
                style="margin: 0 auto; width: 100%; max-width: 600px; background-color: #ffffff;">

                <!-- Logo -->
                <tr>
                    <td align="center" style="padding: 40px 20px 20px 20px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                            <tr>
                                <td style="padding-right: 10px;">
                                    <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png"
                                        alt="GetAIPilot Logo" width="36" height="36"
                                        style="width: 36px; height: 36px; display: block;">
                                </td>
                                <td style="vertical-align: middle;">
                                    <span
                                        style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Get
                                        AI Pilot</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Titles -->
                <tr>
                    <td align="center" class="content-padding"
                        style="padding: 10px 40px 20px 40px; text-align: center;">
                        <h1 style="font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 5px 0;">Magic Link
                        </h1>
                        <h2 style="font-size: 22px; font-weight: 700; color: #065f46; margin: 0 0 20px 0;">Secure Login</h2>

                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0;">
                            Click the button below to securely sign in to your <strong>GetAIPilot</strong> account. No password required!
                        </p>

                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 20px 0 0 0;">
                            Or, use this verification code: <strong>{{ .Token }}</strong>
                        </p>
                    </td>
                </tr>

                <!-- Subtext -->
                <tr>
                    <td align="center" class="content-padding" style="padding: 0 40px 25px 40px; text-align: center;">
                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0;">
                            If you did not request this magic link, you can safely ignore this email.
                        </p>
                    </td>
                </tr>

                <!-- Main CTA -->
                <tr>
                    <td align="center" style="padding: 0 40px 30px 40px;">
                        <a href="{{ .ConfirmationURL }}"
                            style="display: inline-block; background-color: #065f46; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 4px; box-shadow: 0 2px 4px rgba(6, 95, 70, 0.2);">Log In Securely</a>
                    </td>
                </tr>

                <!-- Fallback link -->
                <tr>
                    <td align="center" style="padding: 0 40px 45px 40px;">
                        <p style="font-size:13px; color:#9ca3af; line-height:1.4; margin:0;">
                            If the button doesn't work, copy and paste this URL into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color:#065f46; word-break:break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                    </td>
                </tr>

                <!-- Help Section (Light Green/Gray Bg) -->
                <tr>
                    <td
                        style="background-color: #f0fdf4; padding: 35px 40px; border-top: 1px solid #dcfce7; border-bottom: 1px solid #dcfce7;">
                        <table class="feedback-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center" valign="middle" style="text-align: center;">
                                    <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">
                                        Need Help?</h3>
                                    <p style="font-size: 13px; color: #4b5563; margin: 0 0 15px 0; line-height: 1.5;">
                                        Check out our <a href="#" style="color:#065f46; text-decoration:none; font-weight:bold;">Help Center</a> or contact support directly if you have any questions. Call us at <strong>8982285510</strong>.
                                    </p>
                                    <a href="tel:8982285510"
                                        style="display: inline-block; background-color: #ffffff; color: #065f46; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 4px; border: 1px solid #065f46;">Contact
                                        Support</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer Section -->
                <tr>
                    <td align="center" class="content-padding" style="background-color: #ffffff; padding: 45px 40px;">

                        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">Stay
                            Connected</h3>
                        <p style="font-size: 13px; color: #6b7280; margin: 0 0 25px 0; line-height: 1.5;">
                            Follow us for the latest AI automation updates and tips.
                        </p>

                        <!-- Social Links -->
                        <table width="100%" style="max-width: 250px; margin: 0 auto;" cellpadding="0" cellspacing="0"
                            border="0">
                            <tr>
                                <td align="center">
                                    <a href="https://facebook.com/getaipilot.in"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/facebook-new.png"
                                            width="24" alt="Facebook" /></a>
                                    <a href="https://www.linkedin.com/company/getaipilot"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/linkedin.png" width="24"
                                            alt="LinkedIn" /></a>
                                    <a href="https://www.instagram.com/getaipilot/"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/instagram-new.png"
                                            width="24" alt="Instagram" /></a>
                                    <a href="https://youtube.com/@getaipilot.in"
                                        style="text-decoration: none; margin: 0 8px;"><img
                                            src="https://img.icons8.com/ios-filled/50/6b7280/youtube-play.png"
                                            width="24" alt="YouTube" /></a>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size: 12px; color: #9ca3af; margin: 25px 0 0 0;">
                            &copy; 2026 GetAIPilot. All rights reserved.
                        </p>

                    </td>
                </tr>

            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </div>
    </center>
</body>

</html>`;
  } else if (k === 'getaipilot_verification' || k === 'verification' || k.includes('getaipilot_auth') || k.includes('getaipilot_signup')) {
    finalSubject = 'Verify your GetAiPilot account – unlock Telegram, WhatsApp, SocialPilot & AI automation!';
    finalHtml = `
      <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="padding: 20px 16px; text-align: center;">
          <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 30px; width: auto; vertical-align: middle; margin-right: 8px;" alt="Logo">
          <span style="font-weight: 700; color: #111827; font-size: 22px; letter-spacing: -0.5px; vertical-align: middle;">getaipilot</span>
        </div>
        <div style="background: linear-gradient(135deg, #10183f 0%, #1b2360 50%, #8b3cff 100%); padding: 32px 28px; color: #ffffff; text-align: left; border-radius: 12px;">
          <p style="font-size: 15px; margin: 0 0 4px 0; color: rgba(255,255,255,0.85);">Hi ${name},</p>
          <h1 style="font-size: 28px; font-weight: 700; line-height: 1.25; margin: 0; color: #ffffff;">Welcome to <br />Get<span style="color: #d8b4fe;">AiPilot</span>!</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.4; max-width: 380px;">
            You’re one step closer to automating messaging, scaling with SocialPilot, and growing your audience.
          </p>
        </div>
        <div style="padding: 28px 20px; text-align: center;">
          <h2 style="font-weight: 700; color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Ready to take off?</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">Confirm your email to activate your dashboard and deploy your first automation.</p>
          <a href="{{ConfirmationURL}}" style="display: inline-block; background: linear-gradient(to right, #f43f5e, #8b5cf6); color: #ffffff; font-size: 15px; font-weight: 700; padding: 14px 32px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);">
            Confirm Your Email &rarr;
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; word-break: break-all;">
            If the button doesn’t work, copy and paste this link:<br>
            <a href="{{ConfirmationURL}}" style="color: #8b5cf6;">{{ConfirmationURL}}</a>
          </p>
        </div>
        <div style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">GetAiPilot Engine &bull; SuperMailBox CPaaS</p>
        </div>
      </div>
    `;
  } else if (k === 'password_reset' || k.includes('reset_password') || k.includes('pwd_reset')) {
    finalSubject = 'Reset Your GetAiPilot Password';
    finalHtml = `
      <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 14px; text-align: center;">
        <div style="background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; margin-bottom: 20px;">SECURITY NOTICE</div>
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 12px 0;">Reset Your Password</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          We received a request to reset the password for your account associated with <strong>{{email}}</strong>. Click the button below to proceed:
        </p>
        <a href="{{reset_link}}" style="background: #0284c7; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; display: inline-block; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
          Reset My Password &rarr;
        </a>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">This secure link expires in 15 minutes. If you did not initiate this request, no action is required.</p>
        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          GetAiPilot Security &bull; SuperMailBox CPaaS
        </div>
      </div>
    `;
  } else if (k === 'review_notification' || k.includes('review')) {
    finalSubject = normalizedVariables.subject || '[Review] New User Feedback Received';
    finalHtml = `
      <div style="font-family: sans-serif; padding: 24px; border: 1px solid #eee; border-radius: 12px; max-width: 540px; margin: 0 auto; background: #ffffff;">
        <h2 style="color: #1da851; margin-top: 0;">New {{source}} Review ⭐</h2>
        <p><strong>User:</strong> {{user_name}} ({{user_email}})</p>
        <p><strong>Rating:</strong> {{rating}} / 5 Stars</p>
        <p><strong>Source:</strong> {{source}}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 18px 0;" />
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #1da851;">
          <p style="font-style: italic; color: #334155; margin: 0;">"{{content}}"</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; text-align: center;">Sent via SuperMailBox &bull; GetAiPilot</p>
      </div>
    `;
  } else if (k === 'waitlist_notification' || k.includes('waitlist')) {
    finalSubject = normalizedVariables.subject || '🚀 New Waitlist Join: {{feature_name}}';
    finalHtml = `
      <div style="font-family: sans-serif; padding: 24px; border: 1px solid #eee; border-radius: 12px; max-width: 500px; margin: 0 auto; background: #ffffff;">
        <h2 style="color: #1da851; text-align: center; margin-top: 0;">New Feature Interest! 🚀</h2>
        <p style="font-size: 15px; color: #333;">Someone is excited about a new feature on <strong>GetAiPilot</strong>.</p>
        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #8b5cf6;">
          <p style="margin: 4px 0;"><strong>Feature:</strong> {{feature_name}}</p>
          <p style="margin: 4px 0;"><strong>User Email:</strong> {{email}}</p>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center;">This user wants to be notified when this feature goes live.</p>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 20px; text-align: center;">GetAiPilot Admin Notifications &bull; SuperMailBox</p>
      </div>
    `;
  } else if (k === 'newsletter_notification' || k.includes('newsletter')) {
    finalSubject = normalizedVariables.subject || 'New Newsletter Subscriber! 📧';
    finalHtml = `
      <div style="font-family: sans-serif; padding: 24px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #1da851; margin-top: 0;">New Newsletter Subscriber! 📧</h2>
        <p>A new user has just subscribed to the GetAiPilot newsletter.</p>
        <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; border-left: 4px solid #1da851; margin: 18px 0;">
          <strong>Email:</strong> {{email}}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
          Sent via SuperMailBox &bull; GetAiPilot Dashboard
        </p>
      </div>
    `;
  } else if (k === 'ai_welcome_followup' || k.includes('followup')) {
    finalSubject = normalizedVariables.subject || 'Welcome to GetAiPilot! 🚀';
    finalHtml = normalizedVariables.html || `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 16px; background-color: #f8fafc; color: #334155;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); padding: 44px 38px; text-align: left;">
          <div style="margin-bottom: 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; padding-right: 10px;">
                  <img src="https://uklxlappjcuvdqjvecfh.supabase.co/storage/v1/object/public/Emails%20images/logo.png" style="height: 28px; width: auto; display: block;" alt="GetAiPilot Logo" />
                </td>
                <td style="vertical-align: middle;">
                  <span style="font-weight: 700; color: #0f172a; font-size: 20px; letter-spacing: -0.4px;">get<span style="color: #2563eb;">aipilot</span></span>
                </td>
              </tr>
            </table>
          </div>
          <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.4px; line-height: 1.3;">
            Welcome to GetAiPilot! 👋
          </h1>
          <div style="font-size: 15px; line-height: 1.65; color: #334155; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0;">Hey ${name},</p>
            <p style="margin: 0 0 16px 0;">Thanks for signing up for GetAiPilot! We are thrilled to help you automate and grow your business operations.</p>
            <p style="margin: 0;">Here are the key platforms you can explore right now:</p>
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 16px; vertical-align: top; padding: 6px 0; font-size: 16px; color: #2563eb; line-height: 1.6;">&bull;</td>
              <td style="vertical-align: top; padding: 6px 0 6px 8px; font-size: 14px; line-height: 1.6; color: #334155;">
                <strong style="color: #0f172a;">GAP Telegram Automation:</strong> Monetize, track, and automate your Telegram groups and channels.
              </td>
            </tr>
            <tr>
              <td style="width: 16px; vertical-align: top; padding: 6px 0; font-size: 16px; color: #2563eb; line-height: 1.6;">&bull;</td>
              <td style="vertical-align: top; padding: 6px 0 6px 8px; font-size: 14px; line-height: 1.6; color: #334155;">
                <strong style="color: #0f172a;">GAP Custom CRM:</strong> Deploy an all-in-one CRM engine with invoicing, payroll, and leads management.
              </td>
            </tr>
            <tr>
              <td style="width: 16px; vertical-align: top; padding: 6px 0; font-size: 16px; color: #2563eb; line-height: 1.6;">&bull;</td>
              <td style="vertical-align: top; padding: 6px 0 6px 8px; font-size: 14px; line-height: 1.6; color: #334155;">
                <strong style="color: #0f172a;">GAP-WhatsApp Pilot:</strong> Hook up WhatsApp Business API to send broadcasts and auto-replies.
              </td>
            </tr>
            <tr>
              <td style="width: 16px; vertical-align: top; padding: 6px 0; font-size: 16px; color: #2563eb; line-height: 1.6;">&bull;</td>
              <td style="vertical-align: top; padding: 6px 0 6px 8px; font-size: 14px; line-height: 1.6; color: #334155;">
                <strong style="color: #0f172a;">GAP-Social Pilot:</strong> Schedule, broadcast, and auto-publish content across Instagram, LinkedIn, X, and Facebook.
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin-bottom: 36px;">
            <a href="https://getaipilot.in/dashboard" style="background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 36px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);">
              Go to Dashboard &rarr;
            </a>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center; font-size: 13px; color: #94a3b8; line-height: 1.5;">
            GetAiPilot Team &copy; 2026
          </div>
        </div>
      </div>
    `;
  } else {
    // Default fallback
    finalSubject = `${campaignName}`;
    finalHtml = `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0C; color: #E5E1E4; padding: 40px; border-radius: 16px; border: 1px solid #2A2A2C;">
        <div style="margin-bottom: 24px;">
          <span style="background: #0052FF; color: white; padding: 8px 18px; border-radius: 999px; font-weight: 700; font-size: 14px;">SupermailBox CPaaS</span>
        </div>
        <h1 style="color: #FFFFFF; font-size: 24px; margin-bottom: 16px;">${campaignName}</h1>
        <p style="color: #C7C4D7; font-size: 16px; line-height: 1.6;">Hi <strong style="color: #FFFFFF;">${name}</strong>,</p>
        <p style="color: #C7C4D7; font-size: 16px; line-height: 1.6;">
          You have a new notification or update.
        </p>
        <p style="color: #8E8D9E; font-size: 13px; border-top: 1px solid #2A2A2C; padding-top: 20px; margin-top: 36px;">
          Sent to ${normalizedVariables.email || 'you'} via SupermailBox Dedicated Messaging Infrastructure
        </p>
      </div>
    `;
  }

  const finalSubjectInterpolated = interpolateVariables(finalSubject, normalizedVariables);
  let finalHtmlInterpolated = interpolateVariables(finalHtml, normalizedVariables);
  if (normalizedVariables.ConfirmationURL) {
    finalHtmlInterpolated = injectActionLinkFallback(finalHtmlInterpolated, normalizedVariables.ConfirmationURL);
  }

  return {
    subject: finalSubjectInterpolated,
    html: addResponsiveEmailFixes(finalHtmlInterpolated)
  };
}

function injectActionLinkFallback(html: string, actionUrl: string): string {
  if (!actionUrl) return html;
  // If the button href still contains literal 'https://getaipilot.in' (without auth parameters), replace it on onboarding/CTA buttons
  return html.replace(
    /(<a\b[^>]*\bhref=["'])https:\/\/getaipilot\.in\/?(["'][^>]*>[\s\S]*?(?:Complete\s+Onboarding|Finish\s+onboarding|Complete\s+your\s+onboarding|Setup|Get\s+Started)[\s\S]*?<\/a>)/gi,
    `$1${actionUrl}$2`
  );
}

function interpolateVariables(source: string, variables: Record<string, any>): string {
  return source.replace(/\{\{\s*\.?\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

function withDefaultTemplateVariables(variables: Record<string, any>): Record<string, any> {
  const confirmationUrl =
    variables.ConfirmationURL ||
    variables.confirmation_url ||
    variables.confirmationUrl ||
    variables.verify_url ||
    variables.verifyUrl ||
    variables.login_url ||
    variables.loginUrl ||
    variables.login_link ||
    variables.loginLink ||
    variables.magic_link ||
    variables.magicLink ||
    variables.onboarding_url ||
    variables.onboardingUrl ||
    variables.action_url ||
    variables.actionUrl;

  const otpToken =
    variables.Token ||
    variables.token ||
    variables.otp ||
    variables.OTP ||
    variables.otp_code ||
    variables.otpCode ||
    variables.security_code ||
    variables.code;

  return {
    ...variables,
    Token: otpToken,
    token: otpToken,
    otp: otpToken,
    OTP: otpToken,
    otp_code: otpToken,
    otpCode: otpToken,
    code: otpToken,
    security_code: otpToken,
    ConfirmationURL: confirmationUrl,
    confirmation_url: confirmationUrl,
    confirmationUrl: confirmationUrl,
    verify_url: confirmationUrl,
    verifyUrl: confirmationUrl,
    login_url: confirmationUrl,
    loginUrl: confirmationUrl,
    login_link: confirmationUrl,
    loginLink: confirmationUrl,
    magic_link: confirmationUrl,
    magicLink: confirmationUrl,
    onboarding_url: confirmationUrl,
    onboardingUrl: confirmationUrl,
    action_url: confirmationUrl,
    actionUrl: confirmationUrl
  };
}
