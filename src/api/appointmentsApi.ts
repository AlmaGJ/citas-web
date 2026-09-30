import { getAccessToken } from '../auth/authApi';
import type { AppointmentConfirmation, AvailabilitySlot, CatalogItem, Professional, Specialty } from '../types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'No fue posible conectar con el servicio de citas.');
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(response.status, problem?.detail ?? 'No fue posible completar la solicitud.');
  }
  return response.json() as Promise<T>;
}

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Ocurrió un error inesperado.';
  if (error.status === 403) return 'No tienes permiso para realizar esta acción.';
  if (error.status === 409) return 'Este horario acaba de ser reservado. Elige otro disponible.';
  if (error.status === 400) return 'La selección ya no es válida. Actualiza los datos e inténtalo de nuevo.';
  return error.message;
}

export interface AvailabilityQuery {
  locationId: number;
  specialtyId: number;
  date: string;
  professionalId?: number;
}

export interface CreateAppointmentRequest {
  professionalId: number;
  locationId: number;
  specialtyId: number;
  /** Local HH:mm on the supplied date; business zone is America/Bogota. */
  startAt: string;
  reason?: string;
}

export function getLocations(): Promise<CatalogItem[]> {
  return apiRequest('/api/v1/catalogs/locations');
}

export function getSpecialties(): Promise<Specialty[]> {
  return apiRequest('/api/v1/catalogs/specialties');
}

export interface ProfessionalOffer {
  id: number;
  code: string;
  name: string;
}

export function getProfessionalsByOffer(specialtyId: number, locationId: number): Promise<ProfessionalOffer[]> {
  return apiRequest(`/api/v1/professionals?specialtyId=${specialtyId}&locationId=${locationId}`);
}

export function getAvailability(query: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({
    locationId: String(query.locationId),
    specialtyId: String(query.specialtyId),
    date: query.date,
  });
  if (query.professionalId) params.set('professionalId', String(query.professionalId));
  return apiRequest(`/api/v1/availability?${params.toString()}`);
}

export function createAppointment(request: CreateAppointmentRequest): Promise<AppointmentConfirmation> {
  return apiRequest('/api/v1/appointments', { method: 'POST', body: JSON.stringify(request) });
}

/** Kept separate because a slot is the authoritative available professional list. */
export function professionalsFromSlots(slots: AvailabilitySlot[]): Professional[] {
  return Array.from(new Map(slots.map((slot) => [slot.professionalId, {
    id: slot.professionalId,
    fullName: slot.professionalName,
  }])).values());
}
