import { useState } from 'react';
import {
  verifyAdvisorKey,
  validateKeyRules,
  setSessionUnlocked,
} from '../services/securityService';

interface GlobalPrivacyShieldProps {
  onUnlock: () => void;
}

export default function GlobalPrivacyShield({ onUnlock }: GlobalPrivacyShieldProps) {
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
      setError('Clave secreta incorrecta. Verifica los 9 caracteres (letras, números y símbolos).');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 p-4 text-white">
      <div className="bg-emerald-900/40 backdrop-blur-md p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/30 shadow-2xl max-w-md w-full space-y-6 text-center">
        {/* Shield Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-600 text-3xl shadow-lg border border-orange-400/40">
          🔒
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold px-2.5 py-0.5 rounded-full bg-orange-950/60 border border-orange-700/60">
            Control de Privacidad & Seguridad
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Prototipo UED Protegido
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-sm mx-auto leading-relaxed">
            Esta plataforma cuenta con candado de privacidad. Para ingresar, coloca la clave secreta de <strong>9 caracteres</strong> (letras, símbolos y números) suministrada por el Asesor / Administrador.
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
                Clave Secreta de Acceso (9 Caracteres)
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                maxLength={9}
                required
                autoFocus
                placeholder="Ingresa los 9 caracteres"
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
              {rules.lengthValid ? '✓' : '○'} 9 caracteres
            </span>
            <span className={`flex items-center gap-1 ${rules.hasLetters ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.hasLetters ? '✓' : '○'} Letras
            </span>
            <span className={`flex items-center gap-1 ${rules.hasNumbers ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.hasNumbers ? '✓' : '○'} Números
            </span>
            <span className={`flex items-center gap-1 ${rules.hasSymbols ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {rules.hasSymbols ? '✓' : '○'} Símbolos
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔓 Desbloquear e Ingresar</span>
          </button>
        </form>

        <div className="text-[11px] text-emerald-300/60 pt-1">
          Unidad de Emprendimiento Digital (UED) · SENA
        </div>
      </div>
    </div>
  );
}
