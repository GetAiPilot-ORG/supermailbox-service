import type {
  Brand,
  AssetFolder,
  BrandAsset,
  BrandContact,
  BrandLink,
  BrandSocialProfile,
  BrandStyles,
  BrandSnippet,
  BrandSignature,
  BrandFooter,
  EmailSavedBlock,
  BrandOverviewStats,
} from '../types/brand.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> || {}) };
  if (init?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(payload.error || `Brand API request failed: ${res.statusText}`);
  }
  return payload.data;
}

/**
 * Frontend Service Client for Brand, Media & Content Library
 */
export const brandService = {
  // 1. Overview & Stats
  async getOverview(brandId?: string): Promise<BrandOverviewStats> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandOverviewStats>(`/v1/brand/overview${q}`);
  },

  // 2. Brands Registry
  async listBrands(): Promise<Brand[]> {
    return api<Brand[]>('/v1/brand/brands');
  },
  async createBrand(payload: { name: string; slug: string; description?: string; is_default?: boolean }): Promise<Brand> {
    return api<Brand>('/v1/brand/brands', { method: 'POST', body: JSON.stringify(payload) });
  },

  // 3. Asset Folders
  async listFolders(brandId?: string): Promise<AssetFolder[]> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<AssetFolder[]>(`/v1/brand/folders${q}`);
  },
  async createFolder(name: string, parentId?: string, brandId?: string): Promise<AssetFolder> {
    return api<AssetFolder>('/v1/brand/folders', { method: 'POST', body: JSON.stringify({ name, parentId, brandId }) });
  },

  // 4. Cloudinary Signing
  async requestSignedUpload(options: { folder?: string; tags?: string[]; public_id?: string; overwrite?: boolean } = {}): Promise<any> {
    return api<any>('/v1/brand/cloudinary/sign', { method: 'POST', body: JSON.stringify(options) });
  },

  // 5. Brand Assets
  async listAssets(params: {
    brandId?: string;
    type?: string;
    folderId?: string;
    search?: string;
    favourite?: boolean;
    trash?: boolean;
  } = {}): Promise<BrandAsset[]> {
    const query = new URLSearchParams();
    if (params.brandId) query.set('brandId', params.brandId);
    if (params.type) query.set('type', params.type);
    if (params.folderId) query.set('folderId', params.folderId);
    if (params.search) query.set('search', params.search);
    if (params.favourite) query.set('favourite', 'true');
    if (params.trash) query.set('trash', 'true');
    return api<BrandAsset[]>(`/v1/brand/assets?${query.toString()}`);
  },
  async saveAsset(payload: Partial<BrandAsset>): Promise<BrandAsset> {
    return api<BrandAsset>('/v1/brand/assets', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateAsset(id: string, updates: Partial<BrandAsset>): Promise<BrandAsset> {
    return api<BrandAsset>(`/v1/brand/assets/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  },
  async archiveAsset(id: string): Promise<boolean> {
    return api<boolean>(`/v1/brand/assets/${id}/archive`, { method: 'POST' });
  },
  async restoreAsset(id: string): Promise<boolean> {
    return api<boolean>(`/v1/brand/assets/${id}/restore`, { method: 'POST' });
  },
  async permanentlyDeleteAsset(id: string, publicId?: string): Promise<{ deleted: boolean }> {
    const q = publicId ? `?publicId=${encodeURIComponent(publicId)}` : '';
    return api<{ deleted: boolean }>(`/v1/brand/assets/${id}${q}`, { method: 'DELETE' });
  },
  async trackAssetUsage(assetId: string, resourceType: string, resourceId: string, context?: string): Promise<void> {
    await api('/v1/brand/assets/track-usage', { method: 'POST', body: JSON.stringify({ assetId, resourceType, resourceId, context }) });
  },

  // 6. Brand Contacts
  async listContacts(brandId?: string): Promise<BrandContact[]> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandContact[]>(`/v1/brand/contacts${q}`);
  },
  async saveContact(payload: Partial<BrandContact>): Promise<BrandContact> {
    return api<BrandContact>('/v1/brand/contacts', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteContact(id: string): Promise<boolean> {
    return api<boolean>(`/v1/brand/contacts/${id}`, { method: 'DELETE' });
  },

  // 7. Brand Links & URLs
  async listLinks(brandId?: string): Promise<BrandLink[]> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandLink[]>(`/v1/brand/links${q}`);
  },
  async saveLink(payload: Partial<BrandLink>): Promise<BrandLink> {
    return api<BrandLink>('/v1/brand/links', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteLink(id: string): Promise<boolean> {
    return api<boolean>(`/v1/brand/links/${id}`, { method: 'DELETE' });
  },

  // 8. Brand Social Profiles
  async listSocialProfiles(brandId?: string): Promise<BrandSocialProfile[]> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandSocialProfile[]>(`/v1/brand/social${q}`);
  },
  async saveSocialProfile(payload: Partial<BrandSocialProfile>): Promise<BrandSocialProfile> {
    return api<BrandSocialProfile>('/v1/brand/social', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteSocialProfile(id: string): Promise<boolean> {
    return api<boolean>(`/v1/brand/social/${id}`, { method: 'DELETE' });
  },

  // 9. Brand Styles
  async getStyles(brandId?: string): Promise<BrandStyles> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandStyles>(`/v1/brand/styles${q}`);
  },
  async updateStyles(tokens: Partial<BrandStyles>, brandId?: string): Promise<BrandStyles> {
    return api<BrandStyles>('/v1/brand/styles', { method: 'PUT', body: JSON.stringify({ tokens, brandId }) });
  },

  // 10. Brand Snippets
  async listSnippets(params: { brandId?: string; category?: string; search?: string } = {}): Promise<BrandSnippet[]> {
    const query = new URLSearchParams();
    if (params.brandId) query.set('brandId', params.brandId);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    return api<BrandSnippet[]>(`/v1/brand/snippets?${query.toString()}`);
  },
  async saveSnippet(payload: Partial<BrandSnippet>): Promise<BrandSnippet> {
    return api<BrandSnippet>('/v1/brand/snippets', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteSnippet(id: string): Promise<boolean> {
    return api<boolean>(`/v1/brand/snippets/${id}`, { method: 'DELETE' });
  },

  // 11. Signatures, Footers & Saved Blocks
  async listSignatures(brandId?: string): Promise<BrandSignature[]> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandSignature[]>(`/v1/brand/signatures${q}`);
  },
  async listFooters(brandId?: string): Promise<BrandFooter[]> {
    const q = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    return api<BrandFooter[]>(`/v1/brand/footers${q}`);
  },
  async listSavedBlocks(brandId?: string, category?: string): Promise<EmailSavedBlock[]> {
    const query = new URLSearchParams();
    if (brandId) query.set('brandId', brandId);
    if (category) query.set('category', category);
    return api<EmailSavedBlock[]>(`/v1/brand/blocks?${query.toString()}`);
  },
  async saveSavedBlock(payload: Partial<EmailSavedBlock>): Promise<EmailSavedBlock> {
    return api<EmailSavedBlock>('/v1/brand/blocks', { method: 'POST', body: JSON.stringify(payload) });
  },

  // 12. Dynamic Token Resolution
  async resolveTokens(content: string, brandId?: string): Promise<string> {
    const res = await api<{ compiled: string }>('/v1/brand/resolve-tokens', { method: 'POST', body: JSON.stringify({ content, brandId }) });
    return res.compiled;
  },
};
