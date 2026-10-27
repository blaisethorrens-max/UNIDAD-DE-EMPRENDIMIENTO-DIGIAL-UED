interface UEDLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'badge' | 'seal';
  showSubtitle?: boolean;
}

/**
 * Logotipo Oficial Institucional de la UED (Unidad de Emprendimiento Digital) · SENA
 * Colores reglamentarios solicitados:
 * - Verde Oliva: #4D7C0F / #365314
 * - Verde Neón: #22C55E / #4ADE80 / #39FF14
 * - Naranja: #F97316 / #EA580C
 * - Blanco: #FFFFFF
 */
export default function UEDLogo({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
}: UEDLogoProps) {
  const sizeMap = {
    sm: { icon: 32, textTitle: 'text-sm', textSub: 'text-[9px]' },
    md: { icon: 44, textTitle: 'text-base sm:text-lg', textSub: 'text-[10px]' },
    lg: { icon: 64, textTitle: 'text-xl sm:text-2xl', textSub: 'text-xs' },
    xl: { icon: 84, textTitle: 'text-3xl sm:text-4xl', textSub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // SVG con icono de innovación (Bombillo de ideas + nodos digitales + cohete de aceleración)
  const InnovationIcon = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md"
    >
      <defs>
        {/* Degradado Verde Oliva a Verde Oliva Oscuro */}
        <linearGradient id="olivaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4D7C0F" />
          <stop offset="100%" stopColor="#365314" />
        </linearGradient>

        {/* Degradado Neón */}
        <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#39FF14" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        {/* Degradado Naranja */}
        <linearGradient id="naranjaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Glow Filter Neón */}
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base / Escudo circular exterior en Verde Oliva */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="26"
        fill="url(#olivaGrad)"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />

      {/* Anillo de energía en Verde Neón con destellos */}
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="url(#neonGrad)"
        strokeWidth="3"
        strokeDasharray="6 3"
        filter="url(#neonGlow)"
        opacity="0.9"
      />

      {/* Nodos de circuito / innovación tecnológica */}
      <circle cx="24" cy="28" r="3" fill="#FFFFFF" />
      <circle cx="76" cy="28" r="3" fill="#39FF14" />
      <circle cx="22" cy="70" r="3" fill="#39FF14" />
      <circle cx="78" cy="70" r="3" fill="#FFFFFF" />
      <path d="M24 28 L38 38" stroke="#39FF14" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d="M76 28 L62 38" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d="M22 70 L36 62" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d="M78 70 L64 62" stroke="#39FF14" strokeWidth="1.5" strokeOpacity="0.7" />

      {/* Ícono central de innovación: Bombilla de ideas + Cohete digital */}
      {/* Cúpula del bombillo en Blanco y Naranja */}
      <path
        d="M34 42 C34 32 41 24 50 24 C59 24 66 32 66 42 C66 48 62 53 58 57 L58 64 C58 65 57 66 56 66 L44 66 C43 66 42 65 42 64 L42 57 C38 53 34 48 34 42 Z"
        fill="#FFFFFF"
        stroke="#EA580C"
        strokeWidth="2.5"
      />

      {/* Filamento en forma de cohete ascendente / chispa naranja */}
      <path
        d="M50 30 L54 44 L50 42 L46 44 Z"
        fill="url(#naranjaGrad)"
      />

      {/* Base del bombillo con contactos en Verde Neón */}
      <rect x="44" y="68" width="12" height="3" rx="1.5" fill="#39FF14" />
      <rect x="46" y="73" width="8" height="2.5" rx="1" fill="#FFFFFF" />

      {/* Rayos de luz / destellos de creatividad en Naranja y Neón */}
      <path d="M50 14 L50 19" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 22 L32 26" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 22 L68 26" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 44 L25 44" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M80 44 L75 44" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{InnovationIcon}</div>;
  }

  if (variant === 'seal') {
    return (
      <div className={`inline-flex flex-col items-center text-center p-3 rounded-2xl bg-gradient-to-b from-[#4D7C0F] to-[#365314] text-white border-2 border-[#39FF14] shadow-lg ${className}`}>
        {InnovationIcon}
        <div className="mt-2 font-black tracking-widest text-lg font-mono text-white flex items-center gap-1">
          <span>U</span>
          <span className="text-[#39FF14]">E</span>
          <span className="text-[#FB923C]">D</span>
        </div>
        <div className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">
          Sello Oficial de Acreditación
        </div>
        <div className="text-[9px] text-[#39FF14] font-mono">SENA · Formulación Digital</div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#365314] text-white border border-[#39FF14]/60 shadow-sm ${className}`}>
        {InnovationIcon}
        <div className="flex flex-col text-left">
          <div className="font-extrabold text-xs tracking-wider flex items-center gap-1 text-white">
            <span>UED</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#EA580C] text-white font-mono font-bold">
              SENA
            </span>
          </div>
          <span className="text-[9px] text-[#39FF14] leading-tight font-medium">
            Emprendimiento Digital
          </span>
        </div>
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {InnovationIcon}
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${currentSize.textTitle}`}>
            <span className="text-[#4D7C0F] dark:text-[#65A30D]">U</span>
            <span className="text-[#15803D] dark:text-[#22C55E]">E</span>
            <span className="text-[#EA580C]">D</span>
          </span>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-[#4D7C0F] text-white shadow-xs">
            SENA
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-bold tracking-tight text-slate-700 dark:text-emerald-200 ${currentSize.textSub}`}>
            Unidad de Emprendimiento Digital
          </span>
        )}

        {showSubtitle && (
          <span className="text-[9px] text-slate-500 dark:text-emerald-400/80 font-medium hidden sm:inline">
            Ecosistema de Formulación & Acreditación de Negocios
          </span>
        )}
      </div>
    </div>
  );
}
