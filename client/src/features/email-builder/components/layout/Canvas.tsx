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
      className="email-builder-canvas-viewport"
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        backgroundColor: document?.bodySettings?.backgroundColor || '#f1f5f9',
        overflowY: 'auto',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
        position: 'relative',
      }}
      onClick={clearSelection}
    >
      <div
        style={{
          minHeight: '100%',
          width: 'max-content',
          minWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: document?.bodySettings?.globalPadding || '30px 16px',
          paddingBottom: '160px',
          boxSizing: 'border-box',
        }}
      >
        {/* Email Body Container */}
        {(() => {
          const bodyContentBg = document?.bodySettings?.contentBackgroundColor || '#ffffff';
          const isBodyContentGradient = bodyContentBg && (bodyContentBg.includes('gradient') || bodyContentBg.includes('url('));

          return (
            <div
              ref={rows.length === 0 ? setEmptyCanvasRef : undefined}
              style={{
                width: '100%',
                maxWidth: `${canvasWidth}px`,
                background: isOverEmptyCanvas ? '#eff6ff' : isBodyContentGradient ? bodyContentBg : undefined,
                backgroundColor: isOverEmptyCanvas ? '#eff6ff' : !isBodyContentGradient ? bodyContentBg : undefined,
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
                minHeight: '400px',
                borderRadius: '16px',
                position: 'relative',
                boxSizing: 'border-box',
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                border: isOverEmptyCanvas
                  ? '2px dashed #2563eb'
                  : (bodyContentBg && bodyContentBg !== '#ffffff' && bodyContentBg !== 'transparent'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid #e2e8f0'),
                overflow: 'hidden',
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#2563eb',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                      }}
                    >
                      <Plus size={14} /> Add First Row
                    </button>
                  </div>
                )}
              </SortableContext>
            </div>
          );
        })()}

        {/* Add Row Button at bottom */}
        {rows.length > 0 && (
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowRowPicker(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <Plus size={16} /> Add Row
            </button>
          </div>
        )}
      </div>

      <RowLayoutPicker
        isOpen={showRowPicker}
        onClose={() => setShowRowPicker(false)}
        onSelectLayout={(preset) => addRow(preset)}
      />
    </div>
  );
};
