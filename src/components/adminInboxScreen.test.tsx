import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminInboxScreen } from './AdminInboxScreen';
import * as adminApi from '../api/adminApi';
import * as appointmentsApi from '../api/appointmentsApi';

vi.mock('../api/adminApi', async (original) => {
  const actual = await original<typeof import('../api/adminApi')>();
  return { ...actual, getInbox: vi.fn(), decideAppointment: vi.fn(), decideReschedule: vi.fn() };
});
vi.mock('../api/appointmentsApi', async (original) => {
  const actual = await original<typeof import('../api/appointmentsApi')>();
  return { ...actual, getLocations: vi.fn(), getSpecialties: vi.fn(), getProfessionalsByOffer: vi.fn() };
});

const specializedItem = {
  type: 'APPOINTMENT' as const, id: 5, status: 'REQUESTED', professionalId: 902, locationId: 2, specialtyId: 2,
  specialty: 'Cardiología Adulto', professional: 'Cardióloga Sintética', location: 'ICV',
  scheduledStartAt: '2026-10-09T14:00:00', scheduledEndAt: '2026-10-09T14:30:00', reason: 'Palpitaciones',
};
const rescheduleItem = {
  type: 'RESCHEDULE' as const, id: 1, status: 'PENDING', professionalId: 901, locationId: 1, specialtyId: 1,
  specialty: 'Medicina General', professional: 'General Sintético', location: 'HIC',
  scheduledStartAt: '2026-10-07T10:00:00', scheduledEndAt: '2026-10-07T10:30:00', reason: null,
};

describe('AdminInboxScreen', () => {
  it('lista solicitudes especializadas y reprogramaciones, y aprueba una solicitud', async () => {
    vi.mocked(appointmentsApi.getLocations).mockResolvedValue([]);
    vi.mocked(appointmentsApi.getSpecialties).mockResolvedValue([]);
    vi.mocked(adminApi.getInbox).mockResolvedValue([specializedItem, rescheduleItem]);
    vi.mocked(adminApi.decideAppointment).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<AdminInboxScreen />);

    expect(await screen.findByText('Solicitud especializada')).toBeInTheDocument();
    expect(screen.getByText('Reprogramación')).toBeInTheDocument();

    const approveButtons = screen.getAllByRole('button', { name: /aprobar/i });
    await user.click(approveButtons[0]);

    await waitFor(() => expect(adminApi.decideAppointment).toHaveBeenCalledWith(5, 'APPROVE'));
  });

  it('exige motivo antes de confirmar un rechazo', async () => {
    vi.mocked(appointmentsApi.getLocations).mockResolvedValue([]);
    vi.mocked(appointmentsApi.getSpecialties).mockResolvedValue([]);
    vi.mocked(adminApi.getInbox).mockResolvedValue([rescheduleItem]);
    vi.mocked(adminApi.decideReschedule).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<AdminInboxScreen />);

    await screen.findByText('Reprogramación');
    await user.click(screen.getByRole('button', { name: /rechazar/i }));

    const confirmButton = screen.getByRole('button', { name: /confirmar rechazo/i });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText(/motivo del rechazo/i), 'Franja no disponible');
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    await waitFor(() => expect(adminApi.decideReschedule).toHaveBeenCalledWith(1, 'REJECT', 'Franja no disponible'));
  });
});
