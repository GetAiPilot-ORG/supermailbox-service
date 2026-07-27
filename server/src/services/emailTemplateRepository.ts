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
  if (query.category && query.category !== 'all') request = request.eq('category', query.category);
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
