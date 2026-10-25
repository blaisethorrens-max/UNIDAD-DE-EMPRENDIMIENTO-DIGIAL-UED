import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { googleSignIn } from '../auth';
import {
  verifyAdvisorKey,
  validateKeyRules,
  getAdvisorSecretKey,
} from '../services/securityService';
import SecurityKeyModal from './SecurityKeyModal';

export default function Login() {
  const { login } = useAuth();
  const { addLearner } = useData();
  const [role, setRole] = useState<'learner' | 'instructor'>('learner');
  const [formData, setFormData] = useState({
    name: '',
    email: 'aprendiz.sena@gmail.com',
    ficha: '2845612',
    program: 'Tecnología en Análisis y Desarrollo de Software',
    center: 'Centro de Servicios y Gestión Empresarial',
    whatsapp: '573147873570',
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConfigKeyModalOpen, setIsConfigKeyModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const keyRules = validateKeyRules(password);

  // Sign In with Google Workspace (OAuth Drive & Sheets)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const { user } = await googleSignIn();
      if (role === 'learner') {
        const learnerName = user.displayName || formData.name || 'Aprendiz SENA';
        const learnerEmail = user.email || formData.email || 'aprendiz.sena@gmail.com';
        addLearner({
          id: user.uid,
          name: learnerName,
          email: learnerEmail,
          ficha: formData.ficha || '2845612',
          program: formData.program || 'Emprendimiento Digital',
          center: formData.center || 'SENA',
          whatsapp: formData.whatsapp || '573147873570',
        });
        login({ id: user.uid, name: learnerName, email: learnerEmail, role: 'learner' });
      } else {
        if (verifyAdvisorKey(password)) {
          login({ id: user.uid, name: user.displayName || 'Asesor SENA', role: 'instructor' });
        } else {
          setLoginError('Clave de Asesor incorrecta. Ingresa la clave secreta de 9 caracteres (letras, símbolos y números).');
        }
      }
    } catch (error: any) {
      console.warn('Google Sign-In popup interrupted or blocked:', error);
      // Fallback: Continue with local session to allow smooth prototyping in sandbox
      const fallbackId = `user-${Date.now()}`;
      if (role === 'learner') {
        const name = formData.name || 'Aprendiz Emprendedor';
        const email = formData.email || 'aprendiz.sena@gmail.com';
        addLearner({
          id: fallbackId,
          name,
          email,
          ficha: formData.ficha || '2845612',
          program: formData.program || 'Emprendimiento Digital',
          center: formData.center || 'SENA',
          whatsapp: formData.whatsapp || '573147873570',
        });
        login({ id: fallbackId, name, email, role: 'learner' });
      } else {
        if (verifyAdvisorKey(password)) {
          login({ id: fallbackId, name: 'Asesor SENA UED', role: 'instructor' });
        } else {
          setLoginError('Clave de Asesor incorrecta. Ingresa la clave secreta de 9 caracteres (letras, símbolos y números).');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Standard Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (role === 'learner') {
      const learnerId = `learner-${Date.now()}`;
      const email = formData.email || 'aprendiz.sena@gmail.com';
      addLearner({
        id: learnerId,
        name: formData.name || 'Aprendiz UED',
        email,
        ficha: formData.ficha || '2845612',
        program: formData.program || 'Emprendimiento Digital',
        center: formData.center || 'SENA',
        whatsapp: formData.whatsapp || '573147873570',
      });
      login({ id: learnerId, name: formData.name || 'Aprendiz UED', email, role: 'learner' });
    } else {
      if (verifyAdvisorKey(password)) {
        login({ id: 'advisor-admin', name: 'Asesor SENA UED', role: 'instructor' });
      } else {
        setLoginError(
          'Clave de Asesor incorrecta. Debe ser la clave secreta de 9 caracteres entre letras, símbolos y números que conoces o configuraste.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-orange-50 p-4">
      <div className="bg-white dark:bg-emerald-950 p-8 rounded-3xl shadow-xl border border-emerald-200 dark:border-emerald-800 w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-600 text-white text-2xl shadow-md mb-2">
            🚀
          </div>
          <h1 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100">
            Unidad de Emprendimiento Digital
          </h1>
          <p className="text-xs text-slate-500 dark:text-emerald-300">
            Plataforma con IA Gemini 3.8 Flash y Google Workspace
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setRole('learner');
              setLoginError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'learner'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-900 dark:text-emerald-300 hover:text-emerald-950'
            }`}
          >
            👨‍🎓 Aprendiz
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('instructor');
              setLoginError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'instructor'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-emerald-900 dark:text-emerald-300 hover:text-emerald-950'
            }`}
          >
            🧑‍🏫 Asesor / Instructor 🔐
          </button>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 text-xs font-semibold border border-red-300 dark:border-red-800 flex items-start gap-2">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="space-y-1">
              <span>{loginError}</span>
              <button
                type="button"
                onClick={() => setIsConfigKeyModalOpen(true)}
                className="block text-orange-600 dark:text-orange-400 underline font-bold text-[11px]"
              >
                ¿Deseas colocar o actualizar tu clave secreta de 9 caracteres?
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {role === 'learner' ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Eduardo Morales"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                  Correo Gmail del Aprendiz * (Para alertas y culminación)
                </label>
                <input
                  type="email"
                  placeholder="Ej: tu.nombre@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-emerald-400 mt-0.5">
                  Aquí te llegarán las alertas de módulos culminados y revisiones del asesor.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                    Número de Ficha *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2845612"
                    value={formData.ficha}
                    onChange={e => setFormData({ ...formData, ficha: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                    WhatsApp (con código) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 573147873570"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                  Programa de Formación *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Análisis y Desarrollo de Software"
                  value={formData.program}
                  onChange={e => setFormData({ ...formData, program: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                  Centro de Formación *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Centro de Servicios y Gestión Empresarial"
                  value={formData.center}
                  onChange={e => setFormData({ ...formData, center: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-[11px] text-orange-900 dark:text-orange-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <span>🔐 Control de Acceso del Asesor / Administrador</span>
                </div>
                <p className="leading-relaxed">
                  Por seguridad y privacidad de la app publicada, ingresa la clave secreta de <strong>9 caracteres</strong> (con letras, símbolos y números).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-emerald-900 dark:text-emerald-200">
                    Clave Secreta de Asesor (9 Caracteres) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={9}
                    placeholder="Ej: Sena*2026"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full p-3 pr-14 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <span className={`absolute right-3 top-3 font-mono text-xs font-bold ${
                    keyRules.lengthValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}>
                    {keyRules.charCount}/9
                  </span>
                </div>
              </div>

              {/* Real-time Checklist Chips */}
              <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 text-[10px]">
                <span className={`flex items-center gap-1 ${keyRules.lengthValid ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {keyRules.lengthValid ? '✓' : '○'} 9 Caracteres
                </span>
                <span className={`flex items-center gap-1 ${keyRules.hasLetters ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {keyRules.hasLetters ? '✓' : '○'} Letras
                </span>
                <span className={`flex items-center gap-1 ${keyRules.hasNumbers ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {keyRules.hasNumbers ? '✓' : '○'} Números
                </span>
                <span className={`flex items-center gap-1 ${keyRules.hasSymbols ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {keyRules.hasSymbols ? '✓' : '○'} Símbolos (*, #, $, @)
                </span>
              </div>

              {/* Button to place / configure custom secret key */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsConfigKeyModalOpen(true)}
                  className="text-[11px] text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold underline flex items-center gap-1"
                >
                  <span>⚙️ Colocar / Cambiar mi Clave Secreta</span>
                </button>

                <span className="text-[10px] text-slate-400 dark:text-emerald-400 font-mono">
                  Inicial: Sena*2026
                </span>
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{role === 'instructor' ? 'Validar Clave e Ingresar' : 'Ingresar a la Plataforma'}</span>
            <span>➔</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-emerald-200 dark:border-emerald-800" />
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 dark:text-emerald-400 uppercase tracking-wider font-semibold">
            O conecta con Workspace
          </span>
          <div className="flex-grow border-t border-emerald-200 dark:border-emerald-800" />
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white dark:bg-emerald-900 border border-slate-300 dark:border-emerald-700 hover:bg-slate-50 dark:hover:bg-emerald-800/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-emerald-100 shadow-xs flex items-center justify-center gap-3 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{loading ? 'Conectando con Google...' : 'Continuar con Google Drive & Sheets'}</span>
        </button>
      </div>

      {/* Modal to configure / place custom 9-character secret key */}
      <SecurityKeyModal
        isOpen={isConfigKeyModalOpen}
        onClose={() => setIsConfigKeyModalOpen(false)}
        onKeyUpdated={(newKey) => {
          setPassword(newKey);
          setLoginError(null);
        }}
      />
    </div>
  );
}
