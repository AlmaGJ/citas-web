import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Clock, MapPin, User, X } from 'lucide-react';
import { apiErrorMessage, createAppointment, getAvailability, getLocations, getSpecialties, professionalsFromSlots } from '../api/appointmentsApi';
import type { AppointmentConfirmation, AvailabilitySlot, CatalogItem, Specialty } from '../types';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: (appointment: AppointmentConfirmation) => void;
}

const todayInBogota = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose, onAppointmentBooked }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [locations, setLocations] = useState<CatalogItem[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [locationId, setLocationId] = useState<number>();
  const [specialtyId, setSpecialtyId] = useState<number>();
  const [date, setDate] = useState(todayInBogota);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [professionalId, setProfessionalId] = useState<number>();
  const [slot, setSlot] = useState<AvailabilitySlot>();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true); setError('');
    Promise.all([getLocations(), getSpecialties()])
      .then(([nextLocations, nextSpecialties]) => { setLocations(nextLocations); setSpecialties(nextSpecialties); })
      .catch((cause) => setError(apiErrorMessage(cause)))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const selectedSpecialty = specialties.find((item) => item.id === specialtyId);
  const selectedLocation = locations.find((item) => item.id === locationId);
  const professionals = useMemo(() => professionalsFromSlots(slots), [slots]);
  const selectableSlots = useMemo(() => slots.filter((item) => item.professionalId === professionalId), [slots, professionalId]);

  const loadAvailability = async () => {
    if (!locationId || !specialtyId || !date) return;
    setLoading(true); setError(''); setSlots([]); setProfessionalId(undefined); setSlot(undefined);
    try {
      setSlots(await getAvailability({ locationId, specialtyId, date }));
      setStep(2);
    } catch (cause) { setError(apiErrorMessage(cause)); }
    finally { setLoading(false); }
  };

  const finish = async () => {
    if (!locationId || !specialtyId || !slot) return;
    setLoading(true); setError('');
    try {
      const result = await createAppointment({ locationId, specialtyId, professionalId: slot.professionalId, startAt: slot.startAt, reason: reason.trim() || undefined });
      onAppointmentBooked(result);
      onClose();
      setStep(1); setReason(''); setSlots([]); setProfessionalId(undefined); setSlot(undefined);
    } catch (cause) { setError(apiErrorMessage(cause)); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  const disabled = loading;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="booking-heading">
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div><span className="text-[11px] font-semibold tracking-wider text-blue-600 uppercase">Agendar nueva cita</span><h3 id="booking-heading" className="text-lg font-bold text-slate-900">Paso {step} de 4</h3></div>
        <button type="button" onClick={onClose} aria-label="Cerrar agendamiento" className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
      </header>
      <div className="w-full bg-slate-100 h-1.5"><div className="bg-blue-600 h-1.5 transition-all" style={{ width: `${step * 25}%` }} /></div>
      <div className="p-6 overflow-y-auto space-y-5 flex-1">
        {error && <p role="alert" className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</p>}
        {loading && <p role="status" className="text-sm text-slate-600">Consultando disponibilidad…</p>}
        {step === 1 && <>
          <p className="text-sm text-slate-600">Elige sede, especialidad y fecha. La disponibilidad se consulta directamente al servicio.</p>
          <label className="block text-sm font-semibold text-slate-700">Sede<select aria-label="Sede" className="mt-1 w-full p-3 rounded-xl border border-slate-200" value={locationId ?? ''} onChange={(event) => setLocationId(Number(event.target.value) || undefined)}><option value="">Selecciona una sede</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="block text-sm font-semibold text-slate-700">Especialidad<select aria-label="Especialidad" className="mt-1 w-full p-3 rounded-xl border border-slate-200" value={specialtyId ?? ''} onChange={(event) => setSpecialtyId(Number(event.target.value) || undefined)}><option value="">Selecciona una especialidad</option>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.durationMinutes} min</option>)}</select></label>
          <label className="block text-sm font-semibold text-slate-700">Fecha<input aria-label="Fecha" min={todayInBogota()} type="date" className="mt-1 w-full p-3 rounded-xl border border-slate-200" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        </>}
        {step === 2 && <><p className="text-sm text-slate-600">Selecciona un profesional disponible para {selectedSpecialty?.name}.</p>{professionals.length === 0 ? <p className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600">No hay disponibilidad para los filtros seleccionados.</p> : <div className="grid gap-3">{professionals.map((item) => <button key={item.id} type="button" onClick={() => { setProfessionalId(item.id); setSlot(undefined); }} className={`p-4 rounded-xl border text-left flex items-center justify-between ${professionalId === item.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}><span className="flex gap-3 items-center"><User className="w-5 h-5 text-blue-600" />{item.fullName}</span>{professionalId === item.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}</button>)}</div>}</>}
        {step === 3 && <><p className="text-sm text-slate-600">Horarios disponibles para {date}. Un horario deja de estar disponible si otra persona lo reserva.</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{selectableSlots.map((item) => <button type="button" key={`${item.professionalId}-${item.startAt}`} onClick={() => setSlot(item)} className={`p-3 rounded-xl border text-sm font-medium ${slot?.startAt === item.startAt ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700'}`}><Clock className="inline w-4 h-4 mr-2 text-blue-600" />{item.startAt}</button>)}</div></>}
        {step === 4 && <><div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm space-y-2"><p><MapPin className="inline w-4 h-4 mr-2 text-blue-600" />{selectedLocation?.name}</p><p><User className="inline w-4 h-4 mr-2 text-blue-600" />{slot?.professionalName}</p><p><Calendar className="inline w-4 h-4 mr-2 text-blue-600" />{date} · {slot?.startAt}</p></div><label className="block text-sm font-semibold text-slate-700">Motivo (opcional)<textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full p-3 rounded-xl border border-slate-200" maxLength={500} /></label><p className="text-xs text-slate-500"><AlertCircle className="inline w-3.5 h-3.5 mr-1" />Una cita general se confirma automáticamente; una especializada queda solicitada para decisión administrativa.</p></>}
      </div>
      <footer className="px-6 py-4 border-t border-slate-100 flex justify-between gap-3 bg-slate-50/70"><button type="button" disabled={disabled || step === 1} onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)} className="px-4 py-2 text-sm text-slate-600 disabled:opacity-50">Atrás</button>{step === 1 && <button type="button" disabled={disabled || !locationId || !specialtyId || !date} onClick={loadAvailability} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Ver disponibilidad <ChevronRight className="inline w-4 h-4" /></button>}{step === 2 && <button type="button" disabled={!professionalId} onClick={() => setStep(3)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Continuar <ChevronRight className="inline w-4 h-4" /></button>}{step === 3 && <button type="button" disabled={!slot} onClick={() => setStep(4)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Continuar <ChevronRight className="inline w-4 h-4" /></button>}{step === 4 && <button type="button" disabled={disabled || !slot} onClick={finish} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Confirmar solicitud</button>}</footer>
    </div>
  </div>;
};
