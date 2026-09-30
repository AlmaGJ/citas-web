import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import * as lifecycleApi from '../api/lifecycleApi';

vi.mock('../api/lifecycleApi', async (original) => {
  const actual = await original<typeof import('../api/lifecycleApi')>();
  return { ...actual, getAppointment: vi.fn(), getAppointmentHistory: vi.fn(), getRescheduleRequests: vi.fn() };
});

const appointment = {
  id: 1, patientUserId: 903, professionalId: 901, locationId: 1, specialtyId: 1,
  specialty: 'Medicina General', professional: 'General Sintético', location: 'HIC',
  durationMinutes: 30, status: 'APPROVED', scheduledStartAt: '2026-10-06T09:00:00', scheduledEndAt: '2026-10-06T09:30:00', reason: 'Chequeo',
};

describe('AppointmentDetailModal', () => {
  it('no renderiza nada sin una cita seleccionada', () => {
    const { container } = render(<AppointmentDetailModal appointmentId={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra detalle, historial y el estado de reprogramación pendiente', async () => {
    vi.mocked(lifecycleApi.getAppointment).mockResolvedValue(appointment);
    vi.mocked(lifecycleApi.getAppointmentHistory).mockResolvedValue([
      { id: 1, status: 'APPROVED', source: 'SYSTEM', actorUserId: null, changedAt: '2026-09-29T23:53:29Z', reason: 'Chequeo' },
    ]);
    vi.mocked(lifecycleApi.getRescheduleRequests).mockResolvedValue([
      { id: 1, status: 'PENDING', requestedLocationId: 1, previousStartAt: '2026-10-06T09:00:00', previousEndAt: '2026-10-06T09:30:00', requestedStartAt: '2026-10-07T10:00:00', requestedEndAt: '2026-10-07T10:30:00', decisionReason: null, decidedAt: null, createdAt: '2026-09-29T18:56:30Z' },
    ]);

    render(<AppointmentDetailModal appointmentId={1} onClose={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /medicina general/i })).toBeInTheDocument();
    expect(screen.getByText(/reprogramación: pendiente de decisión/i)).toBeInTheDocument();
    expect(screen.getByText(/historial de estados/i)).toBeInTheDocument();
    expect(screen.getAllByText(/aprobada/i).length).toBeGreaterThan(0);
  });
});
