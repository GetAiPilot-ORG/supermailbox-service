import React from 'react';

interface TypographyStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

interface TypographyPanelProps {
  style: TypographyStyle;
  onChangeStyle: (patch: Partial<TypographyStyle>) => void;
}

const FONT_FAMILIES = [
  { label: 'System Default', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Inter / Modern Sans', value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New (Mono)', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
];

const COLOR_PRESETS = [
  { label: 'Dark', value: '#0f172a' },
  { label: 'Slate', value: '#334155' },
  { label: 'Muted', value: '#64748b' },
  { label: 'White', value: '#ffffff' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Pink', value: '#f43f5e' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Light Pink', value: '#fee2e2' },
];

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ style, onChangeStyle }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Font Family */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
          Font Family
        </label>
        <select
          value={style.fontFamily || 'Arial, Helvetica, sans-serif'}
          onChange={(e) => onChangeStyle({ fontFamily: e.target.value })}
          style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size & Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Size
          </label>
          <input
            type="text"
            value={style.fontSize || '14px'}
            onChange={(e) => onChangeStyle({ fontSize: e.target.value })}
            placeholder="14px"
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Weight
          </label>
          <select
            value={style.fontWeight || '400'}
            onChange={(e) => onChangeStyle({ fontWeight: e.target.value })}
            style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">ExtraBold (800)</option>
          </select>
        </div>
      </div>

      {/* Color & Line Height */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Text Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="color"
                value={style.color || '#334155'}
                onChange={(e) => onChangeStyle({ color: e.target.value })}
                style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
              />
              <input
                type="text"
                value={style.color || '#334155'}
                onChange={(e) => onChangeStyle({ color: e.target.value })}
                style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Line Height
            </label>
            <input
              type="text"
              value={style.lineHeight || '1.5'}
              onChange={(e) => onChangeStyle({ lineHeight: e.target.value })}
              placeholder="1.5"
              style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* Color Preset Swatches */}
        <div>
          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Quick Palette:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChangeStyle({ color: preset.value })}
                title={`${preset.label} (${preset.value})`}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  backgroundColor: preset.value,
                  border: style.color?.toLowerCase() === preset.value.toLowerCase() ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: preset.value === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
          Alignment
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {['left', 'center', 'right', 'justify'].map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onChangeStyle({ textAlign: align })}
              style={{
                fontSize: '11px',
                padding: '6px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                background: style.textAlign === align ? '#eff6ff' : '#ffffff',
                color: style.textAlign === align ? '#2563eb' : '#475569',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
