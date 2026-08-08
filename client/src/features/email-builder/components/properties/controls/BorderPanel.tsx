import React from 'react';

interface BorderStyle {
  border?: string;
  borderRadius?: string;
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: string;
}

interface BorderPanelProps {
  style: BorderStyle;
  onChangeStyle: (patch: Partial<BorderStyle>) => void;
}

export const BorderPanel: React.FC<BorderPanelProps> = ({ style, onChangeStyle }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Border Width & Style */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Border Width
          </label>
          <input
            type="text"
            value={style.borderWidth || '0px'}
            onChange={(e) => onChangeStyle({ borderWidth: e.target.value })}
            placeholder="1px"
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Style
          </label>
          <select
            value={style.borderStyle || 'solid'}
            onChange={(e) => onChangeStyle({ borderStyle: e.target.value })}
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Border Color & Radius */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Border Color
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="color"
              value={style.borderColor || '#cbd5e1'}
              onChange={(e) => onChangeStyle({ borderColor: e.target.value })}
              style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={style.borderColor || '#cbd5e1'}
              onChange={(e) => onChangeStyle({ borderColor: e.target.value })}
              style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Border Radius
          </label>
          <input
            type="text"
            value={style.borderRadius || '0px'}
            onChange={(e) => onChangeStyle({ borderRadius: e.target.value })}
            placeholder="6px"
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>
    </div>
  );
};
