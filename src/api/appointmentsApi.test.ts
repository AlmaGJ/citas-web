import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../auth/authApi', () => ({ getAccessToken: () => 'test-access-token' }));

function response(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('appointmentsApi', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('consulta disponibilidad con fecha local y autorización Bearer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([]));
    vi.stubGlobal('fetch', fetchMock);
    const api = await import('./appointmentsApi');

    await api.getAvailability({ locationId: 1, specialtyId: 2, date: '2026-09-25' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/availability?locationId=1&specialtyId=2&date=2026-09-25',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-access-token' }) }),
    );
  });

  it('mapea conflicto de reserva a un mensaje accionable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ detail: 'slot occupied' }, 409)));
    const api = await import('./appointmentsApi');

    await expect(api.createAppointment({ professionalId: 3, locationId: 1, specialtyId: 2, startAt: '09:00' })).rejects.toMatchObject({ status: 409 });
    try { await api.createAppointment({ professionalId: 3, locationId: 1, specialtyId: 2, startAt: '09:00' }); }
    catch (error) { expect(api.apiErrorMessage(error)).toMatch(/acaba de ser reservado/i); }
  });

  it('mapea acceso denegado sin exponer el detalle del servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ detail: 'forbidden by policy' }, 403)));
    const api = await import('./appointmentsApi');

    try { await api.getLocations(); }
    catch (error) { expect(api.apiErrorMessage(error)).toBe('No tienes permiso para realizar esta acción.'); }
  });

  it('conserva el resultado APPROVED o REQUESTED que devuelve el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ id: 8, status: 'REQUESTED', professionalName: 'Profesional', specialtyName: 'Especialidad', locationName: 'Sede', startAt: '09:00', endAt: '09:30' }, 201)));
    const api = await import('./appointmentsApi');
    const result = await api.createAppointment({ professionalId: 3, locationId: 1, specialtyId: 2, startAt: '09:00' });
    expect(result.status).toBe('REQUESTED');
  });
});
