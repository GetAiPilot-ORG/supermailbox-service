import { useDocumentStore } from './documentStore';
import type { EmailBlock, EmailColumn, EmailRow } from '../types/document.types';

export function useBuilderDocument() {
  return useDocumentStore((state) => state.document);
}

export function useBuilderSelection() {
  const selectedRowId = useDocumentStore((state) => state.selectedRowId);
  const selectedColumnId = useDocumentStore((state) => state.selectedColumnId);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);
  const selectRow = useDocumentStore((state) => state.selectRow);
  const selectColumn = useDocumentStore((state) => state.selectColumn);
  const selectBlock = useDocumentStore((state) => state.selectBlock);
  const clearSelection = useDocumentStore((state) => state.clearSelection);

  return {
    selectedRowId,
    selectedColumnId,
    selectedBlockId,
    selectRow,
    selectColumn,
    selectBlock,
    clearSelection,
  };
}

export function useSelectedBlock(): EmailBlock | null {
  const document = useDocumentStore((state) => state.document);
  const selectedBlockId = useDocumentStore((state) => state.selectedBlockId);

  if (!selectedBlockId) return null;

  for (const row of document.rows) {
    for (const col of row.columns) {
      const found = col.blocks.find((b) => b.id === selectedBlockId);
      if (found) return found;
    }
  }

  return null;
}

export function useSelectedRow(): EmailRow | null {
  const document = useDocumentStore((state) => state.document);
  const selectedRowId = useDocumentStore((state) => state.selectedRowId);

  if (!selectedRowId) return null;
  return document.rows.find((r) => r.id === selectedRowId) || null;
}

export function useSelectedColumn(): EmailColumn | null {
  const document = useDocumentStore((state) => state.document);
  const selectedColumnId = useDocumentStore((state) => state.selectedColumnId);

  if (!selectedColumnId) return null;

  for (const row of document.rows) {
    const found = row.columns.find((c) => c.id === selectedColumnId);
    if (found) return found;
  }

  return null;
}

export function useBuilderHistory() {
  const canUndo = useDocumentStore((state) => state.history.length > 0);
  const canRedo = useDocumentStore((state) => state.future.length > 0);
  const undo = useDocumentStore((state) => state.undo);
  const redo = useDocumentStore((state) => state.redo);

  return { canUndo, canRedo, undo, redo };
}

export function useBuilderDevice() {
  const activeDevice = useDocumentStore((state) => state.activeDevice);
  const setDevice = useDocumentStore((state) => state.setDevice);

  return { activeDevice, setDevice };
}
