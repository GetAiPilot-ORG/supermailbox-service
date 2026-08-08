import React, { useState, useRef, useEffect, useCallback } from 'react';

interface GradientColorPickerProps {
  value: string;                          // hex, rgb, or CSS gradient string
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  maxLength?: number;
}

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #fd7043, #ff8a65)',
  'linear-gradient(135deg, #30cfd0, #330867)',
  'linear-gradient(135deg, #0ba360, #3cba92)',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
];

const isGradient = (v: string) =>
  typeof v === 'string' && (v.includes('linear-gradient') || v.includes('radial-gradient') || v.includes('conic-gradient'));

const extractHexFromGradient = (v: string): string => {
  if (!isGradient(v)) return v;
  const match = v.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
  return match ? match[0] : '#6366f1';
};

export const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  value,
  onChange,
  label,
  className = '',
  maxLength = 200,
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'solid' | 'gradient'>(isGradient(value) ? 'gradient' : 'solid');
  const [solidColor, setSolidColor] = useState(isGradient(value) ? extractHexFromGradient(value) : value || '#6366f1');
  const [gradientFrom, setGradientFrom] = useState('#6366f1');
  const [gradientTo, setGradientTo] = useState('#8b5cf6');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [textValue, setTextValue] = useState(value || '');

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse gradient values when switching to gradient mode
  useEffect(() => {
    if (isGradient(value)) {
      setMode('gradient');
      const hexes = [...value.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g)].map(m => m[0]);
      if (hexes[0]) setGradientFrom(hexes[0]);
      if (hexes[1]) setGradientTo(hexes[1]);
      const angleMatch = value.match(/(\d+)deg/);
      if (angleMatch) setGradientAngle(parseInt(angleMatch[1]));
    } else {
      setMode('solid');
      setSolidColor(value || '#6366f1');
    }
    setTextValue(value || '');
  }, [value]);

  const buildGradient = useCallback(
    (from = gradientFrom, to = gradientTo, angle = gradientAngle) =>
      `linear-gradient(${angle}deg, ${from}, ${to})`,
    [gradientFrom, gradientTo, gradientAngle]
  );

  const currentDisplay = mode === 'gradient' ? buildGradient() : solidColor;

  const commitSolid = (hex: string) => {
    setSolidColor(hex);
    setTextValue(hex);
    onChange(hex);
  };

  const commitGradient = (from = gradientFrom, to = gradientTo, angle = gradientAngle) => {
    const g = buildGradient(from, to, angle);
    setTextValue(g);
    onChange(g);
  };

  const applyPresetGradient = (preset: string) => {
    setMode('gradient');
    const hexes = [...preset.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g)].map(m => m[0]);
    const angleMatch = preset.match(/(\d+)deg/);
    const from = hexes[0] || gradientFrom;
    const to = hexes[1] || gradientTo;
    const angle = angleMatch ? parseInt(angleMatch[1]) : gradientAngle;
    setGradientFrom(from);
    setGradientTo(to);
    setGradientAngle(angle);
    setTextValue(preset);
    onChange(preset);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ position: 'relative' }}>
      {/* Color Swatch Trigger */}
      <button
        ref={triggerRef}
        type="button"
        title="Open color picker"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid #e2e8f0',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          background: currentDisplay,
          boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.15s ease',
          overflow: 'hidden',
        }}
        aria-label="Open color picker"
      />

      {/* Text Input */}
      <input
        type="text"
        value={textValue}
        maxLength={maxLength}
        onChange={e => {
          const v = e.target.value;
          setTextValue(v);
          if (isGradient(v)) {
            setMode('gradient');
            onChange(v);
          } else if (/^#[0-9a-fA-F]{3,6}$/.test(v) || /^rgb/.test(v)) {
            setMode('solid');
            setSolidColor(v);
            onChange(v);
          }
        }}
        placeholder="#6366f1 or linear-gradient(...)"
        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      {/* Popover Panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 9999,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            padding: '16px',
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
            {(['solid', 'gradient'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  if (m === 'solid') {
                    commitSolid(solidColor);
                  } else {
                    commitGradient();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#4f46e5' : '#64748b',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'solid' ? '🎨 Solid' : '🌈 Gradient'}
              </button>
            ))}
          </div>

          {mode === 'solid' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Native color picker */}
              <input
                type="color"
                value={solidColor.startsWith('#') && solidColor.length >= 7 ? solidColor : '#6366f1'}
                onChange={e => commitSolid(e.target.value)}
                style={{ width: '100%', height: '48px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '2px' }}
              />
              {/* Hex input */}
              <input
                type="text"
                value={solidColor}
                maxLength={7}
                onChange={e => {
                  const v = e.target.value;
                  setSolidColor(v);
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) commitSolid(v);
                }}
                placeholder="#6366f1"
                style={{
                  width: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Live Gradient Preview */}
              <div style={{
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: buildGradient(),
                transition: 'background 0.2s ease',
              }} />

              {/* From / To color pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Start</label>
                  <input
                    type="color"
                    value={gradientFrom}
                    onChange={e => {
                      setGradientFrom(e.target.value);
                      commitGradient(e.target.value, gradientTo, gradientAngle);
                    }}
                    style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>End</label>
                  <input
                    type="color"
                    value={gradientTo}
                    onChange={e => {
                      setGradientTo(e.target.value);
                      commitGradient(gradientFrom, e.target.value, gradientAngle);
                    }}
                    style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '2px' }}
                  />
                </div>
              </div>

              {/* Angle Slider */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Angle</span><span style={{ color: '#4f46e5' }}>{gradientAngle}°</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={gradientAngle}
                  onChange={e => {
                    const angle = parseInt(e.target.value);
                    setGradientAngle(angle);
                    commitGradient(gradientFrom, gradientTo, angle);
                  }}
                  style={{ width: '100%', accentColor: '#4f46e5' }}
                />
              </div>

              {/* Preset Gradients */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Presets</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                  {PRESET_GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      title={g}
                      onClick={() => applyPresetGradient(g)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: g,
                        border: textValue === g ? '2px solid #4f46e5' : '2px solid transparent',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'transform 0.1s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              width: '100%',
              padding: '7px',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default GradientColorPicker;
