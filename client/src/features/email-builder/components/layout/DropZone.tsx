import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id: string;
  columnId: string;
  index: number;
}

export const DropZone: React.FC<DropZoneProps> = ({ id, columnId, index }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'dropzone',
      columnId,
      index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        height: isOver ? '16px' : '6px',
        margin: '2px 0',
        borderRadius: '3px',
        backgroundColor: isOver ? '#2563eb' : 'transparent',
        border: isOver ? '1px dashed #1d4ed8' : 'none',
        transition: 'all 0.15s ease',
        position: 'relative',
        zIndex: 25,
      }}
    />
  );
};
