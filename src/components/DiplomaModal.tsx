import { useRef, useEffect } from 'react';
import UEDLogo from './UEDLogo';
import { registerDocumentIssuance } from '../services/gasRetentionService';

interface DiplomaModalProps {
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
    registeredAt?: string;
  };
}

export default function DiplomaModal({ isOpen, onClose, learner }: DiplomaModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && learner) {
      // Auto-register issuance in Google Drive 30-day cycle and 1-year Google Sheets repository
      registerDocumentIssuance('certificate', {
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
  const fechaTexto = `a los ${dia} días del mes de ${mes} de ${anio}`;

  const certCode = `UED-SENA-${learner.ficha || '2845612'}-${(learner.documento || '1020304050').slice(-4)}-${anio}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-slate-900 text-white rounded-3xl max-w-5xl w-full border border-emerald-500/40 shadow-2xl p-4 sm:p-6 space-y-4 my-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Diploma Oficial de Participación (Curso de 40 Horas)
                </h3>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-mono">
                  Drive: 30 Días | Sheets: 1 Año
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                Certificación oficial expedida por la Unidad de Emprendimiento Digital (UED) · SENA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <span>🖨️ Imprimir Diploma (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet (Landscape Aspect) */}
        <div
          ref={printAreaRef}
          id="diploma-print-area"
          className="relative bg-[#FAFAF9] text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border-8 border-double border-[#4D7C0F] overflow-hidden select-none"
          style={{ minHeight: '620px' }}
        >
          {/* Subtle Watermark and Background Accents */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <UEDLogo size="xl" variant="icon-only" />
          </div>

          {/* Decorative Corner Ornaments with neon/orange/olive lines */}
          <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-[#39FF14]" />
          <div className="absolute top-2 right-2 w-16 h-16 border-t-4 border-r-4 border-[#FB923C]" />
          <div className="absolute bottom-2 left-2 w-16 h-16 border-b-4 border-l-4 border-[#FB923C]" />
          <div className="absolute bottom-2 right-2 w-16 h-16 border-b-4 border-r-4 border-[#39FF14]" />

          {/* Inner Golden/Olive Border */}
          <div className="border border-[#4D7C0F]/40 p-6 sm:p-8 rounded-xl flex flex-col justify-between h-full space-y-6">
            {/* Header: Logo and Institutional Headings */}
            <div className="flex items-start justify-between gap-4 border-b border-[#4D7C0F]/20 pb-4">
              <UEDLogo size="lg" />

              <div className="text-right">
                <div className="text-xs uppercase font-mono tracking-widest text-[#4D7C0F] font-extrabold">
                  Servicio Nacional de Aprendizaje · SENA
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  Dirección de Empleo, Trabajo y Emprendimiento
                </div>
                <div className="text-[10px] font-mono text-[#EA580C] font-bold mt-0.5">
                  Registro: {certCode}
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center space-y-1 my-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#4D7C0F] font-extrabold px-3 py-1 bg-[#4D7C0F]/10 rounded-full">
                Certificación de Aprobación
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase font-serif pt-1">
                Diploma de Participación
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium italic">
                La Unidad de Emprendimiento Digital (UED) del SENA confiere el presente reconocimiento a:
              </p>
            </div>

            {/* Learner Name and Identification */}
            <div className="text-center space-y-1.5 py-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4D7C0F] tracking-normal font-serif border-b-2 border-[#EA580C] inline-block px-8 pb-1">
                {learner.name}
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 font-medium pt-1 flex flex-wrap items-center justify-center gap-3">
                <span>C.C. / Doc: <strong>{learner.documento || '1020304050'}</strong></span>
                <span>·</span>
                <span>Ficha SENA: <strong>{learner.ficha || '2845612'}</strong></span>
                <span>·</span>
                <span>Centro: <strong>{learner.center || 'Centro de Servicios y Gestión Empresarial'}</strong></span>
              </div>
            </div>

            {/* Course Description and Hours */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Por haber cursado, formulado y aprobado satisfactoriamente el programa de aceleración y validación de:
              </p>
              <div className="p-3 bg-gradient-to-r from-[#4D7C0F]/10 via-[#39FF14]/10 to-[#FB923C]/10 rounded-2xl border border-[#4D7C0F]/30 text-center">
                <span className="block text-sm sm:text-base font-extrabold text-[#365314] tracking-tight">
                  CURSO ESPECIAL (40 HORAS): FORMULACIÓN Y VALIDACIÓN DE PLANES DE NEGOCIOS DIGITALES
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Cumpliendo con los 6 módulos metodológicos: Problema, Estudio de Mercado 4P, Operación Técnica, Marco Legal S.A.S., Plan Financiero con Punto de Equilibrio y Pitch Deck UED.
                </span>
              </div>
            </div>

            {/* Hours, Grade and Date */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 px-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#365314] text-white font-mono font-bold rounded-lg text-[11px]">
                  40 Horas Acreditadas
                </span>
                <span className="px-2.5 py-1 bg-[#EA580C] text-white font-mono font-bold rounded-lg text-[11px]">
                  Calificación: {learner.score || 4.6} / 5.0
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-700">
                Expedido en Colombia, <strong>{fechaTexto}</strong>
              </div>
            </div>

            {/* Official Signatures Section */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300">
              {/* Signature 1: Advisor */}
              <div className="text-center space-y-1">
                {/* Vectorial Calligraphic Signature */}
                <div className="h-14 flex items-center justify-center">
                  <svg width="180" height="48" viewBox="0 0 180 48" fill="none" className="text-[#365314]">
                    <path
                      d="M10 32 C30 10, 45 40, 65 18 C75 8, 85 30, 95 24 C110 14, 120 38, 140 20 C150 12, 160 30, 170 16 M40 28 Q80 45 130 32"
                      stroke="#4D7C0F"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-extrabold text-xs text-slate-900 uppercase">
                    Lic. Blaise Thorrens
                  </div>
                  <div className="text-[10px] text-[#4D7C0F] font-bold">
                    Asesor Líder de Emprendimiento Digital
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Unidad de Emprendimiento Digital (UED) · SENA
                  </div>
                </div>
              </div>

              {/* Signature 2: Academic Coordinator */}
              <div className="text-center space-y-1">
                {/* Vectorial Calligraphic Signature */}
                <div className="h-14 flex items-center justify-center">
                  <svg width="180" height="48" viewBox="0 0 180 48" fill="none" className="text-[#EA580C]">
                    <path
                      d="M15 36 C25 15, 50 12, 60 28 C70 38, 85 10, 100 22 C115 34, 130 16, 145 28 C155 36, 165 18, 175 22 M25 34 L150 34"
                      stroke="#EA580C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-extrabold text-xs text-slate-900 uppercase">
                    Ing. Carlos Arturo Gómez M.
                  </div>
                  <div className="text-[10px] text-[#EA580C] font-bold">
                    Coordinador Académico
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Coordinación de Formación Profesional Integral · SENA
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Seal Footer */}
            <div className="text-center text-[9px] text-slate-400 font-mono pt-2 flex items-center justify-between border-t border-[#4D7C0F]/10">
              <span>Resolución de Acreditación Institucional UED No. 048-2026</span>
              <span className="text-[#39FF14] font-bold">● Válido ante Comité Evaluador y Fondo Emprender</span>
              <span>Verificación: sena.edu.co/certificados/ued</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
