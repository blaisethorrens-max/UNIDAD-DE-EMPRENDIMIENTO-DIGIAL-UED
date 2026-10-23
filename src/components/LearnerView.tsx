import { useState, useEffect } from 'react';
import ModuleView from './ModuleView';
import ManualView from './ManualView';
import QuickStartGuide from './QuickStartGuide';
import GeminiAdvisorModal from './GeminiAdvisorModal';
import AdvisorConsultationModal from './AdvisorConsultationModal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function LearnerView() {
  const [activeTab, setActiveTab] = useState<'Modulos' | 'Manual' | 'Perfil'>('Modulos');
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);

  const { user } = useAuth();
  const { learners, updateLearnerProfile } = useData();
  const learner = learners.find(l => l.id === user?.id) || {
    id: user?.id || 'demo',
    name: user?.name || 'Aprendiz',
    ficha: '2845612',
    program: 'Emprendimiento y Negocios Digitales',
    center: 'Centro de Formación SENA',
    whatsapp: '573147873570',
    email: 'aprendiz.sena@gmail.com',
    progress: 33,
    score: 4.2,
    moduleStatus: { 1: 'approved', 2: 'in-review', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending' },
    moduleAnswers: {},
  };

  const [profileEmail, setProfileEmail] = useState(learner.email || 'aprendiz.sena@gmail.com');
  const [profileWhatsapp, setProfileWhatsapp] = useState(learner.whatsapp || '573147873570');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    if (learner.email) setProfileEmail(learner.email);
    if (learner.whatsapp) setProfileWhatsapp(learner.whatsapp);
  }, [learner.email, learner.whatsapp]);

  useEffect(() => {
    if (!localStorage.getItem('guideSeen')) {
      setShowGuide(true);
    }
  }, []);

  const closeGuide = () => {
    localStorage.setItem('guideSeen', 'true');
    setShowGuide(false);
  };

  const modules = [
    { num: 1, title: 'Identificación y Validación', icon: '🔍', desc: 'Cliente objetivo, dolor real y propuesta de valor inicial' },
    { num: 2, title: 'Estudio de Mercado y 4P', icon: '📈', desc: 'Competencia, estrategia de precios y canales de captación' },
    { num: 3, title: 'Operación y Aspectos Técnicos', icon: '⚙️', desc: 'Procesos de entrega, infraestructura en la nube y PMV' },
    { num: 4, title: 'Organización y Marco Legal', icon: '⚖️', desc: 'Equipo clave, figura mercantil S.A.S. y Habeas Data' },
    { num: 5, title: 'Plan Financiero Interactivo', icon: '💰', desc: 'Costos fijos/variables, simulador y punto de equilibrio en vivo' },
    { num: 6, title: 'Pitch Deck y Resumen Ejecutivo', icon: '🎤', desc: 'Pitch de 3 minutos y resumen ejecutivo con Gemini 3.8 Flash' },
  ];

  if (selectedModule !== null) {
    return <ModuleView moduleId={selectedModule} onBack={() => setSelectedModule(null)} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {showGuide && <QuickStartGuide onClose={closeGuide} />}

      {/* Hero Card for Learner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider bg-orange-500 px-2.5 py-0.5 rounded font-bold">
            Portal del Aprendiz
          </span>
          <h2 className="text-2xl font-bold mt-1">¡Hola, {learner.name}!</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            Ficha: <strong>{learner.ficha}</strong> · Programa: <strong>{learner.program}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Tutor Assistant Floating trigger */}
          <button
            onClick={() => setIsAiTutorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow flex items-center gap-2 transition-transform hover:scale-105"
          >
            <span>✨ Tutor Virtual Gemini 3.8 Flash</span>
          </button>

          {/* Contact Advisor via Modal with Name and Ficha */}
          <button
            onClick={() => setIsAdvisorModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
          >
            <span>💬 Consultar al Asesor</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-emerald-200 dark:border-emerald-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('Modulos')}
          className={`py-3 px-6 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'Modulos'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span>📋</span> Módulos del Plan de Negocios
        </button>
        <button
          onClick={() => setActiveTab('Manual')}
          className={`py-3 px-6 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'Manual'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span>📖</span> Manual de Formulación UED
        </button>
        <button
          onClick={() => setActiveTab('Perfil')}
          className={`py-3 px-6 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'Perfil'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span>👤</span> Mi Perfil & Ficha
        </button>
      </div>

      {/* TAB 1: MODULOS */}
      {activeTab === 'Modulos' && (
        <div className="space-y-6">
          {/* Progress Bar & Status Summary */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                  Progreso Global de Formulación ({learner.progress || 0}%)
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-400">
                  Completa los 6 módulos para calificar tu plan ante el comité UED
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Aprobado
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> En Revisión
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Pendiente
                </span>
              </div>
            </div>

            <div className="w-full bg-emerald-100 dark:bg-emerald-950 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${learner.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(mod => {
              const status = learner.moduleStatus?.[mod.num] || 'pending';
              const statusText =
                status === 'approved'
                  ? 'Aprobado'
                  : status === 'in-review'
                  ? 'En Revisión'
                  : 'Pendiente';
              const statusBadgeColor =
                status === 'approved'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-800 dark:text-emerald-100'
                  : status === 'in-review'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900 dark:text-amber-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-emerald-950 dark:text-emerald-300';

              return (
                <div
                  key={mod.num}
                  onClick={() => setSelectedModule(mod.num)}
                  className="p-5 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:border-orange-400 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {mod.icon}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeColor}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400 uppercase font-bold">
                        Módulo {mod.num}
                      </span>
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 group-hover:text-orange-600 transition-colors">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-emerald-100 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    <span>Diligenciar y Formular</span>
                    <span className="group-hover:translate-x-1 transition-transform">➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL */}
      {activeTab === 'Manual' && <ManualView />}

      {/* TAB 3: PERFIL */}
      {activeTab === 'Perfil' && (
        <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-100">
              Ficha de Identificación del Aprendiz
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold">
              Ficha {learner.ficha}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-emerald-400">
            Esta información identifica tus entregas y asegura que las alertas de culminación y revisiones del asesor lleguen directamente a tu correo de Gmail y WhatsApp.
          </p>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-emerald-400 font-medium">Nombre Completo:</span>
                <strong className="text-emerald-950 dark:text-emerald-100">{learner.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-emerald-400 font-medium">Número de Ficha:</span>
                <strong className="text-emerald-950 dark:text-emerald-100">{learner.ficha}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-emerald-400 font-medium">Programa de Formación:</span>
                <strong className="text-emerald-950 dark:text-emerald-100">{learner.program}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-emerald-400 font-medium">Centro de Formación:</span>
                <strong className="text-emerald-950 dark:text-emerald-100">{learner.center || 'SENA'}</strong>
              </div>
            </div>

            {/* Editable Contact & Gmail Information for Culmination Alerts */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-emerald-950 dark:text-emerald-100 mb-1">
                  📧 Correo de Gmail del Aprendiz * (Receptor de Alertas de Culminación)
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-emerald-400 mt-1">
                  Al enviar a revisión un módulo culminado, se enviará una alerta automática con copia (CC) a este Gmail y al correo del Asesor (<span className="font-semibold text-emerald-700 dark:text-emerald-300">blaisethorrens@gmail.com</span>).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-emerald-950 dark:text-emerald-100 mb-1">
                  📱 WhatsApp del Aprendiz (para seguimiento directo)
                </label>
                <input
                  type="text"
                  value={profileWhatsapp}
                  onChange={e => setProfileWhatsapp(e.target.value)}
                  placeholder="Ej: 573147873570"
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {profileSavedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <span>✓</span> {profileSavedMsg}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-emerald-400">
              Datos sincronizados con UED SENA
            </span>
            <button
              onClick={() => {
                if (!profileEmail || !profileEmail.includes('@')) {
                  alert('Por favor ingresa un correo electrónico válido de Gmail.');
                  return;
                }
                updateLearnerProfile(learner.id, {
                  email: profileEmail.trim(),
                  whatsapp: profileWhatsapp.trim(),
                });
                setProfileSavedMsg('¡Perfil actualizado con éxito! Tu correo Gmail está listo para recibir alertas de culminación.');
                setTimeout(() => setProfileSavedMsg(''), 4000);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1.5"
            >
              <span>💾</span> Guardar Correo Gmail & Perfil
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Tutor Modal */}
      <GeminiAdvisorModal
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        moduleNumber={1}
        moduleName="General de Formulación"
        currentPlan={learner.moduleAnswers}
        learnerName={learner.name}
      />

      {/* Advisor Consultation Modal with mandatory Name & Ficha identification */}
      <AdvisorConsultationModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
        defaultName={learner.name}
        defaultFicha={learner.ficha}
        defaultProgram={learner.program}
        defaultModuleNumber={1}
        defaultModuleName="Consulta General del Plan de Negocios"
      />
    </div>
  );
}
