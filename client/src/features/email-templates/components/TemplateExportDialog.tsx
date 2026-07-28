import React, { useEffect, useState } from 'react';
import { Copy, Download, X } from 'lucide-react';
import { downloadTextFile } from '../services/templateCompiler.service';
import { templateService } from '../services/template.service';
import type { QualityIssue } from '../types/template.types';

type ExportPayload = {
  mjml: string;
  html: string;
  plainText: string;
  errors: string[];
  quality: QualityIssue[];
};

type Props = {
  open: boolean;
  name: string;
  subject: string;
  preheader: string;
  getMjml: () => Promise<string>;
  getHtml?: () => Promise<string>;
  onClose: () => void;
};

export const TemplateExportDialog: React.FC<Props> = ({ open, name, subject, preheader, getMjml, getHtml, onClose }) => {
  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [tab, setTab] = useState<'html' | 'mjml' | 'plainText'>('html');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPayload(null);
    setError('');
    (getHtml
      ? Promise.all([getMjml(), getHtml()]).then(([mjml, html]) => ({ mjml, html, plainText: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), errors: [], quality: [] }))
      : getMjml().then((mjml) => templateService.compileMjml({ mjmlContent: mjml, subject, preheader }).then((compiled) => ({ mjml, ...compiled }))))
      .then((next) => { if (!cancelled) setPayload(next); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Export failed.'); });
    return () => { cancelled = true; };
  }, [getHtml, getMjml, open, preheader, subject]);

  if (!open) return null;
  const value = payload ? (tab === 'mjml' ? payload.mjml : tab === 'plainText' ? payload.plainText : payload.html) : '';
  const extension = tab === 'plainText' ? 'txt' : tab;

  return (
    <div className="template-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="template-export-dialog">
        <header>
          <div>
            <h3>Export template</h3>
            <p>{name}</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} title="Close"><X size={16} /></button>
        </header>
        <div className="template-export-tabs">
          {(['html', 'mjml', 'plainText'] as const).map((next) => (
            <button key={next} type="button" className={tab === next ? 'active' : ''} onClick={() => setTab(next)}>
              {next === 'plainText' ? 'Plain text' : next.toUpperCase()}
            </button>
          ))}
        </div>
        {error && <div className="template-state compact"><strong>Export failed</strong><p>{error}</p></div>}
        {!error && !payload && <div className="template-state compact">Compiling current design...</div>}
        {payload && (
          <>
            {payload.errors.length > 0 && <div className="builder-notice">{payload.errors[0]}</div>}
            <textarea className="export-code" readOnly value={value} />
            <footer>
              <button className="btn-secondary compact" type="button" onClick={() => navigator.clipboard?.writeText(value)}><Copy size={15} /> Copy</button>
              <button className="btn-primary compact" type="button" onClick={() => downloadTextFile(`${name || 'template'}.${extension}`, value)}><Download size={15} /> Download</button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
