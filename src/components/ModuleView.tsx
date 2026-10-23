import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { evaluateModuleWithGemini, generatePitchWithGemini, EvaluationResult } from '../services/geminiService';
import GeminiAdvisorModal from './GeminiAdvisorModal';
import AdvisorConsultationModal from './AdvisorConsultationModal';

interface ModuleConfig {
  number: number;
  title: string;
  subtitle: string;
  guideText: string;
  challengeTitle: string;
  challengePrompt: string;
  spreadsheetFields: Array<{ key: string; label: string; placeholder: string; isNumeric?: boolean }>;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

const MODULES_CONFIG: Record<number, ModuleConfig> = {
  1: {
    number: 1,
    title: 'Identificación y Validación del Problema',
    subtitle: 'Define el dolor del cliente, tu segmento y la propuesta de valor inicial',
    guideText: 'Todo gran emprendimiento digital nace de resolver un problema real y doloroso para un grupo específico de personas. En esta etapa debes identificar con claridad quién es tu cliente ideal (Early Adopter) y validar si el problema es urgente y frecuente.',
    challengeTitle: 'Desafío: Mapa de Empatía y Validación del Problema',
    challengePrompt: 'Describe en 2-3 párrafos: ¿Quién es tu cliente objetivo? ¿Cuál es su mayor frustración actual? ¿Cómo intentan resolverlo hoy sin tu solución?',
    spreadsheetFields: [
      { key: 'cliente_objetivo', label: 'Segmento de Cliente Objetivo', placeholder: 'Ej: Microempresarios gastronómicos en Bogotá' },
      { key: 'problema_central', label: 'Problema / Frustración Detectada', placeholder: 'Ej: Pérdida del 30% en pedidos por falta de software ágil' },
      { key: 'propuesta_valor', label: 'Propuesta de Valor Inicial', placeholder: 'Ej: Plataforma SaaS de gestión de pedidos en 3 clics' },
      { key: 'tamano_mercado', label: 'Tamaño de Mercado Estimado (Clientes)', placeholder: '1500', isNumeric: true },
    ],
    quizQuestions: [
      {
        question: '¿Qué caracteriza a un "Early Adopter" en negocios digitales?',
        options: ['Busca el precio más bajo del mercado', 'Tiene el problema, es consciente de él y busca resolverlo activamente', 'Solo compra marcas consolidadas', 'Espera a que todos sus colegas lo prueben primero'],
        correctIndex: 1,
        explanation: 'Los Early Adopters sienten el dolor intensamente y están dispuestos a usar soluciones en etapa temprana.',
      },
      {
        question: '¿Cuál es el objetivo principal de una entrevista de validación de problema?',
        options: ['Vender inmediatamente el producto', 'Escuchar las experiencias pasadas y hábitos reales del cliente', 'Convencer al cliente de que tu idea es perfecta', 'Pedirle su tarjeta de crédito'],
        correctIndex: 1,
        explanation: 'La validación busca descubrir hechos y comportamientos pasados, no vender promesas futuras.',
      },
      {
        question: 'Una propuesta de valor efectiva debe centrarse principalmente en:',
        options: ['La lista exhaustiva de especificaciones técnicas', 'Los beneficios y transformaciones tangibles para el cliente', 'El logotipo y nombre comercial', 'El número de horas trabajadas'],
        correctIndex: 1,
        explanation: 'Los clientes no compran características, compran soluciones y resultados que mejoran su vida o negocio.',
      },
    ],
  },
  2: {
    number: 2,
    title: 'Estudio de Mercado y Estrategia Comercial',
    subtitle: 'Análisis de competencia, mezcla de mercadeo (4P) y canales de captación',
    guideText: 'Analiza a tus competidores directos e indirectos para identificar tu factor diferenciador. Define tu estrategia de producto, precio, plaza (canales de distribución) y promoción digital para captar clientes con el menor costo posible.',
    challengeTitle: 'Desafío: Matriz de Diferenciación y Canales',
    challengePrompt: 'Detalla cómo te diferenciarás de los 2 competidores más fuertes y cuál será tu canal principal de ventas (ej: Redes Sociales, Ventas B2B, Google Ads, Alianzas).',
    spreadsheetFields: [
      { key: 'competidores_directos', label: 'Competidores Directos', placeholder: 'Ej: App X, Empresa Y' },
      { key: 'ventaja_diferencial', label: 'Ventaja Competitiva Única', placeholder: 'Ej: Inteligencia artificial integrada y soporte en español 24/7' },
      { key: 'canal_adquisicion', label: 'Canal Principal de Adquisición', placeholder: 'Ej: Estrategia de Inbound Marketing + WhatsApp Business' },
      { key: 'presupuesto_mercadeo', label: 'Presupuesto Inicial de Mercadeo ($ COP)', placeholder: '500000', isNumeric: true },
    ],
    quizQuestions: [
      {
        question: '¿Qué significa CAC en el contexto comercial digital?',
        options: ['Costo Anual de Comercio', 'Costo de Adquisición de Clientes', 'Capacidad de Atención Continua', 'Control de Acceso a Clientes'],
        correctIndex: 1,
        explanation: 'El CAC es la inversión total en ventas y mercadeo dividida entre el número de clientes nuevos ganados.',
      },
      {
        question: 'En la mezcla de mercadeo digital (4P), la "Plaza" se refiere a:',
        options: ['El parque de la ciudad donde se reparte publicidad', 'Los puntos y plataformas donde el cliente interactúa y adquiere la solución', 'El precio con descuento', 'El diseño del empaque físico'],
        correctIndex: 1,
        explanation: 'Plaza comprende los canales digitales, tiendas online, pasarelas de pago y medios de entrega del servicio.',
      },
      {
        question: 'Un competidor indirecto es aquel que:',
        options: ['Ofrece exactamente el mismo producto al mismo precio', 'Satisface la misma necesidad del cliente pero con un producto o método diferente', 'No tiene clientes en la misma región', 'Vende productos para otra industria'],
        correctIndex: 1,
        explanation: 'Por ejemplo, para una plataforma de streaming, los videojuegos o el cine son competidores indirectos del ocio.',
      },
    ],
  },
  3: {
    number: 3,
    title: 'Operación y Aspectos Técnicos',
    subtitle: 'Flujo de procesos, infraestructura tecnológica y requerimientos de insumos',
    guideText: 'Determina la arquitectura operativa de tu solución: servidores, licencias de software, herramientas tecnológicas, pasarelas de pago, soporte al cliente y la capacidad de atención mensual garantizando altos estándares de calidad.',
    challengeTitle: 'Desafío: Flujo de Entrega del Servicio / Producto',
    challengePrompt: 'Mapea el paso a paso desde que un usuario ingresa a tu plataforma hasta que recibe el servicio o producto final y se mide su satisfacción.',
    spreadsheetFields: [
      { key: 'infraestructura_tech', label: 'Infraestructura Tecnológica Requerida', placeholder: 'Ej: Hosting Cloud, Base de datos, API de Pagos, Dominio' },
      { key: 'tiempo_entrega', label: 'Tiempo de Entrega / Onboarding (Horas/Días)', placeholder: '2 horas' },
      { key: 'capacidad_mensual', label: 'Capacidad Máxima Mensual (Usuarios/Pedidos)', placeholder: '200', isNumeric: true },
      { key: 'costo_software_mensual', label: 'Costo Mensual de Herramientas ($ COP)', placeholder: '180000', isNumeric: true },
    ],
    quizQuestions: [
      {
        question: '¿Cuál es el beneficio de definir un Producto Mínimo Viable (PMV/MVP) en la operación inicial?',
        options: ['Gastar todo el presupuesto en infraestructura sobredimensionada', 'Lanzar rápido para aprender del mercado con los menores recursos posibles', 'Evitar hablar con clientes durante el primer año', 'Contratar inmediatamente 50 empleados'],
        correctIndex: 1,
        explanation: 'El PMV permite validar hipótesis técnicas y operativas con clientes reales sin incurrir en costos desmedidos.',
      },
      {
        question: '¿Qué es un SLA (Service Level Agreement) en operaciones de servicios digitales?',
        options: ['Un impuesto gubernamental', 'Un acuerdo que define los tiempos y calidad de respuesta garantizados al cliente', 'Un lenguaje de programación', 'Una estrategia de SEO'],
        correctIndex: 1,
        explanation: 'El SLA compromete los tiempos de disponibilidad y resolución de incidencias para asegurar la satisfacción.',
      },
      {
        question: 'En un negocio digital, ¿cuál de los siguientes es un costo de operación tecnológico?',
        options: ['Servidores en la nube (AWS/GCP), dominios y licencias SaaS', 'Pintura de las oficinas', 'Uniforme de gala', 'Tarjetas de presentación impresas'],
        correctIndex: 0,
        explanation: 'Los costos cloud y suscripciones de software son pilares del engranaje técnico digital.',
      },
    ],
  },
  4: {
    number: 4,
    title: 'Organización, Talento Humano y Aspectos Legales',
    subtitle: 'Roles clave, equipo ejecutor y formalización jurídica (SAS / Persona Natural)',
    guideText: 'Un negocio es tan sólido como el equipo que lo respalda. Define las funciones clave (tecnología, comercial, operaciones), la estructura de remuneración y el marco normativo legal aplicable en Colombia (ej. protección de datos ley 1581 y registro ante Cámara de Comercio).',
    challengeTitle: 'Desafío: Organigrama y Formalización Empresarial',
    challengePrompt: 'Define los roles indispensables para el primer año, cómo se distribuirán las responsabilidades y qué tipo societario (ej: S.A.S.) elegirás para registrar tu empresa.',
    spreadsheetFields: [
      { key: 'rol_lider', label: 'Líder / CEO y Responsabilidades', placeholder: 'Ej: Gestión estratégica y desarrollo de negocio' },
      { key: 'rol_tecnico', label: 'Responsable Técnico / Producto', placeholder: 'Ej: Desarrollo web y soporte de plataforma' },
      { key: 'tipo_formalizacion', label: 'Tipo de Formalización Jurídica', placeholder: 'Ej: Sociedad por Acciones Simplificada (S.A.S.)' },
      { key: 'gasto_nomina_mensual', label: 'Presupuesto Nómina/Honorarios ($ COP)', placeholder: '2600000', isNumeric: true },
    ],
    quizQuestions: [
      {
        question: '¿Por qué la figura de S.A.S. (Sociedad por Acciones Simplificada) es la más utilizada en Colombia para startups?',
        options: ['Porque exige mínimo 20 socios fundadores', 'Por su flexibilidad estatutaria, limitación de responsabilidad al capital y posibilidad de accionista único', 'Porque está exenta de pagar cualquier tributo de por vida', 'Porque no requiere NIT'],
        correctIndex: 1,
        explanation: 'La S.A.S. permite constituirse con 1 o más personas y protege el patrimonio personal de los socios.',
      },
      {
        question: 'En Colombia, la Ley 1581 de 2012 regula:',
        options: ['El código de tránsito nacional', 'El régimen de protección y tratamiento de datos personales (Habeas Data)', 'La exportación de café', 'La contratación de artistas'],
        correctIndex: 1,
        explanation: 'Toda plataforma digital debe contar con política clara y autorizada de tratamiento de datos personales.',
      },
      {
        question: '¿Qué es un acuerdo de confidencialidad y propiedad intelectual (NDA / IP Assignment) con el equipo?',
        options: ['Una carta de recomendación laboral', 'Un documento legal que asegura que el código y creaciones pertenezcan a la empresa', 'Un recibo de caja menor', 'Un certificado de estudio'],
        correctIndex: 1,
        explanation: 'Garantiza que los desarrollos e invenciones creados para el proyecto sean patrimonio de la sociedad.',
      },
    ],
  },
  5: {
    number: 5,
    title: 'Plan Financiero y Evaluación Económica',
    subtitle: 'Costos fijos, costos variables, punto de equilibrio y proyección de viabilidad',
    guideText: 'El modelo financiero demuestra la sostenibilidad de tu negocio. Ingresa tus costos fijos mensuales, costos variables por unidad y precio de venta. La hoja calculará automáticamente el Punto de Equilibrio en unidades e ingresos requeridos.',
    challengeTitle: 'Desafío: Simulación del Modelo Financiero',
    challengePrompt: 'Explica tu estrategia de monetización (suscripción mensual, comisión por transacción o venta directa) y cómo alcanzarás el volumen de ventas necesario para superar el punto de equilibrio.',
    spreadsheetFields: [
      { key: 'costos_fijos', label: 'Costos Fijos Mensuales ($ COP)', placeholder: '1500000', isNumeric: true },
      { key: 'costos_variables', label: 'Costo Variable por Unidad/Servicio ($ COP)', placeholder: '25000', isNumeric: true },
      { key: 'precio_venta', label: 'Precio de Venta Unitario ($ COP)', placeholder: '75000', isNumeric: true },
      { key: 'inversion_inicial', label: 'Inversión Inicial Requerida ($ COP)', placeholder: '5000000', isNumeric: true },
    ],
    quizQuestions: [
      {
        question: '¿Qué indica el "Punto de Equilibrio" en la evaluación financiera?',
        options: ['El momento en que el negocio obtiene su máxima rentabilidad', 'El nivel de ventas donde los ingresos totales cubren exactamente la suma de costos fijos y variables (utilidad = 0)', 'La fecha límite para pagar a los proveedores', 'El saldo total en la cuenta bancaria'],
        correctIndex: 1,
        explanation: 'En el punto de equilibrio la empresa no gana ni pierde; a partir de allí cada unidad genera ganancia neta.',
      },
      {
        question: 'Si los Costos Fijos son $1.000.000, el Precio es $50.000 y el Costo Variable es $25.000, ¿cuál es el Punto de Equilibrio?',
        options: ['10 unidades', '25 unidades', '40 unidades ($1.000.000 / $25.000)', '100 unidades'],
        correctIndex: 2,
        explanation: 'Fórmula: Costos Fijos / (Precio - Costo Variable) = 1.000.000 / 25.000 = 40 unidades.',
      },
      {
        question: 'El "Margen de Contribución Unitario" se calcula como:',
        options: ['Precio de Venta multiplicado por las Ventas Totales', 'Precio de Venta menos Costo Variable Unitario', 'Costos Fijos dividido entre la Tasa de Interés', 'Utilidad Neta más Impuestos'],
        correctIndex: 1,
        explanation: 'El margen de contribución es lo que cada unidad vendida aporta para cubrir los costos fijos y generar utilidades.',
      },
    ],
  },
  6: {
    number: 6,
    title: 'Pitch de Negocio y Resumen Ejecutivo',
    subtitle: 'Pitch Deck de 3 minutos, resumen ejecutivo estructurado y preparación ante el comité',
    guideText: 'Comunica tu visión con contundencia. El Pitch Deck de 3 minutos debe cautivar en 30 segundos con un hook impactante, demostrar la necesidad del mercado, exponer tu solución y terminar con un llamado a la acción claro.',
    challengeTitle: 'Desafío: Redacción del Pitch de 3 Minutos',
    challengePrompt: 'Redacta los 5 bloques de tu pitch: 1. Gancho inicial (Hook), 2. Problema, 3. Solución y Demostración, 4. Tracción y Modelo de Negocio, 5. El Pedido o Llamado a la Acción.',
    spreadsheetFields: [
      { key: 'pitch_hook', label: 'Gancho Inicial (Primeros 15 segundos)', placeholder: 'Ej: ¿Sabías que el 80% de los negocios pierden clientes por...?' },
      { key: 'pitch_solucion', label: 'Solución en Una Frase', placeholder: 'Ej: Creamos el copiloto digital que automatiza...' },
      { key: 'pitch_traccion', label: 'Métrica Clave / Tracción Inicial', placeholder: 'Ej: 15 clientes pilotos y 95% de satisfacción' },
      { key: 'pitch_pedido', label: 'Llamado a la Acción / Pedido', placeholder: 'Ej: Buscamos $20 millones de capital semilla para escalar...' },
    ],
    quizQuestions: [
      {
        question: '¿Cuál es el error más común en un pitch de 3 minutos ante jurados o inversores?',
        options: ['Explicar con claridad el modelo de ingresos', 'Perder 2 minutos detallando características técnicas sin explicar el valor ni el mercado', 'Presentar al equipo fundador', 'Decir cuánto dinero necesitan'],
        correctIndex: 1,
        explanation: 'El pitch debe enfocarse en el problema, la solución, el mercado y la tracción, no en código o jerga técnica.',
      },
      {
        question: 'El Resumen Ejecutivo (Executive Summary) de un plan de negocios debe:',
        options: ['Tener al menos 50 páginas de extensión técnica', 'Sintetizar en 1-2 páginas los aspectos clave de mercado, operación, finanzas y propuesta de valor', 'Omitir las cifras financieras', 'Ser un borrador sin formato'],
        correctIndex: 1,
        explanation: 'Debe ser un documento conciso, atractivo y auto-conclusivo para que cualquier evaluador entienda el negocio en 5 minutos.',
      },
      {
        question: 'Al finalizar un pitch ante el comité UED / Fondo Emprender, siempre debes incluir:',
        options: ['Un chiste personal', 'Un "Ask" o llamado a la acción claro (qué buscas: aprobación, capital, mentoría o clientes)', 'Una disculpa por los nervios', 'La historia de la infancia del fundador'],
        correctIndex: 1,
        explanation: 'Todo pitch concluye con una petición concreta (The Ask) y los datos de contacto directos.',
      },
    ],
  },
};

export default function ModuleView({ moduleId, onBack }: { moduleId: number; onBack: () => void }) {
  const { user } = useAuth();
  const { learners, updateLearnerModule } = useData();
  const learner = learners.find(l => l.id === user?.id);

  const config = MODULES_CONFIG[moduleId] || MODULES_CONFIG[1];

  // Answers & spreadsheet state
  const [answers, setAnswers] = useState<Record<string, string>>(learner?.moduleAnswers?.[moduleId] || {});
  const [saved, setSaved] = useState(false);

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Gemini 3.8 Flash Evaluator & AI Tutor state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  // Auto-save debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (user) {
        updateLearnerModule(user.id, moduleId, learner?.moduleStatus?.[moduleId] || 'pending', answers);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [answers, user, moduleId]);

  // Completion & Incomplete Alert Modals
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);
  const [incompleteItems, setIncompleteItems] = useState<string[]>([]);
  const [showCulminationModal, setShowCulminationModal] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Real-time financial break-even calculation for Module 5
  const fixedCosts = parseFloat(answers['costos_fijos'] || '0');
  const variableCosts = parseFloat(answers['costos_variables'] || '0');
  const salePrice = parseFloat(answers['precio_venta'] || '0');
  const initialInv = parseFloat(answers['inversion_inicial'] || '0');

  const unitMargin = salePrice > variableCosts ? salePrice - variableCosts : 0;
  const breakEvenUnits = unitMargin > 0 ? Math.ceil(fixedCosts / unitMargin) : 0;
  const breakEvenMoney = breakEvenUnits * salePrice;

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const getQuizScore = () => {
    let correct = 0;
    config.quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });
    return Math.round((correct / config.quizQuestions.length) * 5 * 10) / 10;
  };

  // Evaluate with Gemini 3.8 Flash
  const handleEvaluateWithGemini = async () => {
    setIsEvaluating(true);
    try {
      const result = await evaluateModuleWithGemini(
        moduleId,
        config.title,
        answers,
        learner?.name || 'Aprendiz'
      );
      setEvalResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate Pitch Deck with Gemini (Module 6)
  const handleGeneratePitchWithGemini = async () => {
    setIsGeneratingPitch(true);
    try {
      const pitch = await generatePitchWithGemini(
        learner?.moduleAnswers || {},
        answers['pitch_solucion'] || 'Proyecto UED',
        answers['problema_central'] || 'Problema de validación',
        answers['propuesta_valor'] || answers['pitch_solucion'] || 'Propuesta de valor'
      );
      setGeneratedPitch(pitch);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Formal Submission to Advisor & Completeness Validation
  const handleSubmitToAdvisor = () => {
    const missing: string[] = [];

    // 1. Practical challenge validation
    if (!answers['desafio'] || answers['desafio'].trim().length < 20) {
      missing.push('Desafío Práctico: Falta redactar la solución al reto (mínimo 20 caracteres).');
    }

    // 2. Spreadsheet interactive fields validation
    config.spreadsheetFields.forEach(field => {
      const val = answers[field.key];
      if (!val || val.trim() === '') {
        missing.push(`Hoja de Cálculo: Campo obligatorio "${field.label}" sin diligenciar.`);
      }
    });

    // 3. Knowledge Quiz validation
    const totalQuestions = config.quizQuestions.length;
    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < totalQuestions) {
      missing.push(`Quiz de Conocimiento: Faltan responder ${totalQuestions - answeredCount} de las ${totalQuestions} preguntas evaluativas.`);
    }

    // If incomplete: activate alert modal for learner informing what is missing
    if (missing.length > 0) {
      setIncompleteItems(missing);
      setShowIncompleteAlert(true);
      return;
    }

    // If completely filled: The module is CULMINATED!
    if (user) {
      const statusToSet: 'approved' | 'in-review' | 'pending' =
        evalResult?.status === 'approved'
          ? 'approved'
          : 'in-review';
      updateLearnerModule(user.id, moduleId, statusToSet, answers);
      setShowCulminationModal(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm">
        <button
          onClick={onBack}
          className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-semibold text-sm flex items-center gap-1.5"
        >
          <span>← Volver a lista de módulos</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {saved && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-medium animate-pulse flex items-center gap-1">
              <span>✓</span> Guardado automático
            </span>
          )}

          {/* Direct Consultation to Advisor with Name and Ficha */}
          <button
            onClick={() => setIsConsultModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow flex items-center gap-1.5 transition-all"
            title="Escribir al asesor identificando tu nombre y ficha"
          >
            <span>💬 Consultar al Asesor</span>
          </button>

          {/* AI Tutor Assistant Trigger */}
          <button
            onClick={() => setIsAdvisorOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow flex items-center gap-1.5 transition-all"
          >
            <span>✨ Tutor Gemini 3.8 Flash</span>
          </button>
        </div>
      </div>

      {/* Module Title Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-mono tracking-wider bg-orange-500 px-2 py-0.5 rounded font-bold">
            Módulo {config.number} de 6
          </span>
          <span className="text-xs text-emerald-200">Unidad de Emprendimiento Digital</span>
        </div>
        <h2 className="text-2xl font-bold">{config.title}</h2>
        <p className="text-sm text-emerald-100 mt-1">{config.subtitle}</p>
      </div>

      {/* Main Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Conceptual Guide, Interactive Form & Spreadsheet */}
        <div className="lg:col-span-7 space-y-6">
          {/* Guide Card */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100 mb-2 flex items-center gap-2">
              <span>📖</span> Guía Conceptual del Módulo
            </h3>
            <p className="text-sm text-slate-700 dark:text-emerald-200 leading-relaxed">
              {config.guideText}
            </p>
          </div>

          {/* Spreadsheet-Style Table Component */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <span>📊</span> Hoja de Cálculo Interactiva del Módulo
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-400">
                  Diligencia cada parámetro para estructurar tu entregable
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-mono">
                Auto-sync
              </span>
            </div>

            <div className="border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-sm">
                <thead className="bg-emerald-100/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800">
                  <tr>
                    <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider w-2/5">
                      Variable / Concepto
                    </th>
                    <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">
                      Valor / Definición
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60 bg-white dark:bg-emerald-900/20">
                  {config.spreadsheetFields.map(field => (
                    <tr key={field.key} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                      <td className="p-3 font-medium text-emerald-950 dark:text-emerald-200 align-top">
                        {field.label}
                      </td>
                      <td className="p-2">
                        <input
                          type={field.isNumeric ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          value={answers[field.key] || ''}
                          onChange={e => setAnswers({ ...answers, [field.key]: e.target.value })}
                          className="w-full p-2 text-sm rounded-lg border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Special Real-Time Calculation for Module 5 (Plan Financiero) */}
              {moduleId === 5 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border-t border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-100">
                    <span>💡 RESULTADOS FINANCIEROS EN TIEMPO REAL:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-mono">Fórmula PE = CF / (P - CV)</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700">
                      <span className="text-slate-500 dark:text-emerald-400 block">Margen Unitario:</span>
                      <strong className="text-base text-emerald-800 dark:text-emerald-200">
                        ${unitMargin.toLocaleString('es-CO')} COP
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700">
                      <span className="text-slate-500 dark:text-emerald-400 block">Punto Equilibrio (Unidades):</span>
                      <strong className="text-base text-orange-600 dark:text-orange-400">
                        {breakEvenUnits > 0 ? `${breakEvenUnits} unid/mes` : 'Ingresa costos y precio'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 col-span-2 md:col-span-1">
                      <span className="text-slate-500 dark:text-emerald-400 block">Facturación Mínima:</span>
                      <strong className="text-base text-emerald-700 dark:text-emerald-300">
                        ${breakEvenMoney.toLocaleString('es-CO')} COP
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Practical Challenge */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <span>🎯</span> {config.challengeTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-emerald-300">
              {config.challengePrompt}
            </p>
            <textarea
              placeholder="Redacta aquí tu solución detallada al desafío práctico..."
              value={answers['desafio'] || ''}
              onChange={e => setAnswers({ ...answers, desafio: e.target.value })}
              className="w-full h-36 p-3 text-sm rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Pitch Deck Generator for Module 6 */}
          {moduleId === 6 && (
            <div className="p-6 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-orange-950 dark:text-orange-200 flex items-center gap-2">
                    <span>⚡</span> Generador de Pitch Deck con Gemini 3.8 Flash
                  </h4>
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    Sintetiza tus 6 módulos en un guión de 3 minutos y un resumen ejecutivo formal
                  </p>
                </div>
                <button
                  onClick={handleGeneratePitchWithGemini}
                  disabled={isGeneratingPitch}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md disabled:opacity-50"
                >
                  {isGeneratingPitch ? 'Gemini 3.8 Flash creando...' : 'Crear Pitch con IA'}
                </button>
              </div>

              {generatedPitch && (
                <div className="p-4 rounded-xl bg-white dark:bg-emerald-950 border border-orange-300 dark:border-orange-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {generatedPitch}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Zone: Quiz Evaluation, Rubric & Gemini 3.8 Flash Auditor */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Quiz Card */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <span>📝</span> Quiz de Conocimiento (3 Preguntas)
              </h3>
              {quizSubmitted && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                  Nota: {getQuizScore()} / 5.0
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {config.quizQuestions.map((q, qIndex) => {
                const selected = quizAnswers[qIndex];
                const isAnswered = selected !== undefined;
                const isCorrect = isAnswered && selected === q.correctIndex;

                return (
                  <div
                    key={qIndex}
                    className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/40 space-y-2.5"
                  >
                    <p className="font-semibold text-slate-900 dark:text-emerald-100">
                      {qIndex + 1}. {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selected === optIndex
                              ? 'bg-emerald-200/70 dark:bg-emerald-800 font-medium text-emerald-950 dark:text-white'
                              : 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 text-slate-700 dark:text-emerald-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${qIndex}`}
                            checked={selected === optIndex}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qIndex]: optIndex })}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`p-2 rounded-md text-[11px] ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                        }`}
                      >
                        <strong>{isCorrect ? '✓ Correcto:' : '✕ Retroalimentación:'}</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow transition-all"
              >
                Validar Respuestas del Quiz
              </button>
            ) : (
              <button
                onClick={() => setQuizSubmitted(false)}
                className="w-full py-2 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900"
              >
                Volver a intentar el Quiz
              </button>
            )}
          </div>

          {/* Gemini 3.8 Flash AI Rubric & Evaluator */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <span>✨</span> Rúbrica de Evaluación con Gemini 3.8 Flash
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-400">
                  Auditoría inteligente del plan según estándares SENA UED
                </p>
              </div>
            </div>

            <button
              onClick={handleEvaluateWithGemini}
              disabled={isEvaluating}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow flex items-center justify-center gap-2 transition-all"
            >
              <span>{isEvaluating ? 'Gemini 3.8 Flash evaluando...' : '🔍 Auditar Módulo con Gemini 3.8 Flash'}</span>
            </button>

            {evalResult && (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">
                    Calificación Asistida por IA:
                  </span>
                  <span
                    className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-full ${
                      evalResult.score >= 3.8
                        ? 'bg-emerald-200 text-emerald-900'
                        : evalResult.score >= 3.0
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-red-200 text-red-900'
                    }`}
                  >
                    {evalResult.score} / 5.0 ({evalResult.status.toUpperCase()})
                  </span>
                </div>

                <p className="text-slate-700 dark:text-emerald-200 italic">
                  "{evalResult.summary}"
                </p>

                {/* Rubric Breakdown */}
                <div className="space-y-1 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200 block text-[11px]">
                    Desglose de Rúbrica (Ponderación 20% cada una):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="flex justify-between bg-white dark:bg-emerald-900 p-1.5 rounded border border-emerald-100">
                      <span>Innovación (20%):</span>
                      <strong>{evalResult.rubricBreakdown?.innovation || 4.0}</strong>
                    </div>
                    <div className="flex justify-between bg-white dark:bg-emerald-900 p-1.5 rounded border border-emerald-100">
                      <span>Mercado (20%):</span>
                      <strong>{evalResult.rubricBreakdown?.market || 4.0}</strong>
                    </div>
                    <div className="flex justify-between bg-white dark:bg-emerald-900 p-1.5 rounded border border-emerald-100">
                      <span>Operación (20%):</span>
                      <strong>{evalResult.rubricBreakdown?.technical || 4.0}</strong>
                    </div>
                    <div className="flex justify-between bg-white dark:bg-emerald-900 p-1.5 rounded border border-emerald-100">
                      <span>Finanzas (20%):</span>
                      <strong>{evalResult.rubricBreakdown?.finance || 4.0}</strong>
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                {evalResult.strengths?.length > 0 && (
                  <div className="pt-2">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">Fortalezas:</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-emerald-300">
                      {evalResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Final Submit Button */}
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
              ¿Listo para revisión final?
            </h4>
            <p className="text-xs text-slate-500 dark:text-emerald-400">
              Se enviará notificación automática a tu asesor con los datos de tu ficha y el resumen de tu módulo.
            </p>
            <button
              onClick={handleSubmitToAdvisor}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 Enviar a Revisión del Asesor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gemini 3.8 Flash AI Advisor Modal */}
      <GeminiAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        moduleNumber={moduleId}
        moduleName={config.title}
        currentPlan={answers}
        learnerName={learner?.name || user?.name || 'Aprendiz'}
      />

      {/* Advisor Consultation Modal with mandatory Name and Ficha */}
      <AdvisorConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        defaultName={learner?.name || user?.name || ''}
        defaultFicha={learner?.ficha || ''}
        defaultProgram={learner?.program || ''}
        defaultModuleNumber={moduleId}
        defaultModuleName={config.title}
      />

      {/* ALERTA DE MÓDULO INCOMPLETO */}
      {showIncompleteAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-lg w-full border border-amber-300 dark:border-amber-700 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                  Módulo Incompleto
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Aún faltan entregables para culminar
                </h3>
                <p className="text-xs text-slate-600 dark:text-emerald-300">
                  Antes de enviar a revisión del asesor y notificar la culminación, debes completar todos los requerimientos obligatorios del <strong>Módulo {moduleId}: {config.title}</strong>:
                </p>
              </div>
            </div>

            {/* Checklist of missing items */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Entregables pendientes por diligenciar ({incompleteItems.length}):
              </p>
              <ul className="space-y-2 text-xs">
                {incompleteItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-amber-950 dark:text-amber-100">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-emerald-400">
              💡 <em>Consejo UED:</em> Si tienes dudas técnicas sobre cómo responder algún punto, puedes usar el <strong>Tutor Virtual Gemini 3.8 Flash</strong> o enviar una consulta directa al asesor indicando tu nombre y ficha.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => setShowIncompleteAlert(false)}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center justify-center gap-2"
              >
                <span>✏️ Continuar Diligenciando Módulo</span>
              </button>
              <button
                onClick={() => {
                  setShowIncompleteAlert(false);
                  setIsConsultModalOpen(true);
                }}
                className="py-2.5 px-4 bg-slate-100 dark:bg-emerald-900 hover:bg-slate-200 dark:hover:bg-emerald-800 text-slate-800 dark:text-emerald-100 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>💬 Consultar al Asesor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA DE CULMINACIÓN EXITOSA CON ENVÍO AL ASESOR Y AL GMAIL DEL APRENDIZ */}
      {showCulminationModal && (() => {
        const learnerEmail = learner?.email || user?.email || 'aprendiz.sena@gmail.com';
        const advisorEmail = 'blaisethorrens@gmail.com';
        const advisorWhatsapp = '573147873570';
        const learnerName = learner?.name || user?.name || 'Aprendiz UED';
        const learnerFicha = learner?.ficha || '2845612';
        const learnerProgram = learner?.program || 'Tecnología en Análisis y Desarrollo de Software';

        const emailSubject = `[UED CULMINACIÓN] Módulo ${moduleId} Culminado - Ficha ${learnerFicha} - ${learnerName}`;
        const emailBody = `ALERTA OFICIAL DE CULMINACIÓN DE MÓDULO - UNIDAD DE EMPRENDIMIENTO DIGITAL (UED)

Estimado Asesor Blaiseth Torrens y Estimado(a) Aprendiz ${learnerName}:

Se confirma que el aprendiz ha culminado satisfactoriamente los entregables del Módulo ${moduleId} en la plataforma UED y ha sido enviado a revisión oficial.

==================================================
📌 IDENTIFICACIÓN DEL APRENDIZ
• Nombre Completo: ${learnerName}
• Número de Ficha: ${learnerFicha}
• Correo Gmail del Aprendiz: ${learnerEmail}
• WhatsApp Aprendiz: ${learner?.whatsapp || '573147873570'}
• Programa de Formación: ${learnerProgram}
• Centro: ${learner?.center || 'Centro de Formación SENA'}

📋 DETALLE DEL MÓDULO CULMINADO
• Módulo: Módulo ${moduleId}: ${config.title}
• Desafío Práctico: Completado (${answers['desafio']?.slice(0, 150)}...)
• Hoja de Cálculo Interactiva: Todos los campos financieros y técnicos diligenciados
• Quiz de Conocimiento: ${getQuizScore()} / 5.0
${evalResult ? `• Pre-evaluación IA Gemini 3.8 Flash: ${evalResult.score}/5.0 (${evalResult.status.toUpperCase()})` : ''}

🔗 ESTADO EN PLATAFORMA:
Estado actual: 'EN REVISIÓN'
Fecha de Culminación: ${new Date().toLocaleString('es-CO')}
==================================================

Esta notificación fue enviada simultáneamente al Asesor (${advisorEmail}) y con copia oficial al Gmail del aprendiz (${learnerEmail}).`;

        const whatsappMessage = `*¡MÓDULO CULMINADO Y ENVIADO A REVISIÓN! - UED*
👤 *Aprendiz:* ${learnerName}
📋 *Ficha:* ${learnerFicha}
📧 *Gmail Aprendiz:* ${learnerEmail}
🎓 *Programa:* ${learnerProgram}
📌 *Módulo:* Módulo ${moduleId}: ${config.title}
📝 *Quiz:* ${getQuizScore()}/5.0

✅ He completado el 100% de los requerimientos (desafío práctico, hoja de cálculo interactiva y evaluación). Se ha enviado la notificación por correo a ${advisorEmail} con copia a mi Gmail (${learnerEmail}). Quedo atento a tu retroalimentación oficial.`;

        const mailtoLink = `mailto:${advisorEmail}?cc=${encodeURIComponent(learnerEmail)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        const whatsappLink = `https://wa.me/${advisorWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-lg w-full border-2 border-emerald-500 shadow-2xl p-6 space-y-5 animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  🎉
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    ¡Culminación Exitosa!
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Módulo {moduleId} Culminado
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-emerald-300">
                    Has completado todos los entregables. Se activó la alerta oficial de culminación para revisión.
                  </p>
                </div>
              </div>

              {/* Delivery Receipt Card */}
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-900/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-500 dark:text-emerald-300">Estado de Entrega:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    En Revisión del Asesor
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400 block">Aprendiz:</span>
                    <strong className="text-emerald-950 dark:text-white">{learnerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400 block">Ficha SENA:</span>
                    <strong className="text-emerald-950 dark:text-white">{learnerFicha}</strong>
                  </div>
                </div>

                {/* Email and Advisor routing confirmation */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-emerald-400">📧 Asesor Receptor:</span>
                    <strong className="text-emerald-900 dark:text-emerald-200">{advisorEmail}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-emerald-400">📬 Copia al Gmail del Aprendiz:</span>
                    <strong className="text-orange-600 dark:text-orange-400 font-mono">{learnerEmail}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-emerald-400">📱 WhatsApp Asesor:</span>
                    <strong className="text-emerald-900 dark:text-emerald-200">314 787 3570</strong>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 italic">
                  ✓ El correo se despachará con copia directa a tu Gmail para constancia de tu culminación.
                </p>
              </div>

              {/* Action Buttons to Dispatch Alert */}
              <div className="space-y-2">
                <a
                  href={mailtoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 transition-all"
                >
                  <span>📧 Enviar Alerta por Correo (Asesor y Mi Gmail)</span>
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 transition-all"
                >
                  <span>💬 Enviar Alerta por WhatsApp al Asesor</span>
                </a>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(emailBody);
                      setCopiedReceipt(true);
                      setTimeout(() => setCopiedReceipt(false), 3000);
                    }}
                    className="flex-1 py-2 px-3 border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📋</span> {copiedReceipt ? '¡Copiado!' : 'Copiar Acta de Culminación'}
                  </button>

                  <button
                    onClick={() => {
                      setShowCulminationModal(false);
                      onBack();
                    }}
                    className="flex-1 py-2 px-3 bg-slate-100 dark:bg-emerald-900/60 hover:bg-slate-200 dark:hover:bg-emerald-800 text-slate-800 dark:text-emerald-100 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Finalizar y Salir
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
