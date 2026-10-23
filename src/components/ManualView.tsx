import { useState } from 'react';

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
    term: 'Modelo Canvas (Business Model Canvas)',
    definition: 'Herramienta de gestión estratégica que permite visualizar y estructurar los 9 bloques fundamentales de un modelo de negocio en un solo lienzo.',
    category: 'Metodología',
  },
  {
    term: 'B2B (Business-to-Business) vs B2C (Business-to-Consumer)',
    definition: 'B2B refiere a empresas que venden productos/servicios a otras empresas. B2C refiere a venta directa a consumidores finales.',
    category: 'Comercial',
  },
  {
    term: 'PMV / MVP (Producto Mínimo Viable)',
    definition: 'Versión inicial de un producto con las características mínimas necesarias para aprender y validar hipótesis con clientes reales con el menor esfuerzo.',
    category: 'Operaciones',
  },
  {
    term: 'Churn Rate (Tasa de Cancelación)',
    definition: 'Porcentaje de clientes o suscriptores que dejan de usar o pagar por el servicio en un periodo determinado.',
    category: 'Comercial',
  },
  {
    term: 'EBITDA',
    definition: 'Beneficio antes de intereses, impuestos, depreciaciones y amortizaciones; métrica clave de la rentabilidad operativa del negocio.',
    category: 'Finanzas',
  },
  {
    term: 'Pitch Deck',
    definition: 'Presentación concisa y visual de 10-12 diapositivas o 3 minutos diseñada para comunicar el modelo de negocio ante comités e inversionistas.',
    category: 'Metodología',
  },
];

const SUCCESS_CRITERIA: Record<number, string[]> = {
  1: [
    'El cliente objetivo (Early Adopter) está claramente delimitado y no es "todo el mundo".',
    'El problema o frustración fue validado con al menos 5 personas del nicho.',
    'La propuesta de valor destaca el beneficio transformador y no solo aspectos técnicos.',
  ],
  2: [
    'Se identificaron al menos 2 competidores directos y 1 indirecto.',
    'Se definió con claridad la ventaja competitiva no replicable fácilmente.',
    'La mezcla 4P incluye estrategia de precios coherente y canal de ventas probado.',
  ],
  3: [
    'El flujo de proceso u onboarding del usuario está mapeado paso a paso.',
    'Se calcularon los requerimientos de servidores, herramientas de software y licencias.',
    'Se tiene definida la capacidad máxima de atención mensual para no colapsar.',
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
  ],
  6: [
    'El pitch cuenta con un gancho (hook) cautivador en los primeros 15 segundos.',
    'La estructura cubre Problema, Solución, Mercado, Tracción, Finanzas y el Pedido ("Ask").',
    'El resumen ejecutivo contiene la información condensada sin jerga excesiva.',
  ],
};

export default function ManualView() {
  const [activeTab, setActiveTab] = useState<'pasos' | 'glosario' | 'checklist'>('pasos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filteredGlossary = GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider bg-orange-500 px-2 py-0.5 rounded font-bold">
            Soporte & Metodología
          </span>
          <h2 className="text-2xl font-bold mt-1">Manual de Formulación UED</h2>
          <p className="text-sm text-emerald-100">
            Guía metodológica paso a paso, glosario técnico de negocios y checklist de éxito
          </p>
        </div>
        <div className="text-4xl hidden sm:block">📚</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-emerald-200 dark:border-emerald-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('pasos')}
          className={`py-3 px-5 border-b-2 transition-colors ${
            activeTab === 'pasos'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          1. Metodología Paso a Paso
        </button>
        <button
          onClick={() => setActiveTab('glosario')}
          className={`py-3 px-5 border-b-2 transition-colors ${
            activeTab === 'glosario'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          2. Glosario de Términos Clave
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`py-3 px-5 border-b-2 transition-colors ${
            activeTab === 'checklist'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          3. Criterios de Éxito por Módulo
        </button>
      </div>

      {/* Tab 1: Pasos */}
      {activeTab === 'pasos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              mod: 'Módulo 1: Identificación y Validación',
              desc: 'Enfócate en el problema antes que en la solución. Realiza entrevistas a profundidad con tu cliente ideal y valida que el dolor sea prioritario.',
              tip: 'Regla de oro: Si nadie está dispuesto a pagar o dedicar tiempo a resolverlo, el problema no es suficiente.',
            },
            {
              mod: 'Módulo 2: Estudio de Mercado y 4P',
              desc: 'Investiga quién más atiende a tu cliente. No compitas por precio: encuentra un ángulo diferencial (velocidad, soporte, nicho específico).',
              tip: 'Mide tu CAC estimado y diseña un embudo de captación sencillo.',
            },
            {
              mod: 'Módulo 3: Operación y Aspectos Técnicos',
              desc: 'Mapea la cadena de valor: infraestructura tecnológica en la nube, herramientas SaaS de soporte y tiempos de entrega garantizados.',
              tip: 'Define un Producto Mínimo Viable (PMV) que puedas operar con recursos iniciales.',
            },
            {
              mod: 'Módulo 4: Organización y Legal',
              desc: 'Asigna roles complementarios (Hacker, Hipster, Hustler). Registra tu figura mercantil (S.A.S.) y garantiza el cumplimiento de Habeas Data.',
              tip: 'Firma acuerdos de confidencialidad y cesión de propiedad intelectual entre socios.',
            },
            {
              mod: 'Módulo 5: Plan Financiero',
              desc: 'Estructura tus costos fijos y variables. Conoce tu punto de equilibrio para saber exactamente cuánto debes vender al mes para ser autosostenible.',
              tip: 'Simula escenarios pesimistas, moderados y optimistas.',
            },
            {
              mod: 'Módulo 6: Pitch de Negocio (3 Minutos)',
              desc: 'Estructura una narrativa emocionante: Hook inicial, problema urgente, solución escalable, tracción de mercado y el llamado a la acción.',
              tip: 'Usa el generador asistido por Gemini 3.8 Flash para perfeccionar tu guión.',
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2"
            >
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono uppercase">
                Paso {idx + 1}
              </span>
              <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                {step.mod}
              </h3>
              <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                {step.desc}
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[11px] text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                <strong>Consejo del Asesor:</strong> {step.tip}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Glosario */}
      {activeTab === 'glosario' && (
        <div className="space-y-4">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar término (ej: CAC, Punto de Equilibrio, Canvas)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white text-xs"
            />
            <div className="flex gap-1.5 overflow-x-auto text-xs">
              {['Todos', 'Comercial', 'Finanzas', 'Operaciones', 'Metodología'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
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
                className="p-4 bg-white dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                    {item.term}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-mono">
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

      {/* Tab 3: Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-emerald-300">
            Revisa esta lista antes de enviar cada módulo a la revisión de tu asesor para garantizar una calificación superior a 4.0:
          </p>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(modNum => (
              <div
                key={modNum}
                className="p-4 bg-white dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2"
              >
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    {modNum}
                  </span>
                  Módulo {modNum}: Lista de Chequeo de Calidad
                </h4>

                <div className="space-y-1.5 pl-7">
                  {SUCCESS_CRITERIA[modNum]?.map((crit, cIdx) => (
                    <label
                      key={cIdx}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-emerald-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{crit}</span>
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
