import type { SalesStage } from './types.js';

export const stageLabel = (stage: SalesStage) => ({
  unreviewed: 'Unreviewed',
  qualified: 'Qualified',
  contacting: 'Contacting',
  engaged: 'Engaged',
  demo_trial: 'Demo / Trial',
  nurture: 'Nurture',
  won: 'Won',
  lost: 'Lost',
  unqualified: 'Unqualified',
}[stage]);

export function validateStageTransition(input: {
  previousStage: SalesStage;
  nextStage: SalesStage;
  nextFollowUpAt?: string | null;
  lostReason?: string | null;
  note?: string | null;
}) {
  if (input.nextStage === 'nurture' && !input.nextFollowUpAt) {
    throw new Error('A follow-up date is required when moving a lead to Nurture.');
  }
  if (input.nextStage === 'lost' && !input.lostReason?.trim()) {
    throw new Error('A lost reason is required when moving a lead to Lost.');
  }
  if (input.previousStage === 'won' && input.nextStage !== 'won' && !input.note?.trim()) {
    throw new Error('A note is required when reversing a conversion.');
  }
}

export const parseRangeDays = (value: unknown) => {
  const match = String(value || '30d').match(/^(7|30|90)d$/);
  return match ? Number(match[1]) : 30;
};

export function computeIntentScore(input: {
  identityVerified: boolean;
  onboardingStarted: boolean;
  onboardingCompleted: boolean;
  activated: boolean;
  pricingViewedAt?: string | null;
  lastProductActivityAt?: string | null;
  activeDayCount: number;
}, now = new Date()) {
  let score = 0;
  if (input.identityVerified) score += 10;
  if (input.onboardingStarted) score += 10;
  if (input.onboardingCompleted) score += 25;
  if (input.activated) score += 25;
  if (input.pricingViewedAt && now.getTime() - new Date(input.pricingViewedAt).getTime() <= 30 * 86400000) score += 15;
  if (input.lastProductActivityAt && now.getTime() - new Date(input.lastProductActivityAt).getTime() <= 7 * 86400000) score += 10;
  if (input.activeDayCount >= 3) score += 5;
  return Math.min(score, 100);
}

export function deriveLifecycle(input: {
  identityVerified: boolean;
  onboardingStarted: boolean;
  onboardingCompleted: boolean;
  activated: boolean;
  onboardingCompletedAt?: string | null;
  lastProductActivityAt?: string | null;
  registeredAt: string;
}, now = new Date()) {
  if (input.activated) return 'activated';
  const activityAt = new Date(input.lastProductActivityAt || input.onboardingCompletedAt || input.registeredAt).getTime();
  if (input.onboardingCompleted && now.getTime() - activityAt >= 7 * 86400000) return 'post_onboarding_inactive';
  if (input.onboardingCompleted) return 'onboarding_completed';
  if (input.onboardingStarted && now.getTime() - activityAt >= 72 * 3600000) return 'onboarding_dropoff';
  if (input.onboardingStarted) return 'onboarding_in_progress';
  if (!input.identityVerified) return 'unverified';
  return 'onboarding_pending';
}

export const encodeCursor = (offset: number) => Buffer.from(String(offset), 'utf8').toString('base64url');

export const decodeCursor = (cursor: unknown) => {
  if (!cursor) return 0;
  try {
    const value = Number(Buffer.from(String(cursor), 'base64url').toString('utf8'));
    return Number.isInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
};

