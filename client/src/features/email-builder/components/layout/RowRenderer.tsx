import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { EmailRow, RowLayoutPreset } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { ColumnRenderer } from './ColumnRenderer';
import { RowLayoutPicker } from './RowLayoutPicker';

interface RowRendererProps {
  row: EmailRow;
  index: number;
  totalRows: number;
  contentWidth: number;
}

export const RowRenderer: React.FC<RowRendererProps> = ({ row, index, totalRows, contentWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const selectedRowId = useDocumentStore((state) => state.selectedRowId);
  const selectRow = useDocumentStore((state) => state.selectRow);
  const duplicateRow = useDocumentStore((state) => state.duplicateRow);
  const deleteRow = useDocumentStore((state) => state.deleteRow);
  const moveRow = useDocumentStore((state) => state.moveRow);
  const addRow = useDocumentStore((state) => state.addRow);

  const isSelected = selectedRowId === row.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      type: 'canvas-row',
      row,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    backgroundColor: row.settings.backgroundColor || 'transparent',
    outline: isSelected
      ? '2px solid #2563eb'
      : isHovered
      ? '1px dashed #93c5fd'
      : 'none',
    outlineOffset: '-2px',
    margin: row.settings.margin || '0px',
  };

  const handleSelectPreset = (preset: RowLayoutPreset) => {
    addRow(preset, index + 1);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          selectRow(row.id);
        }}
      >
        {/* Row Hover / Selection Toolbar */}
        {(isSelected || isHovered) && (
          <div
            style={{
              position: 'absolute',
              top: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isSelected ? '#1e293b' : '#334155',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '6px 6px 0 0',
              fontSize: '11px',
              fontWeight: 600,
              zIndex: 50,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <span
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginRight: '4px' }}
              title="Drag to reorder row"
            >
              <GripVertical size={14} />
            </span>

            <span style={{ marginRight: '6px', opacity: 0.9 }}>{row.name || `Row ${index + 1}`}</span>

            {/* Move Up */}
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveRow(row.id, 'up')}
              title="Move Up"
              style={{
                background: 'transparent',
                border: 'none',
                color: index === 0 ? '#64748b' : '#ffffff',
                cursor: index === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <ChevronUp size={13} />
            </button>

            {/* Move Down */}
            <button
              type="button"
              disabled={index === totalRows - 1}
              onClick={() => moveRow(row.id, 'down')}
              title="Move Down"
              style={{
                background: 'transparent',
                border: 'none',
                color: index === totalRows - 1 ? '#64748b' : '#ffffff',
                cursor: index === totalRows - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <ChevronDown size={13} />
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => duplicateRow(row.id)}
              title="Duplicate Row"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                marginLeft: '4px',
              }}
            >
              <Copy size={13} />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => deleteRow(row.id)}
              title="Delete Row"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {/* Content Container (Center aligned) */}
        <div
          style={{
            maxWidth: `${contentWidth}px`,
            margin: '0 auto',
            backgroundColor: row.settings.contentBackgroundColor || 'transparent',
            padding: row.settings.padding || '10px 0px',
            borderRadius: row.settings.borderRadius || '0px',
            display: 'flex',
            flexDirection: row.settings.stackOnMobile ? 'row' : 'row',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            boxSizing: 'border-box',
          }}
        >
          {row.columns.map((column) => (
            <ColumnRenderer key={column.id} column={column} rowId={row.id} />
          ))}
        </div>

        {/* Add Row Below Button */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            >
              <Plus size={12} /> Add Row
            </button>
          </div>
        )}
      </div>

      <RowLayoutPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectLayout={handleSelectPreset}
      />
    </>
  );
};
