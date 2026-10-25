import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import LearnerView from './components/LearnerView';
import InstructorView from './components/InstructorView';
import GlobalPrivacyShield from './components/GlobalPrivacyShield';
import SecurityKeyModal from './components/SecurityKeyModal';
import { isGlobalPrivacyLocked, isSessionUnlocked } from './services/securityService';

export default function App() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [isPrivacyUnlocked, setIsPrivacyUnlocked] = useState<boolean>(() => {
    // Si no está bloqueado globalmente, o ya se desbloqueó en esta sesión:
    return !isGlobalPrivacyLocked() || isSessionUnlocked();
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Si el candado de privacidad global está activo y la sesión no se ha desbloqueado
  if (!isPrivacyUnlocked) {
    return <GlobalPrivacyShield onUnlock={() => setIsPrivacyUnlocked(true)} />;
  }

  if (!user) return <Login />;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' ? 'bg-emerald-950 text-emerald-100' : 'bg-emerald-50 text-emerald-950'
    }`}>
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-800 text-white shadow-sm flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow">
            UED
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-tight">
              Unidad de Emprendimiento Digital
            </h1>
            <p className="text-[11px] text-emerald-200 flex items-center gap-1.5">
              <span>SENA</span>
              <span>·</span>
              <span className="text-orange-300 font-medium">Gemini 3.8 Flash & Google Workspace</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-100">{user.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white">
              {user.role === 'instructor' ? 'Asesor' : 'Aprendiz'}
            </span>
          </div>

          {/* Quick Security Access for Instructor */}
          {user.role === 'instructor' && (
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-600"
              title="Configurar clave secreta de 9 caracteres y privacidad del prototipo"
            >
              <span>🔐</span>
              <span className="hidden md:inline">Clave Secreta</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 hover:text-white text-xs font-medium transition-colors"
            title="Cambiar tema claro/oscuro"
          >
            {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-red-700 text-emerald-200 hover:text-white text-xs font-semibold transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 sm:p-6">
        {user.role === 'learner' ? <LearnerView /> : <InstructorView />}
      </main>

      {/* Security Modal for Advisor */}
      <SecurityKeyModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}
