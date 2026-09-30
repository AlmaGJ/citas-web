import { apiErrorMessage, ApiError } from './appointmentsApi';
import { getAccessToken } from '../auth/authApi';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export type InboxItemType = 'APPOINTMENT' | 'RESCHEDULE';

export interface InboxItem {
  type: InboxItemType;
  id: number;
  status: string;
  professionalId: number;
  locationId: number;
  specialtyId: number;
  specialty: string;
  professional: string;
  location: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  reason?: string | null;
}

export interface InboxFilters {
  locationId?: number;
  professionalId?: number;
  specialtyId?: number;
  date?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init, credentials: 'include',
    headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(response.status, problem?.detail ?? 'No fue posible completar la solicitud.');
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export { apiErrorMessage };

export const getInbox = (filters: InboxFilters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') query.set(key, String(value)); });
  return request<InboxItem[]>(`/api/v1/admin/inbox${query.size ? `?${query}` : ''}`);
};

export const decideAppointment = (id: number, decision: 'APPROVE' | 'REJECT', reason?: string) =>
  request<void>(`/api/v1/admin/appointments/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision, reason }) });

export const decideReschedule = (id: number, decision: 'APPROVE' | 'REJECT', reason?: string) =>
  request<void>(`/api/v1/admin/reschedule-requests/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision, reason }) });
