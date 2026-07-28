import React, { useState } from 'react';
import { Image, Link2, FileText, Phone, Star, HardDrive, ArrowUpRight, Plus, Eye, Tag } from 'lucide-react';
import type { BrandOverviewStats, BrandAsset } from '../types/brand.types';

interface BrandOverviewProps {
  stats: BrandOverviewStats | null;
  onSelectTab: (tab: string) => void;
  onSelectAsset: (asset: BrandAsset) => void;
  onOpenUpload: () => void;
}

// Helper component for robust image rendering with checkerboard & onError fallback
const OverviewAssetThumb: React.FC<{ asset: BrandAsset }> = ({ asset }) => {
  const [imgError, setImgError] = useState(false);
  const [useSecureFallback, setUseSecureFallback] = useState(false);

  const isLogo = asset.asset_type === 'logo' || asset.asset_type === 'icon' || asset.cloudinary_format === 'svg' || asset.cloudinary_format === 'png';
  const displayUrl = useSecureFallback ? asset.secure_url : (asset.thumbnail_url || asset.secure_url);

  if (imgError || !displayUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1 p-2">
        <Image className="w-8 h-8" />
        <span className="text-[10px] uppercase font-bold text-slate-400">{asset.cloudinary_format || asset.asset_type}</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center p-3 overflow-hidden relative ${isLogo ? 'bl-checkerboard' : 'bg-slate-100'}`}>
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
          isLogo ? 'object-contain' : 'object-cover w-full h-full'
        }`}
      />
      {asset.is_favourite && (
        <span className="absolute top-2 right-2 p-1 bg-white/90 rounded shadow-2xs z-10">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
        </span>
      )}
      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-2xs z-10">
        {asset.asset_type}
      </span>
    </div>
  );
};

export const BrandOverview: React.FC<BrandOverviewProps> = ({
  stats,
  onSelectTab,
  onSelectAsset,
  onOpenUpload,
}) => {
  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fadeIn w-full min-w-0">
      
      {/* 1. Top Summary Grid: 4 cols on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        
        {/* Card 1: Media & Logos */}
        <div 
          onClick={() => onSelectTab('assets')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-lg p-4 shadow-2xs hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
              <Image className="w-4 h-4" />
            </div>
            <span className="text-slate-400 group-hover:text-indigo-600 transition">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalAssets}</h3>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Media Assets & Logos</p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
              <HardDrive className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{stats.storageFormatted} Cloudinary storage</span>
            </div>
          </div>
        </div>

        {/* Card 2: Contacts & Info */}
        <div 
          onClick={() => onSelectTab('contacts')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-lg p-4 shadow-2xs hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-slate-400 group-hover:text-indigo-600 transition">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.contactsCount}</h3>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Brand Contacts & Info</p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
              <span className="truncate">Support emails, phones & addresses</span>
            </div>
          </div>
        </div>

        {/* Card 3: URL Library */}
        <div 
          onClick={() => onSelectTab('links')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-lg p-4 shadow-2xs hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-slate-400 group-hover:text-indigo-600 transition">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.linksCount}</h3>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Validated URL Links</p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
              <span className="truncate">Websites, unsubscribe & CTA links</span>
            </div>
          </div>
        </div>

        {/* Card 4: Text Snippets */}
        <div 
          onClick={() => onSelectTab('snippets')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-lg p-4 shadow-2xs hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-slate-400 group-hover:text-indigo-600 transition">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.snippetsCount}</h3>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Content Snippets & Tokens</p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
              <span className="truncate">Disclaimers, signatures & legal footers</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Recently Added Assets Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Recently Added Brand Assets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any card to open Cloudinary transformations, copy embed URLs, or inspect metadata.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('assets')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition self-start sm:self-center shrink-0"
          >
            View All in Gallery →
          </button>
        </div>

        {stats.recentAssets.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 my-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3 border border-indigo-100">
              <Image className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No Media Assets Uploaded Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Upload your company logo, email headers, banners, or product images to Cloudinary to start embedding them in email templates.
            </p>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Upload First Asset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.recentAssets.slice(0, 8).map((asset) => (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="group relative bg-white border border-slate-200 hover:border-indigo-400 rounded-lg overflow-hidden cursor-pointer transition shadow-2xs hover:shadow-xs flex flex-col"
              >
                <div className="h-40 w-full overflow-hidden relative border-b border-slate-100">
                  <OverviewAssetThumb asset={asset} />
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span className="uppercase font-semibold text-slate-400">{asset.cloudinary_format || asset.asset_type}</span>
                      <span>{(asset.width && asset.height) ? `${asset.width}×${asset.height}` : (asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : '')}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-semibold group-hover:text-indigo-700">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {asset.usage_count ? `${asset.usage_count} uses` : '0 uses'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
