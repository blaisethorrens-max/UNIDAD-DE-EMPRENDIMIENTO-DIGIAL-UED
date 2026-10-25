import { useState, useEffect } from 'react';

interface GlossaryItem {
  term: string;
  definition: string;
  category: 'Comercial' | 'Finanzas' | 'Operaciones' | 'Metodología';
}

const GLOSSARY_TERMS: GlossaryItem[] = [
  {
    term: 'CAC (Costo de Adquisición de Clientes)',
    definition: 'Gasto total de mercadeo y ventas dividido entre el número de clientes nuevos captados en un periodo determinado.',
    category: 'Comercial',
  },
  {
    term: 'LTV (Lifetime Value o Valor de Vida del Cliente)',
    definition: 'Estimación del margen de ingresos netos totales que un cliente aportará al negocio a lo largo de toda su relación comercial.',
    category: 'Comercial',
  },
  {
    term: 'Punto de Equilibrio (Break-Even Point)',
    definition: 'Nivel mínimo de ventas en unidades o dinero en el cual los ingresos totales igualan a los costos fijos más variables, resultando en utilidad cero.',
    category: 'Finanzas',
  },
  {
    term: 'Margen de Contribución Unitario',
    definition: 'Diferencia entre el Precio de Venta Unitario y el Costo Variable Unitario. Es el dinero que cada unidad vendida aporta para cubrir los costos fijos.',
    category: 'Finanzas',
  },
  {
    term: 'Modelo Canvas (Business Model Canvas)',
    definition: 'Herramienta de gestión estratégica que permite visualizar y estructurar los 9 bloques fundamentales de un modelo de negocio en un solo lienzo.',
    category: 'Metodología',
  },
  {
    term: 'B2B vs B2C',
    definition: 'B2B (Business-to-Business) vende productos/servicios a empresas; B2C (Business-to-Consumer) vende directamente a usuarios finales.',
    category: 'Comercial',
  },
  {
    term: 'PMV / MVP (Producto Mínimo Viable)',
    definition: 'Versión inicial de un producto con las características mínimas necesarias para aprender y validar hipótesis con clientes reales con el menor esfuerzo.',
    category: 'Operaciones',
  },
  {
    term: 'Early Adopter',
    definition: 'Cliente pionero que sufre intensamente el problema detectado, es consciente de él y está activamente buscando o dispuesto a pagar por una solución temprana.',
    category: 'Metodología',
  },
  {
    term: 'S.A.S. (Sociedad por Acciones Simplificada)',
    definition: 'Estructura societaria en Colombia (Ley 1258 de 2008) flexible, con limitación de responsabilidad de socios al capital y posibilidad de accionista único.',
    category: 'Metodología',
  },
  {
    term: 'Habeas Data (Ley 1581 de 2012)',
    definition: 'Marco legal colombiano que regula la recolección, almacenamiento y tratamiento de datos personales en cualquier plataforma digital.',
    category: 'Metodología',
  },
  {
    term: 'Pitch Deck',
    definition: 'Presentación concisa y visual de 3 minutos o 10-12 diapositivas diseñada para comunicar el modelo de negocio con impacto ante comités evaluadores.',
    category: 'Metodología',
  },
];

const SUCCESS_CRITERIA: Record<number, string[]> = {
  1: [
    'El cliente objetivo (Early Adopter) está claramente delimitado y no es "todo el mundo".',
    'El problema o frustración fue validado con personas reales del nicho.',
    'La propuesta de valor destaca el beneficio transformador y no solo aspectos técnicos.',
    'Se completaron todos los campos de la hoja de cálculo del Módulo 1.',
  ],
  2: [
    'Se identificaron al menos 2 competidores directos y 1 indirecto.',
    'Se definió con claridad la ventaja competitiva no replicable fácilmente.',
    'La mezcla 4P incluye estrategia de precios coherente y canal de ventas probado.',
    'Se calculó el presupuesto inicial de mercadeo.',
  ],
  3: [
    'El flujo de proceso u onboarding del usuario está mapeado paso a paso.',
    'Se calcularon los requerimientos de servidores, herramientas de software y licencias.',
    'Se tiene definida la capacidad máxima de atención mensual para no colapsar.',
    'Se especificó el tiempo estimado de entrega del servicio.',
  ],
  4: [
    'Se asignaron responsabilidades claras al líder, técnico y comercial.',
    'Se contempló la figura jurídica (S.A.S. o Persona Natural) y la protección de datos.',
    'Se estimó el presupuesto de nómina u honorarios del equipo inicial.',
  ],
  5: [
    'Se discriminaron correctamente los costos fijos mensuales y costos variables unitarios.',
    'El precio de venta permite un margen de contribución unitario positivo.',
    'Se calculó el Punto de Equilibrio en unidades e ingresos y es alcanzable en el mercado.',
    'Se definió la inversión inicial requerida.',
  ],
  6: [
    'El pitch cuenta con un gancho (hook) cautivador en los primeros 15 segundos.',
    'La estructura cubre Problema, Solución, Mercado, Tracción, Finanzas y el Pedido ("Ask").',
    'El resumen ejecutivo contiene la información condensada generada con Gemini 3.8 Flash.',
  ],
};

interface PresentationSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  keyPoints: Array<{ title: string; desc: string; tag?: string }>;
  speakerNotes: string; // Notas para el asesor al proyectar a aprendices
  demoType?: 'breakeven' | 'architecture' | 'email_receipt' | 'steps';
}

const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 1,
    badge: 'Bienvenida Institucional',
    title: 'Unidad de Emprendimiento Digital (UED)',
    subtitle: 'Ecosistema Inteligente de Formulación Empresarial · SENA',
    icon: '🚀',
    summary: 'Plataforma oficial diseñada para guiar a los aprendices SENA en la estructuración de planes de negocios tecnológicos, viables y listos para evaluación ante el comité y Fondo Emprender.',
    keyPoints: [
      { title: 'Tutoría con IA Gemini 3.8 Flash', desc: 'Asistencia pedagógica continua 24/7 y auditoría de rúbricas en escala de 1.0 a 5.0.' },
      { title: 'Sincronización con Google Workspace', desc: 'Gestión automática de carpetas por número de Ficha en Google Drive y exportación a Google Sheets.' },
      { title: 'Hojas de Cálculo Interactivas', desc: 'Cálculo de punto de equilibrio, métricas comerciales y auto-guardado en tiempo real.' },
      { title: 'Validación y Alerta Dual', desc: 'Comprobante formal emitido simultáneamente al Asesor y al correo Gmail registrado en el perfil del aprendiz.' },
    ],
    speakerNotes: 'Iniciar la sesión dando la bienvenida a los aprendices. Enfatizar que esta plataforma no es un examen teórico, sino una herramienta de aceleración para convertir sus ideas en proyectos reales con acompañamiento constante.',
  },
  {
    id: 2,
    badge: 'Estructura Raíz',
    title: 'La Raíz del Proyecto y Arquitectura del Sistema',
    subtitle: 'Cómo está organizada la plataforma desde el código base',
    icon: '🌳',
    summary: 'Una arquitectura web full-stack desacoplada, segura y modular construida con React, TypeScript, Express y la API de Gemini 3.8 Flash.',
    keyPoints: [
      { title: 'server.ts (Backend Express)', desc: 'Servidor con @google/genai para tutoría, auditoría de rúbricas y generación de pitch decks.', tag: 'Backend' },
      { title: 'src/components/ (Frontend)', desc: 'Componentes modulares: Login, LearnerView, InstructorView, ModuleView, DriveSyncManager y modales de consulta.', tag: 'UI / UX' },
      { title: 'src/context/ (Estado Persistente)', desc: 'DataContext y AuthContext con guardado en localStorage y soporte de perfiles con Gmail.', tag: 'Data' },
      { title: 'src/services/ (Integraciones)', desc: 'geminiService.ts y workspaceService.ts para interactuar con Google Drive, Sheets y Gemini.', tag: 'APIs' },
    ],
    speakerNotes: 'Para aprendices de programas tecnológicos (como ADSO o Sistemas): mostrarles que la plataforma está construida con estándares profesionales modernos. Para aprendices de gestión empresarial: destacar la seguridad y fiabilidad de sus datos.',
    demoType: 'architecture',
  },
  {
    id: 3,
    badge: 'Ingreso & Identificación',
    title: 'Registro de Aprendiz y Configuración de Gmail',
    subtitle: 'Por qué tu Nombre Completo, Ficha y Gmail son indispensables',
    icon: '👤',
    summary: 'Para garantizar la trazabilidad de tus entregas y el correcto enrutamiento de las alertas, cada aprendiz debe contar con su perfil completo.',
    keyPoints: [
      { title: 'Nombre Completo y Ficha SENA', desc: 'Identifican inequívocamente tu expediente en la base de datos de la UED.' },
      { title: 'Correo de Gmail del Aprendiz', desc: 'Obligatorio en el perfil: aquí recibirás la copia oficial (CC) cada vez que culmines un módulo.' },
      { title: 'WhatsApp con Código de País', desc: 'Permite contacto inmediato para retroalimentaciones urgentes (ej: 573147873570).' },
      { title: 'Pestaña "Mi Perfil & Ficha"', desc: 'Puedes actualizar tu correo de Gmail y WhatsApp en cualquier momento con guardado instantáneo.' },
    ],
    speakerNotes: 'Recordar enérgicamente a los aprendices verificar su correo de Gmail en la pestaña "Mi Perfil". Si el correo está mal escrito, no les llegará el comprobante de entrega cuando culminen un módulo.',
  },
  {
    id: 4,
    badge: 'Ruta de Formulación',
    title: 'El Viaje de Formulación en 6 Módulos',
    subtitle: 'Paso a paso desde la validación del problema hasta el Pitch Deck',
    icon: '📋',
    summary: 'La metodología UED sigue los 6 pilares de la formulación ágil basada en Customer Development y el modelo Fondo Emprender.',
    keyPoints: [
      { title: 'Módulo 1: Identificación y Validación', desc: 'Segmento Early Adopter, problema real y propuesta de valor inicial.' },
      { title: 'Módulo 2: Estudio de Mercado y 4P', desc: 'Análisis de competencia directa/indirecta, precio, canal de venta y CAC.' },
      { title: 'Módulo 3: Operación y Aspectos Técnicos', desc: 'Flujo de procesos, PMV, infraestructura en la nube y capacidad instalada.' },
      { title: 'Módulo 4: Organización y Marco Legal', desc: 'Roles clave, formalización como S.A.S., Habeas Data y presupuesto de nómina.' },
      { title: 'Módulo 5: Plan Financiero Interactivo', desc: 'Costos fijos, variables y cálculo automático del punto de equilibrio.' },
      { title: 'Módulo 6: Pitch Deck de 3 Minutos', desc: 'Guión de sustentación y resumen ejecutivo formulado con Gemini 3.8 Flash.' },
    ],
    speakerNotes: 'Explicar que no se puede saltar al módulo financiero sin haber validado el problema en el Módulo 1. Cada módulo construye sobre el anterior.',
    demoType: 'steps',
  },
  {
    id: 5,
    badge: 'Hojas de Cálculo',
    title: 'Hojas de Cálculo Interactivas & Auto-Guardado',
    subtitle: 'Cálculos matemáticos en vivo y debounced auto-save',
    icon: '📊',
    summary: 'Cada módulo cuenta con una hoja interactiva. Los cambios se guardan de forma transparente a los 800ms de inactividad, evitando pérdidas accidentales.',
    keyPoints: [
      { title: 'Debounced Auto-Save (800ms)', desc: 'Guarda automáticamente en localStorage mientras escribes y muestra una insignia sutil "Guardado".' },
      { title: 'Simulador Financiero en Vivo (Módulo 5)', desc: 'Ingresa Costos Fijos, Variables y Precio de Venta: el sistema calcula el Punto de Equilibrio al instante.' },
      { title: 'Fórmula Oficial SENA', desc: 'Punto de Equilibrio = Costos Fijos / (Precio de Venta - Costo Variable).' },
      { title: 'Persistencia Local', desc: 'Si cierras la pestaña o se va la conexión, tus avances permanecen intactos en tu navegador.' },
    ],
    speakerNotes: 'Demostrar en vivo cómo al escribir en los campos de costos y precios, el punto de equilibrio se actualiza sin tocar ningún botón de calcular.',
    demoType: 'breakeven',
  },
  {
    id: 6,
    badge: 'Inteligencia Artificial',
    title: 'Tutor Virtual y Auditorías con Gemini 3.8 Flash',
    subtitle: 'Copiloto pedagógico integrado con los estándares SENA',
    icon: '✨',
    summary: 'Potenciado por el modelo gemini-3.8-flash, la plataforma ofrece retroalimentación instantánea antes de someter el trabajo al asesor.',
    keyPoints: [
      { title: 'Tutor Virtual 24/7', desc: 'Botón flotante naranja para despejar dudas metodológicas con contexto de tu ficha.' },
      { title: 'Auditor de Rúbricas SENA', desc: 'Evalúa tu módulo en 5 dimensiones (Innovación, Mercado, Técnica, Finanzas, Claridad) con nota 1.0 a 5.0.' },
      { title: 'Generador de Pitch Deck (Módulo 6)', desc: 'Sintetiza los 6 módulos en un guión de 3 minutos y un resumen ejecutivo estructurado.' },
      { title: 'Pulido de Consultas', desc: 'Redacta y mejora la claridad de tus preguntas hacia el asesor con un clic.' },
    ],
    speakerNotes: 'Enfatizar a los aprendices que Gemini es un copiloto para orientar y pulir ideas, pero no reemplaza su esfuerzo de investigar y validar con clientes reales.',
  },
  {
    id: 7,
    badge: 'Google Workspace',
    title: 'Carpetas por Ficha en Google Drive & Sheets',
    subtitle: 'Almacenamiento en la nube y control de listas de aprendices',
    icon: '📁',
    summary: 'La plataforma se integra con Google Workspace OAuth para sincronizar y respaldar las carpetas de cada ficha de formación.',
    keyPoints: [
      { title: 'Carpetas Automáticas por Ficha', desc: 'Se crea una carpeta en Drive para cada ficha (ej: "Ficha 2845612 - UED") con permisos institucionales.' },
      { title: 'Sincronización en Tiempo Real', desc: 'Las carpetas creadas o eliminadas se sincronizan automáticamente con la lista de fichas activas.' },
      { title: 'Exportación a Google Sheets', desc: 'El asesor puede exportar la matriz de aprendices, avances y notas directamente a una hoja de cálculo.' },
      { title: 'Acceso Centralizado', desc: 'Permite al comité evaluador auditar los avances de cada grupo desde cualquier dispositivo.' },
    ],
    speakerNotes: 'Mostrar el panel de "Carpetas Drive & Google Sheets" para que los aprendices sepan dónde se consolidan los entregables de su ficha.',
  },
  {
    id: 8,
    badge: 'Mesa de Ayuda',
    title: 'Consulta al Asesor con Identificación Obligatoria',
    subtitle: 'Nombre Completo y Ficha para una respuesta rápida y precisa',
    icon: '💬',
    summary: 'Al consultar al asesor, el sistema solicita obligatoriamente tu Nombre y Ficha para que el asesor pueda ubicar tu proyecto al instante.',
    keyPoints: [
      { title: 'Identificación Obligatoria', desc: 'El asesor atiende decenas de proyectos; identificarte evita confusiones y demoras.' },
      { title: 'Asistente de Redacción IA', desc: 'Gemini 3.8 Flash te ayuda a redactar tu inquietud con claridad técnica y cordialidad.' },
      { title: 'WhatsApp Directo al Asesor', desc: 'Genera un enlace preformateado a WhatsApp (+57 314 787 3570) con tu ficha y módulo actual.' },
      { title: 'Correo Formal al Asesor', desc: 'Envío alternativo a blaisethorrens@gmail.com con asunto estructurado por ficha.' },
    ],
    speakerNotes: 'Hacer una prueba en vivo del modal de consulta: escribir una duda breve, darle al botón "Pulir con IA" y ver cómo genera un mensaje formal y respetuoso.',
  },
  {
    id: 9,
    badge: 'Validación & Alertas',
    title: 'Reglas de Culminación y Notificación Dual',
    subtitle: 'Checklist anti-incompletos y alerta simultánea al Asesor y a tu Gmail',
    icon: '🔔',
    summary: 'Al hacer clic en "Enviar a Revisión del Asesor", el sistema realiza una validación exhaustiva de completitud.',
    keyPoints: [
      { title: 'Si el módulo está incompleto ⚠️', desc: 'Se activa una alerta modal con la lista de entregables faltantes (Desafío, hoja de cálculo o quiz) impidiendo entregas vacías.' },
      { title: 'Si el módulo está culminado 🎉', desc: 'Se activa el acta de culminación formal y el módulo pasa a estado "En Revisión".' },
      { title: 'Alerta por Correo Simultánea', desc: 'Se genera un correo al Asesor (blaisethorrens@gmail.com) con copia oficial (CC) al Gmail del Aprendiz.' },
      { title: 'Alerta por WhatsApp al Asesor', desc: 'Botón con comprobante para enviar aviso instantáneo al +57 314 787 3570.' },
    ],
    speakerNotes: 'Este es el cambio más importante: el aprendiz recibe una copia exacta en su Gmail de lo que entregó, sirviendo como radicado de culminación.',
    demoType: 'email_receipt',
  },
  {
    id: 10,
    badge: 'Aprobación & Cierre',
    title: 'Rúbrica de Calificación y Consejos para el Éxito',
    subtitle: 'Escala 1.0 a 5.0 y recomendaciones para sustentar ante el comité',
    icon: '🏆',
    summary: 'Todo plan de negocios UED es calificado con rigor técnico. Para obtener la aprobación oficial y postular a capital semilla debes superar 4.0.',
    keyPoints: [
      { title: 'Nota 4.0 a 5.0 (Aprobado)', desc: 'Proyecto validado, números coherentes y sustentación convincente. Pasa a sustentación final.' },
      { title: 'Nota 3.0 a 3.9 (En Revisión)', desc: 'Requiere ajustes menores en costos, canales o métricas según la retroalimentación del asesor.' },
      { title: 'Nota < 3.0 (Requiere Reformulación)', desc: 'El problema no está validado o la estructura financiera es inconsistente.' },
      { title: 'Regla de Oro', desc: 'Habla con usuarios reales, no supongas. Los números deben cuadrar antes de pensar en inversión.' },
    ],
    speakerNotes: 'Finalizar la presentación felicitando a los aprendices y abriendo la sesión de preguntas y respuestas. Desearles el mayor de los éxitos en su camino emprendedor.',
  },
];

interface ManualViewProps {
  initialTab?: 'presentacion' | 'raiz' | 'pasos' | 'glosario' | 'checklist';
}

export default function ManualView({ initialTab = 'presentacion' }: ManualViewProps) {
  const [activeTab, setActiveTab] = useState<'presentacion' | 'raiz' | 'pasos' | 'glosario' | 'checklist'>(initialTab);
  
  // Slide Deck State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Glossary State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Interactive Break-even Demo inside slides
  const [demoFixed, setDemoFixed] = useState(1200000);
  const [demoVar, setDemoVar] = useState(25000);
  const [demoPrice, setDemoPrice] = useState(65000);

  const demoMargin = demoPrice > demoVar ? demoPrice - demoVar : 0;
  const demoUnits = demoMargin > 0 ? Math.ceil(demoFixed / demoMargin) : 0;
  const demoMoney = demoUnits * demoPrice;

  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex];

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (activeTab !== 'presentacion') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, PRESENTATION_SLIDES.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isFullscreen]);

  const filteredGlossary = GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopyPresentationSummary = () => {
    const text = PRESENTATION_SLIDES.map(s => `[DIAPOSITIVA ${s.id}: ${s.title}]\n${s.subtitle}\n• Resumen: ${s.summary}\n• Puntos Clave:\n${s.keyPoints.map(p => `  - ${p.title}: ${p.desc}`).join('\n')}\n`).join('\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handleDownloadDeckText = () => {
    const text = PRESENTATION_SLIDES.map(s => 
      `============================================================\n` +
      `PRESENTACIÓN ${s.id}: ${s.title.toUpperCase()}\n` +
      `Subtítulo: ${s.subtitle}\n` +
      `Etiqueta: ${s.badge}\n` +
      `============================================================\n\n` +
      `DESCRIPCIÓN GENERAL:\n${s.summary}\n\n` +
      `PUNTOS CLAVE PARA EL APRENDIZ:\n` +
      s.keyPoints.map((p, idx) => `  ${idx + 1}. ${p.title}\n     ${p.desc}`).join('\n') +
      `\n\nNOTAS DEL ASESOR PARA LA SOCIALIZACIÓN:\n${s.speakerNotes}\n\n`
    ).join('\n------------------------------------------------------------\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Presentaciones_1_al_10_Manual_UED_SENA.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 text-white p-6 overflow-y-auto' : 'max-w-6xl mx-auto'}`}>
      {/* Top Banner */}
      {!isFullscreen && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider bg-orange-500 px-2.5 py-0.5 rounded font-bold">
                Manual Institucional & Socialización
              </span>
              <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-200">
                SENA UED
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Manual & Presentación de la Plataforma</h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
              Guía completa con la raíz técnica del proyecto y modo diapositivas interactivas para socializar a los aprendices el manejo de la plataforma.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('presentacion');
                setIsFullscreen(true);
              }}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-105"
            >
              <span>📽️ Iniciar Presentación a Aprendices</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all"
              title="Imprimir o guardar en PDF"
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      {!isFullscreen && (
        <div className="flex border-b border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('presentacion')}
            className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'presentacion'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>📽️</span> Modo Presentación (Diapositivas)
          </button>
          <button
            onClick={() => setActiveTab('raiz')}
            className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'raiz'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>🌳</span> Raíz del Proyecto & Arquitectura
          </button>
          <button
            onClick={() => setActiveTab('pasos')}
            className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'pasos'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>📋</span> Metodología de los 6 Módulos
          </button>
          <button
            onClick={() => setActiveTab('glosario')}
            className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'glosario'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>📖</span> Glosario Técnico
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'checklist'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>✅</span> Checklist de Culminación
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: MODO PRESENTACIÓN (SLIDE DECK INTERACTIVO) */}
      {/* ======================================================== */}
      {activeTab === 'presentacion' && (
        <div className="space-y-4">
          {/* Deck Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-emerald-900/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 dark:text-white">
                Diapositiva {currentSlide.id} de {PRESENTATION_SLIDES.length}
              </span>
              <span className="text-slate-400 dark:text-emerald-500">·</span>
              <span className="font-mono text-orange-600 dark:text-orange-400 font-semibold truncate max-w-xs">
                {currentSlide.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  showSpeakerNotes
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                🗣️ {showSpeakerNotes ? 'Ocultar Notas' : 'Ver Notas'}
              </button>

              <button
                onClick={handleCopyPresentationSummary}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-emerald-900 dark:text-white font-semibold hover:bg-emerald-50"
              >
                📋 {copiedSummary ? '¡Copiado!' : 'Copiar'}
              </button>

              <button
                onClick={handleDownloadDeckText}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-emerald-900 dark:text-white font-semibold hover:bg-emerald-50"
                title="Descargar las 10 presentaciones en formato de texto"
              >
                📥 Descargar TXT
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-emerald-900 dark:text-white font-semibold hover:bg-emerald-50"
                title="Imprimir diapositivas o guardar como PDF"
              >
                🖨️ PDF
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700"
              >
                {isFullscreen ? '✕ Salir' : '⛶ Pantalla Completa'}
              </button>
            </div>
          </div>

          {/* Slide Progress Bar */}
          <div className="w-full bg-emerald-100 dark:bg-emerald-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-orange-500 h-1.5 transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / PRESENTATION_SLIDES.length) * 100}%` }}
            />
          </div>

          {/* Main Slide Card */}
          <div className="relative bg-white dark:bg-emerald-950 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-xl p-6 sm:p-10 space-y-6 transition-all min-h-[480px] flex flex-col justify-between">
            {/* Slide Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  {currentSlide.badge}
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-emerald-400">
                  Slide {currentSlide.id}/{PRESENTATION_SLIDES.length}
                </span>
              </div>

              <div className="flex items-start gap-4 pt-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-600 text-white text-3xl flex items-center justify-center shadow-md shrink-0">
                  {currentSlide.icon}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-emerald-300 font-medium">
                    {currentSlide.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-emerald-200 leading-relaxed bg-emerald-50/60 dark:bg-emerald-900/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/80">
                {currentSlide.summary}
              </p>
            </div>

            {/* Slide Body: Key Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-2">
              {currentSlide.keyPoints.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1.5 hover:border-orange-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      {point.title}
                    </h4>
                    {point.tag && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold">
                        {point.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed pl-3.5">
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Optional Interactive Mini-Demo based on Slide Topic */}
            {currentSlide.demoType === 'breakeven' && (
              <div className="p-4 bg-orange-50/70 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-orange-950 dark:text-orange-200 flex items-center gap-1.5">
                    <span>⚡</span> Simulador en Vivo del Punto de Equilibrio (Módulo 5)
                  </h4>
                  <span className="text-[10px] font-mono text-orange-800 dark:text-orange-300">
                    Probar con los aprendices
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-orange-200 text-[11px] mb-1">
                      Costos Fijos ($ COP)
                    </label>
                    <input
                      type="number"
                      value={demoFixed}
                      onChange={e => setDemoFixed(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-orange-300 dark:border-orange-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-orange-200 text-[11px] mb-1">
                      Costo Variable Unitario ($ COP)
                    </label>
                    <input
                      type="number"
                      value={demoVar}
                      onChange={e => setDemoVar(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-orange-300 dark:border-orange-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-orange-200 text-[11px] mb-1">
                      Precio de Venta ($ COP)
                    </label>
                    <input
                      type="number"
                      value={demoPrice}
                      onChange={e => setDemoPrice(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-orange-300 dark:border-orange-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-emerald-950 rounded-xl border border-orange-200 dark:border-orange-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400 block text-[11px]">Margen Unitario:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                      ${demoMargin.toLocaleString('es-CO')} COP
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400 block text-[11px]">Punto de Equilibrio:</span>
                    <strong className="text-orange-600 dark:text-orange-400 font-mono text-sm">
                      {demoUnits} Unidades mensuales
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400 block text-[11px]">Ingresos Mínimos Requeridos:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      ${demoMoney.toLocaleString('es-CO')} COP
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {currentSlide.demoType === 'email_receipt' && (
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-900/50 rounded-2xl border border-emerald-300 dark:border-emerald-700 space-y-2 text-xs">
                <span className="font-bold text-emerald-950 dark:text-emerald-100 block">
                  Ejemplo de Alerta Dual Generada al Culminar:
                </span>
                <div className="p-3 bg-white dark:bg-emerald-950 rounded-xl font-mono text-[11px] text-slate-700 dark:text-emerald-200 space-y-1 border border-emerald-200 dark:border-emerald-800">
                  <p><strong>Para:</strong> blaisethorrens@gmail.com (Asesor SENA)</p>
                  <p><strong>CC (Copia Oficial):</strong> tu.correo@gmail.com (Gmail del Aprendiz)</p>
                  <p><strong>Asunto:</strong> [UED CULMINACIÓN] Módulo X Culminado - Ficha 2845612 - Nombre Aprendiz</p>
                  <p className="text-emerald-600 dark:text-emerald-400 pt-1">
                    ✓ Contiene acta completa, resumen de hoja de cálculo y nota del quiz validado.
                  </p>
                </div>
              </div>
            )}

            {/* Slide Navigation Controls */}
            <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                disabled={currentSlideIndex === 0}
                className="py-2.5 px-5 rounded-xl border border-emerald-300 dark:border-emerald-700 font-bold text-xs text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>⬅️</span> Anterior
              </button>

              {/* Slide jump pills */}
              <div className="hidden sm:flex items-center gap-1">
                {PRESENTATION_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                      idx === currentSlideIndex
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200'
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, PRESENTATION_SLIDES.length - 1))}
                disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                Siguiente <span>➡️</span>
              </button>
            </div>
          </div>

          {/* Speaker Notes Box */}
          {showSpeakerNotes && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-300 dark:border-amber-700 space-y-1.5 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <span>🗣️</span> Guión y Notas para el Asesor al Socializar:
                </span>
                <span className="text-[10px] uppercase font-mono text-amber-700 dark:text-amber-300 font-bold">
                  Guía de Exposición
                </span>
              </div>
              <p className="text-amber-950 dark:text-amber-100 leading-relaxed italic">
                "{currentSlide.speakerNotes}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: RAÍZ DEL PROYECTO & ARQUITECTURA TÉCNICA */}
      {/* ======================================================== */}
      {activeTab === 'raiz' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-emerald-900/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 dark:text-white">
                  Mapa de la Raíz del Proyecto (Root Architecture)
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-400">
                  Estructura completa del repositorio y roles de cada archivo en la solución
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                TypeScript · Express · Gemini 3.8 Flash
              </span>
            </div>

            {/* Tree Directory Visualizer */}
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
              <pre className="text-emerald-300">
{`├── server.ts                    # Backend Node.js / Express con @google/genai (Gemini 3.8 Flash)
├── package.json                 # Dependencias, scripts de arranque ("dev": "tsx server.ts")
├── metadata.json                # Metadatos del applet (Gemini Server API habilitada)
├── vite.config.ts               # Configuración de compilación Vite + React
├── index.html                   # Entry-point HTML con branding SENA UED
│
└── src/
    ├── App.tsx                  # Orquestador principal, navegación y selector de tema claro/oscuro
    ├── main.tsx                 # Montaje en el DOM de React 19
    ├── index.css                # Tailwind CSS v4 (@import "tailwindcss")
    ├── auth.ts                  # Integración OAuth con Google Workspace (Drive & Sheets)
    │
    ├── components/              # Componentes de interfaz de usuario
    │   ├── Login.tsx            # Formulario de inicio (Aprendiz / Asesor con clave secreta de 9 caracteres)
    │   ├── SecurityKeyModal.tsx # Modal de configuración de clave de 9 caracteres y candado de privacidad
    │   ├── GlobalPrivacyShield.tsx # Pantalla de bloqueo global de privacidad del prototipo publicado
    │   ├── LearnerView.tsx      # Portal del Aprendiz: progreso, tarjetas de módulos y "Mi Perfil"
    │   ├── InstructorView.tsx   # Panel de Supervisión, matriculación de aprendices y clave secreta
    │   ├── ModuleView.tsx       # Entorno de formulación: hojas de cálculo, quiz y alerta dual
    │   ├── DriveSyncManager.tsx # Sincronización automática de carpetas por ficha en Google Drive
    │   ├── AdvisorConsultationModal.tsx # Consulta con identificación obligatoria (Nombre y Ficha)
    │   ├── GeminiAdvisorModal.tsx # Tutor Virtual interactivo 24/7 con Gemini 3.8 Flash
    │   ├── ManualView.tsx       # Manual institucional con raíz del proyecto y diapositivas
    │   └── QuickStartGuide.tsx  # Guía de onboarding rápido de 4 pasos para nuevos aprendices
    │
    ├── context/                 # Estado global de la aplicación
    │   ├── AuthContext.tsx      # Sesión del usuario actual (rol, nombre, id, email)
    │   └── DataContext.tsx      # Persistencia en localStorage (aprendices, respuestas, estados)
    │
    └── services/                # Conectores y lógica externa
        ├── securityService.ts   # Validación de clave secreta (9 car: letras, números, símbolos) y candado
        ├── geminiService.ts     # Cliente para endpoints de Gemini 3.8 Flash
        └── workspaceService.ts  # Llamadas a Google Drive API y Google Sheets API v4`}
              </pre>
            </div>

            {/* Detailed Component Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <span>⚡</span> 1. Backend Server (server.ts)
                </h4>
                <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                  Ejecuta Express en el puerto 3000 y monta los middlewares de Vite en modo desarrollo. Inicializa el SDK de <code>@google/genai</code> con el modelo <code>gemini-3.8-flash</code> para procesar tutorías en tiempo real, auditar con la rúbrica del 20% y sintetizar pitch decks de 3 minutos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <span>💾</span> 2. Persistencia en DataContext.tsx
                </h4>
                <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                  Almacena el listado de aprendices, sus respuestas módulo a módulo, progreso porcentual (0-100%) y estados (<code>pending</code>, <code>in-review</code>, <code>approved</code>). Sincroniza cada cambio automáticamente con <code>localStorage</code> para que nunca se pierda información.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <span>📁</span> 3. Google Workspace (Drive & Sheets)
                </h4>
                <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                  Implementa flujo de autorización client-side con los scopes <code>drive</code> y <code>spreadsheets</code>. Permite crear y eliminar automáticamente carpetas por Ficha en la nube institucional y exportar registros con un solo clic.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <span>🔔</span> 4. Sistema de Validación y Alerta Dual
                </h4>
                <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                  En <code>ModuleView.tsx</code>, valida que el desafío, las hojas de cálculo y el quiz estén al 100%. Al culminar, dispara un correo dirigido a <code>blaisethorrens@gmail.com</code> con copia oficial (CC) a la dirección de Gmail guardada en el perfil del aprendiz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: METODOLOGÍA DE LOS 6 MÓDULOS */}
      {/* ======================================================== */}
      {activeTab === 'pasos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              mod: 'Módulo 1: Identificación y Validación del Problema',
              desc: 'Enfócate en el problema antes que en la solución. Realiza entrevistas a profundidad con tu cliente ideal (Early Adopter) y valida que el dolor sea prioritario, urgente y frecuente.',
              tip: 'Regla de oro: Si nadie está dispuesto a pagar o dedicar tiempo a resolverlo, el problema no amerita una startup.',
            },
            {
              mod: 'Módulo 2: Estudio de Mercado y Estrategia Comercial (4P)',
              desc: 'Investiga quién más atiende a tu cliente. No compitas por precio: encuentra un ángulo diferencial (velocidad, soporte, nicho específico). Define canales de adquisición y calcula el CAC estimado.',
              tip: 'Establece tu canal principal de captación antes de gastar en publicidad masiva.',
            },
            {
              mod: 'Módulo 3: Operación y Aspectos Técnicos',
              desc: 'Mapea la cadena de valor: infraestructura tecnológica en la nube, herramientas SaaS de soporte, tiempo garantizado de entrega y capacidad mensual máxima.',
              tip: 'Define un Producto Mínimo Viable (PMV) que puedas operar con los recursos técnicos disponibles.',
            },
            {
              mod: 'Módulo 4: Organización y Marco Legal',
              desc: 'Asigna roles complementarios (Hacker, Hipster, Hustler). Registra tu figura mercantil (S.A.S. en Colombia) y garantiza el cumplimiento estricto de Habeas Data (Ley 1581).',
              tip: 'Firma acuerdos de confidencialidad y cesión de propiedad intelectual entre los socios fundadores.',
            },
            {
              mod: 'Módulo 5: Plan Financiero y Punto de Equilibrio',
              desc: 'Estructura tus costos fijos y variables. Conoce tu punto de equilibrio para saber exactamente cuántas unidades debes vender al mes para no perder dinero.',
              tip: 'El simulador en vivo calcula tu margen de contribución: asegúrate de que el precio cubra con holgura los costos variables.',
            },
            {
              mod: 'Módulo 6: Pitch de Negocio (3 Minutos)',
              desc: 'Estructura una narrativa emocionante de 5 bloques: Hook inicial, problema urgente, solución escalable, tracción de mercado y llamado a la acción ("The Ask").',
              tip: 'Usa el generador asistido por Gemini 3.8 Flash para perfeccionar tu guión de sustentación ante el comité.',
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2 hover:border-orange-400 transition-colors"
            >
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono uppercase">
                Paso {idx + 1} de la Metodología
              </span>
              <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                {step.mod}
              </h3>
              <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                {step.desc}
              </p>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[11px] text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                <strong>Consejo del Asesor:</strong> {step.tip}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: GLOSARIO TÉCNICO */}
      {/* ======================================================== */}
      {activeTab === 'glosario' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar término (ej: CAC, Punto de Equilibrio, Canvas, S.A.S.)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white text-xs"
            />
            <div className="flex gap-1.5 overflow-x-auto text-xs">
              {['Todos', 'Comercial', 'Finanzas', 'Operaciones', 'Metodología'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                    {item.term}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CHECKLIST DE CULMINACIÓN */}
      {/* ======================================================== */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-emerald-200">
            <strong>Lista de Autocontrol del Aprendiz:</strong> Revisa y marca cada criterio antes de pulsar "Enviar a Revisión del Asesor". Cumplir con todos los entregables garantiza una evaluación superior a 4.0/5.0 ante el comité.
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(modNum => (
              <div
                key={modNum}
                className="p-5 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2.5"
              >
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-mono">
                    {modNum}
                  </span>
                  Módulo {modNum}: Criterios de Aprobación Oficial
                </h4>

                <div className="space-y-2 pl-8">
                  {SUCCESS_CRITERIA[modNum]?.map((crit, cIdx) => (
                    <label
                      key={cIdx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-emerald-200 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="leading-relaxed">{crit}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
