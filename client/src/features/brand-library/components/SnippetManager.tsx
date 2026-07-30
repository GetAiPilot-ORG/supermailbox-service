import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Copy, Check, Star, AlertCircle, Tag, Sparkles } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { brandSnippetSchema } from '../schemas/brand.schema';
import type { BrandSnippet, SnippetCategory } from '../types/brand.types';

interface SnippetManagerProps {
  brandId?: string;
  onRefreshStats?: () => void;
}

export const SnippetManager: React.FC<SnippetManagerProps> = ({ brandId, onRefreshStats }) => {
  const [snippets, setSnippets] = useState<BrandSnippet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<SnippetCategory>('welcome');
  const [name, setName] = useState<string>('');
  const [plainText, setPlainText] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const data = await brandService.listSnippets({ brandId });
      setSnippets(data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load text snippets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, [brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const valRes = brandSnippetSchema.safeParse({ category, name: name.trim(), plain_text: plainText, tags, is_favourite: isFavourite });
    if (!valRes.success) {
      setError(valRes.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      await brandService.saveSnippet({
        brand_id: brandId,
        category,
        name: name.trim(),
        plain_text: plainText,
        tags,
        is_favourite: isFavourite,
      });
      setName('');
      setPlainText('');
      setTagsInput('');
      setIsFavourite(false);
      setIsAdding(false);
      await fetchSnippets();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setError(err.message || 'Failed to save snippet.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.deleteSnippet(id);
      setSnippets(prev => prev.filter(s => s.id !== id));
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Failed to delete snippet:', err);
    }
  };

  const handleCopyToken = (e: React.MouseEvent, id: string, nameStr: string) => {
    e.stopPropagation();
    const cleanSlug = nameStr.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const token = `{{brand.snippets.${cleanSlug}}}`;
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Reusable Content Snippets & Text Blocks
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store reusable welcome introductions, CAN-SPAM legal disclaimers, signature text, and promotional blurbs. Embed them in templates using <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700">{'{{brand.snippets.*}}'}</span> tokens.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> New Snippet
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Create Reusable Snippet</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-500 hover:text-slate-800">
              Cancel
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="welcome">Welcome & Intro Text</option>
                <option value="legal">Legal Disclaimer & Compliance</option>
                <option value="support">Customer Support Notice</option>
                <option value="signature_text">Signature Blurb</option>
                <option value="footer_text">Footer Statement</option>
                <option value="promo">Promotional / Sale Offer</option>
                <option value="cta">Call to Action Copy</option>
                <option value="billing">Billing & Invoice Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Name (e.g. GDPR Legal Note)</label>
              <input
                type="text"
                placeholder="e.g. Standard GDPR Disclaimer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="gdpr, legal, footer..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Content (Markdown or Plain Text)</label>
            <textarea
              rows={4}
              placeholder="e.g. You are receiving this email because you opted in at SuperMail Box. To manage your preferences, visit our subscription center."
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isFavourite}
                onChange={(e) => setIsFavourite(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">Mark as Favorite <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /></span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Snippet'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Snippets Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading text snippets...</div>
      ) : snippets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Reusable Snippets Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create standard CAN-SPAM footers, customer support notices, and welcome paragraphs to reuse across your entire marketing team.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create First Snippet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snippets.map((s) => {
            const cleanSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            const tokenStr = `{{brand.snippets.${cleanSlug}}}`;

            return (
              <div key={s.id} className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 transition flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                        {s.is_favourite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-semibold uppercase text-slate-400 mt-0.5 block">{s.category.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-mono leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {s.plain_text}
                  </div>

                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {s.tags.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/60 text-slate-600 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-400" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => handleCopyToken(e, s.id, s.name)}
                    className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition truncate"
                    title="Copy snippet merge tag token"
                  >
                    {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{copiedId === s.id ? 'Token Copied!' : tokenStr}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shrink-0"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
