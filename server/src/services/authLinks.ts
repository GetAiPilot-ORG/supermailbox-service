import { createClient } from '@supabase/supabase-js';

type AuthLinkResult = {
  url: string | null;
  error?: string;
};

export const getOnboardingRedirectUrl = () => {
  const configured =
    process.env.GETAIPILOT_AUTH_REDIRECT_TO ||
    process.env.FRONTEND_URL ||
    process.env.frontend_Url ||
    'https://getaipilot.in';

  const base = configured.replace(/\/+$/, '');
  return `${base}/auth/callback?next=/onboarding`;
};

export const getVerificationRedirectUrl = () => {
  const configured =
    process.env.GETAIPILOT_AUTH_REDIRECT_TO ||
    process.env.FRONTEND_URL ||
    process.env.frontend_Url ||
    'https://getaipilot.in';

  const clean = configured.replace(/\/+$/, '');
  return `${clean}/`;
};

export const isOnboardingTemplate = (templateKey?: string, campaignName?: string) => {
  const haystack = `${templateKey || ''} ${campaignName || ''}`.toLowerCase();
  return [
    'onboard',
    'onboarding',
    'setup',
    'getaipilot_complete',
    'complete_onboarding',
    'workspace_ready'
  ].some((term) => haystack.includes(term));
};

export const isVerificationTemplate = (templateKey?: string, campaignName?: string) => {
  const haystack = `${templateKey || ''} ${campaignName || ''}`.toLowerCase();
  return ['verify', 'verification', 'confirm', 'confirmation', 'signup'].some((term) => haystack.includes(term));
};

export function shouldGenerateSupabaseAuthLink(templateKey?: string, campaignName?: string) {
  return isOnboardingTemplate(templateKey, campaignName) || isVerificationTemplate(templateKey, campaignName);
}

export const shouldGenerateSupabaseVerificationLink = shouldGenerateSupabaseAuthLink;

export async function generateSupabaseAuthLink(
  email: string,
  fullName?: string,
  options?: {
    redirectTo?: string;
    type?: 'magiclink' | 'signup' | 'recovery' | 'invite';
    templateKey?: string;
    campaignName?: string;
  }
): Promise<AuthLinkResult> {
  const supabaseUrl = process.env.GETAIPILOT_SUPABASE_URL;
  const serviceRoleKey = process.env.GETAIPILOT_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      url: null,
      error: 'GETAIPILOT_SUPABASE_URL and GETAIPILOT_SUPABASE_SERVICE_ROLE_KEY are not configured.'
    };
  }

  const authClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const redirectTo =
    options?.redirectTo ||
    (isOnboardingTemplate(options?.templateKey, options?.campaignName)
      ? getOnboardingRedirectUrl()
      : getVerificationRedirectUrl());

  const linkType = options?.type || 'magiclink';

  const { data, error } = await authClient.auth.admin.generateLink({
    type: linkType,
    email: email.trim().toLowerCase(),
    options: {
      redirectTo,
      data: fullName ? { full_name: fullName } : undefined
    }
  } as any);

  if (error) {
    return { url: null, error: error.message };
  }

  const properties = data?.properties as any;
  return {
    url: properties?.action_link || properties?.actionLink || null
  };
}

export const generateSupabaseVerificationLink = generateSupabaseAuthLink;

export function isSupabaseAuthLinkConfigured() {
  return Boolean(process.env.GETAIPILOT_SUPABASE_URL && process.env.GETAIPILOT_SUPABASE_SERVICE_ROLE_KEY);
}

