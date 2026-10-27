import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Login from './components/Login';
import LearnerView from './components/LearnerView';
import InstructorView from './components/InstructorView';
import GlobalPrivacyShield from './components/GlobalPrivacyShield';
import SecurityKeyModal from './components/SecurityKeyModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import UEDLogo from './components/UEDLogo';
import { isGlobalPrivacyLocked, isSessionUnlocked } from './services/securityService';

export default function App() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
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
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-800 text-white shadow-sm flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <UEDLogo size="sm" variant="badge" />
          <div className="hidden lg:block border-l border-emerald-700 pl-3">
            <p className="text-[10px] text-emerald-200 font-medium">
              {t('nav.brandSubtitle', 'Ecosistema SENA · Formulación de Planes de Negocios')}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-100">{user.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white">
              {user.role === 'instructor' ? t('common.advisor', 'Asesor') : t('common.learner', 'Aprendiz')}
            </span>
          </div>

          {/* Language Switcher Component */}
          <LanguageSwitcher variant="pill" showLabels={true} />

          {/* Quick Security Access for Instructor */}
          {user.role === 'instructor' && (
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-600 cursor-pointer"
              title={t('nav.secretKeyTitle', 'Configurar clave secreta de 9 caracteres y privacidad del prototipo')}
            >
              <span>🔐</span>
              <span className="hidden md:inline">{t('common.secretKey', 'Clave Secreta')}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title={t('nav.themeToggleTitle', 'Cambiar tema claro/oscuro')}
          >
            {theme === 'light' ? t('common.darkMode', '🌙 Modo Oscuro') : t('common.lightMode', '☀️ Modo Claro')}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-red-700 text-emerald-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('common.logout', 'Cerrar Sesión')}
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
