import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Check, Eye } from 'lucide-react';
import { brandService } from '../services/brand.service';
import type { BrandFooter } from '../types/brand.types';

interface FooterManagerProps {
  brandId?: string;
}

export const FooterManager: React.FC<FooterManagerProps> = ({ brandId }) => {
  const [footers, setFooters] = useState<BrandFooter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchFooters = async () => {
    setLoading(true);
    try {
      const data = await brandService.listFooters(brandId);
      setFooters(data || []);
    } catch (err) {
      console.warn('Could not load footers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooters();
  }, [brandId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !html.trim()) return;
    setSaving(true);
    try {
      await brandService.saveSavedBlock({
        brand_id: brandId,
        name: name.trim(),
        category: 'footer',
        document_json: { type: 'footer', html },
        rendered_preview: html,
        is_favourite: isDefault,
      });
      setName('');
      setHtml('');
      setIsAdding(false);
      await fetchFooters();
    } catch (err) {
      console.error('Failed to save footer:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            CAN-SPAM & GDPR Compliance Footers
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store mandatory legal footers, unsubscribe links, and company addresses. Guaranteed compliance for all promotional email campaigns.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> New Footer
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Create Compliance Footer</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer Name</label>
              <input
                type="text"
                placeholder="e.g. 2026 GDPR Standard Footer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Set as Default Footer</label>
              <label className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Automatically attach to new email layouts</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Footer HTML (Support merge tags like {'{{brand.company_address}}'})</label>
            <textarea
              rows={5}
              placeholder='<div style="font-size: 11px; color: #777; text-align: center;"><p>© {{current_year}} {{brand.company_name}}. All rights reserved.</p><p>{{brand.company_address}}</p><p><a href="{{brand.unsubscribe_url}}">Unsubscribe</a></p></div>'
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Footer'}</span>
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading compliance footers...</div>
      ) : footers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
          <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Compliance Footers Configured</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create standard CAN-SPAM and GDPR legal footers with unsubscribe links and corporate physical addresses.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Standard Footer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {footers.map((f) => (
            <div key={f.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                  {f.is_default && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Default</span>}
                </div>
                <div 
                  className="p-4 bg-white rounded-xl border border-slate-200/80 text-xs overflow-x-auto max-h-40"
                  dangerouslySetInnerHTML={{ __html: f.rendered_html || '<em>No HTML preview</em>' }}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                <span className="text-[10px] text-slate-400 font-mono">ID: {f.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
