import crypto from 'crypto';
import { supabase } from '../supabase.js';

export interface CloudinarySignOptions {
  folder?: string;
  tags?: string[];
  transformation?: string;
  public_id?: string;
  overwrite?: boolean;
}

export interface SignedUploadPayload {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  tags: string;
  upload_url: string;
}

export interface CloudinaryTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'limit' | 'fill' | 'pad';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
  radius?: number | 'max';
  background?: string;
}

/**
 * Service Layer for Secure Cloudinary Media Management & Asset Usage Tracking
 */
export const cloudinaryService = {
  /**
   * 1. Request Secure Signed Upload Parameters for Client-Side Direct Upload
   */
  requestSignedUpload(options: CloudinarySignOptions = {}): SignedUploadPayload {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
    const apiKey = process.env.CLOUDINARY_API_KEY || '123456789012345';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'demo_secret_key_for_local_development_only';

    if (apiSecret === 'demo_secret_key_for_local_development_only' || apiKey === '123456789012345' || cloudName === 'demo') {
      const err = new Error('Cloudinary API credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in server/.env. Please add your credentials to upload assets.');
      (err as any).statusCode = 400;
      throw err;
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = options.folder || 'brand-library/assets';
    const tags = (options.tags || ['brand-asset']).join(',');

    const paramsToSign: Record<string, string | number> = {
      folder,
      tags,
      timestamp,
    };

    if (options.public_id) paramsToSign.public_id = options.public_id;
    if (options.overwrite !== undefined) paramsToSign.overwrite = options.overwrite ? 'true' : 'false';

    // Cloudinary signature calculation: alphabetical sort of key=value joined by & + secret
    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return {
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder,
      tags,
      upload_url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
  },

  /**
   * 2. Validate Uploaded Asset Metadata before storing in Database
   */
  validateUpload(metadata: {
    secure_url?: string;
    public_id?: string;
    bytes?: number;
    format?: string;
    width?: number;
    height?: number;
  }): { valid: boolean; error?: string } {
    if (!metadata.secure_url || !metadata.public_id) {
      return { valid: false, error: 'Missing secure_url or public_id from upload payload.' };
    }
    // Max file size check: 10MB
    if (metadata.bytes && metadata.bytes > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds maximum allowed limit of 10MB.' };
    }
    // Format check
    const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'pdf'];
    if (metadata.format && !allowedFormats.includes(metadata.format.toLowerCase())) {
      return { valid: false, error: `Unsupported format '${metadata.format}'. Allowed: ${allowedFormats.join(', ')}.` };
    }
    return { valid: true };
  },

  /**
   * 3. Generate Transformed Cloudinary URL on-the-fly without duplicate storage
   */
  getTransformedUrl(url: string, options: CloudinaryTransformationOptions): string {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const parts: string[] = [];
    if (options.crop) parts.push(`c_${options.crop}`);
    if (options.width) parts.push(`w_${options.width}`);
    if (options.height) parts.push(`h_${options.height}`);
    if (options.quality) parts.push(`q_${options.quality}`);
    if (options.format) parts.push(`f_${options.format}`);
    if (options.radius) parts.push(`r_${options.radius}`);
    if (options.background) parts.push(`b_${options.background.replace('#', 'rgb:')}`);

    if (parts.length === 0) return url;
    const transformString = parts.join(',');

    // Insert transformation string into standard Cloudinary URL path right after /upload/
    return url.replace('/upload/', `/upload/${transformString}/`);
  },

  /**
   * 4. Generate Optimized Thumbnail URL
   */
  generateThumbnail(url: string, width = 300, height = 300): string {
    return this.getTransformedUrl(url, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });
  },

  /**
   * 5. Archive Asset (Soft Delete in DB)
   */
  async archiveAsset(assetId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('brand_assets')
      .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', assetId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * 6. Track Asset Usage across Email Templates & Campaigns
   */
  async trackAssetUsage(
    assetId: string,
    resourceType: string,
    resourceId: string,
    context?: string
  ): Promise<void> {
    try {
      await supabase.from('asset_usage').insert({
        asset_id: assetId,
        resource_type: resourceType,
        resource_id: resourceId,
        context: context || `used_in_${resourceType}`,
      });

      // Increment usage count on the asset
      const { data } = await supabase
        .from('brand_assets')
        .select('usage_count')
        .eq('id', assetId)
        .single();

      const currentCount = (data?.usage_count || 0) + 1;
      await supabase
        .from('brand_assets')
        .update({ usage_count: currentCount, last_used_at: new Date().toISOString() })
        .eq('id', assetId);
    } catch (err) {
      console.warn('[Asset Usage Tracking] Non-fatal error recording usage:', err);
    }
  },

  /**
   * 7. Permanently Delete Asset (With safety check against dependent templates)
   */
  async permanentlyDeleteAsset(
    assetId: string,
    cloudinaryPublicId?: string
  ): Promise<{ success: boolean; warning?: string; error?: string }> {
    // Check if asset is used in active templates or campaigns
    const { data: usageData, error: usageErr } = await supabase
      .from('asset_usage')
      .select('resource_id, context')
      .eq('asset_id', assetId);

    if (usageErr && usageErr.code !== '42P01') {
      return { success: false, error: usageErr.message };
    }

    if (usageData && usageData.length > 0) {
      const dependents = usageData.map(u => u.context || u.resource_id).join(', ');
      return {
        success: false,
        error: `Cannot permanently delete asset. It is currently referenced by ${usageData.length} item(s): [${dependents}]. Please remove references first or move to Trash.`,
      };
    }

    // Delete from Cloudinary REST API if configured
    if (cloudinaryPublicId && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'demo_secret_key_for_local_development_only') {
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign: Record<string, string | number> = {
          public_id: cloudinaryPublicId,
          timestamp,
        };
        const stringToSign = `public_id=${cloudinaryPublicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const formData = new URLSearchParams();
        formData.append('public_id', cloudinaryPublicId);
        formData.append('timestamp', String(timestamp));
        formData.append('api_key', process.env.CLOUDINARY_API_KEY);
        formData.append('signature', signature);

        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
          method: 'POST',
          body: formData,
        });
      } catch (cloudErr) {
        console.warn('[Cloudinary Destroy] Could not delete remote asset:', cloudErr);
      }
    }

    // Permanently remove record from Supabase
    const { error: delErr } = await supabase.from('brand_assets').delete().eq('id', assetId);
    if (delErr) return { success: false, error: delErr.message };

    return { success: true };
  },
};
