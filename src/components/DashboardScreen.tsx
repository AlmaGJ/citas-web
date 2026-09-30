import React, { useEffect, useState } from 'react';
import { Calendar, ClipboardList, Eye, LogOut, Plus, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import type { Role, User } from '../types';
import { apiErrorMessage, cancelAppointment, getMyAppointments, getRescheduleRequests, requestReschedule, type AppointmentRecord } from '../api/lifecycleApi';
import { getLocations } from '../api/appointmentsApi';
import { ProfessionalAgendaScreen } from './ProfessionalAgendaScreen';
import { AdminScreen } from './AdminScreen';

interface DashboardScreenProps {
  user: User;
  refreshKey?: number;
  onOpenBooking: () => void;
  onOpenAppointment: (id: number) => void;
  onLogout: () => void;
}

const rescheduleStatusCopy: Record<string, string> = {
  PENDING: 'Reprogramación pendiente',
  APPROVED: 'Reprogramación aprobada',
  REJECTED: 'Reprogramación rechazada',
};

const roleCopy: Record<Role, { title: string; description: string; icon: typeof UserRound }> = {
  USER: { title: 'Agenda de paciente', description: 'Busca disponibilidad y solicita una cita. Las citas no se guardan en este navegador.', icon: UserRound },
  PROFESSIONAL: { title: 'Agenda profesional', description: 'Consulta tu agenda semanal, cierra atenciones vencidas y gestiona tus bloques de disponibilidad.', icon: Stethoscope },
  ADMIN: { title: 'Administración', description: 'Revisa la bandeja de decisiones pendientes y gestiona EPS, planes, especialidades y profesionales.', icon: ClipboardList },
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, refreshKey = 0, onOpenBooking, onOpenAppointment, onLogout }) => {
  const activeRole = (user.roles.find((role): role is Role => role in roleCopy) ?? 'USER');
  const content = roleCopy[activeRole];
  const Icon = content.icon;
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(activeRole === 'USER');
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState('');
  const [rescheduleLocation, setRescheduleLocation] = useState<number>();
  const [locations, setLocations] = useState<Array<{ id: number; name: string }>>([]);
  const [pendingReschedules, setPendingReschedules] = useState<Record<number, string>>({});
  useEffect(() => {
    if (activeRole !== 'USER') return;
    let mounted = true;
    const loadAppointments = () => {
      setLoadingAppointments(true);
      setAppointmentError(null);
      getMyAppointments().then((items) => {
        if (!mounted) return;
        setAppointments(items);
        const approved = items.filter((item) => item.status === 'APPROVED');
        Promise.all(approved.map((item) => getRescheduleRequests(item.id).then((requests) => [item.id, requests[0]?.status] as const).catch(() => [item.id, undefined] as const)))
          .then((results) => {
            if (!mounted) return;
            const statuses: Record<number, string> = {};
            results.forEach(([id, status]) => { if (status) statuses[id] = status; });
            setPendingReschedules(statuses);
          });
      }).catch((error) => { if (mounted) setAppointmentError(apiErrorMessage(error)); }).finally(() => { if (mounted) setLoadingAppointments(false); });
    };
    loadAppointments();
    getLocations().then(setLocations).catch(() => undefined);
    window.addEventListener('focus', loadAppointments);
    return () => { mounted = false; window.removeEventListener('focus', loadAppointments); };
  }, [activeRole, refreshKey]);
  const cancel = async (id: number) => {
    try { const updated = await cancelAppointment(id); setAppointments((current) => current.map((item) => item.id === id ? updated : item)); }
    catch (error) { setAppointmentError(apiErrorMessage(error)); }
  };
  const submitReschedule = async (id: number) => {
    if (!rescheduleAt || !rescheduleLocation) return;
    try {
      await requestReschedule(id, rescheduleAt, rescheduleLocation);
      setReschedulingId(null); setRescheduleAt('');
      window.dispatchEvent(new Event('focus'));
    } catch (error) { setAppointmentError(apiErrorMessage(error)); }
  };
  return <div className="w-full max-w-6xl mx-auto space-y-6 pb-12" id="portal-dashboard">
    <header className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white"><Calendar className="w-5 h-5" /></div><div><span className="text-base font-bold tracking-tight text-slate-900 block">Portal de Citas</span><span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Acceso seguro</span></div></div>
      <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><span className="text-sm font-semibold text-slate-900 block">{user.name}</span><span className="text-xs text-slate-400">{activeRole}</span></div><button type="button" onClick={onLogout} title="Cerrar sesión" className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /></button></div>
    </header>
    <section className="relative bg-gradient-to-r from-[#07152B] via-[#0A1F3E] to-[#0E2952] rounded-3xl p-7 sm:p-10 text-white border border-slate-800/60 shadow-xl overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" /><div className="relative flex flex-col gap-5"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-xs text-blue-100 w-fit"><ShieldCheck className="w-3.5 h-3.5" />Sesión autenticada</div><div><p className="text-blue-200 text-sm">{content.title}</p><h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">Hola, {user.name}</h1><p className="text-slate-300 text-sm mt-3 max-w-2xl">{content.description}</p></div>{activeRole === 'USER' && <button type="button" id="book-new-appointment-btn" onClick={onOpenBooking} className="w-fit px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-md flex items-center gap-2"><Plus className="w-4 h-4" />Agendar cita</button>}</div>
    </section>
    {activeRole === 'USER' ? <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4" aria-live="polite"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Icon className="w-6 h-6" /></div><div><h2 className="text-lg font-bold text-slate-900">Mis citas</h2><p className="text-sm text-slate-500">Información consultada directamente al API autorizado.</p></div></div><button type="button" onClick={() => window.dispatchEvent(new Event('focus'))} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Actualizar citas</button></div>{loadingAppointments && <p className="text-sm text-slate-500">Cargando citas…</p>}{appointmentError && <p role="alert" className="text-sm text-red-600">{appointmentError}</p>}{!loadingAppointments && !appointmentError && appointments.length === 0 && <p className="text-sm text-slate-500 py-5 text-center">Aún no tienes citas registradas.</p>}{appointments.map((appointment) => <article key={appointment.id} className="rounded-2xl border border-slate-100 p-4 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{appointment.specialty}</p><p className="text-sm text-slate-500">{appointment.professional} · {appointment.location}</p><p className="text-xs text-slate-400 mt-1">{new Date(appointment.scheduledStartAt).toLocaleString('es-CO')}</p></div><div className="flex items-center gap-3 flex-wrap justify-end"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{appointment.status}</span>{pendingReschedules[appointment.id] && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{rescheduleStatusCopy[pendingReschedules[appointment.id]] ?? pendingReschedules[appointment.id]}</span>}<button type="button" onClick={() => onOpenAppointment(appointment.id)} className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Ver detalle</button>{['APPROVED','REQUESTED'].includes(appointment.status) && <><button type="button" onClick={() => cancel(appointment.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Cancelar</button><button type="button" onClick={() => { setReschedulingId(appointment.id); setRescheduleLocation(appointment.locationId); }} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Reprogramar</button></>}</div></div>{reschedulingId === appointment.id && <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-slate-100"><label className="text-xs text-slate-600">Nueva fecha y hora<input type="datetime-local" value={rescheduleAt} onChange={(event) => setRescheduleAt(event.target.value)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label><label className="text-xs text-slate-600">Sede<select value={rescheduleLocation ?? ''} onChange={(event) => setRescheduleLocation(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><button type="button" onClick={() => submitReschedule(appointment.id)} disabled={!rescheduleAt || !rescheduleLocation} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Solicitar</button><button type="button" onClick={() => setReschedulingId(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500">Cerrar</button></div>}</article>)}</section> : activeRole === 'PROFESSIONAL' ? <ProfessionalAgendaScreen /> : <AdminScreen />}
  </div>;
};
