import { expect, test, type Page } from '@playwright/test';

const lead = {
  id: 'lead-1', productCode: 'getaipilot', externalUserId: 'user-1', email: 'asha@example.com', phone: null,
  fullName: 'Asha Verma', accountType: 'Business', country: 'India', registeredAt: '2026-10-25T08:00:00.000Z',
  identityVerified: true, onboardingStarted: true, onboardingStartedAt: '2026-10-25T08:10:00.000Z', onboardingCompleted: false,
  onboardingCompletedAt: null, activated: false, activatedAt: null, pricingViewedAt: '2026-10-26T08:00:00.000Z',
  lastProductActivityAt: '2026-10-26T09:00:00.000Z', subscriptionStatus: 'none', lifecycleState: 'onboarding_in_progress',
  salesStage: 'unreviewed', intentScore: 70, intentBand: 'high_intent', nextFollowUpAt: null, convertedAt: null,
  conversionSource: null, lostReason: null, lastSyncedAt: '2026-10-27T07:00:00.000Z', updatedAt: '2026-10-27T07:00:00.000Z',
};

const overview = {
  rangeDays: 30,
  metrics: { registered: 228, onboardingCompleted: 121, onboardingRate: 53.1, activated: 82, activationRate: 36, converted: 19, conversionRate: 8.3, openTickets: 3 },
  funnel: { registered: 228, verified: 194, onboardingStarted: 157, onboardingCompleted: 121, activated: 82, converted: 19 },
  pipeline: { unreviewed: 112, qualified: 34, contacting: 21, engaged: 12, demo_trial: 6, nurture: 15, won: 19, lost: 7, unqualified: 2 },
  signals: { overdueTasks: [], hotLeads: [lead], onboardingDropoffs: [], urgentTickets: [] },
  sync: { lastSuccessAt: '2026-10-27T07:00:00.000Z', lastError: null, recordsSeen: 228, stale: false },
};

async function mockCrm(page: Page) {
  await page.addInitScript(() => localStorage.setItem('adminToken', 'test-admin-token'));
  await page.route('**/v1/crm/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    let body: any = { success: true };
    if (url.pathname.endsWith('/sync')) body = { success: true, sync: { stale: false, lastSuccessAt: '2026-10-27T07:00:00.000Z' } };
    else if (url.pathname.endsWith('/overview')) body = { success: true, overview };
    else if (url.pathname.endsWith('/leads') && method === 'GET') body = { success: true, items: [lead], total: 1, nextCursor: null };
    else if (url.pathname.endsWith('/leads/lead-1') && method === 'GET') body = { success: true, lead, activities: [], tasks: [], tickets: [] };
    else if (url.pathname.endsWith('/leads/lead-1') && method === 'PATCH') body = { success: true, lead };
    else if (url.pathname.includes('/activities')) body = { success: true, activity: { id: 'activity-1' } };
    else if (url.pathname.endsWith('/tasks') && method === 'GET') body = { success: true, tasks: [] };
    else if (url.pathname.endsWith('/tasks') && method === 'POST') body = { success: true, task: { id: 'task-1' } };
    else if (url.pathname.endsWith('/tickets') && method === 'GET') body = { success: true, tickets: [] };
    else if (url.pathname.endsWith('/tickets') && method === 'POST') body = { success: true, ticket: { id: 'ticket-1' } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test('workspace chooser keeps Sales and Mail as explicit destinations', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adminToken', 'test-admin-token'));
  await page.goto('/workspace');
  await expect(page.getByRole('heading', { name: 'Choose your workspace' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sales & Support/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Mail Operations/ })).toBeVisible();
});

test('sales signal queue opens the shared customer record', async ({ page }) => {
  await mockCrm(page);
  await page.goto('/sales');
  await expect(page.getByRole('heading', { name: 'Needs attention' })).toBeVisible();
  await expect(page.locator('.sales-metric-ledger strong').first()).toHaveText('228');
  await page.getByRole('button', { name: /High interest Asha Verma/ }).click();
  await expect(page.getByRole('dialog', { name: 'Lead record' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Lead record' }).getByRole('heading', { name: 'Asha Verma', level: 2 })).toBeVisible();
  await page.getByRole('dialog', { name: 'Lead record' }).getByRole('button', { name: 'Sales work', exact: true }).click();
  await page.getByRole('dialog', { name: 'Lead record' }).getByRole('combobox').first().selectOption('nurture');
  await expect(page.getByRole('button', { name: 'Save sales stage' })).toBeDisabled();
});

test('people view is responsive and searchable', async ({ page }) => {
  await mockCrm(page);
  await page.goto('/sales/people');
  await expect(page.getByPlaceholder('Search name, email, or phone')).toBeVisible();
  await expect(page.getByText('Asha Verma')).toBeVisible();
});

test('mail deep link still renders the existing command center', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adminToken', 'test-admin-token'));
  await page.route('**/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = path.includes('stats') ? { metrics: [] } : path.includes('queue') ? { jobs: [] } : path.includes('logs') ? { logs: [] } : path.includes('templates') ? { templates: [] } : path.includes('campaign') ? { campaigns: [] } : path.includes('suppress') ? { suppressions: [] } : path.includes('bounce') ? { bounces: [] } : {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Delivery command center' })).toBeVisible();
  await expect(page.locator('.sales-sidebar')).toHaveCount(0);
});

