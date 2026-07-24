import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Layout, Code, Monitor, Smartphone, Save, Check, Plus, X, Layers, ChevronDown, Eye, Braces, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import type { Template } from '../services/api';

interface TemplateBuilderProps {
  templates: Template[];
  templateKey: string;
  onBack: () => void;
  onPromoteVersion?: (templateKey: string, versionName: string) => void;
  onSaveDraft?: (templateKey: string, subject: string, html: string) => void;
}

interface SimpleEmailContent {
  badgeText: string;
  heading: string;
  body: string;
  featureBox: 'none' | 'otp' | 'receipt';
  ctaLabel: string;
  ctaUrl: string;
  footerText: string;
}

const RESPONSIVE_EMAIL_STYLE_ID = 'supermailbox-responsive-email-fixes';

const addResponsiveEmailFixes = (html: string) => {
  if (!html || html.includes(`id="${RESPONSIVE_EMAIL_STYLE_ID}"`)) return html;

  const style = `<style id="${RESPONSIVE_EMAIL_STYLE_ID}">
@media only screen and (max-width: 480px) {
  body { margin: 0 !important; padding: 0 !important; }
  div[style*="max-width:600px"],
  div[style*="max-width: 600px"],
  table[style*="max-width:600px"],
  table[style*="max-width: 600px"] {
    width: 100% !important;
    max-width: 100% !important;
  }
  div[style*="display:flex"],
  div[style*="display: flex"] {
    display: block !important;
  }
  div[style*="flex:0 0 180px"],
  div[style*="flex: 0 0 180px"],
  div[style*="width:180px"],
  div[style*="width: 180px"] {
    width: 150px !important;
    max-width: 72% !important;
    margin: 0 auto 18px auto !important;
  }
  a[style*="linear-gradient"],
  a[style*="background: linear-gradient"] {
    display: block !important;
    width: 100% !important;
    max-width: 260px !important;
    margin: 0 auto !important;
    padding: 14px 16px !important;
    text-align: center !important;
    white-space: normal !important;
    word-break: normal !important;
    box-sizing: border-box !important;
  }
  h1, h2, h3, p { text-align: left !important; }
}
</style>`;

  return html.includes('</head>') ? html.replace('</head>', `${style}</head>`) : `${style}${html}`;
};

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  templates,
  templateKey,
  onBack,
  onSaveDraft,
}) => {
  const activeTemplate = templates.find((t) => t.key === templateKey) || templates[0];

  const liveVersion = activeTemplate?.versions.find((v) => v.status === 'Live') || activeTemplate?.versions[0];
  const templateVariables = liveVersion?.variables?.length ? liveVersion.variables : ['name', 'otp_code', 'amount'];
  const templateStatus = liveVersion?.status || 'Draft';
  const [subject, setSubject] = useState(liveVersion?.subject || 'Welcome to GetAIPilot! 🚀');

  const getInitialContent = (key: string): { color: string, content: SimpleEmailContent } => {
    if (key.includes('billing') || key.includes('receipt') || key.includes('payment')) {
      return {
        color: '#24754E',
        content: {
          badgeText: 'PAYMENT CONFIRMED',
          heading: 'Payment Received Successfully! 💳',
          body: 'Hi {{name}}, we have processed your payment successfully. Here is your transaction summary:',
          featureBox: 'receipt',
          ctaLabel: 'Download Invoice PDF →',
          ctaUrl: 'https://getaipilot.com/billing',
          footerText: '© 2026 GetAIPilot Billing Services. All rights reserved.'
        }
      };
    } else if (key.includes('welcome') || key.includes('auth')) {
      return {
        color: '#2357D8',
        content: {
          badgeText: 'ACCOUNT VERIFICATION',
          heading: 'Welcome Aboard, {{name}}! 🎉',
          body: 'We are thrilled to have you onboard. Please use the security verification code below to confirm your login session.',
          featureBox: 'otp',
          ctaLabel: 'Launch Dashboard →',
          ctaUrl: 'https://getaipilot.com/app',
          footerText: '© 2026 GetAIPilot Core Platform. All rights reserved.'
        }
      };
    } else {
      return {
        color: '#0D4F3C',
        content: {
          badgeText: 'EXCITING NEWS',
          heading: 'New Announcement for {{name}} 🚀',
          body: 'We have launched new autonomous features to help you automate workflows and boost productivity.',
          featureBox: 'none',
          ctaLabel: 'Explore Features →',
          ctaUrl: 'https://getaipilot.com/features',
          footerText: '© 2026 GetAIPilot Core Platform. All rights reserved.'
        }
      };
    }
  };

  const initialSettings = getInitialContent(templateKey);
  const [accentColor, setAccentColor] = useState<string>(initialSettings.color);
  const [content, setContent] = useState<SimpleEmailContent>(initialSettings.content);

  const [mode, setMode] = useState<'simple' | 'ai'>('simple');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'code'>(liveVersion?.html ? 'code' : 'desktop');
  const [showSampleData, setShowSampleData] = useState<boolean>(true);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Light Theme Compiled HTML
  const generateCompiledHtml = () => {
    const badgeHtml = content.badgeText
      ? `<div style="text-align: center; margin-bottom: 22px;">
  <span style="background: ${accentColor}; color: #FFFFFC; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">
    ${content.badgeText}
  </span>
</div>`
      : '';

    const headingHtml = content.heading
      ? `<div style="text-align: center; margin-bottom: 20px;">
  <h1 style="color: #252722; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.02em; font-family: 'Host Grotesk', sans-serif;">${content.heading}</h1>
</div>`
      : '';

    const bodyHtml = content.body
      ? `<div style="color: #676D63; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center; font-family: 'Host Grotesk', sans-serif;">
  ${content.body.replace(/\n/g, '<br/>')}
</div>`
      : '';

    let featureHtml = '';
    if (content.featureBox === 'otp') {
      featureHtml = `<div style="margin: 28px auto; text-align: center; background: #F8F8F6; border: 1px solid #D9D6CD; padding: 24px; border-radius: 12px; max-width: 280px;">
  <div style="font-size: 12px; font-weight: 600; color: #676D63; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; font-family: 'Host Grotesk', sans-serif;">Security Code</div>
  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; color: ${accentColor}; letter-spacing: 0.1em;">{{otp_code}}</span>
</div>`;
    } else if (content.featureBox === 'receipt') {
      featureHtml = `<div style="background: #FFFFFC; border: 1px solid #D9D6CD; border-radius: 12px; padding: 24px; margin: 24px 0; font-family: 'Host Grotesk', sans-serif;">
  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1EFEA; padding-bottom: 12px; margin-bottom: 14px;">
    <span style="color: #676D63; font-size: 14px;">Invoice Number</span>
    <strong style="color: #252722; font-size: 14px;">{{invoice_id}}</strong>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <span style="color: #676D63; font-size: 14px;">Total Paid</span>
    <strong style="color: #24754E; font-size: 22px; font-weight: 700;">{{amount}}</strong>
  </div>
</div>`;
    }

    const ctaHtml = content.ctaLabel
      ? `<div style="text-align: center; margin: 32px 0;">
  <a href="${content.ctaUrl || 'https://getaipilot.com'}" style="display: inline-block; background: ${accentColor}; color: #FFFFFC; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-family: 'Host Grotesk', sans-serif;">
    ${content.ctaLabel}
  </a>
</div>`
      : '';

    const footerHtml = content.footerText
      ? `<div style="border-top: 1px solid #F1EFEA; margin-top: 36px; padding-top: 24px; text-align: center;">
  <p style="color: #8B9187; font-size: 12px; line-height: 1.6; margin: 0; font-family: 'Host Grotesk', sans-serif;">${content.footerText}</p>
</div>`
      : '';

    return `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto;">
${badgeHtml}
${headingHtml}
${bodyHtml}
${featureHtml}
${ctaHtml}
${footerHtml}
</div>`;
  };

  const [customHtml, setCustomHtml] = useState<string | null>(liveVersion?.html || null);

  const sampleData: Record<string, string> = {
    name: 'Aarav Sharma',
    full_name: 'Aarav Sharma',
    otp_code: '849-201',
    amount: '₹2,499',
    invoice_id: 'INV-2026-9814',
    wallet_balance: '₹14,500',
    ConfirmationURL: 'https://mail.getaipilot.in/verify?preview=true',
    confirmation_url: 'https://mail.getaipilot.in/verify?preview=true',
    confirmationUrl: 'https://mail.getaipilot.in/verify?preview=true',
    verify_url: 'https://mail.getaipilot.in/verify?preview=true'
  };

  const getActiveHtml = () => addResponsiveEmailFixes(customHtml !== null ? customHtml : generateCompiledHtml());

  const getRenderedPreview = () => {
    let previewHtml = getActiveHtml();
    if (!showSampleData) return previewHtml;
    Object.entries(sampleData).forEach(([key, val]) => {
      previewHtml = previewHtml.replace(new RegExp(`\\{\\{\\s*\\.?\\s*${key}\\s*\\}\\}`, 'g'), val);
    });
    return previewHtml;
  };

  const editorHtml = getActiveHtml();
  const editorLineNumbers = useMemo(
    () => editorHtml.split('\n').map((_, index) => index + 1),
    [editorHtml]
  );
  const readinessItems = [
    { state: 'pass', label: 'Subject line', detail: subject.trim() ? subject : 'Missing subject' },
    { state: templateVariables.length ? 'pass' : 'warn', label: 'Variables', detail: `${templateVariables.length} merge field${templateVariables.length === 1 ? '' : 's'}` },
    { state: editorHtml.includes(RESPONSIVE_EMAIL_STYLE_ID) ? 'pass' : 'fail', label: 'Responsive CSS', detail: editorHtml.includes(RESPONSIVE_EMAIL_STYLE_ID) ? 'Attached' : 'Not attached' },
  ];

  // Removed event listeners for templateMenuRef

  // Removed handleTemplateSelect

  const handleGenerateAi = (promptText: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      if (promptText.toLowerCase().includes('payment') || promptText.toLowerCase().includes('receipt')) {
        setSubject('Payment Confirmed - Receipt {{invoice_id}} 💳');
        setAccentColor('#24754E');
        setContent({
          badgeText: 'PAYMENT CONFIRMED',
          heading: 'Payment Received Successfully! 💳',
          body: 'Hi {{name}}, your payment was processed successfully. Thank you for your continued partnership!',
          featureBox: 'receipt',
          ctaLabel: 'Download Invoice PDF →',
          ctaUrl: 'https://getaipilot.com/billing',
          footerText: '© 2026 GetAIPilot Billing Services. All rights reserved.'
        });
      } else if (promptText.toLowerCase().includes('welcome') || promptText.toLowerCase().includes('otp')) {
        setSubject('Welcome to GetAIPilot Autonomous Suite 🚀');
        setAccentColor('#2357D8');
        setContent({
          badgeText: 'ACCOUNT VERIFIED',
          heading: 'Welcome Aboard, {{name}}! 🎉',
          body: 'We are thrilled to have you onboard. Use your security code below to complete sign-in:',
          featureBox: 'otp',
          ctaLabel: 'Launch Dashboard →',
          ctaUrl: 'https://getaipilot.com/app',
          footerText: '© 2026 GetAIPilot Core Platform. All rights reserved.'
        });
      } else {
        setSubject('Exciting Update: New Features Live! ✨');
        setAccentColor('#0D4F3C');
        setContent({
          badgeText: 'PRODUCT ANNOUNCEMENT',
          heading: 'Supercharge Your Email Workflows ⚡',
          body: 'Hi {{name}}, our team has just deployed major updates including 1-click broadcasts and smart suppression management.',
          featureBox: 'none',
          ctaLabel: 'See What’s New →',
          ctaUrl: 'https://getaipilot.com/changelog',
          footerText: '© 2026 GetAIPilot Product Team. All rights reserved.'
        });
      }
      setIsGenerating(false);
      setMode('simple');
    }, 500);
  };

  const handleSave = () => {
    if (onSaveDraft) {
      onSaveDraft(selectedKey, subject, getActiveHtml());
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Removed handleCreateNewTemplate

  return (
    <div className={`template-workshop mode-${mode}`}>
      
      {/* Background Dotted Canvas */}
      <div className="template-grid-bg" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      }} />

      <header className="template-studio-command">
        <div className="template-toolbar-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Back
          </button>
          <span>Templates</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '1rem', fontWeight: 300 }}>/</span>
          <strong>{activeTemplate?.name || 'Email builder'}</strong>
        </div>
        <div className="template-toolbar-actions">
          <span className={`template-status-badge status-${templateStatus.toLowerCase()}`}>
            <ShieldCheck size={14} /> {templateStatus}
          </span>
          <button type="button" className={showSampleData ? 'active' : ''} onClick={() => setShowSampleData(!showSampleData)}>
            <Layers size={14} /> {showSampleData ? 'Sample' : 'Raw'}
          </button>
          <button type="button" className="primary" onClick={handleSave}>
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            {saveSuccess ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      {/* LEFT FLOATING PROPERTIES PANEL */}
      <div className="template-tools-panel" style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Template Selector Header */}
        {/* Removed template selector */}

        {/* Tabbed Editor Modes */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="template-mode-tabs">
            <button className={`template-mode-tab ${mode === 'simple' ? 'active' : ''}`} onClick={() => { setMode('simple'); setCustomHtml(null); setPreviewMode('desktop'); }}>
              <Layout size={14} /> Form
            </button>
            <button className={`template-mode-tab ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>
              <Sparkles size={14} /> AI
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email Subject Line</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="ui-input" style={{ width: '100%', fontWeight: 500, boxShadow: 'none' }} />
          </div>

          {mode === 'simple' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Badge Label</label>
                <input type="text" value={content.badgeText} onChange={(e) => setContent({ ...content, badgeText: e.target.value })} className="ui-input" style={{ width: '100%', boxShadow: 'none' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Main Heading</label>
                <input type="text" value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} className="ui-input" style={{ width: '100%', boxShadow: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Body Text</label>
                <textarea value={content.body} onChange={(e) => setContent({ ...content, body: e.target.value })} className="ui-input" style={{ width: '100%', height: '100px', resize: 'vertical', boxShadow: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Feature Block</label>
                <select value={content.featureBox} onChange={(e) => setContent({ ...content, featureBox: e.target.value as any })} className="ui-input" style={{ width: '100%', boxShadow: 'none' }}>
                  <option value="none">None (Standard Text)</option>
                  <option value="otp">Security Code Box</option>
                  <option value="receipt">Invoice Receipt</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>CTA Button</label>
                  <input type="text" value={content.ctaLabel} onChange={(e) => setContent({ ...content, ctaLabel: e.target.value })} className="ui-input" style={{ width: '100%', boxShadow: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>CTA URL</label>
                  <input type="text" value={content.ctaUrl} onChange={(e) => setContent({ ...content, ctaUrl: e.target.value })} className="ui-input" style={{ width: '100%', boxShadow: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Footer Notes</label>
                <input type="text" value={content.footerText} onChange={(e) => setContent({ ...content, footerText: e.target.value })} className="ui-input" style={{ width: '100%', fontSize: '0.75rem', boxShadow: 'none' }} />
              </div>
            </div>
          )}

          {mode === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(to right, rgba(1, 11, 201, 0.08), rgba(1, 11, 201, 0.02))', border: '1px solid rgba(1, 11, 201, 0.15)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>AI Email Architect</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-body)', margin: 0 }}>Describe the email purpose and the AI will construct the ideal layout and copy.</p>
              </div>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. Write a friendly welcome email for new users..." className="ui-input" style={{ width: '100%', height: '140px', boxShadow: 'none' }} />
              <button onClick={() => handleGenerateAi(aiPrompt)} disabled={isGenerating} className="btn-primary" style={{ width: '100%' }}>
                {isGenerating ? 'Architecting...' : 'Generate Design'}
              </button>
            </div>
          )}



        </div>
      </div>

      {/* CENTER STAGE (CANVAS) */}
      <div className="template-preview-stage">
        <div className="template-preview-header">
          <div>
            <span className="screen-kicker"><Eye size={14} /> Live rendering</span>
            <h3>{subject || 'Untitled subject'}</h3>
          </div>
          <div className="template-preview-switch">
            <button type="button" onClick={() => setPreviewMode('desktop')} className={previewMode === 'desktop' ? 'active' : ''}>
              <Monitor size={14} /> Desktop
            </button>
            <button type="button" onClick={() => setPreviewMode('mobile')} className={previewMode === 'mobile' ? 'active' : ''}>
              <Smartphone size={14} /> Mobile
            </button>
            <button type="button" onClick={() => { if (customHtml === null) setCustomHtml(generateCompiledHtml()); setPreviewMode('code'); }} className={previewMode === 'code' ? 'active' : ''}>
              <Code size={14} /> Code
            </button>
          </div>
        </div>
        
        {/* Rendered email frame or Code editor */}
        {previewMode === 'code' ? (
          <div className="template-code-editor" aria-label="HTML code editor" style={{ flex: 1, minHeight: 0, height: '100%' }}>
            <div className="template-code-lines" aria-hidden="true">
              {editorLineNumbers.map((line) => <span key={line}>{line}</span>)}
            </div>
            <textarea
              value={editorHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              spellCheck={false}
              style={{ height: `${Math.max(100, editorLineNumbers.length * 21)}px` }}
            />
          </div>
        ) : (
          <div className={`template-device-frame ${previewMode === 'mobile' ? 'mobile-preview-frame' : 'desktop-preview-frame'}`} style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0
          }}>
            <div style={{ flex: 1, padding: previewMode === 'mobile' ? '24px 0 0 0' : '0', background: '#ffffff', overflow: 'hidden', display: 'flex' }}>
               <iframe
                 title="Email Preview"
                 srcDoc={getRenderedPreview()}
                 style={{ width: '100%', height: '100%', border: 'none' }}
                 sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
               />
            </div>
          </div>
        )}

      </div>

      <aside className="template-inspector-panel" aria-label="Template inspector">
        <div className="template-inspector-block">
          <div className="template-inspector-row head">
            <span>Template meta</span>
            <strong>{activeTemplate?.key || templateKey}</strong>
          </div>
          <div className="template-inspector-row">
            <span>Mode</span>
            <strong>{mode === 'simple' ? 'Form' : 'AI draft'}</strong>
          </div>
          <div className="template-inspector-row">
            <span><Braces size={14} /> Variables</span>
            <div className="template-token-list">
              {templateVariables.map((variable) => <code key={variable}>{`{{${variable}}}`}</code>)}
            </div>
          </div>
          <div className="template-inspector-row preflight">
            <span><ShieldCheck size={14} /> Preflight</span>
            <ul className="template-check-list">
              {readinessItems.map((item) => (
                <li key={item.label} className={item.state}>
                  {item.state === 'pass' ? <Check size={14} /> : item.state === 'warn' ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Removed create modal */}

    </div>
  );
};
