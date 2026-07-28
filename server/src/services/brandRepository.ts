import { supabase } from '../supabase.js';
import { cloudinaryService } from './cloudinary.service.js';

/**
 * Default internal brand fallback when database is empty or uninitialized
 */
export const DEFAULT_BRAND_FALLBACK = {
  id: '00000000-0000-0000-0000-000000000001',
  workspace_id: 'default_workspace',
  name: 'SuperMail Box',
  slug: 'supermailbox',
  description: 'Primary internal brand for GetAiPilot & SocialPilot email communications.',
  is_default: true,
  created_by: 'system',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_BRAND_STYLES = {
  primary_color: '#6366F1',
  secondary_color: '#4F46E5',
  accent_color: '#10B981',
  background_color: '#F8FAFC',
  text_color: '#0F172A',
  muted_text_color: '#64748B',
  link_color: '#6366F1',
  button_color: '#6366F1',
  button_text_color: '#FFFFFF',
  border_color: '#E2E8F0',
  font_heading: "Host Grotesk, -apple-system, sans-serif",
  font_body: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  default_border_radius: '8px',
  default_email_width: '600px',
  default_logo_width: '160px',
  default_spacing_scale: 'normal',
};

/**
 * Repository for Brand Library, Assets, Contacts, URLs, Socials, Styles, Snippets & Tokens
 */
export const brandRepository = {
  /**
   * Ensure default brand exists
   */
  async getPrimaryBrand(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== '42P01') {
        console.warn('[Brand Repository] Error fetching primary brand:', error.message);
      }
      if (data) return data;

      // Try auto-creating default brand
      const { data: created, error: createErr } = await supabase
        .from('brands')
        .insert(DEFAULT_BRAND_FALLBACK)
        .select('*')
        .maybeSingle();

      if (createErr) {
        return DEFAULT_BRAND_FALLBACK;
      }
      return created || DEFAULT_BRAND_FALLBACK;
    } catch (e) {
      return DEFAULT_BRAND_FALLBACK;
    }
  },

  async listBrands(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error || !data || data.length === 0) return [DEFAULT_BRAND_FALLBACK];
      return data;
    } catch (e) {
      return [DEFAULT_BRAND_FALLBACK];
    }
  },

  async createBrand(payload: { name: string; slug: string; description?: string; is_default?: boolean }): Promise<any> {
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: payload.name,
        slug: payload.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
        description: payload.description || '',
        is_default: payload.is_default || false,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Overview Stats for Brand Library
   */
  async getOverviewStats(brandId?: string): Promise<any> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;

      const [assetsRes, linksRes, snippetsRes, contactsRes] = await Promise.all([
        supabase.from('brand_assets').select('id, asset_type, bytes, is_favourite, created_at').eq('brand_id', bId).is('deleted_at', null),
        supabase.from('brand_links').select('id, link_type, usage_count, is_active').eq('brand_id', bId).is('deleted_at', null),
        supabase.from('brand_snippets').select('id, category, usage_count').eq('brand_id', bId).is('deleted_at', null),
        supabase.from('brand_contacts').select('id, contact_type, label, value').eq('brand_id', bId).is('deleted_at', null),
      ]);

      const assets = assetsRes.data || [];
      const links = linksRes.data || [];
      const snippets = snippetsRes.data || [];
      const contacts = contactsRes.data || [];

      const totalStorageBytes = assets.reduce((acc, curr) => acc + (curr.bytes || 0), 0);
      const logosCount = assets.filter(a => a.asset_type === 'logo').length;
      const imagesCount = assets.filter(a => a.asset_type === 'image' || a.asset_type === 'banner').length;
      const favouritesCount = assets.filter(a => a.is_favourite).length;

      return {
        totalAssets: assets.length,
        logosCount,
        imagesCount,
        linksCount: links.length,
        snippetsCount: snippets.length,
        contactsCount: contacts.length,
        favouritesCount,
        totalStorageBytes,
        storageFormatted: (totalStorageBytes / (1024 * 1024)).toFixed(2) + ' MB',
        recentAssets: assets.slice(0, 6),
      };
    } catch (e: any) {
      return {
        totalAssets: 0,
        logosCount: 0,
        imagesCount: 0,
        linksCount: 0,
        snippetsCount: 0,
        contactsCount: 0,
        favouritesCount: 0,
        totalStorageBytes: 0,
        storageFormatted: '0.00 MB',
        recentAssets: [],
      };
    }
  },

  /**
   * Asset Folders
   */
  async listFolders(brandId?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase
        .from('asset_folders')
        .select('*')
        .eq('brand_id', bId)
        .is('deleted_at', null)
        .order('name');
      return error ? [] : (data || []);
    } catch (e) {
      return [];
    }
  },

  async createFolder(name: string, parentId?: string, brandId?: string): Promise<any> {
    const bId = brandId || (await this.getPrimaryBrand()).id;
    const { data, error } = await supabase
      .from('asset_folders')
      .insert({ brand_id: bId, name, parent_id: parentId || null })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Brand Assets (Logos, Images, Documents)
   */
  async listAssets(params: {
    brandId?: string;
    type?: string;
    folderId?: string;
    search?: string;
    favourite?: boolean;
    trash?: boolean;
  } = {}): Promise<any[]> {
    try {
      const bId = params.brandId || (await this.getPrimaryBrand()).id;
      let query = supabase.from('brand_assets').select('*').eq('brand_id', bId);

      if (params.trash) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }

      if (params.type && params.type !== 'all') {
        query = query.eq('asset_type', params.type);
      }
      if (params.folderId) {
        query = query.eq('folder_id', params.folderId);
      }
      if (params.favourite) {
        query = query.eq('is_favourite', true);
      }
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return error ? [] : (data || []);
    } catch (e) {
      return [];
    }
  },

  async saveAsset(payload: {
    brand_id?: string;
    folder_id?: string | null;
    asset_type: 'logo' | 'image' | 'banner' | 'icon' | 'document';
    name: string;
    description?: string;
    alt_text?: string;
    original_filename?: string;
    cloudinary_public_id: string;
    cloudinary_resource_type?: string;
    cloudinary_format?: string;
    secure_url: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    bytes?: number;
    tags?: string[];
    is_default?: boolean;
  }): Promise<any> {
    const bId = payload.brand_id || (await this.getPrimaryBrand()).id;

    // Validate upload
    const validation = cloudinaryService.validateUpload({
      secure_url: payload.secure_url,
      public_id: payload.cloudinary_public_id,
      bytes: payload.bytes,
      format: payload.cloudinary_format,
    });
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid asset payload.');
    }

    const { data, error } = await supabase
      .from('brand_assets')
      .insert({
        brand_id: bId,
        folder_id: payload.folder_id || null,
        asset_type: payload.asset_type,
        name: payload.name,
        description: payload.description || '',
        alt_text: payload.alt_text || payload.name,
        original_filename: payload.original_filename || payload.name,
        cloudinary_public_id: payload.cloudinary_public_id,
        cloudinary_resource_type: payload.cloudinary_resource_type || 'image',
        cloudinary_format: payload.cloudinary_format || 'png',
        secure_url: payload.secure_url,
        thumbnail_url: payload.thumbnail_url || cloudinaryService.generateThumbnail(payload.secure_url),
        width: payload.width || null,
        height: payload.height || null,
        bytes: payload.bytes || 0,
        tags: payload.tags || ['brand-library'],
        is_default: payload.is_default || false,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateAsset(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await supabase
      .from('brand_assets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async softDeleteAsset(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('brand_assets')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  },

  async restoreAsset(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('brand_assets')
      .update({ deleted_at: null, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  },

  /**
   * Brand Contacts
   */
  async listContacts(brandId?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase
        .from('brand_contacts')
        .select('*')
        .eq('brand_id', bId)
        .is('deleted_at', null)
        .order('contact_type');
      return error ? [] : (data || []);
    } catch (e) {
      return [];
    }
  },

  async saveContact(payload: { brand_id?: string; contact_type: string; label: string; value: string; is_default?: boolean }): Promise<any> {
    const bId = payload.brand_id || (await this.getPrimaryBrand()).id;
    const { data, error } = await supabase
      .from('brand_contacts')
      .insert({ brand_id: bId, ...payload })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteContact(id: string): Promise<boolean> {
    const { error } = await supabase.from('brand_contacts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return !error;
  },

  /**
   * Brand Links & URLs
   */
  async listLinks(brandId?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase
        .from('brand_links')
        .select('*')
        .eq('brand_id', bId)
        .is('deleted_at', null)
        .order('label');
      return error ? [] : (data || []);
    } catch (e) {
      return [];
    }
  },

  async saveLink(payload: { brand_id?: string; link_type: string; label: string; url: string; description?: string; is_default?: boolean }): Promise<any> {
    // Validate protocol (no javascript: allowed)
    if (payload.url && payload.url.toLowerCase().startsWith('javascript:')) {
      throw new Error('Unsafe URL protocol detected. javascript: URLs are prohibited.');
    }
    const bId = payload.brand_id || (await this.getPrimaryBrand()).id;
    const { data, error } = await supabase
      .from('brand_links')
      .insert({ brand_id: bId, ...payload })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteLink(id: string): Promise<boolean> {
    const { error } = await supabase.from('brand_links').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return !error;
  },

  /**
   * Brand Social Profiles
   */
  async listSocialProfiles(brandId?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase
        .from('brand_social_profiles')
        .select('*')
        .eq('brand_id', bId)
        .is('deleted_at', null)
        .order('platform');
      return error ? [] : (data || []);
    } catch (e) {
      return [];
    }
  },

  async saveSocialProfile(payload: { brand_id?: string; platform: string; username?: string; url: string; display_label?: string; is_default?: boolean }): Promise<any> {
    const bId = payload.brand_id || (await this.getPrimaryBrand()).id;
    const { data, error } = await supabase
      .from('brand_social_profiles')
      .insert({ brand_id: bId, ...payload })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteSocialProfile(id: string): Promise<boolean> {
    const { error } = await supabase.from('brand_social_profiles').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return !error;
  },

  /**
   * Brand Styles
   */
  async getBrandStyles(brandId?: string): Promise<any> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase
        .from('brand_styles')
        .select('*')
        .eq('brand_id', bId)
        .maybeSingle();

      if (error && error.code !== '42P01') console.warn('[Brand Styles] Error:', error.message);
      if (data) return data.style_tokens;

      return DEFAULT_BRAND_STYLES;
    } catch (e) {
      return DEFAULT_BRAND_STYLES;
    }
  },

  async updateBrandStyles(tokens: Record<string, any>, brandId?: string): Promise<any> {
    const bId = brandId || (await this.getPrimaryBrand()).id;
    // Try upserting styles
    const { data, error } = await supabase
      .from('brand_styles')
      .upsert({ brand_id: bId, style_tokens: tokens, updated_at: new Date().toISOString() }, { onConflict: 'brand_id' })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data.style_tokens;
  },

  /**
   * Brand Snippets
   */
  async listSnippets(params: { brandId?: string; category?: string; search?: string } = {}): Promise<any[]> {
    try {
      const bId = params.brandId || (await this.getPrimaryBrand()).id;
      let query = supabase.from('brand_snippets').select('*').eq('brand_id', bId).is('deleted_at', null);

      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return error ? [] : (data || []);
    } catch (e) {
      return [];
    }
  },

  async saveSnippet(payload: { brand_id?: string; category: string; name: string; content_json?: any; plain_text: string; tags?: string[] }): Promise<any> {
    const bId = payload.brand_id || (await this.getPrimaryBrand()).id;
    const { data, error } = await supabase
      .from('brand_snippets')
      .insert({ brand_id: bId, ...payload, content_json: payload.content_json || {} })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteSnippet(id: string): Promise<boolean> {
    const { error } = await supabase.from('brand_snippets').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return !error;
  },

  /**
   * Brand Signatures & Footers
   */
  async listSignatures(brandId?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase.from('brand_signatures').select('*').eq('brand_id', bId).is('deleted_at', null);
      return error ? [] : (data || []);
    } catch (e) { return []; }
  },

  async listFooters(brandId?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      const { data, error } = await supabase.from('brand_footers').select('*').eq('brand_id', bId).is('deleted_at', null);
      return error ? [] : (data || []);
    } catch (e) { return []; }
  },

  async listSavedBlocks(brandId?: string, category?: string): Promise<any[]> {
    try {
      const bId = brandId || (await this.getPrimaryBrand()).id;
      let query = supabase.from('email_saved_blocks').select('*').eq('brand_id', bId).is('deleted_at', null);
      if (category && category !== 'all') query = query.eq('category', category);
      const { data, error } = await query.order('created_at', { ascending: false });
      return error ? [] : (data || []);
    } catch (e) { return []; }
  },

  async saveBlock(payload: { brand_id?: string; name: string; category: string; document_json: any; rendered_preview?: string }): Promise<any> {
    const bId = payload.brand_id || (await this.getPrimaryBrand()).id;
    const { data, error } = await supabase
      .from('email_saved_blocks')
      .insert({ brand_id: bId, ...payload })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * MERGE TAGS & RESOURCE TOKENS RESOLVER
   * Resolves {{brand.*}} and {{current_year}} tokens in HTML/MJML content
   */
  async resolveBrandTokens(content: string, brandId?: string): Promise<string> {
    if (!content) return '';
    const bId = brandId || (await this.getPrimaryBrand()).id;

    // Fetch brand, styles, contacts, and links in parallel
    const [brand, styles, contacts, links, assets] = await Promise.all([
      this.getPrimaryBrand(),
      this.getBrandStyles(bId),
      this.listContacts(bId),
      this.listLinks(bId),
      this.listAssets({ brandId: bId }),
    ]);

    let resolved = content;

    // Standard static tokens
    const currentYear = String(new Date().getFullYear());
    resolved = resolved.replace(/\{\{\s*current_year\s*\}\}/gi, currentYear);
    resolved = resolved.replace(/\{\{\s*brand\.company_name\s*\}\}/gi, brand.name || 'SuperMail Box');
    resolved = resolved.replace(/\{\{\s*brand\.slug\s*\}\}/gi, brand.slug || 'supermailbox');

    // Style tokens
    if (styles) {
      for (const [key, val] of Object.entries(styles)) {
        const regex = new RegExp(`\\{\\{\\s*brand\\.${key}\\s*\\}\\}`, 'gi');
        resolved = resolved.replace(regex, String(val || ''));
      }
    }

    // Logo token (default logo asset or first logo)
    const defaultLogo = assets.find((a: any) => a.asset_type === 'logo' && a.is_default) || assets.find((a: any) => a.asset_type === 'logo');
    if (defaultLogo && defaultLogo.secure_url) {
      resolved = resolved.replace(/\{\{\s*brand\.logo_url\s*\}\}/gi, defaultLogo.secure_url);
    } else {
      resolved = resolved.replace(/\{\{\s*brand\.logo_url\s*\}\}/gi, 'https://res.cloudinary.com/demo/image/upload/sample.jpg');
    }

    // Contact tokens (e.g. {{brand.support_email}}, {{brand.support_phone}}, {{brand.company_address}})
    const emailContact = contacts.find((c: any) => c.contact_type === 'email_support' || c.contact_type === 'email_primary');
    const phoneContact = contacts.find((c: any) => c.contact_type === 'phone_support' || c.contact_type === 'phone_main');
    const addrContact = contacts.find((c: any) => c.contact_type === 'address_physical' || c.contact_type === 'address_billing');

    resolved = resolved.replace(/\{\{\s*brand\.support_email\s*\}\}/gi, emailContact?.value || 'support@supermailbox.in');
    resolved = resolved.replace(/\{\{\s*brand\.support_phone\s*\}\}/gi, phoneContact?.value || '+91 80000 00000');
    resolved = resolved.replace(/\{\{\s*brand\.company_address\s*\}\}/gi, addrContact?.value || 'Tech Park, Bangalore, India');

    // Link tokens (e.g. {{brand.website_url}}, {{brand.unsubscribe_url}}, {{brand.preferences_url}})
    const webLink = links.find((l: any) => l.link_type === 'website' || l.is_default);
    const unsubLink = links.find((l: any) => l.link_type === 'unsubscribe');
    const prefLink = links.find((l: any) => l.link_type === 'preferences');

    resolved = resolved.replace(/\{\{\s*brand\.website_url\s*\}\}/gi, webLink?.url || 'https://supermailbox.in');
    resolved = resolved.replace(/\{\{\s*brand\.unsubscribe_url\s*\}\}/gi, unsubLink?.url || 'https://supermailbox.in/unsubscribe?token={{contact.id}}');
    resolved = resolved.replace(/\{\{\s*brand\.preferences_url\s*\}\}/gi, prefLink?.url || 'https://supermailbox.in/preferences?token={{contact.id}}');

    return resolved;
  },
};
