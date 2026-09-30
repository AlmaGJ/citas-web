import { apiErrorMessage, ApiError } from './appointmentsApi';
import { getAccessToken } from '../auth/authApi';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export interface ProfessionalAppointment {
  id: number; patientUserId: number; professionalId: number; locationId: number; specialtyId: number;
  specialty: string; professional: string; location: string; durationMinutes: number; status: string;
  scheduledStartAt: string; scheduledEndAt: string; reason?: string;
}

export interface AvailabilityBlockRecord {
  id: number;
  locationId: number;
  date: string;
  start: string;
  end: string;
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

export const getProfessionalAppointments = (from: string, to: string, locationId?: number) => {
  const query = new URLSearchParams({ from, to });
  if (locationId) query.set('locationId', String(locationId));
  return request<ProfessionalAppointment[]>(`/api/v1/professional/appointments?${query}`);
};

export const closeAppointment = (id: number, status: 'COMPLETED' | 'NO_SHOW', reason?: string) =>
  request<ProfessionalAppointment>(`/api/v1/professional/appointments/${id}/closure`, { method: 'POST', body: JSON.stringify({ status, reason }) });

export const getMyBlocks = () => request<AvailabilityBlockRecord[]>('/api/v1/professional/availability-blocks');

export const createBlock = (locationId: number, date: string, start: string, end: string) =>
  request<void>('/api/v1/professional/availability-blocks', { method: 'POST', body: JSON.stringify({ locationId, date, start, end }) });

export const updateBlock = (id: number, locationId: number, date: string, start: string, end: string) =>
  request<void>(`/api/v1/professional/availability-blocks/${id}`, { method: 'PATCH', body: JSON.stringify({ locationId, date, start, end }) });

export const deleteBlock = (id: number) =>
  request<void>(`/api/v1/professional/availability-blocks/${id}`, { method: 'DELETE' });
