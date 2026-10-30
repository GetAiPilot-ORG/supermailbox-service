import { createClient } from '@supabase/supabase-js';
import type { GetAiPilotUserSnapshot } from './types.js';

type AnyRow = Record<string, any>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_SIZE = 500;
const TRUECALLER_DOMAIN = 'truecaller.getaipilot.in';

const asIso = (value: unknown, fallback: string | null = null) => {
  if (!value) return fallback;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
};

const usableEmail = (value: unknown) => {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) return null;
  if (/^user_\d+@getaipilot\.in$/i.test(email) || /@truecaller\.getaipilot\.in$/i.test(email)) return null;
  return email;
};

export const createGetAiPilotClient = () => {
  const url = process.env.GETAIPILOT_SUPABASE_URL;
  const key = process.env.GETAIPILOT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('GetAiPilot Supabase credentials are not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
};

export type GetAiPilotService =
  | 'all_in_one'
  | 'telegram'
  | 'whatsapp'
  | 'crm'
  | 'voice'
  | 'free_trial'
  | 'none';

export function detectService(label?: string | null, planId?: string | null): { service: GetAiPilotService; serviceLabel: string } {
  const raw = `${label || ''} ${planId || ''}`.toLowerCase();
  if (!raw.trim() || raw.includes('free tier') || raw.trim() === 'free') {
    return { service: 'none', serviceLabel: 'Free Tier' };
  }
  if (raw.includes('trial')) {
    if (raw.includes('wa')) return { service: 'whatsapp', serviceLabel: 'WhatsApp + Trial' };
    return { service: 'free_trial', serviceLabel: 'Free Trial' };
  }
  if (raw.includes('tg') || raw.includes('tele') || raw.includes('telesub')) {
    return { service: 'telegram', serviceLabel: 'Telesub (Telegram)' };
  }
  if (raw.includes('wa') || raw.includes('whatsapp')) {
    return { service: 'whatsapp', serviceLabel: 'WhatsApp Automation' };
  }
  if (raw.includes('crm')) {
    return { service: 'crm', serviceLabel: 'CRM Operations' };
  }
  if (raw.includes('call') || raw.includes('voice')) {
    return { service: 'voice', serviceLabel: 'AI Voice Calls' };
  }
  if (raw.includes('core') || raw.includes('max') || raw.includes('bundle') || raw.includes('gap')) {
    return { service: 'all_in_one', serviceLabel: 'All-In-One AI Suite' };
  }
  return { service: 'all_in_one', serviceLabel: 'GetAiPilot AI' };
}

export function formatPlanLabel(label: string | null | undefined, planId?: string | null | undefined): string {
  if (!label && !planId) return 'Free Tier';
  const rawVal = (label || planId || '').trim();
  const lowerRaw = rawVal.toLowerCase();

  if (lowerRaw === 'gap_pro' || lowerRaw.includes('bundle_quarterly') || lowerRaw === 'pro') return 'GAP Pro';
  if (lowerRaw.includes('enterprise') || lowerRaw === 'gap_enterprise' || lowerRaw === 'scale') return 'GAP Enterprise';
  if (lowerRaw.includes('bundle_monthly') || lowerRaw === 'gap_core') return 'GAP Core';
  if (lowerRaw.includes('bundle_half_yearly') || lowerRaw === 'gap_max') return 'GAP Max';
  if (lowerRaw === 'wa_starter' || lowerRaw === 'whatsapp_starter') return 'WA Starter';
  if (lowerRaw === 'wa_growth' || lowerRaw === 'whatsapp_growth') return 'WA Growth';
  if (lowerRaw === 'wa_pro' || lowerRaw === 'whatsapp_pro') return 'WA Pro';
  if (lowerRaw === 'tg_lite' || lowerRaw === 'telegram_lite') return 'TG Lite';
  if (lowerRaw === 'tg_pro' || lowerRaw === 'telegram_pro') return 'TG Pro';
  if (lowerRaw.includes('call_lite') || lowerRaw.includes('voice_lite')) return 'Call Lite';
  if (lowerRaw.includes('call_elite') || lowerRaw.includes('voice_pro') || lowerRaw.includes('voice_elite')) return 'Call Elite';

  if (label && !label.trim().startsWith('[')) return label.trim();

  if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
    try {
      const parsed = JSON.parse(rawVal);
      if (Array.isArray(parsed)) {
        if (parsed.length > 1) return parsed.map((p) => formatPlanLabel(p)).join(' + ');
        if (parsed.length === 1) return formatPlanLabel(parsed[0]);
      }
    } catch {}
  }
  return rawVal || 'Free Tier';
}

function normaliseProfile(p: AnyRow): AnyRow {
  if (!p) return p;

  // Parse JSON name (Truecaller stores {"first":"...","last":"..."})
  if (p.full_name && typeof p.full_name === 'string' && p.full_name.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(p.full_name);
      const first = parsed.first || parsed.firstName || '';
      const last = parsed.last || parsed.lastName || '';
      p.full_name = `${first} ${last}`.trim() || p.full_name;
    } catch {}
  }

  // Extract Truecaller phone
  const rawEmail = (p.email || p.username || '').toLowerCase();
  if (rawEmail && typeof rawEmail === 'string' && rawEmail.endsWith(`@${TRUECALLER_DOMAIN}`)) {
    const phoneFromEmail = rawEmail.split('@')[0];
    if (!p.mobile_number && !p.phone) p.mobile_number = phoneFromEmail;
    p._is_truecaller = true;
    p._truecaller_phone = phoneFromEmail;
    if (!p.full_name || p.full_name === 'New User') {
      p.full_name = `+${phoneFromEmail}`;
    }
  }

  return p;
}

function detectSignupMethod(profile: AnyRow, authUser?: AnyRow): 'google' | 'truecaller' | 'phone' | 'email' | 'unknown' {
  const meta = profile?.raw_user_meta_data || authUser?.user_metadata || {};
  const rawEmail = (profile?.email || profile?.username || authUser?.email || '').toLowerCase();
  const phone = profile?.mobile_number || profile?.phone || authUser?.phone;

  if (rawEmail.endsWith(`@${TRUECALLER_DOMAIN}`) || profile?._is_truecaller || meta?.is_truecaller_verified === true) {
    return 'truecaller';
  }

  if (phone && (!rawEmail || rawEmail.includes(`@${TRUECALLER_DOMAIN}`))) {
    return 'phone';
  }

  const iss = meta?.iss || authUser?.app_metadata?.provider;
  const avatarUrl = meta?.avatar_url || profile?.avatar_url;
  if (
    (typeof iss === 'string' && iss.includes('google')) ||
    meta?.provider_id === 'google' ||
    (typeof avatarUrl === 'string' && avatarUrl.includes('googleusercontent.com')) ||
    authUser?.app_metadata?.provider === 'google'
  ) {
    return 'google';
  }

  if (rawEmail && rawEmail.includes('@') && !rawEmail.endsWith(`@${TRUECALLER_DOMAIN}`)) {
    return 'email';
  }

  return 'unknown';
}

export type SubscriptionDetailStatus =
  | 'active_paid'
  | 'active_trial'
  | 'expired_trial'
  | 'expired_paid'
  | 'free_tier';

export function getSubStatusDetail(
  sub: AnyRow | undefined,
  prof: AnyRow
): {
  status: 'free' | 'active' | 'trial' | 'expired';
  detail: SubscriptionDetailStatus;
  expiresAt: string | null;
  startedAt: string | null;
  pricePaise: number | null;
  isTrial: boolean;
} {
  const now = new Date();

  if (sub) {
    const exp = sub.expires_at ? new Date(sub.expires_at) : null;
    const planText = `${sub.plan_label || ''} ${sub.plan_id || ''}`.toLowerCase();
    const isTrial = planText.includes('trial') || planText.includes('free');
    const isPaidActive = !isTrial && exp && exp > now && (sub.status === 'active' || sub.last_payment_status === 'captured');

    if (isPaidActive) {
      return {
        status: 'active',
        detail: 'active_paid',
        expiresAt: sub.expires_at || null,
        startedAt: sub.started_at || null,
        pricePaise: sub.plan_price_paise || null,
        isTrial: false,
      };
    }

    if (isTrial) {
      const isTrialActive = Boolean(exp && exp > now);
      return {
        status: isTrialActive ? 'trial' : 'expired',
        detail: isTrialActive ? 'active_trial' : 'expired_trial',
        expiresAt: sub.expires_at || null,
        startedAt: sub.started_at || null,
        pricePaise: 0,
        isTrial: true,
      };
    }

    return {
      status: 'expired',
      detail: 'expired_paid',
      expiresAt: sub.expires_at || null,
      startedAt: sub.started_at || null,
      pricePaise: sub.plan_price_paise || null,
      isTrial: false,
    };
  }

  // Profile-only fallback
  if (prof?.subscription) {
    const s = String(prof.subscription).toLowerCase();
    const isTrial = s.includes('trial') || s.includes('free');
    const created = prof.created_at ? new Date(prof.created_at) : new Date();
    const trialDaysAgo = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);

    if (isTrial) {
      const isTrialActive = trialDaysAgo <= 7;
      return {
        status: isTrialActive ? 'trial' : 'expired',
        detail: isTrialActive ? 'active_trial' : 'expired_trial',
        expiresAt: new Date(created.getTime() + 7 * 86400000).toISOString(),
        startedAt: prof.created_at || null,
        pricePaise: 0,
        isTrial: true,
      };
    }

    if (!s.includes('null') && s !== 'free tier' && s !== 'free') {
      return {
        status: 'active',
        detail: 'active_paid',
        expiresAt: null,
        startedAt: prof.created_at || null,
        pricePaise: null,
        isTrial: false,
      };
    }
  }

  return {
    status: 'free',
    detail: 'free_tier',
    expiresAt: null,
    startedAt: null,
    pricePaise: null,
    isTrial: false,
  };
}

const listAllProfiles = async (client: ReturnType<typeof createGetAiPilotClient>) => {
  const rows: AnyRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client.from('profiles').select('*').range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data || []) as AnyRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
};

const listAllSubscriptions = async (client: ReturnType<typeof createGetAiPilotClient>) => {
  try {
    const { data, error } = await client
      .from('app_user_subscriptions')
      .select('user_id, plan_id, plan_label, expires_at, started_at, status, plan_price_paise, billing_interval, last_payment_status, raw');
    if (error) {
      console.warn('Could not fetch app_user_subscriptions:', error.message);
      return [];
    }
    return (data || []) as AnyRow[];
  } catch (err: any) {
    console.warn('Subscription fetch caught error:', err?.message);
    return [];
  }
};

const listAllAuthUsers = async (client: ReturnType<typeof createGetAiPilotClient>) => {
  const rows: AnyRow[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw error;
    rows.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
  }
  return rows;
};

export const listStaffProfiles = async () => {
  const client = createGetAiPilotClient();
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email, role, is_admin')
    .or('is_admin.eq.true,role.eq.admin,role.eq.sales');
  if (error) {
    console.warn('Could not fetch staff profiles:', error.message);
    return [];
  }
  return data || [];
};

const snapshotFrom = (profileInput: AnyRow, authUser?: AnyRow, sub?: AnyRow): GetAiPilotUserSnapshot => {
  const profile = normaliseProfile({ ...profileInput });
  const metadata = authUser?.user_metadata || {};
  const rawMetadata = profile.raw_user_meta_data || {};

  const isTruecaller = profile._is_truecaller || (profile.email || '').toLowerCase().endsWith(`@${TRUECALLER_DOMAIN}`) || rawMetadata.is_truecaller_verified === true;
  const truecallerPhone = isTruecaller && profile.email?.includes('@') ? profile.email.split('@')[0] : null;

  // Phone number resolution
  let phone = String(profile.mobile_number || profile.phone || authUser?.phone || rawMetadata.phone || truecallerPhone || '').trim() || null;

  // Email resolution (empty/null for Truecaller dummy emails)
  let email = isTruecaller ? null : (usableEmail(profile.email) || usableEmail(profile.business_email) || usableEmail(authUser?.email) || usableEmail(rawMetadata.email));

  // Full name
  let fullName = profile.full_name || profile.username || metadata.full_name || metadata.name || '';
  if (!fullName || fullName === 'New User') {
    fullName = email?.split('@')[0] || (phone ? `+${phone}` : 'Customer');
  }

  // Signup method detection
  const signupMethod = detectSignupMethod(profile, authUser);

  // Subscription plan & status resolution
  const subDetail = getSubStatusDetail(sub, profile);
  const planLabel = formatPlanLabel(profile.subscription || sub?.plan_label, sub?.plan_id) || profile.account_type || 'Free Tier';
  const serviceInfo = detectService(planLabel, sub?.plan_id || profile.subscription);

  const registeredAt = asIso(profile.created_at || authUser?.created_at, new Date().toISOString())!;
  const onboardingStarted = Boolean(profile.tour_seen || profile.tour_completed || Number(profile.tour_step || 0) > 0 || profile.onboarding_started_at || profile.onboarding_completed);
  const lastActivity = asIso(profile.last_activity_at || profile.last_seen_at || profile.updated_at || authUser?.last_sign_in_at, registeredAt);

  const isExtracted = profile.is_extracted ?? Boolean(profile.extracted_at);
  const leadStatus = profile.lead_status || (isExtracted ? 'extracted' : 'new');

  return {
    externalUserId: String(profile.id || authUser?.id),
    email,
    phone,
    fullName,
    accountType: planLabel,
    country: profile.country || metadata.country || null,
    registeredAt,
    identityVerified: Boolean(authUser?.email_confirmed_at || authUser?.confirmed_at || authUser?.phone_confirmed_at || profile.email_confirmed_at || rawMetadata.email_verified || metadata.email_verified),
    onboardingStarted,
    onboardingStartedAt: asIso(profile.onboarding_started_at || (onboardingStarted ? profile.updated_at : null)),
    onboardingCompleted: profile.onboarding_completed === true,
    onboardingCompletedAt: asIso(profile.onboarding_completed_at || (profile.onboarding_completed ? profile.updated_at : null)),
    lastProductActivityAt: lastActivity,
    sourceSnapshot: {
      signupMethod,
      planLabel,
      subscriptionStatus: subDetail.status,
      subStatusDetail: subDetail.detail,
      service: serviceInfo.service,
      serviceLabel: serviceInfo.serviceLabel,
      expiresAt: subDetail.expiresAt,
      startedAt: subDetail.startedAt,
      pricePaise: subDetail.pricePaise,
      isTrial: subDetail.isTrial,
      leadStatus,
      isExtracted,
      extractedAt: profile.extracted_at || null,
      assignedTo: profile.assigned_to || null,
      notes: profile.notes || null,
      lastContactedAt: profile.last_contacted_at || null,
      nextFollowupAt: profile.next_followup_at || null,
      tourSeen: profile.tour_seen === true,
      tourCompleted: profile.tour_completed === true,
      tourStep: Number(profile.tour_step || 0),
      accountStatus: profile.account_status || (subDetail.status === 'active' ? 'active' : 'free'),
      rawAccountType: profile.account_type || null,
    },
  };
};

export async function fetchAllGetAiPilotUsers(): Promise<GetAiPilotUserSnapshot[]> {
  const client = createGetAiPilotClient();
  const [profiles, authUsers, subscriptions] = await Promise.all([
    listAllProfiles(client),
    listAllAuthUsers(client),
    listAllSubscriptions(client),
  ]);

  const authById = new Map(authUsers.map((user) => [String(user.id), user]));
  const authByEmail = new Map(authUsers.filter((user) => usableEmail(user.email)).map((user) => [usableEmail(user.email)!, user]));

  // Prioritize active paid subscriptions > active trial > latest expired
  const subById = new Map<string, AnyRow>();
  const now = new Date();
  for (const s of subscriptions) {
    const uid = String(s.user_id);
    const existing = subById.get(uid);
    if (!existing) {
      subById.set(uid, s);
      continue;
    }
    const sExp = s.expires_at ? new Date(s.expires_at) : new Date(0);
    const exExp = existing.expires_at ? new Date(existing.expires_at) : new Date(0);
    const sIsTrial = (s.plan_label || s.plan_id || '').toLowerCase().includes('trial');
    const exIsTrial = (existing.plan_label || existing.plan_id || '').toLowerCase().includes('trial');
    const sIsPaidActive = !sIsTrial && sExp > now;
    const exIsPaidActive = !exIsTrial && exExp > now;

    if (sIsPaidActive && !exIsPaidActive) {
      subById.set(uid, s);
    } else if (!sIsPaidActive && exIsPaidActive) {
      // keep existing
    } else if (sExp > exExp) {
      subById.set(uid, s);
    }
  }

  const seenIds = new Set<string>();
  const snapshots: GetAiPilotUserSnapshot[] = [];

  // Exclude admin profiles just like GetAiPilot does
  const nonAdminProfiles = profiles.filter((p) => !p.is_admin);

  for (const profile of nonAdminProfiles) {
    const profileEmail = usableEmail(profile.email) || usableEmail(profile.business_email);
    const authUser = authById.get(String(profile.id)) || (profileEmail ? authByEmail.get(profileEmail) : undefined);
    const sub = subById.get(String(profile.id));
    const snapshot = snapshotFrom(profile, authUser, sub);
    if (!snapshot.externalUserId || seenIds.has(snapshot.externalUserId)) continue;
    seenIds.add(snapshot.externalUserId);
    snapshots.push(snapshot);
  }

  return snapshots.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}
