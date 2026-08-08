import { create } from 'zustand';
import type {
  BlockType,
  DragState,
  EmailBlock,
  EmailColumn,
  EmailDocument,
  EmailRow,
  PreviewDevice,
  RowLayoutPreset,
} from '../types/document.types';
import {
  createBlock,
  createDefaultDocument,
  createRowFromPreset,
  createUniqueId,
  getPresetColumnWidths,
} from '../utils/blockDefaults';

const MAX_HISTORY = 50;

export interface BuilderState {
  document: EmailDocument;
  selectedRowId: string | null;
  selectedColumnId: string | null;
  selectedBlockId: string | null;
  activeDevice: PreviewDevice;
  history: EmailDocument[];
  future: EmailDocument[];
  clipboard: { type: 'row' | 'block'; data: any } | null;
  dragState: DragState;
  zoom: number;

  // Actions
  setDocument: (doc: EmailDocument) => void;
  selectRow: (rowId: string | null) => void;
  selectColumn: (columnId: string | null) => void;
  selectBlock: (blockId: string | null) => void;
  clearSelection: () => void;

  // Row operations
  addRow: (preset?: RowLayoutPreset, targetIndex?: number) => string;
  updateRow: (rowId: string, patch: Partial<EmailRow['settings']> | { name?: string }) => void;
  deleteRow: (rowId: string) => void;
  duplicateRow: (rowId: string) => void;
  moveRow: (rowId: string, direction: 'up' | 'down') => void;
  reorderRows: (newRowIds: string[]) => void;

  // Block operations
  addBlock: (type: BlockType, targetColumnId?: string, targetIndex?: number) => string;
  updateBlock: (
    blockId: string,
    patch: {
      content?: Record<string, any>;
      style?: Record<string, any>;
      mobileStyle?: Record<string, any>;
      tabletStyle?: Record<string, any>;
      visibility?: Record<string, any>;
    }
  ) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetColumnId: string, targetIndex: number) => void;
  reorderBlocks: (columnId: string, newBlockIds: string[]) => void;

  // Column operations
  updateColumn: (columnId: string, settings: Partial<EmailColumn['settings']>) => void;
  resizeColumn: (rowId: string, newWidths: number[]) => void;

  // Clipboard & Presets
  copyBlock: (blockId: string) => void;
  copyRow: (rowId: string) => void;
  pasteBlock: (targetColumnId?: string) => void;
  pasteRow: (targetRowIndex?: number) => void;
  insertSection: (rows: EmailRow[], targetIndex?: number) => void;
  updateMetadata: (patch: Partial<EmailDocument['metadata']>) => void;
  updateBodySettings: (patch: Partial<EmailDocument['bodySettings']>) => void;
  updateDesignTokens: (patch: Partial<NonNullable<EmailDocument['designTokens']>>) => void;
  setDevice: (device: PreviewDevice) => void;
  setZoom: (zoom: number) => void;
  setDragState: (dragState: Partial<DragState>) => void;

  // History
  undo: () => void;
  redo: () => void;
}

// Helper to push history
function recordHistory(state: BuilderState): { history: EmailDocument[]; future: EmailDocument[] } {
  const newHistory = [...state.history, JSON.parse(JSON.stringify(state.document))];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return { history: newHistory, future: [] };
}

export const useDocumentStore = create<BuilderState>((set, get) => ({
  document: createDefaultDocument(),
  selectedRowId: null,
  selectedColumnId: null,
  selectedBlockId: null,
  activeDevice: 'desktop',
  history: [],
  future: [],
  clipboard: null,
  dragState: {
    isDragging: false,
    activeId: null,
    activeType: null,
    draggedBlockType: null,
    sourceColumnId: null,
    sourceRowId: null,
  },
  zoom: 1,

  setDocument: (doc) => {
    const validDoc: EmailDocument = {
      schemaVersion: 2,
      metadata: doc?.metadata || { subject: '', preheader: '', language: 'en', direction: 'ltr' },
      bodySettings: doc?.bodySettings || {
        backgroundColor: '#f1f5f9',
        contentBackgroundColor: '#ffffff',
        contentWidth: 600,
        defaultFontFamily: 'Arial, Helvetica, sans-serif',
        defaultFontSize: '14px',
        textColor: '#334155',
        linkColor: '#2563eb',
        globalPadding: '20px 0px',
        mobileBreakpoint: 480,
      },
      designTokens: doc?.designTokens || {},
      rows: Array.isArray(doc?.rows) ? doc.rows : [],
    };

    set({
      document: validDoc,
      selectedRowId: null,
      selectedColumnId: null,
      selectedBlockId: null,
      history: [],
      future: [],
    });
  },

  selectRow: (rowId) => {
    set({
      selectedRowId: rowId,
      selectedColumnId: null,
      selectedBlockId: null,
    });
  },

  selectColumn: (columnId) => {
    let parentRowId: string | null = null;
    if (columnId) {
      for (const r of get().document.rows) {
        if (r.columns.some((c) => c.id === columnId)) {
          parentRowId = r.id;
          break;
        }
      }
    }
    set({
      selectedRowId: parentRowId,
      selectedColumnId: columnId,
      selectedBlockId: null,
    });
  },

  selectBlock: (blockId) => {
    let parentRowId: string | null = null;
    let parentColumnId: string | null = null;
    if (blockId) {
      for (const r of get().document.rows) {
        for (const c of r.columns) {
          if (c.blocks.some((b) => b.id === blockId)) {
            parentRowId = r.id;
            parentColumnId = c.id;
            break;
          }
        }
        if (parentRowId) break;
      }
    }
    set({
      selectedRowId: parentRowId,
      selectedColumnId: parentColumnId,
      selectedBlockId: blockId,
    });
  },

  clearSelection: () => {
    set({
      selectedRowId: null,
      selectedColumnId: null,
      selectedBlockId: null,
    });
  },

  // ---------------------------------------------------------------------------
  // ROW ACTIONS
  // ---------------------------------------------------------------------------

  addRow: (preset = '1-col', targetIndex) => {
    const currentState = get();
    const newRow = createRowFromPreset(preset);
    const rows = [...currentState.document.rows];

    const idx = targetIndex !== undefined ? targetIndex : rows.length;
    rows.splice(idx, 0, newRow);

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedRowId: newRow.id,
      selectedColumnId: null,
      selectedBlockId: null,
      ...historyUpdate,
    });

    return newRow.id;
  },

  updateRow: (rowId, patch) => {
    const currentState = get();
    const rows = currentState.document.rows.map((row) => {
      if (row.id !== rowId) return row;
      const { name, ...settingsPatch } = patch as any;
      return {
        ...row,
        name: name !== undefined ? name : row.name,
        settings: {
          ...row.settings,
          ...settingsPatch,
        },
      };
    });

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  deleteRow: (rowId) => {
    const currentState = get();
    const rows = currentState.document.rows.filter((r) => r.id !== rowId);
    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedRowId: currentState.selectedRowId === rowId ? null : currentState.selectedRowId,
      selectedColumnId: null,
      selectedBlockId: null,
      ...historyUpdate,
    });
  },

  duplicateRow: (rowId) => {
    const currentState = get();
    const idx = currentState.document.rows.findIndex((r) => r.id === rowId);
    if (idx === -1) return;

    const sourceRow = currentState.document.rows[idx];
    const clonedRowId = createUniqueId('row');

    const clonedRow: EmailRow = {
      ...JSON.parse(JSON.stringify(sourceRow)),
      id: clonedRowId,
      name: `${sourceRow.name || 'Row'} (Copy)`,
      columns: sourceRow.columns.map((col, cIdx) => ({
        ...JSON.parse(JSON.stringify(col)),
        id: `${clonedRowId}-col-${cIdx + 1}`,
        blocks: col.blocks.map((blk) => ({
          ...JSON.parse(JSON.stringify(blk)),
          id: createUniqueId(`block-${blk.type}`),
        })),
      })),
    };

    const rows = [...currentState.document.rows];
    rows.splice(idx + 1, 0, clonedRow);

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedRowId: clonedRowId,
      selectedColumnId: null,
      selectedBlockId: null,
      ...historyUpdate,
    });
  },

  moveRow: (rowId, direction) => {
    const currentState = get();
    const idx = currentState.document.rows.findIndex((r) => r.id === rowId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === currentState.document.rows.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const rows = [...currentState.document.rows];
    const [moved] = rows.splice(idx, 1);
    rows.splice(targetIdx, 0, moved);

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  reorderRows: (newRowIds) => {
    const currentState = get();
    const rowMap = new Map(currentState.document.rows.map((r) => [r.id, r]));
    const reordered: EmailRow[] = [];

    newRowIds.forEach((id) => {
      const found = rowMap.get(id);
      if (found) reordered.push(found);
    });

    // append any missing rows
    currentState.document.rows.forEach((r) => {
      if (!newRowIds.includes(r.id)) reordered.push(r);
    });

    const newDoc = { ...currentState.document, rows: reordered };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  // ---------------------------------------------------------------------------
  // BLOCK ACTIONS
  // ---------------------------------------------------------------------------

  addBlock: (type, targetColumnId, targetIndex) => {
    const currentState = get();
    const newBlock = createBlock(type);

    let columnFound = false;
    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        const isTarget = targetColumnId
          ? col.id === targetColumnId
          : !columnFound; // default to first column if not specified

        if (isTarget && !columnFound) {
          columnFound = true;
          const blocks = [...col.blocks];
          const idx = targetIndex !== undefined ? targetIndex : blocks.length;
          blocks.splice(idx, 0, newBlock);
          return { ...col, blocks };
        }
        return col;
      }),
    }));

    // If document is empty and no column found, create a 1-col row
    if (!columnFound) {
      const newRow = createRowFromPreset('1-col');
      newRow.columns[0].blocks.push(newBlock);
      rows.push(newRow);
    }

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedBlockId: newBlock.id,
      ...historyUpdate,
    });

    return newBlock.id;
  },

  updateBlock: (blockId, patch) => {
    const currentState = get();
    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => ({
        ...col,
        blocks: col.blocks.map((blk) => {
          if (blk.id !== blockId) return blk;
          return {
            ...blk,
            content: patch.content !== undefined ? { ...blk.content, ...patch.content } : blk.content,
            style: patch.style !== undefined ? { ...blk.style, ...patch.style } : blk.style,
            mobileStyle: patch.mobileStyle !== undefined ? { ...blk.mobileStyle, ...patch.mobileStyle } : blk.mobileStyle,
            tabletStyle: patch.tabletStyle !== undefined ? { ...blk.tabletStyle, ...patch.tabletStyle } : blk.tabletStyle,
            visibility: patch.visibility !== undefined ? { ...blk.visibility, ...patch.visibility } : blk.visibility,
          };
        }),
      })),
    }));

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  deleteBlock: (blockId) => {
    const currentState = get();
    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => ({
        ...col,
        blocks: col.blocks.filter((b) => b.id !== blockId),
      })),
    }));

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedBlockId: currentState.selectedBlockId === blockId ? null : currentState.selectedBlockId,
      ...historyUpdate,
    });
  },

  duplicateBlock: (blockId) => {
    const currentState = get();
    let clonedId = '';

    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        const idx = col.blocks.findIndex((b) => b.id === blockId);
        if (idx === -1) return col;

        const source = col.blocks[idx];
        clonedId = createUniqueId(`block-${source.type}`);
        const clonedBlock: EmailBlock = {
          ...JSON.parse(JSON.stringify(source)),
          id: clonedId,
        };

        const blocks = [...col.blocks];
        blocks.splice(idx + 1, 0, clonedBlock);
        return { ...col, blocks };
      }),
    }));

    if (!clonedId) return;

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedBlockId: clonedId,
      ...historyUpdate,
    });
  },

  moveBlock: (blockId, targetColumnId, targetIndex) => {
    const currentState = get();
    let targetBlock: EmailBlock | null = null;

    // 1. Remove block from current location
    const rowsWithoutBlock = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        const found = col.blocks.find((b) => b.id === blockId);
        if (found) targetBlock = found;
        return {
          ...col,
          blocks: col.blocks.filter((b) => b.id !== blockId),
        };
      }),
    }));

    if (!targetBlock) return;
    const blockToInsert = targetBlock;

    // 2. Insert into target column at index
    const updatedRows = rowsWithoutBlock.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        if (col.id !== targetColumnId) return col;
        const blocks = [...col.blocks];
        const idx = Math.min(Math.max(0, targetIndex), blocks.length);
        blocks.splice(idx, 0, blockToInsert);
        return { ...col, blocks };
      }),
    }));

    const newDoc = { ...currentState.document, rows: updatedRows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedColumnId: targetColumnId,
      selectedBlockId: blockId,
      ...historyUpdate,
    });
  },

  reorderBlocks: (columnId, newBlockIds) => {
    const currentState = get();
    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        if (col.id !== columnId) return col;
        const map = new Map(col.blocks.map((b) => [b.id, b]));
        const reordered: EmailBlock[] = [];
        newBlockIds.forEach((id) => {
          const b = map.get(id);
          if (b) reordered.push(b);
        });
        col.blocks.forEach((b) => {
          if (!newBlockIds.includes(b.id)) reordered.push(b);
        });
        return { ...col, blocks: reordered };
      }),
    }));

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  // ---------------------------------------------------------------------------
  // COLUMN ACTIONS
  // ---------------------------------------------------------------------------

  updateColumn: (columnId, settings) => {
    const currentState = get();
    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          settings: { ...col.settings, ...settings },
        };
      }),
    }));

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  resizeColumn: (rowId, newWidths) => {
    const currentState = get();
    const rows = currentState.document.rows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        columns: row.columns.map((col, idx) => ({
          ...col,
          width: newWidths[idx] !== undefined ? newWidths[idx] : col.width,
        })),
      };
    });

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  // ---------------------------------------------------------------------------
  // CLIPBOARD & SECTION INSERTION
  // ---------------------------------------------------------------------------

  copyBlock: (blockId) => {
    const currentState = get();
    for (const row of currentState.document.rows) {
      for (const col of row.columns) {
        const found = col.blocks.find((b) => b.id === blockId);
        if (found) {
          set({ clipboard: { type: 'block', data: JSON.parse(JSON.stringify(found)) } });
          return;
        }
      }
    }
  },

  copyRow: (rowId) => {
    const currentState = get();
    const found = currentState.document.rows.find((r) => r.id === rowId);
    if (found) {
      set({ clipboard: { type: 'row', data: JSON.parse(JSON.stringify(found)) } });
    }
  },

  pasteBlock: (targetColumnId) => {
    const currentState = get();
    if (!currentState.clipboard || currentState.clipboard.type !== 'block') return;

    const source = currentState.clipboard.data as EmailBlock;
    const clonedId = createUniqueId(`block-${source.type}`);
    const clonedBlock: EmailBlock = {
      ...JSON.parse(JSON.stringify(source)),
      id: clonedId,
    };

    let targetColId = targetColumnId || currentState.selectedColumnId;
    if (!targetColId && currentState.document.rows.length > 0) {
      targetColId = currentState.document.rows[0].columns[0]?.id;
    }

    if (!targetColId) return;

    const rows = currentState.document.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => {
        if (col.id !== targetColId) return col;
        return { ...col, blocks: [...col.blocks, clonedBlock] };
      }),
    }));

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedBlockId: clonedId,
      ...historyUpdate,
    });
  },

  pasteRow: (targetRowIndex) => {
    const currentState = get();
    if (!currentState.clipboard || currentState.clipboard.type !== 'row') return;

    const source = currentState.clipboard.data as EmailRow;
    const clonedRowId = createUniqueId('row');

    const clonedRow: EmailRow = {
      ...JSON.parse(JSON.stringify(source)),
      id: clonedRowId,
      name: `${source.name || 'Row'} (Pasted)`,
      columns: source.columns.map((col, cIdx) => ({
        ...JSON.parse(JSON.stringify(col)),
        id: `${clonedRowId}-col-${cIdx + 1}`,
        blocks: col.blocks.map((blk) => ({
          ...JSON.parse(JSON.stringify(blk)),
          id: createUniqueId(`block-${blk.type}`),
        })),
      })),
    };

    const rows = [...currentState.document.rows];
    const idx = targetRowIndex !== undefined ? targetRowIndex : rows.length;
    rows.splice(idx, 0, clonedRow);

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedRowId: clonedRowId,
      ...historyUpdate,
    });
  },

  insertSection: (rowsToInsert, targetIndex) => {
    const currentState = get();
    const clonedRows: EmailRow[] = rowsToInsert.map((sourceRow) => {
      const clonedRowId = createUniqueId('row');
      return {
        ...JSON.parse(JSON.stringify(sourceRow)),
        id: clonedRowId,
        columns: sourceRow.columns.map((col, cIdx) => ({
          ...JSON.parse(JSON.stringify(col)),
          id: `${clonedRowId}-col-${cIdx + 1}`,
          blocks: col.blocks.map((blk) => ({
            ...JSON.parse(JSON.stringify(blk)),
            id: createUniqueId(`block-${blk.type}`),
          })),
        })),
      };
    });

    const rows = [...currentState.document.rows];
    const idx = targetIndex !== undefined ? targetIndex : rows.length;
    rows.splice(idx, 0, ...clonedRows);

    const newDoc = { ...currentState.document, rows };
    const historyUpdate = recordHistory(currentState);

    set({
      document: newDoc,
      selectedRowId: clonedRows[0]?.id || null,
      ...historyUpdate,
    });
  },

  // ---------------------------------------------------------------------------
  // GLOBAL SETTINGS / DEVICE
  // ---------------------------------------------------------------------------

  updateMetadata: (patch) => {
    const currentState = get();
    const newDoc = {
      ...currentState.document,
      metadata: { ...currentState.document.metadata, ...patch },
    };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  updateBodySettings: (patch) => {
    const currentState = get();
    const newDoc = {
      ...currentState.document,
      bodySettings: { ...currentState.document.bodySettings, ...patch },
    };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  updateDesignTokens: (patch) => {
    const currentState = get();
    const newDoc = {
      ...currentState.document,
      designTokens: { ...currentState.document.designTokens, ...patch },
    };
    const historyUpdate = recordHistory(currentState);
    set({ document: newDoc, ...historyUpdate });
  },

  setDevice: (device) => {
    set({ activeDevice: device });
  },

  setZoom: (zoom) => {
    set({ zoom });
  },

  setDragState: (dragStatePatch) => {
    set({
      dragState: {
        ...get().dragState,
        ...dragStatePatch,
      },
    });
  },

  // ---------------------------------------------------------------------------
  // HISTORY UNDO / REDO
  // ---------------------------------------------------------------------------

  undo: () => {
    const { history, future, document } = get();
    if (history.length === 0) return;

    const previousDoc = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    const newFuture = [JSON.parse(JSON.stringify(document)), ...future];

    set({
      document: previousDoc,
      history: newHistory,
      future: newFuture,
    });
  },

  redo: () => {
    const { history, future, document } = get();
    if (future.length === 0) return;

    const nextDoc = future[0];
    const newFuture = future.slice(1);
    const newHistory = [...history, JSON.parse(JSON.stringify(document))];

    set({
      document: nextDoc,
      history: newHistory,
      future: newFuture,
    });
  },
}));
