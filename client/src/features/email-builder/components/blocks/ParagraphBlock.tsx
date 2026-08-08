import React from 'react';
import type { EmailBlock } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { mergeStyles } from '../../utils/deviceUtils';
import { RichTextEditor } from '../richtext/RichTextEditor';

interface ParagraphBlockProps {
  block: EmailBlock;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block }) => {
  const updateBlock = useDocumentStore((state) => state.updateBlock);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);
  const activeDevice = useDocumentStore((state) => state.activeDevice);
  const isSelected = selectedBlockId === block.id;

  const style = mergeStyles(block.style, block.tabletStyle, block.mobileStyle, activeDevice);
  const { content } = block;

  const paragraphStyles: React.CSSProperties = {
    margin: 0,
    fontSize: style.fontSize || '14px',
    fontWeight: style.fontWeight || '400',
    color: style.color || '#475569',
    textAlign: (style.textAlign as any) || 'left',
    lineHeight: style.lineHeight || '1.6',
    fontFamily: style.fontFamily || 'inherit',
    padding: style.padding || '8px 12px',
    width: '100%',
    boxSizing: 'border-box',
  };

  if (isSelected) {
    return (
      <div style={paragraphStyles}>
        <RichTextEditor
          content={content.text || 'Add paragraph copy here...'}
          style={{
            fontSize: style.fontSize || '14px',
            fontWeight: style.fontWeight || '400',
            color: style.color || '#475569',
            textAlign: (style.textAlign as any) || 'left',
            lineHeight: style.lineHeight || '1.6',
            fontFamily: style.fontFamily || 'inherit',
          }}
          onUpdate={(html) => {
            updateBlock(block.id, { content: { ...content, text: html } });
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={paragraphStyles}
      dangerouslySetInnerHTML={{ __html: content.text || 'Paragraph copy...' }}
    />
  );
};
