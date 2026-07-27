import React, { useState, useEffect } from 'react';
import { X, Search, Code, Tag, FileText, Link2, Phone, Sparkles, Check, ChevronRight } from 'lucide-react';
import { resourceResolverService, type BrandMergeTag } from '../services/resourceResolver.service';
import { brandService } from '../services/brand.service';

interface ResourcePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResource: (item: { type: string; tag: string; label: string; value?: string }) => void;
  brandId?: string;
}

export const ResourcePickerDialog: React.FC<ResourcePickerDialogProps> = ({
  isOpen,
  onClose,
  onSelectResource,
  brandId,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loadingSnippets, setLoadingSnippets] = useState<boolean>(false);

  const staticTags = resourceResolverService.getAvailableMergeTags();

  useEffect(() => {
    if (isOpen) {
      setLoadingSnippets(true);
      brandService.listSnippets({ brandId })
        .then(res => setSnippets(res || []))
        .catch(err => console.warn('Could not load snippets for picker:', err))
        .finally(() => setLoadingSnippets(false));
    }
  }, [isOpen, brandId]);

  // Combine static merge tags with dynamic snippet tags
  const snippetTags: BrandMergeTag[] = snippets.map(s => {
    const cleanSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return {
      tag: `{{brand.snippets.${cleanSlug}}}`,
      label: s.name,
      category: 'Snippets' as any,
      description: `Reusable text snippet: "${(s.plain_text || '').slice(0, 50)}..."`,
    };
  });

  const allTags = [...staticTags, ...snippetTags];

  const categories = ['All', 'Company', 'Contacts', 'URLs & Links', 'Design & Colors', 'Snippets', 'System'];

  const filteredTags = allTags.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = !searchQuery || t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.tag.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCatIcon = (cat: string) => {
    if (cat === 'Company') return <Tag className="w-3.5 h-3.5 text-indigo-500" />;
    if (cat === 'Contacts') return <Phone className="w-3.5 h-3.5 text-emerald-500" />;
    if (cat === 'URLs & Links') return <Link2 className="w-3.5 h-3.5 text-purple-500" />;
    if (cat === 'Snippets') return <FileText className="w-3.5 h-3.5 text-amber-500" />;
    return <Code className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Insert Brand Merge Tag Token</h3>
              <p className="text-xs text-slate-500 font-medium">Insert database-driven personalization and compliance variables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bl-input pl-8 pr-3 py-1.5 w-48"
            />
          </div>
        </div>

        {/* Body / List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredTags.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No merge tags found matching your search.
            </div>
          ) : (
            filteredTags.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  onSelectResource({
                    type: 'merge_tag',
                    tag: item.tag,
                    label: item.label,
                  });
                  onClose();
                }}
                className="bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-300 rounded p-3.5 flex items-center justify-between gap-4 cursor-pointer transition group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded bg-white border border-slate-200/80 shrink-0 mt-0.5">
                    {getCatIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">{item.label}</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-slate-200 text-slate-600">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white border border-slate-200 text-indigo-700 group-hover:bg-indigo-100 group-hover:border-indigo-300 transition">
                    {item.tag}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Click any token card to insert it directly into your template text or link field.</span>
          <button
            onClick={onClose}
            className="bl-btn bl-btn--secondary"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
