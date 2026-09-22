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

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(str, 'text/html');
      return doc.body.textContent || str;
    } catch {
      return str;
    }
  }
  return str;
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

  // 7. Table handling
  if (tag === 'table') {
    // Check if bulletproof button wrapped in table
    const links = Array.from(node.querySelectorAll('a'));
    if (links.length === 1) {
      const aEl = links[0];
      const aStyles = parseCssStyles(aEl.getAttribute('style'));
      const isButton = Boolean(
        aStyles['background'] ||
        aStyles['background-color'] ||
        aStyles['border-radius'] ||
        aStyles['display'] === 'inline-block' ||
        aEl.classList.contains('cta-button') ||
        aEl.classList.contains('btn')
      );
      if (isButton && (node.textContent?.trim() === aEl.textContent?.trim())) {
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

    const blk = createBlock('html');
    blk.content = { html: node.outerHTML };
    return [blk];
  }

  // 8. Fallback for any other HTML element
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

    // Check for responsive Table-based email structure
    const mainTable =
      doc.querySelector('table.full-width-table') ||
      doc.querySelector('table[width="600"], table[width="620"], table[width="500"], table[width="480"]') ||
      doc.querySelector('table[style*="max-width: 600"], table[style*="max-width:600"], table[style*="max-width: 620"], table[style*="max-width: 480"]') ||
      doc.querySelector('td[align="center"] > table') ||
      doc.querySelector('body > table table') ||
      (doc.querySelectorAll('table').length === 1 ? doc.querySelector('table') : null);

    const rows: EmailRow[] = [];
    let contentWidth = 600;
    let outerBg = bodyStyles['background-color'] || bodyStyles['background'] || '#f8fafc';
    let cardBg = '#ffffff';
    let cardTextColor = bodyStyles['color'] || '#334155';
    let cardFontFamily = bodyStyles['font-family'] || "'Outfit', -apple-system, sans-serif";

    if (mainTable) {
      const mainTableStyles = parseCssStyles(mainTable.getAttribute('style'));
      const tableWidthAttr = mainTable.getAttribute('width');
      if (tableWidthAttr) {
        contentWidth = parseInt(tableWidthAttr, 10) || 600;
      } else if (mainTableStyles['max-width'] || mainTableStyles['width']) {
        contentWidth = parseInt(mainTableStyles['max-width'] || mainTableStyles['width'], 10) || 600;
      }
      if (mainTableStyles['background-color'] || mainTableStyles['background']) {
        cardBg = mainTableStyles['background-color'] || mainTableStyles['background'];
      }

      // Extract direct top-level <tr> rows of mainTable
      const trList = Array.from(mainTable.querySelectorAll(':scope > tbody > tr, :scope > tr'));

      trList.forEach((tr, trIdx) => {
        // Check if pure spacer row
        const trText = tr.textContent?.trim() || '';
        const cells = Array.from(tr.querySelectorAll(':scope > td, :scope > th'));
        
        const isSpacer = cells.length === 1 && (
          trText === '' || trText === ' ' || trText === '&nbsp;'
        ) && (
          cells[0].hasAttribute('height') ||
          (cells[0].getAttribute('style') || '').includes('height')
        );

        if (isSpacer) {
          const hStr = cells[0].getAttribute('height') || parseCssStyles(cells[0].getAttribute('style'))['height'] || '16px';
          const hNum = parseInt(hStr, 10) || 16;
          if (hNum >= 12 && rows.length > 0 && trIdx < trList.length - 1) {
            const rowId = createUniqueId('row');
            const colId = `${rowId}-col-1`;
            const spacerBlk = createBlock('spacer');
            spacerBlk.style.height = `${hNum}px`;
            rows.push({
              id: rowId,
              name: `Spacer (${hNum}px)`,
              settings: {
                backgroundColor: 'transparent',
                contentBackgroundColor: 'transparent',
                padding: '0px',
                stackOnMobile: true,
              },
              columns: [{
                id: colId,
                width: 100,
                settings: { padding: '0px', verticalAlign: 'top', backgroundColor: 'transparent' },
                blocks: [spacerBlk],
              }],
            });
          }
          return;
        }

        if (cells.length === 0) return;

        const rowId = createUniqueId('row');
        const columns: EmailColumn[] = [];
        const totalWidth = 100;
        const colWidth = Math.floor(totalWidth / cells.length);

        const trStyles = parseCssStyles(tr.getAttribute('style'));
        const firstCellStyles = parseCssStyles(cells[0].getAttribute('style'));

        let rowName = `Section ${trIdx + 1}`;
        const trHtml = tr.innerHTML.toLowerCase();
        if (trIdx === 0 || trHtml.includes('logo') || trHtml.includes('header')) {
          rowName = 'Header Section';
        } else if (trHtml.includes('hero') || tr.querySelector('h1')) {
          rowName = 'Hero Banner';
        } else if (trIdx === trList.length - 1 || trHtml.includes('footer') || trHtml.includes('rights reserved') || trHtml.includes('copyright') || trHtml.includes('cpaas')) {
          rowName = 'Footer Section';
        } else if (tr.querySelector('h2, h3, h4')) {
          const headingText = tr.querySelector('h2, h3, h4')?.textContent?.trim();
          rowName = headingText && headingText.length < 35 ? headingText : 'Content Section';
        }

        const rowBg = trStyles['background'] || trStyles['background-color'] || 'transparent';
        const rowContentBg = firstCellStyles['background'] || firstCellStyles['background-color'] || cardBg;
        const rowPadding = firstCellStyles['padding'] || trStyles['padding'] || '16px 20px';
        const rowBorderRadius = firstCellStyles['border-radius'] || trStyles['border-radius'] || '0px';

        cells.forEach((cell, cellIdx) => {
          const colId = `${rowId}-col-${cellIdx + 1}`;
          const blocks: EmailBlock[] = [];
          const cellStyles = parseCssStyles(cell.getAttribute('style'));
          const cellColor = cellStyles['color'] || cardTextColor;

          const cellDirectChildren = Array.from(cell.children).filter(
            (c) => c.tagName.toLowerCase() !== 'script' && c.tagName.toLowerCase() !== 'style'
          );

          if (cellDirectChildren.length > 0) {
            cellDirectChildren.forEach((child) => {
              blocks.push(...htmlElementToBlocks(child, cellColor));
            });
          } else if (cell.innerHTML.trim()) {
            blocks.push(...htmlElementToBlocks(cell, cellColor));
          }

          if (blocks.length > 0) {
            columns.push({
              id: colId,
              width: cellIdx === cells.length - 1 ? totalWidth - (colWidth * cellIdx) : colWidth,
              settings: {
                padding: '0px',
                verticalAlign: (cellStyles['vertical-align'] as any) || 'top',
                backgroundColor: 'transparent',
              },
              blocks,
            });
          }
        });

        if (columns.length > 0 && columns.some(c => c.blocks.length > 0)) {
          rows.push({
            id: rowId,
            name: rowName,
            settings: {
              backgroundColor: rowBg,
              contentBackgroundColor: rowContentBg,
              padding: rowPadding,
              borderRadius: rowBorderRadius,
              stackOnMobile: true,
            },
            columns,
          });
        }
      });
    }

    // If mainTable yielded valid rows, return the document
    if (rows.length > 0) {
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
    }

    // 3. Fallback: Card or Div-based Layout
    let outerContainer: Element = bodyEl;
    const bodyDirectDivs = Array.from(bodyEl.children).filter(
      (c) => c.tagName.toLowerCase() === 'div'
    );

    let cardEl: Element = bodyEl;
    let isNestedInWrapper = false;

    if (bodyDirectDivs.length === 1) {
      const topDiv = bodyDirectDivs[0];
      const innerDivs = Array.from(topDiv.children).filter(
        (c) => c.tagName.toLowerCase() === 'div'
      );

      if (innerDivs.length === 1) {
        // topDiv is an outer wrapper, innerDiv is the card
        outerContainer = topDiv;
        cardEl = innerDivs[0];
        isNestedInWrapper = true;
      } else {
        // topDiv IS the card itself directly inside body
        cardEl = topDiv;
        outerContainer = bodyEl;
        isNestedInWrapper = false;
      }
    } else {
      const candidateMaxWidthDiv = doc.querySelector('div[style*="max-width"]');
      if (candidateMaxWidthDiv && candidateMaxWidthDiv.parentElement !== bodyEl && candidateMaxWidthDiv.parentElement) {
        cardEl = candidateMaxWidthDiv;
        outerContainer = candidateMaxWidthDiv.parentElement;
        isNestedInWrapper = true;
      } else if (candidateMaxWidthDiv) {
        cardEl = candidateMaxWidthDiv;
        outerContainer = bodyEl;
        isNestedInWrapper = false;
      }
    }

    const outerStyles = parseCssStyles(outerContainer.getAttribute('style'));
    const cardStyles = parseCssStyles(cardEl.getAttribute('style'));
    const contentWidthStr = cardStyles['max-width'] || outerStyles['max-width'] || bodyStyles['max-width'] || '600';
    contentWidth = parseInt(contentWidthStr, 10) || 600;

    cardBg = cardStyles['background'] || cardStyles['background-color'] || '#ffffff';
    outerBg = isNestedInWrapper && outerStyles['background'] && outerStyles['background'] !== cardBg
      ? (outerStyles['background'] || outerStyles['background-color'] || '#f1f5f9')
      : (bodyStyles['background-color'] || bodyStyles['background'] || '#f1f5f9');

    // Ensure the studio canvas backdrop always provides clean contrast for the email card
    if (
      !outerBg ||
      outerBg.toLowerCase() === cardBg.toLowerCase() ||
      outerBg.toLowerCase() === 'transparent' ||
      outerBg.toLowerCase() === '#0a0a0c' ||
      outerBg.toLowerCase() === '#000000' ||
      outerBg.toLowerCase() === '#131315'
    ) {
      outerBg = '#f1f5f9';
    }

    cardTextColor = cardStyles['color'] || outerStyles['color'] || bodyStyles['color'] || '#334155';
    cardFontFamily = cardStyles['font-family'] || outerStyles['font-family'] || bodyStyles['font-family'] || 'Inter, Arial, sans-serif';

    const cardDirectChildren = Array.from(cardEl.children).filter(
      (c) => c.tagName.toLowerCase() !== 'script' && c.tagName.toLowerCase() !== 'style'
    );

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
      const fallbackDoc = createDefaultDocument(defaultTitle, defaultPreheader);
      const rowId = createUniqueId('row');
      const blkId = createUniqueId('blk-html');
      fallbackDoc.rows = [{
        id: rowId,
        name: 'Imported HTML',
        settings: { backgroundColor: '#ffffff', contentBackgroundColor: 'transparent', padding: '0', borderRadius: '0', stackOnMobile: true },
        columns: [{
          id: `${rowId}-col`,
          width: 100,
          settings: { padding: '0', backgroundColor: 'transparent', verticalAlign: 'top', border: 'none' },
          blocks: [{
            id: blkId,
            type: 'html',
            content: { html },
            style: { padding: '0' },
          }],
        }],
      }];
      return fallbackDoc;
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

  // 2. Check if valid schemaVersion 2 EmailDocument with rows
  // CRITICAL: Detect if parsedProject was truncated/corrupted by previous bug (e.g. only 1 row with <= 3 blocks while full HTML has >= 1500 chars with rich content)
  const isSuspiciouslyTruncated = Boolean(
    parsedProject &&
    typeof parsedProject === 'object' &&
    (parsedProject as any).schemaVersion === 2 &&
    Array.isArray((parsedProject as any).rows) &&
    (parsedProject as any).rows.length === 1 &&
    ((parsedProject as any).rows[0]?.columns?.[0]?.blocks?.length ?? 0) <= 3 &&
    html &&
    typeof html === 'string' &&
    html.length > 1500 &&
    (html.includes('<table') || html.includes('full-width-table') || html.includes('<h1') || html.includes('<h2'))
  );

  if (
    !isSuspiciouslyTruncated &&
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
  const isMjmlSuspiciouslyTruncated = Boolean(
    mjml &&
    typeof mjml === 'string' &&
    html &&
    typeof html === 'string' &&
    html.length > 2000 &&
    (html.includes('<table') || html.includes('full-width-table') || html.includes('<h1') || html.includes('<h2')) &&
    ((mjml.match(/<mj-section/g) || []).length <= 1) &&
    html.length > (mjml.length * 1.5)
  );

  if (!isMjmlSuspiciouslyTruncated && mjml && typeof mjml === 'string' && mjml.trim().length > 10 && mjml.includes('<mj-')) {
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
