import { useState, useEffect } from 'react';
import { askGeminiAdvisor } from '../services/geminiService';

interface AdvisorConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
  defaultFicha?: string;
  defaultProgram?: string;
  defaultModuleNumber?: number;
  defaultModuleName?: string;
}

export default function AdvisorConsultationModal({
  isOpen,
  onClose,
  defaultName = '',
  defaultFicha = '',
  defaultProgram = '',
  defaultModuleNumber = 1,
  defaultModuleName = 'Identificación y Validación',
}: AdvisorConsultationModalProps) {
  const [fullName, setFullName] = useState(defaultName);
  const [ficha, setFicha] = useState(defaultFicha);
  const [program, setProgram] = useState(defaultProgram);
  const [topic, setTopic] = useState(`Módulo ${defaultModuleNumber}: ${defaultModuleName}`);
  const [queryText, setQueryText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultName) setFullName(defaultName);
    if (defaultFicha) setFicha(defaultFicha);
    if (defaultProgram) setProgram(defaultProgram);
    if (defaultModuleNumber && defaultModuleName) {
      setTopic(`Módulo ${defaultModuleNumber}: ${defaultModuleName}`);
    }
  }, [defaultName, defaultFicha, defaultProgram, defaultModuleNumber, defaultModuleName]);

  if (!isOpen) return null;

  // Build the standardized WhatsApp and Email message format
  const formattedMessage = `*CONSULTA UED - PLAN DE NEGOCIOS*
👤 *Aprendiz:* ${fullName.trim() || '[Sin Nombre]'}
📋 *Ficha:* ${ficha.trim() || '[Sin Ficha]'}
🎓 *Programa:* ${program.trim() || 'Emprendimiento Digital'}
📌 *Tema / Módulo:* ${topic}

❓ *Consulta:*
${queryText.trim() || 'Estimado asesor, solicito su orientación para avanzar en la formulación de mi plan de negocios en la plataforma UED.'}

Agradezco su atención y acompañamiento pedagógico.`;

  const whatsappUrl = `https://wa.me/573147873570?text=${encodeURIComponent(formattedMessage)}`;
  const emailUrl = `mailto:blaisethorrens@gmail.com?subject=${encodeURIComponent(
    `[Consulta UED] Ficha ${ficha} - ${fullName} - ${topic}`
  )}&body=${encodeURIComponent(formattedMessage)}`;

  // Polish question with Gemini 3.8 Flash
  const handlePolishWithGemini = async () => {
    if (!queryText.trim()) {
      alert('Escribe primero tu duda o borrador para que Gemini 3.8 Flash pueda ayudarte a estructurarla.');
      return;
    }

    setIsPolishing(true);
    try {
      const prompt = `Ayúdame a redactar esta consulta de forma muy clara, concisa, profesional y respetuosa para enviarla por WhatsApp a mi Asesor de Emprendimiento SENA:
"${queryText}"

Contexto: Aprendiz ${fullName}, Ficha ${ficha}, Módulo: ${topic}.
Devuelve únicamente el texto pulido de la consulta en 1 o 2 párrafos concisos, sin saludos genéricos ni firmas.`;

      const polished = await askGeminiAdvisor(prompt, defaultModuleNumber, defaultModuleName, {}, fullName);
      // Clean up markdown quotes if any
      const cleaned = polished.replace(/^["']|["']$/g, '').trim();
      setQueryText(cleaned);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const validateAndSend = (action: 'whatsapp' | 'email') => {
    if (!fullName.trim()) {
      alert('Por favor escribe tu Nombre Completo para que el asesor pueda identificarte.');
      return;
    }
    if (!ficha.trim()) {
      alert('Por favor escribe tu Número de Ficha para que el asesor identifique tu grupo de formación.');
      return;
    }
    if (!queryText.trim()) {
      alert('Por favor escribe el detalle de tu consulta.');
      return;
    }

    if (action === 'whatsapp') {
      window.open(whatsappUrl, '_blank');
    } else {
      window.open(emailUrl, '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl max-w-xl w-full border border-emerald-300 dark:border-emerald-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg shadow">
              💬
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                Consultar al Asesor de Emprendimiento
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300">
                Tu nombre y ficha se incluirán automáticamente para que el asesor te identifique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Identification Form */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Nombre Completo del Aprendiz *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ej: Carlos Eduardo Morales"
                required
                className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Número de Ficha *
              </label>
              <input
                type="text"
                value={ficha}
                onChange={e => setFicha(e.target.value)}
                placeholder="Ej: 2845612"
                required
                className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Programa de Formación
              </label>
              <input
                type="text"
                value={program}
                onChange={e => setProgram(e.target.value)}
                placeholder="Ej: Análisis y Desarrollo de Software"
                className="w-full p-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Módulo / Asunto de Consulta
              </label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
              >
                <option value="Módulo 1: Identificación y Validación">Módulo 1: Identificación y Validación</option>
                <option value="Módulo 2: Estudio de Mercado y 4P">Módulo 2: Estudio de Mercado y 4P</option>
                <option value="Módulo 3: Operación y Aspectos Técnicos">Módulo 3: Operación y Aspectos Técnicos</option>
                <option value="Módulo 4: Organización y Marco Legal">Módulo 4: Organización y Marco Legal</option>
                <option value="Módulo 5: Plan Financiero Interactivo">Módulo 5: Plan Financiero Interactivo</option>
                <option value="Módulo 6: Pitch Deck y Resumen Ejecutivo">Módulo 6: Pitch Deck y Resumen Ejecutivo</option>
                <option value="Consulta General sobre Formulación UED">Consulta General sobre Formulación UED</option>
              </select>
            </div>
          </div>

          {/* Consultation Query */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-emerald-900 dark:text-emerald-200">
                Escribe tu consulta para el Asesor *
              </label>
              <button
                type="button"
                onClick={handlePolishWithGemini}
                disabled={isPolishing || !queryText.trim()}
                className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <span>{isPolishing ? 'Gemini puliendo...' : '✨ Mejorar redacción con Gemini 3.8 Flash'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              placeholder="Explica detalladamente tu duda: ¿en qué punto del módulo estás detenido, qué has intentado o qué concepto requieres aclarar con el asesor?"
              className="w-full p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Real-Time Message Preview */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <span>👁️</span> Vista previa del mensaje para el Asesor:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                {copied ? '✓ Copiado' : 'Copiar texto'}
              </button>
            </div>
            <pre className="text-[11px] whitespace-pre-wrap font-sans text-slate-700 dark:text-emerald-200 bg-white dark:bg-emerald-950 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800 max-h-32 overflow-y-auto">
              {formattedMessage}
            </pre>
          </div>
        </div>

        {/* Target Advisor Info */}
        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-between text-[11px] text-orange-950 dark:text-orange-200">
          <div className="flex items-center gap-2">
            <span>🧑‍🏫</span>
            <span>
              <strong>Asesor Asignado:</strong> WhatsApp <code>3147873570</code> · Correo <code>blaisethorrens@gmail.com</code>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => validateAndSend('email')}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>✉️ Enviar por Correo</span>
          </button>

          <button
            type="button"
            onClick={() => validateAndSend('whatsapp')}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform hover:scale-102"
          >
            <span>💬 Enviar por WhatsApp al Asesor</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
