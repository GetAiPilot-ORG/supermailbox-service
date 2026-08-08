import React from 'react';
import type { EmailRow } from '../../types/document.types';
import { useDocumentStore } from '../../store/documentStore';
import { useSavedBlocksStore } from '../../store/savedBlocksStore';
import { BackgroundPanel } from './controls/BackgroundPanel';
import { BorderPanel } from './controls/BorderPanel';
import { SpacingPanel } from './controls/SpacingPanel';

interface RowPropertiesProps {
  row: EmailRow;
}

export const RowProperties: React.FC<RowPropertiesProps> = ({ row }) => {
  const updateRow = useDocumentStore((state) => state.updateRow);
  const saveRow = useSavedBlocksStore((state) => state.saveRow);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Row Configuration</h4>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
          Row Label
        </label>
        <input
          type="text"
          value={row.name || ''}
          onChange={(e) => updateRow(row.id, { name: e.target.value })}
          placeholder="e.g. Header Section"
          style={{ width: '100%', fontSize: '12px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* Row Background (Full width) */}
      <div>
        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Outer Row Background</h5>
        <BackgroundPanel
          style={{ backgroundColor: row.settings.backgroundColor }}
          onChangeStyle={(patch) => updateRow(row.id, patch)}
        />
      </div>

      {/* Content Background (Inside container width) */}
      <div>
        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>Inner Content Background</h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="color"
            value={row.settings.contentBackgroundColor || '#ffffff'}
            onChange={(e) => updateRow(row.id, { contentBackgroundColor: e.target.value })}
            style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={row.settings.contentBackgroundColor || '#ffffff'}
            onChange={(e) => updateRow(row.id, { contentBackgroundColor: e.target.value })}
            placeholder="#ffffff or transparent"
            style={{ width: '100%', fontSize: '11px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* Spacing */}
      <SpacingPanel
        padding={row.settings.padding}
        margin={row.settings.margin}
        onChangePadding={(val) => updateRow(row.id, { padding: val })}
        onChangeMargin={(val) => updateRow(row.id, { margin: val })}
      />

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* Border */}
      <BorderPanel
        style={{
          borderWidth: row.settings.border ? row.settings.border.split(' ')[0] : '0px',
          borderColor: row.settings.border ? row.settings.border.split(' ')[2] : '#cbd5e1',
          borderRadius: row.settings.borderRadius,
        }}
        onChangeStyle={(patch) => updateRow(row.id, patch)}
      />

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* Mobile Stack Options */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          <input
            type="checkbox"
            checked={row.settings.stackOnMobile ?? true}
            onChange={(e) => updateRow(row.id, { stackOnMobile: e.target.checked })}
          />
          Stack columns vertically on mobile
        </label>
      </div>

      {/* Save Row to Library */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        <button
          type="button"
          onClick={() => {
            const name = prompt('Enter a name for this saved section:', row.name || 'Saved Section');
            if (name) {
              saveRow(name, row);
              alert('Section saved to Saved Library!');
            }
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            fontSize: '12px',
            fontWeight: 600,
            background: '#f8fafc',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Save Section to Library
        </button>
      </div>
    </div>
  );
};
