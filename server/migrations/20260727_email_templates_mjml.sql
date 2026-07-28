-- Data-preserving extension for the new MJML template builder.
-- Do not drop legacy columns or tables; campaigns still depend on email_templates/template_versions.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS workspace_id UUID,
  ADD COLUMN IF NOT EXISTS owner_id UUID,
  ADD COLUMN IF NOT EXISTS folder_id UUID,
  ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS preheader TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS editor_type TEXT NOT NULL DEFAULT 'legacy-html',
  ADD COLUMN IF NOT EXISTS project_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mjml_content TEXT,
  ADD COLUMN IF NOT EXISTS compiled_html TEXT,
  ADD COLUMN IF NOT EXISTS plain_text TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_system_template BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.template_versions
  ADD COLUMN IF NOT EXISTS workspace_id UUID,
  ADD COLUMN IF NOT EXISTS project_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS plain_text TEXT,
  ADD COLUMN IF NOT EXISTS save_reason TEXT NOT NULL DEFAULT 'manual';

CREATE TABLE IF NOT EXISTS public.email_template_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.email_template_folders(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_saved_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID,
  owner_id UUID,
  name TEXT NOT NULL,
  category TEXT,
  block_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  mjml_content TEXT NOT NULL,
  thumbnail_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_template_favourites (
  user_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_workspace ON public.email_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_owner ON public.email_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_status ON public.email_templates(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_industry ON public.email_templates(industry);
CREATE INDEX IF NOT EXISTS idx_email_templates_updated_at ON public.email_templates(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_deleted_at ON public.email_templates(deleted_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_lower_name ON public.email_templates(lower(name));
CREATE INDEX IF NOT EXISTS idx_email_templates_source_template ON public.email_templates(source_template_id);

UPDATE public.email_templates
SET
  name = COALESCE(name, initcap(replace(key, '_', ' '))),
  subject = COALESCE(subject, (
    SELECT tv.subject
    FROM public.template_versions tv
    WHERE tv.template_id = email_templates.id
    ORDER BY tv.version_number DESC
    LIMIT 1
  )),
  compiled_html = COALESCE(compiled_html, (
    SELECT tv.html_source
    FROM public.template_versions tv
    WHERE tv.template_id = email_templates.id
    ORDER BY tv.version_number DESC
    LIMIT 1
  )),
  mjml_content = COALESCE(mjml_content, (
    SELECT tv.mjml_source
    FROM public.template_versions tv
    WHERE tv.template_id = email_templates.id
    ORDER BY tv.version_number DESC
    LIMIT 1
  )),
  updated_at = COALESCE(updated_at, created_at)
WHERE name IS NULL OR subject IS NULL OR compiled_html IS NULL OR mjml_content IS NULL;
