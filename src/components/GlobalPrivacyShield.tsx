import { useState } from 'react';
import {
  verifyAdvisorKey,
  validateKeyRules,
  setSessionUnlocked,
} from '../services/securityService';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface GlobalPrivacyShieldProps {
  onUnlock: () => void;
}

export default function GlobalPrivacyShield({ onUnlock }: GlobalPrivacyShieldProps) {
  const { t, language } = useLanguage();
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rules = validateKeyRules(inputKey);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verifyAdvisorKey(inputKey)) {
      setSessionUnlocked(true);
      onUnlock();
    } else {
      setError(t('invalidKeyError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 p-4 text-white relative">
      {/* Floating Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="header" />
      </div>

      <div className="bg-emerald-900/40 backdrop-blur-md p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/30 shadow-2xl max-w-md w-full space-y-6 text-center">
        {/* UED Logo & Shield Icon */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-2xl shadow-lg border border-orange-400/40">
            🔒
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold px-2.5 py-0.5 rounded-full bg-orange-950/60 border border-orange-700/60">
            {t('privacyBadge')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t('privacyTitle')}
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-sm mx-auto leading-relaxed">
            {t('privacyDesc')}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-emerald-200">
                {t('enterSecretKey')}
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
              >
                {showKey ? (language === 'en' ? 'Hide' : 'Ocultar') : (language === 'en' ? 'Show' : 'Mostrar')}
              </button>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                maxLength={9}
                required
                autoFocus
                placeholder={language === 'en' ? 'Enter 9 characters' : 'Ingresa los 9 caracteres'}
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                className="w-full p-3 pr-12 rounded-xl bg-slate-900/90 border border-emerald-600/50 text-white font-mono text-center tracking-widest text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <span className={`absolute right-3 top-3 font-mono text-xs font-bold ${
                rules.lengthValid ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {rules.charCount}/9
              </span>
            </div>
          </div>

          {/* Real-time Validation Pills */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] p-2 rounded-xl bg-slate-900/60 border border-emerald-800/40">
            <span className={`flex items-center gap-1 ${rules.lengthValid ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.lengthValid ? '✓' : '○'} {language === 'en' ? '9 characters' : '9 caracteres'}
            </span>
            <span className={`flex items-center gap-1 ${rules.hasLetters ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.hasLetters ? '✓' : '○'} {language === 'en' ? 'Letters' : 'Letras'}
            </span>
            <span className={`flex items-center gap-1 ${rules.hasNumbers ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.hasNumbers ? '✓' : '○'} {language === 'en' ? 'Numbers' : 'Números'}
            </span>
            <span className={`flex items-center gap-1 ${rules.hasSymbols ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.hasSymbols ? '✓' : '○'} {language === 'en' ? 'Symbols' : 'Símbolos'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔓 {t('unlockButton')}</span>
          </button>
        </form>

        <div className="text-[11px] text-emerald-300/60 pt-1">
          Unidad de Emprendimiento Digital (UED) · SENA
        </div>
      </div>
    </div>
  );
}

