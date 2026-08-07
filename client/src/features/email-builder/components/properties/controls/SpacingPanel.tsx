import React, { useState } from 'react';
import { Link, Unlink } from 'lucide-react';

interface SpacingPanelProps {
  padding?: string;
  margin?: string;
  onChangePadding?: (value: string) => void;
  onChangeMargin?: (value: string) => void;
}

function parseSpacing(value?: string): [string, string, string, string] {
  if (!value) return ['0px', '0px', '0px', '0px'];
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  if (parts.length >= 4) return [parts[0], parts[1], parts[2], parts[3]];
  return ['0px', '0px', '0px', '0px'];
}

export const SpacingPanel: React.FC<SpacingPanelProps> = ({
  padding = '0px',
  margin = '0px',
  onChangePadding,
  onChangeMargin,
}) => {
  const [padLinked, setPadLinked] = useState(true);
  const [marLinked, setMarLinked] = useState(true);

  const [padTop, padRight, padBottom, padLeft] = parseSpacing(padding);
  const [marTop, marRight, marBottom, marLeft] = parseSpacing(margin);

  const handlePaddingChange = (top: string, right: string, bottom: string, left: string) => {
    if (!onChangePadding) return;
    if (padLinked) {
      onChangePadding(`${top}`);
    } else {
      onChangePadding(`${top} ${right} ${bottom} ${left}`);
    }
  };

  const handleMarginChange = (top: string, right: string, bottom: string, left: string) => {
    if (!onChangeMargin) return;
    if (marLinked) {
      onChangeMargin(`${top}`);
    } else {
      onChangeMargin(`${top} ${right} ${bottom} ${left}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Padding */}
      {onChangePadding && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Padding</span>
            <button
              type="button"
              onClick={() => setPadLinked(!padLinked)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              title={padLinked ? 'Unlink sides' : 'Link all sides'}
            >
              {padLinked ? <Link size={14} /> : <Unlink size={14} />}
            </button>
          </div>

          {padLinked ? (
            <input
              type="text"
              value={padTop}
              onChange={(e) => handlePaddingChange(e.target.value, e.target.value, e.target.value, e.target.value)}
              placeholder="e.g. 10px or 10px 20px"
              style={{ width: '100%', fontSize: '12px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Top</span>
                <input
                  type="text"
                  value={padTop}
                  onChange={(e) => handlePaddingChange(e.target.value, padRight, padBottom, padLeft)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Right</span>
                <input
                  type="text"
                  value={padRight}
                  onChange={(e) => handlePaddingChange(padTop, e.target.value, padBottom, padLeft)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Bottom</span>
                <input
                  type="text"
                  value={padBottom}
                  onChange={(e) => handlePaddingChange(padTop, padRight, e.target.value, padLeft)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Left</span>
                <input
                  type="text"
                  value={padLeft}
                  onChange={(e) => handlePaddingChange(padTop, padRight, padBottom, e.target.value)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Margin */}
      {onChangeMargin && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Margin</span>
            <button
              type="button"
              onClick={() => setMarLinked(!marLinked)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              title={marLinked ? 'Unlink sides' : 'Link all sides'}
            >
              {marLinked ? <Link size={14} /> : <Unlink size={14} />}
            </button>
          </div>

          {marLinked ? (
            <input
              type="text"
              value={marTop}
              onChange={(e) => handleMarginChange(e.target.value, e.target.value, e.target.value, e.target.value)}
              placeholder="e.g. 0px or 10px 0px"
              style={{ width: '100%', fontSize: '12px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Top</span>
                <input
                  type="text"
                  value={marTop}
                  onChange={(e) => handleMarginChange(e.target.value, marRight, marBottom, marLeft)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Right</span>
                <input
                  type="text"
                  value={marRight}
                  onChange={(e) => handleMarginChange(marTop, e.target.value, marBottom, marLeft)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Bottom</span>
                <input
                  type="text"
                  value={marBottom}
                  onChange={(e) => handleMarginChange(marTop, marRight, e.target.value, marLeft)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Left</span>
                <input
                  type="text"
                  value={marLeft}
                  onChange={(e) => handleMarginChange(marTop, marRight, marBottom, e.target.value)}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
