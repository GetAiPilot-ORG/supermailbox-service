import React from 'react';
import { Bookmark, Image as ImageIcon, Link, Upload } from 'lucide-react';
import type { EmailBlock } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { useSavedBlocksStore } from '../../store/savedBlocksStore';
import { BackgroundPanel } from './controls/BackgroundPanel';
import { BorderPanel } from './controls/BorderPanel';
import { EffectsPanel } from './controls/EffectsPanel';
import { SpacingPanel } from './controls/SpacingPanel';
import { TypographyPanel } from './controls/TypographyPanel';
import { VisibilityPanel } from './controls/VisibilityPanel';

interface BlockPropertiesProps {
  block: EmailBlock;
  onRequestImagePicker?: () => void;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

export const BlockProperties: React.FC<BlockPropertiesProps> = ({ block, onRequestImagePicker }) => {
  const updateBlock = useDocumentStore((state) => state.updateBlock);
  const saveBlock = useSavedBlocksStore((state) => state.saveBlock);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = React.useState(false);

  if (!block) return null;

  const updateContent = (patch: Record<string, any>) => {
    updateBlock(block.id, { content: { ...block.content, ...patch } });
  };

  const updateStyle = (patch: Record<string, any>) => {
    updateBlock(block.id, { style: { ...block.style, ...patch } });
  };

  const updateVisibility = (patch: Record<string, any>) => {
    updateBlock(block.id, { visibility: patch });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Block Type Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
          {block.type.toUpperCase()} Block
        </h4>
        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>{block.id}</span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* BLOCK TYPE SPECIFIC CONTENT CONTROLS */}

      {/* HEADING BLOCK */}
      {block.type === 'heading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Heading Text
            </label>
            <input
              type="text"
              value={stripHtml(block.content.text || '')}
              onChange={(e) => updateContent({ text: e.target.value })}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Heading Level
            </label>
            <select
              value={block.content.level || 'h2'}
              onChange={(e) => updateContent({ level: e.target.value })}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="h1">H1 - Main Title</option>
              <option value="h2">H2 - Section Header</option>
              <option value="h3">H3 - Subheader</option>
              <option value="h4">H4 - Small Header</option>
            </select>
          </div>
        </div>
      )}

      {/* PARAGRAPH BLOCK */}
      {block.type === 'paragraph' && (
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Text Content
          </label>
          <textarea
            rows={4}
            value={stripHtml(block.content.text || '')}
            onChange={(e) => updateContent({ text: e.target.value })}
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      )}

      {/* IMAGE BLOCK */}
      {block.type === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Image Source URL
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={block.content.src || ''}
                onChange={(e) => updateContent({ src: e.target.value })}
                placeholder="https://..."
                style={{ flex: 1, fontSize: '11px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              {onRequestImagePicker && (
                <button
                  type="button"
                  onClick={onRequestImagePicker}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  title="Choose from Brand Library"
                >
                  <ImageIcon size={14} /> Brand
                </button>
              )}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Alt Text
            </label>
            <input
              type="text"
              value={block.content.alt || ''}
              onChange={(e) => updateContent({ alt: e.target.value })}
              placeholder="Image description"
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Destination Link
            </label>
            <input
              type="url"
              value={block.content.linkUrl || ''}
              onChange={(e) => updateContent({ linkUrl: e.target.value })}
              placeholder="https://..."
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      )}

      {/* BUTTON BLOCK */}
      {block.type === 'button' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Button Label
            </label>
            <input
              type="text"
              value={block.content.label || ''}
              onChange={(e) => updateContent({ label: e.target.value })}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Button Target URL
            </label>
            <input
              type="url"
              value={block.content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              placeholder="https://..."
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={block.style.fullWidth || false}
                onChange={(e) => updateStyle({ fullWidth: e.target.checked })}
              />
              Full Width Button
            </label>
          </div>
        </div>
      )}

      {/* DIVIDER BLOCK */}
      {block.type === 'divider' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block' }}>Line Thickness</label>
          <input
            type="text"
            value={block.style.borderWidth || '1px'}
            onChange={(e) => updateStyle({ borderWidth: e.target.value })}
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      )}

      {/* SPACER BLOCK */}
      {block.type === 'spacer' && (
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Spacer Height ({parseInt(block.style.height || '24', 10)}px)
          </label>
          <input
            type="range"
            min="8"
            max="120"
            value={parseInt(block.style.height || '24', 10)}
            onChange={(e) => updateStyle({ height: `${e.target.value}px` })}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* HTML BLOCK */}
      {block.type === 'html' && (
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
            Custom HTML Code
          </label>
          <button
            onClick={() => setIsHtmlModalOpen(true)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            Open Fullscreen Editor
          </button>
          <textarea
            rows={4}
            value={block.content.html || ''}
            onChange={(e) => updateContent({ html: e.target.value })}
            style={{
              width: '100%',
              fontSize: '11px',
              fontFamily: 'monospace',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#0f172a',
              color: '#f8fafc',
            }}
          />

          {isHtmlModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: 'white', margin: 0 }}>Edit Custom HTML</h2>
                <button
                  onClick={() => setIsHtmlModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Close & Save
                </button>
              </div>
              <div style={{ display: 'flex', flex: 1, gap: '24px', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#94a3b8', fontSize: '14px', marginTop: 0, marginBottom: '8px' }}>HTML Code</h3>
                  <textarea
                    value={block.content.html || ''}
                    onChange={(e) => updateContent({ html: e.target.value })}
                    style={{
                      flex: 1,
                      width: '100%',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      background: '#1e293b',
                      color: '#f8fafc',
                      resize: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#94a3b8', fontSize: '14px', marginTop: 0, marginBottom: '8px' }}>Live Preview</h3>
                  <div 
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      padding: '16px',
                      overflowY: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: block.content.html || '' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SOCIAL BLOCK */}
      {block.type === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Social Profiles</span>
          {(block.content.profiles || []).map((prof: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ width: '64px', fontSize: '11px', fontWeight: 600, color: '#334155' }}>{prof.platform}</span>
              <input
                type="url"
                value={prof.url}
                onChange={(e) => {
                  const profiles = [...(block.content.profiles || [])];
                  profiles[idx] = { ...profiles[idx], url: e.target.value };
                  updateContent({ profiles });
                }}
                style={{ flex: 1, fontSize: '11px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* VIDEO BLOCK */}
      {block.type === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Video URL (YouTube/Vimeo)
            </label>
            <input
              type="url"
              value={block.content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={block.content.thumbnail || ''}
              onChange={(e) => updateContent({ thumbnail: e.target.value })}
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      )}

      {/* MENU BLOCK */}
      {block.type === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Menu Links</span>
          {(block.content.items || []).map((item: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="text"
                value={item.label}
                placeholder="Label"
                onChange={(e) => {
                  const items = [...(block.content.items || [])];
                  items[idx] = { ...items[idx], label: e.target.value };
                  updateContent({ items });
                }}
                style={{ width: '40%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <input
                type="url"
                value={item.url}
                placeholder="URL"
                onChange={(e) => {
                  const items = [...(block.content.items || [])];
                  items[idx] = { ...items[idx], url: e.target.value };
                  updateContent({ items });
                }}
                style={{ width: '60%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT CARD BLOCK */}
      {block.type === 'product_card' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Product Title</label>
            <input type="text" value={block.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Description</label>
            <input type="text" value={block.content.description || ''} onChange={(e) => updateContent({ description: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Price</label>
              <input type="text" value={block.content.price || ''} onChange={(e) => updateContent({ price: e.target.value })} style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Old Price</label>
              <input type="text" value={block.content.oldPrice || ''} onChange={(e) => updateContent({ oldPrice: e.target.value })} style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Image URL</label>
            <input type="url" value={block.content.image || ''} onChange={(e) => updateContent({ image: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Button Text</label>
            <input type="text" value={block.content.buttonText || ''} onChange={(e) => updateContent({ buttonText: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      {/* COUNTDOWN BLOCK */}
      {block.type === 'countdown' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Banner Label</label>
            <input type="text" value={block.content.label || ''} onChange={(e) => updateContent({ label: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      {/* QR CODE BLOCK */}
      {block.type === 'qr_code' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Target URL / Data</label>
            <input type="text" value={block.content.dataUrl || ''} onChange={(e) => updateContent({ dataUrl: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Label</label>
            <input type="text" value={block.content.label || ''} onChange={(e) => updateContent({ label: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      {/* QUOTE BLOCK */}
      {block.type === 'quote' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Quote Text</label>
            <textarea rows={3} value={block.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Author</label>
            <input type="text" value={block.content.author || ''} onChange={(e) => updateContent({ author: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      {/* BADGE BLOCK */}
      {block.type === 'badge' && (
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Badge Text</label>
          <input type="text" value={block.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
        </div>
      )}

      {/* ALERT BLOCK */}
      {block.type === 'alert' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Title</label>
            <input type="text" value={block.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Message</label>
            <input type="text" value={block.content.message || ''} onChange={(e) => updateContent({ message: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      {/* COUPON BLOCK */}
      {block.type === 'coupon' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Coupon Code</label>
            <input type="text" value={block.content.code || ''} onChange={(e) => updateContent({ code: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Discount Tagline</label>
            <input type="text" value={block.content.discount || ''} onChange={(e) => updateContent({ discount: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      {/* SIGNATURE BLOCK */}
      {block.type === 'signature' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Full Name</label>
            <input type="text" value={block.content.name || ''} onChange={(e) => updateContent({ name: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Job Title</label>
            <input type="text" value={block.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Company</label>
            <input type="text" value={block.content.company || ''} onChange={(e) => updateContent({ company: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>Email</label>
            <input type="email" value={block.content.email || ''} onChange={(e) => updateContent({ email: e.target.value })} style={{ width: '100%', fontSize: '12px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* SHARED STYLING PANELS */}

      {/* Typography for text-based blocks */}
      {['heading', 'paragraph', 'button'].includes(block.type) && (
        <div>
          <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Typography</h5>
          <TypographyPanel style={block.style} onChangeStyle={updateStyle} />
        </div>
      )}

      {/* Spacing for all blocks */}
      <div>
        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Spacing</h5>
        <SpacingPanel
          padding={block.style.padding}
          margin={block.style.margin}
          onChangePadding={(val) => updateStyle({ padding: val })}
          onChangeMargin={(val) => updateStyle({ margin: val })}
        />
      </div>

      {/* Background for all blocks */}
      <div>
        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Background</h5>
        <BackgroundPanel style={block.style} onChangeStyle={updateStyle} />
      </div>

      {/* Border & Radius */}
      <div>
        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Border</h5>
        <BorderPanel style={block.style} onChangeStyle={updateStyle} />
      </div>

      {/* Effects */}
      <div>
        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Effects</h5>
        <EffectsPanel style={block.style} onChangeStyle={updateStyle} />
      </div>

      {/* Save Block to Saved Library */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        <button
          type="button"
          onClick={() => {
            const name = prompt('Enter a name for this saved block:', `${block.type.toUpperCase()} Preset`);
            if (name) {
              saveBlock(name, block);
              alert('Block saved to Saved Library!');
            }
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            fontSize: '12px',
            fontWeight: 600,
            background: '#f8fafc',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <Bookmark size={14} /> Save Block to Library
        </button>
      </div>
    </div>
  );
};
