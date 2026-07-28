import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { TemplateVersion } from '../types/template.types';

type Props = {
  versions: TemplateVersion[];
  onClose: () => void;
  onRestore: (versionId: string) => void;
};

export const TemplateVersionDialog: React.FC<Props> = ({ versions, onClose, onRestore }) => (
  <div className="template-dialog-backdrop" role="presentation" onClick={onClose}>
    <section className="template-version-dialog" role="dialog" aria-modal="true" aria-labelledby="template-version-title" onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2 id="template-version-title">Version history</h2>
          <p>Restoring creates a new version and preserves newer history.</p>
        </div>
        <button className="icon-btn" type="button" onClick={onClose} aria-label="Close versions"><X size={18} /></button>
      </header>
      <div className="version-list">
        {versions.map((version) => (
          <div key={version.id} className="version-row">
            <div>
              <strong>Version {version.version_number}</strong>
              <span>{version.save_reason || version.status} · {new Date(version.created_at).toLocaleString()}</span>
            </div>
            <button className="btn-secondary compact" type="button" onClick={() => onRestore(version.id)}><RotateCcw size={14} /> Restore</button>
          </div>
        ))}
      </div>
    </section>
  </div>
);
