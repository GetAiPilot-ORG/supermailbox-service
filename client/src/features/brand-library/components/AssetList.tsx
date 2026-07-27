import React, { useState } from 'react';
import { Star, Copy, Check, Eye, Trash2, Image, ExternalLink, RefreshCw } from 'lucide-react';
import type { BrandAsset } from '../types/brand.types';

interface AssetListProps {
  assets: BrandAsset[];
  onSelect: (asset: BrandAsset) => void;
  onToggleFavorite?: (asset: BrandAsset) => void;
  onArchive?: (asset: BrandAsset) => void;
  onRestore?: (asset: BrandAsset) => void;
  onPermanentDelete?: (asset: BrandAsset) => void;
  isTrash?: boolean;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  onSelect,
  onToggleFavorite,
  onArchive,
  onRestore,
  onPermanentDelete,
  isTrash = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (assets.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-12">Preview</th>
              <th className="py-3 px-4">Asset Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Dimensions</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {assets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelect(asset)}
                className="hover:bg-slate-50/80 cursor-pointer transition duration-150 group"
              >
                <td className="py-2.5 px-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {asset.thumbnail_url || asset.secure_url ? (
                      <img src={asset.thumbnail_url || asset.secure_url} alt="" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Image className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{asset.name}</span>
                    {asset.is_favourite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  {asset.description && <p className="text-[11px] text-slate-400 truncate max-w-xs">{asset.description}</p>}
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                    {asset.asset_type}
                  </span>
                </td>
                <td className="py-2.5 px-4 uppercase font-semibold text-slate-500">
                  {asset.cloudinary_format || 'png'}
                </td>
                <td className="py-2.5 px-4 text-slate-500">
                  {asset.width && asset.height ? `${asset.width} × ${asset.height} px` : '—'}
                </td>
                <td className="py-2.5 px-4 text-slate-500">
                  {asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : '—'}
                </td>
                <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {!isTrash ? (
                      <>
                        {onToggleFavorite && (
                          <button
                            onClick={() => onToggleFavorite(asset)}
                            className={`p-1.5 rounded-lg transition ${
                              asset.is_favourite ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                            }`}
                            title="Toggle favorite"
                          >
                            <Star className={`w-3.5 h-3.5 ${asset.is_favourite ? 'fill-amber-500' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleCopy(e, asset.id, asset.secure_url)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 transition"
                          title="Copy Cloudinary URL"
                        >
                          {copiedId === asset.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === asset.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => onSelect(asset)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {onArchive && (
                          <button
                            onClick={() => onArchive(asset)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Move to trash"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {onRestore && (
                          <button
                            onClick={() => onRestore(asset)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <RefreshCw className="w-3 h-3" /> Restore
                          </button>
                        )}
                        {onPermanentDelete && (
                          <button
                            onClick={() => onPermanentDelete(asset)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Permanently delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
