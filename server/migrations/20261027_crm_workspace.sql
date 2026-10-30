-- Additive Sales & Support workspace schema.
-- Intentionally isolated from all mail delivery tables.

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL,
  external_user_id TEXT NOT NULL,
  email CITEXT,
  phone TEXT,
  full_name TEXT NOT NULL DEFAULT 'Unknown user',
  account_type TEXT NOT NULL DEFAULT 'Free Tier',
  country TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  identity_verified BOOLEAN NOT NULL DEFAULT false,
  onboarding_started BOOLEAN NOT NULL DEFAULT false,
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  activated BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  pricing_viewed_at TIMESTAMPTZ,
  last_product_activity_at TIMESTAMPTZ,
  active_day_count INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT NOT NULL DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'active', 'cancelled')),
  lifecycle_state TEXT NOT NULL DEFAULT 'registered'
    CHECK (lifecycle_state IN (
      'registered', 'unverified', 'onboarding_pending', 'onboarding_in_progress',
      'onboarding_dropoff', 'onboarding_completed', 'post_onboarding_inactive', 'activated'
    )),
  sales_stage TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (sales_stage IN (
      'unreviewed', 'qualified', 'contacting', 'engaged', 'demo_trial',
      'nurture', 'won', 'lost', 'unqualified'
    )),
  intent_score INTEGER NOT NULL DEFAULT 0 CHECK (intent_score BETWEEN 0 AND 100),
  intent_band TEXT NOT NULL DEFAULT 'cold'
    CHECK (intent_band IN ('cold', 'warm', 'high_intent', 'sales_ready')),
  next_follow_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,



  
  conversion_source TEXT CHECK (conversion_source IN ('product_event', 'manual')),
  lost_reason TEXT,
  source_snapshot JSONB NOT NULL DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_code, external_user_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_leads(sales_stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_lifecycle ON public.crm_leads(lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_crm_leads_intent ON public.crm_leads(intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_follow_up ON public.crm_leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_crm_leads_registered ON public.crm_leads(registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON public.crm_leads(email);

CREATE TABLE IF NOT EXISTS public.crm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  external_user_id TEXT NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'user_registered', 'identity_verified', 'onboarding_started',
    'onboarding_completed', 'core_action_completed', 'pricing_viewed',
    'session_activity', 'subscription_started', 'subscription_cancelled'
  )),
  payload JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_code, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_events_lead_time ON public.crm_events(lead_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'note', 'call', 'stage_changed', 'conversion', 'conversion_revoked',
    'product_event', 'task_created', 'task_completed', 'ticket_created', 'ticket_updated'
  )),
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  actor TEXT NOT NULL DEFAULT 'admin',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_time ON public.crm_activities(lead_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON public.crm_tasks(status, due_at);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead ON public.crm_tasks(lead_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_tickets_status_priority ON public.crm_support_tickets(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_lead ON public.crm_support_tickets(lead_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_sync_state (
  product_code TEXT PRIMARY KEY,
  last_started_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.crm_set_lead_derived()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  score_value INTEGER := 0;
  activity_time TIMESTAMPTZ;
BEGIN
  activity_time := COALESCE(NEW.last_product_activity_at, NEW.registered_at);

  score_value := score_value + CASE WHEN NEW.identity_verified THEN 10 ELSE 0 END;
  score_value := score_value + CASE WHEN NEW.onboarding_started THEN 10 ELSE 0 END;
  score_value := score_value + CASE WHEN NEW.onboarding_completed THEN 25 ELSE 0 END;
  score_value := score_value + CASE WHEN NEW.activated THEN 25 ELSE 0 END;
  score_value := score_value + CASE WHEN NEW.pricing_viewed_at >= now() - interval '30 days' THEN 15 ELSE 0 END;
  score_value := score_value + CASE WHEN activity_time >= now() - interval '7 days' THEN 10 ELSE 0 END;
  score_value := score_value + CASE WHEN NEW.active_day_count >= 3 THEN 5 ELSE 0 END;
  NEW.intent_score := LEAST(score_value, 100);
  NEW.intent_band := CASE
    WHEN NEW.intent_score >= 80 THEN 'sales_ready'
    WHEN NEW.intent_score >= 60 THEN 'high_intent'
    WHEN NEW.intent_score >= 30 THEN 'warm'
    ELSE 'cold'
  END;

  NEW.lifecycle_state := CASE
    WHEN NEW.activated THEN 'activated'
    WHEN NEW.onboarding_completed AND COALESCE(NEW.activated_at, NEW.onboarding_completed_at, activity_time) < now() - interval '7 days'
      THEN 'post_onboarding_inactive'
    WHEN NEW.onboarding_completed THEN 'onboarding_completed'
    WHEN NEW.onboarding_started AND activity_time < now() - interval '72 hours' THEN 'onboarding_dropoff'
    WHEN NEW.onboarding_started THEN 'onboarding_in_progress'
    WHEN NOT NEW.identity_verified THEN 'unverified'
    WHEN NEW.identity_verified THEN 'onboarding_pending'
    ELSE 'registered'
  END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_leads_derived ON public.crm_leads;
CREATE TRIGGER trg_crm_leads_derived
BEFORE INSERT OR UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION public.crm_set_lead_derived();

CREATE OR REPLACE FUNCTION public.crm_refresh_derived()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep an explicit predicate for databases using the pg-safeupdate extension.
  -- Every persisted lead has a non-null primary key, so this still refreshes all rows.
  UPDATE public.crm_leads
  SET updated_at = updated_at
  WHERE id IS NOT NULL;
END;
$$;
