import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { EmailEditorAdapter } from '../../email-templates/builder/adapters/EmailEditorAdapter';
import type { PreviewDevice } from '../../email-templates/types/template.types';
import { CustomEditorAdapter } from '../adapters/CustomEditorAdapter';
import { useDocumentStore } from '../store/documentStore';
import type { BlockType, EmailBlock, EmailDocument } from '../types/document.types';
import { createDefaultDocument } from '../utils/blockDefaults';
import { Canvas } from './layout/Canvas';
import { BlocksPanel } from './layout/BlocksPanel';
import { LayersPanel } from './layout/LayersPanel';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { migrateUnlayerDesign } from '../renderer/migrationLayer';

interface CustomBuilderCanvasProps {
  mjml?: string;
  html?: string;
  name: string;
  project?: unknown;
  device?: PreviewDevice;
  canvasWidth?: number;
  activeTab?: 'blocks' | 'layers';
  onReady: (adapter: EmailEditorAdapter) => void;
  onChange: () => void;
  onSelect: (component: unknown) => void;
  onRequestImageUpload?: (done: (data: { url: string }) => void, file?: File) => void;
}

const collisionDetectionStrategy = (args: any) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions && pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return closestCenter(args);
};

export const CustomBuilderCanvas: React.FC<CustomBuilderCanvasProps> = ({
  name,
  project,
  device,
  canvasWidth,
  activeTab = 'blocks',
  onReady,
  onChange,
  onSelect,
  onRequestImageUpload,
}) => {
  const adapterRef = useRef<CustomEditorAdapter | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<{
    type: 'sidebar-block' | 'canvas-block' | 'canvas-row';
    blockType?: BlockType;
    block?: EmailBlock;
    rowId?: string;
  } | null>(null);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  // 1. Initialize Document state on mount or when project changes
  useEffect(() => {
    const adapter = new CustomEditorAdapter();
    adapterRef.current = adapter;

    if (project && typeof project === 'object' && 'schemaVersion' in project && (project as any).rows) {
      useDocumentStore.getState().setDocument(project as EmailDocument);
    } else if (project && typeof project === 'object' && Object.keys(project).length > 0) {
      useDocumentStore.getState().setDocument(migrateUnlayerDesign(project));
    } else {
      useDocumentStore.getState().setDocument(createDefaultDocument(name));
    }

    onReady(adapter);

    const unsubscribe = useDocumentStore.subscribe((state, prevState) => {
      if (state.document !== prevState.document) {
        onChange();
      }
      if (
        state.selectedBlockId !== prevState.selectedBlockId ||
        state.selectedRowId !== prevState.selectedRowId
      ) {
        onSelect(adapter.getSelectedComponent());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Handle device or canvasWidth prop changes
  useEffect(() => {
    if (device) {
      useDocumentStore.getState().setDevice(device);
    }
  }, [device]);

  useEffect(() => {
    if (canvasWidth) {
      useDocumentStore.getState().updateBodySettings({ contentWidth: canvasWidth });
    }
  }, [canvasWidth]);

  // 3. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditingText =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable ||
          activeEl.classList.contains('ProseMirror'));

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const state = useDocumentStore.getState();

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            state.redo();
          } else {
            state.undo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          state.redo();
        } else if (key === 'c' && !isEditingText) {
          e.preventDefault();
          if (state.selectedBlockId) {
            state.copyBlock(state.selectedBlockId);
          } else if (state.selectedRowId) {
            state.copyRow(state.selectedRowId);
          }
        } else if (key === 'v' && !isEditingText) {
          e.preventDefault();
          if (state.clipboard?.type === 'block') {
            state.pasteBlock();
          } else if (state.clipboard?.type === 'row') {
            state.pasteRow();
          }
        } else if (key === 'd' && !isEditingText) {
          e.preventDefault();
          if (state.selectedBlockId) {
            state.duplicateBlock(state.selectedBlockId);
          } else if (state.selectedRowId) {
            state.duplicateRow(state.selectedRowId);
          }
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
        if (state.selectedBlockId) {
          e.preventDefault();
          state.deleteBlock(state.selectedBlockId);
        } else if (state.selectedRowId) {
          e.preventDefault();
          state.deleteRow(state.selectedRowId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as any;

    if (data?.type === 'sidebar-block') {
      setActiveDragItem({ type: 'sidebar-block', blockType: data.blockType });
    } else if (data?.type === 'canvas-block' || data?.type === 'block') {
      setActiveDragItem({ type: 'canvas-block', block: data.block });
    } else if (data?.type === 'canvas-row') {
      setActiveDragItem({ type: 'canvas-row', rowId: active.id as string });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeData = active.data.current as any;
    const overData = over.data.current as any;
    const state = useDocumentStore.getState();

    const isSidebarSource = activeData?.source === 'sidebar' || activeData?.type === 'sidebar-block';

    // 1. Sidebar block dropped onto empty canvas
    if (isSidebarSource && overData?.type === 'empty-canvas') {
      const blockType: BlockType = activeData.blockType;
      const newBlockId = state.addBlock(blockType);
      state.selectBlock(newBlockId);
      return;
    }

    // 2. Sidebar block dropped onto a column
    if (isSidebarSource && overData?.type === 'column') {
      const blockType: BlockType = activeData.blockType;
      const newBlockId = state.addBlock(blockType, overData.columnId);
      state.selectBlock(newBlockId);
      return;
    }

    // 3. Sidebar block dropped onto a dropzone
    if (isSidebarSource && overData?.type === 'dropzone') {
      const blockType: BlockType = activeData.blockType;
      const newBlockId = state.addBlock(blockType, overData.columnId, overData.index);
      state.selectBlock(newBlockId);
      return;
    }

    // 4. Sidebar block dropped onto an existing canvas block
    if (isSidebarSource && (overData?.type === 'block' || overData?.type === 'canvas-block')) {
      const blockType: BlockType = activeData.blockType;
      const targetColumnId = overData.columnId;
      let targetIndex = overData.index !== undefined ? overData.index : 0;
      for (const r of state.document.rows) {
        for (const c of r.columns) {
          if (c.id === targetColumnId) {
            const idx = c.blocks.findIndex((b) => b.id === over.id);
            if (idx !== -1) targetIndex = idx + 1;
            break;
          }
        }
      }
      const newBlockId = state.addBlock(blockType, targetColumnId, targetIndex);
      state.selectBlock(newBlockId);
      return;
    }

    // 5. Canvas block reordering or moving across columns/rows
    if (activeData?.type === 'canvas-block' || activeData?.type === 'block') {
      const activeBlockId = active.id as string;
      const sourceColumnId = activeData.columnId;

      if (overData?.type === 'dropzone') {
        state.moveBlock(activeBlockId, overData.columnId, overData.index);
        state.selectBlock(activeBlockId);
      } else if (overData?.type === 'column') {
        if (sourceColumnId !== overData.columnId) {
          state.moveBlock(activeBlockId, overData.columnId, 0);
          state.selectBlock(activeBlockId);
        }
      } else if (overData?.type === 'block' || overData?.type === 'canvas-block') {
        const targetColumnId = overData.columnId;
        const overBlockId = over.id as string;

        if (sourceColumnId === targetColumnId) {
          for (const r of state.document.rows) {
            for (const c of r.columns) {
              if (c.id === sourceColumnId) {
                const oldIndex = c.blocks.findIndex((b) => b.id === activeBlockId);
                const newIndex = c.blocks.findIndex((b) => b.id === overBlockId);
                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                  const newBlockIds = c.blocks.map((b) => b.id);
                  newBlockIds.splice(oldIndex, 1);
                  newBlockIds.splice(newIndex, 0, activeBlockId);
                  state.reorderBlocks(sourceColumnId, newBlockIds);
                  state.selectBlock(activeBlockId);
                }
                break;
              }
            }
          }
        } else {
          let targetIndex = 0;
          for (const r of state.document.rows) {
            for (const c of r.columns) {
              if (c.id === targetColumnId) {
                targetIndex = c.blocks.findIndex((b) => b.id === overBlockId);
                if (targetIndex === -1) targetIndex = 0;
                break;
              }
            }
          }
          state.moveBlock(activeBlockId, targetColumnId, targetIndex);
          state.selectBlock(activeBlockId);
        }
      }
      return;
    }

    // 6. Row reordering
    if (activeData?.type === 'canvas-row' && overData?.type === 'canvas-row') {
      const rows = state.document.rows;
      const rowIds = rows.map((r) => r.id);
      const oldIndex = rowIds.indexOf(active.id as string);
      const newIndex = rowIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newRowIds = [...rowIds];
        newRowIds.splice(oldIndex, 1);
        newRowIds.splice(newIndex, 0, active.id as string);
        state.reorderRows(newRowIds);
        state.selectRow(active.id as string);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={collisionDetectionStrategy} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="custom-builder-canvas-shell"
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {activeTab === 'layers' ? <LayersPanel /> : <BlocksPanel />}
        <Canvas />
        <PropertiesPanel
          onRequestImagePicker={() => {
            if (onRequestImageUpload) {
              onRequestImageUpload(({ url }) => {
                const state = useDocumentStore.getState();
                if (state.selectedBlockId) {
                  state.updateBlock(state.selectedBlockId, { content: { src: url } });
                }
              });
            }
          }}
        />

        <DragOverlay>
          {activeDragItem?.type === 'sidebar-block' && activeDragItem.blockType && (
            <div
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                cursor: 'grabbing',
              }}
            >
              + Add {activeDragItem.blockType.toUpperCase()}
            </div>
          )}
          {activeDragItem?.type === 'canvas-block' && activeDragItem.block && (
            <div
              style={{
                padding: '8px 16px',
                background: '#ffffff',
                border: '2px solid #2563eb',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
              }}
            >
              Moving {activeDragItem.block.type.toUpperCase()}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
