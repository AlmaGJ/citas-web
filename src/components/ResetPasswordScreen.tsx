import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { resetPassword, apiErrorMessage } from '../api/lifecycleApi';

interface ResetPasswordScreenProps {
  token: string;
  onNavigateLogin: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ token, onNavigateLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    if (password !== confirmation) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, password, confirmation);
      setDone(true);
    } catch (error) {
      setErrorMessage(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 p-8 sm:p-10 my-auto" id="reset-password-main">
      <div className="flex items-center gap-3 mb-8" id="reset-password-brand">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">Portal de Citas</span>
          <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Restablecer contraseña</span>
        </div>
      </div>

      {done ? (
        <div className="space-y-5" id="reset-password-done">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">Contraseña actualizada</h2>
          <p role="status" className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <button type="button" onClick={onNavigateLogin} className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm">
            Ir a iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">Nueva contraseña</h2>
          <p className="text-slate-500 text-sm mb-6">Define una nueva contraseña para tu cuenta.</p>
          <form className="space-y-5" id="reset-password-form" onSubmit={handleSubmit}>
            {errorMessage && (
              <div id="reset-password-error-alert" role="alert" className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {errorMessage}
              </div>
            )}
            <label className="block" htmlFor="reset-password-new">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Nueva contraseña</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <input
                  id="reset-password-new"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-transition block w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  aria-label="Alternar visibilidad de contraseña"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
                </button>
              </div>
            </label>
            <label className="block" htmlFor="reset-password-confirm">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Confirmar contraseña</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <input
                  id="reset-password-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="input-transition block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </label>
            <button
              type="submit"
              id="submit-reset-password-button"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md shadow-blue-500/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : (
                <span>Restablecer contraseña</span>
              )}
            </button>
          </form>
        </>
      )}

      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-8">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-slate-400" />
        <span className="text-[11px] leading-tight text-slate-400">Tus datos médicos y personales están protegidos con cifrado de extremo a extremo.</span>
      </div>
    </main>
  );
};
