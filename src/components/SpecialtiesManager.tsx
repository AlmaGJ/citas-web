import React, { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, Stethoscope, XCircle } from 'lucide-react';
import {
  apiErrorMessage,
  createSpecialty,
  getAllSpecialties,
  setSpecialtyActive,
  updateSpecialty,
  type SpecialtyRecord,
} from '../api/adminCatalogApi';

interface FormState {
  code: string;
  name: string;
  durationMinutes: 30 | 60;
  general: boolean;
  approvalRequired: boolean;
}

const emptyForm: FormState = { code: '', name: '', durationMinutes: 30, general: false, approvalRequired: true };

export const SpecialtiesManager: React.FC = () => {
  const [specialties, setSpecialties] = useState<SpecialtyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const load = () => {
    setLoading(true);
    setError('');
    getAllSpecialties().then(setSpecialties).catch((cause) => setError(apiErrorMessage(cause))).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submitNew = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    try {
      await createSpecialty(form.code.trim(), form.name.trim(), form.durationMinutes, form.general, form.approvalRequired);
      setForm(emptyForm);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const startEdit = (specialty: SpecialtyRecord) => {
    setEditingId(specialty.id);
    setEditForm({ code: specialty.code, name: specialty.name, durationMinutes: specialty.durationMinutes as 30 | 60, general: specialty.general, approvalRequired: specialty.approvalRequired });
  };

  const saveEdit = async (id: number) => {
    try {
      await updateSpecialty(id, editForm.code.trim(), editForm.name.trim(), editForm.durationMinutes, editForm.general, editForm.approvalRequired);
      setEditingId(null);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const toggleActive = async (specialty: SpecialtyRecord) => {
    try {
      await setSpecialtyActive(specialty.id, !specialty.active);
      load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" id="specialties-manager">
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-blue-600" />Especialidades</h2>
        {error && <p role="alert" className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">{error}</p>}
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" id="create-specialty-form">
          <label className="text-xs text-slate-600">Código<input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} maxLength={50} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Nombre<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={150} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Duración
            <select value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) as 30 | 60 })} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </label>
          <label className="text-xs text-slate-600 flex items-center gap-2 pb-2"><input type="checkbox" checked={form.general} onChange={(event) => setForm({ ...form, general: event.target.checked })} />General</label>
          <label className="text-xs text-slate-600 flex items-center gap-2 pb-2"><input type="checkbox" checked={form.approvalRequired} onChange={(event) => setForm({ ...form, approvalRequired: event.target.checked })} />Requiere aprobación</label>
          <button type="button" onClick={submitNew} disabled={!form.code.trim() || !form.name.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Crear especialidad</button>
        </div>
        {loading && <p role="status" className="text-sm text-slate-600">Cargando especialidades…</p>}
        <div className="space-y-2">
          {specialties.map((specialty) => (
            <div key={specialty.id} className="rounded-xl border border-slate-100 p-3">
              {editingId === specialty.id ? (
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-xs text-slate-600">Código<input value={editForm.code} onChange={(event) => setEditForm({ ...editForm, code: event.target.value })} maxLength={50} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <label className="text-xs text-slate-600">Nombre<input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} maxLength={150} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <label className="text-xs text-slate-600">Duración
                    <select value={editForm.durationMinutes} onChange={(event) => setEditForm({ ...editForm, durationMinutes: Number(event.target.value) as 30 | 60 })} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
                      <option value={30}>30 minutos</option>
                      <option value={60}>60 minutos</option>
                    </select>
                  </label>
                  <label className="text-xs text-slate-600 flex items-center gap-2 pb-2"><input type="checkbox" checked={editForm.general} onChange={(event) => setEditForm({ ...editForm, general: event.target.checked })} />General</label>
                  <label className="text-xs text-slate-600 flex items-center gap-2 pb-2"><input type="checkbox" checked={editForm.approvalRequired} onChange={(event) => setEditForm({ ...editForm, approvalRequired: event.target.checked })} />Requiere aprobación</label>
                  <button type="button" onClick={() => saveEdit(specialty.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Guardar</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500">Cancelar</button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">{specialty.name}</span> <span className="text-xs text-slate-400">({specialty.code}) · {specialty.durationMinutes} min{specialty.general ? ' · General' : ''}{specialty.approvalRequired ? ' · Requiere aprobación' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${specialty.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{specialty.active ? 'Activa' : 'Inactiva'}</span>
                    <button type="button" onClick={() => startEdit(specialty)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Pencil className="w-3.5 h-3.5" />Editar</button>
                    <button type="button" onClick={() => toggleActive(specialty)} className={`text-xs font-semibold flex items-center gap-1 ${specialty.active ? 'text-red-600 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'}`}>
                      {specialty.active ? <><XCircle className="w-3.5 h-3.5" />Desactivar</> : <><CheckCircle2 className="w-3.5 h-3.5" />Activar</>}
                    </button>
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
