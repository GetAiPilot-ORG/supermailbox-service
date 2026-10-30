export const SALES_STAGES = [
  'unreviewed',
  'qualified',
  'contacting',
  'engaged',
  'demo_trial',
  'nurture',
  'won',
  'lost',
  'unqualified',
] as const;

export type SalesStage = typeof SALES_STAGES[number];

export const CRM_EVENT_TYPES = [
  'user_registered',
  'identity_verified',
  'onboarding_started',
  'onboarding_completed',
  'core_action_completed',
  'pricing_viewed',
  'session_activity',
  'subscription_started',
  'subscription_cancelled',
] as const;

export type CrmEventType = typeof CRM_EVENT_TYPES[number];

export interface GetAiPilotUserSnapshot {
  externalUserId: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  accountType: string;
  country: string | null;
  registeredAt: string;
  identityVerified: boolean;
  onboardingStarted: boolean;
  onboardingStartedAt: string | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
  lastProductActivityAt: string | null;
  sourceSnapshot: Record<string, unknown>;
}

export interface ProductEventInput {
  productCode: string;
  externalEventId: string;
  externalUserId: string;
  eventType: CrmEventType;
  occurredAt: string;
  payload: Record<string, unknown>;
}

