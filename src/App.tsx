import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AppointmentConfirmation, ScreenType, User } from './types';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { logout, restoreSession } from './auth/authApi';

const initialResetToken = () => new URLSearchParams(window.location.search).get('token') ?? '';
const initialScreen = (): ScreenType => (initialResetToken() ? 'reset-password' : 'login');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreen);
  const [resetToken] = useState<string>(initialResetToken);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);
  const [detailAppointmentId, setDetailAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    restoreSession().then((user) => {
      if (!active) return;
      if (user) { setCurrentUser(user); if (currentScreen !== 'reset-password') setCurrentScreen('dashboard'); }
      setIsRestoringSession(false);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToLogin = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setCurrentScreen('login');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4500);
  };
  const handleLoginSuccess = (user: User) => { setCurrentUser(user); setCurrentScreen('dashboard'); showToast(`Bienvenido/a, ${user.name}.`); };
  const handleRegisterSuccess = (user: User) => { setCurrentUser(user); setCurrentScreen('dashboard'); showToast('Cuenta creada correctamente.'); };
  const handleBooked = (appointment: AppointmentConfirmation) => {
    setAppointmentsRefreshKey((value) => value + 1);
    const state = appointment.status === 'APPROVED' ? 'confirmada' : 'recibida para decisión administrativa';
    showToast(`Tu cita fue ${state}.`);
  };
  const handleLogout = async () => {
    try { await logout(); setCurrentUser(null); setCurrentScreen('login'); showToast('Has cerrado sesión correctamente.'); }
    catch { showToast('No fue posible cerrar la sesión. Inténtalo nuevamente.'); }
  };

  if (isRestoringSession) return <main className="min-h-screen bg-[#F1F4F9] flex items-center justify-center" aria-live="polite"><div className="flex items-center gap-3 text-sm text-slate-600"><span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Verificando sesión segura…</div></main>;

  return <div className="min-h-screen bg-[#F1F4F9] text-slate-800 flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white" id="portal-citas-app-root">
    {toastMessage && <div id="portal-toast" role="status" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2.5 text-xs sm:text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{toastMessage}</div>}
    {currentScreen === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentScreen('register')} onNavigateForgotPassword={() => setCurrentScreen('forgot-password')} />}
    {currentScreen === 'register' && <RegisterScreen onRegisterSuccess={handleRegisterSuccess} onNavigateLogin={() => setCurrentScreen('login')} />}
    {currentScreen === 'forgot-password' && <ForgotPasswordScreen onNavigateLogin={goToLogin} />}
    {currentScreen === 'reset-password' && <ResetPasswordScreen token={resetToken} onNavigateLogin={goToLogin} />}
    {currentScreen === 'dashboard' && currentUser && <DashboardScreen user={currentUser} refreshKey={appointmentsRefreshKey} onOpenBooking={() => setIsBookingOpen(true)} onOpenAppointment={setDetailAppointmentId} onLogout={handleLogout} />}
    <BookAppointmentModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onAppointmentBooked={handleBooked} />
    <AppointmentDetailModal appointmentId={detailAppointmentId} onClose={() => setDetailAppointmentId(null)} />
  </div>;
}
