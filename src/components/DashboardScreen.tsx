import React from 'react';
import { Calendar, ClipboardList, LogOut, Plus, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import type { Role, User } from '../types';

interface DashboardScreenProps {
  user: User;
  onOpenBooking: () => void;
  onLogout: () => void;
}

const roleCopy: Record<Role, { title: string; description: string; icon: typeof UserRound }> = {
  USER: { title: 'Agenda de paciente', description: 'Busca disponibilidad y solicita una cita. Las citas no se guardan en este navegador.', icon: UserRound },
  PROFESSIONAL: { title: 'Agenda profesional', description: 'La gestión de bloques y la agenda propia se habilitan con los contratos de operación profesional.', icon: Stethoscope },
  ADMIN: { title: 'Administración', description: 'La gestión de catálogos, profesionales y decisiones se habilita según los permisos del servidor.', icon: ClipboardList },
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onOpenBooking, onLogout }) => {
  const activeRole = (user.roles.find((role): role is Role => role in roleCopy) ?? 'USER');
  const content = roleCopy[activeRole];
  const Icon = content.icon;
  return <div className="w-full max-w-6xl mx-auto space-y-6 pb-12" id="portal-dashboard">
    <header className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white"><Calendar className="w-5 h-5" /></div><div><span className="text-base font-bold tracking-tight text-slate-900 block">Portal de Citas</span><span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Acceso seguro</span></div></div>
      <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><span className="text-sm font-semibold text-slate-900 block">{user.name}</span><span className="text-xs text-slate-400">{activeRole}</span></div><button type="button" onClick={onLogout} title="Cerrar sesión" className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /></button></div>
    </header>
    <section className="relative bg-gradient-to-r from-[#07152B] via-[#0A1F3E] to-[#0E2952] rounded-3xl p-7 sm:p-10 text-white border border-slate-800/60 shadow-xl overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" /><div className="relative flex flex-col gap-5"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-xs text-blue-100 w-fit"><ShieldCheck className="w-3.5 h-3.5" />Sesión autenticada</div><div><p className="text-blue-200 text-sm">{content.title}</p><h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">Hola, {user.name}</h1><p className="text-slate-300 text-sm mt-3 max-w-2xl">{content.description}</p></div>{activeRole === 'USER' && <button type="button" id="book-new-appointment-btn" onClick={onOpenBooking} className="w-fit px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-md flex items-center gap-2"><Plus className="w-4 h-4" />Agendar cita</button>}</div>
    </section>
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 text-center space-y-3"><div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto"><Icon className="w-6 h-6" /></div><h2 className="text-lg font-bold text-slate-900">{activeRole === 'USER' ? 'Tus próximas citas aparecerán aquí' : content.title}</h2><p className="text-sm text-slate-500 max-w-xl mx-auto">El portal no muestra registros locales simulados. Toda información se consultará al API autorizado.</p></section>
  </div>;
};
