import React from 'react';
import { Archive, Copy, Eye, FileCode2, Pencil, Trash2, Send } from 'lucide-react';
import type { EmailTemplate, GalleryTemplate } from '../types/template.types';
import { getTemplateThumbnailHtml } from '../services/templateThumbnail.service';

type Props = {
  template: EmailTemplate | GalleryTemplate;
  mode: 'manager' | 'gallery';
  selected?: boolean;
  onEdit?: () => void;
  onPreview?: () => void;
  onUse?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExportHtml?: () => void;
};

export const TemplateCard: React.FC<Props> = ({
  template,
  mode,
  selected,
  onEdit,
  onPreview,
  onUse,
  onDuplicate,
  onArchive,
  onDelete,
  onExportHtml,
}) => {
  const html = 'compiledHtml' in template ? template.compiledHtml : undefined;

  return (
    <article className={`email-template-card ${selected ? 'selected' : ''}`}>
      <button type="button" className="email-template-preview" onClick={onPreview} aria-label={`Preview ${template.name}`}>
        {mode === 'gallery' && template.key === 'blank_template' ? (
          <div className="email-template-blank-preview">
            <FileCode2 size={26} />
            <span>Blank MJML Canvas</span>
          </div>
        ) : (
          <iframe title={`${template.name} preview`} srcDoc={getTemplateThumbnailHtml(html || ('mjmlContent' in template ? template.mjmlContent : ''))} loading="lazy" tabIndex={-1} />
        )}
        <span className="email-template-hover">
          <Eye size={16} />
          Preview
        </span>
      </button>

      <div className="email-template-card-body">
        <div className="email-template-card-top">
          <div>
            <h3>{template.name}</h3>
            <p>{template.subject || template.description || 'No subject yet'}</p>
          </div>
        </div>

        <div className="email-template-meta-row">
          <span>{template.category || 'General'}</span>
          <span>{template.industry || 'General'}</span>
          {'status' in template && <span>{template.status}</span>}
        </div>

        <div className="email-template-actions">
          {mode === 'gallery' ? (
            <button type="button" className="btn-primary compact" onClick={onUse}>
              Use Template
            </button>
          ) : (
            <>
              <button type="button" className="icon-btn" onClick={onEdit} title="Edit"><Pencil size={15} /></button>
              <button type="button" className="icon-btn" onClick={onDuplicate} title="Duplicate"><Copy size={15} /></button>
              <button type="button" className="icon-btn" onClick={onExportHtml} title="Export HTML"><FileCode2 size={15} /></button>
              <button type="button" className="icon-btn" onClick={onUse} title="Use in Campaign"><Send size={15} /></button>
              <button type="button" className="icon-btn" onClick={onArchive} title="Archive"><Archive size={15} /></button>
              <button type="button" className="icon-btn danger" onClick={onDelete} title="Delete"><Trash2 size={15} /></button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
