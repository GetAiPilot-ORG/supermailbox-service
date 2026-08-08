import React, { useMemo, useState } from 'react';
import { Columns2, Heading1, Image, Link2, Minus, MousePointerClick, PanelBottom, Rows3, Search, Type } from 'lucide-react';

const groups = [
  { name: 'Basic', items: [
    { id: 'heading', label: 'Heading', Icon: Heading1 },
    { id: 'paragraph', label: 'Text', Icon: Type },
    { id: 'image', label: 'Image', Icon: Image },
    { id: 'button', label: 'Button', Icon: MousePointerClick },
    { id: 'divider', label: 'Divider', Icon: Minus },
    { id: 'spacer', label: 'Spacer', Icon: Rows3 },
  ] },
  { name: 'Sections', items: [
    { id: 'hero', label: 'Hero', Icon: PanelBottom },
    { id: 'feature', label: 'Features', Icon: Columns2 },
    { id: 'favicon_menu', label: 'Favicon Navbar', Icon: Link2 },
    { id: 'footer', label: 'Footer', Icon: Link2 },
  ] },
];

type Props = { 
  onAddBlock: (blockType: string) => void;
  onDragStart?: (blockType: string) => void;
  onDragEnd?: () => void;
};

export const BuilderBlocksPanel: React.FC<Props> = ({ onAddBlock, onDragStart, onDragEnd }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => `${group.name} ${item.label}`.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.items.length), [query]);

  return (
    <aside className="builder-side-panel">
      <h3>Blocks</h3>
      <label className="builder-search">
        <Search size={15} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blocks" />
      </label>
      {filtered.map(({ name, items }) => (
        <details key={name} open>
          <summary>{name}</summary>
          <div className="builder-block-grid">
            {items.map(({ id, label, Icon }) => (
              <button 
                key={id} 
                type="button" 
                onClick={() => onAddBlock(id)} 
                title={`Add ${label}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'copy';
                  if (onDragStart) onDragStart(id);
                }}
                onDragEnd={() => {
                  if (onDragEnd) onDragEnd();
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </details>
      ))}
    </aside>
  );
};
