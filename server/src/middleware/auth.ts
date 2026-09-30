import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { supabase } from '../supabase.js';

export async function verifyApiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  requiredScope: string = 'campaign:send'
): Promise<boolean> {
  if (request.method === 'OPTIONS') {
    return true;
  }

  const authHeader = request.headers.authorization || (request.headers as any)['Authorization'];
  const xApiKey = (request.headers['x-api-key'] || (request.headers as any)['X-API-Key']) as string | undefined;

  let rawToken: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    rawToken = authHeader.substring(7).trim();
  } else if (authHeader) {
    rawToken = authHeader.trim();
  } else if (xApiKey) {
    rawToken = xApiKey.trim();
  }

  // Fallback to check ADMIN_API_KEY or ADMIN_TOKEN for dashboard/admin requests or dev mode
  const adminSecret = process.env.ADMIN_API_KEY;
  const adminToken = process.env.ADMIN_TOKEN;
  if (rawToken && ((adminSecret && rawToken === adminSecret) || (adminToken && rawToken === adminToken))) {
    return true;
  }

  if (!rawToken) {
    reply.status(401).send({
      success: false,
      error: 'Missing API key.',
      code: 'API_KEY_MISSING'
    });
    return false;
  }

  // Hash incoming token and query api_keys table
  const keyHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  try {
    const { data: keyRecord, error } = await supabase
      .from('api_keys')
      .select('id, product_id, scopes, is_active')
      .eq('key_hash', keyHash)
      .single();

    if (error || !keyRecord || !keyRecord.is_active) {
      // Allow unverified smb_ keys only if explicitly enabled in local development
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.ALLOW_UNVERIFIED_DEV_API_KEYS === 'true' &&
        rawToken.startsWith('smb_')
      ) {
        return true;
      }
      reply.status(401).send({
        success: false,
        error: 'Invalid or deactivated API key.',
        code: 'API_KEY_INVALID'
      });
      return false;
    }

    // Check scope: empty scopes array denies all access; requires '*' or requiredScope
    const scopes: string[] = Array.isArray(keyRecord.scopes) ? keyRecord.scopes : [];
    const hasPermission = scopes.includes('*') || scopes.includes(requiredScope);
    if (!hasPermission) {
      reply.status(403).send({
        success: false,
        error: `API key missing required scope: ${requiredScope}`,
        code: 'FORBIDDEN_SCOPE'
      });
      return false;
    }

    // Update last_used_at non-blocking
    supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyRecord.id)
      .then(() => {});

    return true;
  } catch (err: any) {
    reply.status(500).send({
      success: false,
      error: 'Failed to verify API key authentication.'
    });
    return false;
  }
}
