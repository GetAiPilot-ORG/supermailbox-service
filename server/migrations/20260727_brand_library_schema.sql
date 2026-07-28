-- ============================================================================
-- Centralized Brand, Media & Content Library (Brand Library Schema)
-- Migration: 20260727_brand_library_schema.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Brands Registry (Supports multi-workspace/brand architecture)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_workspace ON public.brands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);

-- 2. Asset Folders (Nested folder hierarchy for logos, images, documents)
CREATE TABLE IF NOT EXISTS public.asset_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.asset_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.asset_folders 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_asset_folders_brand ON public.asset_folders(brand_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_asset_folders_parent ON public.asset_folders(parent_id) WHERE deleted_at IS NULL;

-- 3. Brand Assets (Cloudinary media library: logos, images, banners, icons)
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.asset_folders(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'image', 'banner', 'icon', 'document')),
  name TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  original_filename TEXT,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_resource_type TEXT DEFAULT 'image',
  cloudinary_format TEXT,
  cloudinary_version TEXT,
  secure_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  is_default BOOLEAN DEFAULT false,
  is_favourite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.brand_assets 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.asset_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_assets_brand_type ON public.brand_assets(brand_id, asset_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_brand_assets_folder ON public.brand_assets(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_brand_assets_cloudinary ON public.brand_assets(cloudinary_public_id);

-- 4. Brand Contacts (Reusable phone numbers, addresses, emails)
CREATE TABLE IF NOT EXISTS public.brand_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone_main', 'phone_support', 'phone_sales', 'whatsapp', 'email_primary', 'email_support', 'email_billing', 'email_sales', 'address_physical', 'address_billing', 'office_hours', 'person_name', 'person_designation', 'custom')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.brand_contacts 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_contacts_brand ON public.brand_contacts(brand_id, contact_type) WHERE deleted_at IS NULL;

-- 5. Brand Links & URL Library
CREATE TABLE IF NOT EXISTS public.brand_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('website', 'dashboard', 'login', 'signup', 'pricing', 'contact', 'support', 'help_centre', 'knowledge_base', 'privacy_policy', 'terms', 'unsubscribe', 'preferences', 'product_page', 'checkout', 'booking', 'app_store', 'play_store', 'social', 'cta', 'custom')),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  utm_defaults JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.brand_links 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_links_brand ON public.brand_links(brand_id, link_type) WHERE deleted_at IS NULL;

-- 6. Brand Social Profiles
CREATE TABLE IF NOT EXISTS public.brand_social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT,
  url TEXT NOT NULL,
  icon_asset_id UUID REFERENCES public.brand_assets(id) ON DELETE SET NULL,
  display_label TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.brand_social_profiles 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_social_brand ON public.brand_social_profiles(brand_id) WHERE deleted_at IS NULL;

-- 7. Brand Styles (Reusable design tokens)
CREATE TABLE IF NOT EXISTS public.brand_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  style_tokens JSONB NOT NULL DEFAULT '{
    "primary_color": "#6366F1",
    "secondary_color": "#4F46E5",
    "accent_color": "#10B981",
    "background_color": "#F8FAFC",
    "text_color": "#0F172A",
    "muted_text_color": "#64748B",
    "link_color": "#6366F1",
    "button_color": "#6366F1",
    "button_text_color": "#FFFFFF",
    "border_color": "#E2E8F0",
    "font_heading": "Host Grotesk, -apple-system, sans-serif",
    "font_body": "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    "default_border_radius": "8px",
    "default_email_width": "600px",
    "default_logo_width": "160px",
    "default_spacing_scale": "normal"
  }'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_styles_brand ON public.brand_styles(brand_id);

-- 8. Brand Content Snippets (Reusable welcome text, disclaimers, notes)
CREATE TABLE IF NOT EXISTS public.brand_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('welcome', 'support', 'intro', 'cta', 'product', 'legal', 'billing', 'delivery', 'promo', 'closing', 'contact', 'signature_text', 'footer_text', 'custom')),
  name TEXT NOT NULL,
  content_json JSONB DEFAULT '{}'::jsonb,
  plain_text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::text[],
  is_favourite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.brand_snippets 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_snippets_brand ON public.brand_snippets(brand_id, category) WHERE deleted_at IS NULL;

-- 9. Brand Signatures (Reusable employee/company email signatures)
CREATE TABLE IF NOT EXISTS public.brand_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  rendered_html TEXT NOT NULL,
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.brand_signatures 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_signatures_brand ON public.brand_signatures(brand_id) WHERE deleted_at IS NULL;

-- 10. Brand Email Footers (Compliance-ready footers with unsubscribe links)
CREATE TABLE IF NOT EXISTS public.brand_footers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  rendered_html TEXT NOT NULL,
  plain_text TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.brand_footers 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'default_workspace';

CREATE INDEX IF NOT EXISTS idx_brand_footers_brand ON public.brand_footers(brand_id) WHERE deleted_at IS NULL;

-- 11. Saved Email Blocks (Reusable email sections: headers, heroes, product cards)
CREATE TABLE IF NOT EXISTS public.email_saved_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('header', 'footer', 'hero', 'contact', 'product', 'cta', 'social', 'signature', 'disclaimer', 'grid', 'support', 'custom')),
  document_json JSONB NOT NULL,
  rendered_preview TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  usage_count INTEGER DEFAULT 0,
  is_favourite BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS public.email_saved_blocks 
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS document_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS rendered_preview TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_saved_blocks_brand_cat ON public.email_saved_blocks(brand_id, category) WHERE deleted_at IS NULL;

-- 12. Asset Usage Tracking (Tracks where assets/snippets/blocks are used)
CREATE TABLE IF NOT EXISTS public.asset_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
  asset_id UUID NOT NULL,
  resource_type TEXT NOT NULL, -- e.g. 'brand_asset', 'brand_snippet', 'brand_footer'
  resource_id TEXT NOT NULL,   -- e.g. template_id or campaign_id
  context TEXT,                -- e.g. 'email_template:saas_welcome:v1'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_usage_resource ON public.asset_usage(asset_id, resource_type);

-- Row Level Security (RLS) Enablement & Default Permissive Policy for Internal Tool
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_footers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_saved_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_usage ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies for admin internal tool access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_internal_brands') THEN
    CREATE POLICY allow_all_internal_brands ON public.brands FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_folders ON public.asset_folders FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_assets ON public.brand_assets FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_contacts ON public.brand_contacts FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_links ON public.brand_links FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_social ON public.brand_social_profiles FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_styles ON public.brand_styles FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_snippets ON public.brand_snippets FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_signatures ON public.brand_signatures FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_footers ON public.brand_footers FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_saved_blocks ON public.email_saved_blocks FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY allow_all_internal_usage ON public.asset_usage FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
