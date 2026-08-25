import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { EmailColumn } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { BlockWrapper } from '../blocks/BlockWrapper';
import { DropZone } from './DropZone';

interface ColumnRendererProps {
  column: EmailColumn;
  rowId: string;
}

export const ColumnRenderer: React.FC<ColumnRendererProps> = ({ column, rowId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedColumnId = useDocumentStore((state) => state.selectedColumnId);
  const selectColumn = useDocumentStore((state) => state.selectColumn);
  const addBlock = useDocumentStore((state) => state.addBlock);

  const isSelected = selectedColumnId === column.id;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
      rowId,
    },
  });

  const blockIds = column.blocks.map((b) => b.id);

  const colBg = column.settings.backgroundColor;
  const isColGradient = colBg && (colBg.includes('gradient') || colBg.includes('url('));

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        selectColumn(column.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: `0 0 ${column.width}%`,
        maxWidth: `${column.width}%`,
        boxSizing: 'border-box',
        padding: column.settings.padding || '8px',
        background: isColGradient ? colBg : undefined,
        backgroundColor: !isColGradient ? (colBg || 'transparent') : undefined,
        borderRadius: column.settings.borderRadius || '0px',
        border: isSelected
          ? '1.5px solid #3b82f6'
          : isOver
          ? '2px dashed #2563eb'
          : '1px solid transparent',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        {column.blocks.length > 0 ? (
          <>
            <DropZone id={`dropzone-${column.id}-0`} columnId={column.id} index={0} />
            {column.blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <BlockWrapper block={block} columnId={column.id} rowId={rowId} index={index} />
                <DropZone id={`dropzone-${column.id}-${index + 1}`} columnId={column.id} index={index + 1} />
              </React.Fragment>
            ))}
          </>
        ) : (
          /* Empty Column Drop Zone */
          <div
            onClick={(e) => {
              e.stopPropagation();
              addBlock('paragraph', column.id);
            }}
            style={{
              flex: 1,
              minHeight: '64px',
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              background: isOver ? '#eff6ff' : '#f8fafc',
              borderColor: isOver ? '#2563eb' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} color={isOver ? '#2563eb' : '#94a3b8'} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: isOver ? '#2563eb' : '#94a3b8',
                marginTop: '4px',
              }}
            >
              Drop content here
            </span>
          </div>
        )}
      </SortableContext>
    </div>
  );
};
