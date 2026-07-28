import React from 'react';
import { AssetCard } from './AssetCard';
import { Image, Upload, SearchX } from 'lucide-react';
import type { BrandAsset } from '../types/brand.types';

interface AssetGridProps {
  assets: BrandAsset[];
  onSelect: (asset: BrandAsset) => void;
  onToggleFavorite?: (asset: BrandAsset) => void;
  onArchive?: (asset: BrandAsset) => void;
  onRestore?: (asset: BrandAsset) => void;
  onPermanentDelete?: (asset: BrandAsset) => void;
  onOpenUpload?: () => void;
  isTrash?: boolean;
  searchQuery?: string;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  onSelect,
  onToggleFavorite,
  onArchive,
  onRestore,
  onPermanentDelete,
  onOpenUpload,
  isTrash = false,
  searchQuery = '',
}) => {
  if (assets.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          {searchQuery ? <SearchX className="w-6 h-6" /> : <Image className="w-6 h-6" />}
        </div>
        <h4 className="text-base font-bold text-slate-800">
          {searchQuery ? `No assets found for "${searchQuery}"` : isTrash ? 'Trash is empty' : 'No Media Assets Found'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          {searchQuery
            ? 'Try adjusting your search keywords or switching media categories.'
            : isTrash
            ? 'Archived and deleted assets will appear here before permanent deletion.'
            : 'Upload your company logo, banners, icons, and product photos to start embedding them in email designs.'}
        </p>
        {!isTrash && !searchQuery && onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload First Asset
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 animate-fadeIn">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          onArchive={onArchive}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          isTrash={isTrash}
        />
      ))}
    </div>
  );
};
