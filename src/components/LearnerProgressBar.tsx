import { useState } from 'react';
import { useData, LearnerData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LearnerProgressBarProps {
  learner?: LearnerData;
  onNavigateTab?: (tab: 'Modulos' | 'PlanDeNegocios' | 'Manual' | 'Perfil') => void;
  onSelectModule?: (moduleId: number) => void;
  className?: string;
  showDetails?: boolean;
}

export default function LearnerProgressBar({
  learner: propLearner,
  onNavigateTab,
  onSelectModule,
  className = '',
  showDetails = true,
}: LearnerProgressBarProps) {
  const { user } = useAuth();
  const { learners } = useData();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isExpanded, setIsExpanded] = useState(false);

  // Retrieve current learner from DataContext if not provided directly
  const learner: LearnerData =
    propLearner ||
    learners.find(l => l.id === user?.id) ||
    learners[0] || {
      id: 'demo',
      name: 'Aprendiz',
      ficha: '2845612',
      program: 'ADSO',
      center: 'SENA',
      whatsapp: '',
      email: '',
      progress: 0,
      score: 4.0,
      moduleStatus: { 1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending' },
      moduleAnswers: {},
      businessPlan: {},
    };

  // 1. Module status statistics
  const moduleStatus = learner.moduleStatus || {};
  const approvedCount = [1, 2, 3, 4, 5, 6].filter(m => moduleStatus[m] === 'approved').length;
  const inReviewCount = [1, 2, 3, 4, 5, 6].filter(m => moduleStatus[m] === 'in-review').length;
  const pendingCount = [1, 2, 3, 4, 5, 6].filter(m => !moduleStatus[m] || moduleStatus[m] === 'pending').length;

  // 2. Business Plan Spreadsheet books statistics (10 Books)
  const businessPlan = learner.businessPlan || {};
  const standardBooks = [
    '1 resumen',
    '2 modelo de negocio',
    '3 mercado',
    '4 operacion',
    '5 mercadeo',
    '6 inversion',
    '7 costos-precios',
    '8 proyeccion',
    '9 indicadores',
    '10 evaluacion',
  ];

  const filledBooksCount = standardBooks.filter(bookKey => {
    const book = businessPlan[bookKey];
    if (!book) return false;
    return Object.values(book).some(
      v => v !== undefined && v !== null && String(v).trim() !== ''
    );
  }).length;

  // Progress percentage from DataContext (guaranteed 0-100)
  const progressPercent = Math.min(100, Math.max(0, learner.progress ?? Math.round((approvedCount / 6) * 100)));

  // Status message & badge styling based on progress
  let statusBadge = {
    text: isEn ? '🌱 Formulation Started' : '🌱 Iniciando Formulación',
    bgColor: 'bg-slate-700/60 text-slate-300 border-slate-600',
  };

  if (progressPercent >= 100 || approvedCount === 6) {
    statusBadge = {
      text: isEn ? '🎉 Plan 100% Completed · Certified' : '🎉 Plan 100% Completado · Acreditado',
      bgColor: 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40 font-bold',
    };
  } else if (progressPercent >= 75) {
    statusBadge = {
      text: isEn ? '🚀 Final Phase · Ready for Pitch' : '🚀 Fase Final · Listo para Sustentación',
      bgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
    };
  } else if (progressPercent >= 40) {
    statusBadge = {
      text: isEn ? '📈 Formulating Core Plan' : '📈 Consolidando Modelo y Finanzas',
      bgColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold',
    };
  }

  const moduleNames = [
    { num: 1, title: isEn ? '1. Problem & Customer' : '1. Problema y Validación', icon: '🔍' },
    { num: 2, title: isEn ? '2. Market & 4P' : '2. Mercado y 4P', icon: '📢' },
    { num: 3, title: isEn ? '3. Technical Operations' : '3. Operación Técnica', icon: '⚙️' },
    { num: 4, title: isEn ? '4. Legal Framework (S.A.S.)' : '4. Marco Legal S.A.S.', icon: '⚖️' },
    { num: 5, title: isEn ? '5. Financial Plan (BEP)' : '5. Plan Financiero (PE)', icon: '💰' },
    { num: 6, title: isEn ? '6. Pitch Deck UED' : '6. Pitch Deck UED', icon: '🎯' },
  ];

  return (
    <div
      className={`p-5 sm:p-6 bg-white dark:bg-emerald-950/70 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-md space-y-4 transition-all duration-300 ${className}`}
    >
      {/* Top Header: Title, Percentage, and Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#4D7C0F] to-[#39FF14] text-slate-950 flex items-center justify-center text-xl font-black shadow-md shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-emerald-950 dark:text-emerald-100">
                {isEn ? 'Business Plan Progress' : 'Progreso del Plan de Negocios'}
              </h3>
              <span
                className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border ${statusBadge.bgColor}`}
              >
                {statusBadge.text}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-emerald-300">
              {isEn
                ? `${approvedCount} of 6 modules approved · ${filledBooksCount} of 10 workbook sheets completed`
                : `${approvedCount} de 6 módulos aprobados · ${filledBooksCount} de 10 hojas de cálculo diligenciadas`}
            </p>
          </div>
        </div>

        {/* Large Percentage Badge & Expand Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#EA580C] dark:text-[#39FF14]">
              {progressPercent}%
            </div>
            <span className="text-[10px] text-slate-400 dark:text-emerald-400 font-mono">
              {isEn ? 'DataContext Verified' : 'Sincronizado UED'}
            </span>
          </div>

          {showDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer border border-emerald-300 dark:border-emerald-700"
              title={isEn ? 'Toggle details' : 'Ver desglose'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {/* Main Gradient Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-200 dark:bg-emerald-950 rounded-full h-4 p-0.5 border border-emerald-300 dark:border-emerald-800/80 shadow-inner overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4D7C0F] via-[#39FF14] to-[#EA580C] transition-all duration-700 shadow-sm relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Subtle animated light gleam effect */}
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
          </div>
        </div>

        {/* Milestone Tick Marks (0%, 25%, 50%, 75%, 100%) */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-emerald-400/80 px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className="font-bold text-[#EA580C] dark:text-[#39FF14]">100% {isEn ? '(Certified)' : '(Acreditado)'}</span>
        </div>
      </div>

      {/* 6-Module Interactive Stepper Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {moduleNames.map(m => {
          const status = moduleStatus[m.num] || 'pending';
          let statusStyle = 'bg-slate-100 dark:bg-slate-900/70 border-slate-300 dark:border-slate-800 text-slate-500';
          let iconBadge = '⚪';
          let statusLabel = isEn ? 'Pending' : 'Pendiente';

          if (status === 'approved') {
            statusStyle = 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
            iconBadge = '✓';
            statusLabel = isEn ? 'Approved' : 'Aprobado';
          } else if (status === 'in-review') {
            statusStyle = 'bg-orange-50 dark:bg-orange-950/40 border-orange-400 text-orange-800 dark:text-orange-200 font-semibold';
            iconBadge = '⏳';
            statusLabel = isEn ? 'In Review' : 'En Revisión';
          }

          return (
            <button
              key={m.num}
              type="button"
              onClick={() => onSelectModule && onSelectModule(m.num)}
              className={`p-2 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${statusStyle}`}
              title={`${m.title} · ${statusLabel}`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] font-bold">M{m.num}</span>
                <span className="text-[11px]">{iconBadge}</span>
              </div>
              <div className="text-[11px] font-semibold truncate leading-tight">
                {m.title.replace(/^\d+\.\s*/, '')}
              </div>
              <div className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">
                {statusLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Breakdown Panel */}
      {isExpanded && (
        <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
          {/* Box 1: Methodological Modules Status */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
              <span>📚</span> {isEn ? '6 Methodological Modules' : '6 Módulos Metodológicos'}
            </span>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-emerald-300">
              <div className="flex justify-between">
                <span>{isEn ? 'Approved by Advisor:' : 'Aprobados por el Asesor:'}</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{approvedCount} / 6</strong>
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Under Review:' : 'En Revisión del Asesor:'}</span>
                <strong className="text-orange-600 dark:text-orange-400 font-mono">{inReviewCount} / 6</strong>
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Pending Challenges:' : 'Pendientes de Envío:'}</span>
                <strong className="text-slate-500 font-mono">{pendingCount} / 6</strong>
              </div>
            </div>
          </div>

          {/* Box 2: 10-Book Spreadsheet Status */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
              <span>📑</span> {isEn ? '10-Book Workbook' : 'Hoja de Cálculo (10 Libros)'}
            </span>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-emerald-300">
              <div className="flex justify-between">
                <span>{isEn ? 'Sheets Formulated:' : 'Libros Diligenciados:'}</span>
                <strong className="text-[#39FF14] dark:text-[#39FF14] font-mono">{filledBooksCount} / 10</strong>
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Financial BEP Engine:' : 'Punto de Equilibrio:'}</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {businessPlan['7 costos-precios']?.precio_venta ? 'Calculado' : 'Pendiente'}
                </strong>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('PlanDeNegocios')}
                  className="mt-1 text-[11px] text-orange-600 dark:text-orange-400 font-bold hover:underline block cursor-pointer"
                >
                  {isEn ? 'Open Workbook ➔' : 'Abrir Hoja de Cálculo ➔'}
                </button>
              )}
            </div>
          </div>

          {/* Box 3: Academic Standing & Certification */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
              <span>🎓</span> {isEn ? '40-Hour Certification' : 'Acreditación UED (40 Horas)'}
            </span>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-emerald-300">
              <div className="flex justify-between">
                <span>{isEn ? 'Current Rubric Score:' : 'Calificación del Asesor:'}</span>
                <strong className="text-[#EA580C] font-mono">{learner.score || 4.6} / 5.0</strong>
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Official Diploma Status:' : 'Diploma 40h:'}</span>
                <strong className={approvedCount === 6 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                  {approvedCount === 6 ? (isEn ? 'Ready to Print' : 'Habilitado') : (isEn ? 'In Progress' : 'En Curso')}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Drive & Sheets Sync:' : 'Custodia en Nube:'}</span>
                <span className="text-[10px] font-mono text-emerald-600">30d Drive / 1y Sheets</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
