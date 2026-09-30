import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EpsPlansManager } from './EpsPlansManager';
import { SpecialtiesManager } from './SpecialtiesManager';
import { ProfessionalsManager } from './ProfessionalsManager';
import * as adminCatalogApi from '../api/adminCatalogApi';
import * as appointmentsApi from '../api/appointmentsApi';

vi.mock('../api/adminCatalogApi', async (original) => {
  const actual = await original<typeof import('../api/adminCatalogApi')>();
  return {
    ...actual,
    getAllEps: vi.fn(), createEps: vi.fn(), updateEps: vi.fn(), setEpsActive: vi.fn(),
    getPlans: vi.fn(), createPlan: vi.fn(), setPlanActive: vi.fn(), getRegimes: vi.fn(),
    getAllSpecialties: vi.fn(), createSpecialty: vi.fn(), updateSpecialty: vi.fn(), setSpecialtyActive: vi.fn(),
    getProfessionals: vi.fn(), createProfessional: vi.fn(), setProfessionalActive: vi.fn(),
    assignProfessionalSpecialty: vi.fn(), removeProfessionalSpecialty: vi.fn(),
    assignProfessionalLocation: vi.fn(), removeProfessionalLocation: vi.fn(),
  };
});
vi.mock('../api/appointmentsApi', async (original) => {
  const actual = await original<typeof import('../api/appointmentsApi')>();
  return { ...actual, getLocations: vi.fn() };
});

describe('EpsPlansManager', () => {
  it('crea una EPS y activa/desactiva desde la lista', async () => {
    vi.mocked(adminCatalogApi.getAllEps).mockResolvedValue([{ id: 1, code: 'EPS_A', name: 'EPS A', active: true }]);
    vi.mocked(adminCatalogApi.getRegimes).mockResolvedValue([]);
    vi.mocked(adminCatalogApi.setEpsActive).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<EpsPlansManager />);

    expect(await screen.findByText('EPS A')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /desactivar/i }));

    await waitFor(() => expect(adminCatalogApi.setEpsActive).toHaveBeenCalledWith(1, false));
  });
});

describe('SpecialtiesManager', () => {
  it('crea una especialidad con los datos del formulario', async () => {
    vi.mocked(adminCatalogApi.getAllSpecialties).mockResolvedValue([]);
    vi.mocked(adminCatalogApi.createSpecialty).mockResolvedValue({ id: 1, code: 'DERM', name: 'Dermatología', durationMinutes: 30, general: false, approvalRequired: true, active: true });

    const user = userEvent.setup();
    render(<SpecialtiesManager />);

    await user.type(screen.getByLabelText(/código/i), 'DERM');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Dermatología');
    await user.click(screen.getByRole('button', { name: /crear especialidad/i }));

    await waitFor(() => expect(adminCatalogApi.createSpecialty).toHaveBeenCalledWith('DERM', 'Dermatología', 30, false, true));
  });
});

describe('ProfessionalsManager', () => {
  it('asigna una especialidad primaria a un profesional existente', async () => {
    const professional = { id: 1, userId: 10, code: 'PROF-1', name: 'Ana Ruiz', license: 'RM-1', active: true, specialties: [], locationIds: [] };
    vi.mocked(adminCatalogApi.getProfessionals).mockResolvedValue([professional]);
    vi.mocked(adminCatalogApi.getAllSpecialties).mockResolvedValue([{ id: 2, code: 'CARD', name: 'Cardiología', durationMinutes: 30, general: false, approvalRequired: true, active: true }]);
    vi.mocked(appointmentsApi.getLocations).mockResolvedValue([]);
    vi.mocked(adminCatalogApi.assignProfessionalSpecialty).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ProfessionalsManager />);

    await screen.findByText('Ana Ruiz');
    await user.click(screen.getByRole('button', { name: /gestionar/i }));
    await user.selectOptions(screen.getByText(/selecciona especialidad/i).closest('select')!, '2');
    await user.click(screen.getByLabelText(/primaria/i));
    await user.click(screen.getAllByRole('button', { name: /^asignar$/i })[0]);

    await waitFor(() => expect(adminCatalogApi.assignProfessionalSpecialty).toHaveBeenCalledWith(1, 2, true));
  });
});
