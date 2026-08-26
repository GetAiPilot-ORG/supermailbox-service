import type { EmailBlock, EmailColumn, EmailDocument, EmailRow } from '../types/document.types';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderBlockToMjml(block: EmailBlock): string {
  const { type, content, style } = block;
  const padding = style.padding || '10px 15px';

  switch (type) {
    case 'heading':
    case 'paragraph': {
      const text = content.text || '';
      const fontSize = style.fontSize || (type === 'heading' ? '24px' : '14px');
      const fontWeight = style.fontWeight || (type === 'heading' ? '700' : '400');
      const color = style.color || '#334155';
      const align = style.textAlign || 'left';
      const lineHeight = style.lineHeight || '1.5';
      const fontFamily = style.fontFamily ? `font-family="${escapeXml(style.fontFamily)}"` : '';

      return `<mj-text font-size="${fontSize}" font-weight="${fontWeight}" color="${color}" align="${align}" line-height="${lineHeight}" padding="${padding}" ${fontFamily}>${text}</mj-text>`;
    }
    case 'image': {
      const src = escapeXml(content.src || '');
      const alt = escapeXml(content.alt || '');
      const href = content.linkUrl ? `href="${escapeXml(content.linkUrl)}"` : '';
      
      // MJML `<mj-image>` `width` attribute only accepts pixels (it runs parseInt).
      // If you pass "100%", MJML parses it as 100px, resulting in a tiny image!
      let width = 'width="600px"'; // Default to max email width so it scales to column
      if (style.width) {
        const cssWidth = String(style.width).trim();
        if (cssWidth.endsWith('%')) {
          const pct = parseInt(cssWidth, 10);
          if (!isNaN(pct)) {
            // Approximate column width is max 600px.
            const pxWidth = Math.round(600 * (pct / 100));
            width = `width="${pxWidth}px"`;
          }
        } else if (cssWidth.endsWith('px')) {
          width = `width="${cssWidth}"`;
        } else if (/^\d+$/.test(cssWidth)) {
          width = `width="${cssWidth}px"`;
        } else if (cssWidth === 'auto') {
          width = ''; // Let MJML use natural image width
        } else {
          const val = parseInt(cssWidth, 10);
          if (!isNaN(val)) {
            width = `width="${val}px"`;
          }
        }
      }
      
      const align = style.align || 'center';
      const borderRadius = style.borderRadius ? `border-radius="${style.borderRadius}"` : '';
      const height = style.height ? `height="${style.height}"` : '';

      return `<mj-image src="${src}" alt="${alt}" ${href} ${width} ${height} align="${align}" ${borderRadius} padding="${padding}" />`;
    }
    case 'button': {
      const label = content.label || 'Click Here';
      const href = escapeXml(content.url || '#');
      const target = content.target || '_blank';
      const bg = style.backgroundColor || '#2563eb';
      const color = style.textColor || '#ffffff';
      const fontSize = style.fontSize || '14px';
      const fontWeight = style.fontWeight || '600';
      const borderRadius = style.borderRadius || '6px';
      const align = style.align || 'center';
      let widthAttr = '';
      if (style.fullWidth) {
        widthAttr = 'width="100%"';
      } else if (style.width) {
        widthAttr = `width="${escapeXml(String(style.width).trim())}"`;
      }

      return `<mj-button href="${href}" target="${target}" background-color="${bg}" color="${color}" font-size="${fontSize}" font-weight="${fontWeight}" border-radius="${borderRadius}" align="${align}" ${widthAttr} padding="${padding}">${label}</mj-button>`;
    }
    case 'divider': {
      const borderColor = style.borderColor || '#e2e8f0';
      const borderWidth = style.borderWidth || '1px';
      const borderStyle = style.borderStyle || 'solid';

      return `<mj-divider border-color="${borderColor}" border-width="${borderWidth}" border-style="${borderStyle}" padding="${padding}" />`;
    }
    case 'spacer': {
      const height = style.height || '24px';
      return `<mj-spacer height="${height}" />`;
    }
    case 'html': {
      const rawHtml = content.html || '';
      return `<mj-raw>${rawHtml}</mj-raw>`;
    }
    case 'table': {
      const rawHtml = content.html || '';
      return `<mj-table padding="${padding}">${rawHtml}</mj-table>`;
    }
    case 'badge': {
      const bg = style.backgroundColor || '#dcfce7';
      const color = style.textColor || '#15803d';
      const fontSize = style.fontSize || '11px';
      const text = escapeXml(content.text || 'Badge');
      return `<mj-text align="${style.align || 'center'}" padding="${padding}"><span style="display:inline-block;background-color:${bg};color:${color};font-size:${fontSize};font-weight:700;border-radius:9999px;padding:4px 12px;">${text}</span></mj-text>`;
    }
    case 'alert': {
      const title = escapeXml(content.title || '');
      const message = escapeXml(content.message || '');
      return `<mj-text padding="${padding}"><strong style="display:block;font-size:13px;margin-bottom:2px;">${title}</strong><span style="font-size:12px;">${message}</span></mj-text>`;
    }
    case 'social': {
      const align = style.align || 'center';
      const iconSize = style.iconSize || '24px';

      const elements = (content.profiles || []).map((p: any) => {
        const platformName = (p.platform || 'twitter').toLowerCase();
        const url = escapeXml(p.url || '#');
        return `<mj-social-element name="${platformName}" href="${url}">${p.platform}</mj-social-element>`;
      }).join('');

      return `<mj-social align="${align}" icon-size="${iconSize}" padding="${padding}">${elements}</mj-social>`;
    }
    case 'video': {
      const thumbnail = escapeXml(content.thumbnail || '');
      const href = escapeXml(content.url || '#');
      const align = style.align || 'center';

      return `<mj-image src="${thumbnail}" href="${href}" align="${align}" padding="${padding}" alt="Watch Video" />`;
    }
    case 'menu': {
      const links = (content.items || [])
        .map((item: any) => `<a href="${escapeXml(item.url || '#')}" style="color:${style.color || '#2563eb'};text-decoration:none;margin:0 10px;font-weight:600">${escapeXml(item.label)}</a>`)
        .join('');
      return `<mj-text align="${style.align || 'center'}" padding="${padding}">${links}</mj-text>`;
    }
    case 'product_card': {
      const img = content.image ? `<mj-image src="${escapeXml(content.image)}" alt="${escapeXml(content.title)}" padding="0px 0px 10px" />` : '';
      const title = `<mj-text font-size="16px" font-weight="700" color="#0f172a" align="center" padding="4px">${escapeXml(content.title)}</mj-text>`;
      const desc = `<mj-text font-size="13px" color="#64748b" align="center" padding="4px">${escapeXml(content.description)}</mj-text>`;
      const price = `<mj-text font-size="18px" font-weight="700" color="#2563eb" align="center" padding="4px">${escapeXml(content.price)}</mj-text>`;
      const btn = content.buttonText ? `<mj-button href="${escapeXml(content.url || '#')}" background-color="#2563eb" color="#ffffff" font-size="13px" font-weight="600" border-radius="6px" align="center" padding="10px">${escapeXml(content.buttonText)}</mj-button>` : '';

      return `${img}${title}${desc}${price}${btn}`;
    }
    case 'qr_code': {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&amp;data=${encodeURIComponent(content.dataUrl || 'https://example.com')}`;
      return `<mj-image src="${qrUrl}" width="120px" align="${style.align || 'center'}" padding="${padding}" alt="QR Code" />`;
    }
    case 'countdown': {
      return `<mj-text align="center" padding="${padding}" font-size="14px" font-weight="700" color="${style.textColor || '#0f172a'}">${escapeXml(content.label)}</mj-text>`;
    }
    case 'quote': {
      return `<mj-text font-style="italic" font-size="${style.fontSize || '15px'}" color="${style.color || '#334155'}" border-left="${style.borderWidth || '4px'} solid ${style.borderColor || '#2563eb'}" padding="${padding}">${escapeXml(content.text)}<br/><span style="font-style:normal;font-size:12px;font-weight:600;color:#64748b">${escapeXml(content.author || '')}</span></mj-text>`;
    }
    case 'coupon': {
      return `<mj-text align="center" padding="${padding}" font-size="16px" font-weight="700" color="#2563eb">DISCOUNT: ${escapeXml(content.discount || '')}<br/><strong>CODE: ${escapeXml(content.code || '')}</strong></mj-text>`;
    }
    case 'signature': {
      return `<mj-text padding="${padding}" font-size="13px" color="#334155"><strong>${escapeXml(content.name || '')}</strong><br/>${escapeXml(content.title || '')} · ${escapeXml(content.company || '')}<br/><a href="mailto:${escapeXml(content.email || '')}" style="color:#2563eb">${escapeXml(content.email || '')}</a></mj-text>`;
    }
    default:
      return `<mj-text padding="${padding}">${escapeXml(content.text || 'Content')}</mj-text>`;
  }
}

function renderColumnToMjml(column: EmailColumn): string {
  const width = Math.round(column.width);
  const padding = column.settings?.padding ? `padding="${column.settings.padding}"` : '';
  const verticalAlign = column.settings?.verticalAlign ? `vertical-align="${column.settings.verticalAlign}"` : '';
  const bg = column.settings?.backgroundColor ? `background-color="${column.settings.backgroundColor}"` : '';

  const blocksMjml = column.blocks.map(renderBlockToMjml).join('\n');

  return `<mj-column width="${width}%" ${padding} ${verticalAlign} ${bg}>\n${blocksMjml}\n</mj-column>`;
}

function renderRowToMjml(row: EmailRow): string {
  const bgVal = row.settings?.backgroundColor || row.settings?.contentBackgroundColor;
  const bg = bgVal && bgVal !== 'transparent' && !bgVal.includes('gradient') ? `background-color="${bgVal}"` : '';
  const padding = row.settings?.padding ? `padding="${row.settings.padding}"` : 'padding="10px 0px"';
  const columnsMjml = row.columns.map(renderColumnToMjml).join('\n');

  return `<mj-section ${bg} ${padding}>\n${columnsMjml}\n</mj-section>`;
}

export function documentToMjml(document: EmailDocument): string {
  const bodyBg = document?.bodySettings?.backgroundColor || '#f1f5f9';
  const contentWidth = document?.bodySettings?.contentWidth || 600;
  const fontFamily = document?.bodySettings?.defaultFontFamily || 'Arial, Helvetica, sans-serif';

  const rows = Array.isArray(document?.rows) ? document.rows : [];
  const rowsMjml = rows.map(renderRowToMjml).join('\n');

  return `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${escapeXml(fontFamily)}" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="${bodyBg}" width="${contentWidth}px">
${rowsMjml}
  </mj-body>
</mjml>`;
}
