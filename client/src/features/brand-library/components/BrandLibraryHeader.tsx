import React from 'react';
import { Upload, FolderPlus, Folder, Building2 } from 'lucide-react';
import type { Brand } from '../types/brand.types';

interface BrandLibraryHeaderProps {
  brands: Brand[];
  activeBrand: Brand | null;
  onSelectBrand: (brandId: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  showMediaActions?: boolean;
}

export const BrandLibraryHeader: React.FC<BrandLibraryHeaderProps> = ({
  brands,
  activeBrand,
  onSelectBrand,
  onOpenUpload,
  onOpenNewFolder,
  showMediaActions = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full pb-4 border-b border-slate-200/80">
      {/* Left Title & Description */}
      <div className="relative z-10">
        <span className="screen-kicker">
          <Folder className="w-3.5 h-3.5" /> CPaaS Brand Repository
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Brand & Media
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Manage reusable logos, images, contact details, links and brand content for email templates.
        </p>
      </div>

      {/* Right Action Controls */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
        {/* Brand Workspace Selector */}
        {brands.length > 1 && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={activeBrand?.id || ''}
              onChange={(e) => onSelectBrand(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Media Specific Actions (Only visible on Assets / Media tab) */}
        {showMediaActions && (
          <>
            {/* New Folder Button */}
            <button
              onClick={onOpenNewFolder}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 transition shadow-2xs cursor-pointer"
              title="Create new asset folder"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>New Folder</span>
            </button>

            {/* Upload Asset Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Asset</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
