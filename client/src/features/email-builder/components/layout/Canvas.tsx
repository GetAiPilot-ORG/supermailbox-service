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

  const isMobile = activeDevice === 'mobile';
  const isTablet = activeDevice === 'tablet';

  // Calculate viewport width based on active device
  const getCanvasWidth = () => {
    if (isMobile) return '375px';
    if (isTablet) return '480px';
    return `${document?.bodySettings?.contentWidth || 600}px`;
  };

  const canvasWidth = getCanvasWidth();
  const numericContentWidth = isMobile ? 375 : isTablet ? 480 : (document?.bodySettings?.contentWidth || 600);

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        minHeight: 0,
        backgroundColor: document?.bodySettings?.backgroundColor || '#ffffff',
        overflowY: 'auto',
        padding: isMobile ? '20px 0px 40px 0px' : '32px 0px 80px 0px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={clearSelection}
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
              maxWidth: canvasWidth,
              background: isOverEmptyCanvas ? '#eff6ff' : isBodyContentGradient ? bodyContentBg : undefined,
              backgroundColor: isOverEmptyCanvas ? '#eff6ff' : !isBodyContentGradient ? bodyContentBg : undefined,
              boxShadow: 'none',
              minHeight: '400px',
              borderRadius: '0px',
              position: 'relative',
              boxSizing: 'border-box',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'max-width 0.2s ease, transform 0.2s ease',
              border: isOverEmptyCanvas ? '2px dashed #2563eb' : isMobile ? '1px solid #e2e8f0' : 'none',
              overflow: 'hidden',
              flexShrink: 0,
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
                    contentWidth={numericContentWidth}
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
        <div style={{ marginTop: '24px', marginBottom: '40px', flexShrink: 0, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowRowPicker(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
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
