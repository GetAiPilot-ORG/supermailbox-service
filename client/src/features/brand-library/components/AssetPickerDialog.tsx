import React, { useState, useEffect } from 'react';
import { X, Search, Image, Upload, Layers, Star, Folder } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { AssetGrid } from './AssetGrid';
import { AssetUploadDialog } from './AssetUploadDialog';
import type { BrandAsset, AssetFolder, AssetType } from '../types/brand.types';

interface AssetPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: BrandAsset) => void;
  brandId?: string;
  initialAssetType?: AssetType | 'all';
}

export const AssetPickerDialog: React.FC<AssetPickerDialogProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  brandId,
  initialAssetType = 'all',
}) => {
  if (!isOpen) return null;

  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>(initialAssetType);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const fetchAssetsAndFolders = async () => {
    setLoading(true);
    try {
      const [assetList, folderList] = await Promise.all([
        brandService.listAssets({
          brandId,
          type: selectedType === 'all' ? undefined : selectedType,
          folderId: selectedFolderId,
          search: searchQuery || undefined,
          favourite: showFavorites ? true : undefined,
        }),
        brandService.listFolders(brandId),
      ]);
      setAssets(assetList || []);
      setFolders(folderList || []);
    } catch (err) {
      console.error('Failed to fetch assets for picker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssetsAndFolders();
    }
  }, [isOpen, brandId, selectedType, selectedFolderId, showFavorites, searchQuery]);

  const handleUploadComplete = (newAsset: BrandAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    setIsUploadOpen(false);
    onSelectAsset(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded max-w-5xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Select Brand Media Asset</h3>
              <p className="text-xs text-slate-500 font-medium">Choose a Cloudinary asset to insert into your template canvas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bl-btn bl-btn--primary"
            >
              <Upload className="w-3.5 h-3.5" /> Upload New
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setSelectedType('all'); setShowFavorites(false); setSelectedFolderId(undefined); }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                selectedType === 'all' && !showFavorites && !selectedFolderId ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Media
            </button>
            <button
              onClick={() => { setSelectedType('logo'); setShowFavorites(false); }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                selectedType === 'logo' && !showFavorites ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Logos
            </button>
            <button
              onClick={() => { setSelectedType('banner'); setShowFavorites(false); }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                selectedType === 'banner' && !showFavorites ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Banners
            </button>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                showFavorites ? 'bg-amber-500 text-white shadow-xs font-bold' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> Favorites
            </button>
          </div>

          <div className="flex items-center gap-2">
            {folders.length > 0 && (
              <select
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || undefined)}
                className="bl-select w-40"
              >
                <option value="">All Folders</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bl-input pl-8 pr-3 py-1.5 w-48"
              />
            </div>
          </div>
        </div>

        {/* Modal Body / Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading asset library...</div>
          ) : (
            <AssetGrid
              assets={assets}
              onSelect={(asset) => {
                onSelectAsset(asset);
                onClose();
              }}
              onOpenUpload={() => setIsUploadOpen(true)}
              searchQuery={searchQuery}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Click any media card to embed its secure Cloudinary URL into your design canvas.</span>
          <button
            onClick={onClose}
            className="bl-btn bl-btn--secondary"
          >
            Cancel
          </button>
        </div>

      </div>

      <AssetUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        activeBrandId={brandId}
        defaultFolderId={selectedFolderId}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};
