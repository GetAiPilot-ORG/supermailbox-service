import { useState, useCallback } from 'react';
import { clientCloudinaryService, type UploadOptions } from '../services/cloudinary.service';
import type { BrandAsset } from '../types/brand.types';

export function useAssetUpload() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<BrandAsset | null>(null);

  const upload = useCallback(async (file: File, options: UploadOptions = {}): Promise<BrandAsset> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadedAsset(null);

    try {
      const result = await clientCloudinaryService.uploadFile(file, {
        ...options,
        onProgress: (pct) => {
          setProgress(pct);
          if (options.onProgress) options.onProgress(pct);
        },
      });

      setUploadedAsset(result);
      setProgress(100);
      return result;
    } catch (err: any) {
      const msg = err.message || 'File upload failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedAsset(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    uploadedAsset,
    reset,
  };
}
