import React, { useRef, useState } from 'react';
import {
  Heading1,
  Type,
  Image,
  MousePointerClick,
  Minus,
  Rows3,
  PanelBottom,
  Columns2,
  Link2,
  Code,
  GripVertical,
  Video,
  LayoutTemplate,
} from 'lucide-react';
import type { DesignRow } from './adapters/EmailEditorAdapter';

// ── Icon map keyed by label or contentType ──────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Heading:  Heading1,
  Text:     Type,
  Image:    Image,
  Button:   MousePointerClick,
  Divider:  Minus,
  Spacer:   Rows3,
  Hero:     PanelBottom,
  Features: Columns2,
  Footer:   Link2,
  HTML:     Code,
  Video:    Video,
  Block:    LayoutTemplate,
};

function BlockIcon({ label, contentType }: { label: string; contentType: string }) {
  const Icon = ICON_MAP[label] ?? ICON_MAP[contentType] ?? LayoutTemplate;
  return <Icon size={14} />;
}

type Props = {
  rows: DesignRow[];
  onReorder: (newIdOrder: string[]) => void;
  onSelect?: (rowId: string) => void;
  selectedRowId?: string | null;
};

export const BuilderLayersPanel: React.FC<Props> = ({ rows, onReorder, onSelect, selectedRowId }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragRowId = useRef<string | null>(null);
  // Track whether a drag started so click is not fired after a drag ends
  const didDrag = useRef(false);

  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    didDrag.current = true;
    dragRowId.current = id;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost — the original item shows selection style instead
    const ghost = document.createElement('div');
    ghost.style.position = 'fixed';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => document.body.removeChild(ghost));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      resetDrag();
      return;
    }
    const newOrder = [...rows.map((r) => r.id)];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, moved);
    onReorder(newOrder);
    resetDrag();
  };

  const handleDragEnd = () => {
    resetDrag();
    // Brief timeout so the click event (which fires after dragend) can check didDrag
    setTimeout(() => { didDrag.current = false; }, 50);
  };

  const handleClick = (id: string) => {
    if (didDrag.current) return; // ignore click fired right after a drag
    onSelect?.(id);
  };

  const resetDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
    dragRowId.current = null;
  };

  if (rows.length === 0) {
    return (
      <div className="builder-layers-empty">
        <LayoutTemplate size={24} strokeWidth={1.5} />
        <span>No blocks yet — add one from the panel above.</span>
      </div>
    );
  }

  return (
    <ul className="builder-layers-list" role="list" aria-label="Block layers">
      {rows.map((row, index) => {
        const isDragging = dragIndex === index;
        const isDropAbove = dropIndex === index && dragIndex !== null && dragIndex > index;
        const isDropBelow = dropIndex === index && dragIndex !== null && dragIndex < index;

        return (
          <li
            key={row.id}
            className={[
              'layer-item',
              isDragging ? 'layer-item--dragging' : '',
              isDropAbove ? 'layer-item--drop-above' : '',
              isDropBelow ? 'layer-item--drop-below' : '',
              selectedRowId === row.id ? 'layer-item--selected' : '',
            ].filter(Boolean).join(' ')}
            draggable
            onClick={() => handleClick(row.id)}
            onDragStart={(e) => handleDragStart(e, index, row.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            aria-grabbed={isDragging}
            aria-selected={selectedRowId === row.id}
            role="listitem"
          >
            <span className="layer-drag-handle" aria-hidden="true">
              <GripVertical size={13} />
            </span>
            <span className="layer-icon" aria-hidden="true">
              <BlockIcon label={row.label} contentType={row.contentType} />
            </span>
            <span className="layer-label">{row.label}</span>
            <span className="layer-index" aria-label={`Row ${index + 1}`}>{index + 1}</span>
          </li>
        );
      })}
    </ul>
  );
};
