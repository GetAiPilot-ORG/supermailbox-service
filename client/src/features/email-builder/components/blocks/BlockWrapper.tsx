import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { BlockType, EmailBlock } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { BlockRenderer } from './BlockRenderer';

interface BlockWrapperProps {
  block: EmailBlock;
  columnId: string;
  rowId: string;
  index: number;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ block, columnId, rowId, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);
  const selectBlock = useDocumentStore((state) => state.selectBlock);
  const duplicateBlock = useDocumentStore((state) => state.duplicateBlock);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const addBlock = useDocumentStore((state) => state.addBlock);

  const isSelected = selectedBlockId === block.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: {
      source: 'canvas',
      type: 'block',
      rowId,
      columnId,
      blockId: block.id,
      block,
      index,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    borderRadius: '4px',
    outline: isSelected
      ? '2px solid #2563eb'
      : 'none',
    outlineOffset: '-1px',
    cursor: 'pointer',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
    >
      {/* Block Type Badge & Hover Toolbar */}
      {(isSelected || isHovered) && (
        <div
          style={{
            position: 'absolute',
            top: '-26px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: isSelected ? '#2563eb' : '#3b82f6',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '4px 4px 0 0',
            fontSize: '11px',
            fontWeight: 600,
            zIndex: 30,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginRight: '4px' }}
            title="Drag to move block"
          >
            <GripVertical size={13} />
          </span>

          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>{block.type}</span>

          <button
            type="button"
            onClick={() => duplicateBlock(block.id)}
            title="Duplicate block"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <Copy size={12} />
          </button>

          <button
            type="button"
            onClick={() => deleteBlock(block.id)}
            title="Delete block"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Actual Block Content */}
      <BlockRenderer block={block} />

      {/* Add Content Insertion Indicator below block */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
          }}
          onClick={(e) => {
            e.stopPropagation();
            addBlock('paragraph', columnId, index + 1);
          }}
        >
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={11} /> Add Text
          </button>
        </div>
      )}
    </div>
  );
};
