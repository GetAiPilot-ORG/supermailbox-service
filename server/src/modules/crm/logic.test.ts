import assert from 'node:assert/strict';
import test from 'node:test';
import { computeIntentScore, decodeCursor, deriveLifecycle, encodeCursor, parseRangeDays, validateStageTransition } from './logic.js';

const NOW = new Date('2026-10-27T12:00:00.000Z');

test('intent score applies every configured signal and caps at 100', () => {
  assert.equal(computeIntentScore({
    identityVerified: true,
    onboardingStarted: true,
    onboardingCompleted: true,
    activated: true,
    pricingViewedAt: '2026-10-20T12:00:00.000Z',
    lastProductActivityAt: '2026-10-26T12:00:00.000Z',
    activeDayCount: 4,
  }, NOW), 100);
});

test('onboarding drop-off begins at 72 hours and completed inactivity at seven days', () => {
  assert.equal(deriveLifecycle({ identityVerified: true, onboardingStarted: true, onboardingCompleted: false, activated: false, lastProductActivityAt: '2026-10-24T11:59:59.000Z', registeredAt: '2026-10-20T00:00:00.000Z' }, NOW), 'onboarding_dropoff');
  assert.equal(deriveLifecycle({ identityVerified: true, onboardingStarted: true, onboardingCompleted: true, activated: false, lastProductActivityAt: '2026-10-20T11:59:59.000Z', registeredAt: '2026-10-10T00:00:00.000Z' }, NOW), 'post_onboarding_inactive');
});

test('stage transitions enforce nurture, lost and conversion reversal context', () => {
  assert.throws(() => validateStageTransition({ previousStage: 'qualified', nextStage: 'nurture' }), /follow-up date/i);
  assert.throws(() => validateStageTransition({ previousStage: 'engaged', nextStage: 'lost' }), /lost reason/i);
  assert.throws(() => validateStageTransition({ previousStage: 'won', nextStage: 'engaged' }), /note/i);
  assert.doesNotThrow(() => validateStageTransition({ previousStage: 'won', nextStage: 'engaged', note: 'Payment was refunded.' }));
});

test('range and cursor helpers are bounded and reversible', () => {
  assert.equal(parseRangeDays('90d'), 90);
  assert.equal(parseRangeDays('365d'), 30);
  assert.equal(decodeCursor(encodeCursor(150)), 150);
  assert.equal(decodeCursor('bad'), 0);
});

