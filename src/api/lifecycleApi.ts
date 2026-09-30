import { apiErrorMessage, ApiError } from './appointmentsApi';
import { getAccessToken } from '../auth/authApi';
import type { AppointmentHistoryEntry, RescheduleRequestRecord } from '../types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export interface AppointmentRecord {
  id: number; patientUserId: number; professionalId: number; locationId: number; specialtyId: number;
  specialty: string; professional: string; location: string; durationMinutes: number; status: string;
  scheduledStartAt: string; scheduledEndAt: string; reason?: string;
}
export interface UserProfile { id: number; firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone?: string; }

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
  if (response.status === 204 || response.status === 202) return undefined as T;
  return response.json() as Promise<T>;
}

export { apiErrorMessage };
export const getMyProfile = () => request<UserProfile>('/api/v1/users/me');
export const updateMyPhone = (phone: string) => request<UserProfile>('/api/v1/users/me', { method: 'PATCH', body: JSON.stringify({ phone }) });
export const getMyAppointments = (filters: { status?: string; from?: string; to?: string } = {}) => {
  const query = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => value && query.set(key, value));
  return request<AppointmentRecord[]>(`/api/v1/appointments${query.size ? `?${query}` : ''}`);
};
export const getAppointment = (id: number) => request<AppointmentRecord>(`/api/v1/appointments/${id}`);
export const cancelAppointment = (id: number, reason?: string) => request<AppointmentRecord>(`/api/v1/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
export const requestReschedule = (id: number, startAt: string, locationId: number) => request<{ id: number; status: string }>(`/api/v1/appointments/${id}/reschedule-requests`, { method: 'POST', body: JSON.stringify({ startAt, locationId }) });
export const getAppointmentHistory = (id: number) => request<AppointmentHistoryEntry[]>(`/api/v1/appointments/${id}/history`);
export const getRescheduleRequests = (id: number) => request<RescheduleRequestRecord[]>(`/api/v1/appointments/${id}/reschedule-requests`);
export const requestPasswordRecovery = (email: string) => request<void>('/api/v1/auth/password-recovery', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (token: string, password: string, passwordConfirmation: string) => request<void>('/api/v1/auth/password-reset', { method: 'POST', body: JSON.stringify({ token, password, passwordConfirmation }) });
