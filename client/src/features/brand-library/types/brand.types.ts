export type AssetType = 'logo' | 'image' | 'banner' | 'icon' | 'document';
export type ContactType = 'phone_main' | 'phone_support' | 'phone_sales' | 'whatsapp' | 'email_primary' | 'email_support' | 'email_billing' | 'email_sales' | 'address_physical' | 'address_billing' | 'office_hours' | 'person_name' | 'person_designation' | 'custom';
export type LinkType = 'website' | 'dashboard' | 'login' | 'signup' | 'pricing' | 'contact' | 'support' | 'help_centre' | 'knowledge_base' | 'privacy_policy' | 'terms' | 'unsubscribe' | 'preferences' | 'product_page' | 'checkout' | 'booking' | 'app_store' | 'play_store' | 'social' | 'cta' | 'custom';
export type SnippetCategory = 'welcome' | 'support' | 'intro' | 'cta' | 'product' | 'legal' | 'billing' | 'delivery' | 'promo' | 'closing' | 'contact' | 'signature_text' | 'footer_text' | 'custom';
export type BlockCategory = 'header' | 'footer' | 'hero' | 'contact' | 'product' | 'cta' | 'social' | 'signature' | 'disclaimer' | 'grid' | 'support' | 'custom';

export interface Brand {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string;
  is_default: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssetFolder {
  id: string;
  workspace_id: string;
  brand_id: string;
  parent_id?: string | null;
  name: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface BrandAsset {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  folder_id?: string | null;
  asset_type: AssetType;
  name: string;
  description?: string;
  alt_text?: string;
  original_filename?: string;
  cloudinary_public_id: string;
  cloudinary_resource_type?: string;
  cloudinary_format?: string;
  cloudinary_version?: string;
  secure_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  bytes?: number;
  metadata?: Record<string, any>;
  tags?: string[];
  is_default?: boolean;
  is_favourite?: boolean;
  usage_count?: number;
  last_used_at?: string;
  archived_at?: string | null;
  deleted_at?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandContact {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  contact_type: ContactType;
  label: string;
  value: string;
  metadata?: Record<string, any>;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandLink {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  link_type: LinkType;
  label: string;
  url: string;
  description?: string;
  utm_defaults?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  is_default?: boolean;
  is_active?: boolean;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BrandSocialProfile {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  platform: string;
  username?: string;
  url: string;
  icon_asset_id?: string | null;
  display_label?: string;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandStyles {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  muted_text_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  border_color: string;
  font_heading: string;
  font_body: string;
  default_border_radius: string;
  default_email_width: string;
  default_logo_width: string;
  default_spacing_scale: string;
}

export interface BrandSnippet {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  category: SnippetCategory;
  name: string;
  content_json?: any;
  plain_text: string;
  tags?: string[];
  is_favourite?: boolean;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BrandSignature {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  name: string;
  document_json: any;
  rendered_html: string;
  thumbnail_url?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandFooter {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  name: string;
  document_json: any;
  rendered_html: string;
  plain_text?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailSavedBlock {
  id: string;
  workspace_id?: string;
  brand_id?: string;
  name: string;
  category: BlockCategory;
  document_json: any;
  rendered_preview?: string;
  thumbnail_url?: string;
  tags?: string[];
  usage_count?: number;
  is_favourite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandOverviewStats {
  totalAssets: number;
  logosCount: number;
  imagesCount: number;
  linksCount: number;
  snippetsCount: number;
  contactsCount: number;
  favouritesCount: number;
  totalStorageBytes: number;
  storageFormatted: string;
  recentAssets: BrandAsset[];
}
