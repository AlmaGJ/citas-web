import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Stethoscope, Clock, History as HistoryIcon } from 'lucide-react';
import {
  apiErrorMessage,
  getAppointment,
  getAppointmentHistory,
  getRescheduleRequests,
  type AppointmentRecord,
} from '../api/lifecycleApi';
import type { AppointmentHistoryEntry, RescheduleRequestRecord } from '../types';

interface AppointmentDetailModalProps {
  appointmentId: number | null;
  onClose: () => void;
}

const statusCopy: Record<string, string> = {
  REQUESTED: 'Solicitada',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No asistió',
};

const rescheduleStatusCopy: Record<string, string> = {
  PENDING: 'Pendiente de decisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ appointmentId, onClose }) => {
  const [appointment, setAppointment] = useState<AppointmentRecord | null>(null);
  const [history, setHistory] = useState<AppointmentHistoryEntry[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointmentId == null) return;
    let active = true;
    setAppointment(null);
    setHistory([]);
    setRescheduleRequests([]);
    setLoading(true);
    setError('');
    Promise.all([getAppointment(appointmentId), getAppointmentHistory(appointmentId), getRescheduleRequests(appointmentId)])
      .then(([detail, historyEntries, rescheduleEntries]) => {
        if (!active) return;
        setAppointment(detail);
        setHistory(historyEntries);
        setRescheduleRequests(rescheduleEntries);
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [appointmentId]);

  if (appointmentId == null) return null;
  const latestReschedule = rescheduleRequests[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="appointment-detail-heading">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]" id="appointment-detail-modal">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-blue-600 uppercase">Detalle de cita</span>
            <h3 id="appointment-detail-heading" className="text-lg font-bold text-slate-900">
              {appointment ? appointment.specialty : `Cita #${appointmentId}`}
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar detalle" className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && <p role="status" className="text-sm text-slate-600">Cargando detalle…</p>}
          {error && <p role="alert" className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</p>}
          {appointment && (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm space-y-2">
                <p><Stethoscope className="inline w-4 h-4 mr-2 text-blue-600" />{appointment.professional}</p>
                <p><MapPin className="inline w-4 h-4 mr-2 text-blue-600" />{appointment.location}</p>
                <p><Calendar className="inline w-4 h-4 mr-2 text-blue-600" />{new Date(appointment.scheduledStartAt).toLocaleString('es-CO')}</p>
                <p><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{statusCopy[appointment.status] ?? appointment.status}</span></p>
                {appointment.reason && <p className="text-slate-600">Motivo: {appointment.reason}</p>}
              </div>
              {latestReschedule && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm space-y-1" id="appointment-reschedule-status">
                  <p className="font-semibold text-amber-800">
                    Reprogramación: {rescheduleStatusCopy[latestReschedule.status] ?? latestReschedule.status}
                  </p>
                  <p className="text-amber-700">Nueva franja solicitada: {new Date(latestReschedule.requestedStartAt).toLocaleString('es-CO')}</p>
                  {latestReschedule.decisionReason && <p className="text-amber-700">Motivo de decisión: {latestReschedule.decisionReason}</p>}
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <HistoryIcon className="w-4 h-4 text-blue-600" />Historial de estados
                </h4>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
                ) : (
                  <ol className="space-y-2 border-l-2 border-slate-100 pl-4">
                    {history.map((entry) => (
                      <li key={entry.id} className="text-sm">
                        <p className="font-semibold text-slate-800">{statusCopy[entry.status] ?? entry.status}</p>
                        <p className="text-xs text-slate-500"><Clock className="inline w-3 h-3 mr-1" />{new Date(entry.changedAt).toLocaleString('es-CO')} · {entry.source}</p>
                        {entry.reason && <p className="text-xs text-slate-500">{entry.reason}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
