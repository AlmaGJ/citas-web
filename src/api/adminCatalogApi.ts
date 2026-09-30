import { apiErrorMessage, ApiError } from './appointmentsApi';
import { getAccessToken } from '../auth/authApi';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export interface RegimeRecord { id: number; code: string; name: string; }
export interface EpsRecord { id: number; code: string; name: string; active: boolean; }
export interface PlanRecord { id: number; epsId: number; regimeId: number; code: string; name: string; active: boolean; }
export interface SpecialtyRecord { id: number; code: string; name: string; durationMinutes: number; general: boolean; approvalRequired: boolean; active: boolean; }
export interface SpecialtyAssignment { specialtyId: number; primary: boolean; active: boolean; }
export interface ProfessionalRecord { id: number; userId: number; code: string; name: string; license: string; active: boolean; specialties: SpecialtyAssignment[]; locationIds: number[]; }
export interface CreateProfessionalInput {
  firstName: string; lastName: string; documentType: string; documentNumber: string;
  email: string; phone: string; password: string; code: string; license: string;
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

export const getRegimes = () => request<RegimeRecord[]>('/api/v1/admin/insurance-regimes');

export const getAllEps = () => request<EpsRecord[]>('/api/v1/admin/eps');
export const createEps = (code: string, name: string) => request<EpsRecord>('/api/v1/admin/eps', { method: 'POST', body: JSON.stringify({ code, name }) });
export const updateEps = (id: number, code: string, name: string) => request<EpsRecord>(`/api/v1/admin/eps/${id}`, { method: 'PATCH', body: JSON.stringify({ code, name }) });
export const setEpsActive = (id: number, active: boolean) => request<void>(`/api/v1/admin/eps/${id}/${active ? 'activate' : 'deactivate'}`, { method: 'POST' });

export const getPlans = (epsId: number) => request<PlanRecord[]>(`/api/v1/admin/eps/${epsId}/plans`);
export const createPlan = (epsId: number, regimeId: number, code: string, name: string) =>
  request<PlanRecord>(`/api/v1/admin/eps/${epsId}/plans`, { method: 'POST', body: JSON.stringify({ regimeId, code, name }) });
export const updatePlan = (epsId: number, id: number, regimeId: number, code: string, name: string) =>
  request<PlanRecord>(`/api/v1/admin/eps/${epsId}/plans/${id}`, { method: 'PATCH', body: JSON.stringify({ regimeId, code, name }) });
export const setPlanActive = (epsId: number, id: number, active: boolean) =>
  request<void>(`/api/v1/admin/eps/${epsId}/plans/${id}/${active ? 'activate' : 'deactivate'}`, { method: 'POST' });

export const getAllSpecialties = () => request<SpecialtyRecord[]>('/api/v1/admin/specialties');
export const createSpecialty = (code: string, name: string, durationMinutes: number, general: boolean, approvalRequired: boolean) =>
  request<SpecialtyRecord>('/api/v1/admin/specialties', { method: 'POST', body: JSON.stringify({ code, name, durationMinutes, general, approvalRequired }) });
export const updateSpecialty = (id: number, code: string, name: string, durationMinutes: number, general: boolean, approvalRequired: boolean) =>
  request<SpecialtyRecord>(`/api/v1/admin/specialties/${id}`, { method: 'PATCH', body: JSON.stringify({ code, name, durationMinutes, general, approvalRequired }) });
export const setSpecialtyActive = (id: number, active: boolean) =>
  request<void>(`/api/v1/admin/specialties/${id}/${active ? 'activate' : 'deactivate'}`, { method: 'POST' });

export const getProfessionals = () => request<ProfessionalRecord[]>('/api/v1/admin/professionals');
export const createProfessional = (input: CreateProfessionalInput) => request<ProfessionalRecord>('/api/v1/admin/professionals', { method: 'POST', body: JSON.stringify(input) });
export const setProfessionalActive = (id: number, active: boolean) => request<void>(`/api/v1/admin/professionals/${id}/${active ? 'activate' : 'deactivate'}`, { method: 'POST' });
export const assignProfessionalSpecialty = (id: number, specialtyId: number, primary: boolean) =>
  request<void>(`/api/v1/admin/professionals/${id}/specialties`, { method: 'POST', body: JSON.stringify({ specialtyId, primary }) });
export const removeProfessionalSpecialty = (id: number, specialtyId: number) =>
  request<void>(`/api/v1/admin/professionals/${id}/specialties/${specialtyId}`, { method: 'DELETE' });
export const assignProfessionalLocation = (id: number, locationId: number) =>
  request<void>(`/api/v1/admin/professionals/${id}/locations`, { method: 'POST', body: JSON.stringify({ locationId }) });
export const removeProfessionalLocation = (id: number, locationId: number) =>
  request<void>(`/api/v1/admin/professionals/${id}/locations/${locationId}`, { method: 'DELETE' });
