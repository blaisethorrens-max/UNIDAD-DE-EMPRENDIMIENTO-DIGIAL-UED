/**
 * Servicio de Seguridad y Clave Secreta Maestra - UED SENA
 * Reglas de seguridad:
 * - Longitud exacta: 9 caracteres
 * - Composición: Letras (mayúsculas/minúsculas), Números (0-9) y Símbolos especiales (@, #, $, *, !, etc.)
 */

const STORAGE_KEY = 'ued_advisor_secret_key';
const PRIVACY_LOCK_KEY = 'ued_global_privacy_lock';
const SESSION_UNLOCKED_KEY = 'ued_session_privacy_unlocked';

// Clave por defecto inicial que cumple exactamente los 9 caracteres con letras, símbolos y números:
// S-e-n-a (4 letras) + * (1 símbolo) + 2-0-2-6 (4 números) = 9 caracteres
export const DEFAULT_SECRET_KEY = 'Sena*2026';

export interface KeyValidationResult {
  lengthValid: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  isValid: boolean;
  charCount: number;
}

/**
 * Valida las reglas estrictas de la clave de 9 caracteres
 */
export function validateKeyRules(key: string): KeyValidationResult {
  const trimmed = key || '';
  const lengthValid = trimmed.length === 9;
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  const hasNumbers = /[0-9]/.test(trimmed);
  const hasSymbols = /[^a-zA-Z0-9\s]/.test(trimmed);
  const isValid = lengthValid && hasLetters && hasNumbers && hasSymbols;

  return {
    lengthValid,
    hasLetters,
    hasNumbers,
    hasSymbols,
    isValid,
    charCount: trimmed.length,
  };
}

/**
 * Obtiene la clave secreta maestra actual guardada por el asesor
 */
export function getAdvisorSecretKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.length === 9) {
      return saved;
    }
  } catch (e) {
    console.warn('Error reading secret key from localStorage:', e);
  }
  return DEFAULT_SECRET_KEY;
}

/**
 * Guarda una nueva clave secreta maestra colocada por el asesor
 */
export function setAdvisorSecretKey(newKey: string): { success: boolean; message: string } {
  const validation = validateKeyRules(newKey);
  if (!validation.isValid) {
    return {
      success: false,
      message: 'La clave debe tener exactamente 9 caracteres y combinar letras, números y símbolos.',
    };
  }

  try {
    localStorage.setItem(STORAGE_KEY, newKey);
    return {
      success: true,
      message: 'Clave secreta maestra actualizada exitosamente.',
    };
  } catch (e) {
    return {
      success: false,
      message: 'No se pudo guardar la clave en el almacenamiento local.',
    };
  }
}

/**
 * Verifica si la clave ingresada coincide con la clave configurada
 */
export function verifyAdvisorKey(inputKey: string): boolean {
  if (!inputKey) return false;
  const currentKey = getAdvisorSecretKey();
  return inputKey.trim() === currentKey;
}

/**
 * Estado del candado de privacidad global del prototipo
 */
export function isGlobalPrivacyLocked(): boolean {
  try {
    return localStorage.getItem(PRIVACY_LOCK_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setGlobalPrivacyLocked(locked: boolean): void {
  try {
    localStorage.setItem(PRIVACY_LOCK_KEY, locked ? 'true' : 'false');
  } catch (e) {
    console.error('Error setting global privacy lock:', e);
  }
}

export function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSessionUnlocked(unlocked: boolean): void {
  try {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, unlocked ? 'true' : 'false');
  } catch (e) {
    console.error('Error setting session unlock:', e);
  }
}
