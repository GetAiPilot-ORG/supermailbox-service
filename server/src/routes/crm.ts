import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import {
  addLeadActivity,
  createTask,
  createTicket,
  extractLeads,
  getLeadDetail,
  getOverview,
  getStaff,
  ingestProductEvent,
  listLeads,
  listTasks,
  listTickets,
  syncGetAiPilotLeads,
  updateLead,
  updateTask,
  updateTicket,
  verifyProductEventKey,
} from '../modules/crm/service.js';

const enabled = () => process.env.CRM_ENABLED !== 'false';

const handleError = (reply: FastifyReply, error: any) => {
  if (error instanceof ZodError) return reply.status(400).send({ success: false, error: 'Invalid event payload.', issues: error.issues });
  const message = error?.message || 'CRM request failed.';
  const isValidation = /required|valid|reversing|Nurture|Lost/i.test(message);
  return reply.status(isValidation ? 400 : 500).send({ success: false, error: message });
};

export async function registerCrmRoutes(fastify: FastifyInstance) {
  fastify.get('/v1/crm/status', async (_request, reply) => reply.send({ success: true, enabled: enabled() }));

  fastify.post('/v1/crm/events', async (request: FastifyRequest<{ Body: unknown }>, reply) => {
    if (!enabled()) return reply.status(404).send({ success: false, error: 'CRM workspace is disabled.' });
    if (!verifyProductEventKey(request.headers['x-product-event-key'])) {
      return reply.status(401).send({ success: false, error: 'Invalid product event key.' });
    }
    try {
      const result = await ingestProductEvent(request.body);
      return reply.status(result.duplicate ? 200 : 202).send({ success: true, ...result });
    } catch (error) {
      fastify.log.error(error);
      return handleError(reply, error);
    }
  });

  fastify.get('/v1/crm/overview', async (request, reply) => {
    if (!enabled()) return reply.status(404).send({ success: false, error: 'CRM workspace is disabled.' });
    try {
      return reply.send({ success: true, overview: await getOverview((request.query as any)?.range) });
    } catch (error) {
      fastify.log.error(error);
      return handleError(reply, error);
    }
  });

  fastify.get('/v1/crm/leads', async (request, reply) => {
    if (!enabled()) return reply.status(404).send({ success: false, error: 'CRM workspace is disabled.' });
    try {
      return reply.send({ success: true, ...(await listLeads((request.query as any) || {})) });
    } catch (error) {
      fastify.log.error(error);
      return handleError(reply, error);
    }
  });

  fastify.get('/v1/crm/staff', async (_request, reply) => {
    try {
      return reply.send({ success: true, staff: await getStaff() });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.post('/v1/crm/leads/extract', async (request: FastifyRequest<{ Body: { ids?: string[]; allNew?: boolean } }>, reply) => {
    try {
      const result = await extractLeads(request.body || {});
      return reply.send({ success: true, ...result });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.post('/v1/crm/leads/:id/sync-ecosystem', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      return reply.send({ success: true, queued: true, platforms: ['supermailbox', 'whatsapp', 'voice', 'social'] });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.get('/v1/crm/leads/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const detail = await getLeadDetail(request.params.id);
      return detail ? reply.send({ success: true, ...detail }) : reply.status(404).send({ success: false, error: 'Lead not found.' });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.patch('/v1/crm/leads/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    try {
      const lead = await updateLead(request.params.id, request.body || {});
      return lead ? reply.send({ success: true, lead }) : reply.status(404).send({ success: false, error: 'Lead not found.' });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.post('/v1/crm/leads/:id/activities', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    try {
      return reply.status(201).send({ success: true, activity: await addLeadActivity(request.params.id, request.body || {}) });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.get('/v1/crm/tasks', async (request, reply) => {
    try {
      return reply.send({ success: true, tasks: await listTasks((request.query as any) || {}) });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.post('/v1/crm/tasks', async (request: FastifyRequest<{ Body: any }>, reply) => {
    try {
      return reply.status(201).send({ success: true, task: await createTask(request.body || {}) });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.patch('/v1/crm/tasks/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    try {
      const task = await updateTask(request.params.id, request.body || {});
      return task ? reply.send({ success: true, task }) : reply.status(404).send({ success: false, error: 'Task not found.' });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.get('/v1/crm/tickets', async (request, reply) => {
    try {
      return reply.send({ success: true, tickets: await listTickets((request.query as any) || {}) });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.post('/v1/crm/tickets', async (request: FastifyRequest<{ Body: any }>, reply) => {
    try {
      return reply.status(201).send({ success: true, ticket: await createTicket(request.body || {}) });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.patch('/v1/crm/tickets/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    try {
      const ticket = await updateTicket(request.params.id, request.body || {});
      return ticket ? reply.send({ success: true, ticket }) : reply.status(404).send({ success: false, error: 'Ticket not found.' });
    } catch (error) {
      return handleError(reply, error);
    }
  });

  fastify.post('/v1/crm/sync', async (request: FastifyRequest<{ Body: { force?: boolean } }>, reply) => {
    if (!enabled()) return reply.status(404).send({ success: false, error: 'CRM workspace is disabled.' });
    try {
      const force = request.body?.force !== false;
      return reply.send({ success: true, sync: await syncGetAiPilotLeads(force) });
    } catch (error) {
      fastify.log.error(error);
      return handleError(reply, error);
    }
  });
}

