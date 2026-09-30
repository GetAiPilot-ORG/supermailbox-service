import { z } from 'zod';
import { supabase } from '../supabase.js';
import { compileMjml, runTemplateQualityChecks } from './emailTemplateCompiler.js';
import { blankMjml, systemTemplateSeeds } from './emailTemplateSeeds.js';

const DEFAULT_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_OWNER_ID = '00000000-0000-0000-0000-000000000002';
const DEFAULT_PRODUCT_CODE = 'getaipilot';
const dbCategory = (category: string) => /transactional|verification|payment|receipt|order|password/i.test(category) ? 'transactional' : 'marketing';

export const templateWriteSchema = z.object({
  name: z.string().min(1).max(140).optional(),
  subject: z.string().max(240).optional().nullable(),
  preheader: z.string().max(300).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  industry: z.string().max(80).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  visibility: z.enum(['private', 'shared', 'system']).optional(),
  editorType: z.string().max(80).optional(),
  projectJson: z.unknown().optional(),
  mjmlContent: z.string().optional(),
  compiledHtml: z.string().optional(),
  plainText: z.string().optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
});

export type TemplateWriteInput = z.infer<typeof templateWriteSchema>;

const ensureProductId = async () => {
  const { data, error } = await supabase
    .from('products')
    .upsert({ code: DEFAULT_PRODUCT_CODE, name: 'GetAIPilot Core Platform', status: 'active' }, { onConflict: 'code' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
};

const asTemplate = (row: any) => ({
  id: row.id,
  key: row.key,
  name: row.name || prettifyKey(row.key),
  description: row.description || '',
  subject: row.subject || row.template_versions?.[0]?.subject || '',
  preheader: row.preheader || '',
  category: row.category || 'marketing',
  industry: row.industry || 'General',
  language: row.language || 'en',
  status: row.status || (row.is_archived ? 'archived' : 'draft'),
  visibility: row.visibility || (row.is_system_template ? 'system' : 'private'),
  editorType: row.editor_type || 'legacy-html',
  projectJson: row.project_json || null,
  mjmlContent: row.mjml_content || row.template_versions?.[0]?.mjml_source || '',
  compiledHtml: row.compiled_html || row.template_versions?.[0]?.html_source || '',
  plainText: row.plain_text || '',
  thumbnailUrl: row.thumbnail_url || null,
  versionNumber: row.version_number || row.template_versions?.[0]?.version_number || 1,
  isSystemTemplate: Boolean(row.is_system_template),
  isArchived: Boolean(row.is_archived),
  updatedAt: row.updated_at || row.created_at,
  createdAt: row.created_at,
});

async function latestVersionByTemplateIds(templateIds: string[]) {
  if (templateIds.length === 0) return new Map<string, any>();
  const { data, error } = await supabase
    .from('template_versions')
    .select('id, template_id, subject, html_source, mjml_source, version_number, status, created_at, created_by')
    .in('template_id', templateIds)
    .order('version_number', { ascending: false });
  if (error) throw error;

  const byTemplate = new Map<string, any>();
  for (const version of data || []) {
    if (!byTemplate.has(version.template_id)) byTemplate.set(version.template_id, version);
  }
  return byTemplate;
}

async function attachLatestVersions(rows: any[]) {
  const versions = await latestVersionByTemplateIds(rows.map((row) => row.id));
  return rows.map((row) => ({
    ...row,
    template_versions: versions.has(row.id) ? [versions.get(row.id)] : [],
  }));
}

export async function listTemplates(query: Record<string, any>) {
  const productId = await ensureProductId();
  let request = supabase
    .from('email_templates')
    .select('*')
    .eq('product_id', productId)
    .is('deleted_at', null)
    .eq('is_system_template', false)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(Math.min(Number(query.limit || 50), 100));

  if (query.status && query.status !== 'all') request = request.eq('status', query.status);

  const categoryParam = String(query.category || 'all').trim();
  if (categoryParam !== 'all') {
    const matchedCat = CATEGORY_DEFINITIONS.find(
      (c) => c.id === categoryParam || c.name.toLowerCase() === categoryParam.toLowerCase()
    );
    if (matchedCat?.isCatchAll) {
      const categorizedKeys = CATEGORY_DEFINITIONS
        .filter((category) => !category.isCatchAll)
        .flatMap((category) => category.matchKeys);
      if (categorizedKeys.length > 0) {
        request = request.not('key', 'in', '(' + categorizedKeys.join(',') + ')');
      }
    } else if (matchedCat && matchedCat.matchKeys.length > 0) {
      request = request.in('key', matchedCat.matchKeys);
    } else {
      request = request.eq('category', categoryParam);
    }
  }

  if (query.industry && query.industry !== 'all') request = request.eq('industry', query.industry);
  if (query.search) request = request.ilike('name', `%${String(query.search).trim()}%`);

  const { data, error } = await request;
  if (error) return listLegacyTemplates();
  return (await attachLatestVersions(data || [])).map(asTemplate);
}

export async function listGalleryTemplates(query: Record<string, any>) {
  const search = String(query.search || '').toLowerCase().trim();
  const category = String(query.category || 'all');
  const industry = String(query.industry || 'all');
  return systemTemplateSeeds
    .filter((seed) => !search || `${seed.name} ${seed.category} ${seed.industry}`.toLowerCase().includes(search))
    .filter((seed) => category === 'all' || seed.category.toLowerCase() === category.toLowerCase())
    .filter((seed) => industry === 'all' || seed.industry.toLowerCase() === industry.toLowerCase())
    .map((seed) => {
      const compiled = compileMjml(seed.mjml);
      return {
        id: seed.key,
        key: seed.key,
        name: seed.name,
        description: seed.description,
        subject: seed.subject,
        preheader: seed.preheader,
        category: seed.category,
        industry: seed.industry,
        mjmlContent: seed.mjml,
        compiledHtml: compiled.html,
        isSystemTemplate: true,
        featured: Boolean(seed.featured),
        responsive: true,
        creator: 'SuperMailBox',
      };
    });
}

export async function getTemplate(id: string) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return asTemplate((await attachLatestVersions([data]))[0]);
}

export async function createBlankTemplate(name = 'Untitled email template') {
  return createTemplateFromMjml({
    sourceKey: null,
    name,
    category: 'marketing',
    industry: 'General',
    subject: name,
    preheader: 'Add a short inbox preview.',
    mjmlContent: blankMjml,
  });
}

export async function cloneSystemTemplate(seedKey: string, name?: string) {
  const seed = systemTemplateSeeds.find((item) => item.key === seedKey);
  if (!seed) throw new Error('Template seed not found.');
  return createTemplateFromMjml({
    sourceKey: seed.key,
    name: name || seed.name,
    category: dbCategory(seed.category),
    industry: seed.industry,
    subject: seed.subject,
    preheader: seed.preheader,
    mjmlContent: seed.mjml,
  });
}

export async function createTemplateFromMjml(input: {
  sourceKey: string | null;
  name: string;
  category: string;
  industry: string;
  subject: string;
  preheader: string;
  mjmlContent: string;
}) {
  const productId = await ensureProductId();
  const compiled = compileMjml(input.mjmlContent);
  const key = slugify(`${input.name}-${Date.now().toString(36)}`);
  const { data: template, error } = await supabase
    .from('email_templates')
    .insert({
      product_id: productId,
      workspace_id: DEFAULT_WORKSPACE_ID,
      owner_id: DEFAULT_OWNER_ID,
      source_template_id: null,
      key,
      name: input.name,
    category: dbCategory(input.category),
      industry: input.industry,
      subject: input.subject,
      preheader: input.preheader,
      status: 'draft',
      visibility: 'private',
      editor_type: 'grapesjs-mjml',
      project_json: { schemaVersion: 1, editor: 'grapesjs-mjml', seedKey: input.sourceKey },
      mjml_content: input.mjmlContent,
      compiled_html: compiled.html,
      plain_text: compiled.plainText,
      version_number: 1,
      is_system_template: false,
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  await createVersion(template.id, {
    ...asTemplate(template),
    mjmlContent: input.mjmlContent,
    compiledHtml: compiled.html,
    plainText: compiled.plainText,
    versionNumber: 1,
  }, 'created');
  return asTemplate(template);
}

export async function updateTemplate(id: string, rawInput: TemplateWriteInput, saveReason = 'manual') {
  const input = templateWriteSchema.parse(rawInput);
  const existing = await getTemplate(id);
  if (!existing) throw new Error('Template not found.');
  if (input.expectedVersion !== undefined && input.expectedVersion !== existing.versionNumber) {
    const error = new Error('Template was changed elsewhere. Refresh before saving again.');
    (error as any).statusCode = 409;
    throw error;
  }

  const mjmlContent = input.mjmlContent ?? (existing.mjmlContent || '');
  const compiled = input.compiledHtml
    ? { html: input.compiledHtml, plainText: input.plainText || stripHtml(input.compiledHtml), errors: [] }
    : compileMjml(mjmlContent || blankMjml);
  const nextVersion = existing.versionNumber + 1;
  const patch = {
    name: input.name ?? existing.name,
    subject: input.subject ?? existing.subject,
    preheader: input.preheader ?? existing.preheader,
    category: input.category ?? existing.category,
    industry: input.industry ?? existing.industry,
    status: input.status ?? existing.status,
    visibility: input.visibility ?? existing.visibility,
    editor_type: input.editorType ?? existing.editorType,
    project_json: input.projectJson ?? existing.projectJson,
    mjml_content: mjmlContent,
    compiled_html: compiled.html,
    plain_text: compiled.plainText,
    version_number: nextVersion,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('email_templates').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  await createVersion(id, asTemplate(data), saveReason);
  return asTemplate(data);
}

export async function duplicateTemplate(id: string) {
  const template = await getTemplate(id);
  if (!template) throw new Error('Template not found.');
  return createTemplateFromMjml({
    sourceKey: template.key,
    name: `${template.name} Copy`,
    category: template.category,
    industry: template.industry,
    subject: template.subject,
    preheader: template.preheader,
    mjmlContent: template.mjmlContent || blankMjml,
  });
}

export async function archiveTemplate(id: string) {
  try {
    const { error } = await supabase
      .from('email_templates')
      .update({ is_archived: true, status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      await supabase.from('email_templates').update({ status: 'archived' }).eq('id', id);
    }
  } catch (err: any) {
    console.warn('archiveTemplate exception handled gracefully:', err?.message || err);
  }
}

export async function softDeleteTemplate(id: string) {
  try {
    const { error } = await supabase
      .from('email_templates')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      await supabase.from('email_templates').update({ current_version_id: null }).eq('id', id);
      await supabase.from('template_versions').delete().eq('template_id', id);

      const del = await supabase.from('email_templates').delete().eq('id', id);
      if (del.error) {
        await supabase
          .from('email_templates')
          .update({ is_archived: true, status: 'archived', updated_at: new Date().toISOString() })
          .eq('id', id);
      }
    }
  } catch (err: any) {
    console.warn('softDeleteTemplate exception handled gracefully:', err?.message || err);
  }
}

export async function listTemplateVersions(templateId: string) {
  const { data, error } = await supabase
    .from('template_versions')
    .select('id, template_id, version_number, subject, html_source, mjml_source, status, created_by, created_at, save_reason')
    .eq('template_id', templateId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function restoreTemplateVersion(templateId: string, versionId: string) {
  const { data, error } = await supabase
    .from('template_versions')
    .select('subject, html_source, mjml_source')
    .eq('id', versionId)
    .eq('template_id', templateId)
    .single();
  if (error) throw error;
  return updateTemplate(templateId, {
    subject: data.subject,
    mjmlContent: data.mjml_source || blankMjml,
  }, 'restore');
}

export async function compileTemplateById(id: string) {
  const template = await getTemplate(id);
  if (!template) throw new Error('Template not found.');
  if (template.editorType === 'react-email-editor' && template.compiledHtml) {
    const plainText = template.plainText || stripHtml(template.compiledHtml);
    return {
      html: template.compiledHtml,
      plainText,
      errors: [],
      quality: runTemplateQualityChecks({
        subject: template.subject,
        preheader: template.preheader,
        mjml: template.mjmlContent || '',
        html: template.compiledHtml,
        plainText,
        category: template.category,
      }),
    };
  }
  const compiled = compileMjml(template.mjmlContent || blankMjml);
  return {
    ...compiled,
    quality: runTemplateQualityChecks({
      subject: template.subject,
      preheader: template.preheader,
      mjml: template.mjmlContent,
      html: compiled.html,
      plainText: compiled.plainText,
      category: template.category,
    }),
  };
}

async function createVersion(templateId: string, template: any, reason: string) {
  const { error } = await supabase.from('template_versions').insert({
    template_id: templateId,
    workspace_id: DEFAULT_WORKSPACE_ID,
    version_number: template.versionNumber,
    subject: template.subject || 'Untitled',
    html_source: template.compiledHtml || '',
    mjml_source: template.mjmlContent || '',
    project_json: template.projectJson || {},
    plain_text: template.plainText || '',
    status: reason === 'manual' ? 'approved' : 'draft',
    created_by: 'Admin',
    save_reason: reason,
  });
  if (error) throw error;
}

async function listLegacyTemplates() {
  const { data: templatesData, error } = await supabase.from('email_templates').select('id, key, category, created_at');
  if (error) throw error;
  return (templatesData || []).map((row: any) => asTemplate(row));
}

const prettifyKey = (key: string) => key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
const stripHtml = (html: string) => html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export interface CategoryDefinition {
  id: string;
  name: string;
  app: 'getaipilot' | 'campaign' | 'gap_whatsapp' | 'socialpilot' | 'general';
  appName: string;
  description: string;
  eventTrigger: string;
  defaultKey: string;
  matchKeys: string[];
  isCatchAll?: boolean;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  // ── GETAIPILOT EDGE FUNCTION: send-auth-email ────────────────────────────
  {
    id: 'confirm_email',
    name: 'Signup & Email Verification',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Triggered when a user signs up on getaipilot.in — sends the official verification link to activate their account and access their dashboard.',
    eventTrigger: 'send-auth-email (signup / confirm_email)',
    defaultKey: 'getaipilot_confirm_email',
    matchKeys: ['getaipilot_confirm_email', 'getaipilot_confirm_email_v2', 'getaipilot_confirm_email_v3', 'getaipilot_confirm_email_v4']
  },
  {
    id: 'reset_password',
    name: 'Password Reset & Account Recovery',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Triggered when a user clicks "Forgot Password" or requests a secure link to reset and update their account credentials.',
    eventTrigger: 'send-auth-email (recovery / reset_password)',
    defaultKey: 'getaipilot_reset_password',
    matchKeys: ['getaipilot_reset_password', 'getaipilot_reset_password_v2']
  },
  {
    id: 'magic_link_otp',
    name: 'Magic Link & OTP Instant Login',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Triggered when a user requests passwordless authentication via 6-digit OTP code or 1-click magic sign-in link.',
    eventTrigger: 'send-auth-email (magiclink / otp_login)',
    defaultKey: 'getaipilot_magic_link_otp',
    matchKeys: ['getaipilot_magic_link_otp', 'getaipilot_magic_link_otp_v2', 'getaipilot_magic_link_otp_v3', 'otp_login']
  },
  {
    id: 'change_email',
    name: 'Email Address Update & Confirmation',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Triggered when an authenticated user modifies their primary account email in profile settings to verify the new address.',
    eventTrigger: 'send-auth-email (email_change)',
    defaultKey: 'getaipilot_change_email',
    matchKeys: ['getaipilot_change_email', 'getaipilot_change_email_v2', 'getaipilot_change_email_v3']
  },
  {
    id: 'invite_user',
    name: 'Team & Workspace Invites',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Triggered when an organization admin invites colleagues or collaborators to join their GetAiPilot workspace.',
    eventTrigger: 'send-auth-email (invite / team_member)',
    defaultKey: 'getaipilot_invite_user',
    matchKeys: ['getaipilot_invite_user', 'getaipilot_invite_user_v2', 'getaipilot_invite_user_v3']
  },
  {
    id: 'reauthentication',
    name: 'Security Re-Authentication (Sudo Mode)',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Triggered for high-security actions (API key regeneration, organization plan changes) requiring identity re-verification.',
    eventTrigger: 'send-auth-email (reauthentication / sudo_mode)',
    defaultKey: 'getaipilot_reauthentication',
    matchKeys: ['getaipilot_reauthentication', 'getaipilot_reauthentication_v2', 'getaipilot_reauthentication_v3']
  },

  // GETAIPILOT EDGE FUNCTION: ai-welcome-followup
  {
    id: 'ai_lifecycle_followup',
    name: 'AI Lifecycle Follow-up',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'The AI follow-up service sends generated welcome, incomplete-setup, and subscription-expiry messages through one live Supermail template request.',
    eventTrigger: 'ai-welcome-followup -> ai_welcome_followup',
    defaultKey: 'ai_welcome_followup',
    matchKeys: ['ai_welcome_followup']
  },

  // GETAIPILOT ADMIN NOTIFICATIONS: one request contract per category
  {
    id: 'waitlist_notification',
    name: 'Feature Waitlist Notification',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Notifies the GetAiPilot admin when a user joins the waitlist for a named feature.',
    eventTrigger: 'notify-admin-waitlist -> waitlist_notification',
    defaultKey: 'waitlist_notification',
    matchKeys: ['waitlist_notification']
  },
  {
    id: 'review_notification',
    name: 'New Review Notification',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Sends the admin a rating, review text, author details, and the GetAiPilot surface where the review was submitted.',
    eventTrigger: 'send-review-email -> review_notification',
    defaultKey: 'review_notification',
    matchKeys: ['review_notification']
  },
  {
    id: 'newsletter_notification',
    name: 'Newsletter Signup Notification',
    app: 'getaipilot',
    appName: 'GetAiPilot Core',
    description: 'Notifies the admin after a new newsletter subscriber is stored and synchronized with Supermail contacts.',
    eventTrigger: 'subscribe-newsletter -> newsletter_notification',
    defaultKey: 'newsletter_notification',
    matchKeys: ['newsletter_notification']
  },

  // SATELLITE APPLICATIONS
  {
    id: 'gap_whatsapp',
    name: 'WhatsApp Broadcasts & Automations',
    app: 'gap_whatsapp',
    appName: 'GAP WhatsApp',
    description: 'Triggered by GAP WhatsApp engine for broadcast completion alerts, failure notices, and WhatsApp OTP verification.',
    eventTrigger: 'broadcast_published / broadcast_failed / whatsapp_otp',
    defaultKey: 'gap_whatsapp_welcome',
    matchKeys: ['gap_whatsapp_otp', 'gap_whatsapp_welcome', 'broadcast_success', 'broadcast_failed', 'team_invite']
  },
  {
    id: 'socialpilot',
    name: 'SocialPilot & AutoDM Notifications',
    app: 'socialpilot',
    appName: 'SocialPilot',
    description: 'Triggered by SocialPilot for social account connections, auto-DM automation setup alerts, and welcome triggers.',
    eventTrigger: 'account_connected / automation_created / auth_welcome',
    defaultKey: 'auth_welcome',
    matchKeys: ['account_connected', 'auth_welcome', 'automation_created', 'broadcast_notification']
  },
  {
    id: 'campaigns',
    name: 'Campaigns & Remaining Templates',
    app: 'campaign',
    appName: 'Campaigns',
    description: 'Contains every library template that is not assigned to a live GetAiPilot, GAP WhatsApp, or SocialPilot request flow.',
    eventTrigger: 'campaign composer / template library',
    defaultKey: 'campaigns',
    matchKeys: [],
    isCatchAll: true
  }
];

const CATEGORY_DEFAULTS_RECORD_KEY = '__system_category_defaults__';

async function getStoredCategoryDefaults(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from('email_templates')
      .select('project_json')
      .eq('key', CATEGORY_DEFAULTS_RECORD_KEY)
      .maybeSingle();

    if (data?.project_json && typeof data.project_json === 'object') {
      return ((data.project_json as any).defaults || {}) as Record<string, string>;
    }
  } catch (err) {
    console.warn('[getStoredCategoryDefaults] Read warning:', err);
  }
  return {};
}

export async function getCategoryGroupsWithDefaults() {
  const { data: rawTemplates, error } = await supabase
    .from('email_templates')
    .select('*')
    .neq('key', CATEGORY_DEFAULTS_RECORD_KEY)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false, nullsFirst: false });

  if (error) throw error;

  const templatesWithVersions = await attachLatestVersions(rawTemplates || []);
  const allTemplates = templatesWithVersions.map(asTemplate);
  const storedDefaults = await getStoredCategoryDefaults();

  const assignedTemplateIds = new Set<string>();
  const categoryOwnerByKey = new Map(
    CATEGORY_DEFINITIONS.flatMap((definition) => definition.matchKeys.map((key) => [key, definition.id] as const))
  );

  const categoryGroups = CATEGORY_DEFINITIONS.map((def) => {
    // Match templates belonging to this category
    const matchingTemplates = allTemplates.filter((t) => {
      const explicitOwner = categoryOwnerByKey.get(t.key);
      if (def.isCatchAll) return !explicitOwner;
      if (explicitOwner) return explicitOwner === def.id;
      return false;
    });

    matchingTemplates.forEach((t) => assignedTemplateIds.add(t.id));

    // Resolve active default template
    const supportsDefault = !def.isCatchAll;
    let activeDefaultTemplate = supportsDefault ? matchingTemplates.find((t) => {
      const pJson = (t.projectJson as any) || {};
      if (storedDefaults[def.id] && (t.id === storedDefaults[def.id] || t.key === storedDefaults[def.id])) return true;
      if (pJson.is_category_default) return true;
      return false;
    }) : null;

    if (supportsDefault && !activeDefaultTemplate) {
      activeDefaultTemplate = matchingTemplates.find((t) => t.key === def.defaultKey) || matchingTemplates[0] || null;
    }

    const templatesWithDefaultFlag = matchingTemplates.map((t) => ({
      ...t,
      isDefault: supportsDefault && activeDefaultTemplate ? t.id === activeDefaultTemplate.id : false,
    }));

    return {
      id: def.id,
      name: def.name,
      app: def.app,
      appName: def.appName,
      description: def.description,
      eventTrigger: def.eventTrigger,
      defaultKey: def.defaultKey,
      supportsDefault,
      activeDefaultTemplateId: activeDefaultTemplate?.id || null,
      activeDefaultTemplateKey: activeDefaultTemplate?.key || def.defaultKey,
      activeDefaultTemplateName: activeDefaultTemplate?.name || 'Default Template',
      variantsCount: matchingTemplates.length,
      templates: templatesWithDefaultFlag,
    };
  });

  const totalVariants = assignedTemplateIds.size;
  const totalCategories = categoryGroups.length;
  const defaultCategories = categoryGroups.filter((category) => category.supportsDefault);
  const totalDefaultCategories = defaultCategories.length;
  const activeDefaultsAssigned = defaultCategories.filter((category) => Boolean(category.activeDefaultTemplateId)).length;

  return {
    categories: categoryGroups,
    summary: {
      totalCategories,
      totalVariants,
      totalLibraryTemplates: allTemplates.length,
      totalDefaultCategories,
      activeDefaultsAssigned,
      apps: [
        { id: 'getaipilot', name: 'GetAiPilot Core', count: categoryGroups.filter((c) => c.app === 'getaipilot').length },
        { id: 'campaign', name: 'Campaigns', count: categoryGroups.filter((c) => c.app === 'campaign').length },
        { id: 'gap_whatsapp', name: 'GAP WhatsApp', count: categoryGroups.filter((c) => c.app === 'gap_whatsapp').length },
        { id: 'socialpilot', name: 'SocialPilot', count: categoryGroups.filter((c) => c.app === 'socialpilot').length },
      ],
    },
  };
}

export async function setDefaultTemplateForCategory(categoryId: string, templateIdOrKey: string) {
  const categoryDef = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId);
  if (!categoryDef) throw new Error(`Category "${categoryId}" not found.`);
  if (categoryDef.isCatchAll) throw new Error(`Category "${categoryId}" does not support an active default.`);

  // Find target template
  const { data: targetTemplate, error: targetErr } = await supabase
    .from('email_templates')
    .select('*')
    .or(`id.eq.${templateIdOrKey},key.eq.${templateIdOrKey}`)
    .maybeSingle();

  if (targetErr || !targetTemplate) {
    throw new Error(`Template "${templateIdOrKey}" not found.`);
  }

  // Update stored defaults record
  const currentDefaults = await getStoredCategoryDefaults();
  currentDefaults[categoryId] = targetTemplate.id;

  const productId = await ensureProductId();
  await supabase.from('email_templates').upsert({
    key: CATEGORY_DEFAULTS_RECORD_KEY,
    name: 'System Category Defaults Configuration',
    product_id: productId,
    category: 'system',
    status: 'published',
    project_json: {
      defaults: currentDefaults,
      updated_at: new Date().toISOString(),
    },
  }, { onConflict: 'key' });

  // Update project_json for target template
  const currentPJson = (targetTemplate.project_json && typeof targetTemplate.project_json === 'object') ? targetTemplate.project_json : {};
  await supabase.from('email_templates').update({
    project_json: {
      ...currentPJson,
      is_category_default: true,
      category_id: categoryId,
    },
    updated_at: new Date().toISOString(),
  }).eq('id', targetTemplate.id);

  // Clear is_category_default on other templates for this category
  const siblingKeys = categoryDef.matchKeys.filter((k) => k !== targetTemplate.key);
  if (siblingKeys.length > 0 || categoryDef.isCatchAll) {
    let siblingRequest = supabase
      .from('email_templates')
      .select('id, key, project_json')
      .neq('id', targetTemplate.id);

    if (categoryDef.isCatchAll) {
      const categorizedKeys = CATEGORY_DEFINITIONS
        .filter((category) => !category.isCatchAll)
        .flatMap((category) => category.matchKeys);
      if (categorizedKeys.length > 0) {
        siblingRequest = siblingRequest.not('key', 'in', '(' + categorizedKeys.join(',') + ')');
      }
    } else {
      siblingRequest = siblingRequest.in('key', siblingKeys);
    }

    const { data: siblings } = await siblingRequest;

    for (const sib of siblings || []) {
      const sibJson = (sib.project_json && typeof sib.project_json === 'object') ? sib.project_json : {};
      if (sibJson.is_category_default) {
        await supabase.from('email_templates').update({
          project_json: {
            ...sibJson,
            is_category_default: false,
          },
        }).eq('id', sib.id);
      }
    }
  }

  return {
    success: true,
    categoryId,
    activeDefaultTemplateId: targetTemplate.id,
    activeDefaultTemplateKey: targetTemplate.key,
    activeDefaultTemplateName: targetTemplate.name,
  };
}

export async function resolveCategoryDefaultTemplateKey(templateKey: string): Promise<string> {
  // Check if templateKey is a category default key or category alias
  const matchedCategory = CATEGORY_DEFINITIONS.find((cat) =>
    !cat.isCatchAll && (cat.id === templateKey || cat.defaultKey === templateKey)
  );

  if (matchedCategory) {
    const storedDefaults = await getStoredCategoryDefaults();
    const configuredDefaultId = storedDefaults[matchedCategory.id];
    if (configuredDefaultId) {
      return configuredDefaultId;
    }
    return matchedCategory.defaultKey;
  }

  return templateKey;
}

