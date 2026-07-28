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
  const displayUrl = useSecureFallback ? asset.secure_url : (asset.thumbnail_url || asset.secure_url);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.secure_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onSelect(asset)}
      className={`group relative bg-white border rounded-lg overflow-hidden transition duration-200 flex flex-col cursor-pointer shadow-2xs hover:shadow-xs ${
        isTrash 
          ? 'border-red-200/80 bg-red-50/10 opacity-80 hover:opacity-100' 
          : 'border-slate-200 hover:border-indigo-400'
      }`}
    >
      {/* Thumbnail Area with Checkerboard for transparent assets & onError handling */}
      <div className={`h-36 w-full flex items-center justify-center p-3 overflow-hidden relative border-b border-slate-100 ${
        isLogoOrIcon ? 'bl-checkerboard' : 'bg-slate-100'
      }`}>
        {imgError || !displayUrl ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2">
            <Image className="w-8 h-8 text-slate-300" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {asset.cloudinary_format || asset.asset_type}
            </span>
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
            className={`max-h-full max-w-full transition duration-300 group-hover:scale-105 ${
              isLogoOrIcon ? 'object-contain' : 'object-cover w-full h-full'
            }`}
          />
        )}

        {/* Favorite Badge / Button */}
        {!isTrash && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(asset);
            }}
            className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-md transition shadow-2xs z-10 cursor-pointer ${
              asset.is_favourite 
                ? 'bg-amber-50 text-amber-500 opacity-100 border border-amber-200' 
                : 'bg-white/90 text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 border border-slate-200/80'
            }`}
            title={asset.is_favourite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${asset.is_favourite ? 'fill-amber-500' : ''}`} />
          </button>
        )}

        {/* Asset Type Badge */}
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-2xs z-10">
          {asset.asset_type}
        </span>
      </div>

      {/* Card Metadata Footer */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition" title={asset.name}>
            {asset.name}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold uppercase text-[9px] text-slate-600 tracking-wider">
              {asset.cloudinary_format || 'png'}
            </span>
            <span>{(asset.width && asset.height) ? `${asset.width}×${asset.height}` : (asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : '')}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          {!isTrash ? (
            <>
              {/* Copy URL */}
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 hover:bg-indigo-50/80 text-slate-600 hover:text-indigo-700 text-[11px] font-semibold transition border border-slate-200/80 hover:border-indigo-200 cursor-pointer"
                title="Copy secure Cloudinary URL"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>

              <div className="flex items-center gap-1">
                {/* View Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(asset);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                  title="View details and transformations"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Move to Trash */}
                {onArchive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(asset);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Move asset to Trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold transition cursor-pointer"
                  title="Restore asset from Trash"
                >
                  <RefreshCw className="w-3 h-3" /> Restore
                </button>
              )}

              {/* Permanent Delete Button */}
              {onPermanentDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPermanentDelete(asset);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                  title="Permanently delete asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
