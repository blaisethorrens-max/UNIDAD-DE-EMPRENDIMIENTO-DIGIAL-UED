import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type SupportedLanguage = 'es' | 'en';

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, paramsOrFallback?: Record<string, any> | string, fallback?: string) => string;
}

const STORAGE_KEY = 'ued_language_preference';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    // Common / Global
    'common.logout': 'Cerrar Sesión',
    'common.darkMode': '🌙 Modo Oscuro',
    'common.lightMode': '☀️ Modo Claro',
    'common.advisor': 'Asesor',
    'common.learner': 'Aprendiz',
    'common.secretKey': 'Clave Secreta',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.print': 'Imprimir',
    'common.download': 'Descargar',
    'common.loading': 'Cargando...',
    'common.success': 'Éxito',
    'common.error': 'Error',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.language': 'Idioma',
    'common.spanish': 'Español',
    'common.english': 'English',
    'common.active': 'Activo',
    'common.status': 'Estado',
    'common.score': 'Calificación',
    'common.date': 'Fecha',
    'common.program': 'Programa',
    'common.ficha': 'Ficha',
    'common.email': 'Correo',

    // Navigation / Header
    'nav.brandSubtitle': 'Ecosistema SENA · Formulación de Planes de Negocios',
    'nav.roleAdvisorBadge': 'Asesor',
    'nav.roleLearnerBadge': 'Aprendiz',
    'nav.secretKeyBtn': 'Clave Secreta',
    'nav.secretKeyTitle': 'Configurar clave secreta de 9 caracteres y privacidad del prototipo',
    'nav.themeToggleTitle': 'Cambiar tema claro/oscuro',
    'nav.langToggleTitle': 'Cambiar idioma entre Español e Inglés',

    // Login View
    'login.title': 'Plataforma con IA Gemini 3.8 Flash y Google Workspace',
    'login.roleLearner': '👨‍🎓 Aprendiz',
    'login.roleAdvisor': '🧑‍🏫 Asesor / Instructor 🔐',
    'login.nameLabel': 'Nombre Completo del Aprendiz *',
    'login.namePlaceholder': 'Ej: Juan Camilo Pérez Restrepo',
    'login.emailLabel': 'Correo de Gmail *',
    'login.emailHint': 'Recibirás copia (CC) automática de culminación de módulos',
    'login.fichaLabel': 'Número de Ficha *',
    'login.programLabel': 'Programa de Formación',
    'login.centerLabel': 'Centro de Formación',
    'login.whatsappLabel': 'WhatsApp (con indicativo)',
    'login.advisorKeyLabel': 'Clave Secreta de 9 Caracteres *',
    'login.advisorKeyPlaceholder': 'Ingresa la clave de 9 caracteres',
    'login.advisorKeyHint': 'Mínimo 9 caracteres con letras, números y símbolos (!@#$%^&*)',
    'login.btnEnterLearner': '🚀 Ingresar como Aprendiz',
    'login.btnEnterAdvisor': '🔓 Desbloquear e Ingresar como Asesor',
    'login.googleSignIn': 'Continuar con Google Workspace',
    'login.googleSignInHint': 'Acceso seguro con Google Drive y Google Sheets',
    'login.configKeyPrompt': '¿Deseas colocar o actualizar tu clave secreta de 9 caracteres?',
    'login.advisorKeyError': 'Clave de Asesor incorrecta. Ingresa la clave secreta de 9 caracteres (letras, símbolos y números).',
    'login.rulesLength': 'Exactamente 9 o más caracteres',
    'login.rulesLetters': 'Contiene letras (mayúsculas o minúsculas)',
    'login.rulesNumbers': 'Contiene números (0-9)',
    'login.rulesSymbols': 'Contiene símbolos especiales',

    // Learner View
    'learner.welcome': '¡Hola, {name}!',
    'learner.subtitle': 'Bienvenido a tu entorno de aprendizaje en emprendimiento e innovación digital UED · SENA',
    'learner.tabModules': '📚 Módulos Metodológicos',
    'learner.tabSpreadsheet': '📊 Hoja de Cálculo del Plan (10 Libros)',
    'learner.tabQuickStart': '🚀 Inicio Rápido',
    'learner.btnConsultAdvisor': '💬 Consultar al Asesor',
    'learner.progressLabel': 'Progreso General',
    'learner.bepSummary': 'Punto de Equilibrio: {units} unidades (${amount} COP)',
    'learner.marginSummary': 'Margen: {margin}% · Inversión Total: ${inv} COP',
    'learner.diplomaAvailable': '🎉 ¡Felicitaciones! Has completado el plan de negocios y módulos.',
    'learner.printDiploma': '📜 Imprimir Diploma (40 Horas)',
    'learner.printBusinessPlan': '📑 Imprimir Plan de Negocios',

    // Advisor / Instructor View
    'instructor.bannerTag': 'Panel Asesor / Instructor',
    'instructor.institutionTag': 'Unidad de Emprendimiento Digital',
    'instructor.bannerTitle': 'Supervisión, Alertas y Sincronización',
    'instructor.bannerSubtitle': 'Gestión integral de aprendices por Ficha, control de entregables en Google Drive/Sheets y asistencia con Gemini 3.8 Flash',
    'instructor.btnSecretKey': '🔐 Clave Secreta (9 car.)',
    'instructor.btnAddLearner': '➕ Agregar Aprendiz',
    'instructor.btnAiAdvisor': '✨ Asistente IA Gemini 3.8 Flash',
    'instructor.tabSupervision': '📋 Dashboard de Supervisión ({count} Aprendices)',
    'instructor.tabDrive': '📁 Carpetas Drive & Google Sheets',
    'instructor.tabRetention': '⚡ Apps Script & Ciclos Drive (30d / 1 año)',
    'instructor.tabManual': '📖 Manual & Socialización a Aprendices',
    'instructor.totalLearners': 'Total Aprendices',
    'instructor.totalLearnersDesc': 'Registrados en la UED',
    'instructor.approvedModules': 'Módulos Aprobados',
    'instructor.inReviewModules': 'En Revisión',
    'instructor.averageProgress': 'Progreso Promedio',
    'instructor.filterAllFichas': 'Todas las Fichas',
    'instructor.filterByFicha': 'Filtrar por Ficha:',

    // Drive & Retention Manager
    'retention.title': 'Sincronización Google Apps Script & Google Drive',
    'retention.subtitle': 'Ciclo de 30 días para borrado permanente de archivos y repositorio central de 1 año en Google Sheets',
    'retention.certTitle': 'Certificados Expedidos (40H)',
    'retention.certDesc': 'Borrado permanente a los 30 días en Drive',
    'retention.planTitle': 'Planes de Negocios Expedidos',
    'retention.planDesc': 'Borrado permanente a los 30 días en Drive',
    'retention.repoTitle': 'Repositorio Anual en Sheets',
    'retention.repoDesc': 'Custodia de participantes por 1 año (365 días)',
    'retention.btnRunPurge': '🧹 Ejecutar Purga (>30 días)',
    'retention.btnCopyScript': '📋 Copiar Código Code.gs',
    'retention.btnDownloadScript': '💾 Descargar Code.gs',
    'retention.btnSimulate': '🧪 Probar Simulador de Expiración',
    'retention.tabFiles30d': '📂 Archivos en Drive (Ciclo 30 Días)',
    'retention.tabRepo1y': '📊 Repositorio General de Participantes (1 Año)',
    'retention.tabScriptCode': '⚡ Código Google Apps Script (Code.gs)',

    // Spreadsheet (Business Plan)
    'spreadsheet.badge': 'Plantilla Oficial en Hoja de Cálculo',
    'spreadsheet.title': 'Libro de Formulación del Plan de Negocios',
    'spreadsheet.subtitle': '10 componentes estructurados paso a paso. Diligencia cada hoja y genera automáticamente tu diploma y documento formal.',
    'spreadsheet.btnPrintDiploma': '📜 Imprimir Diploma (40 Horas)',
    'spreadsheet.btnPrintPlan': '📑 Imprimir Plan de Negocios',
    'spreadsheet.btnExportCsv': '📥 CSV',

    // Modals
    'diploma.title': 'Diploma Oficial de Participación (Curso de 40 Horas)',
    'diploma.subtitle': 'Certificación oficial expedida por la Unidad de Emprendimiento Digital (UED) · SENA',
    'diploma.badge': 'Drive: 30 Días | Sheets: 1 Año',
    'diploma.btnPrint': '🖨️ Imprimir Diploma (PDF)',
    'planDoc.title': 'Documento Oficial del Plan de Negocios',
    'planDoc.subtitle': 'Estructurado a partir de los 10 componentes del libro de cálculo UED · SENA',
    'planDoc.btnPrint': '🖨️ Imprimir Plan de Negocios (PDF)',

    // Language Switcher component
    'switcher.language': 'Idioma',
    'switcher.spanish': 'Español',
    'switcher.english': 'Inglés',
    'switcher.switchPrompt': 'Cambiar a Inglés',

    // Privacy Shield
    'privacyBadge': 'Privacidad y Seguridad Activa',
    'privacyTitle': 'Acceso Protegido UED',
    'privacyDesc': 'Ingresa la clave secreta de 9 caracteres configurada por el Asesor para desbloquear la plataforma.',
    'enterSecretKey': 'Clave Secreta del Asesor (9 caracteres)',
    'unlockButton': 'Desbloquear Plataforma',
    'invalidKeyError': 'Clave incorrecta. Verifica la clave secreta de 9 caracteres.',
  },
  en: {
    // Common / Global
    'common.logout': 'Sign Out',
    'common.darkMode': '🌙 Dark Mode',
    'common.lightMode': '☀️ Light Mode',
    'common.advisor': 'Advisor',
    'common.learner': 'Learner',
    'common.secretKey': 'Secret Key',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.print': 'Print',
    'common.download': 'Download',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.language': 'Language',
    'common.spanish': 'Spanish',
    'common.english': 'English',
    'common.active': 'Active',
    'common.status': 'Status',
    'common.score': 'Score',
    'common.date': 'Date',
    'common.program': 'Program',
    'common.ficha': 'Ficha (Cohort)',
    'common.email': 'Email',

    // Navigation / Header
    'nav.brandSubtitle': 'SENA Ecosystem · Business Plan Formulation',
    'nav.roleAdvisorBadge': 'Advisor',
    'nav.roleLearnerBadge': 'Learner',
    'nav.secretKeyBtn': 'Secret Key',
    'nav.secretKeyTitle': 'Configure 9-character secret key and prototype privacy lock',
    'nav.themeToggleTitle': 'Toggle light / dark theme',
    'nav.langToggleTitle': 'Switch interface language between Spanish and English',

    // Login View
    'login.title': 'Platform powered by Gemini 3.8 Flash AI & Google Workspace',
    'login.roleLearner': '👨‍🎓 Learner',
    'login.roleAdvisor': '🧑‍🏫 Advisor / Instructor 🔐',
    'login.nameLabel': 'Learner Full Name *',
    'login.namePlaceholder': 'E.g., John Smith',
    'login.emailLabel': 'Gmail Address *',
    'login.emailHint': 'You will receive an automated CC receipt upon module completion',
    'login.fichaLabel': 'SENA Ficha (Cohort ID) *',
    'login.programLabel': 'Training Program',
    'login.centerLabel': 'Training Center',
    'login.whatsappLabel': 'WhatsApp (with country code)',
    'login.advisorKeyLabel': '9-Character Secret Key *',
    'login.advisorKeyPlaceholder': 'Enter your 9-character secret key',
    'login.advisorKeyHint': 'Minimum 9 characters with letters, numbers, and symbols (!@#$%^&*)',
    'login.btnEnterLearner': '🚀 Enter as Learner',
    'login.btnEnterAdvisor': '🔓 Unlock & Enter as Advisor',
    'login.googleSignIn': 'Continue with Google Workspace',
    'login.googleSignInHint': 'Secure access with Google Drive and Google Sheets',
    'login.configKeyPrompt': 'Want to configure or update your 9-character secret key?',
    'login.advisorKeyError': 'Incorrect Advisor Key. Please enter the 9-character secret key (letters, symbols, and numbers).',
    'login.rulesLength': 'Exactly 9 or more characters',
    'login.rulesLetters': 'Contains letters (uppercase or lowercase)',
    'login.rulesNumbers': 'Contains numbers (0-9)',
    'login.rulesSymbols': 'Contains special symbols',

    // Learner View
    'learner.welcome': 'Hello, {name}!',
    'learner.subtitle': 'Welcome to your digital entrepreneurship & innovation workspace UED · SENA',
    'learner.tabModules': '📚 Methodological Modules',
    'learner.tabSpreadsheet': '📊 Business Plan Workbook (10 Books)',
    'learner.tabQuickStart': '🚀 Quick Start',
    'learner.btnConsultAdvisor': '💬 Consult Advisor',
    'learner.progressLabel': 'Overall Progress',
    'learner.bepSummary': 'Break-Even Point: {units} units (${amount} COP)',
    'learner.marginSummary': 'Margin: {margin}% · Total Investment: ${inv} COP',
    'learner.diplomaAvailable': '🎉 Congratulations! You completed all business plan modules.',
    'learner.printDiploma': '📜 Print Certificate (40 Hours)',
    'learner.printBusinessPlan': '📑 Print Business Plan',

    // Advisor / Instructor View
    'instructor.bannerTag': 'Advisor / Instructor Portal',
    'instructor.institutionTag': 'Digital Entrepreneurship Unit',
    'instructor.bannerTitle': 'Supervision, Alerts & Synchronization',
    'instructor.bannerSubtitle': 'Comprehensive management of learners by Ficha, deliverables tracking in Google Drive/Sheets, and Gemini 3.8 Flash assistance',
    'instructor.btnSecretKey': '🔐 Secret Key (9 chars)',
    'instructor.btnAddLearner': '➕ Add Learner',
    'instructor.btnAiAdvisor': '✨ Gemini 3.8 Flash AI Assistant',
    'instructor.tabSupervision': '📋 Supervision Dashboard ({count} Learners)',
    'instructor.tabDrive': '📁 Drive Folders & Google Sheets',
    'instructor.tabRetention': '⚡ Apps Script & Drive Cycles (30d / 1 yr)',
    'instructor.tabManual': '📖 Manual & Learner Orientation',
    'instructor.totalLearners': 'Total Learners',
    'instructor.totalLearnersDesc': 'Enrolled in UED',
    'instructor.approvedModules': 'Approved Modules',
    'instructor.inReviewModules': 'In Review',
    'instructor.averageProgress': 'Average Progress',
    'instructor.filterAllFichas': 'All Fichas',
    'instructor.filterByFicha': 'Filter by Ficha:',

    // Drive & Retention Manager
    'retention.title': 'Google Apps Script & Google Drive Synchronization',
    'retention.subtitle': '30-day lifecycle for permanent file deletion and 1-year master repository in Google Sheets',
    'retention.certTitle': 'Issued Certificates (40H)',
    'retention.certDesc': 'Permanent deletion at 30 days in Drive',
    'retention.planTitle': 'Issued Business Plans',
    'retention.planDesc': 'Permanent deletion at 30 days in Drive',
    'retention.repoTitle': 'Annual Sheets Repository',
    'retention.repoDesc': 'Participant custody for 1 year (365 days)',
    'retention.btnRunPurge': '🧹 Run Purge (>30 days)',
    'retention.btnCopyScript': '📋 Copy Code.gs',
    'retention.btnDownloadScript': '💾 Download Code.gs',
    'retention.btnSimulate': '🧪 Test Expiration Simulator',
    'retention.tabFiles30d': '📂 Drive Files (30-Day Cycle)',
    'retention.tabRepo1y': '📊 Master Participants Repository (1 Year)',
    'retention.tabScriptCode': '⚡ Google Apps Script Code (Code.gs)',

    // Spreadsheet (Business Plan)
    'spreadsheet.badge': 'Official Spreadsheet Workbook',
    'spreadsheet.title': 'Business Plan Formulation Workbook',
    'spreadsheet.subtitle': '10 structured components step by step. Fill out each sheet to auto-generate your certificate and formal document.',
    'spreadsheet.btnPrintDiploma': '📜 Print Certificate (40 Hours)',
    'spreadsheet.btnPrintPlan': '📑 Print Business Plan',
    'spreadsheet.btnExportCsv': '📥 CSV',

    // Modals
    'diploma.title': 'Official Certificate of Participation (40-Hour Course)',
    'diploma.subtitle': 'Official certification issued by the Digital Entrepreneurship Unit (UED) · SENA',
    'diploma.badge': 'Drive: 30 Days | Sheets: 1 Year',
    'diploma.btnPrint': '🖨️ Print Certificate (PDF)',
    'planDoc.title': 'Official Business Plan Document',
    'planDoc.subtitle': 'Structured from the 10 components of the UED · SENA formulation workbook',
    'planDoc.btnPrint': '🖨️ Print Business Plan (PDF)',

    // Language Switcher component
    'switcher.language': 'Language',
    'switcher.spanish': 'Spanish',
    'switcher.english': 'English',
    'switcher.switchPrompt': 'Switch to Spanish',

    // Privacy Shield
    'privacyBadge': 'Active Privacy & Security',
    'privacyTitle': 'UED Protected Access',
    'privacyDesc': 'Enter the 9-character secret key configured by the Advisor to unlock the platform.',
    'enterSecretKey': 'Advisor Secret Key (9 characters)',
    'unlockButton': 'Unlock Platform',
    'invalidKeyError': 'Incorrect key. Please verify the 9-character secret key.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
      // Check browser language
      const browserLang = navigator.language?.toLowerCase() || '';
      return browserLang.startsWith('en') ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  };

  const toggleLanguage = () => {
    const nextLang: SupportedLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Helper translation function with fallback and variable interpolation
   * Examples:
   * t('nav.logout')
   * t('learner.welcome', { name: 'Carlos' })
   * t('missing.key', 'Default text')
   */
  const t = useMemo(() => {
    return (
      key: string,
      paramsOrFallback?: Record<string, any> | string,
      fallback?: string
    ): string => {
      const dict = translations[language] || translations.es;
      let text = dict[key];

      let params: Record<string, any> | undefined;
      let fallbackText: string | undefined;

      if (typeof paramsOrFallback === 'string') {
        fallbackText = paramsOrFallback;
      } else if (paramsOrFallback && typeof paramsOrFallback === 'object') {
        params = paramsOrFallback;
        fallbackText = fallback;
      }

      if (text === undefined) {
        // Fallback to Spanish dictionary
        text = translations.es[key];
      }

      if (text === undefined) {
        return fallbackText || key;
      }

      // Variable interpolation: replaces {varName} with params[varName]
      if (params) {
        Object.entries(params).forEach(([varKey, varVal]) => {
          text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varVal));
        });
      }

      return text;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { default as LanguageSwitcher } from '../components/LanguageSwitcher';

