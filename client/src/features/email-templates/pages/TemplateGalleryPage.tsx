import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { TemplateCard } from '../components/TemplateCard';
import { TemplateFilters } from '../components/TemplateFilters';
import { TemplatePreviewDialog } from '../components/TemplatePreviewDialog';
import { templateService } from '../services/template.service';
import type { GalleryTemplate } from '../types/template.types';

type Props = {
  onBack: () => void;
  onOpenBuilder: (templateId: string) => void;
};

export const TemplateGalleryPage: React.FC<Props> = ({ onBack, onOpenBuilder }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(urlParams.get('search') || '');
  const [category, setCategory] = useState(urlParams.get('category') || 'all');
  const [industry, setIndustry] = useState(urlParams.get('industry') || 'all');
  const [templates, setTemplates] = useState<GalleryTemplate[]>([]);
  const [preview, setPreview] = useState<GalleryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiOffline, setApiOffline] = useState(false);
  const [notice, setNotice] = useState('');

  const params = useMemo(() => new URLSearchParams({ search, category, industry }), [category, industry, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      window.history.replaceState(null, '', `/dashboard/templates/new?${params.toString()}`);
      setTemplates(await templateService.listGalleryTemplates(params));
      setApiOffline(templateService.isGalleryFallback());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load gallery.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { void load(); }, [load]);

  const handleUseTemplate = async (template: GalleryTemplate) => {
    if (apiOffline) {
      setNotice('Start the backend first: npm run dev --prefix server');
      return;
    }
    const created = template.key === 'blank_template'
      ? await templateService.createBlankTemplate('Untitled email template')
      : await templateService.cloneSystemTemplate(template.key);
    onOpenBuilder(created.id);
  };

  return (
    <section className="screen-page template-gallery-page">
      <header className="screen-hero template-gallery-hero">
        <div>
          <button className="btn-secondary compact" type="button" onClick={onBack}><ArrowLeft size={15} /> Manager</button>
          <span className="screen-kicker"><Sparkles size={15} /> Template gallery</span>
          <h2>Choose a starting point</h2>
          <p>Start from a professionally designed email template or build your own from scratch.</p>
        </div>
      </header>

      <TemplateFilters gallery search={search} category={category} industry={industry} onChange={(patch) => {
        if (patch.search !== undefined) setSearch(patch.search);
        if (patch.category !== undefined) setCategory(patch.category);
        if (patch.industry !== undefined) setIndustry(patch.industry);
      }} />

      {apiOffline && <div className="builder-notice">Showing local starter templates because the backend API is offline. Start the server before using a template.</div>}
      {notice && <div className="builder-notice">{notice}</div>}

      {loading && <div className="template-grid">{Array.from({ length: 8 }, (_, index) => <div key={index} className="template-skeleton" />)}</div>}
      {error && <div className="template-state"><strong>Gallery failed</strong><p>{error}</p><button className="btn-secondary" type="button" onClick={load}>Retry</button></div>}
      {!loading && !error && (
        <div className="template-grid">
          {templates.map((template) => (
            <TemplateCard key={template.key} template={template} mode="gallery" onPreview={() => setPreview(template)} onUse={() => handleUseTemplate(template)} />
          ))}
        </div>
      )}

      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} onUse={preview ? () => handleUseTemplate(preview) : undefined} />
    </section>
  );
};
