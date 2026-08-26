import type { BlockType, EmailBlock, EmailColumn, EmailDocument, EmailRow } from '../types/document.types';
import { createBlock, createDefaultDocument, createUniqueId } from '../utils/blockDefaults';

function parseCssStyles(styleAttr: string | null | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!styleAttr) return result;
  const pairs = styleAttr.split(';');
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx !== -1) {
      const key = pair.slice(0, colonIdx).trim().toLowerCase();
      const val = pair.slice(colonIdx + 1).trim();
      if (key && val) {
        result[key] = val;
      }
    }
  }
  return result;
}

function htmlElementToBlocks(node: Element, parentColor?: string): EmailBlock[] {
  const tag = node.tagName.toLowerCase();
  const styles = parseCssStyles(node.getAttribute('style'));

  // 1. Heading tags (h1 - h6)
  if (/^h[1-6]$/.test(tag)) {
    const blk = createBlock('heading');
    blk.content = {
      text: node.innerHTML || node.textContent || 'Heading',
      level: tag as 'h1' | 'h2' | 'h3' | 'h4',
    };
    blk.style = {
      ...blk.style,
      fontSize: styles['font-size'] || (tag === 'h1' ? '28px' : tag === 'h2' ? '24px' : tag === 'h3' ? '20px' : '18px'),
      fontWeight: styles['font-weight'] || '700',
      color: styles['color'] || parentColor || '#1e293b',
      textAlign: styles['text-align'] || 'left',
      padding: styles['padding'] || (styles['margin'] ? styles['margin'] : '8px 12px'),
      lineHeight: styles['line-height'] || '1.3',
    };
    return [blk];
  }

  // 2. Paragraph tag (p)
  if (tag === 'p') {
    const blk = createBlock('paragraph');
    blk.content = { text: node.innerHTML || node.textContent || 'Paragraph text' };
    blk.style = {
      ...blk.style,
      fontSize: styles['font-size'] || '14px',
      fontWeight: styles['font-weight'] || '400',
      color: styles['color'] || parentColor || '#475569',
      textAlign: styles['text-align'] || 'left',
      padding: styles['padding'] || (styles['margin'] ? styles['margin'] : '6px 12px'),
      lineHeight: styles['line-height'] || '1.6',
    };
    return [blk];
  }

  // 3. Image tag (img)
  if (tag === 'img') {
    const blk = createBlock('image');
    blk.content = {
      src: node.getAttribute('src') || '',
      alt: node.getAttribute('alt') || '',
      linkUrl: '',
    };
    blk.style = {
      ...blk.style,
      width: styles['width'] || node.getAttribute('width') || '100%',
      height: styles['height'] || node.getAttribute('height') || '',
      align: styles['text-align'] || 'center',
      borderRadius: styles['border-radius'] || '0px',
      objectFit: styles['object-fit'] || 'cover',
      padding: styles['padding'] || '8px 12px',
    };
    return [blk];
  }

  // 4. Link or Button (a)
  if (tag === 'a') {
    const isButton = Boolean(
      styles['background'] ||
      styles['background-color'] ||
      styles['border-radius'] ||
      styles['display'] === 'inline-block' ||
      node.classList.contains('btn') ||
      node.classList.contains('button')
    );

    if (isButton) {
      const blk = createBlock('button');
      blk.content = {
        label: node.textContent?.trim() || node.innerHTML || 'Click Here',
        url: node.getAttribute('href') || '#',
        target: node.getAttribute('target') || '_blank',
      };
      blk.style = {
        ...blk.style,
        backgroundColor: styles['background'] || styles['background-color'] || '#2563eb',
        textColor: styles['color'] || '#ffffff',
        fontSize: styles['font-size'] || '14px',
        fontWeight: styles['font-weight'] || '600',
        borderRadius: styles['border-radius'] || '6px',
        padding: styles['padding'] || '12px 24px',
        align: styles['text-align'] || 'center',
      };
      return [blk];
    } else {
      const blk = createBlock('paragraph');
      blk.content = { text: node.outerHTML };
      return [blk];
    }
  }

  // 5. Divider (hr)
  if (tag === 'hr') {
    const blk = createBlock('divider');
    blk.style = {
      ...blk.style,
      borderColor: styles['border-color'] || styles['border-top-color'] || '#e2e8f0',
      borderWidth: styles['border-width'] || styles['border-top-width'] || '1px',
      padding: styles['padding'] || (styles['margin'] ? styles['margin'] : '16px 0'),
    };
    return [blk];
  }

  // 6. Div container
  if (tag === 'div') {
    const childElements = Array.from(node.children);

    // Centering wrapper containing only a single button
    if (childElements.length === 1 && childElements[0].tagName.toLowerCase() === 'a') {
      const aEl = childElements[0];
      const aStyles = parseCssStyles(aEl.getAttribute('style'));
      const isButton = Boolean(
        aStyles['background'] ||
        aStyles['background-color'] ||
        aStyles['border-radius'] ||
        aStyles['display'] === 'inline-block'
      );
      if (isButton) {
        const blk = createBlock('button');
        blk.content = {
          label: aEl.textContent?.trim() || aEl.innerHTML || 'Click Here',
          url: aEl.getAttribute('href') || '#',
          target: aEl.getAttribute('target') || '_blank',
        };
        blk.style = {
          ...blk.style,
          backgroundColor: aStyles['background'] || aStyles['background-color'] || '#2563eb',
          textColor: aStyles['color'] || '#ffffff',
          fontSize: aStyles['font-size'] || '14px',
          fontWeight: aStyles['font-weight'] || '600',
          borderRadius: aStyles['border-radius'] || '6px',
          padding: aStyles['padding'] || '12px 24px',
          align: styles['text-align'] || aStyles['text-align'] || 'center',
        };
        return [blk];
      }
    }

    // Centering wrapper containing only a single image
    if (childElements.length === 1 && childElements[0].tagName.toLowerCase() === 'img') {
      const imgEl = childElements[0];
      const imgStyles = parseCssStyles(imgEl.getAttribute('style'));
      const blk = createBlock('image');
      blk.content = {
        src: imgEl.getAttribute('src') || '',
        alt: imgEl.getAttribute('alt') || '',
        linkUrl: '',
      };
      blk.style = {
        ...blk.style,
        width: imgStyles['width'] || imgEl.getAttribute('width') || '100%',
        height: imgStyles['height'] || imgEl.getAttribute('height') || '',
        align: styles['text-align'] || 'center',
        borderRadius: imgStyles['border-radius'] || '0px',
        objectFit: imgStyles['object-fit'] || 'cover',
        padding: styles['padding'] || '8px 0',
      };
      return [blk];
    }

    // If div has only standard block children (heading, p, img, hr) and NO custom container styling
    const hasSpecialStyling = Boolean(
      styles['background'] ||
      styles['background-color'] ||
      styles['border'] ||
      styles['border-radius'] ||
      styles['box-shadow'] ||
      styles['display'] === 'flex'
    );

    const hasOnlyStandardBlocks =
      !hasSpecialStyling &&
      childElements.length > 0 &&
      childElements.every((c) =>
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'hr'].includes(c.tagName.toLowerCase())
      );

    if (hasOnlyStandardBlocks) {
      const blocks: EmailBlock[] = [];
      for (const child of childElements) {
        blocks.push(...htmlElementToBlocks(child, styles['color'] || parentColor));
      }
      return blocks;
    }

    // Custom layout / badge widget / preview card / styled box -> HTML Block
    const blk = createBlock('html');
    blk.content = { html: node.outerHTML };
    blk.style = {
      ...blk.style,
      padding: styles['padding'] || '8px 0',
    };
    return [blk];
  }

  // 7. Fallback for any other HTML element
  const blk = createBlock('html');
  blk.content = { html: node.outerHTML };
  return [blk];
}

export function parseHtmlToDocument(
  html: string,
  defaultTitle = 'Email Template',
  defaultSubject?: string,
  defaultPreheader?: string
): EmailDocument {
  if (!html || typeof html !== 'string' || !html.trim()) {
    return createDefaultDocument(defaultTitle, defaultPreheader);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Extract preheader if exists
    let preheader = defaultPreheader || '';
    const preheaderEl = doc.querySelector('div[style*="display:none"], div[style*="display: none"], span.preheader, .preheader');
    if (preheaderEl && preheaderEl.textContent) {
      preheader = preheaderEl.textContent.trim();
      preheaderEl.remove();
    }

    const bodyEl = doc.body;
    const bodyStyles = parseCssStyles(bodyEl?.getAttribute('style'));

    // 2. Identify root container and card container
    let outerContainer: Element = bodyEl;
    if (bodyEl.children.length === 1 && bodyEl.children[0].tagName.toLowerCase() === 'div') {
      outerContainer = bodyEl.children[0];
    }

    const outerStyles = parseCssStyles(outerContainer.getAttribute('style'));

    let cardEl: Element = outerContainer;
    let isNestedInWrapper = false;

    const outerDirectChildren = Array.from(outerContainer.children).filter(
      (c) => c.tagName.toLowerCase() !== 'script' && c.tagName.toLowerCase() !== 'style'
    );

    // If outer container has exactly 1 child div that is a card wrapper
    if (outerDirectChildren.length === 1 && outerDirectChildren[0].tagName.toLowerCase() === 'div') {
      const candidateCard = outerDirectChildren[0];
      const candidateStyles = parseCssStyles(candidateCard.getAttribute('style'));
      if (
        candidateStyles['border-radius'] ||
        candidateStyles['box-shadow'] ||
        candidateStyles['background'] ||
        candidateStyles['background-color'] ||
        candidateStyles['overflow'] === 'hidden'
      ) {
        cardEl = candidateCard;
        isNestedInWrapper = true;
      }
    } else if (outerContainer.tagName.toLowerCase() === 'body' && doc.querySelector('table')) {
      // Table-based container
      const innerCardDiv = doc.querySelector('td > div[style*="max-width"], td > div[style*="border-radius"]');
      if (innerCardDiv) {
        cardEl = innerCardDiv;
        isNestedInWrapper = true;
      }
    }

    const cardStyles = parseCssStyles(cardEl.getAttribute('style'));
    const contentWidthStr = cardStyles['max-width'] || outerStyles['max-width'] || bodyStyles['max-width'] || '600';
    const contentWidth = parseInt(contentWidthStr, 10) || 600;

    const cardBg = cardStyles['background'] || cardStyles['background-color'] || outerStyles['background'] || outerStyles['background-color'] || '#ffffff';
    const outerBg = isNestedInWrapper
      ? (outerStyles['background'] || outerStyles['background-color'] || bodyStyles['background-color'] || '#f1f5f9')
      : '#f1f5f9';

    const cardTextColor = cardStyles['color'] || outerStyles['color'] || bodyStyles['color'] || '#334155';
    const cardFontFamily = cardStyles['font-family'] || outerStyles['font-family'] || bodyStyles['font-family'] || 'Inter, Arial, sans-serif';

    const rows: EmailRow[] = [];

    // 3. Inspect direct children of cardEl
    const cardDirectChildren = Array.from(cardEl.children).filter(
      (c) => c.tagName.toLowerCase() !== 'script' && c.tagName.toLowerCase() !== 'style'
    );

    // Case A: Multi-section card (e.g. Header banner div, Body div, Footer div)
    const isMultiSection =
      cardDirectChildren.length >= 2 &&
      cardDirectChildren.every((c) => {
        const tag = c.tagName.toLowerCase();
        return tag === 'div' || tag === 'section' || tag === 'header' || tag === 'footer';
      });

    if (isMultiSection) {
      cardDirectChildren.forEach((sectionEl, sIdx) => {
        const secStyles = parseCssStyles(sectionEl.getAttribute('style'));
        const rowId = createUniqueId('row');
        const colId = `${rowId}-col-1`;
        const blocks: EmailBlock[] = [];
        const sectionColor = secStyles['color'] || cardTextColor;

        const secChildren = Array.from(sectionEl.children);
        if (secChildren.length > 0) {
          secChildren.forEach((child) => {
            blocks.push(...htmlElementToBlocks(child, sectionColor));
          });
        } else if (sectionEl.innerHTML.trim()) {
          blocks.push(...htmlElementToBlocks(sectionEl, sectionColor));
        }

        const secBg = secStyles['background'] || secStyles['background-color'] || (sIdx === 0 ? 'transparent' : '#ffffff');

        if (blocks.length > 0) {
          rows.push({
            id: rowId,
            name: sIdx === 0 ? 'Header Section' : sIdx === cardDirectChildren.length - 1 ? 'Footer Section' : `Section ${sIdx + 1}`,
            settings: {
              backgroundColor: secBg,
              contentBackgroundColor: secBg,
              padding: secStyles['padding'] || '24px 20px',
              borderRadius: secStyles['border-radius'] || (sIdx === 0 ? '16px 16px 0 0' : sIdx === cardDirectChildren.length - 1 ? '0 0 16px 16px' : '0px'),
              stackOnMobile: true,
            },
            columns: [
              {
                id: colId,
                width: 100,
                settings: { padding: '0px', verticalAlign: 'top', backgroundColor: 'transparent' },
                blocks,
              },
            ],
          });
        }
      });
    } else {
      // Case B: Single standalone card (e.g. gap_whatsapp_otp, gap_whatsapp_welcome, otp_login, payment_success, welcome_email)
      const rowId = createUniqueId('row');
      const colId = `${rowId}-col-1`;
      const blocks: EmailBlock[] = [];

      cardDirectChildren.forEach((child) => {
        blocks.push(...htmlElementToBlocks(child, cardTextColor));
      });

      if (blocks.length === 0 && cardEl.innerHTML.trim()) {
        const blk = createBlock('html');
        blk.content = { html: cardEl.innerHTML };
        blocks.push(blk);
      }

      if (blocks.length > 0) {
        rows.push({
          id: rowId,
          name: 'Main Card',
          settings: {
            backgroundColor: cardBg,
            contentBackgroundColor: cardBg,
            padding: cardStyles['padding'] || '28px 24px',
            borderRadius: cardStyles['border-radius'] || '16px',
            border: cardStyles['border'] || undefined,
            stackOnMobile: true,
          },
          columns: [
            {
              id: colId,
              width: 100,
              settings: { padding: '0px', verticalAlign: 'top', backgroundColor: 'transparent' },
              blocks,
            },
          ],
        });
      }
    }

    if (rows.length === 0) {
      return createDefaultDocument(defaultTitle, defaultPreheader);
    }

    return {
      schemaVersion: 2,
      metadata: {
        subject: defaultSubject || defaultTitle,
        preheader,
        language: 'en',
        direction: 'ltr',
      },
      bodySettings: {
        backgroundColor: outerBg,
        contentBackgroundColor: cardBg,
        contentWidth,
        defaultFontFamily: cardFontFamily,
        defaultFontSize: '14px',
        textColor: cardTextColor,
        linkColor: '#2563eb',
        globalPadding: '24px 0px',
        mobileBreakpoint: 480,
      },
      rows,
    };
  } catch (err) {
    console.warn('HTML template parsing fallback triggered:', err);
    return createDefaultDocument(defaultTitle, defaultPreheader);
  }
}

export function parseMjmlToDocument(
  mjml: string,
  defaultTitle = 'Email Template',
  defaultSubject?: string,
  defaultPreheader?: string
): EmailDocument {
  if (!mjml || typeof mjml !== 'string' || !mjml.trim()) {
    return createDefaultDocument(defaultTitle, defaultPreheader);
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(mjml, 'text/html');

    const titleEl = xmlDoc.querySelector('mj-title');
    const previewEl = xmlDoc.querySelector('mj-preview');
    const bodyEl = xmlDoc.querySelector('mj-body');

    const subject = titleEl?.textContent?.trim() || defaultSubject || defaultTitle;
    const preheader = previewEl?.textContent?.trim() || defaultPreheader || '';
    const bodyBg = bodyEl?.getAttribute('background-color') || '#eef2ef';
    const contentWidth = parseInt(bodyEl?.getAttribute('width') || '600', 10) || 600;

    const sections = xmlDoc.querySelectorAll('mj-section, mj-hero, mj-wrapper');
    const rows: EmailRow[] = [];

    sections.forEach((section, sIdx) => {
      const rowId = createUniqueId('row');
      const bg = section.getAttribute('background-color') || 'transparent';
      const padding = section.getAttribute('padding') || '20px 0px';
      const borderRadius = section.getAttribute('border-radius') || '0px';

      const columnsEl = section.querySelectorAll('mj-column');
      const colList = Array.from(columnsEl);
      const colCount = colList.length || 1;

      const columns: EmailColumn[] = (colList.length > 0 ? colList : [section]).map((col, cIdx) => {
        const colId = `${rowId}-col-${cIdx + 1}`;
        const widthAttr = col.getAttribute('width');
        let width = 100 / colCount;
        if (widthAttr) {
          if (widthAttr.endsWith('%')) width = parseFloat(widthAttr) || width;
          else if (widthAttr.endsWith('px')) width = ((parseFloat(widthAttr) || 300) / contentWidth) * 100;
        }

        const colPadding = col.getAttribute('padding') || '10px';
        const colBg = col.getAttribute('background-color') || 'transparent';
        const blocks: EmailBlock[] = [];

        Array.from(col.children).forEach((child) => {
          const tag = child.tagName.toLowerCase();

          if (tag === 'mj-text') {
            const innerHtml = child.innerHTML.trim();
            const fontSize = child.getAttribute('font-size') || '14px';
            const fontWeight = child.getAttribute('font-weight') || '400';
            const color = child.getAttribute('color') || '#334155';
            const align = child.getAttribute('align') || 'left';
            const lineHeight = child.getAttribute('line-height') || '1.5';
            const paddingVal = child.getAttribute('padding') || '8px 16px';
            const fontFamily = child.getAttribute('font-family') || 'inherit';

            const isHeading = parseInt(fontSize, 10) >= 20 || (fontWeight === '700' && innerHtml.length < 80) || /^<h[1-6]/i.test(innerHtml);

            if (isHeading) {
              const blk = createBlock('heading');
              blk.content = { text: innerHtml.replace(/^<h[1-6][^>]*>|<\/h[1-6]>$/gi, ''), level: 'h2' };
              blk.style = { ...blk.style, fontSize, fontWeight, color, textAlign: align, lineHeight, padding: paddingVal, fontFamily };
              blocks.push(blk);
            } else {
              const blk = createBlock('paragraph');
              blk.content = { text: innerHtml };
              blk.style = { ...blk.style, fontSize, fontWeight, color, textAlign: align, lineHeight, padding: paddingVal, fontFamily };
              blocks.push(blk);
            }
          } else if (tag === 'mj-image') {
            const blk = createBlock('image');
            blk.content = {
              src: child.getAttribute('src') || '',
              alt: child.getAttribute('alt') || '',
              linkUrl: child.getAttribute('href') || '',
            };
            blk.style = {
              ...blk.style,
              width: child.getAttribute('width') || '100%',
              height: child.getAttribute('height') || '',
              align: child.getAttribute('align') || 'center',
              borderRadius: child.getAttribute('border-radius') || '0px',
              padding: child.getAttribute('padding') || '10px 15px',
            };
            blocks.push(blk);
          } else if (tag === 'mj-button') {
            const blk = createBlock('button');
            blk.content = {
              label: child.innerHTML.trim() || 'Click Here',
              url: child.getAttribute('href') || '#',
              target: child.getAttribute('target') || '_blank',
            };
            blk.style = {
              ...blk.style,
              backgroundColor: child.getAttribute('background-color') || '#2563eb',
              textColor: child.getAttribute('color') || '#ffffff',
              fontSize: child.getAttribute('font-size') || '14px',
              fontWeight: child.getAttribute('font-weight') || '600',
              borderRadius: child.getAttribute('border-radius') || '6px',
              align: child.getAttribute('align') || 'center',
              padding: child.getAttribute('padding') || '12px 24px',
            };
            blocks.push(blk);
          } else if (tag === 'mj-divider') {
            const blk = createBlock('divider');
            blk.style = {
              ...blk.style,
              borderColor: child.getAttribute('border-color') || '#dfe4ea',
              borderWidth: child.getAttribute('border-width') || '1px',
              borderStyle: child.getAttribute('border-style') || 'solid',
              padding: child.getAttribute('padding') || '16px',
            };
            blocks.push(blk);
          } else if (tag === 'mj-spacer') {
            const blk = createBlock('spacer');
            blk.style = {
              ...blk.style,
              height: child.getAttribute('height') || '24px',
            };
            blocks.push(blk);
          } else if (tag === 'mj-social') {
            const blk = createBlock('social');
            const elements = child.querySelectorAll('mj-social-element');
            const profiles = Array.from(elements).map((el) => ({
              platform: el.getAttribute('name') || el.textContent || 'Social',
              url: el.getAttribute('href') || '#',
            }));
            blk.content = { profiles: profiles.length > 0 ? profiles : blk.content.profiles };
            blk.style = {
              ...blk.style,
              align: child.getAttribute('align') || 'center',
              iconSize: child.getAttribute('icon-size') || '24px',
              padding: child.getAttribute('padding') || '12px 16px',
            };
            blocks.push(blk);
          } else {
            const blk = createBlock('html');
            blk.content = { html: child.innerHTML || child.outerHTML };
            blocks.push(blk);
          }
        });

        return {
          id: colId,
          width,
          settings: {
            backgroundColor: colBg,
            padding: colPadding,
            verticalAlign: 'top',
          },
          blocks,
        };
      });

      rows.push({
        id: rowId,
        name: `Section ${sIdx + 1}`,
        settings: {
          backgroundColor: bg,
          contentBackgroundColor: bg !== 'transparent' ? bg : '#ffffff',
          padding,
          borderRadius,
          stackOnMobile: true,
        },
        columns,
      });
    });

    if (rows.length === 0) {
      return createDefaultDocument(defaultTitle, defaultPreheader);
    }

    return {
      schemaVersion: 2,
      metadata: {
        subject,
        preheader,
        language: 'en',
        direction: 'ltr',
      },
      bodySettings: {
        backgroundColor: bodyBg,
        contentBackgroundColor: '#ffffff',
        contentWidth,
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultFontSize: '14px',
        textColor: '#334155',
        linkColor: '#2563eb',
        globalPadding: '20px 0px',
        mobileBreakpoint: 480,
      },
      rows,
    };
  } catch (err) {
    console.warn('MJML template parsing fallback triggered:', err);
    return createDefaultDocument(defaultTitle, defaultPreheader);
  }
}

export function migrateUnlayerDesign(oldProject: any): EmailDocument {
  if (!oldProject || typeof oldProject !== 'object') {
    return createDefaultDocument('Migrated Template');
  }

  if (oldProject.schemaVersion === 2 && Array.isArray(oldProject.rows)) {
    return oldProject as EmailDocument;
  }

  try {
    const body = oldProject.body || oldProject;
    const bodyRows = body.rows || [];

    const migratedRows: EmailRow[] = [];

    bodyRows.forEach((uRow: any, rIdx: number) => {
      const rowId = createUniqueId('row-migrated');
      const uColumns = uRow.columns || uRow.cells || [];
      const colCount = uColumns.length || 1;
      const defaultWidth = 100 / colCount;

      const columns: EmailColumn[] = uColumns.map((uCol: any, cIdx: number) => {
        const colId = `${rowId}-col-${cIdx + 1}`;
        const uContents = uCol.contents || uCol.blocks || uCol.elements || [];

        const blocks: EmailBlock[] = [];

        uContents.forEach((uContent: any) => {
          const typeStr = (uContent.type || uContent.values?.type || 'text').toLowerCase();
          const values = uContent.values || uContent;

          let blockType: BlockType = 'paragraph';

          if (typeStr.includes('heading')) {
            blockType = 'heading';
          } else if (typeStr.includes('image')) {
            blockType = 'image';
          } else if (typeStr.includes('button')) {
            blockType = 'button';
          } else if (typeStr.includes('divider')) {
            blockType = 'divider';
          } else if (typeStr.includes('spacer')) {
            blockType = 'spacer';
          } else if (typeStr.includes('html')) {
            blockType = 'html';
          } else if (typeStr.includes('social')) {
            blockType = 'social';
          } else if (typeStr.includes('video')) {
            blockType = 'video';
          }

          const blk = createBlock(blockType);

          if (blockType === 'heading') {
            blk.content = { text: decodeHtmlEntities(values.text || values.heading || 'Heading'), level: 'h2' };
            blk.style = { ...blk.style, fontSize: values.fontSize || '24px', color: values.color || '#1e293b' };
          } else if (blockType === 'paragraph') {
            blk.content = { text: decodeHtmlEntities(values.text || values.html || 'Text content') };
            blk.style = { ...blk.style, fontSize: values.fontSize || '14px', color: values.color || '#475569' };
          } else if (blockType === 'image') {
            blk.content = { src: values.src?.url || values.src || '', alt: values.altText || '' };
            blk.style = { ...blk.style, width: values.width || '100%' };
          } else if (blockType === 'button') {
            blk.content = { label: decodeHtmlEntities(values.text || 'Click Here'), url: values.href?.values?.url || values.url || '#' };
            blk.style = { ...blk.style, backgroundColor: values.backgroundColor || '#2563eb', textColor: values.color || '#ffffff' };
          } else if (blockType === 'html') {
            blk.content = { html: values.html || '<div>Legacy HTML</div>' };
          }

          blocks.push(blk);
        });

        return {
          id: colId,
          width: uCol.width || defaultWidth,
          settings: {
            padding: uCol.values?.padding || '10px',
            verticalAlign: 'top',
          },
          blocks,
        };
      });

      migratedRows.push({
        id: rowId,
        name: `Row ${rIdx + 1}`,
        settings: {
          backgroundColor: uRow.values?.backgroundColor || 'transparent',
          contentBackgroundColor: uRow.values?.contentBackgroundColor || '#ffffff',
          padding: uRow.values?.padding || '10px 0px',
          stackOnMobile: true,
        },
        columns,
      });
    });

    if (migratedRows.length === 0) {
      return createDefaultDocument('Migrated Template');
    }

    return {
      schemaVersion: 2,
      metadata: {
        subject: body.values?.subject || 'Migrated Template',
        preheader: body.values?.preheader || '',
        language: 'en',
        direction: 'ltr',
      },
      bodySettings: {
        backgroundColor: body.values?.backgroundColor || '#f1f5f9',
        contentBackgroundColor: body.values?.contentBackgroundColor || '#ffffff',
        contentWidth: body.values?.contentWidth || 600,
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultFontSize: '14px',
        textColor: '#334155',
        linkColor: '#2563eb',
        globalPadding: '20px 0px',
        mobileBreakpoint: 480,
      },
      rows: migratedRows,
    };
  } catch (err) {
    console.warn('Unlayer design migration fallback triggered:', err);
    return createDefaultDocument('Migrated Template Fallback');
  }
}

export function parseTemplateToDocument(input: {
  project?: unknown;
  mjml?: string;
  html?: string;
  name?: string;
  subject?: string;
  preheader?: string;
}): EmailDocument {
  const { project, mjml, html, name = 'Untitled Template', subject, preheader } = input;

  // 1. If project is stringified JSON, parse it
  let parsedProject = project;
  if (typeof project === 'string' && (project.trim().startsWith('{') || project.trim().startsWith('['))) {
    try {
      parsedProject = JSON.parse(project);
    } catch {
      parsedProject = null;
    }
  }

  // 2. If valid schemaVersion 2 EmailDocument with rows
  if (
    parsedProject &&
    typeof parsedProject === 'object' &&
    (parsedProject as any).schemaVersion === 2 &&
    Array.isArray((parsedProject as any).rows) &&
    (parsedProject as any).rows.length > 0
  ) {
    return parsedProject as EmailDocument;
  }

  // 3. If Unlayer project with body.rows or rows
  if (
    parsedProject &&
    typeof parsedProject === 'object' &&
    ((parsedProject as any).body?.rows?.length > 0 || (parsedProject as any).rows?.length > 0)
  ) {
    const unlayerDoc = migrateUnlayerDesign(parsedProject);
    if (unlayerDoc.rows && unlayerDoc.rows.length > 0) {
      return unlayerDoc;
    }
  }

  // 4. Try parsing MJML if available
  if (mjml && typeof mjml === 'string' && mjml.trim().length > 10 && mjml.includes('<mj-')) {
    const mjmlDoc = parseMjmlToDocument(mjml, name, subject, preheader);
    if (mjmlDoc.rows && mjmlDoc.rows.length > 0) {
      return mjmlDoc;
    }
  }

  // 5. Try parsing raw HTML
  if (html && typeof html === 'string' && html.trim().length > 10) {
    const htmlDoc = parseHtmlToDocument(html, name, subject, preheader);
    if (htmlDoc.rows && htmlDoc.rows.length > 0) {
      return htmlDoc;
    } else {
      // Force fallback to a single HTML block so the user doesn't lose their HTML
      const fallbackDoc = createDefaultDocument(name || 'Email Template', preheader || '');
      const rowId = createUniqueId('row');
      const blkId = createUniqueId('blk-html');
      fallbackDoc.rows = [{
        id: rowId,
        name: 'Imported Custom HTML',
        settings: { backgroundColor: '#ffffff', contentBackgroundColor: 'transparent', padding: '0', borderRadius: '0', stackOnMobile: true },
        columns: [{
          id: `${rowId}-col`,
          width: 100,
          settings: { padding: '0', backgroundColor: 'transparent', verticalAlign: 'top', border: 'none' },
          blocks: [{
            id: blkId,
            type: 'html',
            content: { html },
            style: { padding: '0' }
          }]
        }]
      }];
      return fallbackDoc;
    }
  }

  // 6. Ultimate fallback to clean default document
  return createDefaultDocument(name || subject || 'New Template', preheader || '');
}
