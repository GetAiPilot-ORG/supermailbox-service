import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { TemplateCard } from '../components/TemplateCard';
import { TemplateFilters } from '../components/TemplateFilters';
import { TemplateManagerToolbar } from '../components/TemplateManagerToolbar';
import { TemplatePreviewDialog } from '../components/TemplatePreviewDialog';
import { downloadTextFile } from '../services/templateCompiler.service';
import { templateService } from '../services/template.service';
import type { EmailTemplate } from '../types/template.types';

type Props = {
  onCreate: () => void;
  onEdit: (templateId: string) => void;
};

export const TemplateManagerPage: React.FC<Props> = ({ onCreate, onEdit }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);

  const params = useMemo(() => {
    const next = new URLSearchParams({ search, status, category, industry });
    if (activeTab === 'drafts') next.set('status', 'draft');
    if (activeTab === 'archived') next.set('status', 'archived');
    return next;
  }, [activeTab, category, industry, search, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTemplates(await templateService.listTemplates(params));
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unable to load templates.';
      setError(`${detail}. Backend API is not reachable. Start it with npm run dev --prefix server.`);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { void load(); }, [load]);

  const duplicate = async (id: string) => {
    await templateService.duplicateTemplate(id);
    await load();
  };

  const archive = async (id: string) => {
    await templateService.archiveTemplate(id);
    await load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await templateService.softDeleteTemplate(deleteTarget.id);
    setDeleteTarget(null);
    await load();
  };

  const exportHtml = async (template: EmailTemplate) => {
    const compiled = await templateService.compileTemplate(template.id);
    downloadTextFile(`${template.key || template.id}.html`, compiled.html);
  };

  return (
    <section className="screen-page template-manager-page">
      <header className="screen-hero template-hero">
        <div>
          <span className="screen-kicker"><FileText size={15} /> Email templates</span>
          <h2>Email Templates</h2>
          <p>Create, manage and reuse professionally designed email templates.</p>
        </div>
        <button className="btn-primary" type="button" onClick={onCreate}>Create Template</button>
      </header>

      <div className="template-tabs" role="tablist" aria-label="Template views">
        {['all', 'my templates', 'shared', 'drafts', 'archived'].map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
        ))}
      </div>

      <TemplateFilters search={search} status={status} category={category} industry={industry} onChange={(patch) => {
        if (patch.search !== undefined) setSearch(patch.search);
        if (patch.status !== undefined) setStatus(patch.status);
        if (patch.category !== undefined) setCategory(patch.category);
        if (patch.industry !== undefined) setIndustry(patch.industry);
      }} />

      <TemplateManagerToolbar count={templates.length} view={view} onViewChange={setView} onCreate={onCreate} onRefresh={load} />

      {loading && <div className="template-grid">{Array.from({ length: 6 }, (_, index) => <div key={index} className="template-skeleton" />)}</div>}
      {error && <div className="template-state"><strong>Could not load templates</strong><p>{error}</p><button className="btn-secondary" type="button" onClick={load}>Retry</button></div>}
      {!loading && !error && templates.length === 0 && (
        <div className="template-state">
          <strong>Create your first email template</strong>
          <p>Start from a professionally designed template or create one from scratch.</p>
          <button className="btn-primary" type="button" onClick={onCreate}>Browse Templates</button>
        </div>
      )}
      {!loading && !error && templates.length > 0 && (
        <div className={`template-grid ${view}`}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              mode="manager"
              onEdit={() => onEdit(template.id)}
              onPreview={() => setPreview(template)}
              onUse={() => {
                window.history.pushState(null, '', `/dashboard/campaigns?template=${template.id}`);
                window.dispatchEvent(new Event('popstate'));
              }}
              onDuplicate={() => duplicate(template.id)}
              onArchive={() => archive(template.id)}
              onDelete={() => setDeleteTarget(template)}
              onExportHtml={() => exportHtml(template)}
            />
          ))}
        </div>
      )}
      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
      {deleteTarget && (
        <div className="template-dialog-backdrop" role="presentation" onClick={() => setDeleteTarget(null)}>
          <section className="template-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="template-delete-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="template-delete-title">Delete template?</h2>
            <p>{deleteTarget.name} will move out of the active manager list. Its database history stays available for audit.</p>
            <div className="template-delete-actions">
              <button className="btn-secondary" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" type="button" onClick={remove}>Delete</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};
