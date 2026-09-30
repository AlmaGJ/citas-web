import React, { useState } from 'react';
import { AdminInboxScreen } from './AdminInboxScreen';
import { EpsPlansManager } from './EpsPlansManager';
import { SpecialtiesManager } from './SpecialtiesManager';
import { ProfessionalsManager } from './ProfessionalsManager';

type AdminTab = 'inbox' | 'eps' | 'specialties' | 'professionals';

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'inbox', label: 'Bandeja' },
  { id: 'eps', label: 'EPS y planes' },
  { id: 'specialties', label: 'Especialidades' },
  { id: 'professionals', label: 'Profesionales' },
];

export const AdminScreen: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('inbox');

  return (
    <div className="w-full space-y-4" id="admin-screen">
      <nav className="w-full max-w-6xl mx-auto flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-sm border border-slate-100" id="admin-tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {tab === 'inbox' && <AdminInboxScreen />}
      {tab === 'eps' && <EpsPlansManager />}
      {tab === 'specialties' && <SpecialtiesManager />}
      {tab === 'professionals' && <ProfessionalsManager />}
    </div>
  );
};
