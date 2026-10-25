import { createContext, useContext, useState, useEffect } from 'react';

export type LearnerData = {
  id: string;
  name: string;
  documento: string; // Documento de Identidad (Cédula o T.I.)
  ficha: string;
  program: string;
  center: string;
  whatsapp: string;
  email: string; // Correo de Gmail del aprendiz
  accessPin: string; // Clave personal o PIN asignado por el asesor
  registeredAt?: string; // Fecha de registro por el asesor
  progress: number; // 0-100
  moduleAnswers: Record<number, Record<string, string>>;
  moduleStatus: Record<number, 'pending' | 'in-review' | 'approved'>;
  score: number;
};

type DataContextType = {
  learners: LearnerData[];
  addLearner: (learner: Omit<LearnerData, 'progress' | 'moduleAnswers' | 'moduleStatus' | 'score'>) => void;
  updateLearnerModule: (id: string, moduleId: number, status: 'pending' | 'in-review' | 'approved', answers?: Record<string, string>) => void;
  updateLearnerProfile: (id: string, updates: Partial<LearnerData>) => void;
};

const INITIAL_SEED_LEARNERS: LearnerData[] = [
  {
    id: 'learner-1',
    name: 'Carlos Eduardo Morales',
    documento: '1020304050',
    ficha: '2845612',
    program: 'Tecnología en Análisis y Desarrollo de Software',
    center: 'Centro de Servicios y Gestión Empresarial',
    whatsapp: '573147873570',
    email: 'carlos.morales.sena@gmail.com',
    accessPin: '1020304050',
    registeredAt: '2026-02-15',
    progress: 83,
    score: 4.6,
    moduleStatus: { 1: 'approved', 2: 'approved', 3: 'approved', 4: 'approved', 5: 'in-review', 6: 'pending' },
    moduleAnswers: {
      1: {
        cliente_objetivo: 'Microempresas comerciales de barrio',
        problema_central: 'Descuadre continuo de inventarios y pérdidas del 15% mensual',
        propuesta_valor: 'Software POS móvil en la nube con alertas de stock por WhatsApp',
        desafio: 'Validamos el problema con 12 tenderos en Medellín, 10 manifestaron que pierden más de $500.000 COP al mes por productos vencidos y falta de control.',
      },
      5: {
        costos_fijos: '1200000',
        costos_variables: '18000',
        precio_venta: '55000',
        inversion_inicial: '4500000',
        desafio: 'Con un margen unitario de $37.000 COP, necesitamos vender 33 suscripciones mensuales para alcanzar el punto de equilibrio.',
      },
    },
  },
  {
    id: 'learner-2',
    name: 'Valentina Restrepo Gómez',
    documento: '1030405060',
    ficha: '2845612',
    program: 'Tecnología en Análisis y Desarrollo de Software',
    center: 'Centro de Servicios y Gestión Empresarial',
    whatsapp: '573105558899',
    email: 'valentina.restrepo.sena@gmail.com',
    accessPin: '1030405060',
    registeredAt: '2026-02-18',
    progress: 50,
    score: 4.2,
    moduleStatus: { 1: 'approved', 2: 'approved', 3: 'in-review', 4: 'pending', 5: 'pending', 6: 'pending' },
    moduleAnswers: {
      1: {
        cliente_objetivo: 'Clínicas veterinarias independientes',
        problema_central: 'Gestión ineficiente de citas y pérdida de historial clínico de mascotas',
        propuesta_valor: 'Plataforma SaaS para historias clínicas digitales y recordatorios automáticos',
        desafio: 'Entrevisté a 5 veterinarios. El 100% lleva historias en papel o Excel desactualizado.',
      },
    },
  },
  {
    id: 'learner-3',
    name: 'Andrés Felipe Castro',
    documento: '1040506070',
    ficha: '2712345',
    program: 'Gestión Empresarial y Finanzas',
    center: 'Centro de Comercio y Servicios',
    whatsapp: '573187774411',
    email: 'andres.castro.sena@gmail.com',
    accessPin: '1040506070',
    registeredAt: '2026-02-20',
    progress: 67,
    score: 4.0,
    moduleStatus: { 1: 'approved', 2: 'approved', 3: 'approved', 4: 'in-review', 5: 'pending', 6: 'pending' },
    moduleAnswers: {
      1: {
        cliente_objetivo: 'Restaurantes familiares con servicio a domicilio',
        problema_central: 'Comisiones abusivas del 30% en apps tradicionales de delivery',
        propuesta_valor: 'Canal directo de pedidos por WhatsApp con carta digital interactiva sin comisión',
        desafio: 'Validación realizada con 8 restaurantes locales que buscan independizarse de las plataformas masivas.',
      },
    },
  },
  {
    id: 'learner-4',
    name: 'Mariana Sofia Torres',
    documento: '1050607080',
    ficha: '2698741',
    program: 'Mercadeo y Negocios Digitales',
    center: 'Centro Nacional Colombo Alemán',
    whatsapp: '573012223344',
    email: 'mariana.torres.sena@gmail.com',
    accessPin: '1050607080',
    registeredAt: '2026-02-25',
    progress: 33,
    score: 3.8,
    moduleStatus: { 1: 'approved', 2: 'in-review', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending' },
    moduleAnswers: {
      1: {
        cliente_objetivo: 'Emprendedoras de moda sostenible',
        problema_central: 'Falta de visibilidad y confianza para vender por internet a nivel nacional',
        propuesta_valor: 'Marketplace curado con sello de sostenibilidad y pasarela de pago segura',
        desafio: 'Encuestamos a 35 compradoras interesadas en moda circular y ropa de segunda mano garantizada.',
      },
    },
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [learners, setLearners] = useState<LearnerData[]>(() => {
    try {
      const saved = localStorage.getItem('learners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize existing data with documento and accessPin if missing
          return parsed.map((l: any, idx: number) => ({
            ...l,
            documento: l.documento || (l.id === 'learner-1' ? '1020304050' : l.id === 'learner-2' ? '1030405060' : l.id === 'learner-3' ? '1040506070' : l.id === 'learner-4' ? '1050607080' : `100000000${idx + 1}`),
            accessPin: l.accessPin || l.documento || '1020304050',
            registeredAt: l.registeredAt || '2026-02-15',
          }));
        }
      }
    } catch (e) {
      console.error('Error loading learners from localStorage:', e);
    }
    return INITIAL_SEED_LEARNERS;
  });

  useEffect(() => {
    localStorage.setItem('learners', JSON.stringify(learners));
  }, [learners]);

  const addLearner = (learnerData: Omit<LearnerData, 'progress' | 'moduleAnswers' | 'moduleStatus' | 'score'>) => {
    const newLearner: LearnerData = {
      ...learnerData,
      progress: 0,
      moduleAnswers: {},
      moduleStatus: { 1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending' },
      score: 4.0,
      registeredAt: learnerData.registeredAt || new Date().toISOString().split('T')[0],
    };
    setLearners((prev) => {
      const exists = prev.find(l => l.id === newLearner.id);
      if (exists) {
        return prev.map(l => l.id === newLearner.id ? { ...l, ...newLearner } : l);
      }
      return [newLearner, ...prev];
    });
  };

  const updateLearnerModule = (
    id: string,
    moduleId: number,
    status: 'pending' | 'in-review' | 'approved',
    answers?: Record<string, string>
  ) => {
    setLearners((prev) =>
      prev.map((learner) => {
        if (learner.id === id) {
          const updatedStatus = { ...learner.moduleStatus, [moduleId]: status };
          const updatedAnswers = answers
            ? { ...learner.moduleAnswers, [moduleId]: answers }
            : learner.moduleAnswers;

          const approvedOrReviewed = Object.values(updatedStatus).filter(
            s => s === 'approved' || s === 'in-review'
          ).length;
          const calculatedProgress = Math.round((approvedOrReviewed / 6) * 100);

          return {
            ...learner,
            moduleStatus: updatedStatus,
            moduleAnswers: updatedAnswers,
            progress: calculatedProgress,
          };
        }
        return learner;
      })
    );
  };

  const updateLearnerProfile = (id: string, updates: Partial<LearnerData>) => {
    setLearners((prev) =>
      prev.map((learner) => (learner.id === id ? { ...learner, ...updates } : learner))
    );
  };

  return (
    <DataContext.Provider value={{ learners, addLearner, updateLearnerModule, updateLearnerProfile }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
