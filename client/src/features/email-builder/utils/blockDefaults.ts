import type { BlockType, EmailBlock, EmailColumn, EmailDocument, EmailRow, RowLayoutPreset } from '../types/document.types';

export function createUniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export function getDefaultBlockConfig(type: BlockType): Omit<EmailBlock, 'id'> {
  switch (type) {
    case 'heading':
      return {
        type: 'heading',
        content: { text: 'Heading Text', level: 'h2' },
        style: { fontSize: '24px', fontWeight: '700', color: '#1e293b', textAlign: 'left', padding: '12px 16px', lineHeight: '1.3', fontFamily: 'inherit' },
      };
    case 'paragraph':
      return {
        type: 'paragraph',
        content: { text: 'Add your text content here. Click to edit and format.' },
        style: { fontSize: '14px', fontWeight: '400', color: '#475569', textAlign: 'left', padding: '8px 16px', lineHeight: '1.6', fontFamily: 'inherit' },
      };
    case 'image':
      return {
        type: 'image',
        content: { src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop', alt: 'Image description', linkUrl: '' },
        style: { width: '100%', maxWidth: '100%', align: 'center', padding: '12px 16px', borderRadius: '8px' },
      };
    case 'button':
      return {
        type: 'button',
        content: { label: 'Click Here', url: 'https://example.com', target: '_blank' },
        style: { backgroundColor: '#2563eb', textColor: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '6px', padding: '12px 24px', align: 'center', fullWidth: false },
      };
    case 'divider':
      return {
        type: 'divider',
        content: {},
        style: { borderColor: '#e2e8f0', borderStyle: 'solid', borderWidth: '1px', padding: '16px' },
      };
    case 'spacer':
      return {
        type: 'spacer',
        content: {},
        style: { height: '24px' },
      };
    case 'html':
      return {
        type: 'html',
        content: { html: '<div style="padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; text-align: center; color: #64748b; font-size: 13px;">Custom HTML Block</div>' },
        style: { padding: '8px 16px' },
      };
    case 'social':
      return {
        type: 'social',
        content: {
          profiles: [
            { platform: 'Twitter', url: 'https://twitter.com' },
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'Facebook', url: 'https://facebook.com' },
          ],
        },
        style: { align: 'center', iconSize: '24px', padding: '12px 16px' },
      };
    case 'video':
      return {
        type: 'video',
        content: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop' },
        style: { align: 'center', padding: '12px 16px' },
      };
    case 'menu':
      return {
        type: 'menu',
        content: {
          items: [
            { label: 'Home', url: 'https://example.com' },
            { label: 'Features', url: 'https://example.com/features' },
            { label: 'Pricing', url: 'https://example.com/pricing' },
            { label: 'Contact', url: 'https://example.com/contact' },
          ],
        },
        style: { align: 'center', color: '#2563eb', fontSize: '13px', fontWeight: '600', padding: '12px' },
      };
    case 'product_card':
      return {
        type: 'product_card',
        content: {
          title: 'Premium Wireless Headphones',
          description: 'Experience crystal clear noise cancelling sound.',
          price: '$199.99',
          oldPrice: '$249.99',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
          buttonText: 'Buy Now',
          url: 'https://example.com/product',
        },
        style: { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: '1px', borderRadius: '8px', padding: '16px', align: 'center' },
      };
    case 'product_grid':
      return {
        type: 'product_grid',
        content: {
          products: [
            { id: '1', title: 'Product One', price: '$49', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop', url: '#' },
            { id: '2', title: 'Product Two', price: '$79', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&auto=format&fit=crop', url: '#' },
          ],
        },
        style: { padding: '12px' },
      };
    case 'countdown':
      return {
        type: 'countdown',
        content: {
          targetDate: '2026-12-31T23:59:59',
          label: 'Limited Time Offer Ends In:',
        },
        style: { backgroundColor: '#0f172a', textColor: '#ffffff', padding: '16px', align: 'center', borderRadius: '8px' },
      };
    case 'qr_code':
      return {
        type: 'qr_code',
        content: { dataUrl: 'https://example.com', label: 'Scan to visit link' },
        style: { align: 'center', padding: '16px' },
      };
    case 'quote':
      return {
        type: 'quote',
        content: { text: '"SuperMailBox doubled our email conversion rates overnight!"', author: '— Jane Doe, CEO' },
        style: { color: '#334155', borderColor: '#2563eb', borderWidth: '4px', padding: '16px 20px', fontSize: '15px', backgroundColor: '#f8fafc' },
      };
    case 'table':
      return {
        type: 'table',
        content: {
          headers: ['Plan', 'Features', 'Price'],
          rows: [
            ['Starter', 'Up to 5k emails', '$19/mo'],
            ['Pro', 'Unlimited emails', '$49/mo'],
          ],
        },
        style: { padding: '12px', borderColor: '#cbd5e1' },
      };
    case 'badge':
      return {
        type: 'badge',
        content: { text: 'SPECIAL OFFER' },
        style: { backgroundColor: '#dcfce7', textColor: '#15803d', fontSize: '11px', fontWeight: '700', borderRadius: '9999px', padding: '4px 12px', align: 'center' },
      };
    case 'alert':
      return {
        type: 'alert',
        content: { title: 'Important Notice', message: 'Your subscription will renew in 3 days.' },
        style: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: '1px', textColor: '#92400e', borderRadius: '6px', padding: '12px 16px' },
      };
    case 'coupon':
      return {
        type: 'coupon',
        content: { code: 'SAVE20', discount: '20% OFF YOUR NEXT ORDER' },
        style: { backgroundColor: '#eff6ff', borderColor: '#2563eb', borderWidth: '2px', borderRadius: '8px', padding: '16px', align: 'center' },
      };
    case 'signature':
      return {
        type: 'signature',
        content: { name: 'John Smith', title: 'Director of Growth', company: 'SuperMailBox Inc.', email: 'john@example.com' },
        style: { padding: '12px', fontSize: '13px', color: '#334155' },
      };
    default:
      return {
        type: 'paragraph',
        content: { text: 'Block' },
        style: { padding: '8px 16px' },
      };
  }
}

export function createBlock(type: BlockType): EmailBlock {
  const config = getDefaultBlockConfig(type);
  return {
    id: createUniqueId(`block-${type}`),
    ...config,
  };
}

export function getPresetColumnWidths(preset: RowLayoutPreset): number[] {
  switch (preset) {
    case '1-col': return [100];
    case '2-col-equal': return [50, 50];
    case '3-col-equal': return [33.33, 33.33, 33.34];
    case '4-col-equal': return [25, 25, 25, 25];
    case '1-3_2-3': return [33.33, 66.67];
    case '2-3_1-3': return [66.67, 33.33];
    case '1-4_3-4': return [25, 75];
    case '3-4_1-4': return [75, 25];
    case '1-4_1-2_1-4': return [25, 50, 25];
    default: return [100];
  }
}

export function createRowFromPreset(preset: RowLayoutPreset = '1-col'): EmailRow {
  const widths = getPresetColumnWidths(preset);
  const rowId = createUniqueId('row');

  const columns: EmailColumn[] = widths.map((width, idx) => ({
    id: `${rowId}-col-${idx + 1}`,
    width,
    settings: { padding: '10px', verticalAlign: 'top' },
    blocks: [],
  }));

  return {
    id: rowId,
    name: `Row (${preset})`,
    settings: { backgroundColor: 'transparent', contentBackgroundColor: '#ffffff', padding: '10px 0px', stackOnMobile: true },
    columns,
  };
}

export function createDefaultDocument(subject = 'New Email Template', preheader = ''): EmailDocument {
  const defaultRow = createRowFromPreset('1-col');
  defaultRow.columns[0].blocks.push(createBlock('heading'), createBlock('paragraph'));

  return {
    schemaVersion: 2,
    metadata: { subject, preheader, language: 'en', direction: 'ltr' },
    designTokens: { primaryColor: '#2563eb', secondaryColor: '#475569', accentColor: '#38bdf8', borderRadius: '6px' },
    bodySettings: { backgroundColor: '#f1f5f9', contentBackgroundColor: '#ffffff', contentWidth: 600, defaultFontFamily: 'Arial, Helvetica, sans-serif', defaultFontSize: '14px', textColor: '#334155', linkColor: '#2563eb', globalPadding: '20px 0px', mobileBreakpoint: 480 },
    rows: [defaultRow],
  };
}
