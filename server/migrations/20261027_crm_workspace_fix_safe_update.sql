-- Fix for environments with Supabase's pg-safeupdate guard enabled.
-- The original refresh intentionally touches every CRM lead so the trigger can
-- recalculate time-based lifecycle states and intent scores. An explicit WHERE
-- predicate keeps that behavior while satisfying the guard.
CREATE OR REPLACE FUNCTION public.crm_refresh_derived()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.crm_leads
  SET updated_at = updated_at
  WHERE id IS NOT NULL;
END;
$$;
