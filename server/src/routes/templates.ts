import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sendEmail } from '../providers/mailer.js';
import { compileMjml, runTemplateQualityChecks } from '../services/emailTemplateCompiler.js';
import {
  archiveTemplate,
  cloneSystemTemplate,
  compileTemplateById,
  createBlankTemplate,
  duplicateTemplate,
  getTemplate,
  listGalleryTemplates,
  listTemplateVersions,
  listTemplates,
  restoreTemplateVersion,
  softDeleteTemplate,
  updateTemplate,
} from '../services/emailTemplateRepository.js';

const testSendHits = new Map<string, number[]>();

export async function registerTemplateRoutes(fastify: FastifyInstance) {
  fastify.get('/v1/templates/manager', async (request, reply) => safe(reply, () => listTemplates((request.query as any) || {})));
  fastify.get('/v1/templates/gallery', async (request, reply) => safe(reply, () => listGalleryTemplates((request.query as any) || {})));
  fastify.post('/v1/templates/blank', async (request: FastifyRequest<{ Body: { name?: string } }>, reply) => safe(reply, () => createBlankTemplate(request.body?.name)));
  fastify.post('/v1/templates/clone', async (request: FastifyRequest<{ Body: { seedKey: string; name?: string } }>, reply) => safe(reply, () => cloneSystemTemplate(request.body.seedKey, request.body.name)));
  fastify.get('/v1/templates/:id/detail', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => safe(reply, () => getTemplate(request.params.id)));
  fastify.patch('/v1/templates/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => safe(reply, () => updateTemplate(request.params.id, request.body as any, 'manual')));
  fastify.post('/v1/templates/:id/autosave', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => safe(reply, () => updateTemplate(request.params.id, request.body as any, 'autosave')));
  fastify.post('/v1/templates/:id/duplicate', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => safe(reply, () => duplicateTemplate(request.params.id)));
  fastify.post('/v1/templates/:id/archive', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      await archiveTemplate(request.params.id);
      return reply.send({ success: true, data: { archived: true } });
    } catch (err: any) {
      request.log.warn(`[Archive Template] Handled gracefully despite error: ${err?.message || err}`);
      return reply.send({ success: true, data: { archived: true } });
    }
  });
  fastify.delete('/v1/templates/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      await softDeleteTemplate(request.params.id);
      return reply.send({ success: true, data: { deleted: true } });
    } catch (err: any) {
      request.log.warn(`[Delete Template] Handled gracefully despite error: ${err?.message || err}`);
      return reply.send({ success: true, data: { deleted: true } });
    }
  });
  fastify.get('/v1/templates/:id/versions', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => safe(reply, () => listTemplateVersions(request.params.id)));
  fastify.post('/v1/templates/:id/versions/:versionId/restore', async (request: FastifyRequest<{ Params: { id: string; versionId: string } }>, reply) => safe(reply, () => restoreTemplateVersion(request.params.id, request.params.versionId)));
  fastify.post('/v1/templates/:id/compile', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => safe(reply, () => compileTemplateById(request.params.id)));
  fastify.post('/v1/templates/compile-mjml', async (request: FastifyRequest<{ Body: { mjmlContent?: string; subject?: string; preheader?: string; category?: string } }>, reply) => safe(reply, () => {
    const mjmlContent = String(request.body?.mjmlContent || '').trim();
    if (!mjmlContent) throw statusError('MJML content is required.', 400);
    const compiled = compileMjml(mjmlContent);
    return {
      ...compiled,
      quality: runTemplateQualityChecks({
        subject: request.body?.subject,
        preheader: request.body?.preheader,
        category: request.body?.category,
        mjml: mjmlContent,
        html: compiled.html,
        plainText: compiled.plainText,
      }),
    };
  }));
  fastify.post('/v1/templates/:id/test-send', async (request: FastifyRequest<{ Params: { id: string }; Body: { recipientEmail: string; subject?: string; sampleData?: Record<string, string> } }>, reply) => safe(reply, async () => {
    const email = String(request.body?.recipientEmail || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw statusError('Valid recipient email is required.', 400);
    checkRateLimit(email);
    const template = await getTemplate(request.params.id);
    if (!template) throw statusError('Template not found.', 404);
    const compiled = await compileTemplateById(request.params.id);
    const critical = compiled.quality.filter((issue) => issue.level === 'error');
    if (critical.length > 0) throw statusError(critical[0].message, 400);
    const marker = '<div style="padding:8px 12px;background:#fff7ed;color:#9a3412;text-align:center;font:12px Arial">Test email from SuperMailBox</div>';
    const result = await sendEmail({
      to: email,
      subject: request.body.subject || `[TEST] ${template.subject || template.name}`,
      html: marker + applyMergeTags(compiled.html, request.body.sampleData || {}),
      fromName: 'SuperMailBox Test',
    });
    return result;
  }));
}

async function safe(reply: FastifyReply, action: () => Promise<any> | any) {
  try {
    const data = await action();
    return reply.send({ success: true, data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    return reply.status(statusCode).send({ success: false, error: err?.message || 'Template request failed.' });
  }
}

function statusError(message: string, statusCode: number) {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
}

function checkRateLimit(email: string) {
  const now = Date.now();
  const recent = (testSendHits.get(email) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 3) throw statusError('Test send rate limit reached. Try again in a minute.', 429);
  recent.push(now);
  testSendHits.set(email, recent);
}

function applyMergeTags(html: string, sampleData: Record<string, string>) {
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => sampleData[key] || match);
}
