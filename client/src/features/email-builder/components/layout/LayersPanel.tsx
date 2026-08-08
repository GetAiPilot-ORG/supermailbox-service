import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Layers,
  LayoutGrid,
  Square,
  Trash2,
} from 'lucide-react';
import { useDocumentStore } from '../../store/documentStore';
import { useBuilderDocument } from '../../store/useBuilderStore';

export const LayersPanel: React.FC = () => {
  const document = useBuilderDocument();
  const selectedRowId = useDocumentStore((state) => state.selectedRowId);
  const selectedColumnId = useDocumentStore((state) => state.selectedColumnId);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);
  const selectRow = useDocumentStore((state) => state.selectRow);
  const selectColumn = useDocumentStore((state) => state.selectColumn);
  const selectBlock = useDocumentStore((state) => state.selectBlock);
  const duplicateRow = useDocumentStore((state) => state.duplicateRow);
  const deleteRow = useDocumentStore((state) => state.deleteRow);
  const duplicateBlock = useDocumentStore((state) => state.duplicateBlock);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);
  const updateRow = useDocumentStore((state) => state.updateRow);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  return (
    <aside
      style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} /> Layers Tree
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
          Document structure and hierarchy
        </p>
      </div>

      {/* Tree Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {(() => {
          const rows = Array.isArray(document?.rows) ? document.rows : [];
          if (rows.length === 0) {
            return (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No rows in document
              </div>
            );
          }

          return rows.map((row, rIdx) => {
            const isRowSelected = selectedRowId === row.id;
            const isExpanded = expandedRows[row.id] ?? true;

            return (
              <div key={row.id} style={{ marginBottom: '6px' }}>
                {/* Row Item */}
                <div
                  onClick={() => selectRow(row.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: isRowSelected ? '#eff6ff' : '#f8fafc',
                    border: isRowSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpanded(row.id);
                      }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      {isExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
                    </button>
                    <Square size={14} color="#2563eb" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {row.name || `Row ${rIdx + 1}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateRow(row.id);
                      }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                      title="Duplicate row"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(row.id);
                      }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                      title="Delete row"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Columns & Blocks Tree */}
                {isExpanded && (
                  <div style={{ paddingLeft: '16px', marginTop: '4px' }}>
                    {row.columns.map((col, cIdx) => {
                      const isColSelected = selectedColumnId === col.id;

                      return (
                        <div key={col.id} style={{ marginBottom: '4px' }}>
                          <div
                            onClick={() => selectColumn(col.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              background: isColSelected ? '#f1f5f9' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: '#475569',
                              fontWeight: 500,
                            }}
                          >
                            <LayoutGrid size={12} color="#64748b" />
                            <span>Column {cIdx + 1} ({Math.round(col.width)}%)</span>
                          </div>

                          {/* Blocks inside Column */}
                          <div style={{ paddingLeft: '14px' }}>
                            {col.blocks.map((blk) => {
                              const isBlkSelected = selectedBlockId === blk.id;

                              return (
                                <div
                                  key={blk.id}
                                  onClick={() => selectBlock(blk.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '3px 6px',
                                    borderRadius: '4px',
                                    background: isBlkSelected ? '#2563eb' : 'transparent',
                                    color: isBlkSelected ? '#ffffff' : '#475569',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    margin: '2px 0',
                                  }}
                                >
                                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                                    • {blk.type}
                                  </span>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateBlock(blk.id);
                                      }}
                                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: isBlkSelected ? '#fff' : '#64748b' }}
                                      title="Duplicate block"
                                    >
                                      <Copy size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteBlock(blk.id);
                                      }}
                                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: isBlkSelected ? '#ffaaaa' : '#ef4444' }}
                                      title="Delete block"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </aside>
  );
};
