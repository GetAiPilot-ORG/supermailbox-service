import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.post('/v1/auth/login', async (request: FastifyRequest<{ Body: { password?: string } }>, reply: FastifyReply) => {
    const { password } = request.body || {};
    
    // Default fallback password if not set in .env
    const validPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!password || password !== validPassword) {
      return reply.status(401).send({ success: false, error: 'Invalid password' });
    }

    return reply.send({ success: true, token: adminToken });
  });
}
