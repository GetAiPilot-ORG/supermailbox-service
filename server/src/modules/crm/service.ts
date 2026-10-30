import crypto from 'crypto';
import { z } from 'zod';
import { supabase } from '../../supabase.js';
import { fetchAllGetAiPilotUsers, createGetAiPilotClient, listStaffProfiles } from './getaipilotSource.js';
import { CRM_EVENT_TYPES, SALES_STAGES, type ProductEventInput, type SalesStage } from './types.js';
import { decodeCursor, encodeCursor, parseRangeDays, validateStageTransition } from './logic.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ACTIVE_TICKET_STATES = ['open', 'in_progress', 'waiting'];
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

const LEAD_TO_STAGE: Record<string, SalesStage> = {
  new: 'unreviewed',
  extracted: 'qualified',
  assigned: 'qualified',
  contacted: 'contacting',
  interested: 'engaged',
  demo_trial: 'demo_trial',
  follow_up: 'nurture',
  converted: 'won',
  lost: 'lost',
  not_interested: 'unqualified',
};

const STAGE_TO_LEAD: Record<SalesStage, string> = {
  unreviewed: 'new',
  qualified: 'extracted',
  contacting: 'contacted',
  engaged: 'interested',
  demo_trial: 'interested',
  nurture: 'follow_up',
  won: 'converted',
  lost: 'lost',
  unqualified: 'not_interested',
};

const eventSchema = z.object({
  productCode: z.string().min(1).default('getaipilot'),
  externalEventId: z.string().min(1).max(180),
  externalUserId: z.string().min(1).max(180),
  eventType: z.enum(CRM_EVENT_TYPES),
  occurredAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const cleanSearch = (value: unknown) => String(value || '').trim().replace(/[(),]/g, ' ').slice(0, 120);
const nowIso = () => new Date().toISOString();

const formatLead = (row: any) => {
  const snap = row.source_snapshot || {};
  const leadStatus = (row.sales_stage ? STAGE_TO_LEAD[row.sales_stage as SalesStage] : null) || snap.leadStatus || 'new';
  const isExtracted = snap.isExtracted ?? (row.sales_stage !== 'unreviewed');
  return {
    id: row.id,
    productCode: row.product_code,
    externalUserId: row.external_user_id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    accountType: snap.planLabel || row.account_type || 'Free Tier',
    country: row.country,
    registeredAt: row.registered_at,
    identityVerified: row.identity_verified,
    onboardingStarted: row.onboarding_started,
    onboardingStartedAt: row.onboarding_started_at,
    onboardingCompleted: row.onboarding_completed,
    onboardingCompletedAt: row.onboarding_completed_at,
    activated: row.activated,
    activatedAt: row.activated_at,
    pricingViewedAt: row.pricing_viewed_at,
    lastProductActivityAt: row.last_product_activity_at,
    subscriptionStatus: snap.subscriptionStatus || (row.subscription_status === 'active' ? 'active' : 'free'),
    subStatusDetail: snap.subStatusDetail || (snap.subscriptionStatus === 'active' ? 'active_paid' : 'free_tier'),
    service: snap.service || 'none',
    serviceLabel: snap.serviceLabel || 'Free Tier',
    planPricePaise: snap.pricePaise ?? null,
    expiresAt: snap.expiresAt || null,
    startedAt: snap.startedAt || null,
    isTrial: Boolean(snap.isTrial),
    planLabel: snap.planLabel || row.account_type || 'Free Tier',
    signupMethod: snap.signupMethod || 'unknown',
    lifecycleState: row.lifecycle_state,
    salesStage: row.sales_stage,
    leadStatus,
    isExtracted,
    extractedAt: snap.extractedAt || null,
    assignedTo: snap.assignedTo || null,
    notes: snap.notes || null,
    lastContactedAt: snap.lastContactedAt || null,
    intentScore: row.intent_score,
    intentBand: row.intent_band,
    nextFollowUpAt: row.next_follow_up_at,
    convertedAt: row.converted_at,
    conversionSource: row.conversion_source,
    lostReason: row.lost_reason,
    lastSyncedAt: row.last_synced_at,
    sourceSnapshot: snap,
    updatedAt: row.updated_at,
  };
};

const formatActivity = (row: any) => ({
  id: row.id,
  leadId: row.lead_id,
  type: row.activity_type,
  body: row.body,
  metadata: row.metadata || {},
  actor: row.actor,
  occurredAt: row.occurred_at,
});

const formatTask = (row: any, lead?: any) => ({
  id: row.id,
  leadId: row.lead_id,
  title: row.title,
  dueAt: row.due_at,
  status: row.status,
  completedAt: row.completed_at,
  createdAt: row.created_at,
  lead: lead ? formatLead(lead) : undefined,
});

const formatTicket = (row: any, lead?: any) => ({
  id: row.id,
  leadId: row.lead_id,
  subject: row.subject,
  description: row.description,
  priority: row.priority,
  status: row.status,
  resolvedAt: row.resolved_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lead: lead ? formatLead(lead) : undefined,
});

async function refreshDerived() {
  // The explicit filter keeps this intentional all-row refresh compatible
  // with Supabase projects that enable the pg-safeupdate extension.
  const { error } = await supabase
    .from('crm_leads')
    .update({ updated_at: nowIso() })
    .neq('id', NIL_UUID);
  if (error) throw error;
}

async function leadsByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, any>();
  const { data, error } = await supabase.from('crm_leads').select('*').in('id', [...new Set(ids)]);
  if (error) throw error;
  return new Map((data || []).map((lead: any) => [lead.id, lead]));
}

async function insertActivity(leadId: string, activityType: string, body?: string | null, metadata: Record<string, unknown> = {}) {
  const { error } = await supabase.from('crm_activities').insert({
    lead_id: leadId,
    activity_type: activityType,
    body: body || null,
    metadata,
    actor: 'admin',
    occurred_at: nowIso(),
  });
  if (error) throw error;
}

export async function syncGetAiPilotLeads(force = false) {
  const productCode = 'getaipilot';
  const { data: state } = await supabase.from('crm_sync_state').select('*').eq('product_code', productCode).maybeSingle();
  const lastSuccess = state?.last_success_at ? new Date(state.last_success_at).getTime() : 0;
  if (!force && lastSuccess && Date.now() - lastSuccess < FIFTEEN_MINUTES) {
    return { skipped: true, stale: false, lastSuccessAt: state.last_success_at, recordsSeen: state.records_seen || 0 };
  }

  const startedAt = nowIso();
  await supabase.from('crm_sync_state').upsert({ product_code: productCode, last_started_at: startedAt, updated_at: startedAt });

  try {
    const users = await fetchAllGetAiPilotUsers();
    let created = 0;
    let updated = 0;

    for (let index = 0; index < users.length; index += 200) {
      const chunk = users.slice(index, index + 200);
      const externalIds = chunk.map((user) => user.externalUserId);
      const { data: existing, error: existingError } = await supabase
        .from('crm_leads')
        .select('external_user_id, sales_stage, converted_at, conversion_source, subscription_status')
        .eq('product_code', productCode)
        .in('external_user_id', externalIds);
      if (existingError) throw existingError;
      const existingMap = new Map((existing || []).map((row: any) => [row.external_user_id, row]));
      created += chunk.filter((user) => !existingMap.has(user.externalUserId)).length;
      updated += chunk.filter((user) => existingMap.has(user.externalUserId)).length;

      const rows = chunk.map((user) => {
        const snap = (user.sourceSnapshot || {}) as Record<string, any>;
        const detail = snap.subStatusDetail as string | undefined;
        const existingRow = existingMap.get(user.externalUserId);
        const currentStage = existingRow?.sales_stage as SalesStage | undefined;

        let stage: SalesStage = 'unreviewed';
        let convertedAt = existingRow?.converted_at || null;
        let conversionSource = existingRow?.conversion_source || null;

        if (detail === 'active_paid') {
          // Customer has an active paid subscription -> Converted / Won!
          stage = 'won';
          convertedAt = snap.startedAt || convertedAt || startedAt;
          conversionSource = 'product_event';
        } else if (detail === 'active_trial') {
          // In active free trial
          if (!currentStage || currentStage === 'unreviewed' || currentStage === 'qualified') {
            stage = 'demo_trial';
          } else {
            stage = currentStage;
          }
        } else if (detail === 'expired_trial' || detail === 'expired_paid') {
          // Free trial ended or subscription ended -> Follow-up / Nurture!
          if (!currentStage || currentStage === 'unreviewed' || currentStage === 'qualified' || currentStage === 'demo_trial') {
            stage = 'nurture';
          } else {
            stage = currentStage;
          }
        } else if (snap.isExtracted || snap.leadStatus === 'extracted') {
          stage = currentStage && currentStage !== 'unreviewed' ? currentStage : 'qualified';
        } else {
          stage = currentStage || 'unreviewed';
        }

        return {
          product_code: productCode,
          external_user_id: user.externalUserId,
          email: user.email,
          phone: user.phone,
          full_name: user.fullName,
          account_type: user.accountType,
          country: user.country,
          registered_at: user.registeredAt,
          identity_verified: user.identityVerified,
          onboarding_started: user.onboardingStarted,
          onboarding_started_at: user.onboardingStartedAt,
          onboarding_completed: user.onboardingCompleted,
          onboarding_completed_at: user.onboardingCompletedAt,
          last_product_activity_at: user.lastProductActivityAt,
          subscription_status: detail === 'active_paid' ? 'active' : (detail === 'expired_paid' ? 'cancelled' : 'none'),
          sales_stage: stage,
          converted_at: convertedAt,
          conversion_source: conversionSource,
          source_snapshot: user.sourceSnapshot,
          last_synced_at: startedAt,
        };
      });
      const { error } = await supabase.from('crm_leads').upsert(rows, { onConflict: 'product_code,external_user_id' });
      if (error) throw error;
    }

    // Reconcile and prune leads that were deleted by admin from GetAiPilot
    const activeExternalIds = new Set(users.map((u) => u.externalUserId));
    const { data: dbLeads, error: dbLeadsError } = await supabase
      .from('crm_leads')
      .select('id, external_user_id')
      .eq('product_code', productCode);
    if (dbLeadsError) throw dbLeadsError;

    const staleLeadIds = (dbLeads || [])
      .filter((lead: any) => !activeExternalIds.has(lead.external_user_id))
      .map((lead: any) => lead.id);

    let deleted = 0;
    if (staleLeadIds.length > 0) {
      for (let i = 0; i < staleLeadIds.length; i += 100) {
        const batch = staleLeadIds.slice(i, i + 100);
        const { error: delError } = await supabase
          .from('crm_leads')
          .delete()
          .in('id', batch);
        if (delError) throw delError;
      }
      deleted = staleLeadIds.length;
    }

    await refreshDerived();
    const completedAt = nowIso();
    await supabase.from('crm_sync_state').upsert({
      product_code: productCode,
      last_started_at: startedAt,
      last_success_at: completedAt,
      last_error: null,
      records_seen: users.length,
      records_created: created,
      records_updated: updated,
      updated_at: completedAt,
    });
    return { skipped: false, stale: false, lastSuccessAt: completedAt, recordsSeen: users.length, created, updated, deleted };
  } catch (error: any) {
    await supabase.from('crm_sync_state').upsert({
      product_code: productCode,
      last_started_at: startedAt,
      last_error: error?.message || 'Unknown sync error',
      updated_at: nowIso(),
    });
    if (lastSuccess) {
      return { skipped: false, stale: true, lastSuccessAt: state.last_success_at, recordsSeen: state.records_seen || 0, error: error?.message };
    }
    throw error;
  }
}

export async function getOverview(rangeInput: unknown) {
  await refreshDerived();
  const rangeDays = parseRangeDays(rangeInput);
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
  const { data: leads, error: leadsError } = await supabase.from('crm_leads').select('*');
  if (leadsError) throw leadsError;
  const rows = leads || [];
  const cohort = rows.filter((lead: any) => String(lead.registered_at) >= since);

  const [{ data: overdueTasks }, { data: urgentTickets }, { data: syncState }] = await Promise.all([
    supabase.from('crm_tasks').select('*').eq('status', 'open').lt('due_at', nowIso()).order('due_at').limit(12),
    supabase.from('crm_support_tickets').select('*').in('status', ACTIVE_TICKET_STATES).in('priority', ['urgent', 'high']).order('created_at').limit(12),
    supabase.from('crm_sync_state').select('*').eq('product_code', 'getaipilot').maybeSingle(),
  ]);

  const hotLeads = rows
    .filter((lead: any) => lead.sales_stage === 'unreviewed' && ['high_intent', 'sales_ready'].includes(lead.intent_band))
    .sort((a: any, b: any) => b.intent_score - a.intent_score)
    .slice(0, 12);
  const dropoffs = rows
    .filter((lead: any) => lead.lifecycle_state === 'onboarding_dropoff')
    .sort((a: any, b: any) => String(b.last_product_activity_at || '').localeCompare(String(a.last_product_activity_at || '')))
    .slice(0, 12);
  const relatedLeadMap = await leadsByIds([
    ...(overdueTasks || []).map((row: any) => row.lead_id),
    ...(urgentTickets || []).map((row: any) => row.lead_id),
  ]);

  const pipeline = Object.fromEntries(SALES_STAGES.map((stage) => [stage, rows.filter((lead: any) => lead.sales_stage === stage).length]));
  const onboardingCompleted = cohort.filter((lead: any) => lead.onboarding_completed).length;
  const activated = cohort.filter((lead: any) => lead.activated).length;
  const converted = cohort.filter((lead: any) => lead.sales_stage === 'won').length;
  const { count: openTicketCount } = await supabase.from('crm_support_tickets').select('*', { count: 'exact', head: true }).in('status', ACTIVE_TICKET_STATES);

  return {
    rangeDays,
    metrics: {
      registered: cohort.length,
      onboardingCompleted,
      onboardingRate: cohort.length ? Math.round((onboardingCompleted / cohort.length) * 1000) / 10 : 0,
      activated,
      activationRate: cohort.length ? Math.round((activated / cohort.length) * 1000) / 10 : 0,
      converted,
      conversionRate: cohort.length ? Math.round((converted / cohort.length) * 1000) / 10 : 0,
      openTickets: openTicketCount || 0,
    },
    funnel: {
      registered: cohort.length,
      verified: cohort.filter((lead: any) => lead.identity_verified).length,
      onboardingStarted: cohort.filter((lead: any) => lead.onboarding_started).length,
      onboardingCompleted,
      activated,
      converted,
    },
    pipeline,
    signals: {
      overdueTasks: (overdueTasks || []).map((task: any) => formatTask(task, relatedLeadMap.get(task.lead_id))),
      hotLeads: hotLeads.map(formatLead),
      onboardingDropoffs: dropoffs.map(formatLead),
      urgentTickets: (urgentTickets || []).map((ticket: any) => formatTicket(ticket, relatedLeadMap.get(ticket.lead_id))),
    },
    sync: syncState ? {
      lastSuccessAt: syncState.last_success_at,
      lastError: syncState.last_error,
      recordsSeen: syncState.records_seen,
      stale: Boolean(syncState.last_error),
    } : null,
  };
}

export async function listLeads(query: Record<string, unknown>) {
  await refreshDerived();
  const limit = Math.min(Math.max(Number(query.limit || 500), 1), 5000);
  const offset = decodeCursor(query.cursor);
  let builder = supabase.from('crm_leads').select('*', { count: 'exact' });
  const search = cleanSearch(query.search);
  if (search) builder = builder.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  if (query.stage && SALES_STAGES.includes(String(query.stage) as SalesStage)) builder = builder.eq('sales_stage', query.stage);
  if (query.lifecycle) builder = builder.eq('lifecycle_state', query.lifecycle);
  if (query.intent) builder = builder.eq('intent_band', query.intent);
  if (query.followUp === 'overdue') builder = builder.lt('next_follow_up_at', nowIso()).not('next_follow_up_at', 'is', null);
  const { data, error, count } = await builder.order('registered_at', { ascending: false }).order('id').range(offset, offset + limit - 1);
  if (error) throw error;
  const nextOffset = offset + (data?.length || 0);
  return {
    items: (data || []).map(formatLead),
    total: count || 0,
    nextCursor: nextOffset < (count || 0) ? encodeCursor(nextOffset) : null,
  };
}

export async function getLeadDetail(id: string) {
  const [{ data: lead, error }, { data: activities }, { data: tasks }, { data: tickets }] = await Promise.all([
    supabase.from('crm_leads').select('*').eq('id', id).maybeSingle(),
    supabase.from('crm_activities').select('*').eq('lead_id', id).order('occurred_at', { ascending: false }).limit(100),
    supabase.from('crm_tasks').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase.from('crm_support_tickets').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
  ]);
  if (error) throw error;
  if (!lead) return null;
  return {
    lead: formatLead(lead),
    activities: (activities || []).map(formatActivity),
    tasks: (tasks || []).map((task: any) => formatTask(task)),
    tickets: (tickets || []).map((ticket: any) => formatTicket(ticket)),
  };
}

export async function updateLead(id: string, input: any) {
  const { data: existing, error: lookupError } = await supabase.from('crm_leads').select('*').eq('id', id).maybeSingle();
  if (lookupError) throw lookupError;
  if (!existing) return null;

  let nextStage: SalesStage = existing.sales_stage;
  if (input.salesStage && SALES_STAGES.includes(input.salesStage)) {
    nextStage = input.salesStage as SalesStage;
  } else if (input.leadStatus && LEAD_TO_STAGE[input.leadStatus]) {
    nextStage = LEAD_TO_STAGE[input.leadStatus];
  }

  // Only validate full stage transition if transitioning to/from strict stages like nurture or lost
  if (nextStage !== existing.sales_stage && (nextStage === 'lost' || nextStage === 'nurture' || existing.sales_stage === 'won')) {
    validateStageTransition({
      previousStage: existing.sales_stage,
      nextStage,
      nextFollowUpAt: input.nextFollowUpAt ?? existing.next_follow_up_at,
      lostReason: input.lostReason,
      note: input.note || input.notes,
    });
  }

  const patch: Record<string, unknown> = {
    updated_at: nowIso(),
  };

  const nextSnap = { ...(existing.source_snapshot || {}) };

  if (input.salesStage && SALES_STAGES.includes(input.salesStage)) {
    nextSnap.leadStatus = STAGE_TO_LEAD[nextStage] || 'new';
    if (nextStage !== 'unreviewed') {
      nextSnap.isExtracted = true;
      if (!nextSnap.extractedAt) nextSnap.extractedAt = nowIso();
    }
  } else if ('leadStatus' in input && input.leadStatus) {
    nextSnap.leadStatus = input.leadStatus;
    if (input.leadStatus !== 'new') {
      nextSnap.isExtracted = true;
      if (!nextSnap.extractedAt) nextSnap.extractedAt = nowIso();
    }
  }

  if ('assignedTo' in input) {
    nextSnap.assignedTo = input.assignedTo;
  }

  if ('notes' in input && input.notes !== undefined) {
    nextSnap.notes = input.notes;
    if (input.notes) {
      await insertActivity(id, 'note', input.notes);
    }
  }

  if ('lastContactedAt' in input && input.lastContactedAt) {
    nextSnap.lastContactedAt = input.lastContactedAt;
    await insertActivity(id, 'call', 'Marked as contacted');
  }

  if ('nextFollowUpAt' in input) {
    patch.next_follow_up_at = input.nextFollowUpAt || null;
    nextSnap.nextFollowupAt = input.nextFollowUpAt || null;
  }

  if (nextStage !== existing.sales_stage) {
    patch.sales_stage = nextStage;
    patch.lost_reason = nextStage === 'lost' ? (input.lostReason || null) : null;
    if (nextStage === 'won') {
      patch.converted_at = existing.converted_at || nowIso();
      patch.conversion_source = existing.conversion_source || 'manual';
    } else if (existing.sales_stage === 'won') {
      patch.converted_at = null;
      patch.conversion_source = null;
    }
  }

  patch.source_snapshot = nextSnap;

  const { data, error } = await supabase.from('crm_leads').update(patch).eq('id', id).select('*').single();
  if (error) throw error;

  if (nextStage !== existing.sales_stage) {
    const type = nextStage === 'won' ? 'conversion' : existing.sales_stage === 'won' ? 'conversion_revoked' : 'stage_changed';
    await insertActivity(id, type, input.note || input.notes || null, { from: existing.sales_stage, to: nextStage, lostReason: input.lostReason || null });
  }

  // Also mirror to GetAiPilot profiles in background
  if (existing.external_user_id) {
    try {
      const gClient = createGetAiPilotClient();
      const gPatch: Record<string, any> = { updated_at: nowIso() };
      if ('leadStatus' in input && input.leadStatus) gPatch.lead_status = input.leadStatus;
      if ('assignedTo' in input) gPatch.assigned_to = input.assignedTo;
      if ('notes' in input) gPatch.notes = input.notes;
      if ('lastContactedAt' in input && input.lastContactedAt) gPatch.last_contacted_at = input.lastContactedAt;
      if ('nextFollowUpAt' in input) gPatch.next_followup_at = input.nextFollowUpAt;
      if (nextSnap.isExtracted) {
        gPatch.is_extracted = true;
        if (nextSnap.extractedAt) gPatch.extracted_at = nextSnap.extractedAt;
      }
      await gClient.from('profiles').update(gPatch).eq('id', existing.external_user_id);
    } catch (gErr: any) {
      console.warn('GetAiPilot profile mirror update non-fatal error:', gErr?.message);
    }
  }

  return formatLead(data);
}

export async function extractLeads(input: { ids?: string[]; allNew?: boolean }) {
  let builder = supabase.from('crm_leads').select('*');
  if (input.ids && input.ids.length > 0) {
    builder = builder.in('id', input.ids);
  } else if (input.allNew) {
    builder = builder.eq('sales_stage', 'unreviewed');
  } else {
    return { extracted: 0 };
  }

  const { data: targets, error } = await builder;
  if (error) throw error;
  if (!targets || targets.length === 0) return { extracted: 0 };

  const extractedAt = nowIso();
  const extIds = targets.map((t: any) => t.external_user_id).filter(Boolean);

  for (const lead of targets) {
    const snap = {
      ...(lead.source_snapshot || {}),
      isExtracted: true,
      extractedAt,
      leadStatus: 'extracted',
    };
    await supabase.from('crm_leads').update({
      sales_stage: 'qualified',
      source_snapshot: snap,
      updated_at: extractedAt,
    }).eq('id', lead.id);
  }

  // Mirror to GetAiPilot profiles
  if (extIds.length > 0) {
    try {
      const gClient = createGetAiPilotClient();
      await gClient.from('profiles').update({
        is_extracted: true,
        extracted_at: extractedAt,
        lead_status: 'extracted',
      }).in('id', extIds);
    } catch (gErr: any) {
      console.warn('GetAiPilot profiles extract update non-fatal error:', gErr?.message);
    }
  }

  return { extracted: targets.length };
}

export async function getStaff() {
  return await listStaffProfiles();
}

export async function addLeadActivity(id: string, input: any) {
  const type = input.type === 'call' ? 'call' : 'note';
  const body = String(input.body || '').trim();
  if (!body) throw new Error('Activity body is required.');
  const { data, error } = await supabase.from('crm_activities').insert({
    lead_id: id,
    activity_type: type,
    body,
    metadata: input.metadata || {},
    actor: 'admin',
    occurred_at: nowIso(),
  }).select('*').single();
  if (error) throw error;
  return formatActivity(data);
}

export async function listTasks(query: Record<string, unknown>) {
  let builder = supabase.from('crm_tasks').select('*').order('due_at');
  if (query.status) builder = builder.eq('status', query.status);
  if (query.leadId) builder = builder.eq('lead_id', query.leadId);
  if (query.scope === 'overdue') builder = builder.eq('status', 'open').lt('due_at', nowIso());
  const { data, error } = await builder.limit(250);
  if (error) throw error;
  const leadMap = await leadsByIds((data || []).map((task: any) => task.lead_id));
  return (data || []).map((task: any) => formatTask(task, leadMap.get(task.lead_id)));
}

export async function createTask(input: any) {
  const title = String(input.title || '').trim();
  const dueAt = new Date(input.dueAt);
  if (!input.leadId || !title || Number.isNaN(dueAt.getTime())) throw new Error('leadId, title and a valid dueAt are required.');
  const { data, error } = await supabase.from('crm_tasks').insert({ lead_id: input.leadId, title, due_at: dueAt.toISOString() }).select('*').single();
  if (error) throw error;
  await supabase.from('crm_leads').update({ next_follow_up_at: dueAt.toISOString() }).eq('id', input.leadId);
  await insertActivity(input.leadId, 'task_created', title, { taskId: data.id, dueAt: dueAt.toISOString() });
  return formatTask(data);
}

export async function updateTask(id: string, input: any) {
  const patch: Record<string, unknown> = { updated_at: nowIso() };
  if (input.title !== undefined) patch.title = String(input.title).trim();
  if (input.dueAt !== undefined) patch.due_at = new Date(input.dueAt).toISOString();
  if (['open', 'done', 'cancelled'].includes(input.status)) {
    patch.status = input.status;
    patch.completed_at = input.status === 'done' ? nowIso() : null;
  }
  const { data, error } = await supabase.from('crm_tasks').update(patch).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  if (data && input.status === 'done') await insertActivity(data.lead_id, 'task_completed', data.title, { taskId: data.id });
  return data ? formatTask(data) : null;
}

export async function listTickets(query: Record<string, unknown>) {
  let builder = supabase.from('crm_support_tickets').select('*').order('created_at', { ascending: false });
  if (query.status) builder = builder.eq('status', query.status);
  if (query.priority) builder = builder.eq('priority', query.priority);
  if (query.leadId) builder = builder.eq('lead_id', query.leadId);
  const { data, error } = await builder.limit(250);
  if (error) throw error;
  const leadMap = await leadsByIds((data || []).map((ticket: any) => ticket.lead_id));
  return (data || []).map((ticket: any) => formatTicket(ticket, leadMap.get(ticket.lead_id)));
}

export async function createTicket(input: any) {
  const subject = String(input.subject || '').trim();
  if (!input.leadId || !subject) throw new Error('leadId and subject are required.');
  const priority = ['low', 'normal', 'high', 'urgent'].includes(input.priority) ? input.priority : 'normal';
  const { data, error } = await supabase.from('crm_support_tickets').insert({
    lead_id: input.leadId,
    subject,
    description: String(input.description || '').trim() || null,
    priority,
  }).select('*').single();
  if (error) throw error;
  await insertActivity(input.leadId, 'ticket_created', subject, { ticketId: data.id, priority });
  return formatTicket(data);
}

export async function updateTicket(id: string, input: any) {
  const patch: Record<string, unknown> = { updated_at: nowIso() };
  if (input.subject !== undefined) patch.subject = String(input.subject).trim();
  if (input.description !== undefined) patch.description = String(input.description).trim() || null;
  if (['low', 'normal', 'high', 'urgent'].includes(input.priority)) patch.priority = input.priority;
  if (['open', 'in_progress', 'waiting', 'resolved', 'closed'].includes(input.status)) {
    patch.status = input.status;
    patch.resolved_at = ['resolved', 'closed'].includes(input.status) ? nowIso() : null;
  }
  const { data, error } = await supabase.from('crm_support_tickets').update(patch).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  if (data) await insertActivity(data.lead_id, 'ticket_updated', data.subject, { ticketId: data.id, status: data.status, priority: data.priority });
  return data ? formatTicket(data) : null;
}

export function verifyProductEventKey(value: unknown) {
  const expected = process.env.GETAIPILOT_CRM_EVENT_KEY;
  const supplied = typeof value === 'string' ? value : '';
  if (!expected || !supplied || expected.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export async function ingestProductEvent(raw: unknown) {
  const input = eventSchema.parse(raw) as ProductEventInput;
  let { data: lead, error: leadError } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('product_code', input.productCode)
    .eq('external_user_id', input.externalUserId)
    .maybeSingle();
  if (leadError) throw leadError;
  if (!lead) {
    const payload = input.payload as any;
    const inserted = await supabase.from('crm_leads').insert({
      product_code: input.productCode,
      external_user_id: input.externalUserId,
      email: payload.email || null,
      phone: payload.phone || null,
      full_name: payload.fullName || payload.full_name || payload.email || payload.phone || 'Unknown user',
      account_type: payload.accountType || payload.plan || 'Free Tier',
      registered_at: input.occurredAt,
      last_product_activity_at: input.occurredAt,
    }).select('*').single();
    if (inserted.error) throw inserted.error;
    lead = inserted.data;
  }

  const { error: eventError } = await supabase.from('crm_events').insert({
    product_code: input.productCode,
    external_event_id: input.externalEventId,
    external_user_id: input.externalUserId,
    lead_id: lead.id,
    event_type: input.eventType,
    payload: input.payload,
    occurred_at: input.occurredAt,
  });
  if (eventError?.code === '23505') return { accepted: true, duplicate: true, lead: formatLead(lead) };
  if (eventError) throw eventError;

  const patch: Record<string, unknown> = { last_product_activity_at: input.occurredAt };
  if (input.eventType === 'identity_verified') patch.identity_verified = true;
  if (input.eventType === 'onboarding_started') {
    patch.onboarding_started = true;
    patch.onboarding_started_at = input.occurredAt;
  }
  if (input.eventType === 'onboarding_completed') {
    patch.onboarding_started = true;
    patch.onboarding_completed = true;
    patch.onboarding_completed_at = input.occurredAt;
  }
  if (input.eventType === 'core_action_completed') {
    patch.activated = true;
    patch.activated_at = input.occurredAt;
  }
  if (input.eventType === 'pricing_viewed') patch.pricing_viewed_at = input.occurredAt;
  if (input.eventType === 'subscription_started') {
    patch.subscription_status = 'active';
    patch.sales_stage = 'won';
    patch.converted_at = input.occurredAt;
    patch.conversion_source = 'product_event';
  }
  if (input.eventType === 'subscription_cancelled') patch.subscription_status = 'cancelled';

  const { data: eventDays, error: daysError } = await supabase.from('crm_events').select('occurred_at').eq('lead_id', lead.id).gte('occurred_at', new Date(Date.now() - 30 * 86400000).toISOString());
  if (daysError) throw daysError;
  patch.active_day_count = new Set((eventDays || []).map((event: any) => String(event.occurred_at).slice(0, 10))).size;
  const { data: updated, error: updateError } = await supabase.from('crm_leads').update(patch).eq('id', lead.id).select('*').single();
  if (updateError) throw updateError;
  await insertActivity(lead.id, input.eventType === 'subscription_started' ? 'conversion' : 'product_event', null, {
    eventType: input.eventType,
    externalEventId: input.externalEventId,
  });
  return { accepted: true, duplicate: false, lead: formatLead(updated) };
}

