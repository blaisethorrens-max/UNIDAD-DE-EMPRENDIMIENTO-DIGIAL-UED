import React from 'react';
import { useLanguage, SupportedLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'button' | 'dropdown' | 'minimal' | 'header';
  className?: string;
  showLabels?: boolean;
}

export default function LanguageSwitcher({
  variant = 'pill',
  className = '',
  showLabels = true,
}: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={`px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border border-emerald-600/80 cursor-pointer ${className}`}
        title={t('nav.langToggleTitle', 'Cambiar idioma entre Español e Inglés')}
        aria-label={t('nav.langToggleTitle', 'Cambiar idioma entre Español e Inglés')}
      >
        <span className="text-base" role="img" aria-hidden="true">
          {language === 'es' ? '🇨🇴' : '🇺🇸'}
        </span>
        <span className="font-mono tracking-wider">
          {language.toUpperCase()}
        </span>
        {showLabels && (
          <span className="text-[11px] text-emerald-200 font-medium hidden sm:inline">
            ({language === 'es' ? 'ES' : 'EN'})
          </span>
        )}
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className={`p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-all border border-emerald-700/60 cursor-pointer ${className}`}
        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        aria-label="Toggle language"
      >
        <span className="text-sm">🌐</span>
        <span className="font-mono font-bold text-[11px]">
          {language.toUpperCase()}
        </span>
      </button>
    );
  }

  // Default 'pill' segmented switch: [ 🇨🇴 ES | 🇺🇸 EN ]
  const languages: { code: SupportedLanguage; label: string; flag: string; short: string }[] = [
    { code: 'es', label: 'Español', flag: '🇨🇴', short: 'ES' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  ];

  return (
    <div
      role="group"
      aria-label={t('common.language', 'Idioma')}
      className={`inline-flex items-center p-1 rounded-xl bg-emerald-950/70 border border-emerald-700/60 shadow-inner backdrop-blur-sm ${className}`}
    >
      {languages.map(lang => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            aria-pressed={isActive}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              isActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md scale-[1.02]'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60 opacity-80 hover:opacity-100'
            }`}
            title={lang.code === 'es' ? 'Cambiar interfaz a Español' : 'Switch interface to English'}
          >
            <span className="text-xs" role="img" aria-hidden="true">
              {lang.flag}
            </span>
            <span className="font-mono tracking-tight text-[11px]">
              {lang.short}
            </span>
            {showLabels && (
              <span className={`text-[10px] hidden md:inline font-sans ${isActive ? 'text-white' : 'text-emerald-300'}`}>
                {lang.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
