import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, ClipboardList, MapPin, Stethoscope, XCircle } from 'lucide-react';
import { getLocations, getProfessionalsByOffer, getSpecialties, type ProfessionalOffer } from '../api/appointmentsApi';
import { apiErrorMessage, decideAppointment, decideReschedule, getInbox, type InboxItem } from '../api/adminApi';
import type { CatalogItem, Specialty } from '../types';

const typeCopy: Record<InboxItem['type'], string> = {
  APPOINTMENT: 'Solicitud especializada',
  RESCHEDULE: 'Reprogramación',
};

export const AdminInboxScreen: React.FC = () => {
  const [locations, setLocations] = useState<CatalogItem[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOffer[]>([]);

  const [locationId, setLocationId] = useState<number>();
  const [specialtyId, setSpecialtyId] = useState<number>();
  const [professionalId, setProfessionalId] = useState<number>();
  const [date, setDate] = useState('');

  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decidingId, setDecidingId] = useState<number | null>(null);
  const [rejectingItem, setRejectingItem] = useState<InboxItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    getLocations().then(setLocations).catch(() => undefined);
    getSpecialties().then(setSpecialties).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!specialtyId || !locationId) { setProfessionals([]); setProfessionalId(undefined); return; }
    getProfessionalsByOffer(specialtyId, locationId).then(setProfessionals).catch(() => setProfessionals([]));
  }, [specialtyId, locationId]);

  const load = () => {
    setLoading(true);
    setError('');
    getInbox({ locationId, specialtyId, professionalId, date: date || undefined })
      .then(setItems)
      .catch((cause) => setError(apiErrorMessage(cause)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [locationId, specialtyId, professionalId, date]);

  const approve = async (item: InboxItem) => {
    setDecidingId(item.id);
    try {
      if (item.type === 'APPOINTMENT') await decideAppointment(item.id, 'APPROVE');
      else await decideReschedule(item.id, 'APPROVE');
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setDecidingId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectingItem || !rejectReason.trim()) return;
    setDecidingId(rejectingItem.id);
    try {
      if (rejectingItem.type === 'APPOINTMENT') await decideAppointment(rejectingItem.id, 'REJECT', rejectReason.trim());
      else await decideReschedule(rejectingItem.id, 'REJECT', rejectReason.trim());
      setRejectingItem(null);
      setRejectReason('');
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" id="admin-inbox-screen">
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" />Bandeja administrativa</h2>
          <p className="text-sm text-slate-500">Solicitudes especializadas y reprogramaciones pendientes de decisión.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" id="inbox-filters">
          <label className="text-xs text-slate-600">Sede
            <select value={locationId ?? ''} onChange={(event) => setLocationId(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
              <option value="">Todas</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">Especialidad
            <select value={specialtyId ?? ''} onChange={(event) => setSpecialtyId(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
              <option value="">Todas</option>
              {specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">Profesional
            <select value={professionalId ?? ''} disabled={!specialtyId || !locationId} onChange={(event) => setProfessionalId(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm disabled:opacity-50">
              <option value="">{specialtyId && locationId ? 'Todos' : 'Elige sede y especialidad'}</option>
              {professionals.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
        </div>
        {loading && <p role="status" className="text-sm text-slate-600">Cargando bandeja…</p>}
        {error && <p role="alert" className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-sm text-slate-500 py-5 text-center">No hay pendientes con los filtros seleccionados.</p>}
        <div className="space-y-3">
          {items.map((item) => (
            <article key={`${item.type}-${item.id}`} className="rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{typeCopy[item.type]}</span>
                  <p className="font-semibold text-slate-900 mt-1 flex items-center gap-1"><Stethoscope className="w-4 h-4 text-blue-600" />{item.specialty} · {item.professional}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(item.scheduledStartAt).toLocaleString('es-CO')}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</p>
                  {item.reason && <p className="text-xs text-slate-500 mt-1">Motivo: {item.reason}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" disabled={decidingId === item.id} onClick={() => approve(item)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 disabled:opacity-50">
                    <CheckCircle2 className="w-3.5 h-3.5" />Aprobar
                  </button>
                  <button type="button" disabled={decidingId === item.id} onClick={() => { setRejectingItem(item); setRejectReason(''); }} className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50">
                    <XCircle className="w-3.5 h-3.5" />Rechazar
                  </button>
                </div>
              </div>
              {rejectingItem && rejectingItem.type === item.type && rejectingItem.id === item.id && (
                <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-slate-100">
                  <label className="text-xs text-slate-600 flex-1 min-w-[200px]">Motivo del rechazo (obligatorio)
                    <input type="text" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} maxLength={500} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
                  </label>
                  <button type="button" disabled={!rejectReason.trim() || decidingId === item.id} onClick={confirmReject} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Confirmar rechazo</button>
                  <button type="button" onClick={() => setRejectingItem(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500">Cancelar</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
