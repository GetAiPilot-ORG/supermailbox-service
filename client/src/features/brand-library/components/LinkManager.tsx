import React, { useState, useEffect } from 'react';
import { Link2, Plus, Trash2, Star, ExternalLink, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { brandLinkSchema } from '../schemas/brand.schema';
import type { BrandLink, LinkType } from '../types/brand.types';

interface LinkManagerProps {
  brandId?: string;
  onRefreshStats?: () => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({ brandId, onRefreshStats }) => {
  const [links, setLinks] = useState<BrandLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [linkType, setLinkType] = useState<LinkType>('website');
  const [label, setLabel] = useState<string>('');
  const [url, setUrl] = useState<string>('https://');
  const [description, setDescription] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await brandService.listLinks(brandId);
      setLinks(data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load brand URLs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valRes = brandLinkSchema.safeParse({ link_type: linkType, label, url: url.trim(), description, is_default: isDefault });
    if (!valRes.success) {
      setError(valRes.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      await brandService.saveLink({
        brand_id: brandId,
        link_type: linkType,
        label,
        url: url.trim(),
        description,
        is_default: isDefault,
      });
      setLabel('');
      setUrl('https://');
      setDescription('');
      setIsDefault(false);
      setIsAdding(false);
      await fetchLinks();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setError(err.message || 'Failed to save brand link.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.deleteLink(id);
      setLinks(prev => prev.filter(l => l.id !== id));
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-600" />
            Validated URL Links & Compliance Endpoints
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store verified websites, 1-click unsubscribe links, and privacy policies. Automatically resolves tokens like <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-purple-700">{'{{brand.unsubscribe_url}}'}</span>.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> Add New URL
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800">Add Validated Brand URL</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
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
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Category</label>
              <select
                value={linkType}
                onChange={(e) => {
                  const val = e.target.value as LinkType;
                  setLinkType(val);
                  if (!label) {
                    if (val === 'website') setLabel('Official Homepage');
                    if (val === 'unsubscribe') setLabel('1-Click Unsubscribe Page');
                    if (val === 'preferences') setLabel('Notification Preferences');
                    if (val === 'privacy_policy') setLabel('Privacy Policy & GDPR');
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="website">Official Main Website</option>
                <option value="unsubscribe">Mandatory 1-Click Unsubscribe Link</option>
                <option value="preferences">Subscriber Preferences Portal</option>
                <option value="privacy_policy">Privacy Policy & GDPR Statement</option>
                <option value="terms">Terms of Service</option>
                <option value="support">Help Desk / Support Portal</option>
                <option value="knowledge_base">Documentation / Knowledge Base</option>
                <option value="login">User Login Dashboard</option>
                <option value="app_store">Apple App Store URL</option>
                <option value="play_store">Google Play Store URL</option>
                <option value="cta">Primary Marketing CTA Link</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Label</label>
              <input
                type="text"
                placeholder="e.g. Official Home Page"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target URL (MUST start with https://)</label>
              <div className="relative flex items-center">
                <input
                  type="url"
                  placeholder="https://supermailbox.in/unsubscribe"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-9"
                  required
                />
                {url && url.length > 8 && (
                  <div className="absolute right-2.5 flex items-center gap-1 bg-slate-100 px-1.5 py-1 rounded-lg border border-slate-200" title="Auto-fetched Website Favicon">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${url.replace(/^https?:\/\//, '').split('/')[0]}&sz=64`}
                      alt="Favicon"
                      className="w-4 h-4 rounded object-contain shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Optional Notes / Usage Instructions</label>
            <input
              type="text"
              placeholder="e.g. Include this link in all automated billing receipts"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Set as default URL for this category</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save URL Link'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Links Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading URL library...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
          <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No URL Links Added Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your main website, unsubscribe preference page, and help desk link to ensure strict email compliance and 1-click token resolution.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add First URL
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div key={link.id} className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${link.url.replace(/^https?:\/\//, '').split('/')[0]}&sz=64`}
                        alt=""
                        className="w-4 h-4 rounded object-contain shrink-0 bg-white p-0.5 border border-slate-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <h4 className="text-sm font-bold text-slate-900">{link.label}</h4>
                      {link.is_default && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 mt-0.5 block">{link.link_type.replace('_', ' ')}</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-xl border border-slate-200 transition shrink-0"
                    title="Test link in browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-purple-600 font-mono mt-3 bg-white px-3 py-2 rounded-xl border border-slate-200/80 truncate select-all">
                  {link.url}
                </p>
                {link.description && <p className="text-xs text-slate-500 mt-2">{link.description}</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-purple-700 font-bold">
                  {'{{brand.' + (link.link_type === 'unsubscribe' ? 'unsubscribe_url' : link.link_type === 'preferences' ? 'preferences_url' : 'website_url') + '}}'}
                </span>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition"
                  title="Delete URL"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
