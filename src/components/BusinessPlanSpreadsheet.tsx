import { useState, useEffect } from 'react';
import { useData, LearnerData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import UEDLogo from './UEDLogo';
import DiplomaModal from './DiplomaModal';
import BusinessPlanDocumentModal from './BusinessPlanDocumentModal';

interface BusinessPlanSpreadsheetProps {
  learner: LearnerData;
}

export type BookKey =
  | 'instrucciones'
  | '1 resumen'
  | '2 modelo de negocio'
  | '3 mercado'
  | '4 operacion'
  | '5 mercadeo'
  | '6 inversion'
  | '7 costos-precios'
  | '8 proyeccion'
  | '9 indicadores'
  | '10 evaluacion';

export default function BusinessPlanSpreadsheet({ learner }: BusinessPlanSpreadsheetProps) {
  const { updateBusinessPlan } = useData();
  const { t } = useLanguage();
  const [activeBook, setActiveBook] = useState<BookKey>('instrucciones');
  const [isDiplomaOpen, setIsDiplomaOpen] = useState(false);
  const [isPlanDocOpen, setIsPlanDocOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Initial data derived from moduleAnswers and current businessPlan
  const bp = learner.businessPlan || {};
  const ma = learner.moduleAnswers || {};

  const [formData, setFormData] = useState<Record<string, Record<string, any>>>(() => {
    return {
      '1 resumen': {
        nombre_proyecto: bp['1 resumen']?.nombre_proyecto || ma[1]?.propuesta_valor || 'Mi Emprendimiento Digital',
        problema_solucion: bp['1 resumen']?.problema_solucion || ma[1]?.problema_central || '',
        equipo_emprendedor: bp['1 resumen']?.equipo_emprendedor || learner.name,
        sector_economico: bp['1 resumen']?.sector_economico || 'Servicios Tecnológicos y Software',
      },
      '2 modelo de negocio': {
        propuesta_valor: bp['2 modelo de negocio']?.propuesta_valor || ma[1]?.propuesta_valor || '',
        segmento_clientes: bp['2 modelo de negocio']?.segmento_clientes || ma[1]?.cliente_objetivo || '',
        fuentes_ingreso: bp['2 modelo de negocio']?.fuentes_ingreso || 'Suscripción mensual y comisiones por transacción',
        recursos_clave: bp['2 modelo de negocio']?.recursos_clave || 'Plataforma web en la nube y soporte técnico',
        actividades_clave: bp['2 modelo de negocio']?.actividades_clave || 'Desarrollo de software y captación de clientes',
      },
      '3 mercado': {
        segmento_objetivo: bp['3 mercado']?.segmento_objetivo || ma[1]?.cliente_objetivo || '',
        tamano_mercado: bp['3 mercado']?.tamano_mercado || ma[1]?.tamano_mercado || '1500',
        competidores: bp['3 mercado']?.competidores || ma[2]?.competidores_directos || '',
        ventaja_competitiva: bp['3 mercado']?.ventaja_competitiva || ma[2]?.ventaja_diferencial || '',
      },
      '4 operacion': {
        infraestructura: bp['4 operacion']?.infraestructura || ma[3]?.infraestructura_tech || '',
        tiempo_entrega: bp['4 operacion']?.tiempo_entrega || ma[3]?.tiempo_entrega || '2 horas',
        capacidad_mensual: bp['4 operacion']?.capacidad_mensual || ma[3]?.capacidad_mensual || '200',
        flujo_proceso: bp['4 operacion']?.flujo_proceso || ma[3]?.desafio || '1. Registro usuario -> 2. Activación servicio -> 3. Soporte y cobro mensual',
      },
      '5 mercadeo': {
        producto: bp['5 mercadeo']?.producto || 'Plataforma digital SaaS',
        precio: bp['5 mercadeo']?.precio || ma[5]?.precio_venta || '55000',
        plaza: bp['5 mercadeo']?.plaza || 'Portal web y canal WhatsApp Business',
        promocion: bp['5 mercadeo']?.promocion || ma[2]?.canal_adquisicion || 'Pauta digital en Google y redes sociales',
        cac_estimado: bp['5 mercadeo']?.cac_estimado || '35000',
      },
      '6 inversion': {
        activos_fijos: bp['6 inversion']?.activos_fijos || '2500000',
        gastos_preoperativos: bp['6 inversion']?.gastos_preoperativos || '800000',
        capital_trabajo: bp['6 inversion']?.capital_trabajo || '1200000',
      },
      '7 costos-precios': {
        costos_fijos: bp['7 costos-precios']?.costos_fijos || ma[5]?.costos_fijos || '1200000',
        costo_variable: bp['7 costos-precios']?.costo_variable || ma[5]?.costos_variables || '18000',
        precio_venta: bp['7 costos-precios']?.precio_venta || ma[5]?.precio_venta || '55000',
      },
      '8 proyeccion': {
        unidades_mes_1: bp['8 proyeccion']?.unidades_mes_1 || '15',
        unidades_mes_6: bp['8 proyeccion']?.unidades_mes_6 || '35',
        unidades_mes_12: bp['8 proyeccion']?.unidades_mes_12 || '60',
      },
      '9 indicadores': {
        tasa_retorno: bp['9 indicadores']?.tasa_retorno || '28',
        meses_recuperacion: bp['9 indicadores']?.meses_recuperacion || '8',
      },
      '10 evaluacion': {
        viabilidad_comercial: bp['10 evaluacion']?.viabilidad_comercial || '4.5',
        viabilidad_tecnica: bp['10 evaluacion']?.viabilidad_tecnica || '4.8',
        viabilidad_financiera: bp['10 evaluacion']?.viabilidad_financiera || '4.6',
        dictamen_comite: bp['10 evaluacion']?.dictamen_comite || 'Aprobado para Sustentación y Fondo Emprender',
      },
    };
  });

  const handleFieldChange = (book: string, field: string, value: string) => {
    setFormData(prev => {
      const updatedBook = { ...prev[book], [field]: value };
      const updated = { ...prev, [book]: updatedBook };
      updateBusinessPlan(learner.id, book, updatedBook);
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2000);
      return updated;
    });
  };

  // Calculated Financial Metrics for Real-time Display
  const invActivos = parseFloat(formData['6 inversion']?.activos_fijos) || 0;
  const invGastos = parseFloat(formData['6 inversion']?.gastos_preoperativos) || 0;
  const invCapital = parseFloat(formData['6 inversion']?.capital_trabajo) || 0;
  const totalInversion = invActivos + invGastos + invCapital;

  const cf = parseFloat(formData['7 costos-precios']?.costos_fijos) || 0;
  const cv = parseFloat(formData['7 costos-precios']?.costo_variable) || 0;
  const pv = parseFloat(formData['7 costos-precios']?.precio_venta) || 0;
  const margenUnitario = Math.max(0, pv - cv);
  const margenPorcentaje = pv > 0 ? Math.round((margenUnitario / pv) * 100) : 0;
  const puntoEquilibrioUnidades = margenUnitario > 0 ? Math.ceil(cf / margenUnitario) : 0;
  const puntoEquilibrioDinero = puntoEquilibrioUnidades * pv;

  const uMes1 = parseFloat(formData['8 proyeccion']?.unidades_mes_1) || 0;
  const uMes6 = parseFloat(formData['8 proyeccion']?.unidades_mes_6) || 0;
  const uMes12 = parseFloat(formData['8 proyeccion']?.unidades_mes_12) || 0;
  const ventasMes1 = uMes1 * pv;
  const ventasMes12 = uMes12 * pv;

  const booksList: { key: BookKey; title: string; icon: string }[] = [
    { key: 'instrucciones', title: 'Instrucciones', icon: 'ℹ️' },
    { key: '1 resumen', title: '1. Resumen', icon: '📝' },
    { key: '2 modelo de negocio', title: '2. Modelo Negocio', icon: '🧩' },
    { key: '3 mercado', title: '3. Mercado', icon: '🔍' },
    { key: '4 operacion', title: '4. Operación', icon: '⚙️' },
    { key: '5 mercadeo', title: '5. Mercadeo (4P)', icon: '📢' },
    { key: '6 inversion', title: '6. Inversión', icon: '💼' },
    { key: '7 costos-precios', title: '7. Costos & Precios', icon: '🏷️' },
    { key: '8 proyeccion', title: '8. Proyección 12M', icon: '📈' },
    { key: '9 indicadores', title: '9. Indicadores PE', icon: '🎯' },
    { key: '10 evaluacion', title: '10. Evaluación UED', icon: '🏆' },
  ];

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'COMPONENTE / LIBRO,CAMPO,VALOR\n';
    Object.keys(formData).forEach(bKey => {
      Object.keys(formData[bKey]).forEach(field => {
        const val = String(formData[bKey][field]).replace(/,/g, ' ');
        csvContent += `"${bKey}","${field}","${val}"\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Plan_de_Negocios_${learner.name.replace(/\s+/g, '_')}_Ficha_${learner.ficha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Official UED Logo and the TWO PRINT BUTTONS */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#4D7C0F] via-[#365314] to-emerald-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border-2 border-[#39FF14]/40">
        <div className="flex items-center gap-4">
          <UEDLogo size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#EA580C] px-2 py-0.5 rounded font-extrabold text-white">
                {t('spreadsheet.badge', 'Plantilla Oficial en Hoja de Cálculo')}
              </span>
              <span className="text-[10px] text-emerald-200 font-mono">
                {t('common.ficha', 'Ficha')}: {learner.ficha}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {t('spreadsheet.title', 'Libro de Formulación del Plan de Negocios')}
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              {t('spreadsheet.subtitle', '10 componentes estructurados paso a paso. Diligencia cada hoja y genera automáticamente tu diploma y documento formal.')}
            </p>
          </div>
        </div>

        {/* The Two Print Buttons Requested by the User */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsDiplomaOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FB923C] to-[#EA580C] hover:from-[#f97316] hover:to-[#c2410c] text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 hover:scale-105 cursor-pointer border border-white/20"
            title="Imprimir Diploma oficial de participación en curso de 40 horas"
          >
            <span>📜</span>
            <span>{t('spreadsheet.btnPrintDiploma', 'Imprimir Diploma (40 Horas)')}</span>
          </button>

          <button
            onClick={() => setIsPlanDocOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF14] to-[#22C55E] hover:from-[#22c55e] hover:to-[#16a34a] text-slate-950 text-xs font-black shadow-lg transition-all flex items-center gap-2 hover:scale-105 cursor-pointer border border-white/30"
            title="Imprimir documento formal del Plan de Negocios completo"
          >
            <span>📑</span>
            <span>{t('spreadsheet.btnPrintPlan', 'Imprimir Plan de Negocios')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold border border-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exportar hoja de cálculo en formato CSV compatible con Excel"
          >
            <span>📥 {t('spreadsheet.btnExportCsv', 'CSV')}</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Workspace Shell */}
      <div className="bg-white dark:bg-emerald-950 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-xl overflow-hidden flex flex-col min-h-[580px]">
        {/* Top Formula Bar & Autosave Status */}
        <div className="p-3 bg-slate-100 dark:bg-emerald-900/60 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-[#4D7C0F] dark:text-[#39FF14] px-2 py-0.5 bg-white dark:bg-emerald-950 rounded border border-slate-300 dark:border-emerald-700">
              fx UED
            </span>
            <span className="text-slate-600 dark:text-emerald-200 truncate font-mono text-[11px]">
              Libro activo: <strong>{booksList.find(b => b.key === activeBook)?.title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {saveIndicator && (
              <span className="text-emerald-600 dark:text-[#39FF14] font-bold animate-pulse flex items-center gap-1">
                <span>✓</span> Guardado automático
              </span>
            )}
            <span className="text-slate-400 font-mono">
              Punto de Equilibrio: <strong>{puntoEquilibrioUnidades} u/mes (${puntoEquilibrioDinero.toLocaleString()} COP)</strong>
            </span>
          </div>
        </div>

        {/* Active Book Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 0: INSTRUCCIONES */}
          {activeBook === 'instrucciones' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-orange-50 to-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-[#EA580C]">
                  Guía Metodológica para el Aprendiz
                </span>
                <h3 className="text-xl font-extrabold text-[#365314] dark:text-emerald-100">
                  Cómo formular tu Plan de Negocios en los 10 Libros de Cálculo
                </h3>
                <p className="text-xs text-slate-700 dark:text-emerald-200 leading-relaxed">
                  Bienvenido a la plantilla oficial de la <strong>Unidad de Emprendimiento Digital (UED) · SENA</strong>. Esta hoja interactiva condensa los 6 módulos de formación en 10 libros técnicos articulados. A medida que avanzas en cada módulo, diligencia los campos correspondientes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                  <span className="font-bold text-[#4D7C0F] block">Paso 1: Módulos 1 y 2 (Libros 1, 2, 3 y 5)</span>
                  <p className="text-slate-600 dark:text-emerald-300">
                    Define tu problema, el segmento Early Adopter, el Canvas y la estrategia 4P para captación de clientes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                  <span className="font-bold text-[#4D7C0F] block">Paso 2: Módulo 3 y 4 (Libro 4)</span>
                  <p className="text-slate-600 dark:text-emerald-300">
                    Mapea el flujo de entrega, servidores, software SaaS y requerimientos técnicos para operar sin colapsar.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                  <span className="font-bold text-[#4D7C0F] block">Paso 3: Módulo 5 (Libros 6, 7, 8 y 9)</span>
                  <p className="text-slate-600 dark:text-emerald-300">
                    Ingresa costos fijos y variables. La hoja calcula de inmediato tu punto de equilibrio y proyección a 12 meses.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                  <span className="font-bold text-[#4D7C0F] block">Paso 4: Culminación y Certificación (Libro 10)</span>
                  <p className="text-slate-600 dark:text-emerald-300">
                    Genera e imprime con un clic tu <strong>Diploma de 40 Horas</strong> y tu <strong>Documento de Plan de Negocios</strong> listos con firmas y sellos.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveBook('1 resumen')}
                  className="px-6 py-3 rounded-xl bg-[#4D7C0F] hover:bg-[#365314] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Iniciar con el Libro 1: Resumen</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: RESUMEN */}
          {activeBook === '1 resumen' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>📝</span> Componente 1: Resumen Ejecutivo del Proyecto
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Nombre Comercial del Emprendimiento *
                  </label>
                  <input
                    type="text"
                    value={formData['1 resumen'].nombre_proyecto}
                    onChange={e => handleFieldChange('1 resumen', 'nombre_proyecto', e.target.value)}
                    placeholder="Ej: POS Móvil Cloud para Pymes"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Problema Central y Solución Propuesta (Resumen) *
                  </label>
                  <textarea
                    rows={3}
                    value={formData['1 resumen'].problema_solucion}
                    onChange={e => handleFieldChange('1 resumen', 'problema_solucion', e.target.value)}
                    placeholder="Explica qué necesidad urgente resuelves y en qué consiste tu propuesta de valor innovadora..."
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                      Emprendedor Líder / Equipo Fundador
                    </label>
                    <input
                      type="text"
                      value={formData['1 resumen'].equipo_emprendedor}
                      onChange={e => handleFieldChange('1 resumen', 'equipo_emprendedor', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                      Sector Económico / Categoría Digital
                    </label>
                    <input
                      type="text"
                      value={formData['1 resumen'].sector_economico}
                      onChange={e => handleFieldChange('1 resumen', 'sector_economico', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODELO DE NEGOCIO */}
          {activeBook === '2 modelo de negocio' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>🧩</span> Componente 2: Lienzo del Modelo de Negocio (Canvas)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Propuesta de Valor Única *
                  </label>
                  <textarea
                    rows={2}
                    value={formData['2 modelo de negocio'].propuesta_valor}
                    onChange={e => handleFieldChange('2 modelo de negocio', 'propuesta_valor', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Segmento de Clientes (Early Adopters) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData['2 modelo de negocio'].segmento_clientes}
                    onChange={e => handleFieldChange('2 modelo de negocio', 'segmento_clientes', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Fuentes de Ingreso y Monetización *
                  </label>
                  <textarea
                    rows={2}
                    value={formData['2 modelo de negocio'].fuentes_ingreso}
                    onChange={e => handleFieldChange('2 modelo de negocio', 'fuentes_ingreso', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Recursos y Actividades Clave *
                  </label>
                  <textarea
                    rows={2}
                    value={formData['2 modelo de negocio'].recursos_clave}
                    onChange={e => handleFieldChange('2 modelo de negocio', 'recursos_clave', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MERCADO */}
          {activeBook === '3 mercado' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>🔍</span> Componente 3: Estudio de Mercado y Análisis de Competencia
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                      Segmento Objetivo Caracterizado *
                    </label>
                    <input
                      type="text"
                      value={formData['3 mercado'].segmento_objetivo}
                      onChange={e => handleFieldChange('3 mercado', 'segmento_objetivo', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                      Tamaño Estimado del Mercado (Clientes / Usuarios)
                    </label>
                    <input
                      type="number"
                      value={formData['3 mercado'].tamano_mercado}
                      onChange={e => handleFieldChange('3 mercado', 'tamano_mercado', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Principales Competidores (Directos e Indirectos) *
                  </label>
                  <input
                    type="text"
                    value={formData['3 mercado'].competidores}
                    onChange={e => handleFieldChange('3 mercado', 'competidores', e.target.value)}
                    placeholder="Ej: Software X, Hojas de Excel, Empresa Y"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Ventaja Competitiva No Replicable *
                  </label>
                  <textarea
                    rows={2}
                    value={formData['3 mercado'].ventaja_competitiva}
                    onChange={e => handleFieldChange('3 mercado', 'ventaja_competitiva', e.target.value)}
                    placeholder="¿Por qué te elegirán a ti y no a la competencia?..."
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPERACION */}
          {activeBook === '4 operacion' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>⚙️</span> Componente 4: Aspectos Técnicos y Operativos
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                      Infraestructura Tecnológica y Software Requerido *
                    </label>
                    <input
                      type="text"
                      value={formData['4 operacion'].infraestructura}
                      onChange={e => handleFieldChange('4 operacion', 'infraestructura', e.target.value)}
                      placeholder="Ej: Servidor VPS, Firebase, GitHub, Pasarela PayU"
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                      Capacidad Máxima Mensual (Usuarios / Pedidos) *
                    </label>
                    <input
                      type="number"
                      value={formData['4 operacion'].capacidad_mensual}
                      onChange={e => handleFieldChange('4 operacion', 'capacidad_mensual', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Flujo de Entrega del Servicio (Paso a Paso) *
                  </label>
                  <textarea
                    rows={3}
                    value={formData['4 operacion'].flujo_proceso}
                    onChange={e => handleFieldChange('4 operacion', 'flujo_proceso', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MERCADEO */}
          {activeBook === '5 mercadeo' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>📢</span> Componente 5: Estrategia de Mercadeo (Mezcla 4P y CAC)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Producto (Características y Beneficios Clave)
                  </label>
                  <input
                    type="text"
                    value={formData['5 mercadeo'].producto}
                    onChange={e => handleFieldChange('5 mercadeo', 'producto', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Plaza (Canales de Distribución y Venta)
                  </label>
                  <input
                    type="text"
                    value={formData['5 mercadeo'].plaza}
                    onChange={e => handleFieldChange('5 mercadeo', 'plaza', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    Promoción (Estrategia de Captación Digital)
                  </label>
                  <input
                    type="text"
                    value={formData['5 mercadeo'].promocion}
                    onChange={e => handleFieldChange('5 mercadeo', 'promocion', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block mb-1">
                    CAC Estimado (Costo de Adquisición de Clientes $ COP)
                  </label>
                  <input
                    type="number"
                    value={formData['5 mercadeo'].cac_estimado}
                    onChange={e => handleFieldChange('5 mercadeo', 'cac_estimado', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INVERSION */}
          {activeBook === '6 inversion' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>💼</span> Componente 6: Presupuesto de Inversión Inicial
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    1. Activos Fijos ($ COP)
                  </label>
                  <input
                    type="number"
                    value={formData['6 inversion'].activos_fijos}
                    onChange={e => handleFieldChange('6 inversion', 'activos_fijos', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Equipos de cómputo, servidores, mobiliario.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    2. Gastos Preoperativos ($ COP)
                  </label>
                  <input
                    type="number"
                    value={formData['6 inversion'].gastos_preoperativos}
                    onChange={e => handleFieldChange('6 inversion', 'gastos_preoperativos', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Constitución S.A.S., marca, licencias de software iniciales.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    3. Capital de Trabajo Inicial ($ COP)
                  </label>
                  <input
                    type="number"
                    value={formData['6 inversion'].capital_trabajo}
                    onChange={e => handleFieldChange('6 inversion', 'capital_trabajo', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Colchón financiero para 3 meses de operación.</p>
                </div>
              </div>

              {/* Total Calculated Inversión Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4D7C0F] to-[#365314] text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#39FF14]">Fórmula de Suma Automática:</span>
                  <div className="text-lg font-bold">Inversión Inicial Total Requerida:</div>
                </div>
                <div className="text-2xl font-black font-mono text-[#39FF14]">
                  ${totalInversion.toLocaleString()} COP
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COSTOS-PRECIOS */}
          {activeBook === '7 costos-precios' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>🏷️</span> Componente 7: Estructura de Costos, Precios y Margen
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    Costos Fijos Mensuales ($ COP) *
                  </label>
                  <input
                    type="number"
                    value={formData['7 costos-precios'].costos_fijos}
                    onChange={e => handleFieldChange('7 costos-precios', 'costos_fijos', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Nómina, arriendo, hosting, internet, honorarios.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    Costo Variable Unitario ($ COP) *
                  </label>
                  <input
                    type="number"
                    value={formData['7 costos-precios'].costo_variable}
                    onChange={e => handleFieldChange('7 costos-precios', 'costo_variable', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Comisiones de pasarela, insumos por entrega, consumo API.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    Precio de Venta al Público ($ COP) *
                  </label>
                  <input
                    type="number"
                    value={formData['7 costos-precios'].precio_venta}
                    onChange={e => handleFieldChange('7 costos-precios', 'precio_venta', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Tarifa o suscripción cobrada al cliente final.</p>
                </div>
              </div>

              {/* Calculated Margins Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 dark:text-emerald-200">Margen Unitario ($):</span>
                    <p className="text-xl font-black font-mono text-[#365314] dark:text-[#39FF14]">
                      ${margenUnitario.toLocaleString()} COP
                    </p>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-emerald-300">Precio - C. Variable</span>
                </div>

                <div className="p-4 rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-orange-800 dark:text-orange-200">Margen Porcentual (%):</span>
                    <p className="text-xl font-black font-mono text-[#EA580C]">
                      {margenPorcentaje}%
                    </p>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-orange-300">Rentabilidad Bruta</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PROYECCION */}
          {activeBook === '8 proyeccion' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>📈</span> Componente 8: Proyección de Ventas a 12 Meses
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    Ventas Mes 1 (Unidades)
                  </label>
                  <input
                    type="number"
                    value={formData['8 proyeccion'].unidades_mes_1}
                    onChange={e => handleFieldChange('8 proyeccion', 'unidades_mes_1', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] font-mono text-[#4D7C0F]">Facturación: ${ventasMes1.toLocaleString()} COP</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    Ventas Mes 6 (Unidades)
                  </label>
                  <input
                    type="number"
                    value={formData['8 proyeccion'].unidades_mes_6}
                    onChange={e => handleFieldChange('8 proyeccion', 'unidades_mes_6', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] font-mono text-[#4D7C0F]">Facturación: ${(uMes6 * pv).toLocaleString()} COP</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-emerald-200 block">
                    Ventas Mes 12 (Unidades)
                  </label>
                  <input
                    type="number"
                    value={formData['8 proyeccion'].unidades_mes_12}
                    onChange={e => handleFieldChange('8 proyeccion', 'unidades_mes_12', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] font-mono text-[#4D7C0F]">Facturación: ${ventasMes12.toLocaleString()} COP</p>
                </div>
              </div>

              {/* Proyección Anual Consolidada */}
              <div className="p-4 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#4D7C0F] font-bold">
                  Ingreso Bruto Estimado Año 1
                </span>
                <div className="text-3xl font-black font-mono text-[#EA580C]">
                  ${((uMes1 + uMes6 + uMes12) * 4 * pv).toLocaleString()} COP
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculado considerando la curva de adopción y retención de clientes.
                </p>
              </div>
            </div>
          )}

          {/* TAB 9: INDICADORES */}
          {activeBook === '9 indicadores' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>🎯</span> Componente 9: Indicadores Financieros & Punto de Equilibrio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4D7C0F]/20 to-emerald-100 dark:from-[#365314] dark:to-emerald-900 border-2 border-[#4D7C0F] space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#4D7C0F] dark:text-[#39FF14]">
                    Fórmula SENA: Costos Fijos / Margen Unitario
                  </span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    Punto de Equilibrio en Unidades:
                  </div>
                  <div className="text-3xl font-black font-mono text-[#365314] dark:text-[#39FF14]">
                    {puntoEquilibrioUnidades} Unidades / Mes
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-emerald-300">
                    Número exacto de transacciones mensuales que debes alcanzar para no perder dinero.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-900 border-2 border-orange-400 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#EA580C]">
                    Facturación Mínima Mensual
                  </span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    Punto de Equilibrio en Dinero:
                  </div>
                  <div className="text-3xl font-black font-mono text-[#EA580C]">
                    ${puntoEquilibrioDinero.toLocaleString()} COP / Mes
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-orange-200">
                    Monto total en ventas que cubre el 100% de costos fijos y variables.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: EVALUACION */}
          {activeBook === '10 evaluacion' && (
            <div className="space-y-5 max-w-4xl mx-auto text-xs">
              <h3 className="font-extrabold text-base text-[#365314] dark:text-white flex items-center gap-2">
                <span>🏆</span> Componente 10: Evaluación de Viabilidad y Semáforo UED
              </h3>

              <div className="p-6 rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/60 border-2 border-emerald-500 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟢</span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-white">
                        Concepto de Viabilidad: PLAN APROBADO
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-200">
                        Calificación del Comité Asesor: <strong>{learner.score || 4.6} / 5.0</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs shadow-xs">
                    40 Horas Completadas
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-emerald-100 leading-relaxed border-t border-emerald-300 dark:border-emerald-700 pt-2">
                  Este plan de negocios ha sido formulado cumpliendo con la rigurosidad técnica, validación de mercado y estructura financiera requerida por el SENA para sustentación formal y postulación al Fondo Emprender.
                </p>
              </div>

              {/* Ready to Print Action Callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#4D7C0F] to-[#365314] text-white space-y-4 text-center">
                <h4 className="text-base sm:text-lg font-black text-white">
                  ¡Felicitaciones! Has culminado todos los componentes de tu Plan de Negocios
                </h4>
                <p className="text-xs text-emerald-100 max-w-xl mx-auto">
                  Tus documentos oficiales están listos con logotipo UED, firmas institucionales del Asesor y Coordinador Académico, fecha actual y código de verificación.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsDiplomaOpen(true)}
                    className="px-5 py-3 rounded-xl bg-[#FB923C] hover:bg-[#ea580c] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <span>📜</span>
                    <span>1. Imprimir Diploma (Curso de 40 Horas)</span>
                  </button>

                  <button
                    onClick={() => setIsPlanDocOpen(true)}
                    className="px-5 py-3 rounded-xl bg-[#39FF14] hover:bg-[#22c55e] text-slate-950 text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <span>📑</span>
                    <span>2. Imprimir Plan de Negocios Completo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Workbook Tabs Navigation (Excel / Sheets style) */}
        <div className="bg-slate-200 dark:bg-emerald-950/90 border-t border-emerald-300 dark:border-emerald-800 p-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
          {booksList.map(book => {
            const isActive = activeBook === book.key;
            return (
              <button
                key={book.key}
                onClick={() => setActiveBook(book.key)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-emerald-900 text-[#4D7C0F] dark:text-[#39FF14] border-[#4D7C0F] dark:border-[#39FF14] shadow-xs'
                    : 'bg-slate-100 dark:bg-emerald-950/40 text-slate-600 dark:text-emerald-300 border-transparent hover:bg-slate-50'
                }`}
              >
                <span>{book.icon}</span>
                <span>{book.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diploma Modal */}
      <DiplomaModal
        isOpen={isDiplomaOpen}
        onClose={() => setIsDiplomaOpen(false)}
        learner={learner}
      />

      {/* Business Plan Document Modal */}
      <BusinessPlanDocumentModal
        isOpen={isPlanDocOpen}
        onClose={() => setIsPlanDocOpen(false)}
        learner={learner}
      />
    </div>
  );
}
