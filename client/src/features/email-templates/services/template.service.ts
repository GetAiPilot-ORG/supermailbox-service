import type { EmailTemplate, GalleryTemplate, QualityIssue, TemplateVersion } from '../types/template.types';
import { filterLocalGallery } from './templateGallerySeeds';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/v1` : 'http://127.0.0.1:5050/v1';
let lastGalleryUsedFallback = false;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> || {}) };
  if (init?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok || payload?.success === false) {
    throw new Error(payload?.error || `Request failed with ${res.status}`);
  }
  return payload.data as T;
}

export const templateService = {
  listTemplates: (params: URLSearchParams) => api<EmailTemplate[]>(`/templates/manager?${params.toString()}`),
  listGalleryTemplates: async (params: URLSearchParams) => {
    try {
      const templates = await api<GalleryTemplate[]>(`/templates/gallery?${params.toString()}`);
      lastGalleryUsedFallback = false;
      return templates;
    } catch {
      lastGalleryUsedFallback = true;
      return filterLocalGallery(params);
    }
  },
  isGalleryFallback: () => lastGalleryUsedFallback,
  getTemplate: (id: string) => api<EmailTemplate | null>(`/templates/${id}/detail`),
  createBlankTemplate: (name?: string) => api<EmailTemplate>('/templates/blank', { method: 'POST', body: JSON.stringify({ name }) }),
  cloneSystemTemplate: (seedKey: string, name?: string) => api<EmailTemplate>('/templates/clone', { method: 'POST', body: JSON.stringify({ seedKey, name }) }),
  updateTemplate: (id: string, data: Record<string, unknown>) => api<EmailTemplate>(`/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  autosaveTemplate: (id: string, data: Record<string, unknown>) => api<EmailTemplate>(`/templates/${id}/autosave`, { method: 'POST', body: JSON.stringify(data) }),
  duplicateTemplate: (id: string) => api<EmailTemplate>(`/templates/${id}/duplicate`, { method: 'POST' }),
  archiveTemplate: (id: string) => api<{ archived: boolean }>(`/templates/${id}/archive`, { method: 'POST' }),
  softDeleteTemplate: (id: string) => api<{ deleted: boolean }>(`/templates/${id}`, { method: 'DELETE' }),
  listVersions: (id: string) => api<TemplateVersion[]>(`/templates/${id}/versions`),
  restoreVersion: (id: string, versionId: string) => api<EmailTemplate>(`/templates/${id}/versions/${versionId}/restore`, { method: 'POST' }),
  compileTemplate: (id: string) => api<{ html: string; plainText: string; errors: string[]; quality: QualityIssue[] }>(`/templates/${id}/compile`, { method: 'POST' }),
  compileMjml: (body: { mjmlContent: string; subject?: string; preheader?: string; category?: string }) =>
    api<{ html: string; plainText: string; errors: string[]; quality: QualityIssue[] }>('/templates/compile-mjml', { method: 'POST', body: JSON.stringify(body) }),
  sendTest: (id: string, body: { recipientEmail: string; subject: string; sampleData?: Record<string, string> }) =>
    api<{ success: boolean; provider: string; previewUrl?: string | false; error?: string }>(`/templates/${id}/test-send`, { method: 'POST', body: JSON.stringify(body) }),
};
