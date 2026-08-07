import type { BlockType, EmailBlock, EmailColumn, EmailDocument, EmailRow } from '../types/document.types';
import { createBlock, createDefaultDocument, createUniqueId } from '../utils/blockDefaults';

export function migrateUnlayerDesign(oldProject: any): EmailDocument {
  if (!oldProject || typeof oldProject !== 'object') {
    return createDefaultDocument('Migrated Template');
  }

  // If already schemaVersion 2, return directly
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
            blk.content = { text: values.text || values.heading || 'Heading', level: 'h2' };
            blk.style = { ...blk.style, fontSize: values.fontSize || '24px', color: values.color || '#1e293b' };
          } else if (blockType === 'paragraph') {
            blk.content = { text: values.text || values.html || 'Text content' };
            blk.style = { ...blk.style, fontSize: values.fontSize || '14px', color: values.color || '#475569' };
          } else if (blockType === 'image') {
            blk.content = { src: values.src?.url || values.src || '', alt: values.altText || '' };
          } else if (blockType === 'button') {
            blk.content = { label: values.text || 'Click Here', url: values.href?.values?.url || values.url || '#' };
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
