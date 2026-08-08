import React from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { useBuilderDocument } from '../../store/useBuilderStore';

export const DocumentProperties: React.FC = () => {
  const document = useBuilderDocument();
  const updateMetadata = useDocumentStore((state) => state.updateMetadata);
  const updateBodySettings = useDocumentStore((state) => state.updateBodySettings);

  const { metadata, bodySettings } = document;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Email Subject & Preheader */}
      <div>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Email Information</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Subject Line
            </label>
            <input
              type="text"
              value={metadata.subject || ''}
              onChange={(e) => updateMetadata({ subject: e.target.value })}
              placeholder="Enter email subject"
              style={{ width: '100%', fontSize: '12px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Preheader Text
            </label>
            <input
              type="text"
              value={metadata.preheader || ''}
              onChange={(e) => updateMetadata({ preheader: e.target.value })}
              placeholder="Preview snippet in inbox"
              style={{ width: '100%', fontSize: '12px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

      {/* Global Canvas & Colors */}
      <div>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Global Styling</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Content Width */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Content Width ({bodySettings.contentWidth || 600}px)
            </label>
            <input
              type="range"
              min="400"
              max="900"
              step="10"
              value={bodySettings.contentWidth || 600}
              onChange={(e) => updateBodySettings({ contentWidth: parseInt(e.target.value, 10) })}
              style={{ width: '100%' }}
            />
          </div>

          {/* Body Background & Content Background */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Canvas BG
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="color"
                  value={bodySettings.backgroundColor || '#f1f5f9'}
                  onChange={(e) => updateBodySettings({ backgroundColor: e.target.value })}
                  style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={bodySettings.backgroundColor || '#f1f5f9'}
                  onChange={(e) => updateBodySettings({ backgroundColor: e.target.value })}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Content BG
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="color"
                  value={bodySettings.contentBackgroundColor || '#ffffff'}
                  onChange={(e) => updateBodySettings({ contentBackgroundColor: e.target.value })}
                  style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={bodySettings.contentBackgroundColor || '#ffffff'}
                  onChange={(e) => updateBodySettings({ contentBackgroundColor: e.target.value })}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>

          {/* Default Text Color & Link Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Default Text
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="color"
                  value={bodySettings.textColor || '#334155'}
                  onChange={(e) => updateBodySettings({ textColor: e.target.value })}
                  style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={bodySettings.textColor || '#334155'}
                  onChange={(e) => updateBodySettings({ textColor: e.target.value })}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Link Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="color"
                  value={bodySettings.linkColor || '#2563eb'}
                  onChange={(e) => updateBodySettings({ linkColor: e.target.value })}
                  style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={bodySettings.linkColor || '#2563eb'}
                  onChange={(e) => updateBodySettings({ linkColor: e.target.value })}
                  style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
