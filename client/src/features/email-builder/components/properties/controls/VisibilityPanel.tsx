import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface Visibility {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

interface VisibilityPanelProps {
  visibility?: Visibility;
  onChangeVisibility: (patch: Partial<Visibility>) => void;
}

export const VisibilityPanel: React.FC<VisibilityPanelProps> = ({
  visibility = { desktop: true, tablet: true, mobile: true },
  onChangeVisibility,
}) => {
  const desktop = visibility.desktop ?? true;
  const tablet = visibility.tablet ?? true;
  const mobile = visibility.mobile ?? true;

  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
        Device Visibility
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {/* Desktop */}
        <button
          type="button"
          onClick={() => onChangeVisibility({ desktop: !desktop })}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: desktop ? '#eff6ff' : '#f8fafc',
            color: desktop ? '#2563eb' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <Monitor size={16} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Desktop</span>
        </button>

        {/* Tablet */}
        <button
          type="button"
          onClick={() => onChangeVisibility({ tablet: !tablet })}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: tablet ? '#eff6ff' : '#f8fafc',
            color: tablet ? '#2563eb' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <Tablet size={16} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Tablet</span>
        </button>

        {/* Mobile */}
        <button
          type="button"
          onClick={() => onChangeVisibility({ mobile: !mobile })}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: mobile ? '#eff6ff' : '#f8fafc',
            color: mobile ? '#2563eb' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <Smartphone size={16} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Mobile</span>
        </button>
      </div>
    </div>
  );
};
