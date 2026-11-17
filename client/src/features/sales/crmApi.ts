import type { AdminProfile, CrmActivity, CrmTask, LeadDetail, SalesLead, SalesOverview, SupportTicket } from './types';

export const getCrmApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('SUPERMAILBOX_API_TARGET');
    if (saved === 'production') return 'https://gapmail.getaipilot.in/v1';
    if (saved === 'local') return 'http://localhost:5050/v1';

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      const localUrl = (import.meta as any).env?.VITE_LOCAL_API_URL || 'http://localhost:5050';
      return `${localUrl.replace(/\/+$/, '')}/v1`;
    }
  }

  const envUrl = (import.meta as any).env?.VITE_API_URL || 'https://gapmail.getaipilot.in';
  return `${envUrl.replace(/\/+$/, '')}/v1`;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem('adminToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body) headers.set('Content-Type', 'application/json');
  try {
    const apiBase = getCrmApiBase();
    const response = await fetch(`${apiBase}${path}`, { ...init, headers, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Request failed (${response.status}).`);
    return data as T;
  } finally {
    window.clearTimeout(timeout);
  }
};

const qs = (input: Record<string, string | number | null | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : '';
};

export const CrmApi = {
  sync: (force = true) => request<{ sync: { stale: boolean; lastSuccessAt: string | null } }>('/crm/sync', { method: 'POST', body: JSON.stringify({ force }) }),
  overview: (range = '30d') => request<{ overview: SalesOverview }>(`/crm/overview${qs({ range })}`).then((result) => result.overview),
  leads: (filters: Record<string, string | number | null | undefined> = {}) => request<{ items: SalesLead[]; total: number; nextCursor: string | null }>(`/crm/leads${qs({ limit: 2000, ...filters })}`),
  lead: (id: string) => request<LeadDetail & { success: true }>(`/crm/leads/${id}`),
  updateLead: (id: string, body: Record<string, unknown>) => request<{ lead: SalesLead }>(`/crm/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then((result) => result.lead),
  extractLeads: (body: { ids?: string[]; allNew?: boolean }) => request<{ success: true; extracted: number }>('/crm/leads/extract', { method: 'POST', body: JSON.stringify(body) }),
  syncEcosystem: (id: string) => request<{ success: true; queued: boolean; platforms: string[] }>(`/crm/leads/${id}/sync-ecosystem`, { method: 'POST' }),
  staff: () => request<{ success: true; staff: AdminProfile[] }>('/crm/staff').then((res) => res.staff || []),
  addActivity: (id: string, body: { type: 'note' | 'call'; body: string }) => request<{ activity: CrmActivity }>(`/crm/leads/${id}/activities`, { method: 'POST', body: JSON.stringify(body) }).then((result) => result.activity),
  tasks: (filters: Record<string, string> = {}) => request<{ tasks: CrmTask[] }>(`/crm/tasks${qs(filters)}`).then((result) => result.tasks),
  createTask: (body: { leadId: string; title: string; dueAt: string }) => request<{ task: CrmTask }>('/crm/tasks', { method: 'POST', body: JSON.stringify(body) }).then((result) => result.task),
  updateTask: (id: string, body: Record<string, unknown>) => request<{ task: CrmTask }>(`/crm/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then((result) => result.task),
  tickets: (filters: Record<string, string> = {}) => request<{ tickets: SupportTicket[] }>(`/crm/tickets${qs(filters)}`).then((result) => result.tickets),
  createTicket: (body: { leadId: string; subject: string; description?: string; priority: SupportTicket['priority'] }) => request<{ ticket: SupportTicket }>('/crm/tickets', { method: 'POST', body: JSON.stringify(body) }).then((result) => result.ticket),
  updateTicket: (id: string, body: Record<string, unknown>) => request<{ ticket: SupportTicket }>(`/crm/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then((result) => result.ticket),
};

