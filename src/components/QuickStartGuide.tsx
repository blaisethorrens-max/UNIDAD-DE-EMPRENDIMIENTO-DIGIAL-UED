import { useState } from 'react';
import UEDLogo from './UEDLogo';
import { useLanguage } from '../context/LanguageContext';

interface QuickStartGuideProps {
  onClose: () => void;
  onNavigateTab?: (tab: 'Modulos' | 'PlanDeNegocios' | 'Manual' | 'Perfil') => void;
  learnerName?: string;
  ficha?: string;
}

export default function QuickStartGuide({
  onClose,
  onNavigateTab,
  learnerName = 'Aprendiz',
  ficha = '2845612',
}: QuickStartGuideProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Interactive mini-calculator state for Step 3 (Spreadsheet preview)
  const [demoCv, setDemoCv] = useState(15000);
  const [demoPv, setDemoPv] = useState(45000);
  const [demoCf, setDemoCf] = useState(3000000);

  const demoMargen = Math.max(0, demoPv - demoCv);
  const demoMargenPct = demoPv > 0 ? Math.round((demoMargen / demoPv) * 100) : 0;
  const demoPeUnidades = demoMargen > 0 ? Math.ceil(demoCf / demoMargen) : 0;
  const demoPeDinero = demoPeUnidades * demoPv;

  const totalSteps = 5;

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('guideSeen', 'true');
    }
    onClose();
  };

  const handleJumpToTab = (tab: 'Modulos' | 'PlanDeNegocios' | 'Manual' | 'Perfil') => {
    if (dontShowAgain) {
      localStorage.setItem('guideSeen', 'true');
    }
    onClose();
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  const steps = [
    {
      id: 'welcome',
      badge: isEn ? 'Step 1 of 5 · Induction' : 'Paso 1 de 5 · Inducción',
      title: isEn ? 'Welcome to the UED · SENA Ecosystem' : '¡Bienvenido al Ecosistema UED · SENA!',
      subtitle: isEn
        ? 'Digital Entrepreneurship Unit — From innovative ideas to market-validated businesses.'
        : 'Unidad de Emprendimiento Digital — De la idea innovadora a un negocio validado en el mercado.',
      icon: '🚀',
    },
    {
      id: 'modules',
      badge: isEn ? 'Step 2 of 5 · Methodology' : 'Paso 2 de 5 · Metodología',
      title: isEn ? 'The 6 Core Formulation Modules' : 'La Ruta de los 6 Módulos Metodológicos',
      subtitle: isEn
        ? 'Learn, complete challenges, and receive feedback from your lead advisor with automated email alerts.'
        : 'Aprende, completa los desafíos y recibe retroalimentación de tu asesor con alertas automáticas.',
      icon: '📚',
    },
    {
      id: 'spreadsheet',
      badge: isEn ? 'Step 3 of 5 · Financial Modeling' : 'Paso 3 de 5 · Modelación Financiera',
      title: isEn ? '10-Book Business Plan Spreadsheet' : 'Hoja de Cálculo Oficial (10 Libros)',
      subtitle: isEn
        ? 'Automatic financial formulas: Contribution Margin, Break-Even Point, and 12-Month Cashflow.'
        : 'Formulación matemática en tiempo real: Margen, Punto de Equilibrio y Proyecciones a 12 Meses.',
      icon: '📊',
    },
    {
      id: 'advisor',
      badge: isEn ? 'Step 4 of 5 · Guidance & AI' : 'Paso 4 de 5 · Acompañamiento e IA',
      title: isEn ? 'Gemini 3.8 Flash AI Tutor & Advisor Contact' : 'Tutor IA Gemini 3.8 Flash y Asesoría Directa',
      subtitle: isEn
        ? 'Instant AI feedback plus direct advisor support using your Full Name and Ficha ID.'
        : 'Retroalimentación instantánea con IA y consultas directas al asesor con Nombre y Ficha garantizados.',
      icon: '✨',
    },
    {
      id: 'certificates',
      badge: isEn ? 'Step 5 of 5 · Issuance & Graduation' : 'Paso 5 de 5 · Acreditación y Culminación',
      title: isEn ? 'Two Official Printouts & Cloud Retention' : 'Dos Botones de Impresión Oficial y Custodia en la Nube',
      subtitle: isEn
        ? '40-Hour Official Certificate + Formal Business Plan Document with 30-day Drive purge & 1-year custody.'
        : 'Diploma de 40 Horas + Documento Formal con política de 30 días en Drive y 1 año en Sheets.',
      icon: '📜',
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 overflow-y-auto animate-fade-in backdrop-blur-sm">
      <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full border-2 border-emerald-500/50 shadow-2xl overflow-hidden flex flex-col my-4 max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UEDLogo size="sm" variant="badge" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-orange-500 px-2 py-0.5 rounded font-extrabold text-white">
                  {current.badge}
                </span>
                <span className="text-[11px] text-emerald-300 font-mono hidden sm:inline">
                  Ficha: {ficha}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
                {current.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer border border-slate-700 shrink-0"
            title={isEn ? 'Close Guide' : 'Cerrar Guía'}
          >
            ✕
          </button>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="bg-slate-950 px-6 py-2 border-b border-emerald-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-grow max-w-md">
            {steps.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-1 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'bg-gradient-to-r from-orange-500 to-[#39FF14]'
                    : idx < currentStep
                    ? 'bg-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`${st.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span>{currentStep + 1} / {totalSteps}</span>
            <span className="text-slate-500">({Math.round(((currentStep + 1) / totalSteps) * 100)}%)</span>
          </div>
        </div>

        {/* Step Body Container */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-grow bg-slate-900/90 text-slate-200">
          {/* STEP 1: WELCOME & OVERVIEW */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4D7C0F]/20 via-emerald-800/20 to-orange-500/20 border border-[#39FF14]/30 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#4D7C0F] text-white flex items-center justify-center text-3xl shadow-lg border-2 border-[#39FF14] shrink-0">
                  💡
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    {isEn ? `Welcome, ${learnerName}!` : `¡Bienvenido(a), ${learnerName}!`}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {isEn
                      ? 'You are enrolled in the Digital Entrepreneurship Unit (UED) platform. Here you will formulate, validate, and financially project your digital startup to qualify for SENA Fondo Emprender and earn your official 40-hour accreditation.'
                      : 'Estás inscrito en la plataforma oficial de la Unidad de Emprendimiento Digital (UED). Aquí formularás, validarás y proyectarás financieramente tu emprendimiento digital para aspirar al Fondo Emprender del SENA y certificarte en un curso de 40 horas.'}
                  </p>
                </div>
              </div>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-700/40 hover:border-emerald-500 transition-all space-y-2">
                  <div className="text-2xl">📋</div>
                  <h4 className="font-bold text-white text-sm">
                    {isEn ? '1. Methodological Path' : '1. Ruta de 6 Módulos'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Step-by-step guidance from problem validation to legal framework and Pitch Deck.'
                      : 'Paso a paso estructurado desde el problema real y mercado hasta marco legal S.A.S. y Pitch Deck.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-700/40 hover:border-emerald-500 transition-all space-y-2">
                  <div className="text-2xl">📊</div>
                  <h4 className="font-bold text-white text-sm">
                    {isEn ? '2. 10-Book Workbook' : '2. Hoja de Cálculo (10 Libros)'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Live financial modeling: Unit margin, break-even point in units and money, and total Capex/Opex.'
                      : 'Formulación financiera en tiempo real: Margen unitario, punto de equilibrio y proyección de caja.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-700/40 hover:border-emerald-500 transition-all space-y-2">
                  <div className="text-2xl">📜</div>
                  <h4 className="font-bold text-white text-sm">
                    {isEn ? '3. 40h Official Diploma' : '3. Diploma y Plan Formal'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Instant export with dual academic signatures, validation seal, and Google Cloud sync.'
                      : 'Expedición con firmas del Asesor Líder y Coordinador Académico, con sincronización en Google Drive.'}
                  </p>
                </div>
              </div>

              {/* Quick Navigation Action */}
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-between text-xs">
                <span className="text-emerald-300">
                  {isEn ? '💡 Tip: You can reopen this guide anytime from the top hero button.' : '💡 Consejo: Puedes volver a abrir esta guía cuando desees desde el botón en tu portal.'}
                </span>
                <span className="font-mono text-[#39FF14] font-bold">UED SENA 2026</span>
              </div>
            </div>
          )}

          {/* STEP 2: THE 6 MODULES */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs sm:text-sm text-slate-300">
                {isEn
                  ? 'Complete each module in sequence. Your progress is saved in real-time, and every submission notifies your advisor:'
                  : 'Completa cada módulo en secuencia. Tu avance se guarda en tiempo real y cada envío notifica a tu asesor:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { n: 1, name: isEn ? 'Problem & Validation' : 'Identificación y Validación', icon: '🔍', desc: isEn ? 'Target customer, pain point & value prop.' : 'Cliente objetivo, dolor real y propuesta de valor inicial.' },
                  { n: 2, name: isEn ? 'Market Study & 4P' : 'Estudio de Mercado (4P)', icon: '📢', desc: isEn ? 'Product, Price, Place, Promotion and TAM.' : 'Producto, Precio, Plaza, Promoción y competidores.' },
                  { n: 3, name: isEn ? 'Technical Operations' : 'Operación Técnica', icon: '⚙️', desc: isEn ? 'Tech stack, architecture & cloud infrastructure.' : 'Flujo de proceso, arquitectura cloud y capacidades.' },
                  { n: 4, name: isEn ? 'Legal & Tax Framework' : 'Marco Legal y Formalización', icon: '⚖️', desc: isEn ? 'S.A.S. incorporation, DIAN RUT & compliance.' : 'Constitución S.A.S., RUT DIAN, propiedad intelectual.' },
                  { n: 5, name: isEn ? 'Financial Plan & BEP' : 'Plan Financiero & Punto Equilibrio', icon: '💰', desc: isEn ? 'Break-even formulas, unit economics & Capex.' : 'Inversión inicial, costos fijos/variables y proyección.' },
                  { n: 6, name: isEn ? 'Pitch Deck UED' : 'Pitch Deck y Presentación', icon: '🎯', desc: isEn ? 'Structured pitch to defend before the committee.' : 'Estructura de 8 diapositivas para sustentación final.' },
                ].map(m => (
                  <div key={m.n} className="p-3.5 rounded-xl bg-slate-800/90 border border-emerald-800/50 hover:border-[#39FF14]/60 transition-all space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                        {isEn ? `Module ${m.n}` : `Módulo ${m.n}`}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-xs">{m.name}</h4>
                    <p className="text-[11px] text-slate-300 leading-tight">{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* Automated Alert Notification Pill */}
              <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-500/40 flex items-center gap-3 text-xs">
                <span className="text-2xl">🔔</span>
                <div>
                  <strong className="text-orange-400 block font-bold">
                    {isEn ? 'Automatic Completion Alert System:' : 'Sistema de Alertas Automáticas de Culminación:'}
                  </strong>
                  <span className="text-slate-300 text-[11px]">
                    {isEn
                      ? 'When you submit a completed module for review, an alert is automatically dispatched to the Advisor and sent as a copy (CC) to your registered Gmail address.'
                      : 'Cuando envíes un módulo terminado para revisión, se activa una alerta inmediata para avisarle a tu asesor y recibirás copia (CC) automática en tu correo Gmail registrado.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 10-BOOK WORKBOOK WITH LIVE INTERACTIVE SIMULATOR */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-300">
                  {isEn
                    ? 'The workbook coordinates 10 interactive books with real-time financial mathematics. Try modifying the values below:'
                    : 'La plantilla consolida 10 libros interconectados con fórmulas en tiempo real. Prueba interactuar con el simulador:'}
                </p>
                <button
                  type="button"
                  onClick={() => handleJumpToTab('PlanDeNegocios')}
                  className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  {isEn ? 'Open Workbook ➔' : 'Ir a la Hoja de Cálculo ➔'}
                </button>
              </div>

              {/* 10 Books Pill Grid */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  '1. Resumen', '2. Modelo Canvas', '3. Mercado', '4. Operación',
                  '5. Mercadeo (4P)', '6. Inversión', '7. Costos-Precios',
                  '8. Proyección 12M', '9. Indicadores PE', '10. Evaluación UED'
                ].map((b, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-emerald-700/40 text-emerald-300 font-mono">
                    {b}
                  </span>
                ))}
              </div>

              {/* Interactive Mini-Calculator Simulator */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-600/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#39FF14] flex items-center gap-1.5">
                    <span>🧮</span> {isEn ? 'Interactive Formula Simulator' : 'Simulador Interactivo de Fórmulas Financieras'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isEn ? 'Live BEP Engine' : 'Motor Financiero UED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      {isEn ? 'Fixed Costs / Mo (CF):' : 'Costos Fijos Mensuales (CF):'}
                    </label>
                    <input
                      type="number"
                      step="500000"
                      value={demoCf}
                      onChange={e => setDemoCf(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      {isEn ? 'Sale Price (PV):' : 'Precio de Venta Unitario (PV):'}
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={demoPv}
                      onChange={e => setDemoPv(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      {isEn ? 'Variable Cost (CV):' : 'Costo Variable Unitario (CV):'}
                    </label>
                    <input
                      type="number"
                      step="2000"
                      value={demoCv}
                      onChange={e => setDemoCv(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Instant Calculation Output */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-emerald-800/40">
                    <span className="text-[10px] text-slate-400 block">{isEn ? 'Unit Margin' : 'Margen Unitario (PV - CV)'}</span>
                    <strong className="text-emerald-400 font-mono text-sm">${demoMargen.toLocaleString()} COP ({demoMargenPct}%)</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-orange-800/40">
                    <span className="text-[10px] text-slate-400 block">{isEn ? 'BEP in Units' : 'Punto de Equilibrio (Unidades)'}</span>
                    <strong className="text-orange-400 font-mono text-sm">{demoPeUnidades} unid./mes</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-emerald-800/40">
                    <span className="text-[10px] text-slate-400 block">{isEn ? 'BEP in Money' : 'Punto de Equilibrio (Dinero)'}</span>
                    <strong className="text-[#39FF14] font-mono text-sm">${demoPeDinero.toLocaleString()} COP</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADVISOR & GEMINI 3.8 FLASH */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Advisor Consultation Card */}
                <div className="p-4 rounded-2xl bg-slate-800 border border-emerald-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xl shadow">
                      💬
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        {isEn ? 'Direct Advisor Consultation' : 'Consulta Directa al Asesor'}
                      </h4>
                      <span className="text-[10px] text-orange-400 font-bold uppercase font-mono">
                        {isEn ? 'Mandatory Identification' : 'Identificación Obligatoria'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Whenever you submit a query to your advisor, the platform automatically attaches your Full Name and SENA Ficha Number so your advisor can immediately identify and track your progress.'
                      : 'Cuando hagas una consulta al asesor, la plataforma adjunta tu Nombre Completo y Ficha SENA para que el asesor identifique al consultante y responda con trazabilidad.'}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono text-emerald-300">
                    👤 {learnerName} · Ficha: {ficha}
                  </div>
                </div>

                {/* Gemini 3.8 Flash AI Assistant Card */}
                <div className="p-4 rounded-2xl bg-slate-800 border border-orange-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center text-xl shadow">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        {isEn ? 'Gemini 3.8 Flash AI Tutor' : 'Tutor IA Gemini 3.8 Flash'}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono">
                        {isEn ? '24/7 Contextual Assistance' : 'Orientación Contextual 24/7'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Access intelligent brainstorming, value proposition refining, competitive differentiation tips, and rubric scoring feedback directly from your interface.'
                      : 'Recibe ideas de validación, perfeccionamiento de propuesta de valor, sugerencias de precios y retroalimentación pedagógica instantánea en cualquier módulo.'}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono text-orange-300">
                    ⚡ Modelo: Google Gemini 3.8 Flash
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-slate-300">
                {isEn
                  ? '🔒 Privacy & Security: The prototype is guarded by a 9-character secret key known to the administrator to safeguard all institutional deliverables.'
                  : '🔒 Seguridad y Privacidad: La plataforma cuenta con clave secreta de 9 caracteres administrada por el asesor para proteger los datos y proyectos de los aprendices.'}
              </div>
            </div>
          )}

          {/* STEP 5: TWO PRINT BUTTONS & RETENTION CYCLES */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs sm:text-sm text-slate-300">
                {isEn
                  ? 'Once all modules are approved and your workbook is filled out, two official print buttons become available:'
                  : 'Al finalizar los módulos y consolidar tu plan en la hoja de cálculo, se habilitan los dos botones oficiales de expedición:'}
              </p>

              {/* The Two Print Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-[#EA580C] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">📜</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#EA580C] text-white font-bold">
                      {isEn ? 'Button 1' : 'Botón 1'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm">
                    {isEn ? 'Official 40-Hour Diploma' : 'Diploma de Participación (40 Horas)'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Accreditation certificate signed by Advisor Blaise Thorrens and Academic Coordinator Ing. Carlos Arturo Gómez M., with official UED logo and registration code.'
                      : 'Certificado oficial con firmas del Asesor Líder Lic. Blaise Thorrens y el Coordinador Académico Ing. Carlos Arturo Gómez M., con logotipo UED e ID único.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-[#39FF14] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">📑</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#39FF14] text-slate-950 font-black">
                      {isEn ? 'Button 2' : 'Botón 2'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm">
                    {isEn ? 'Formal Business Plan Document' : 'Documento Formal del Plan de Negocios'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Consolidated document across all 10 components with market studies, technical operations, and financial indicators ready for Fondo Emprender submission.'
                      : 'Documento completo estructurado con los 10 componentes, estudio de mercado, plan operativo y fórmulas financieras listo para radicación ante comités evaluadores.'}
                  </p>
                </div>
              </div>

              {/* 30-Day Drive & 1-Year Sheets Retention Policy Notice */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-600/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <strong className="text-sm font-bold text-white">
                    {isEn ? 'Google Apps Script Sync & Retention Policy' : 'Sincronización Google Apps Script & Ciclos de Retención'}
                  </strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-orange-500/30">
                    <span className="font-bold text-orange-400 block mb-0.5">
                      {isEn ? 'Drive Files: 30-Day Lifecycle' : 'Archivos en Drive: Ciclo de 30 Días'}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {isEn
                        ? 'PDF files generated in Google Drive have an automated 30-day lifecycle with permanent purge (Code.gs daily at 02:00 AM).'
                        : 'Los PDFs expedidos tienen una vigencia de 30 días para descarga con borrado permanente automatizado vía Apps Script diario a las 02:00 AM.'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <span className="font-bold text-[#39FF14] block mb-0.5">
                      {isEn ? 'Master Repository: 1 Year (365 Days)' : 'Repositorio en Sheets: 1 Año (365 Días)'}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {isEn
                        ? 'All participant records remain registered in Google Sheets for a full year for audit and verification purposes.'
                        : 'El registro consolidado de cada participante permanece en Google Sheets durante 1 año para verificación y auditorías.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-emerald-900/80 flex flex-wrap items-center justify-between gap-3">
          {/* Checkbox: Don't show again automatically */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500 bg-slate-900"
            />
            <span>
              {isEn ? "Don't show this guide automatically on login" : 'No mostrar este tutorial automáticamente al iniciar sesión'}
            </span>
          </label>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2.5 ml-auto">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {isEn ? '⬅ Previous' : '⬅ Anterior'}
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? 'Next' : 'Siguiente'}</span>
                <span>➔</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#39FF14] to-[#22C55E] hover:from-[#22c55e] hover:to-[#16a34a] text-slate-950 text-xs font-black shadow-lg transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
              >
                <span>🚀</span>
                <span>{isEn ? 'Start My Business Plan!' : '¡Comenzar mi Plan de Negocios!'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
