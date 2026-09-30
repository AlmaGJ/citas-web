import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Pencil, Plus, XCircle } from 'lucide-react';
import {
  apiErrorMessage,
  createEps,
  createPlan,
  getAllEps,
  getPlans,
  getRegimes,
  setEpsActive,
  setPlanActive,
  updateEps,
  type EpsRecord,
  type PlanRecord,
  type RegimeRecord,
} from '../api/adminCatalogApi';

export const EpsPlansManager: React.FC = () => {
  const [epsList, setEpsList] = useState<EpsRecord[]>([]);
  const [regimes, setRegimes] = useState<RegimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newEpsCode, setNewEpsCode] = useState('');
  const [newEpsName, setNewEpsName] = useState('');
  const [editingEpsId, setEditingEpsId] = useState<number | null>(null);
  const [editEpsCode, setEditEpsCode] = useState('');
  const [editEpsName, setEditEpsName] = useState('');

  const [selectedEpsId, setSelectedEpsId] = useState<number | null>(null);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [newPlanCode, setNewPlanCode] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanRegimeId, setNewPlanRegimeId] = useState<number>();

  const loadEps = () => {
    setLoading(true);
    setError('');
    getAllEps().then(setEpsList).catch((cause) => setError(apiErrorMessage(cause))).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEps();
    getRegimes().then(setRegimes).catch(() => undefined);
  }, []);

  const loadPlans = (epsId: number) => {
    setLoadingPlans(true);
    getPlans(epsId).then(setPlans).catch((cause) => setError(apiErrorMessage(cause))).finally(() => setLoadingPlans(false));
  };

  const openEps = (epsId: number) => {
    setSelectedEpsId(epsId);
    loadPlans(epsId);
  };

  const submitNewEps = async () => {
    if (!newEpsCode.trim() || !newEpsName.trim()) return;
    try {
      await createEps(newEpsCode.trim(), newEpsName.trim());
      setNewEpsCode('');
      setNewEpsName('');
      loadEps();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const startEditEps = (eps: EpsRecord) => {
    setEditingEpsId(eps.id);
    setEditEpsCode(eps.code);
    setEditEpsName(eps.name);
  };

  const saveEditEps = async (id: number) => {
    try {
      await updateEps(id, editEpsCode.trim(), editEpsName.trim());
      setEditingEpsId(null);
      loadEps();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const toggleEpsActive = async (eps: EpsRecord) => {
    try {
      await setEpsActive(eps.id, !eps.active);
      loadEps();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const submitNewPlan = async () => {
    if (!selectedEpsId || !newPlanRegimeId || !newPlanCode.trim() || !newPlanName.trim()) return;
    try {
      await createPlan(selectedEpsId, newPlanRegimeId, newPlanCode.trim(), newPlanName.trim());
      setNewPlanCode('');
      setNewPlanName('');
      loadPlans(selectedEpsId);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const togglePlanActive = async (plan: PlanRecord) => {
    if (!selectedEpsId) return;
    try {
      await setPlanActive(selectedEpsId, plan.id, !plan.active);
      loadPlans(selectedEpsId);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" id="eps-plans-manager">
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" />EPS</h2>
        {error && <p role="alert" className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">{error}</p>}
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" id="create-eps-form">
          <label className="text-xs text-slate-600">Código<input value={newEpsCode} onChange={(event) => setNewEpsCode(event.target.value)} maxLength={30} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <label className="text-xs text-slate-600">Nombre<input value={newEpsName} onChange={(event) => setNewEpsName(event.target.value)} maxLength={150} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
          <button type="button" onClick={submitNewEps} disabled={!newEpsCode.trim() || !newEpsName.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Crear EPS</button>
        </div>
        {loading && <p role="status" className="text-sm text-slate-600">Cargando EPS…</p>}
        <div className="space-y-2">
          {epsList.map((eps) => (
            <div key={eps.id} className="rounded-xl border border-slate-100 p-3">
              {editingEpsId === eps.id ? (
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-xs text-slate-600">Código<input value={editEpsCode} onChange={(event) => setEditEpsCode(event.target.value)} maxLength={30} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <label className="text-xs text-slate-600">Nombre<input value={editEpsName} onChange={(event) => setEditEpsName(event.target.value)} maxLength={150} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
                  <button type="button" onClick={() => saveEditEps(eps.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Guardar</button>
                  <button type="button" onClick={() => setEditingEpsId(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500">Cancelar</button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <button type="button" onClick={() => openEps(eps.id)} className={`text-left ${selectedEpsId === eps.id ? 'text-blue-700' : 'text-slate-800'}`}>
                    <span className="font-semibold">{eps.name}</span> <span className="text-xs text-slate-400">({eps.code})</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${eps.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{eps.active ? 'Activa' : 'Inactiva'}</span>
                    <button type="button" onClick={() => startEditEps(eps)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Pencil className="w-3.5 h-3.5" />Editar</button>
                    <button type="button" onClick={() => toggleEpsActive(eps)} className={`text-xs font-semibold flex items-center gap-1 ${eps.active ? 'text-red-600 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'}`}>
                      {eps.active ? <><XCircle className="w-3.5 h-3.5" />Desactivar</> : <><CheckCircle2 className="w-3.5 h-3.5" />Activar</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedEpsId && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4" id="plans-panel">
          <h2 className="text-lg font-bold text-slate-900">Planes de {epsList.find((e) => e.id === selectedEpsId)?.name}</h2>
          <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" id="create-plan-form">
            <label className="text-xs text-slate-600">Régimen
              <select value={newPlanRegimeId ?? ''} onChange={(event) => setNewPlanRegimeId(Number(event.target.value) || undefined)} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm">
                <option value="">Selecciona</option>
                {regimes.map((regime) => <option key={regime.id} value={regime.id}>{regime.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-slate-600">Código<input value={newPlanCode} onChange={(event) => setNewPlanCode(event.target.value)} maxLength={50} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <label className="text-xs text-slate-600">Nombre<input value={newPlanName} onChange={(event) => setNewPlanName(event.target.value)} maxLength={150} className="block mt-1 rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <button type="button" onClick={submitNewPlan} disabled={!newPlanRegimeId || !newPlanCode.trim() || !newPlanName.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Crear plan</button>
          </div>
          {loadingPlans && <p role="status" className="text-sm text-slate-600">Cargando planes…</p>}
          {!loadingPlans && plans.length === 0 && <p className="text-sm text-slate-500 py-3 text-center">Esta EPS no tiene planes.</p>}
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-slate-100 p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-slate-700"><span className="font-semibold">{plan.name}</span> <span className="text-xs text-slate-400">({plan.code})</span></div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{plan.active ? 'Activo' : 'Inactivo'}</span>
                  <button type="button" onClick={() => togglePlanActive(plan)} className={`text-xs font-semibold flex items-center gap-1 ${plan.active ? 'text-red-600 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'}`}>
                    {plan.active ? <><XCircle className="w-3.5 h-3.5" />Desactivar</> : <><CheckCircle2 className="w-3.5 h-3.5" />Activar</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
