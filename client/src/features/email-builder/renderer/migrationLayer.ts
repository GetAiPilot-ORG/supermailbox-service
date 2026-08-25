import type { BlockType, EmailBlock, EmailColumn, EmailDocument, EmailRow } from '../types/document.types';
import { createBlock, createDefaultDocument, createUniqueId } from '../utils/blockDefaults';

function parseStyleString(styleStr?: string): Record<string, string> {
  const styles: Record<string, string> = {};
  if (!styleStr) return styles;
  const declarations = styleStr.split(';');
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const key = decl.slice(0, colonIdx).trim().toLowerCase();
    const value = decl.slice(colonIdx + 1).trim();
    if (key && value) {
      styles[key] = value;
    }
  }
  return styles;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rarr;/g, '→')
    .replace(/&bull;/g, '•')
    .replace(/&nbsp;/g, ' ');
}

export function migrateUnlayerDesign(oldProject: any): EmailDocument {
  if (!oldProject || typeof oldProject !== 'object') {
    return createDefaultDocument('Migrated Template');
  }

  // If already schemaVersion 2, return directly
  if (oldProject.schemaVersion === 2 && Array.isArray(oldProject.rows) && oldProject.rows.length > 0) {
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

export function mjmlToDocument(
  mjmlString: string,
  defaultName = 'Email Template',
  defaultSubject?: string,
  defaultPreheader?: string
): EmailDocument {
  if (!mjmlString || typeof mjmlString !== 'string' || !mjmlString.trim()) {
    return createDefaultDocument(defaultSubject || defaultName, defaultPreheader);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mjmlString, 'text/html');

    const titleEl = doc.querySelector('mj-title');
    const previewEl = doc.querySelector('mj-preview');
    const bodyEl = doc.querySelector('mj-body');

    const subject = titleEl?.textContent?.trim() || defaultSubject || defaultName;
    const preheader = previewEl?.textContent?.trim() || defaultPreheader || '';
    const bodyBg = bodyEl?.getAttribute('background-color') || '#f1f5f9';
    const bodyWidthStr = bodyEl?.getAttribute('width') || '600';
    const contentWidth = parseInt(bodyWidthStr.replace('px', ''), 10) || 600;

    const sections = Array.from(doc.querySelectorAll('mj-section'));
    const rows: EmailRow[] = [];

    sections.forEach((sectionEl, sIdx) => {
      const rowId = createUniqueId('row');
      const bg = sectionEl.getAttribute('background-color') || 'transparent';
      const padding = sectionEl.getAttribute('padding') || '10px 0px';

      const columnsEl = Array.from(sectionEl.querySelectorAll('mj-column'));
      const colCount = columnsEl.length || 1;
      const defaultColWidth = 100 / colCount;

      const columns: EmailColumn[] = (columnsEl.length > 0 ? columnsEl : [null]).map((colEl, cIdx) => {
        const colId = `${rowId}-col-${cIdx + 1}`;
        const widthAttr = colEl?.getAttribute('width');
        const width = widthAttr ? parseFloat(widthAttr.replace('%', '')) : defaultColWidth;
        const colBg = colEl?.getAttribute('background-color') || 'transparent';
        const colPadding = colEl?.getAttribute('padding') || '10px';

        const blocks: EmailBlock[] = [];

        if (colEl) {
          Array.from(colEl.children).forEach((childEl) => {
            const tag = childEl.tagName.toUpperCase();

            if (tag === 'MJ-TEXT') {
              const text = decodeHtmlEntities(childEl.innerHTML.trim());
              const fontSize = childEl.getAttribute('font-size') || '14px';
              const fontWeight = childEl.getAttribute('font-weight') || '400';
              const color = childEl.getAttribute('color') || '#334155';
              const align = childEl.getAttribute('align') || 'left';
              const lineHeight = childEl.getAttribute('line-height') || '1.5';
              const fontFamily = childEl.getAttribute('font-family') || 'inherit';
              const padding = childEl.getAttribute('padding') || '8px 16px';

              const numFontSize = parseInt(fontSize, 10) || 14;
              const isHeading = numFontSize >= 20 || parseInt(fontWeight, 10) >= 700 || /^<h[1-6]/i.test(text);

              if (isHeading) {
                const blk = createBlock('heading');
                blk.content = { text, level: numFontSize >= 28 ? 'h1' : numFontSize >= 22 ? 'h2' : 'h3' };
                blk.style = { ...blk.style, fontSize, fontWeight, color, textAlign: align, lineHeight, fontFamily, padding };
                blocks.push(blk);
              } else {
                const blk = createBlock('paragraph');
                blk.content = { text };
                blk.style = { ...blk.style, fontSize, fontWeight, color, textAlign: align, lineHeight, fontFamily, padding };
                blocks.push(blk);
              }
            } else if (tag === 'MJ-IMAGE') {
              const blk = createBlock('image');
              blk.content = {
                src: childEl.getAttribute('src') || '',
                alt: childEl.getAttribute('alt') || '',
                linkUrl: childEl.getAttribute('href') || '',
              };
              blk.style = {
                ...blk.style,
                width: childEl.getAttribute('width') || '100%',
                align: childEl.getAttribute('align') || 'center',
                borderRadius: childEl.getAttribute('border-radius') || '0px',
                padding: childEl.getAttribute('padding') || '10px 16px',
              };
              blocks.push(blk);
            } else if (tag === 'MJ-BUTTON') {
              const blk = createBlock('button');
              blk.content = {
                label: decodeHtmlEntities(childEl.innerHTML || childEl.textContent || 'Click Here'),
                url: childEl.getAttribute('href') || '#',
                target: childEl.getAttribute('target') || '_blank',
              };
              blk.style = {
                ...blk.style,
                backgroundColor: childEl.getAttribute('background-color') || '#2563eb',
                textColor: childEl.getAttribute('color') || '#ffffff',
                fontSize: childEl.getAttribute('font-size') || '14px',
                fontWeight: childEl.getAttribute('font-weight') || '600',
                borderRadius: childEl.getAttribute('border-radius') || '6px',
                align: childEl.getAttribute('align') || 'center',
                padding: childEl.getAttribute('padding') || '12px 24px',
              };
              blocks.push(blk);
            } else if (tag === 'MJ-DIVIDER') {
              const blk = createBlock('divider');
              blk.style = {
                ...blk.style,
                borderColor: childEl.getAttribute('border-color') || '#e2e8f0',
                borderWidth: childEl.getAttribute('border-width') || '1px',
                borderStyle: childEl.getAttribute('border-style') || 'solid',
                padding: childEl.getAttribute('padding') || '16px',
              };
              blocks.push(blk);
            } else if (tag === 'MJ-SPACER') {
              const blk = createBlock('spacer');
              blk.style = {
                ...blk.style,
                height: childEl.getAttribute('height') || '24px',
              };
              blocks.push(blk);
            } else if (tag === 'MJ-SOCIAL') {
              const blk = createBlock('social');
              const elements = Array.from(childEl.querySelectorAll('mj-social-element'));
              blk.content = {
                profiles: elements.map((e) => ({
                  platform: e.getAttribute('name') || e.textContent || 'Social',
                  url: e.getAttribute('href') || '#',
                })),
              };
              blk.style = {
                ...blk.style,
                align: childEl.getAttribute('align') || 'center',
                iconSize: childEl.getAttribute('icon-size') || '24px',
                padding: childEl.getAttribute('padding') || '12px 16px',
              };
              blocks.push(blk);
            } else {
              // Raw / Table / Custom HTML
              const blk = createBlock('html');
              blk.content = { html: childEl.innerHTML || childEl.outerHTML };
              blocks.push(blk);
            }
          });
        }

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
          contentBackgroundColor: '#ffffff',
          padding,
          stackOnMobile: true,
        },
        columns,
      });
    });

    if (rows.length === 0) {
      return createDefaultDocument(subject, preheader);
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
    console.warn('MJML to document conversion error:', err);
    return createDefaultDocument(defaultSubject || defaultName, defaultPreheader);
  }
}

export function htmlToDocument(
  htmlString: string,
  defaultName = 'Email Template',
  defaultSubject?: string,
  defaultPreheader?: string
): EmailDocument {
  if (!htmlString || typeof htmlString !== 'string' || !htmlString.trim()) {
    return createDefaultDocument(defaultSubject || defaultName, defaultPreheader);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const titleEl = doc.querySelector('title');
    const subject = titleEl?.textContent?.trim() || defaultSubject || defaultName;
    const preheader = defaultPreheader || '';

    // Extract body styles if available
    let bodyBg = '#f1f5f9';
    let contentWidth = 600;
    let defaultFont = 'Arial, Helvetica, sans-serif';

    const rootEl = doc.body.firstElementChild || doc.body;
    const rootStyle = rootEl ? parseStyleString(rootEl.getAttribute('style') || '') : {};

    if (rootStyle['background-color']) bodyBg = rootStyle['background-color'];
    else if (rootStyle['background'] && !rootStyle['background'].includes('gradient')) bodyBg = rootStyle['background'];

    if (rootStyle['max-width']) {
      const mw = parseInt(rootStyle['max-width'].replace('px', ''), 10);
      if (mw) contentWidth = mw;
    }
    if (rootStyle['font-family']) {
      defaultFont = rootStyle['font-family'];
    }

    // Find the main content container(s)
    let containerEl: Element = rootEl;
    if (containerEl.children.length === 1 && containerEl.firstElementChild) {
      containerEl = containerEl.firstElementChild;
    }

    const sectionElements = Array.from(containerEl.children);
    const rows: EmailRow[] = [];

    const processElementToBlock = (el: Element, parentStyle?: Record<string, string>): EmailBlock | null => {
      const tag = el.tagName.toUpperCase();
      const style = parseStyleString(el.getAttribute('style') || '');
      const inheritedColor = style['color'] || parentStyle?.['color'];
      const inheritedAlign = style['text-align'] || parentStyle?.['text-align'];

      if (/^H[1-6]$/.test(tag)) {
        const blk = createBlock('heading');
        blk.content = {
          text: decodeHtmlEntities(el.innerHTML.trim()),
          level: tag.toLowerCase() as any,
        };
        blk.style = {
          ...blk.style,
          fontSize: style['font-size'] || (tag === 'H1' ? '26px' : tag === 'H2' ? '22px' : '18px'),
          fontWeight: style['font-weight'] || '700',
          color: inheritedColor || '#1e293b',
          textAlign: inheritedAlign || 'left',
          lineHeight: style['line-height'] || '1.3',
          padding: style['padding'] || '8px 16px',
        };
        return blk;
      }

      if (tag === 'P') {
        const blk = createBlock('paragraph');
        blk.content = { text: decodeHtmlEntities(el.innerHTML.trim()) };
        blk.style = {
          ...blk.style,
          fontSize: style['font-size'] || '14px',
          fontWeight: style['font-weight'] || '400',
          color: inheritedColor || '#475569',
          textAlign: inheritedAlign || 'left',
          lineHeight: style['line-height'] || '1.6',
          padding: style['padding'] || '6px 16px',
        };
        return blk;
      }

      if (tag === 'HR') {
        const blk = createBlock('divider');
        blk.style = {
          ...blk.style,
          borderColor: style['border-color'] || style['border-top-color'] || '#e2e8f0',
          borderWidth: style['border-width'] || style['border-top-width'] || '1px',
          padding: style['padding'] || '12px 16px',
        };
        return blk;
      }

      if (tag === 'IMG') {
        const blk = createBlock('image');
        blk.content = {
          src: el.getAttribute('src') || '',
          alt: el.getAttribute('alt') || '',
          linkUrl: '',
        };
        blk.style = {
          ...blk.style,
          width: style['width'] || el.getAttribute('width') || '100%',
          align: inheritedAlign || 'center',
          borderRadius: style['border-radius'] || '0px',
          padding: style['padding'] || '8px 16px',
        };
        return blk;
      }

      // Button / Link CTA
      if (tag === 'A' && (style['background'] || style['background-color'] || style['padding'])) {
        const blk = createBlock('button');
        blk.content = {
          label: decodeHtmlEntities(el.textContent || el.innerHTML.trim()),
          url: el.getAttribute('href') || '#',
          target: el.getAttribute('target') || '_blank',
        };
        blk.style = {
          ...blk.style,
          backgroundColor: style['background-color'] || style['background'] || '#2563eb',
          textColor: style['color'] || '#ffffff',
          fontSize: style['font-size'] || '14px',
          fontWeight: style['font-weight'] || '600',
          borderRadius: style['border-radius'] || '6px',
          padding: style['padding'] || '12px 24px',
          align: inheritedAlign || 'center',
        };
        return blk;
      }

      // Wrapper with single button inside
      if (el.children.length === 1 && el.firstElementChild?.tagName.toUpperCase() === 'A') {
        const aEl = el.firstElementChild;
        const aStyle = parseStyleString(aEl.getAttribute('style') || '');
        if (aStyle['background'] || aStyle['background-color'] || aStyle['padding']) {
          const blk = createBlock('button');
          blk.content = {
            label: decodeHtmlEntities(aEl.textContent || aEl.innerHTML.trim()),
            url: aEl.getAttribute('href') || '#',
            target: aEl.getAttribute('target') || '_blank',
          };
          blk.style = {
            ...blk.style,
            backgroundColor: aStyle['background-color'] || aStyle['background'] || '#2563eb',
            textColor: aStyle['color'] || '#ffffff',
            fontSize: aStyle['font-size'] || '14px',
            fontWeight: aStyle['font-weight'] || '600',
            borderRadius: aStyle['border-radius'] || '6px',
            padding: aStyle['padding'] || '12px 24px',
            align: inheritedAlign || 'center',
          };
          return blk;
        }
      }

      // Simple text container (no rich child elements)
      if (el.children.length === 0 && el.textContent && el.textContent.trim()) {
        const text = decodeHtmlEntities(el.innerHTML.trim());
        const fontSize = style['font-size'] || '14px';
        const numFontSize = parseInt(fontSize, 10) || 14;
        const isHeading = numFontSize >= 20 || parseInt(style['font-weight'] || '400', 10) >= 700;

        if (isHeading) {
          const blk = createBlock('heading');
          blk.content = { text, level: numFontSize >= 26 ? 'h1' : 'h2' };
          blk.style = {
            ...blk.style,
            fontSize,
            fontWeight: style['font-weight'] || '700',
            color: inheritedColor || '#1e293b',
            textAlign: inheritedAlign || 'left',
            padding: style['padding'] || '8px 16px',
          };
          return blk;
        } else {
          const blk = createBlock('paragraph');
          blk.content = { text };
          blk.style = {
            ...blk.style,
            fontSize,
            fontWeight: style['font-weight'] || '400',
            color: inheritedColor || '#475569',
            textAlign: inheritedAlign || 'left',
            padding: style['padding'] || '6px 16px',
          };
          return blk;
        }
      }

      // Complex styled snippet / HTML block
      const blk = createBlock('html');
      blk.content = { html: el.outerHTML };
      blk.style = {
        ...blk.style,
        padding: style['padding'] || '0px',
      };
      return blk;
    };

    if (sectionElements.length === 0) {
      const rowId = createUniqueId('row');
      const blk = createBlock('html');
      blk.content = { html: htmlString };
      rows.push({
        id: rowId,
        name: 'Main Section',
        settings: {
          backgroundColor: 'transparent',
          contentBackgroundColor: '#ffffff',
          padding: '10px 0px',
          stackOnMobile: true,
        },
        columns: [
          {
            id: `${rowId}-col-1`,
            width: 100,
            settings: { padding: '10px', verticalAlign: 'top' },
            blocks: [blk],
          },
        ],
      });
    } else {
      sectionElements.forEach((secEl, sIdx) => {
        const rowId = createUniqueId('row');
        const secStyle = parseStyleString(secEl.getAttribute('style') || '');
        const bg = secStyle['background'] || secStyle['background-color'] || 'transparent';
        const padding = secStyle['padding'] || '10px 0px';

        const blocks: EmailBlock[] = [];

        const directChildren = Array.from(secEl.children);
        if (directChildren.length > 0) {
          directChildren.forEach((child) => {
            const blk = processElementToBlock(child, secStyle);
            if (blk) blocks.push(blk);
          });
        } else {
          const blk = processElementToBlock(secEl, secStyle);
          if (blk) blocks.push(blk);
        }

        if (blocks.length > 0) {
          rows.push({
            id: rowId,
            name: `Section ${sIdx + 1}`,
            settings: {
              backgroundColor: bg,
              contentBackgroundColor: bg.includes('gradient') ? 'transparent' : '#ffffff',
              padding,
              stackOnMobile: true,
            },
            columns: [
              {
                id: `${rowId}-col-1`,
                width: 100,
                settings: { padding: '0px', verticalAlign: 'top' },
                blocks,
              },
            ],
          });
        }
      });
    }

    if (rows.length === 0) {
      return createDefaultDocument(subject, preheader);
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
        defaultFontFamily: defaultFont,
        defaultFontSize: '14px',
        textColor: '#334155',
        linkColor: '#2563eb',
        globalPadding: '20px 0px',
        mobileBreakpoint: 480,
      },
      rows,
    };
  } catch (err) {
    console.warn('HTML to document conversion error:', err);
    return createDefaultDocument(defaultSubject || defaultName, defaultPreheader);
  }
}

export function convertAnyToDocument(options: {
  project?: unknown;
  mjml?: string;
  html?: string;
  name?: string;
  subject?: string;
  preheader?: string;
}): EmailDocument {
  const { project, mjml, html, name = 'Email Template', subject, preheader } = options;

  // 1. If already valid schemaVersion 2 document with rows
  if (
    project &&
    typeof project === 'object' &&
    'schemaVersion' in (project as any) &&
    (project as any).schemaVersion === 2 &&
    Array.isArray((project as any).rows) &&
    (project as any).rows.length > 0
  ) {
    return project as EmailDocument;
  }

  // 2. If Unlayer design project
  if (
    project &&
    typeof project === 'object' &&
    ('body' in (project as any) || (Array.isArray((project as any).rows) && (project as any).rows.length > 0))
  ) {
    const migrated = migrateUnlayerDesign(project);
    if (migrated.rows.length > 0 && migrated.rows[0].columns[0]?.blocks.length > 0) {
      return migrated;
    }
  }

  // 3. If MJML string provided
  if (mjml && typeof mjml === 'string' && (mjml.includes('<mjml') || mjml.includes('<mj-section') || mjml.includes('<mj-'))) {
    return mjmlToDocument(mjml, name, subject, preheader);
  }

  // 4. If HTML string provided
  if (html && typeof html === 'string' && html.trim().length > 0 && html.includes('<')) {
    return htmlToDocument(html, name, subject, preheader);
  }

  // 5. Fallback to default clean template
  return createDefaultDocument(subject || name, preheader || '');
}
