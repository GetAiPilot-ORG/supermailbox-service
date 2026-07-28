import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Folder, Image } from 'lucide-react';
import { useAssetUpload } from '../hooks/useAssetUpload';
import type { AssetFolder, AssetType, BrandAsset } from '../types/brand.types';

interface AssetUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folders: AssetFolder[];
  activeBrandId?: string;
  defaultFolderId?: string;
  onUploadComplete?: (asset: BrandAsset) => void;
}

export const AssetUploadDialog: React.FC<AssetUploadDialogProps> = ({
  isOpen,
  onClose,
  folders,
  activeBrandId,
  defaultFolderId,
  onUploadComplete,
}) => {
  if (!isOpen) return null;

  const { upload, isUploading, progress, error, uploadedAsset, reset } = useAssetUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<AssetType>('image');
  const [folderId, setFolderId] = useState<string>(defaultFolderId || '');
  const [customName, setCustomName] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    setValidationError(null);
    reset();

    // Size check: 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds the maximum allowed limit of 10MB.');
      return;
    }

    // Format check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'application/pdf'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.svg') && !file.name.endsWith('.ico')) {
      setValidationError(`Unsupported file type: "${file.type || file.name}". Allowed: JPG, PNG, WebP, GIF, SVG, ICO, PDF.`);
      return;
    }

    setSelectedFile(file);
    if (!customName) {
      setCustomName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setValidationError(null);

    try {
      const saved = await upload(selectedFile, {
        brandId: activeBrandId,
        folderId: folderId || null,
        assetType,
        name: customName || selectedFile.name,
        altText: altText || customName || selectedFile.name,
      });
      if (onUploadComplete) onUploadComplete(saved);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleCloseAndReset = () => {
    setSelectedFile(null);
    setCustomName('');
    setAltText('');
    setValidationError(null);
    reset();
    onClose();
  };

  return (
    <div className="brandLibraryRoot fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Upload Cloudinary Asset</h3>
              <p className="text-xs text-slate-500 font-medium">Secure signed media upload to Brand Library</p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Validation or API Error Alert */}
          {(validationError || error) && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded flex items-start gap-3 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold">Upload Error</p>
                <p className="text-red-600 leading-relaxed">{validationError || error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadedAsset && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Asset Uploaded Successfully!</p>
                <p className="text-xs text-emerald-600 mt-0.5">{uploadedAsset.name} is now available in your media library.</p>
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          {!uploadedAsset && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70 scale-[1.02]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.ico,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded bg-emerald-100 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another file to change</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded bg-indigo-100 border border-indigo-200 text-indigo-600 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Drag & drop your file here, or <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP, SVG, GIF, ICO, PDF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Uploading to Cloudinary...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata Configuration Form */}
          {selectedFile && !uploadedAsset && !isUploading && (
            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="bl-label">Asset Category</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className="bl-select"
                  >
                    <option value="image">Standard Image</option>
                    <option value="logo">Company Logo</option>
                    <option value="banner">Header / Banner</option>
                    <option value="icon">Brand Icon</option>
                    <option value="document">PDF Document</option>
                  </select>
                </div>

                <div>
                  <label className="bl-label">Target Folder</label>
                  <select
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="bl-select"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="bl-label">Asset Display Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. SuperMail Dark Logo 2026"
                  className="bl-input"
                  required
                />
              </div>

              <div>
                <label className="bl-label">Alt Text (Accessibility & Screen Readers)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe image for visually impaired readers..."
                  className="bl-input"
                />
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          {uploadedAsset ? (
            <button
              onClick={handleCloseAndReset}
              className="bl-btn bl-btn--primary"
            >
              Done & Return to Library
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCloseAndReset}
                disabled={isUploading}
                className="bl-btn bl-btn--secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!selectedFile || isUploading}
                className="bl-btn bl-btn--primary disabled:opacity-50"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isUploading ? 'Uploading...' : 'Start Cloudinary Upload'}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
