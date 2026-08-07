import React from 'react';

interface EffectsStyle {
  boxShadow?: string;
  opacity?: string | number;
}

interface EffectsPanelProps {
  style: EffectsStyle;
  onChangeStyle: (patch: Partial<EffectsStyle>) => void;
}

const SHADOW_PRESETS = [
  { label: 'None', value: 'none' },
  { label: 'Subtle', value: '0 1px 3px rgba(0,0,0,0.1)' },
  { label: 'Medium', value: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  { label: 'Large', value: '0 10px 15px -3px rgba(0,0,0,0.15)' },
];

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ style, onChangeStyle }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Box Shadow */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
          Shadow
        </label>
        <select
          value={style.boxShadow || 'none'}
          onChange={(e) => onChangeStyle({ boxShadow: e.target.value })}
          style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          {SHADOW_PRESETS.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Opacity */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
          Opacity ({Math.round(Number(style.opacity ?? 1) * 100)}%)
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={Number(style.opacity ?? 1)}
          onChange={(e) => onChangeStyle({ opacity: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};
