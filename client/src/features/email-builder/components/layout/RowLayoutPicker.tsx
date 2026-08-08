import React from 'react';
import { Columns2, Columns3, Columns4, Square, X } from 'lucide-react';
import type { RowLayoutPreset } from '../../types/document.types';

interface RowLayoutPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (preset: RowLayoutPreset) => void;
}

const PRESETS: { id: RowLayoutPreset; label: string; icon: React.FC<{ size?: number }>; cols: string[] }[] = [
  { id: '1-col', label: '1 Column', icon: Square, cols: ['100%'] },
  { id: '2-col-equal', label: '1:1 (50 / 50)', icon: Columns2, cols: ['50%', '50%'] },
  { id: '3-col-equal', label: '1:1:1 (33 / 33 / 33)', icon: Columns3, cols: ['33%', '33%', '33%'] },
  { id: '4-col-equal', label: '1:1:1:1 (25 / 25 / 25 / 25)', icon: Columns4, cols: ['25%', '25%', '25%', '25%'] },
  { id: '1-3_2-3', label: '1:2 (33 / 67)', icon: Columns2, cols: ['33%', '67%'] },
  { id: '2-3_1-3', label: '2:1 (67 / 33)', icon: Columns2, cols: ['67%', '33%'] },
  { id: '1-4_3-4', label: '1:3 (25 / 75)', icon: Columns2, cols: ['25%', '75%'] },
  { id: '3-4_1-4', label: '3:1 (75 / 25)', icon: Columns2, cols: ['75%', '25%'] },
  { id: '1-4_1-2_1-4', label: '1:2:1 (25 / 50 / 25)', icon: Columns3, cols: ['25%', '50%', '25%'] },
];

export const RowLayoutPicker: React.FC<RowLayoutPickerProps> = ({ isOpen, onClose, onSelectLayout }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Choose Row Layout</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Select a column structure for your new row</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectLayout(preset.id);
                onClose();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                background: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.background = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <div style={{ display: 'flex', gap: '4px', height: '28px', marginBottom: '10px' }}>
                {preset.cols.map((width, idx) => (
                  <div
                    key={idx}
                    style={{
                      width,
                      height: '100%',
                      background: '#cbd5e1',
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
