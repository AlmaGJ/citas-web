export type ScreenType = 'login' | 'register' | 'dashboard' | 'forgot-password' | 'reset-password';

export type Role = 'USER' | 'PROFESSIONAL' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
}

/** Values below deliberately mirror REST DTOs; the server remains authoritative. */
export interface CatalogItem {
  id: number;
  name: string;
}

export interface Specialty extends CatalogItem {
  durationMinutes: 30 | 60;
  appointmentType: 'GENERAL' | 'SPECIALIZED';
}

export interface Professional {
  id: number;
  fullName: string;
  specialtyIds?: number[];
}

export interface AvailabilitySlot {
  professionalId: number;
  professionalName: string;
  startAt: string;
  endAt: string;
}

export type AppointmentStatus = 'APPROVED' | 'REQUESTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface AppointmentConfirmation {
  id: number;
  status: AppointmentStatus;
  professionalName: string;
  specialtyName: string;
  locationName: string;
  startAt: string;
  endAt: string;
}

export interface AppointmentHistoryEntry {
  id: number;
  status: AppointmentStatus;
  source: string;
  actorUserId: number | null;
  changedAt: string;
  reason?: string | null;
}

export type RescheduleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface RescheduleRequestRecord {
  id: number;
  status: RescheduleRequestStatus;
  requestedLocationId: number;
  previousStartAt: string;
  previousEndAt: string;
  requestedStartAt: string;
  requestedEndAt: string;
  decisionReason?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}
