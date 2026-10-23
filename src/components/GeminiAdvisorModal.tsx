import { useState } from 'react';
import { askGeminiAdvisor } from '../services/geminiService';

interface GeminiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleNumber?: number;
  moduleName?: string;
  currentPlan?: any;
  learnerName?: string;
}

export default function GeminiAdvisorModal({
  isOpen,
  onClose,
  moduleNumber = 1,
  moduleName = 'Identificación y Validación',
  currentPlan = {},
  learnerName = 'Aprendiz',
}: GeminiAdvisorModalProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'gemini'; text: string; time: string }>>([
    {
      sender: 'gemini',
      text: `¡Hola ${learnerName}! Soy tu Tutor Virtual de la Unidad de Emprendimiento Digital con **Gemini 3.8 Flash**. Estoy aquí para orientarte en el **Módulo ${moduleNumber}: ${moduleName}**, revisar tu hoja de cálculo o resolver cualquier duda sobre tu plan de negocios. ¿En qué te puedo colaborar hoy?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const presets = [
    '¿Cómo valido si mi problema es real con clientes?',
    '¿Cómo defino mi propuesta de valor única?',
    'Ayúdame a calcular el punto de equilibrio',
    '¿Qué canales de venta digitales me recomiendas?',
    '¿Cómo estructuro mi pitch de 3 minutos?',
  ];

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const reply = await askGeminiAdvisor(query, moduleNumber, moduleName, currentPlan, learnerName);
      setMessages(prev => [
        ...prev,
        {
          sender: 'gemini',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'gemini',
          text: 'Ocurrió un error al contactar al tutor virtual. Por favor intenta de nuevo.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-emerald-950 w-full max-w-3xl rounded-2xl shadow-2xl border border-emerald-300 dark:border-emerald-800 flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-lg shadow-md">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Tutor Virtual UED</h3>
                <span className="text-xs bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full font-mono border border-emerald-600">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Contexto activo: Módulo {moduleNumber} - {moduleName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-emerald-50/40 dark:bg-emerald-950/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm ${
                  m.sender === 'user'
                    ? 'bg-orange-500 text-white rounded-br-none shadow-sm'
                    : 'bg-white dark:bg-emerald-900 text-slate-800 dark:text-emerald-100 rounded-bl-none border border-emerald-200 dark:border-emerald-800 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-orange-200' : 'text-slate-400 dark:text-emerald-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 italic p-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              Gemini 3.8 Flash está analizando y redactando recomendaciones...
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="px-6 py-2 bg-white dark:bg-emerald-900/50 border-t border-emerald-100 dark:border-emerald-800/80 flex gap-2 overflow-x-auto text-xs whitespace-nowrap">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-orange-100 hover:text-orange-800 transition-colors disabled:opacity-50"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-emerald-950 border-t border-emerald-200 dark:border-emerald-800 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pregúntale a Gemini 3.8 Flash sobre tu módulo o plan..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Enviar</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
