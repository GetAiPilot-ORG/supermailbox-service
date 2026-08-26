import React, { useState } from 'react';
import { Copy, Check, Share2, Link2, Mail, Phone, Tag, Sparkles } from 'lucide-react';
import type { BrandSocialProfile } from '../../brand-library/types/brand.types';
import { GradientColorPicker } from '../../brand-library/components/GradientColorPicker';

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fd7043, #ff8a65)',
  'linear-gradient(135deg, #30cfd0, #330867)',
];

const isGradient = (v: string) =>
  v.includes('linear-gradient') || v.includes('radial-gradient');

type Props = {
  subject: string;
  preheader: string;
  selected: any;
  onSubjectChange: (value: string) => void;
  onPreheaderChange: (value: string) => void;
  onSelectedChange: (patch: unknown) => void;
  socialProfiles?: BrandSocialProfile[];
};

export const BuilderSettingsPanel: React.FC<Props> = ({
  subject,
  preheader,
  selected,
  onSubjectChange,
  onPreheaderChange,
  onSelectedChange,
  socialProfiles = [],
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [gradientValue, setGradientValue] = useState('linear-gradient(135deg, #667eea, #764ba2)');
  const [gradientApplied, setGradientApplied] = useState<'text' | 'bg' | null>(null);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedToken(tag);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Build dynamic list of social tokens based on saved profiles or standard fallbacks
  const defaultSocials = ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube'];
  const userSocialPlatforms = socialProfiles.map(sp => sp.platform.toLowerCase().replace(/[^a-z0-9]+/g, ''));
  const allSocialSlugs = userSocialPlatforms.length > 0
    ? Array.from(new Set(userSocialPlatforms))
    : defaultSocials;

  const socialTokens = allSocialSlugs.map(slug => ({
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
    tag: `{{brand.social.${slug}}}`,
  }));

  const standardTokens = [
    '{{first_name}}',
    '{{last_name}}',
    '{{email}}',
    '{{company_name}}',
    '{{brand.support_email}}',
    '{{brand.unsubscribe_url}}',
    '{{current_year}}',
  ];

  // Extract links from selected.content if present
  const contentHtml = String(selected?.content || '');
  const linkMatches = Array.from(contentHtml.matchAll(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi));

  const parsedLinks = linkMatches.map((m, index) => {
    const fullTag = m[0];
    const href = m[1];
    const innerHtml = m[2];
    const plainText = innerHtml.replace(/<[^>]+>/g, '').trim() || href || `Link ${index + 1}`;

    const colorMatch = fullTag.match(/color:\s*([^;"'\s]+)/i);
    let color = colorMatch ? colorMatch[1] : '#2563eb';
    if (!color.startsWith('#') || color.length !== 7) color = '#2563eb';

    return { index, fullTag, href, innerHtml, plainText, color };
  });

  const handleLinkColorChange = (index: number, newColor: string) => {
    if (!linkMatches[index]) return;
    const targetLink = linkMatches[index][0];

    let updatedLink = targetLink;
    if (/style=["'][^"']*color:/i.test(updatedLink)) {
      updatedLink = updatedLink.replace(/color:\s*[^;"'\s]+/gi, `color: ${newColor}`);
    } else if (/style=["']/i.test(updatedLink)) {
      updatedLink = updatedLink.replace(/style=["']/i, `style="color: ${newColor}; `);
    } else {
      updatedLink = updatedLink.replace(/<a\s+/i, `<a style="color: ${newColor};" `);
    }

    if (/<span\s+[^>]*style=["'][^"']*color:/i.test(updatedLink)) {
      updatedLink = updatedLink.replace(/(<span\s+[^>]*style=["'][^"']*)color:\s*[^;"'\s]+/gi, `$1color: ${newColor}`);
    } else if (!/<span/i.test(updatedLink)) {
      const innerText = linkMatches[index][2];
      updatedLink = updatedLink.replace(innerText, `<span style="color: ${newColor};">${innerText}</span>`);
    }

    const newContent = contentHtml.replace(targetLink, updatedLink);
    onSelectedChange({ content: newContent });
  };

  return (
    <aside className="builder-side-panel settings" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
      <div>
        <h3>Document Properties</h3>
        <label>
          Subject
          <input className="ui-input" value={subject} onChange={(event) => onSubjectChange(event.target.value)} />
        </label>
        <label>
          Preheader
          <textarea className="ui-input" value={preheader} onChange={(event) => onPreheaderChange(event.target.value)} rows={2} />
        </label>
      </div>

      {/* ══ GRADIENT APPLY PANEL — Always Visible ══════════════════ */}
      <div style={{
        padding: '14px',
        background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)',
        border: '1.5px solid #c7d2fe',
        borderRadius: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Sparkles size={14} color="#7c3aed" />
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#4c1d95', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🌈 Apply Gradient</span>
        </div>

        {/* Live Gradient Preview Bar */}
        <div style={{
          height: '40px',
          borderRadius: '10px',
          background: gradientValue,
          border: '1px solid #e2e8f0',
          marginBottom: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'background 0.3s ease',
        }} />

        {/* GradientColorPicker */}
        <GradientColorPicker
          value={gradientValue}
          onChange={setGradientValue}
        />

        {/* Preset Swatch Row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', marginBottom: '10px' }}>
          {PRESET_GRADIENTS.map((g, i) => (
            <button
              key={i}
              type="button"
              title={g}
              onClick={() => setGradientValue(g)}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: g,
                border: gradientValue === g ? '2.5px solid #7c3aed' : '2px solid #e2e8f0',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
        </div>

        {/* Apply Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              const plainText = String(selected?.content || '').replace(/<[^>]+>/g, '').trim();
              const gradientHtml = `<span style="background:${gradientValue};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:inherit;font-size:inherit;font-family:inherit;display:inline-block;">${plainText}</span>`;
              onSelectedChange({ content: gradientHtml });
              setGradientApplied('text');
              setTimeout(() => setGradientApplied(null), 2000);
            }}
            style={{
              padding: '9px 6px',
              background: gradientApplied === 'text' ? '#d1fae5' : !selected ? '#e2e8f0' : gradientValue,
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: gradientApplied === 'text' ? '#065f46' : !selected ? '#94a3b8' : '#fff',
              cursor: selected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
              textShadow: (gradientApplied === 'text' || !selected) ? 'none' : '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            {gradientApplied === 'text' ? '✓ Applied!' : '🌈 Text'}
          </button>

          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              onSelectedChange({ style: { 'background': gradientValue, 'background-color': gradientValue } });
              setGradientApplied('bg');
              setTimeout(() => setGradientApplied(null), 2000);
            }}
            style={{
              padding: '9px 6px',
              background: gradientApplied === 'bg' ? '#d1fae5' : !selected ? '#e2e8f0' : '#1e1b4b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: gradientApplied === 'bg' ? '#065f46' : !selected ? '#94a3b8' : '#fff',
              cursor: selected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            {gradientApplied === 'bg' ? '✓ Applied!' : '🎨 Background'}
          </button>
        </div>

        <p style={{ margin: '8px 0 0', fontSize: '10px', color: !selected ? '#f97316' : '#7c3aed', lineHeight: 1.4, fontWeight: 600 }}>
          {selected ? '✅ Block selected — click a button to apply.' : '⚠️ Click a block on the canvas first, then apply.'}
        </p>
      </div>
      {/* ════════════════════════════════════════════════════════════ */}

      <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
        <h3>Selected Block</h3>
        {selected ? (
          <>
            {selected.type === 'image' ? (
              <>
                <label>
                  Image URL
                  <input
                    className="ui-input"
                    value={selected.content?.src || ''}
                    onChange={(event) => onSelectedChange({ content: { ...selected.content, src: event.target.value } })}
                    placeholder="https://..."
                  />
                </label>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Image Width</label>
                  <input
                    className="ui-input"
                    value={selected.style?.width || '100%'}
                    onChange={(event) => onSelectedChange({ style: { ...selected.style, width: event.target.value } })}
                    placeholder="e.g. 100%, 300px"
                  />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alignment</label>
                  <select
                    className="ui-input"
                    value={selected.style?.align || 'center'}
                    onChange={(event) => onSelectedChange({ style: { ...selected.style, align: event.target.value } })}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            ) : selected.type === 'button' ? (
              <>
                <label>
                  Button Label
                  <input
                    className="ui-input"
                    value={selected.content?.label || 'Click Here'}
                    onChange={(event) => onSelectedChange({ content: { ...selected.content, label: event.target.value } })}
                  />
                </label>
                <label>
                  Link URL
                  <input
                    className="ui-input"
                    value={selected.content?.url || ''}
                    onChange={(event) => onSelectedChange({ content: { ...selected.content, url: event.target.value } })}
                    placeholder="https://..."
                  />
                </label>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="btn-full-width"
                    checked={selected.style?.fullWidth || false}
                    onChange={(event) => onSelectedChange({ style: { ...selected.style, fullWidth: event.target.checked } })}
                  />
                  <label htmlFor="btn-full-width" style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>Full Width</label>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Button Width</label>
                  <input
                    className="ui-input"
                    value={selected.style?.width || ''}
                    onChange={(event) => onSelectedChange({ style: { ...selected.style, width: event.target.value } })}
                    placeholder="e.g. 200px, 100%, auto"
                    disabled={selected.style?.fullWidth}
                  />
                </div>
              </>
            ) : (
              <>
                <label>
                  Content
                  <textarea
                    className="ui-input"
                    value={typeof selected.content === 'object' ? (selected.content.text || selected.content.html || '') : String(selected.content || '')}
                    onChange={(event) => {
                      if (selected.type === 'html') onSelectedChange({ content: { ...selected.content, html: event.target.value } });
                      else if (selected.type === 'heading' || selected.type === 'paragraph') onSelectedChange({ content: { ...selected.content, text: event.target.value } });
                      else onSelectedChange({ content: event.target.value });
                    }}
                    rows={4}
                  />
                </label>
                <label>
                  Link URL
                  <input
                    className="ui-input"
                    value={selected.attributes?.href || selected.attributes?.src || ''}
                    onChange={(event) => onSelectedChange({ attributes: selected.attributes?.src !== undefined ? { src: event.target.value } : { href: event.target.value } })}
                    placeholder="https://..."
                  />
                </label>
              </>
            )}

            {(selected.attributes?.href || selected.attributes?.src) && (
              <button
                type="button"
                onClick={() => {
                  const currentUrl = selected.attributes?.href || selected.attributes?.src || '';
                  if (currentUrl) {
                    const domain = currentUrl.replace(/^https?:\/\//, '').split('/')[0];
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                    const label = selected.content ? String(selected.content).replace(/<[^>]+>/g, '').trim() : domain;
                    const htmlWithFavicon = `<a href="${currentUrl}" target="_blank" style="text-decoration:none; color:#0f172a; font-family:Arial, sans-serif; font-size:14px; font-weight:600; padding:6px 12px; display:inline-block;"><img src="${faviconUrl}" width="16" height="16" style="vertical-align:middle; margin-right:6px; border-radius:3px; display:inline-block;" alt="" />${label || 'Link'}</a>`;
                    onSelectedChange({ content: htmlWithFavicon });
                  }
                }}
                className="bl-btn bl-btn--primary"
                style={{ width: '100%', marginTop: '6px', padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
              >
                ✨ Embed Website Favicon + Link
              </button>
            )}

              {parsedLinks.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Individual Link Colors ({parsedLinks.length})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {parsedLinks.map((link) => (
                    <div key={link.index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }} title={link.plainText}>
                        {link.plainText}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, marginLeft: '8px' }}>
                        <GradientColorPicker
                          value={link.color}
                          onChange={(newColor) => handleLinkColorChange(link.index, newColor)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Text Color</label>
              <GradientColorPicker
                value={selected.style?.color || '#25302a'}
                onChange={(v) => onSelectedChange({ style: { color: v } })}
              />
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Background</label>
              <GradientColorPicker
                value={selected.style?.['background-color'] || '#ffffff'}
                onChange={(v) => onSelectedChange({ style: { 'background-color': v } })}
              />
            </div>
          </>
        ) : (
          <p className="muted-panel-copy">Select a canvas block to edit its content and style.</p>
        )}
      </div>

      {/* Brand Social Tokens & Merge Tags */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
            Brand Social & Merge Tokens
          </h3>
          {copiedToken && (
            <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700, background: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
              Copied!
            </span>
          )}
        </div>
        
        <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
          Click any social or brand token below to copy its variable into your clipboard, then paste into the Social link URL field:
        </p>

        {/* Social Tokens */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {socialTokens.map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => handleCopyTag(item.tag)}
              title={`Click to copy ${item.tag}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: copiedToken === item.tag ? '#d1fae5' : '#e0e7ff',
                border: '1px solid ' + (copiedToken === item.tag ? '#6ee7b7' : '#c7d2fe'),
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: copiedToken === item.tag ? '#065f46' : '#3730a3',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedToken === item.tag ? <Check size={10} /> : <Share2 size={10} />}
              <span>{item.tag}</span>
            </button>
          ))}
        </div>

        {/* General Tokens */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {standardTokens.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleCopyTag(tag)}
              title={`Click to copy ${tag}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 7px',
                background: copiedToken === tag ? '#d1fae5' : '#f1f5f9',
                border: '1px solid ' + (copiedToken === tag ? '#6ee7b7' : '#cbd5e1'),
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: copiedToken === tag ? '#065f46' : '#334155',
                cursor: 'pointer',
              }}
            >
              {copiedToken === tag && <Check size={9} />}
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
