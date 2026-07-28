import React from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';
import type { EmailTemplate, GalleryTemplate } from '../types/template.types';
import { getTemplateThumbnailHtml } from '../services/templateThumbnail.service';

type Props = {
  template: EmailTemplate | GalleryTemplate | null;
  onClose: () => void;
  onUse?: () => void;
};

export const TemplatePreviewDialog: React.FC<Props> = ({ template, onClose, onUse }) => {
  if (!template) return null;
  const html = 'compiledHtml' in template ? template.compiledHtml : undefined;
  const srcDoc = getTemplateThumbnailHtml(html || ('mjmlContent' in template ? template.mjmlContent : ''));

  return (
    <div className="template-dialog-backdrop" role="presentation" onClick={onClose}>
      <section className="template-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="template-preview-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <h2 id="template-preview-title">{template.name}</h2>
            <p>{template.description || template.subject || 'Email template preview'}</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
        </header>
        <div className="template-preview-grid">
          <div>
            <span className="template-device-label"><Monitor size={15} /> Desktop</span>
            <iframe title={`${template.name} desktop preview`} srcDoc={srcDoc} />
          </div>
          <div>
            <span className="template-device-label"><Smartphone size={15} /> Mobile</span>
            <iframe title={`${template.name} mobile preview`} srcDoc={srcDoc} className="mobile" />
          </div>
        </div>
        <footer>
          <div className="email-template-meta-row">
            <span>{template.category}</span>
            <span>{template.industry}</span>
          </div>
          {onUse && <button type="button" className="btn-primary" onClick={onUse}>Use Template</button>}
        </footer>
      </section>
    </div>
  );
};
