import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { AssetGrid } from './AssetGrid';
import type { BrandAsset } from '../types/brand.types';

interface TrashManagerProps {
  brandId?: string;
  onRefreshStats?: () => void;
}

export const TrashManager: React.FC<TrashManagerProps> = ({ brandId, onRefreshStats }) => {
  const [trashedAssets, setTrashedAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const data = await brandService.listAssets({ brandId, trash: true });
      setTrashedAssets(data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load trashed assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [brandId]);

  const handleRestore = async (asset: BrandAsset) => {
    setError(null);
    try {
      await brandService.restoreAsset(asset.id);
      setTrashedAssets(prev => prev.filter(a => a.id !== asset.id));
      setSuccessMsg(`Restored "${asset.name}" back to active media library.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setError(err.message || 'Failed to restore asset.');
    }
  };

  const handlePermanentDelete = async (asset: BrandAsset) => {
    setError(null);
    try {
      await brandService.permanentlyDeleteAsset(asset.id, asset.cloudinary_public_id);
      setTrashedAssets(prev => prev.filter(a => a.id !== asset.id));
      setSuccessMsg(`Permanently deleted "${asset.name}" from Cloudinary and database.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setError(err.message || 'Failed to permanently delete asset.');
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Trash & Archived Brand Media
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review items removed from your active library. Restoring returns them to their original folder. Permanent deletion removes files from Cloudinary CDN storage.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Permanent Deletion Warning</span>
          Permanently deleting an asset will invalidate any email templates, automated receipts, or campaigns that still embed its Cloudinary URL. We recommend checking usage counts before deletion.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading trash contents...</div>
      ) : (
        <AssetGrid
          assets={trashedAssets}
          onSelect={() => {}}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          isTrash={true}
        />
      )}

    </div>
  );
};
