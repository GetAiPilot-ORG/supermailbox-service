import React, { useState } from 'react';
import { Folder, FolderPlus, Star, Trash2, Image, Layers, ChevronRight, Check } from 'lucide-react';
import type { AssetFolder, AssetType } from '../types/brand.types';

interface FolderSidebarProps {
  folders: AssetFolder[];
  selectedFolderId: string | undefined;
  onSelectFolder: (folderId: string | undefined) => void;
  selectedType: AssetType | 'all';
  onSelectType: (type: AssetType | 'all') => void;
  showFavorites: boolean;
  onToggleFavorites: (show: boolean) => void;
  showTrash: boolean;
  onToggleTrash: (show: boolean) => void;
  onCreateFolder: (name: string, parentId?: string) => Promise<any>;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  selectedType,
  onSelectType,
  showFavorites,
  onToggleFavorites,
  showTrash,
  onToggleTrash,
  onCreateFolder,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setError(null);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create folder.');
    }
  };

  return (
    <div className="w-full lg:w-64 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-6 shrink-0 h-fit">
      
      {/* Quick Filter Views */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Media Categories
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => {
              onSelectType('all');
              onToggleFavorites(false);
              onToggleTrash(false);
              onSelectFolder(undefined);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              selectedType === 'all' && !showFavorites && !showTrash && !selectedFolderId
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>All Media Assets</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectType('logo');
              onToggleFavorites(false);
              onToggleTrash(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              selectedType === 'logo' && !showFavorites && !showTrash
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Image className="w-4 h-4 text-purple-500" />
              <span>Company Logos</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectType('banner');
              onToggleFavorites(false);
              onToggleTrash(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              selectedType === 'banner' && !showFavorites && !showTrash
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Image className="w-4 h-4 text-blue-500" />
              <span>Headers & Banners</span>
            </div>
          </button>

          <button
            onClick={() => {
              onToggleFavorites(true);
              onToggleTrash(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              showFavorites && !showTrash
                ? 'bg-amber-50 text-amber-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Favorites</span>
            </div>
          </button>

          <button
            onClick={() => {
              onToggleTrash(true);
              onToggleFavorites(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              showTrash
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Trash / Archived</span>
            </div>
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Folders Navigation */}
      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Asset Folders
          </h4>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-lg transition"
            title="New folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Create Folder Form Box */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-3 bg-slate-50 border border-indigo-200 rounded-xl mb-3 space-y-2">
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            {error && <p className="text-[10px] text-red-600">{error}</p>}
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          </form>
        )}

        {/* Folders List */}
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          {folders.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-3 py-2">No folders created yet.</p>
          ) : (
            folders.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  onSelectFolder(f.id);
                  onToggleFavorites(false);
                  onToggleTrash(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  selectedFolderId === f.id && !showTrash && !showFavorites
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className={`w-4 h-4 shrink-0 ${selectedFolderId === f.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{f.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
