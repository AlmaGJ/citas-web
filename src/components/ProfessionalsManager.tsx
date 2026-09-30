import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Plus, Trash2, UserRound, XCircle } from 'lucide-react';
import { getLocations } from '../api/appointmentsApi';
import type { CatalogItem } from '../types';
import {
  apiErrorMessage,
  assignProfessionalLocation,
  assignProfessionalSpecialty,
  createProfessional,
  getAllSpecialties,
  getProfessionals,
  removeProfessionalLocation,
  removeProfessionalSpecialty,
  setProfessionalActive,
  type CreateProfessionalInput,
  type ProfessionalRecord,
  type SpecialtyRecord,
} from '../api/adminCatalogApi';

const emptyForm: CreateProfessionalInput = {
  firstName: '', lastName: '', documentType: 'CC', documentNumber: '', email: '', phone: '', password: '', code: '', license: '',
};

export const ProfessionalsManager: React.FC = () => {
  const [professionals, setProfessionals] = useState<ProfessionalRecord[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyRecord[]>([]);
  const [locations, setLocations] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateProfessionalInput>(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [assignSpecialtyId, setAssignSpecialtyId] = useState<number>();
  const [assignPrimary, setAssignPrimary] = useState(false);
  const [assignLocationId, setAssignLocationId] = useState<number>();

  const load = () => {
    setLoading(true);
    setError('');
    getProfessionals().then(setProfessionals).catch((cause) => setError(apiErrorMessage(cause))).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAllSpecialties().then(setSpecialties).catch(() => undefined);
    getLocations().then(setLocations).catch(() => undefined);
  }, []);

  const submitNew = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createProfessional(form);
      setForm(emptyForm);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (professional: ProfessionalRecord) => {
    try {
      await setProfessionalActive(professional.id, !professional.active);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setAssignSpecialtyId(undefined);
    setAssignPrimary(false);
    setAssignLocationId(undefined);
  };

  const submitAssignSpecialty = async (professionalId: number) => {
    if (!assignSpecialtyId) return;
    try {
      await assignProfessionalSpecialty(professionalId, assignSpecialtyId, assignPrimary);
      setAssignSpecialtyId(undefined);
      setAssignPrimary(false);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const submitRemoveSpecialty = async (professionalId: number, specialtyId: number) => {
    try {
      await removeProfessionalSpecialty(professionalId, specialtyId);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const submitAssignLocation = async (professionalId: number) => {
    if (!assignLocationId) return;
    try {
      await assignProfessionalLocation(professionalId, assignLocationId);
      setAssignLocationId(undefined);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const submitRemoveLocation = async (professionalId: number, locationId: number) => {
    try {
      await removeProfessionalLocation(professionalId, locationId);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const specialtyName = (id: number) => specialties.find((s) => s.id === id)?.name ?? `Especialidad ${id}`;
  const locationName = (id: number) => locations.find((l) => l.id === id)?.name ?? `Sede ${id}`;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" id="professionals-manager">
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><UserRound className="w-5 h-5 text-blue-600" />Crear profesional</h2>
        {error && <p role="alert" className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">{error}</p>}
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" id="create-professional-form" onSubmit={submitNew}>
          <label className="text-xs text-slate-600">Nombres<input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Apellidos<input required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Tipo de documento<input required value={form.documentType} onChange={(event) => setForm({ ...form, documentType: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Número de documento<input required value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Correo<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Teléfono<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Contraseña temporal<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Código profesional<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Matrícula<input required value={form.license} onChange={(event) => setForm({ ...form, license: event.target.value })} className="block mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={creating} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Crear profesional</button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Profesionales</h2>
        {loading && <p role="status" className="text-sm text-slate-600">Cargando profesionales…</p>}
        <div className="space-y-2">
          {professionals.map((professional) => (
            <div key={professional.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-slate-900">{professional.name} <span className="text-xs text-slate-400 font-normal">({professional.code})</span></p>
                  <p className="text-xs text-slate-400">Matrícula {professional.license}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${professional.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{professional.active ? 'Activo' : 'Inactivo'}</span>
                  <button type="button" onClick={() => toggleActive(professional)} className={`text-xs font-semibold flex items-center gap-1 ${professional.active ? 'text-red-600 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'}`}>
                    {professional.active ? <><XCircle className="w-3.5 h-3.5" />Desactivar</> : <><CheckCircle2 className="w-3.5 h-3.5" />Activar</>}
                  </button>
                  <button type="button" onClick={() => toggleExpand(professional.id)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {expandedId === professional.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}Gestionar
                  </button>
                </div>
              </div>
              {expandedId === professional.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Especialidades</h4>
                    <div className="space-y-1 mb-2">
                      {professional.specialties.length === 0 && <p className="text-xs text-slate-400">Sin especialidades asignadas.</p>}
                      {professional.specialties.map((assignment) => (
                        <div key={assignment.specialtyId} className="flex items-center justify-between text-sm">
                          <span>{specialtyName(assignment.specialtyId)}{assignment.primary && <span className="ml-2 text-xs font-semibold text-blue-600">Primaria</span>}</span>
                          <button type="button" onClick={() => submitRemoveSpecialty(professional.id, assignment.specialtyId)} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3 h-3" />Quitar</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <select value={assignSpecialtyId ?? ''} onChange={(event) => setAssignSpecialtyId(Number(event.target.value) || undefined)} className="rounded-lg border border-slate-200 p-2 text-sm">
                        <option value="">Selecciona especialidad</option>
                        {specialties.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <label className="text-xs text-slate-600 flex items-center gap-1"><input type="checkbox" checked={assignPrimary} onChange={(event) => setAssignPrimary(event.target.checked)} />Primaria</label>
                      <button type="button" disabled={!assignSpecialtyId} onClick={() => submitAssignSpecialty(professional.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Asignar</button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Sedes</h4>
                    <div className="space-y-1 mb-2">
                      {professional.locationIds.length === 0 && <p className="text-xs text-slate-400">Sin sedes asignadas.</p>}
                      {professional.locationIds.map((locationId) => (
                        <div key={locationId} className="flex items-center justify-between text-sm">
                          <span>{locationName(locationId)}</span>
                          <button type="button" onClick={() => submitRemoveLocation(professional.id, locationId)} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3 h-3" />Quitar</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <select value={assignLocationId ?? ''} onChange={(event) => setAssignLocationId(Number(event.target.value) || undefined)} className="rounded-lg border border-slate-200 p-2 text-sm">
                        <option value="">Selecciona sede</option>
                        {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                      <button type="button" disabled={!assignLocationId} onClick={() => submitAssignLocation(professional.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Asignar</button>
                    </div>
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
