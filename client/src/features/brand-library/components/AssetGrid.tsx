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
      <div className="bl-empty-state">
        <div className="bl-empty-state__icon">
          {searchQuery ? <SearchX size={24} /> : <Image size={24} />}
        </div>
        <h4 className="bl-empty-state__title">
          {searchQuery ? `No assets found for "${searchQuery}"` : isTrash ? 'Trash is empty' : 'No Media Assets Found'}
        </h4>
        <p className="bl-empty-state__desc">
          {searchQuery
            ? 'Try adjusting your search keywords or switching media categories.'
            : isTrash
            ? 'Archived and deleted assets will appear here before permanent deletion.'
            : 'No assets found under this filter tab. Click "All Media" or "Logos" above to view your uploaded brand media.'}
        </p>
        {!isTrash && !searchQuery && onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="bl-btn bl-btn--primary"
            style={{ margin: '0 auto' }}
          >
            <Upload size={14} style={{ marginRight: '6px' }} /> Upload First Asset
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bl-grid">
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
