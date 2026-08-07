import { supabase } from '../supabase.js';
import { addResponsiveEmailFixes } from './responsiveEmail.js';

export async function renderTemplate(
  templateKey: string,
  variables: Record<string, any>
): Promise<{ subject: string; html: string }> {
  const normalizedVariables = withDefaultTemplateVariables(variables);

  try {
    // Attempt to lookup template by ID or key from database
    let dbRow: any = null;

    // Check by ID first if templateKey is a UUID/ID
    const { data: byId } = await supabase
      .from('email_templates')
      .select('id, key, name, subject, compiled_html, mjml_content, current_version_id')
      .eq('id', templateKey)
      .maybeSingle();

    if (byId) {
      dbRow = byId;
    } else {
      const { data: byKey } = await supabase
        .from('email_templates')
        .select('id, key, name, subject, compiled_html, mjml_content, current_version_id')
        .eq('key', templateKey)
        .maybeSingle();
      dbRow = byKey;
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
        return {
          subject: interpolateVariables(subject, normalizedVariables),
          html: addResponsiveEmailFixes(interpolateVariables(html, normalizedVariables)),
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

  return {
    subject: interpolateVariables(finalSubject, normalizedVariables),
    html: addResponsiveEmailFixes(interpolateVariables(finalHtml, normalizedVariables))
  };
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
    variables.verifyUrl;

  return {
    ...variables,
    ConfirmationURL: confirmationUrl,
    confirmation_url: confirmationUrl,
    confirmationUrl: confirmationUrl,
    verify_url: confirmationUrl,
    verifyUrl: confirmationUrl
  };
}
