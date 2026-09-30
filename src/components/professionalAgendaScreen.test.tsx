import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfessionalAgendaScreen } from './ProfessionalAgendaScreen';
import * as professionalApi from '../api/professionalApi';
import * as appointmentsApi from '../api/appointmentsApi';

vi.mock('../api/professionalApi', async (original) => {
  const actual = await original<typeof import('../api/professionalApi')>();
  return { ...actual, getProfessionalAppointments: vi.fn(), getMyBlocks: vi.fn(), closeAppointment: vi.fn(), createBlock: vi.fn(), updateBlock: vi.fn(), deleteBlock: vi.fn() };
});
vi.mock('../api/appointmentsApi', async (original) => {
  const actual = await original<typeof import('../api/appointmentsApi')>();
  return { ...actual, getLocations: vi.fn() };
});

describe('ProfessionalAgendaScreen', () => {
  it('muestra una cita pasada con acciones de cierre y permite marcarla como completada', async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    const appointment = {
      id: 10, patientUserId: 5, professionalId: 901, locationId: 1, specialtyId: 1,
      specialty: 'Medicina General', professional: 'General Sintético', location: 'HIC', durationMinutes: 30,
      status: 'APPROVED', scheduledStartAt: past.toISOString(), scheduledEndAt: past.toISOString(),
    };
    vi.mocked(professionalApi.getProfessionalAppointments).mockResolvedValue([appointment]);
    vi.mocked(professionalApi.getMyBlocks).mockResolvedValue([]);
    vi.mocked(appointmentsApi.getLocations).mockResolvedValue([{ id: 1, name: 'HIC' }]);
    vi.mocked(professionalApi.closeAppointment).mockResolvedValue({ ...appointment, status: 'COMPLETED' });

    const user = userEvent.setup();
    render(<ProfessionalAgendaScreen />);

    expect(await screen.findByText('Medicina General')).toBeInTheDocument();
    const completeButton = await screen.findByRole('button', { name: /completada/i });
    await user.click(completeButton);

    await waitFor(() => expect(professionalApi.closeAppointment).toHaveBeenCalledWith(10, 'COMPLETED'));
  });

  it('crea un bloque de disponibilidad con los datos del formulario', async () => {
    vi.mocked(professionalApi.getProfessionalAppointments).mockResolvedValue([]);
    vi.mocked(professionalApi.getMyBlocks).mockResolvedValue([]);
    vi.mocked(appointmentsApi.getLocations).mockResolvedValue([{ id: 1, name: 'HIC' }]);
    vi.mocked(professionalApi.createBlock).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ProfessionalAgendaScreen />);

    await screen.findByText(/no tienes bloques de disponibilidad/i);
    await user.selectOptions(screen.getByLabelText(/sede/i), '1');
    await user.click(screen.getByRole('button', { name: /crear bloque/i }));

    await waitFor(() => expect(professionalApi.createBlock).toHaveBeenCalledWith(1, expect.any(String), '09:00:00', '10:00:00'));
  });
});
