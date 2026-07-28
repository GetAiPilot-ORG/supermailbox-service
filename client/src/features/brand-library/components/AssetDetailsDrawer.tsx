import React, { useState } from 'react';
import { X, Copy, Check, Star, Trash2, ExternalLink, Sliders, Image, Tag, Save, Edit3 } from 'lucide-react';
import { clientCloudinaryService } from '../services/cloudinary.service';
import type { BrandAsset } from '../types/brand.types';

interface AssetDetailsDrawerProps {
  asset: BrandAsset | null;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<BrandAsset>) => Promise<any>;
  onArchive?: (asset: BrandAsset) => void;
}

export const AssetDetailsDrawer: React.FC<AssetDetailsDrawerProps> = ({
  asset,
  onClose,
  onUpdate,
  onArchive,
}) => {
  if (!asset) return null;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(asset.name);
  const [description, setDescription] = useState<string>(asset.description || '');
  const [altText, setAltText] = useState<string>(asset.alt_text || '');
  const [tagsInput, setTagsInput] = useState<string>((asset.tags || []).join(', '));
  const [saving, setSaving] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedTransformed, setCopiedTransformed] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  // Cloudinary Transformation options
  const [transformWidth, setTransformWidth] = useState<number>(asset.width && asset.width > 600 ? 600 : (asset.width || 600));
  const [transformFormat, setTransformFormat] = useState<string>('auto');
  const [transformQuality, setTransformQuality] = useState<string>('auto');

  const transformedUrl = clientCloudinaryService.getTransformedUrl(asset.secure_url, {
    width: transformWidth,
    format: transformFormat as any,
    quality: transformQuality as any,
  });

  const isLogoOrIcon = asset.asset_type === 'logo' || asset.asset_type === 'icon' || asset.cloudinary_format === 'png' || asset.cloudinary_format === 'svg';

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) return;
    setSaving(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await onUpdate(asset.id, { name, description, alt_text: altText, tags });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update asset:', err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: 'original' | 'transformed') => {
    navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedTransformed(true);
      setTimeout(() => setCopiedTransformed(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-[440px] bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-indigo-100 text-indigo-700">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Asset Details</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{asset.asset_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Preview Image Box */}
          <div className={`rounded-lg p-4 border border-slate-200 flex items-center justify-center min-h-[220px] max-h-[280px] overflow-hidden relative group ${
            isLogoOrIcon ? 'bl-checkerboard' : 'bg-slate-100'
          }`}>
            {imgError ? (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <Image className="w-10 h-10 text-slate-300" />
                <span className="text-xs font-semibold text-slate-500">Preview Unavailable</span>
              </div>
            ) : (
              <img
                src={asset.secure_url}
                alt={asset.alt_text || asset.name}
                onError={() => setImgError(true)}
                className={`max-h-full max-w-full drop-shadow-2xs ${
                  isLogoOrIcon ? 'object-contain' : 'object-cover'
                }`}
              />
            )}
            <a
              href={asset.secure_url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition shadow-md"
            >
              <span>Open Raw</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Metadata Edit Form vs Read View */}
          {isEditing ? (
            <form onSubmit={handleSaveMetadata} className="space-y-3.5 bg-slate-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Edit Asset Metadata</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text (Accessibility)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe image for screen readers..."
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes or usage guidelines..."
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="logo, header, dark-mode..."
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">{asset.name}</h4>
                  {asset.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{asset.description}</p>}
                </div>
                {onUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition shrink-0 border border-indigo-100 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Info
                  </button>
                )}
              </div>

              {asset.alt_text && (
                <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                  <span className="font-bold text-slate-800">Alt Text:</span> <span className="italic">"{asset.alt_text}"</span>
                </div>
              )}

              {/* Tags List */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {asset.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Read-Only Definition List for Cloudinary Media Specs */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Media Specifications
            </h4>
            <dl className="divide-y divide-slate-100 text-xs border border-slate-200 rounded-lg bg-slate-50/60 px-3.5 py-1">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 font-medium">Dimensions</dt>
                <dd className="font-bold text-slate-800">{asset.width && asset.height ? `${asset.width} × ${asset.height} px` : 'Unknown'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 font-medium">File Size</dt>
                <dd className="font-bold text-slate-800">{asset.bytes ? `${(asset.bytes / 1024).toFixed(1)} KB` : 'Unknown'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 font-medium">Format</dt>
                <dd className="font-bold text-slate-800 uppercase">{asset.cloudinary_format || 'png'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 font-medium">Usage Count</dt>
                <dd className="font-bold text-slate-800">{asset.usage_count || 0} times embedded</dd>
              </div>
            </dl>
          </div>

          <hr className="border-slate-100" />

          {/* Secure Raw Cloudinary URL Row (Labelled read-only row, NOT an input box) */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Secure Cloudinary URL
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-700 font-mono bl-word-break block select-all leading-relaxed">
                  {asset.secure_url}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(asset.secure_url, 'original')}
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 shadow-2xs transition shrink-0"
                title="Copy secure raw URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Cloudinary On-The-Fly Transformation Generator */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Transformation URL Generator
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">On-The-Fly</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Optimize image rendering without duplicating storage. Select width and quality:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Width</label>
                <select
                  value={transformWidth}
                  onChange={(e) => setTransformWidth(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-md text-xs px-2 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={600}>600px (Email)</option>
                  <option value={300}>300px (Thumb)</option>
                  <option value={120}>120px (Icon)</option>
                  <option value={800}>800px (Banner)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Format</label>
                <select
                  value={transformFormat}
                  onChange={(e) => setTransformFormat(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md text-xs px-2 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="auto">Auto (WebP/AVIF)</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Quality</label>
                <select
                  value={transformQuality}
                  onChange={(e) => setTransformQuality(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md text-xs px-2 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="auto">Auto (Optimal)</option>
                  <option value="80">80%</option>
                  <option value="60">60%</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => copyToClipboard(transformedUrl, 'transformed')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition shadow-2xs"
              >
                {copiedTransformed ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTransformed ? 'Transformed URL Copied!' : 'Copy Transformed URL'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
            ID: {asset.cloudinary_public_id}
          </span>
          {onArchive && (
            <button
              onClick={() => {
                onArchive(asset);
                onClose();
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Move to Trash
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
