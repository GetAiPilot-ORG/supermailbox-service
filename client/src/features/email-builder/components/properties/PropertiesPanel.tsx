import React, { useState } from 'react';
import { useSelectedBlock, useSelectedRow } from '../../store/useBuilderStore';
import { BlockProperties } from './BlockProperties';
import { DocumentProperties } from './DocumentProperties';
import { RowProperties } from './RowProperties';

interface PropertiesPanelProps {
  onRequestImagePicker?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ onRequestImagePicker }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  const selectedBlock = useSelectedBlock();
  const selectedRow = useSelectedRow();

  return (
    <aside
      style={{
        width: '300px',
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Panel Top Header Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        {(['content', 'style', 'advanced'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: '12px',
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

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {selectedBlock ? (
          <BlockProperties block={selectedBlock} onRequestImagePicker={onRequestImagePicker} />
        ) : selectedRow ? (
          <RowProperties row={selectedRow} />
        ) : (
          <DocumentProperties />
        )}
      </div>
    </aside>
  );
};
