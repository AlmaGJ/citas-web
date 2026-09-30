import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, MapPin, Pencil, Plus, Trash2, UserX } from 'lucide-react';
import { getLocations } from '../api/appointmentsApi';
import {
  apiErrorMessage,
  closeAppointment,
  createBlock,
  deleteBlock,
  getMyBlocks,
  getProfessionalAppointments,
  updateBlock,
  type AvailabilityBlockRecord,
  type ProfessionalAppointment,
} from '../api/professionalApi';

const bogotaToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

function startOfWeek(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const statusCopy: Record<string, string> = { APPROVED: 'Aprobada' };

export const ProfessionalAgendaScreen: React.FC = () => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(bogotaToday()));
  const weekEnd = addDays(weekStart, 6);

  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [closingId, setClosingId] = useState<number | null>(null);

  const [locations, setLocations] = useState<Array<{ id: number; name: string }>>([]);
  const [blocks, setBlocks] = useState<AvailabilityBlockRecord[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [blocksError, setBlocksError] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const [newLocationId, setNewLocationId] = useState<number>();
  const [newDate, setNewDate] = useState(bogotaToday());
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [editLocationId, setEditLocationId] = useState<number>();
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const loadAppointments = () => {
    setLoadingAppointments(true);
    setAppointmentsError('');
    getProfessionalAppointments(weekStart, weekEnd)
      .then(setAppointments)
      .catch((cause) => setAppointmentsError(apiErrorMessage(cause)))
      .finally(() => setLoadingAppointments(false));
  };

  const loadBlocks = () => {
    setLoadingBlocks(true);
    setBlocksError('');
    getMyBlocks()
      .then(setBlocks)
      .catch((cause) => setBlocksError(apiErrorMessage(cause)))
      .finally(() => setLoadingBlocks(false));
  };

  useEffect(loadAppointments, [weekStart]);
  useEffect(() => {
    getLocations().then(setLocations).catch(() => undefined);
    loadBlocks();
  }, []);

  const close = async (id: number, status: 'COMPLETED' | 'NO_SHOW') => {
    setClosingId(id);
    try {
      await closeAppointment(id, status);
      loadAppointments();
    } catch (cause) {
      setAppointmentsError(apiErrorMessage(cause));
    } finally {
      setClosingId(null);
    }
  };

  const submitNewBlock = async () => {
    if (!newLocationId) return;
    setCreating(true);
    setBlocksError('');
    try {
      await createBlock(newLocationId, newDate, `${newStart}:00`, `${newEnd}:00`);
      setNewStart('09:00');
      setNewEnd('10:00');
      loadBlocks();
    } catch (cause) {
      setBlocksError(apiErrorMessage(cause));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (block: AvailabilityBlockRecord) => {
    setEditingBlockId(block.id);
    setEditLocationId(block.locationId);
    setEditDate(block.date);
    setEditStart(block.start.slice(0, 5));
    setEditEnd(block.end.slice(0, 5));
  };

  const saveEdit = async (id: number) => {
    if (!editLocationId) return;
    try {
      await updateBlock(id, editLocationId, editDate, `${editStart}:00`, `${editEnd}:00`);
      setEditingBlockId(null);
      loadBlocks();
    } catch (cause) {
      setBlocksError(apiErrorMessage(cause));
    }
  };

  const removeBlock = async (id: number) => {
    try {
      await deleteBlock(id);
      loadBlocks();
    } catch (cause) {
      setBlocksError(apiErrorMessage(cause));
    }
  };

  const byDay = appointments.reduce<Record<string, ProfessionalAppointment[]>>((acc, item) => {
    const day = item.scheduledStartAt.slice(0, 10);
    (acc[day] ??= []).push(item);
    return acc;
  }, {});
  const days = Object.keys(byDay).sort();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" id="professional-agenda-screen">
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" />Mi agenda</h2>
            <p className="text-sm text-slate-500">Citas aprobadas de {weekStart} a {weekEnd}.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Semana anterior" className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setWeekStart(startOfWeek(bogotaToday()))} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">Hoy</button>
            <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Semana siguiente" className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {loadingAppointments && <p role="status" className="text-sm text-slate-600">Cargando agenda…</p>}
        {appointmentsError && <p role="alert" className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">{appointmentsError}</p>}
        {!loadingAppointments && !appointmentsError && days.length === 0 && <p className="text-sm text-slate-500 py-5 text-center">No tienes citas aprobadas en este rango.</p>}
        {days.map((day) => (
          <div key={day} className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {new Date(`${day}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            {byDay[day].map((appointment) => {
              const isPast = new Date(appointment.scheduledEndAt).getTime() < Date.now();
              return (
                <article key={appointment.id} className="rounded-2xl border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{appointment.specialty}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(appointment.scheduledStartAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} – {new Date(appointment.scheduledEndAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{appointment.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{statusCopy[appointment.status] ?? appointment.status}</span>
                    {isPast && (
                      <>
                        <button type="button" disabled={closingId === appointment.id} onClick={() => close(appointment.id, 'COMPLETED')} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 disabled:opacity-50">
                          <CheckCircle2 className="w-3.5 h-3.5" />Completada
                        </button>
                        <button type="button" disabled={closingId === appointment.id} onClick={() => close(appointment.id, 'NO_SHOW')} className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50">
                          <UserX className="w-3.5 h-3.5" />No asistió
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4" id="professional-availability-panel">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" />Mi disponibilidad</h2>
        {blocksError && <p role="alert" className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">{blocksError}</p>}
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" id="create-block-form">
          <label className="text-xs text-slate-600">Sede
            <select value={newLocationId ?? ''} onChange={(event) => setNewLocationId(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
              <option value="">Selecciona</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">Fecha<input type="date" min={bogotaToday()} value={newDate} onChange={(event) => setNewDate(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Inicio<input type="time" step={1800} value={newStart} onChange={(event) => setNewStart(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Fin<input type="time" step={1800} value={newEnd} onChange={(event) => setNewEnd(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <button type="button" id="create-block-button" disabled={creating || !newLocationId} onClick={submitNewBlock} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Crear bloque</button>
        </div>
        {loadingBlocks && <p role="status" className="text-sm text-slate-600">Cargando bloques…</p>}
        {!loadingBlocks && blocks.length === 0 && <p className="text-sm text-slate-500 py-3 text-center">No tienes bloques de disponibilidad futuros.</p>}
        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-xl border border-slate-100 p-3">
              {editingBlockId === block.id ? (
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-xs text-slate-600">Sede
                    <select value={editLocationId ?? ''} onChange={(event) => setEditLocationId(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
                      {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-slate-600">Fecha<input type="date" min={bogotaToday()} value={editDate} onChange={(event) => setEditDate(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <label className="text-xs text-slate-600">Inicio<input type="time" step={1800} value={editStart} onChange={(event) => setEditStart(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <label className="text-xs text-slate-600">Fin<input type="time" step={1800} value={editEnd} onChange={(event) => setEditEnd(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <button type="button" onClick={() => saveEdit(block.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Guardar</button>
                  <button type="button" onClick={() => setEditingBlockId(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500">Cancelar</button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">{locations.find((location) => location.id === block.locationId)?.name ?? `Sede ${block.locationId}`}</span>
                    {' · '}{block.date} · {block.start.slice(0, 5)}–{block.end.slice(0, 5)}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => startEdit(block)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Pencil className="w-3.5 h-3.5" />Editar</button>
                    <button type="button" onClick={() => removeBlock(block.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
