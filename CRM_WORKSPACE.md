# Sales & Support Workspace

The CRM workspace is additive to SuperMail. It does not reuse or modify mail delivery tables, queues, workers, or provider routes.

## Enable it

1. Apply `server/migrations/20261027_crm_workspace.sql` to the SuperMail Supabase database.
2. Set `CRM_ENABLED=true` and a long random `GETAIPILOT_CRM_EVENT_KEY` on the server.
3. Set `VITE_CRM_ENABLED=true` on the client.
4. Open `/workspace`, choose **Sales & Support**, and run the first sync.

Setting either feature flag to `false` hides/disables the CRM while Mail Operations continues to use `/dashboard/*` unchanged.

## Product event contract

GetAiPilot sends product events to `POST /v1/crm/events` with the header `x-product-event-key`.

```json
{
  "productCode": "getaipilot",
  "externalEventId": "payment_01JBE7X3",
  "externalUserId": "user_98374",
  "eventType": "subscription_started",
  "occurredAt": "2026-10-27T09:30:00.000Z",
  "payload": {
    "plan": "business",
    "amount": 2499,
    "currency": "INR"
  }
}
```

`externalEventId` is the idempotency key. Repeating the same event returns success without duplicating activity. Supported event types are:

- `user_registered`
- `identity_verified`
- `onboarding_started`
- `onboarding_completed`
- `core_action_completed`
- `pricing_viewed`
- `session_activity`
- `subscription_started`
- `subscription_cancelled`

All event timestamps are UTC. The admin interface renders them in Asia/Kolkata.

## Verification

```bash
npm test --prefix server
npm run build:client
npm run test:sales --prefix client
```

The Playwright suite uses network fixtures and requires the Playwright Chromium binary (`npx playwright install chromium`).
