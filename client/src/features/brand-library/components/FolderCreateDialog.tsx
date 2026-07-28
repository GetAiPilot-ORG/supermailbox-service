import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus, Loader2, AlertCircle } from 'lucide-react';
import type { AssetFolder } from '../types/brand.types';

interface FolderCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => Promise<void> | void;
  existingFolders?: AssetFolder[];
}

export const FolderCreateDialog: React.FC<FolderCreateDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingFolders = [],
}) => {
  const [folderName, setFolderName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError(null);
      setIsSubmitting(false);
      // Auto-focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();

    if (!trimmed) {
      setError('Please enter a folder name.');
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 50) {
      setError('Folder name cannot exceed 50 characters.');
      inputRef.current?.focus();
      return;
    }

    // Check for duplicates
    const duplicate = existingFolders.some(
      (f) => f.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError(`A folder named "${trimmed}" already exists.`);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create folder.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="brandLibraryRoot fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
      {/* Modal Card */}
      <div 
        className="bg-white w-full max-w-[440px] rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Create Media Folder
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Group your brand assets and marketing media.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label htmlFor="folder-name-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Folder Name
              </label>
              <input
                id="folder-name-input"
                ref={inputRef}
                type="text"
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Email Banners, Headshots, Logos"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                Folder names should be short and easy to recognize across email templates.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2.5 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderName.trim()}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Folder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
