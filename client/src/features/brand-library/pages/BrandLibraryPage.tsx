import React, { useState, useEffect } from 'react';
import { 
  Layers, Image, Phone, Link2, Share2, Palette, FileText, PenTool, 
  Shield, LayoutGrid, Trash2, LayoutList, Grid, AlertCircle, Search, FolderPlus, Upload, Star
} from 'lucide-react';
import { useBrandLibrary } from '../hooks/useBrandLibrary';
import { brandService } from '../services/brand.service';
import type { BrandAsset, AssetType } from '../types/brand.types';
import '../brand-library.css';

// Child Components
import { BrandLibraryHeader } from '../components/BrandLibraryHeader';
import { BrandOverview } from '../components/BrandOverview';
import { AssetGrid } from '../components/AssetGrid';
import { AssetList } from '../components/AssetList';
import { AssetDetailsDrawer } from '../components/AssetDetailsDrawer';
import { AssetUploadDialog } from '../components/AssetUploadDialog';
import { FolderCreateDialog } from '../components/FolderCreateDialog';
import { ContactManager } from '../components/ContactManager';
import { LinkManager } from '../components/LinkManager';
import { SocialProfileManager } from '../components/SocialProfileManager';
import { BrandStyleEditor } from '../components/BrandStyleEditor';
import { SnippetManager } from '../components/SnippetManager';
import { SignatureManager } from '../components/SignatureManager';
import { FooterManager } from '../components/FooterManager';
import { SavedBlockManager } from '../components/SavedBlockManager';
import { TrashManager } from '../components/TrashManager';

export const BrandLibraryPage: React.FC = () => {
  const {
    brands,
    activeBrand,
    folders,
    overview,
    loading: libraryLoading,
    error: libraryError,
    selectBrand,
    createFolder,
    refreshOverview,
    refreshAll,
  } = useBrandLibrary();

  // Workspace Navigation Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Media Gallery Filter State
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [showTrash, setShowTrash] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Drawers State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState<boolean>(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<BrandAsset | null>(null);

  // Fetch media when on 'assets' tab
  const fetchMedia = async () => {
    if (activeTab !== 'assets' && activeTab !== 'overview') return;
    setMediaLoading(true);
    try {
      const list = await brandService.listAssets({
        brandId: activeBrand?.id,
        type: selectedType === 'all' ? undefined : selectedType,
        folderId: selectedFolderId,
        search: searchQuery || undefined,
        favourite: showFavorites ? true : undefined,
        trash: showTrash ? true : undefined,
      });
      setAssets(list || []);
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    if (activeTab === 'overview') {
      refreshOverview();
    }
  }, [activeBrand, activeTab, selectedType, selectedFolderId, showFavorites, showTrash, searchQuery]);

  // Asset Actions
  const handleToggleFavorite = async (asset: BrandAsset) => {
    try {
      const updated = await brandService.updateAsset(asset.id, { is_favourite: !asset.is_favourite });
      setAssets(prev => prev.map(a => a.id === asset.id ? updated : a));
      refreshOverview();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleArchive = async (asset: BrandAsset) => {
    try {
      await brandService.archiveAsset(asset.id);
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (selectedAssetForDetails?.id === asset.id) setSelectedAssetForDetails(null);
      refreshOverview();
    } catch (err) {
      console.error('Failed to archive asset:', err);
    }
  };

  const handleUpdateAsset = async (id: string, updates: Partial<BrandAsset>) => {
    try {
      const updated = await brandService.updateAsset(id, updates);
      setAssets(prev => prev.map(a => a.id === id ? updated : a));
      setSelectedAssetForDetails(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const handleUploadComplete = (newAsset: BrandAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    setIsUploadOpen(false);
    refreshOverview();
  };

  const navTabs = [
    { id: 'overview', label: 'Overview & Stats', icon: Layers },
    { id: 'assets', label: 'Media & Logos', icon: Image, count: overview?.totalAssets },
    { id: 'contacts', label: 'Contacts & Address', icon: Phone, count: overview?.contactsCount },
    { id: 'links', label: 'URL Library', icon: Link2, count: overview?.linksCount },
    { id: 'social', label: 'Social Profiles', icon: Share2, count: overview?.socialProfilesCount },
    { id: 'styles', label: 'Design Tokens & Colors', icon: Palette },
    { id: 'snippets', label: 'Content Snippets', icon: FileText, count: overview?.snippetsCount },
    { id: 'signatures', label: 'Signatures', icon: PenTool },
    { id: 'footers', label: 'Legal Footers', icon: Shield },
    { id: 'blocks', label: 'Saved Blocks', icon: LayoutGrid },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="screen-page font-sans text-slate-800 pb-20">
      <div className="brandLibraryRoot w-full flex flex-col gap-6">
        
        {/* 1. Header & Controls */}
        <BrandLibraryHeader
          brands={brands}
          activeBrand={activeBrand}
          onSelectBrand={selectBrand}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenNewFolder={() => {
            setActiveTab('assets');
            setIsNewFolderOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (activeTab === 'overview') setActiveTab('assets');
          }}
          onRefresh={refreshAll}
          loading={libraryLoading}
          showMediaActions={activeTab === 'assets'}
        />

        {/* 2. Global Error Alert */}
        {libraryError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-red-800 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Workspace Error: {libraryError}</span>
          </div>
        )}

        {/* 3. Responsive 2-Column Workspace Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          
          {/* Left Navigation Sidebar (Desktop: Vertical List, Mobile/Tablet: Dropdown) */}
          <div className="w-full lg:w-56 shrink-0">
            {/* Mobile/Tablet Dropdown Selector (< 1024px) */}
            <div className="lg:hidden bg-white p-3 rounded-lg border border-slate-200 shadow-2xs mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Library Section
              </label>
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  if (e.target.value === 'assets') setShowTrash(false);
                  else if (e.target.value === 'trash') setShowTrash(true);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {navTabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} {t.count !== undefined && t.count > 0 ? `(${t.count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Vertical Menu (>= 1024px) */}
            <div className="hidden lg:flex flex-col gap-1 pr-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </div>
              {navTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id);
                      if (t.id === 'assets') setShowTrash(false);
                      else if (t.id === 'trash') setShowTrash(true);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-semibold transition text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-700 font-bold border border-indigo-100/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{t.label}</span>
                    </div>
                    {t.count !== undefined && t.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <BrandOverview
                stats={overview}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  if (tab === 'assets') setShowTrash(false);
                }}
                onSelectAsset={(asset) => setSelectedAssetForDetails(asset)}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}

            {/* TAB 2: MEDIA & LOGOS (WITH DEDICATED TOOLBAR) */}
            {activeTab === 'assets' && (
              <div className="space-y-4 w-full min-w-0 animate-fadeIn">
                {/* Dedicated Content Toolbar */}
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
                  {/* Left: Search assets */}
                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search media assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Middle: Type filter, Folder filter, Favorites toggle */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="logo">Company Logos</option>
                      <option value="banner">Marketing Banners</option>
                      <option value="icon">Brand Icons</option>
                      <option value="image">Product/Marketing Images</option>
                      <option value="document">Documents / Other</option>
                    </select>

                    <select
                      value={selectedFolderId || ''}
                      onChange={(e) => setSelectedFolderId(e.target.value ? e.target.value : undefined)}
                      className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">All Folders</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setShowFavorites(!showFavorites)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition ${
                        showFavorites ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${showFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>Favorites</span>
                    </button>
                  </div>

                  {/* Right: Grid/list toggle, New folder, Upload asset */}
                  <div className="flex items-center justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                        title="Grid view"
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                        title="List view"
                      >
                        <LayoutList className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const name = window.prompt('Enter new folder name:');
                        if (name && name.trim()) {
                          createFolder(name.trim());
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 transition shadow-2xs"
                      title="New Folder"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">New Folder</span>
                    </button>

                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Upload</span>
                    </button>
                  </div>
                </div>

                {/* Active Gallery Display */}
                {mediaLoading ? (
                  <div className="py-16 text-center text-xs text-slate-400 font-semibold bg-white rounded-lg border border-slate-200">
                    <div className="spin-loader mx-auto mb-2"></div>
                    Loading media assets...
                  </div>
                ) : viewMode === 'grid' ? (
                  <AssetGrid
                    assets={assets}
                    onSelect={(asset) => setSelectedAssetForDetails(asset)}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                    onOpenUpload={() => setIsUploadOpen(true)}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <AssetList
                    assets={assets}
                    onSelect={(asset) => setSelectedAssetForDetails(asset)}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                  />
                )}
              </div>
            )}

            {/* TAB 3: CONTACTS & ADDRESS */}
            {activeTab === 'contacts' && (
              <ContactManager brandId={activeBrand?.id} onRefreshStats={refreshOverview} />
            )}

            {/* TAB 4: URL LIBRARY */}
            {activeTab === 'links' && (
              <LinkManager brandId={activeBrand?.id} onRefreshStats={refreshOverview} />
            )}

            {/* TAB 5: SOCIAL PROFILES */}
            {activeTab === 'social' && (
              <SocialProfileManager brandId={activeBrand?.id} onRefreshStats={refreshOverview} />
            )}

            {/* TAB 6: DESIGN TOKENS & STYLES */}
            {activeTab === 'styles' && (
              <BrandStyleEditor brandId={activeBrand?.id} />
            )}

            {/* TAB 7: SNIPPETS & TOKENS */}
            {activeTab === 'snippets' && (
              <SnippetManager brandId={activeBrand?.id} onRefreshStats={refreshOverview} />
            )}

            {/* TAB 8: SIGNATURES */}
            {activeTab === 'signatures' && (
              <SignatureManager brandId={activeBrand?.id} />
            )}

            {/* TAB 9: LEGAL FOOTERS */}
            {activeTab === 'footers' && (
              <FooterManager brandId={activeBrand?.id} />
            )}

            {/* TAB 10: SAVED BLOCKS */}
            {activeTab === 'blocks' && (
              <SavedBlockManager brandId={activeBrand?.id} />
            )}

            {/* TAB 11: TRASH */}
            {activeTab === 'trash' && (
              <TrashManager brandId={activeBrand?.id} onRefreshStats={refreshOverview} />
            )}

          </div>
        </div>

        {/* 5. Interactive Modals & Drawers */}
        <AssetUploadDialog
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          folders={folders}
          activeBrandId={activeBrand?.id}
          defaultFolderId={selectedFolderId}
          onUploadComplete={handleUploadComplete}
        />

        <FolderCreateDialog
          isOpen={isNewFolderOpen}
          onClose={() => setIsNewFolderOpen(false)}
          onSubmit={async (name) => {
            await createFolder(name);
          }}
          existingFolders={folders}
        />

        <AssetDetailsDrawer
          asset={selectedAssetForDetails}
          onClose={() => setSelectedAssetForDetails(null)}
          onUpdate={handleUpdateAsset}
          onArchive={handleArchive}
        />

      </div>
    </div>
  );
};

export default BrandLibraryPage;
