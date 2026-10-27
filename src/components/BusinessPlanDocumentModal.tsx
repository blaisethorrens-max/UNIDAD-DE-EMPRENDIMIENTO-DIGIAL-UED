import { useEffect } from 'react';
import UEDLogo from './UEDLogo';
import { registerDocumentIssuance } from '../services/gasRetentionService';

interface BusinessPlanDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: {
    id?: string;
    name: string;
    documento?: string;
    ficha: string;
    program?: string;
    center?: string;
    score?: number;
    email?: string;
    moduleAnswers?: Record<number, Record<string, string>>;
    businessPlan?: Record<string, Record<string, any>>;
  };
}

export default function BusinessPlanDocumentModal({
  isOpen,
  onClose,
  learner,
}: BusinessPlanDocumentModalProps) {
  useEffect(() => {
    if (isOpen && learner) {
      registerDocumentIssuance('business_plan', {
        id: learner.id || `learner-${learner.ficha || '1'}`,
        name: learner.name,
        documento: learner.documento || '1020304050',
        ficha: learner.ficha,
        program: learner.program || 'Emprendimiento y Negocios Digitales',
        email: learner.email || 'aprendiz.sena@gmail.com',
        score: learner.score || 4.6,
      });
    }
  }, [isOpen, learner]);

  if (!isOpen) return null;

  const today = new Date();
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const dia = today.getDate();
  const mes = meses[today.getMonth()];
  const anio = today.getFullYear();
  const fechaTexto = `${dia} de ${mes} de ${anio}`;

  // Helper extraction with fallbacks from moduleAnswers or businessPlan
  const bp = learner.businessPlan || {};
  const ma = learner.moduleAnswers || {};

  const proyectoNombre =
    bp['1 resumen']?.nombre_proyecto ||
    ma[1]?.propuesta_valor ||
    'Plan de Negocio Digital Innovador';

  const clienteObjetivo =
    bp['3 mercado']?.segmento_objetivo ||
    ma[1]?.cliente_objetivo ||
    'Segmento Early Adopter validado';

  const problema =
    bp['1 resumen']?.problema_solucion ||
    ma[1]?.problema_central ||
    'Problema y necesidad latente en el mercado';

  const propuestaValor =
    bp['2 modelo de negocio']?.propuesta_valor ||
    ma[1]?.propuesta_valor ||
    'Solución tecnológica de alto valor agregado';

  const inversionTotal =
    bp['6 inversion']?.total_inversion ||
    ma[5]?.inversion_inicial ||
    '4500000';

  const costosFijos =
    bp['7 costos-precios']?.costos_fijos ||
    ma[5]?.costos_fijos ||
    '1200000';

  const costosVariables =
    bp['7 costos-precios']?.costo_variable ||
    ma[5]?.costos_variables ||
    '18000';

  const precioVenta =
    bp['7 costos-precios']?.precio_venta ||
    ma[5]?.precio_venta ||
    '55000';

  const cfNum = parseFloat(costosFijos) || 1200000;
  const cvNum = parseFloat(costosVariables) || 18000;
  const pvNum = parseFloat(precioVenta) || 55000;
  const margenUnitario = Math.max(0, pvNum - cvNum);
  const peUnidades = margenUnitario > 0 ? Math.ceil(cfNum / margenUnitario) : 0;
  const peDinero = peUnidades * pvNum;
  const proyeccionAnual = peUnidades * pvNum * 14;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-5xl w-full border border-emerald-500/40 shadow-2xl p-4 sm:p-6 space-y-4 my-6 max-h-[92vh] overflow-y-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📑</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Documento Oficial del Plan de Negocios
                </h3>
                <span className="text-[10px] bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 px-2 py-0.5 rounded font-mono">
                  Drive: 30 Días | Sheets: 1 Año
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                Estructurado a partir de los 10 componentes del libro de cálculo UED · SENA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#4D7C0F] hover:from-emerald-500 hover:to-[#365314] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <span>🖨️ Imprimir Plan de Negocios (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Printable Business Plan Document */}
        <div
          id="business-plan-print-area"
          className="bg-white text-slate-900 rounded-2xl p-6 sm:p-12 shadow-2xl border-4 border-[#4D7C0F] space-y-8 print:p-8 print:border-none print:shadow-none"
        >
          {/* Document Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#4D7C0F] pb-6">
            <UEDLogo size="lg" />
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#4D7C0F] font-bold px-2 py-0.5 rounded bg-[#4D7C0F]/10 border border-[#4D7C0F]/30">
                Formato Oficial de Formulación F-UED-01
              </span>
              <div className="text-xs text-slate-500 font-semibold mt-1">
                Servicio Nacional de Aprendizaje · SENA
              </div>
              <div className="text-xs text-slate-500">Fecha de Radicación: {fechaTexto}</div>
            </div>
          </div>

          {/* Project Title Block */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#4D7C0F]/10 via-[#39FF14]/10 to-[#FB923C]/10 border border-[#4D7C0F]/30 space-y-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#4D7C0F]">
              Proyecto de Emprendimiento Digital
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#365314] tracking-tight">
              {proyectoNombre}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#4D7C0F]/20">
              <div>
                <span className="text-slate-500 block">Emprendedor Líder:</span>
                <strong className="text-slate-900">{learner.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Documento de Identidad:</span>
                <strong className="text-slate-900">{learner.documento || '1020304050'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Ficha SENA:</span>
                <strong className="text-slate-900">{learner.ficha}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Programa de Formación:</span>
                <strong className="text-slate-900">{learner.program || 'Análisis y Desarrollo de Software'}</strong>
              </div>
            </div>
          </div>

          {/* 10 Components / Books Detailed Section */}
          <div className="space-y-6 text-xs text-slate-700">
            {/* Component 1: Resumen */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">1</span>
                Resumen Ejecutivo del Emprendimiento
              </h3>
              <p className="leading-relaxed">
                <strong>Problema y Oportunidad:</strong> {problema}
              </p>
              <p className="leading-relaxed">
                <strong>Propuesta de Valor Central:</strong> {propuestaValor}
              </p>
            </div>

            {/* Component 2: Modelo de Negocio (Canvas) */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">2</span>
                Modelo de Negocio (Lienzo Canvas)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-[#365314] block">Propuesta de Valor:</span>
                  <span>{propuestaValor}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-[#365314] block">Segmento de Clientes:</span>
                  <span>{clienteObjetivo}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-[#365314] block">Canales & Relación:</span>
                  <span>{bp['5 mercadeo']?.canal_principal || 'Canal digital directo, WhatsApp y plataforma web'}</span>
                </div>
              </div>
            </div>

            {/* Component 3: Mercado */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">3</span>
                Estudio de Mercado y Competencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p>
                  <strong>Público Objetivo (Early Adopter):</strong> {clienteObjetivo}
                </p>
                <p>
                  <strong>Ventaja Diferencial:</strong> {bp['3 mercado']?.ventaja_competitiva || 'Solución automatizada con atención en tiempo real'}
                </p>
              </div>
            </div>

            {/* Component 4: Operación */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">4</span>
                Operación y Aspectos Técnicos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <strong>Infraestructura Tech:</strong>
                  <p>{bp['4 operacion']?.infraestructura || 'Servidores Cloud, Base de datos y APIs de integración'}</p>
                </div>
                <div>
                  <strong>Tiempo de Entrega / SLA:</strong>
                  <p>{bp['4 operacion']?.tiempo_entrega || 'Inmediato (digital) / 2 horas'}</p>
                </div>
                <div>
                  <strong>Capacidad Mensual:</strong>
                  <p>{bp['4 operacion']?.capacidad_mensual || '250 operaciones / usuarios activos'}</p>
                </div>
              </div>
            </div>

            {/* Component 5: Mercadeo */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">5</span>
                Estrategia de Mercadeo y Comercialización (4P)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-[#4D7C0F]">Producto:</span>
                  <p>{bp['5 mercadeo']?.producto || 'SaaS digital y suscripción recurrente'}</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-[#4D7C0F]">Precio:</span>
                  <p>${parseFloat(precioVenta).toLocaleString()} COP</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-[#4D7C0F]">Plaza:</span>
                  <p>{bp['5 mercadeo']?.plaza || 'Portal web y tienda en la nube'}</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-[#4D7C0F]">Promoción:</span>
                  <p>{bp['5 mercadeo']?.promocion || 'Inbound marketing y pauta en redes'}</p>
                </div>
              </div>
            </div>

            {/* Component 6, 7 & 8: Finanzas, Costos y Proyección */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">6-8</span>
                Plan Financiero, Inversión y Proyección a 12 Meses
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-[#4D7C0F] text-white font-mono text-[11px]">
                    <tr>
                      <th className="p-2">Concepto Financiero</th>
                      <th className="p-2">Valor Estimado ($ COP)</th>
                      <th className="p-2">Detalle Técnico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="p-2 font-semibold">Inversión Inicial Requerida (Libro 6)</td>
                      <td className="p-2 font-mono font-bold text-[#4D7C0F]">${parseFloat(inversionTotal).toLocaleString()} COP</td>
                      <td className="p-2 text-slate-500">Activos fijos, herramientas de software y capital de trabajo</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Costos Fijos Mensuales (Libro 7)</td>
                      <td className="p-2 font-mono">${cfNum.toLocaleString()} COP / mes</td>
                      <td className="p-2 text-slate-500">Nómina básica, hosting, soporte y administración</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Costo Variable Unitario (Libro 7)</td>
                      <td className="p-2 font-mono">${cvNum.toLocaleString()} COP / unidad</td>
                      <td className="p-2 text-slate-500">Comisiones de pasarela, soporte y hosting por usuario</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Precio de Venta al Público (Libro 7)</td>
                      <td className="p-2 font-mono font-bold">${pvNum.toLocaleString()} COP</td>
                      <td className="p-2 text-slate-500">Margen de contribución: ${margenUnitario.toLocaleString()} COP ({Math.round((margenUnitario/pvNum)*100)}%)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Proyección de Ingresos Año 1 (Libro 8)</td>
                      <td className="p-2 font-mono font-bold text-[#EA580C]">${proyeccionAnual.toLocaleString()} COP</td>
                      <td className="p-2 text-slate-500">Estimación a 12 meses superando el punto de equilibrio</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Component 9 & 10: Indicadores y Evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">9</span>
                  Indicadores Financieros Clave
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between p-2 bg-white rounded border border-slate-200">
                    <span>Punto de Equilibrio (Unidades):</span>
                    <strong className="font-mono text-[#4D7C0F]">{peUnidades} unidades / mes</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border border-slate-200">
                    <span>Punto de Equilibrio (Dinero):</span>
                    <strong className="font-mono text-[#4D7C0F]">${peDinero.toLocaleString()} COP / mes</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border border-slate-200">
                    <span>Margen de Contribución:</span>
                    <strong className="font-mono text-[#EA580C]">{Math.round((margenUnitario / pvNum) * 100)}%</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <h3 className="font-bold text-sm text-[#4D7C0F] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#4D7C0F] text-white flex items-center justify-center text-xs font-mono">10</span>
                  Evaluación y Dictamen UED
                </h3>
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-300 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>DICTAMEN INSTITUCIONAL:</span>
                    <span className="font-mono text-sm px-2 py-0.5 rounded bg-emerald-700 text-white font-bold">
                      {learner.score || 4.6} / 5.0 (Aprobado)
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Plan de Negocios calificado como <strong>VIABLE Y LISTO PARA SUSTENTACIÓN</strong> ante el comité y convocatoria del Fondo Emprender.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures of Approval Section */}
          <div className="pt-8 border-t-2 border-[#4D7C0F] space-y-4">
            <h4 className="text-center font-mono uppercase font-bold text-xs tracking-wider text-[#365314]">
              Firmas de Acreditación y Radicación Oficial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {/* Signature 1: Apprentice */}
              <div className="text-center space-y-1">
                <div className="h-12 flex items-center justify-center border-b border-slate-400">
                  <span className="font-serif italic text-sm text-slate-700">{learner.name}</span>
                </div>
                <div className="font-bold text-xs text-slate-900">{learner.name}</div>
                <div className="text-[10px] text-slate-500">Aprendiz Emprendedor Líder</div>
                <div className="text-[9px] font-mono text-slate-400">Doc: {learner.documento || '1020304050'}</div>
              </div>

              {/* Signature 2: Advisor */}
              <div className="text-center space-y-1">
                <div className="h-12 flex items-center justify-center border-b border-slate-400">
                  <svg width="150" height="40" viewBox="0 0 150 40" fill="none">
                    <path
                      d="M10 25 C25 8, 40 32, 55 15 C65 6, 75 24, 85 18 C95 10, 105 30, 120 16 M30 22 Q60 35 110 25"
                      stroke="#4D7C0F"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="font-bold text-xs text-slate-900">Lic. Blaise Thorrens</div>
                <div className="text-[10px] text-[#4D7C0F] font-bold">Asesor de Emprendimiento Digital</div>
                <div className="text-[9px] text-slate-500">Unidad de Emprendimiento Digital · SENA</div>
              </div>

              {/* Signature 3: Academic Coordinator */}
              <div className="text-center space-y-1">
                <div className="h-12 flex items-center justify-center border-b border-slate-400">
                  <svg width="150" height="40" viewBox="0 0 150 40" fill="none">
                    <path
                      d="M12 28 C20 12, 40 10, 50 22 C60 30, 75 8, 85 18 C100 26, 110 12, 120 22 M20 26 L125 26"
                      stroke="#EA580C"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="font-bold text-xs text-slate-900">Ing. Carlos Arturo Gómez M.</div>
                <div className="text-[10px] text-[#EA580C] font-bold">Coordinador Académico</div>
                <div className="text-[9px] text-slate-500">Formación Profesional Integral · SENA</div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-3">
              Expedido en Colombia a los {fechaTexto} · Unidad de Emprendimiento Digital (UED) · Código de Validación: SENA-PLAN-{learner.ficha}-{anio}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
