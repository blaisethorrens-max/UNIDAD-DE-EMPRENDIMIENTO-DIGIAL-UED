import { useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DriveSyncManager from './DriveSyncManager';
import ManualView from './ManualView';
import { generateAlertMessageWithGemini } from '../services/geminiService';
import GeminiAdvisorModal from './GeminiAdvisorModal';
import SecurityKeyModal from './SecurityKeyModal';

export default function InstructorView() {
  const { learners, updateLearnerModule, addLearner } = useData();
  const [activeTab, setActiveTab] = useState<'supervision' | 'drive' | 'manual'>('supervision');
  const [filterFicha, setFilterFicha] = useState<string>('all');
  const [reviewingLearner, setReviewingLearner] = useState<any | null>(null);
  const [selectedModuleNum, setSelectedModuleNum] = useState<number>(1);
  const [advisorRubricScore, setAdvisorRubricScore] = useState<number>(4.2);
  const [advisorNotes, setAdvisorNotes] = useState<string>('');
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [quickMsgLearner, setQuickMsgLearner] = useState<{ learner: any; message: string } | null>(null);
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);

  // Modal para agregar aprendiz
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [newLearnerData, setNewLearnerData] = useState({
    name: '',
    ficha: '',
    program: 'Tecnología en Análisis y Desarrollo de Software (ADSO)',
    center: 'Centro de Servicios y Gestión Empresarial',
    whatsapp: '573147873570',
    email: '',
  });
  const [learnerAddedSuccess, setLearnerAddedSuccess] = useState<string | null>(null);

  // Available unique fichas
  const uniqueFichas = Array.from(new Set(learners.map(l => l.ficha).filter(Boolean)));

  const filteredLearners = learners.filter(l => {
    return filterFicha === 'all' || l.ficha === filterFicha;
  });

  // Recharts Program Data Calculation
  const programData = learners.reduce((acc, learner) => {
    const progName = learner.program || 'General';
    const existing = acc.find(item => item.name === progName);
    if (existing) {
      existing.progress += learner.progress || 0;
      existing.count += 1;
    } else {
      acc.push({ name: progName, progress: learner.progress || 0, count: 1 });
    }
    return acc;
  }, [] as { name: string; progress: number; count: number }[]).map(item => ({
    name: item.name.length > 20 ? item.name.slice(0, 18) + '...' : item.name,
    avgProgress: Math.round(item.progress / (item.count || 1)),
  }));

  const handleOpenReview = (learner: any, modNum: number = 1) => {
    setReviewingLearner(learner);
    setSelectedModuleNum(modNum);
    setAdvisorRubricScore(learner.score || 4.0);
    setAdvisorNotes('');
  };

  const handleSaveEvaluation = (newStatus: 'approved' | 'in-review' | 'pending') => {
    if (reviewingLearner) {
      updateLearnerModule(reviewingLearner.id, selectedModuleNum, newStatus);
      alert(`Módulo ${selectedModuleNum} de ${reviewingLearner.name} marcado como: ${newStatus.toUpperCase()}`);
      setReviewingLearner(null);
    }
  };

  const handleGenerateAiAlert = async (learner: any) => {
    setIsGeneratingMsg(true);
    try {
      const pendingMods = [1, 2, 3, 4, 5, 6]
        .filter(m => learner.moduleStatus?.[m] !== 'approved')
        .map(m => `Módulo ${m}`);

      const msg = await generateAlertMessageWithGemini(
        learner.name,
        learner.ficha,
        learner.program,
        learner.progress || 0,
        pendingMods,
        'WhatsApp'
      );
      setQuickMsgLearner({ learner, message: msg });
    } catch (e) {
      console.error(e);
      setQuickMsgLearner({
        learner,
        message: `Hola ${learner.name}, te saluda tu asesor de la UED. Recuerda que tienes pendiente el avance en tus módulos de emprendimiento.`,
      });
    } finally {
      setIsGeneratingMsg(false);
    }
  };

  const handleAddLearnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearnerData.name.trim() || !newLearnerData.ficha.trim() || !newLearnerData.email.trim()) {
      alert('Por favor completa los campos obligatorios: Nombre, Ficha y Correo de Gmail.');
      return;
    }

    const newId = `learner-${Date.now()}`;
    addLearner({
      id: newId,
      name: newLearnerData.name.trim(),
      ficha: newLearnerData.ficha.trim(),
      program: newLearnerData.program.trim() || 'Emprendimiento y Negocios Digitales',
      center: newLearnerData.center.trim() || 'Centro de Formación SENA',
      whatsapp: newLearnerData.whatsapp.trim() || '573147873570',
      email: newLearnerData.email.trim(),
    });

    setLearnerAddedSuccess(
      `¡Aprendiz "${newLearnerData.name.trim()}" agregado exitosamente a la Ficha ${newLearnerData.ficha.trim()}!`
    );
    setTimeout(() => setLearnerAddedSuccess(null), 5000);

    setNewLearnerData({
      name: '',
      ficha: newLearnerData.ficha.trim(), // keep ficha for convenience when adding multiple
      program: 'Tecnología en Análisis y Desarrollo de Software (ADSO)',
      center: 'Centro de Servicios y Gestión Empresarial',
      whatsapp: '573147873570',
      email: '',
    });
    setIsAddLearnerOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase bg-orange-500 px-2 py-0.5 rounded font-bold">
              Panel Asesor / Instructor
            </span>
            <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-200">
              Unidad de Emprendimiento Digital
            </span>
          </div>
          <h2 className="text-2xl font-bold">Supervisión, Alertas y Sincronización</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Gestión integral de aprendices por Ficha, control de entregables en Google Drive/Sheets y asistencia con Gemini 3.8 Flash
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all border border-emerald-600"
            title="Configurar clave secreta de 9 caracteres y candado de privacidad"
          >
            <span>🔐 Clave Secreta (9 car.)</span>
          </button>

          <button
            onClick={() => setIsAddLearnerOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <span>➕ Agregar Aprendiz</span>
          </button>

          <button
            onClick={() => setIsAdvisorModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow flex items-center gap-2 transition-all"
          >
            <span>✨ Asistente IA Gemini 3.8 Flash</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-emerald-200 dark:border-emerald-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('supervision')}
          className={`py-3 px-6 border-b-2 transition-colors ${
            activeTab === 'supervision'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          📋 Dashboard de Supervisión ({learners.length} Aprendices)
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`py-3 px-6 border-b-2 transition-colors ${
            activeTab === 'drive'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          📁 Carpetas Drive & Google Sheets
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`py-3 px-6 border-b-2 transition-colors ${
            activeTab === 'manual'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          📖 Manual & Socialización a Aprendices
        </button>
      </div>

      {/* Tab: Supervision */}
      {activeTab === 'supervision' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KPI Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-emerald-400 block font-medium">Total Aprendices</span>
                <strong className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                  {learners.length}
                </strong>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1">Registrados en la UED</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-emerald-400 block font-medium">Fichas Activas</span>
                <strong className="text-3xl font-extrabold text-orange-500">
                  {uniqueFichas.length || 1}
                </strong>
                <span className="text-[11px] text-slate-500 dark:text-emerald-400 block mt-1">Grupos de formación</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-emerald-400 block font-medium">Avance Promedio</span>
                <strong className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {learners.length > 0
                    ? Math.round(learners.reduce((acc, l) => acc + (l.progress || 0), 0) / learners.length)
                    : 0}%
                </strong>
                <span className="text-[11px] text-emerald-600 block mt-1">En los 6 módulos</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-emerald-400 block font-medium">Entregas Pendientes</span>
                <strong className="text-3xl font-extrabold text-amber-500">
                  {learners.filter(l => Object.values(l.moduleStatus || {}).includes('in-review')).length}
                </strong>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 block mt-1">Por calificar</span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                  Avance Promedio por Programa de Formación (%)
                </h3>
                <span className="text-xs text-slate-500 dark:text-emerald-400">Recharts BarChart</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programData}>
                    <XAxis dataKey="name" stroke="#059669" fontSize={11} tickLine={false} />
                    <YAxis stroke="#059669" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#064e3b',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="avgProgress" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Filtrar por Ficha:</span>
              <select
                value={filterFicha}
                onChange={e => setFilterFicha(e.target.value)}
                className="p-2 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white"
              >
                <option value="all">Todas las Fichas ({learners.length})</option>
                {uniqueFichas.map(f => (
                  <option key={f} value={f}>
                    Ficha {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-emerald-400">
              Mostrando {filteredLearners.length} aprendices
            </div>
          </div>

          {/* Learners Table */}
          <div className="bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-emerald-100/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800">
                  <tr>
                    <th className="p-3 text-left font-semibold">Aprendiz</th>
                    <th className="p-3 text-left font-semibold">Ficha / Programa</th>
                    <th className="p-3 text-center font-semibold">Avance Global</th>
                    <th className="p-3 text-center font-semibold">Módulos (1-6)</th>
                    <th className="p-3 text-center font-semibold">Calificación</th>
                    <th className="p-3 text-right font-semibold">Acciones & Comunicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
                  {filteredLearners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-emerald-400">
                        No hay aprendices registrados en esta ficha aún.
                      </td>
                    </tr>
                  ) : (
                    filteredLearners.map(learner => {
                      const score = learner.score || 4.2;
                      const scoreClass =
                        score >= 3.8
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : score >= 3.0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

                      return (
                        <tr key={learner.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                          {/* Name & Contact */}
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-emerald-100">{learner.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-emerald-400">
                              WA: {learner.whatsapp || 'No registrado'}
                            </div>
                          </td>

                          {/* Ficha & Program */}
                          <td className="p-3">
                            <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                              Ficha: {learner.ficha || 'S/N'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-emerald-400 truncate max-w-[180px]">
                              {learner.program || 'Emprendimiento Digital'}
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="p-3 text-center">
                            <div className="font-bold text-sm text-slate-800 dark:text-emerald-200 mb-1">
                              {learner.progress || 0}%
                            </div>
                            <div className="w-20 bg-emerald-100 dark:bg-emerald-950 rounded-full h-1.5 mx-auto">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${learner.progress || 0}%` }}
                              />
                            </div>
                          </td>

                          {/* Mini Status 1-6 */}
                          <td className="p-3">
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5, 6].map(m => {
                                const st = learner.moduleStatus?.[m] || 'pending';
                                const color =
                                  st === 'approved'
                                    ? 'bg-emerald-500 text-white'
                                    : st === 'in-review'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-200 dark:bg-emerald-950 text-slate-600 dark:text-emerald-400';
                                return (
                                  <button
                                    key={m}
                                    onClick={() => handleOpenReview(learner, m)}
                                    title={`Módulo ${m}: ${st}`}
                                    className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center transition-transform hover:scale-110 ${color}`}
                                  >
                                    {m}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Score Rubric Badge */}
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${scoreClass}`}>
                              {score.toFixed(1)} / 5.0
                            </span>
                          </td>

                          {/* Communication & Review Buttons */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Direct WhatsApp Alert */}
                              <a
                                href={`https://wa.me/${learner.whatsapp?.replace(/[^0-9]/g, '') || '573147873570'}?text=${encodeURIComponent(
                                  `Hola ${learner.name}, te saluda tu Asesor de la Unidad de Emprendimiento Digital. Tienes un avance del ${learner.progress || 0}%. Recuerda enviar tus entregables pendientes.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100 font-semibold flex items-center gap-1"
                                title="Enviar mensaje directo de WhatsApp"
                              >
                                <span>💬 WA</span>
                              </a>

                              {/* AI Personalized Alert with Gemini */}
                              <button
                                onClick={() => handleGenerateAiAlert(learner)}
                                disabled={isGeneratingMsg}
                                className="px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-1 shadow-xs"
                                title="Generar mensaje con Gemini 3.8 Flash"
                              >
                                <span>✨ IA</span>
                              </button>

                              {/* Review deliverable */}
                              <button
                                onClick={() => handleOpenReview(learner, 1)}
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1"
                              >
                                <span>Revisar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Google Drive & Google Sheets Manager */}
      {activeTab === 'drive' && <DriveSyncManager learners={learners} />}

      {/* Tab: Manual & Socialización a Aprendices */}
      {activeTab === 'manual' && <ManualView initialTab="presentacion" />}

      {/* Evaluation & Review Modal */}
      {reviewingLearner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl max-w-2xl w-full border border-emerald-300 dark:border-emerald-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
              <div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-100">
                  Revisión Oficial: {reviewingLearner.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-400">
                  Ficha: {reviewingLearner.ficha} · Programa: {reviewingLearner.program}
                </p>
              </div>
              <button onClick={() => setReviewingLearner(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            {/* Module Picker */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedModuleNum(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedModuleNum === m
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300'
                  }`}
                >
                  Módulo {m}
                </button>
              ))}
            </div>

            {/* Delivered Answers & Spreadsheet View */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-3">
              <h4 className="font-bold text-emerald-950 dark:text-emerald-100">
                Entregables y Hoja de Cálculo del Módulo {selectedModuleNum}:
              </h4>
              <div className="bg-white dark:bg-emerald-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700 max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-slate-800 dark:text-emerald-200">
                  {JSON.stringify(reviewingLearner.moduleAnswers?.[selectedModuleNum] || 'Sin datos diligenciados aún', null, 2)}
                </pre>
              </div>
            </div>

            {/* Rubric Score Slider */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Calificación Asesor UED (Escala 1.0 a 5.0):
                </label>
                <span className="font-mono text-base font-bold text-orange-600">
                  {advisorRubricScore.toFixed(1)} / 5.0
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={advisorRubricScore}
                onChange={e => setAdvisorRubricScore(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Retroalimentación del Asesor:
              </label>
              <textarea
                value={advisorNotes}
                onChange={e => setAdvisorNotes(e.target.value)}
                placeholder="Observaciones pedagógicas para que el aprendiz ajuste o continúe..."
                className="w-full h-20 p-2.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
              <button
                onClick={() => handleSaveEvaluation('pending')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900 text-slate-700 dark:text-emerald-200 text-xs font-semibold"
              >
                Requiere Ajustes (Pendiente)
              </button>
              <button
                onClick={() => handleSaveEvaluation('in-review')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
              >
                En Revisión
              </button>
              <button
                onClick={() => handleSaveEvaluation('approved')}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow"
              >
                ✓ Aprobar Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick AI Alert Modal */}
      {quickMsgLearner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl max-w-lg w-full border border-emerald-300 dark:border-emerald-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <span>💬 Mensaje Gemini 3.8 Flash para {quickMsgLearner.learner.name}</span>
              </h4>
              <button onClick={() => setQuickMsgLearner(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <textarea
              readOnly
              value={quickMsgLearner.message}
              className="w-full h-32 p-3 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quickMsgLearner.message);
                  alert('Mensaje copiado al portapapeles');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-semibold"
              >
                📋 Copiar
              </button>
              <a
                href={`https://wa.me/${quickMsgLearner.learner.whatsapp?.replace(/[^0-9]/g, '') || '573147873570'}?text=${encodeURIComponent(quickMsgLearner.message)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow"
              >
                Enviar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Advisor Floating / Modal for Advisor */}
      <GeminiAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
        moduleNumber={1}
        moduleName="Orientación al Asesor"
        currentPlan={learners}
        learnerName="Asesor SENA UED"
      />

      {/* Success Banner when learner is added */}
      {learnerAddedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-700 text-white shadow-2xl border border-emerald-500 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="text-xl">✅</span>
          <span>{learnerAddedSuccess}</span>
          <button
            onClick={() => setLearnerAddedSuccess(null)}
            className="ml-2 text-emerald-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal: Agregar Aprendiz a Ficha */}
      {isAddLearnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-emerald-950 p-6 sm:p-7 rounded-3xl max-w-lg w-full border-2 border-emerald-300 dark:border-emerald-700 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-lg shadow-sm">
                  ➕
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                    Agregar Nuevo Aprendiz
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400">
                    Registro directo en la base de datos de la UED y sincronización de Ficha
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLearnerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-emerald-900 text-slate-500 dark:text-emerald-300 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLearnerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-emerald-200 mb-1">
                  Nombre Completo del Aprendiz *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Camilo Pérez Restrepo"
                  value={newLearnerData.name}
                  onChange={e => setNewLearnerData({ ...newLearnerData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-emerald-200 mb-1">
                    Número de Ficha SENA *
                  </label>
                  <input
                    type="text"
                    required
                    list="fichas-list"
                    placeholder="Ej: 2845612"
                    value={newLearnerData.ficha}
                    onChange={e => setNewLearnerData({ ...newLearnerData, ficha: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                  <datalist id="fichas-list">
                    {uniqueFichas.map(f => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-emerald-200 mb-1">
                    WhatsApp (con indicativo) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 573147873570"
                    value={newLearnerData.whatsapp}
                    onChange={e => setNewLearnerData({ ...newLearnerData, whatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-emerald-200 mb-1">
                  Correo de Gmail del Aprendiz *
                </label>
                <input
                  type="email"
                  required
                  placeholder="aprendiz.sena@gmail.com"
                  value={newLearnerData.email}
                  onChange={e => setNewLearnerData({ ...newLearnerData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-emerald-400 mt-1 block">
                  Indispensable: aquí se remitirá la copia (CC) automática de los comprobantes de culminación de módulo.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-emerald-200 mb-1">
                  Programa de Formación
                </label>
                <select
                  value={newLearnerData.program}
                  onChange={e => setNewLearnerData({ ...newLearnerData, program: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white text-xs"
                >
                  <option value="Tecnología en Análisis y Desarrollo de Software (ADSO)">
                    Tecnología en Análisis y Desarrollo de Software (ADSO)
                  </option>
                  <option value="Tecnología en Gestión Empresarial y Finanzas">
                    Tecnología en Gestión Empresarial y Finanzas
                  </option>
                  <option value="Tecnología en Producción Multimedia">
                    Tecnología en Producción Multimedia
                  </option>
                  <option value="Técnico en Mercadeo y Negocios Digitales">
                    Técnico en Mercadeo y Negocios Digitales
                  </option>
                  <option value="Emprendimiento e Innovación Digital">
                    Emprendimiento e Innovación Digital
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-emerald-200 mb-1">
                  Centro de Formación SENA
                </label>
                <input
                  type="text"
                  placeholder="Centro de Servicios y Gestión Empresarial"
                  value={newLearnerData.center}
                  onChange={e => setNewLearnerData({ ...newLearnerData, center: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddLearnerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900 text-slate-700 dark:text-emerald-200 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>💾 Registrar Aprendiz</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Key Configuration Modal */}
      <SecurityKeyModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}
