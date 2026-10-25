import { useState } from 'react';
import {
  validateKeyRules,
  setAdvisorSecretKey,
  getAdvisorSecretKey,
  isGlobalPrivacyLocked,
  setGlobalPrivacyLocked,
} from '../services/securityService';

interface SecurityKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (newKey: string) => void;
}

export default function SecurityKeyModal({ isOpen, onClose, onKeyUpdated }: SecurityKeyModalProps) {
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [privacyLock, setPrivacyLock] = useState<boolean>(() => isGlobalPrivacyLocked());

  if (!isOpen) return null;

  const currentConfiguredKey = getAdvisorSecretKey();
  const rules = validateKeyRules(newKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Si ya existe una clave y se está cambiando, verificar la actual si se suministró o si es admin
    if (newKey !== confirmKey) {
      setErrorMessage('La confirmación de la clave no coincide.');
      return;
    }

    if (!rules.isValid) {
      setErrorMessage('La clave debe tener exactamente 9 caracteres y combinar letras, números y símbolos.');
      return;
    }

    const res = setAdvisorSecretKey(newKey);
    if (!res.success) {
      setErrorMessage(res.message);
      return;
    }

    // Actualizar estado del candado de privacidad global
    setGlobalPrivacyLocked(privacyLock);

    setSuccessMessage('¡Clave secreta de 9 caracteres guardada y actualizada exitosamente!');
    if (onKeyUpdated) {
      onKeyUpdated(newKey);
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-emerald-950 p-6 sm:p-7 rounded-3xl max-w-md w-full border-2 border-emerald-300 dark:border-emerald-700 shadow-2xl space-y-5 my-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xl shadow-md">
              🔐
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                Clave Secreta de Asesor & Administrador
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400">
                Seguridad y privacidad para la app publicada UED
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-emerald-900 text-slate-500 dark:text-emerald-300 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Informative Security Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-emerald-200 space-y-1">
          <div className="font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
            <span>🛡️ Regla de Seguridad Obligatoria:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Como asesor y administrador, coloca una clave secreta que conozcas bien de <strong>exactamente 9 caracteres</strong> combinando <strong>letras, símbolos y números</strong>.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 text-xs font-semibold border border-red-200 dark:border-red-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* New Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-emerald-200">
                Coloca tu Clave Secreta (9 Caracteres) *
              </label>
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline font-semibold"
              >
                {showKeys ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showKeys ? 'text' : 'password'}
                maxLength={9}
                required
                placeholder="Ej: Sena*2026"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="w-full p-2.5 pr-12 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className={`absolute right-3 top-2.5 font-mono text-xs font-bold ${
                rules.lengthValid ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {rules.charCount}/9
              </span>
            </div>
          </div>

          {/* Validation Checklist Badges */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-[11px]">
            <div className={`flex items-center gap-1.5 font-medium ${
              rules.lengthValid ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-emerald-400/60'
            }`}>
              <span>{rules.lengthValid ? '✓' : '○'}</span>
              <span>Exactamente 9 caracteres</span>
            </div>

            <div className={`flex items-center gap-1.5 font-medium ${
              rules.hasLetters ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-emerald-400/60'
            }`}>
              <span>{rules.hasLetters ? '✓' : '○'}</span>
              <span>Letras (A-Z, a-z)</span>
            </div>

            <div className={`flex items-center gap-1.5 font-medium ${
              rules.hasNumbers ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-emerald-400/60'
            }`}>
              <span>{rules.hasNumbers ? '✓' : '○'}</span>
              <span>Números (0-9)</span>
            </div>

            <div className={`flex items-center gap-1.5 font-medium ${
              rules.hasSymbols ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-emerald-400/60'
            }`}>
              <span>{rules.hasSymbols ? '✓' : '○'}</span>
              <span>Símbolos (*, #, $, @, !, etc.)</span>
            </div>
          </div>

          {/* Confirm Key */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 dark:text-emerald-200">
              Confirmar Clave Secreta *
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              maxLength={9}
              required
              placeholder="Vuelve a escribir la misma clave"
              value={confirmKey}
              onChange={e => setConfirmKey(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Global Privacy Lock Option */}
          <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyLock}
                onChange={e => setPrivacyLock(e.target.checked)}
                className="mt-0.5 rounded border-orange-400 text-orange-600 focus:ring-orange-500"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Activar Candado de Privacidad Global del Prototipo
                </span>
                <span className="text-[10px] text-slate-600 dark:text-orange-200 block leading-tight">
                  Exige ingresar esta clave secreta antes de visualizar el prototipo en la URL pública publicada.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900 text-slate-700 dark:text-emerald-200 font-semibold hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!rules.isValid || newKey !== confirmKey}
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${
                rules.isValid && newKey === confirmKey
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 cursor-pointer'
                  : 'bg-slate-300 dark:bg-emerald-900/50 cursor-not-allowed opacity-60'
              }`}
            >
              <span>💾 Colocar y Guardar Clave</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
