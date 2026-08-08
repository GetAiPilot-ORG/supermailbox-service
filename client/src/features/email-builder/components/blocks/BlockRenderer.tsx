import React from 'react';
import type { EmailBlock } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { mergeStyles } from '../../utils/deviceUtils';
import { HeadingBlock } from './HeadingBlock';
import { ParagraphBlock } from './ParagraphBlock';

interface BlockRendererProps {
  block: EmailBlock;
  onRequestImagePicker?: () => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const activeDevice = useDocumentStore((state) => state.activeDevice);
  const style = mergeStyles(block.style, block.tabletStyle, block.mobileStyle, activeDevice);
  const { type, content } = block;

  if (block.visibility) {
    if (activeDevice === 'desktop' && block.visibility.desktop === false) return null;
    if (activeDevice === 'tablet' && block.visibility.tablet === false) return null;
    if (activeDevice === 'mobile' && block.visibility.mobile === false) return null;
  }

  const wrapperStyle: React.CSSProperties = {
    padding: style.padding || '0px',
    margin: style.margin || '0px',
    backgroundColor: style.backgroundColor || 'transparent',
    borderWidth: style.borderWidth || '0px',
    borderStyle: style.borderStyle || 'none',
    borderColor: style.borderColor || 'transparent',
    borderRadius: style.borderRadius || '0px',
    boxShadow: style.boxShadow || 'none',
    opacity: style.opacity !== undefined ? Number(style.opacity) : 1,
    boxSizing: 'border-box',
  };

  switch (type) {
    case 'heading':
      return <div style={wrapperStyle}><HeadingBlock block={block} /></div>;
    case 'paragraph':
      return <div style={wrapperStyle}><ParagraphBlock block={block} /></div>;
    case 'image':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          <img
            src={content.src || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop'}
            alt={content.alt || ''}
            style={{ width: style.width || '100%', maxWidth: '100%', borderRadius: style.borderRadius || '0px', display: 'inline-block', objectFit: (style.objectFit as any) || 'cover' }}
          />
        </div>
      );
    case 'button':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          <a
            href={content.url || '#'}
            target={content.target || '_blank'}
            rel="noopener noreferrer"
            onClick={(e) => e.preventDefault()}
            style={{
              display: style.fullWidth ? 'block' : 'inline-block',
              backgroundColor: style.backgroundColor || '#2563eb',
              color: style.textColor || '#ffffff',
              fontSize: style.fontSize || '14px',
              fontWeight: style.fontWeight || '600',
              fontFamily: style.fontFamily || 'inherit',
              borderRadius: style.borderRadius || '6px',
              padding: style.padding || '12px 24px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            {content.label || 'Click Here'}
          </a>
        </div>
      );
    case 'divider':
      return (
        <div style={wrapperStyle}>
          <hr style={{ border: 'none', borderTop: `${style.borderWidth || '1px'} ${style.borderStyle || 'solid'} ${style.borderColor || '#e2e8f0'}`, margin: 0 }} />
        </div>
      );
    case 'spacer':
      return <div style={{ height: style.height || '24px', width: '100%' }} />;
    case 'html':
      return <div style={wrapperStyle} dangerouslySetInnerHTML={{ __html: content.html || '<div>Custom HTML</div>' }} />;
    case 'social':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          <div style={{ display: 'inline-flex', gap: '12px', alignItems: 'center' }}>
            {(content.profiles || []).map((p: any, i: number) => (
              <a key={i} href={p.url || '#'} target="_blank" rel="noreferrer" onClick={(e) => e.preventDefault()} style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>
                {p.platform}
              </a>
            ))}
          </div>
        </div>
      );
    case 'video':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', borderRadius: style.borderRadius || '8px', overflow: 'hidden' }}>
            <img src={content.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop'} alt="Video thumbnail" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px' }}>
              ▶ Play Video
            </div>
          </div>
        </div>
      );
    case 'menu':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {(content.items || []).map((item: any, i: number) => (
              <a key={i} href={item.url || '#'} onClick={(e) => e.preventDefault()} style={{ fontSize: style.fontSize || '13px', fontWeight: style.fontWeight || '600', color: style.color || '#2563eb', textDecoration: 'none' }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      );
    case 'product_card':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          {content.image && <img src={content.image} alt={content.title} style={{ width: '100%', borderRadius: '6px', marginBottom: '12px', objectFit: 'cover' }} />}
          <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{content.title}</h4>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>{content.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb' }}>{content.price}</span>
            {content.oldPrice && <span style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through' }}>{content.oldPrice}</span>}
          </div>
          {content.buttonText && <button type="button" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{content.buttonText}</button>}
        </div>
      );
    case 'product_grid':
      return (
        <div style={wrapperStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {(content.products || []).map((prod: any, i: number) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                <img src={prod.image} alt={prod.title} style={{ width: '100%', borderRadius: '4px', height: '100px', objectFit: 'cover' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', margin: '6px 0 2px' }}>{prod.title}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{prod.price}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'countdown':
      return (
        <div style={{ ...wrapperStyle, textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9, display: 'block', marginBottom: '8px' }}>{content.label}</span>
          <div style={{ display: 'inline-flex', gap: '12px' }}>
            {['02 Days', '14 Hours', '35 Mins', '10 Secs'].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      );
    case 'qr_code': {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(content.dataUrl || 'https://example.com')}`;
      return (
        <div style={{ ...wrapperStyle, textAlign: 'center' }}>
          <img src={qrUrl} alt="QR Code" style={{ width: '120px', height: '120px', borderRadius: '6px' }} />
          {content.label && <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{content.label}</span>}
        </div>
      );
    }
    case 'quote':
      return (
        <div style={{ ...wrapperStyle, borderLeft: `${style.borderWidth || '4px'} solid ${style.borderColor || '#2563eb'}`, padding: '12px 16px' }}>
          <p style={{ margin: 0, fontStyle: 'italic', fontSize: style.fontSize || '15px', color: style.color || '#334155' }}>{content.text}</p>
          {content.author && <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginTop: '6px', color: '#64748b' }}>{content.author}</span>}
        </div>
      );
    case 'badge':
      return (
        <div style={{ ...wrapperStyle, textAlign: (style.align as any) || 'center' }}>
          <span style={{ display: 'inline-block', backgroundColor: style.backgroundColor || '#dcfce7', color: style.textColor || '#15803d', fontSize: style.fontSize || '11px', fontWeight: style.fontWeight || '700', borderRadius: style.borderRadius || '9999px', padding: style.padding || '4px 12px' }}>
            {content.text}
          </span>
        </div>
      );
    case 'alert':
      return (
        <div style={wrapperStyle}>
          <strong style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>{content.title}</strong>
          <span style={{ fontSize: '12px' }}>{content.message}</span>
        </div>
      );
    case 'coupon':
      return (
        <div style={{ ...wrapperStyle, textAlign: 'center', border: `${style.borderWidth || '2px'} dashed ${style.borderColor || '#2563eb'}` }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#2563eb', display: 'block' }}>{content.discount}</span>
          <div style={{ background: '#2563eb', color: '#fff', fontSize: '16px', fontWeight: 700, padding: '6px 16px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>
            CODE: {content.code}
          </div>
        </div>
      );
    case 'signature':
      return (
        <div style={wrapperStyle}>
          <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{content.name}</strong>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{content.title} · {content.company}</span>
          <span style={{ fontSize: '12px', color: '#2563eb', display: 'block', marginTop: '4px' }}>{content.email}</span>
        </div>
      );
    default:
      return <div style={wrapperStyle}>Block ({type})</div>;
  }
};
