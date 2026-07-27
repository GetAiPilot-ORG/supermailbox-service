import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { brandRepository } from '../services/brandRepository.js';
import { cloudinaryService } from '../services/cloudinary.service.js';

export async function registerBrandRoutes(fastify: FastifyInstance) {
  // Helper wrapper for consistent API responses
  const safe = async (reply: FastifyReply, action: () => Promise<any> | any) => {
    try {
      const data = await action();
      return reply.send({ success: true, data });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      return reply.status(statusCode).send({ success: false, error: err?.message || 'Brand library request failed.' });
    }
  };

  // 1. Overview & Stats
  fastify.get('/v1/brand/overview', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.getOverviewStats(request.query.brandId));
  });

  // 2. Brands Registry
  fastify.get('/v1/brand/brands', async (_request, reply) => {
    return safe(reply, () => brandRepository.listBrands());
  });

  fastify.post('/v1/brand/brands', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.createBrand(request.body as any));
  });

  // 3. Asset Folders
  fastify.get('/v1/brand/folders', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listFolders(request.query.brandId));
  });

  fastify.post('/v1/brand/folders', async (request: FastifyRequest<{ Body: { name: string; parentId?: string; brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.createFolder(request.body.name, request.body.parentId, request.body.brandId));
  });

  // 4. Cloudinary Signing Endpoint
  fastify.post('/v1/brand/cloudinary/sign', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => cloudinaryService.requestSignedUpload(request.body || {}));
  });

  // 5. Brand Assets (Media Library)
  fastify.get('/v1/brand/assets', async (request: FastifyRequest<{ Querystring: any }>, reply) => {
    return safe(reply, () => brandRepository.listAssets(request.query || {}));
  });

  fastify.post('/v1/brand/assets', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.saveAsset(request.body as any));
  });

  fastify.patch('/v1/brand/assets/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    return safe(reply, () => brandRepository.updateAsset(request.params.id, request.body as any));
  });

  fastify.post('/v1/brand/assets/:id/archive', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    return safe(reply, () => brandRepository.softDeleteAsset(request.params.id));
  });

  fastify.post('/v1/brand/assets/:id/restore', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    return safe(reply, () => brandRepository.restoreAsset(request.params.id));
  });

  fastify.delete('/v1/brand/assets/:id', async (request: FastifyRequest<{ Params: { id: string }; Querystring: { publicId?: string } }>, reply) => {
    try {
      const res = await cloudinaryService.permanentlyDeleteAsset(request.params.id, request.query.publicId);
      if (!res.success) {
        return reply.status(400).send({ success: false, error: res.error });
      }
      return reply.send({ success: true, data: { deleted: true } });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  fastify.post('/v1/brand/assets/track-usage', async (request: FastifyRequest<{ Body: { assetId: string; resourceType: string; resourceId: string; context?: string } }>, reply) => {
    return safe(reply, async () => {
      await cloudinaryService.trackAssetUsage(request.body.assetId, request.body.resourceType, request.body.resourceId, request.body.context);
      return { tracked: true };
    });
  });

  // 6. Brand Contacts
  fastify.get('/v1/brand/contacts', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listContacts(request.query.brandId));
  });

  fastify.post('/v1/brand/contacts', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.saveContact(request.body as any));
  });

  fastify.delete('/v1/brand/contacts/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    return safe(reply, () => brandRepository.deleteContact(request.params.id));
  });

  // 7. Brand Links & URLs
  fastify.get('/v1/brand/links', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listLinks(request.query.brandId));
  });

  fastify.post('/v1/brand/links', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.saveLink(request.body as any));
  });

  fastify.delete('/v1/brand/links/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    return safe(reply, () => brandRepository.deleteLink(request.params.id));
  });

  // 8. Brand Social Profiles
  fastify.get('/v1/brand/social', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listSocialProfiles(request.query.brandId));
  });

  fastify.post('/v1/brand/social', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.saveSocialProfile(request.body as any));
  });

  fastify.delete('/v1/brand/social/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    return safe(reply, () => brandRepository.deleteSocialProfile(request.params.id));
  });

  // 9. Brand Styles
  fastify.get('/v1/brand/styles', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.getBrandStyles(request.query.brandId));
  });

  fastify.put('/v1/brand/styles', async (request: FastifyRequest<{ Body: { tokens: Record<string, any>; brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.updateBrandStyles(request.body.tokens, request.body.brandId));
  });

  // 10. Brand Snippets
  fastify.get('/v1/brand/snippets', async (request: FastifyRequest<{ Querystring: any }>, reply) => {
    return safe(reply, () => brandRepository.listSnippets(request.query || {}));
  });

  fastify.post('/v1/brand/snippets', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.saveSnippet(request.body as any));
  });

  fastify.delete('/v1/brand/snippets/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    return safe(reply, () => brandRepository.deleteSnippet(request.params.id));
  });

  // 11. Signatures, Footers & Saved Blocks
  fastify.get('/v1/brand/signatures', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listSignatures(request.query.brandId));
  });

  fastify.get('/v1/brand/footers', async (request: FastifyRequest<{ Querystring: { brandId?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listFooters(request.query.brandId));
  });

  fastify.get('/v1/brand/blocks', async (request: FastifyRequest<{ Querystring: { brandId?: string; category?: string } }>, reply) => {
    return safe(reply, () => brandRepository.listSavedBlocks(request.query.brandId, request.query.category));
  });

  fastify.post('/v1/brand/blocks', async (request: FastifyRequest<{ Body: any }>, reply) => {
    return safe(reply, () => brandRepository.saveBlock(request.body as any));
  });

  // 12. Dynamic Resource Token Resolver
  fastify.post('/v1/brand/resolve-tokens', async (request: FastifyRequest<{ Body: { content: string; brandId?: string } }>, reply) => {
    return safe(reply, async () => {
      const compiled = await brandRepository.resolveBrandTokens(request.body.content || '', request.body.brandId);
      return { compiled };
    });
  });
}
