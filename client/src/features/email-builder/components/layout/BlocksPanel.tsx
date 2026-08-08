import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  AlertTriangle,
  Award,
  Bookmark,
  Clock,
  Code,
  Columns2,
  FileSignature,
  Grid,
  Heading1,
  Image,
  Layers,
  Menu as MenuIcon,
  Minus,
  MousePointerClick,
  Plus,
  QrCode,
  Quote as QuoteIcon,
  Rows3,
  Search,
  Share2,
  ShoppingBag,
  Ticket,
  Trash2,
  Type,
  Video,
} from 'lucide-react';
import type { BlockType, EmailRow } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { useSavedBlocksStore } from '../../store/savedBlocksStore';
import { SECTION_PRESETS, type SectionPreset } from '../../utils/sectionPresets';

interface BlockItem {
  id: BlockType;
  label: string;
  Icon: React.FC<{ size?: number }>;
  category: 'Basic' | 'Advanced';
}

const BLOCK_ITEMS: BlockItem[] = [
  { id: 'heading', label: 'Heading', Icon: Heading1, category: 'Basic' },
  { id: 'paragraph', label: 'Text', Icon: Type, category: 'Basic' },
  { id: 'image', label: 'Image', Icon: Image, category: 'Basic' },
  { id: 'button', label: 'Button', Icon: MousePointerClick, category: 'Basic' },
  { id: 'divider', label: 'Divider', Icon: Minus, category: 'Basic' },
  { id: 'spacer', label: 'Spacer', Icon: Rows3, category: 'Basic' },
  { id: 'html', label: 'Custom HTML', Icon: Code, category: 'Advanced' },
  { id: 'social', label: 'Social Icons', Icon: Share2, category: 'Advanced' },
  { id: 'video', label: 'Video', Icon: Video, category: 'Advanced' },
  { id: 'menu', label: 'Navbar Menu', Icon: MenuIcon, category: 'Advanced' },
  { id: 'product_card', label: 'Product Card', Icon: ShoppingBag, category: 'Advanced' },
  { id: 'product_grid', label: 'Product Grid', Icon: Grid, category: 'Advanced' },
  { id: 'countdown', label: 'Countdown', Icon: Clock, category: 'Advanced' },
  { id: 'qr_code', label: 'QR Code', Icon: QrCode, category: 'Advanced' },
  { id: 'quote', label: 'Quote', Icon: QuoteIcon, category: 'Advanced' },
  { id: 'badge', label: 'Badge', Icon: Award, category: 'Advanced' },
  { id: 'alert', label: 'Alert Banner', Icon: AlertTriangle, category: 'Advanced' },
  { id: 'coupon', label: 'Coupon Box', Icon: Ticket, category: 'Advanced' },
  { id: 'signature', label: 'Signature', Icon: FileSignature, category: 'Advanced' },
];

const SidebarDraggableBlock: React.FC<{ item: BlockItem }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.id}`,
    data: {
      source: 'sidebar',
      type: 'sidebar-block',
      blockType: item.id,
    },
  });

  const addBlock = useDocumentStore((state) => state.addBlock);

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={() => addBlock(item.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 8px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: isDragging ? '#eff6ff' : '#ffffff',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        transition: 'all 0.15s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#2563eb';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
    >
      <item.Icon size={18} />
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>{item.label}</span>
    </button>
  );
};

export const BlocksPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'sections' | 'saved'>('blocks');
  const [search, setSearch] = useState('');

  const addRow = useDocumentStore((state) => state.addRow);
  const insertSection = useDocumentStore((state) => state.insertSection);
  const savedItems = useSavedBlocksStore((state) => state.items);
  const removeItem = useSavedBlocksStore((state) => state.removeItem);

  const filteredBlocks = BLOCK_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );
  const basicBlocks = filteredBlocks.filter((b) => b.category === 'Basic');
  const advancedBlocks = filteredBlocks.filter((b) => b.category === 'Advanced');

  const filteredSections = SECTION_PRESETS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSaved = savedItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

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
      {/* Top Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        {(['blocks', 'sections', 'saved'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
              background: activeTab === tab ? '#ffffff' : 'transparent',
              color: activeTab === tab ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
          }}
        >
          <Search size={14} color="#94a3b8" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '12px',
              width: '100%',
              color: '#0f172a',
            }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'blocks' && (
          <>
            {basicBlocks.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  Basic Blocks
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {basicBlocks.map((item) => (
                    <SidebarDraggableBlock key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {advancedBlocks.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  Advanced
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {advancedBlocks.map((item) => (
                    <SidebarDraggableBlock key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => addRow('1-col')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  color: '#3b82f6',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Columns2 size={16} /> + Add Row
              </button>
            </div>
          </>
        )}

        {activeTab === 'sections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredSections.map((sec) => (
              <div
                key={sec.id}
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{sec.name}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                    {sec.category}
                  </span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>{sec.description}</p>
                <button
                  type="button"
                  onClick={() => insertSection(sec.createRows())}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={12} /> Insert Section
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {filteredSaved.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                <Bookmark size={24} style={{ marginBottom: '6px' }} />
                <p style={{ margin: 0 }}>No saved elements yet.</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px' }}>Save rows or blocks from properties panel to reuse them anytime.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredSaved.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>{item.name}</span>
                      <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>{item.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'row') {
                            insertSection([item.data as EmailRow]);
                          } else {
                            useDocumentStore.getState().addBlock((item.data as any).type);
                          }
                        }}
                        style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Insert
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{ padding: '4px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
