import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useDocumentStore } from '../../store/documentStore';
import { useBuilderDocument } from '../../store/useBuilderStore';
import { RowRenderer } from './RowRenderer';
import { RowLayoutPicker } from './RowLayoutPicker';

export const Canvas: React.FC = () => {
  const document = useBuilderDocument();
  const clearSelection = useDocumentStore((state) => state.clearSelection);
  const addRow = useDocumentStore((state) => state.addRow);
  const activeDevice = useDocumentStore((state) => state.activeDevice);
  const zoom = useDocumentStore((state) => state.zoom);

  const [showRowPicker, setShowRowPicker] = useState(false);

  const { setNodeRef: setEmptyCanvasRef, isOver: isOverEmptyCanvas } = useDroppable({
    id: 'email-empty-canvas',
    data: {
      type: 'empty-canvas',
    },
  });

  const rows = Array.isArray(document?.rows) ? document.rows : [];
  const rowIds = rows.map((r) => r.id);

  // Calculate viewport width based on active device
  const getCanvasWidth = () => {
    if (activeDevice === 'mobile') return 360;
    if (activeDevice === 'tablet') return 480;
    return document?.bodySettings?.contentWidth || 600;
  };

  const canvasWidth = getCanvasWidth();

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: document?.bodySettings?.backgroundColor || '#f1f5f9',
        overflowY: 'auto',
        padding: document?.bodySettings?.globalPadding || '30px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={clearSelection}
    >
      {/* Email Body Container */}
      <div
        ref={rows.length === 0 ? setEmptyCanvasRef : undefined}
        style={{
          width: '100%',
          maxWidth: `${canvasWidth}px`,
          backgroundColor: isOverEmptyCanvas ? '#eff6ff' : document?.bodySettings?.contentBackgroundColor || '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          minHeight: '400px',
          borderRadius: '4px',
          position: 'relative',
          boxSizing: 'border-box',
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'max-width 0.2s ease, transform 0.2s ease',
          border: isOverEmptyCanvas ? '2px dashed #2563eb' : 'none',
        }}
      >
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <RowRenderer
                key={row.id}
                row={row}
                index={idx}
                totalRows={rows.length}
                contentWidth={canvasWidth}
              />
            ))
          ) : (
            /* Empty Document State */
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: isOverEmptyCanvas ? '#2563eb' : '#334155', pointerEvents: 'none' }}>
                {isOverEmptyCanvas ? 'Drop Block Here to Create Row' : 'Your Email Canvas is Empty'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '360px', pointerEvents: 'none' }}>
                Drag blocks from the left sidebar or click below to insert a new layout row.
              </p>
              <button
                type="button"
                onClick={() => setShowRowPicker(true)}
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                <Plus size={16} /> Add First Row
              </button>
            </div>
          )}
        </SortableContext>
      </div>

      {/* Add Row Button at bottom */}
      {rows.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowRowPicker(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#2563eb',
              border: '1px border #bfdbfe',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Plus size={16} /> Add Row
          </button>
        </div>
      )}

      <RowLayoutPicker
        isOpen={showRowPicker}
        onClose={() => setShowRowPicker(false)}
        onSelectLayout={(preset) => addRow(preset)}
      />
    </div>
  );
};
