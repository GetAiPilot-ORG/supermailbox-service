import React, { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { brandSocialProfileSchema } from '../schemas/brand.schema';
import type { BrandSocialProfile } from '../types/brand.types';

interface SocialProfileManagerProps {
  brandId?: string;
}

export const SocialProfileManager: React.FC<SocialProfileManagerProps> = ({ brandId }) => {
  const [profiles, setProfiles] = useState<BrandSocialProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [platform, setPlatform] = useState<string>('LinkedIn');
  const [username, setUsername] = useState<string>('');
  const [url, setUrl] = useState<string>('https://linkedin.com/company/');
  const [displayLabel, setDisplayLabel] = useState<string>('Follow on LinkedIn');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await brandService.listSocialProfiles(brandId);
      setProfiles(data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load social profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valRes = brandSocialProfileSchema.safeParse({ platform, username, url: url.trim(), display_label: displayLabel });
    if (!valRes.success) {
      setError(valRes.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      await brandService.saveSocialProfile({
        brand_id: brandId,
        platform,
        username,
        url: url.trim(),
        display_label: displayLabel,
      });
      setUsername('');
      setUrl('https://');
      setIsAdding(false);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to save social profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.deleteSocialProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete social profile:', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Social Media Profiles & Follow Links
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store official corporate social media profiles to automatically populate social icon footers in email templates.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> Add Social Account
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">Connect Social Profile</h4>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => {
                  const val = e.target.value;
                  setPlatform(val);
                  if (val === 'LinkedIn') setUrl('https://linkedin.com/company/');
                  if (val === 'X / Twitter') setUrl('https://twitter.com/');
                  if (val === 'YouTube') setUrl('https://youtube.com/@');
                  if (val === 'Instagram') setUrl('https://instagram.com/');
                  if (val === 'Facebook') setUrl('https://facebook.com/');
                  if (val === 'GitHub') setUrl('https://github.com/');
                  setDisplayLabel(`Follow on ${val}`);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="X / Twitter">X (Twitter)</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Discord">Discord</option>
                <option value="GitHub">GitHub</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username / Handle</label>
              <input
                type="text"
                placeholder="e.g. @supermailbox"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/company/supermailbox"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Profiles Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading social accounts...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
          <Share2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Social Profiles Added</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Connect LinkedIn, Twitter, and YouTube to add clean, clickable social icons to the footer of your email newsletters.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Social Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.platform}</h4>
                    {p.username && <span className="text-xs text-slate-500 font-mono mt-0.5 block">{p.username}</span>}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition shrink-0"
                    title="Open profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-blue-600 font-mono mt-3 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 truncate">
                  {p.url}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">{p.display_label || p.platform}</span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition"
                  title="Remove account"
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
