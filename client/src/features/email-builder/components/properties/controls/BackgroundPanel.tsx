import React, { useState } from 'react';

interface BackgroundStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
}

interface BackgroundPanelProps {
  style: BackgroundStyle;
  onChangeStyle: (patch: Partial<BackgroundStyle>) => void;
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ style, onChangeStyle }) => {
  const [bgMode, setBgMode] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [gradientStart, setGradientStart] = useState('#2563eb');
  const [gradientEnd, setGradientEnd] = useState('#7c3aed');
  const [gradientAngle, setGradientAngle] = useState(135);

  const applyGradient = (start: string, end: string, angle: number) => {
    const gradStr = `linear-gradient(${angle}deg, ${start}, ${end})`;
    onChangeStyle({ backgroundColor: gradStr });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
        {(['solid', 'gradient', 'image'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setBgMode(mode)}
            style={{
              flex: 1,
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px',
              border: 'none',
              borderRadius: '4px',
              background: bgMode === mode ? '#ffffff' : 'transparent',
              color: bgMode === mode ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      {bgMode === 'solid' && (
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Solid Background Color
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="color"
              value={style.backgroundColor && !style.backgroundColor.includes('gradient') ? style.backgroundColor : '#ffffff'}
              onChange={(e) => onChangeStyle({ backgroundColor: e.target.value })}
              style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={style.backgroundColor || ''}
              onChange={(e) => onChangeStyle({ backgroundColor: e.target.value })}
              placeholder="#ffffff or transparent"
              style={{ width: '100%', fontSize: '11px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      )}

      {bgMode === 'gradient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Start Color</label>
              <input
                type="color"
                value={gradientStart}
                onChange={(e) => {
                  setGradientStart(e.target.value);
                  applyGradient(e.target.value, gradientEnd, gradientAngle);
                }}
                style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>End Color</label>
              <input
                type="color"
                value={gradientEnd}
                onChange={(e) => {
                  setGradientEnd(e.target.value);
                  applyGradient(gradientStart, e.target.value, gradientAngle);
                }}
                style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Angle ({gradientAngle}°)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={gradientAngle}
              onChange={(e) => {
                const angle = parseInt(e.target.value, 10);
                setGradientAngle(angle);
                applyGradient(gradientStart, gradientEnd, angle);
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {bgMode === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Image URL
            </label>
            <input
              type="text"
              value={style.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/, '$1') || ''}
              onChange={(e) => {
                const url = e.target.value;
                onChangeStyle({ backgroundImage: url ? `url('${url}')` : 'none' });
              }}
              placeholder="https://example.com/image.jpg"
              style={{ width: '100%', fontSize: '11px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Size</label>
              <select
                value={style.backgroundSize || 'cover'}
                onChange={(e) => onChangeStyle({ backgroundSize: e.target.value })}
                style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Repeat</label>
              <select
                value={style.backgroundRepeat || 'no-repeat'}
                onChange={(e) => onChangeStyle({ backgroundRepeat: e.target.value })}
                style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              >
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Repeat</option>
                <option value="repeat-x">Repeat X</option>
                <option value="repeat-y">Repeat Y</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
