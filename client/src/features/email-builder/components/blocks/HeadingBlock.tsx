import React from 'react';
import type { EmailBlock } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { mergeStyles } from '../../utils/deviceUtils';
import { RichTextEditor } from '../richtext/RichTextEditor';

interface HeadingBlockProps {
  block: EmailBlock;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block }) => {
  const updateBlock = useDocumentStore((state) => state.updateBlock);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);
  const activeDevice = useDocumentStore((state) => state.activeDevice);
  const isSelected = selectedBlockId === block.id;

  const style = mergeStyles(block.style, block.tabletStyle, block.mobileStyle, activeDevice);
  const { content } = block;
  const Tag = (content.level as 'h1' | 'h2' | 'h3' | 'h4') || 'h2';

  const headingStyles: React.CSSProperties = {
    margin: 0,
    fontSize: style.fontSize || '24px',
    fontWeight: style.fontWeight || '700',
    color: style.color || '#1e293b',
    textAlign: (style.textAlign as any) || 'left',
    lineHeight: style.lineHeight || '1.3',
    fontFamily: style.fontFamily || 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  };

  if (isSelected) {
    return (
      <div style={headingStyles}>
        <RichTextEditor
          content={content.text || 'Heading'}
          style={{
            fontSize: style.fontSize || '24px',
            fontWeight: style.fontWeight || '700',
            color: style.color || '#1e293b',
            textAlign: (style.textAlign as any) || 'left',
            lineHeight: style.lineHeight || '1.3',
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
    <Tag
      style={headingStyles}
      dangerouslySetInnerHTML={{ __html: content.text || 'Heading' }}
    />
  );
};
