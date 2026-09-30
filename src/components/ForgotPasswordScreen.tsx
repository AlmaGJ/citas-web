import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { requestPasswordRecovery, apiErrorMessage } from '../api/lifecycleApi';

interface ForgotPasswordScreenProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await requestPasswordRecovery(email.trim());
      setSent(true);
    } catch (error) {
      setErrorMessage(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 p-8 sm:p-10 my-auto" id="forgot-password-main">
      <div className="flex items-center gap-3 mb-8" id="forgot-password-brand">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">Portal de Citas</span>
          <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Recuperar acceso</span>
        </div>
      </div>

      {sent ? (
        <div className="space-y-5" id="forgot-password-sent">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">Revisa tu correo</h2>
          <p role="status" className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña en breve.
          </p>
          <button type="button" onClick={onNavigateLogin} className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm">
            Volver a iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">¿Olvidaste tu contraseña?</h2>
          <p className="text-slate-500 text-sm mb-6">Ingresa tu correo y, si existe una cuenta asociada, te enviaremos instrucciones para restablecerla.</p>
          <form className="space-y-5" id="forgot-password-form" onSubmit={handleSubmit}>
            {errorMessage && (
              <div id="forgot-password-error-alert" role="alert" className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {errorMessage}
              </div>
            )}
            <label className="block" htmlFor="forgot-password-email">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Correo electrónico</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <input
                  id="forgot-password-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="input-transition block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </label>
            <button
              type="submit"
              id="submit-forgot-password-button"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md shadow-blue-500/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando…</span>
                </>
              ) : (
                <span>Enviar instrucciones</span>
              )}
            </button>
          </form>
          <button type="button" onClick={onNavigateLogin} id="forgot-password-back-link" className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesión
          </button>
        </>
      )}

      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-8">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-slate-400" />
        <span className="text-[11px] leading-tight text-slate-400">Tus datos médicos y personales están protegidos con cifrado de extremo a extremo.</span>
      </div>
    </main>
  );
};
