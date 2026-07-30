import React, { useState } from 'react';
import { Star, Copy, Check, Eye, Trash2, Image, RefreshCw } from 'lucide-react';
import type { BrandAsset } from '../types/brand.types';

interface AssetCardProps {
  asset: BrandAsset;
  onSelect: (asset: BrandAsset) => void;
  onToggleFavorite?: (asset: BrandAsset) => void;
  onArchive?: (asset: BrandAsset) => void;
  onRestore?: (asset: BrandAsset) => void;
  onPermanentDelete?: (asset: BrandAsset) => void;
  isTrash?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onSelect,
  onToggleFavorite,
  onArchive,
  onRestore,
  onPermanentDelete,
  isTrash = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [useSecureFallback, setUseSecureFallback] = useState<boolean>(false);

  const isLogoOrIcon = asset.asset_type === 'logo' || asset.asset_type === 'icon' || asset.cloudinary_format === 'png' || asset.cloudinary_format === 'svg';
  const displayUrl = useSecureFallback ? (asset.secure_url || (asset as any).url) : (asset.thumbnail_url || asset.secure_url || (asset as any).url);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.secure_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onSelect(asset)}
      className={`bl-asset-card ${isTrash ? 'is-trash' : ''}`}
    >
      {/* Thumbnail Area */}
      <div className={`bl-asset-thumb ${isLogoOrIcon ? 'bl-checkerboard' : ''}`}>
        {imgError || !displayUrl ? (
          <div className="bl-asset-thumb-icon">
            <Image size={32} />
            <span>{asset.cloudinary_format || asset.asset_type}</span>
          </div>
        ) : (
          <img
            src={displayUrl}
            alt={asset.alt_text || asset.name}
            onError={() => {
              if (!useSecureFallback && asset.thumbnail_url && asset.secure_url !== asset.thumbnail_url) {
                setUseSecureFallback(true);
              } else {
                setImgError(true);
              }
            }}
            style={{ objectFit: isLogoOrIcon ? 'contain' : 'cover', width: '100%', height: '100%' }}
          />
        )}

        {/* Favorite Badge / Button */}
        {!isTrash && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(asset);
            }}
            className={`bl-asset-fav-btn ${asset.is_favourite ? 'is-fav' : ''}`}
            title={asset.is_favourite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={14} fill={asset.is_favourite ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Asset Type Badge */}
        <span className="bl-asset-type-badge">
          {asset.asset_type}
        </span>
      </div>

      {/* Card Metadata Footer */}
      <div className="bl-asset-details">
        <div>
          <p className="bl-asset-name" title={asset.name}>
            {asset.name}
          </p>
          <div className="bl-asset-meta">
            <span className="bl-asset-format">
              {asset.cloudinary_format || 'png'}
            </span>
            <span>{(asset.width && asset.height) ? `${asset.width}×${asset.height}` : (asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : '')}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="bl-asset-actions">
          {!isTrash ? (
            <>
              {/* Insert / Select Image Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(asset);
                }}
                className="bl-btn bl-btn--primary"
                style={{ padding: '4px 10px', fontSize: '11px', flex: 1, justifyContent: 'center' }}
              >
                Insert Image
              </button>

              {/* Copy URL */}
              <button
                onClick={handleCopyUrl}
                className="bl-asset-action-btn"
                title="Copy secure Cloudinary URL"
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                {copied ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'URL'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* View Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(asset);
                  }}
                  className="bl-asset-icon-btn"
                  title="View details and transformations"
                >
                  <Eye size={14} />
                </button>

                {/* Move to Trash */}
                {onArchive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(asset);
                    }}
                    className="bl-asset-icon-btn danger"
                    title="Move asset to Trash"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Restore Button */}
              {onRestore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(asset);
                  }}
                  className="bl-asset-action-btn"
                  style={{ color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                  title="Restore asset from Trash"
                >
                  <RefreshCw size={12} /> Restore
                </button>
              )}

              {/* Permanent Delete Button */}
              {onPermanentDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPermanentDelete(asset);
                  }}
                  className="bl-asset-icon-btn danger"
                  title="Permanently delete asset"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
