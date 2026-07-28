import { brandService } from './brand.service';
import type { BrandAsset, AssetType } from '../types/brand.types';

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  brandId?: string;
  assetType?: AssetType;
  folderId?: string | null;
  name?: string;
  description?: string;
  altText?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Client-Side Secure Cloudinary Upload Utility with Progress Tracking
 */
export const clientCloudinaryService = {
  async uploadFile(file: File, options: UploadOptions = {}): Promise<BrandAsset> {
    // 1. Request signed upload parameters from backend
    const signPayload = await brandService.requestSignedUpload({
      folder: options.folder || 'brand-library/assets',
      tags: options.tags || ['brand-library', options.assetType || 'image'],
    });

    // 2. Prepare FormData for direct Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signPayload.api_key);
    formData.append('timestamp', String(signPayload.timestamp));
    formData.append('signature', signPayload.signature);
    formData.append('folder', signPayload.folder);
    if (signPayload.tags) formData.append('tags', signPayload.tags);

    // 3. Upload via XMLHttpRequest to track real-time upload progress
    const cloudinaryResponse: any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', signPayload.upload_url);

      if (options.onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            options.onProgress!(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(new Error('Failed to parse Cloudinary response.'));
          }
        } else {
          try {
            const errObj = JSON.parse(xhr.responseText);
            reject(new Error(errObj.error?.message || `Upload failed with status ${xhr.status}`));
          } catch (e) {
            reject(new Error(`Cloudinary upload failed with HTTP status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload to Cloudinary.'));
      xhr.send(formData);
    });

    // 4. Save metadata to backend database
    const assetPayload: Partial<BrandAsset> = {
      brand_id: options.brandId,
      folder_id: options.folderId || null,
      asset_type: options.assetType || 'image',
      name: options.name || file.name.replace(/\.[^/.]+$/, ''),
      description: options.description || '',
      alt_text: options.altText || file.name,
      original_filename: file.name,
      cloudinary_public_id: cloudinaryResponse.public_id,
      cloudinary_resource_type: cloudinaryResponse.resource_type || 'image',
      cloudinary_format: cloudinaryResponse.format,
      cloudinary_version: String(cloudinaryResponse.version || ''),
      secure_url: cloudinaryResponse.secure_url,
      thumbnail_url: cloudinaryResponse.secure_url.replace('/upload/', '/upload/c_fill,w_300,h_300,q_auto,f_auto/'),
      width: cloudinaryResponse.width || null,
      height: cloudinaryResponse.height || null,
      bytes: cloudinaryResponse.bytes || file.size,
      tags: options.tags || ['brand-library'],
      is_default: false,
    };

    const savedAsset = await brandService.saveAsset(assetPayload);
    return savedAsset;
  },

  /**
   * Helper to format Cloudinary URL with transformations
   */
  getTransformedUrl(url: string, transform: { width?: number; height?: number; crop?: string; quality?: string; format?: string }): string {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    const parts: string[] = [];
    if (transform.crop) parts.push(`c_${transform.crop}`);
    if (transform.width) parts.push(`w_${transform.width}`);
    if (transform.height) parts.push(`h_${transform.height}`);
    if (transform.quality) parts.push(`q_${transform.quality}`);
    if (transform.format) parts.push(`f_${transform.format}`);
    if (parts.length === 0) return url;
    return url.replace('/upload/', `/upload/${parts.join(',')}/`);
  },
};
