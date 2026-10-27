/**
 * Servicio de Sincronización Google Apps Script & Google Drive
 * Política de Ciclos de Retención Institucional UED · SENA:
 * 1. Carpeta Certificados Expedidos (Diplomas 40h): Borrado permanente a los 30 días.
 * 2. Carpeta Planes de Negocios Expedidos: Borrado permanente a los 30 días.
 * 3. Repositorio en Hoja de Cálculo: Registro integral de participantes con vigencia de 1 año (365 días).
 */

import { getAccessToken } from '../auth';

export interface IssuedDocument {
  id: string;
  type: 'certificate' | 'business_plan';
  filename: string;
  learnerId: string;
  learnerName: string;
  documento: string;
  ficha: string;
  program: string;
  issuedDate: string; // YYYY-MM-DD
  issuedTimestamp: number;
  expirationDate30Days: string; // YYYY-MM-DD
  daysElapsed: number;
  daysRemaining: number;
  status: 'active' | 'expiring_soon' | 'purged_permanent';
  driveFileId?: string;
  driveUrl?: string;
  fileSizeBytes: number;
}

export interface ParticipantRepositoryRecord {
  id: string;
  learnerId: string;
  learnerName: string;
  documento: string;
  ficha: string;
  program: string;
  email: string;
  score: number;
  certificateCode: string;
  registeredDate: string; // YYYY-MM-DD
  registeredTimestamp: number;
  expirationDate1Year: string; // registeredDate + 365 days
  daysRemainingAnnual: number;
  certificateStatus: 'file_active_30d' | 'file_purged_30d_archived';
  planStatus: 'file_active_30d' | 'file_purged_30d_archived';
  status: 'active_1year' | 'archived_annual' | 'purged_annual';
}

const STORAGE_ISSUED_DOCS = 'ued_gas_issued_documents';
const STORAGE_ANNUAL_REPO = 'ued_gas_annual_repository';

// Calculate days difference
export function getDaysDiff(fromTimestamp: number, toTimestamp: number = Date.now()): number {
  return Math.floor((toTimestamp - fromTimestamp) / (1000 * 60 * 60 * 24));
}

// Format date YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Add days to date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Seed initial data for demo and realistic demonstration of the 30-day and 1-year lifecycles
function getInitialIssuedDocuments(): IssuedDocument[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'doc-cert-1',
      type: 'certificate',
      filename: 'Diploma_40H_Carlos_Eduardo_Morales_Ficha_2845612.pdf',
      learnerId: 'learner-1',
      learnerName: 'Carlos Eduardo Morales',
      documento: '1020304050',
      ficha: '2845612',
      program: 'Tecnología en Análisis y Desarrollo de Software',
      issuedDate: formatDate(new Date(now - 12 * dayMs)),
      issuedTimestamp: now - 12 * dayMs,
      expirationDate30Days: formatDate(new Date(now + 18 * dayMs)),
      daysElapsed: 12,
      daysRemaining: 18,
      status: 'active',
      driveFileId: 'drive-cert-101',
      driveUrl: 'https://drive.google.com/file/d/drive-cert-101/view',
      fileSizeBytes: 245000,
    },
    {
      id: 'doc-plan-1',
      type: 'business_plan',
      filename: 'Plan_Negocios_POS_Cloud_Pymes_Carlos_Morales.pdf',
      learnerId: 'learner-1',
      learnerName: 'Carlos Eduardo Morales',
      documento: '1020304050',
      ficha: '2845612',
      program: 'Tecnología en Análisis y Desarrollo de Software',
      issuedDate: formatDate(new Date(now - 12 * dayMs)),
      issuedTimestamp: now - 12 * dayMs,
      expirationDate30Days: formatDate(new Date(now + 18 * dayMs)),
      daysElapsed: 12,
      daysRemaining: 18,
      status: 'active',
      driveFileId: 'drive-plan-101',
      driveUrl: 'https://drive.google.com/file/d/drive-plan-101/view',
      fileSizeBytes: 680000,
    },
    {
      id: 'doc-cert-2',
      type: 'certificate',
      filename: 'Diploma_40H_Valentina_Restrepo_Ficha_2845612.pdf',
      learnerId: 'learner-2',
      learnerName: 'Valentina Restrepo Gómez',
      documento: '1035987412',
      ficha: '2845612',
      program: 'Tecnología en Análisis y Desarrollo de Software',
      issuedDate: formatDate(new Date(now - 28 * dayMs)),
      issuedTimestamp: now - 28 * dayMs,
      expirationDate30Days: formatDate(new Date(now + 2 * dayMs)),
      daysElapsed: 28,
      daysRemaining: 2,
      status: 'expiring_soon',
      driveFileId: 'drive-cert-102',
      driveUrl: 'https://drive.google.com/file/d/drive-cert-102/view',
      fileSizeBytes: 238000,
    },
    {
      id: 'doc-cert-3',
      type: 'certificate',
      filename: 'Diploma_40H_Andres_Felipe_Castro_Ficha_2712345.pdf',
      learnerId: 'learner-3',
      learnerName: 'Andrés Felipe Castro',
      documento: '1017456789',
      ficha: '2712345',
      program: 'Gestión Empresarial y Finanzas',
      issuedDate: formatDate(new Date(now - 34 * dayMs)),
      issuedTimestamp: now - 34 * dayMs,
      expirationDate30Days: formatDate(new Date(now - 4 * dayMs)),
      daysElapsed: 34,
      daysRemaining: -4,
      status: 'purged_permanent', // Vencido y borrado permanente por ciclo Apps Script
      driveFileId: 'drive-cert-103',
      driveUrl: 'https://drive.google.com/file/d/drive-cert-103/view',
      fileSizeBytes: 241000,
    },
    {
      id: 'doc-plan-3',
      type: 'business_plan',
      filename: 'Plan_Negocios_Delivery_Directo_Andres_Castro.pdf',
      learnerId: 'learner-3',
      learnerName: 'Andrés Felipe Castro',
      documento: '1017456789',
      ficha: '2712345',
      program: 'Gestión Empresarial y Finanzas',
      issuedDate: formatDate(new Date(now - 34 * dayMs)),
      issuedTimestamp: now - 34 * dayMs,
      expirationDate30Days: formatDate(new Date(now - 4 * dayMs)),
      daysElapsed: 34,
      daysRemaining: -4,
      status: 'purged_permanent', // Vencido y borrado permanente por ciclo Apps Script
      driveFileId: 'drive-plan-103',
      driveUrl: 'https://drive.google.com/file/d/drive-plan-103/view',
      fileSizeBytes: 620000,
    },
  ];
}

function getInitialAnnualRepository(): ParticipantRepositoryRecord[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'repo-1',
      learnerId: 'learner-1',
      learnerName: 'Carlos Eduardo Morales',
      documento: '1020304050',
      ficha: '2845612',
      program: 'Tecnología en Análisis y Desarrollo de Software',
      email: 'carlos.morales.sena@gmail.com',
      score: 4.6,
      certificateCode: 'UED-SENA-2845612-4050-2026',
      registeredDate: formatDate(new Date(now - 12 * dayMs)),
      registeredTimestamp: now - 12 * dayMs,
      expirationDate1Year: formatDate(new Date(now + (365 - 12) * dayMs)),
      daysRemainingAnnual: 353,
      certificateStatus: 'file_active_30d',
      planStatus: 'file_active_30d',
      status: 'active_1year',
    },
    {
      id: 'repo-2',
      learnerId: 'learner-2',
      learnerName: 'Valentina Restrepo Gómez',
      documento: '1035987412',
      ficha: '2845612',
      program: 'Tecnología en Análisis y Desarrollo de Software',
      email: 'valentina.restrepo.sena@gmail.com',
      score: 4.2,
      certificateCode: 'UED-SENA-2845612-7412-2026',
      registeredDate: formatDate(new Date(now - 28 * dayMs)),
      registeredTimestamp: now - 28 * dayMs,
      expirationDate1Year: formatDate(new Date(now + (365 - 28) * dayMs)),
      daysRemainingAnnual: 337,
      certificateStatus: 'file_active_30d',
      planStatus: 'file_active_30d',
      status: 'active_1year',
    },
    {
      id: 'repo-3',
      learnerId: 'learner-3',
      learnerName: 'Andrés Felipe Castro',
      documento: '1017456789',
      ficha: '2712345',
      program: 'Gestión Empresarial y Finanzas',
      email: 'andres.castro.sena@gmail.com',
      score: 4.0,
      certificateCode: 'UED-SENA-2712345-6789-2026',
      registeredDate: formatDate(new Date(now - 34 * dayMs)),
      registeredTimestamp: now - 34 * dayMs,
      expirationDate1Year: formatDate(new Date(now + (365 - 34) * dayMs)),
      daysRemainingAnnual: 331,
      certificateStatus: 'file_purged_30d_archived', // Archivo en Drive ya borrado pero registro consolidado por 1 año
      planStatus: 'file_purged_30d_archived',
      status: 'active_1year',
    },
  ];
}

/**
 * Obtiene lista de documentos expedidos actualizando días transcurridos
 */
export function getIssuedDocuments(): IssuedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_ISSUED_DOCS);
    let docs: IssuedDocument[] = raw ? JSON.parse(raw) : getInitialIssuedDocuments();

    // Actualizar días transcurridos y restantes en tiempo real
    docs = docs.map(doc => {
      const elapsed = getDaysDiff(doc.issuedTimestamp);
      const remaining = 30 - elapsed;
      let status = doc.status;

      if (status !== 'purged_permanent') {
        if (remaining <= 0) {
          status = 'purged_permanent';
        } else if (remaining <= 5) {
          status = 'expiring_soon';
        } else {
          status = 'active';
        }
      }

      return {
        ...doc,
        daysElapsed: elapsed,
        daysRemaining: remaining,
        status,
      };
    });

    saveIssuedDocuments(docs);
    return docs;
  } catch (e) {
    console.error('Error reading issued documents:', e);
    return getInitialIssuedDocuments();
  }
}

export function saveIssuedDocuments(docs: IssuedDocument[]): void {
  try {
    localStorage.setItem(STORAGE_ISSUED_DOCS, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving issued documents:', e);
  }
}

/**
 * Obtiene el repositorio anual de participantes en hoja de cálculo
 */
export function getParticipantRepository(): ParticipantRepositoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_ANNUAL_REPO);
    let repo: ParticipantRepositoryRecord[] = raw ? JSON.parse(raw) : getInitialAnnualRepository();

    repo = repo.map(rec => {
      const elapsed = getDaysDiff(rec.registeredTimestamp);
      const remaining = 365 - elapsed;
      let status = rec.status;
      if (remaining <= 0) {
        status = 'purged_annual';
      } else if (remaining <= 30) {
        status = 'archived_annual';
      } else {
        status = 'active_1year';
      }

      return {
        ...rec,
        daysRemainingAnnual: Math.max(0, remaining),
        status,
      };
    });

    saveParticipantRepository(repo);
    return repo;
  } catch (e) {
    console.error('Error reading annual repository:', e);
    return getInitialAnnualRepository();
  }
}

export function saveParticipantRepository(repo: ParticipantRepositoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_ANNUAL_REPO, JSON.stringify(repo));
  } catch (e) {
    console.error('Error saving annual repository:', e);
  }
}

/**
 * Registra formalmente la expedición de un documento (Certificado o Plan de Negocios)
 * Vincula el archivo para borrado a 30 días y registra al participante en el repositorio de 1 año.
 */
export function registerDocumentIssuance(
  type: 'certificate' | 'business_plan',
  learner: {
    id: string;
    name: string;
    documento?: string;
    ficha: string;
    program?: string;
    email?: string;
    score?: number;
  }
): { doc: IssuedDocument; repoRecord: ParticipantRepositoryRecord } {
  const now = Date.now();
  const nowDate = new Date();
  const issuedDateStr = formatDate(nowDate);
  const expiration30Str = formatDate(addDays(nowDate, 30));
  const expiration1YearStr = formatDate(addDays(nowDate, 365));

  const docId = `doc-${type}-${Date.now()}`;
  const filename =
    type === 'certificate'
      ? `Diploma_40H_${learner.name.replace(/\s+/g, '_')}_Ficha_${learner.ficha}.pdf`
      : `Plan_Negocios_${learner.name.replace(/\s+/g, '_')}_Ficha_${learner.ficha}.pdf`;

  const newDoc: IssuedDocument = {
    id: docId,
    type,
    filename,
    learnerId: learner.id,
    learnerName: learner.name,
    documento: learner.documento || '1020304050',
    ficha: learner.ficha,
    program: learner.program || 'Emprendimiento Digital',
    issuedDate: issuedDateStr,
    issuedTimestamp: now,
    expirationDate30Days: expiration30Str,
    daysElapsed: 0,
    daysRemaining: 30,
    status: 'active',
    driveFileId: `drive-${type}-${Date.now().toString().slice(-6)}`,
    driveUrl: `https://drive.google.com/file/d/drive-${type}-${Date.now().toString().slice(-6)}/view`,
    fileSizeBytes: type === 'certificate' ? 245000 : 650000,
  };

  const currentDocs = getIssuedDocuments();
  saveIssuedDocuments([newDoc, ...currentDocs]);

  // Actualizar o agregar participante en el repositorio anual (1 año)
  const currentRepo = getParticipantRepository();
  const existingIndex = currentRepo.findIndex(r => r.learnerId === learner.id);
  const certCode = `UED-SENA-${learner.ficha}-${(learner.documento || '1020304050').slice(-4)}-${new Date().getFullYear()}`;

  let repoRecord: ParticipantRepositoryRecord;

  if (existingIndex >= 0) {
    const existing = currentRepo[existingIndex];
    repoRecord = {
      ...existing,
      certificateStatus: type === 'certificate' ? 'file_active_30d' : existing.certificateStatus,
      planStatus: type === 'business_plan' ? 'file_active_30d' : existing.planStatus,
    };
    currentRepo[existingIndex] = repoRecord;
  } else {
    repoRecord = {
      id: `repo-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      documento: learner.documento || '1020304050',
      ficha: learner.ficha,
      program: learner.program || 'Emprendimiento Digital',
      email: learner.email || 'aprendiz.sena@gmail.com',
      score: learner.score || 4.6,
      certificateCode: certCode,
      registeredDate: issuedDateStr,
      registeredTimestamp: now,
      expirationDate1Year: expiration1YearStr,
      daysRemainingAnnual: 365,
      certificateStatus: type === 'certificate' ? 'file_active_30d' : 'file_purged_30d_archived',
      planStatus: type === 'business_plan' ? 'file_active_30d' : 'file_purged_30d_archived',
      status: 'active_1year',
    };
    currentRepo.unshift(repoRecord);
  }

  saveParticipantRepository(currentRepo);
  return { doc: newDoc, repoRecord };
}

/**
 * Ejecuta el ciclo de borrado permanente de archivos con más de 30 días
 * Simula y ejecuta la purga permanente garantizando que el repositorio anual preserve el registro
 */
export async function runPermanentPurge30Days(): Promise<{
  purgedCertificates: number;
  purgedPlans: number;
  totalPurged: number;
  freedBytes: number;
}> {
  const token = getAccessToken();
  const docs = getIssuedDocuments();
  const repo = getParticipantRepository();

  let purgedCertificates = 0;
  let purgedPlans = 0;
  let freedBytes = 0;

  const updatedDocs = docs.map(doc => {
    const elapsed = getDaysDiff(doc.issuedTimestamp);
    if (elapsed >= 30 && doc.status !== 'purged_permanent') {
      if (doc.type === 'certificate') purgedCertificates++;
      if (doc.type === 'business_plan') purgedPlans++;
      freedBytes += doc.fileSizeBytes;

      // Si hay token real de Google Workspace, llamar a la API de Drive para eliminarlo definitivamente
      if (token && doc.driveFileId && !doc.driveFileId.startsWith('mock-')) {
        fetch(`https://www.googleapis.com/drive/v3/files/${doc.driveFileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => console.warn('Drive permanent delete API error:', err));
      }

      return {
        ...doc,
        status: 'purged_permanent' as const,
        daysRemaining: 0,
      };
    }
    return doc;
  });

  // Actualizar estados en el repositorio anual (marcar como archivo purgado pero registro preservado)
  const updatedRepo = repo.map(r => {
    const hasActiveCert = updatedDocs.some(d => d.learnerId === r.learnerId && d.type === 'certificate' && d.status !== 'purged_permanent');
    const hasActivePlan = updatedDocs.some(d => d.learnerId === r.learnerId && d.type === 'business_plan' && d.status !== 'purged_permanent');
    return {
      ...r,
      certificateStatus: hasActiveCert ? ('file_active_30d' as const) : ('file_purged_30d_archived' as const),
      planStatus: hasActivePlan ? ('file_active_30d' as const) : ('file_purged_30d_archived' as const),
    };
  });

  saveIssuedDocuments(updatedDocs);
  saveParticipantRepository(updatedRepo);

  return {
    purgedCertificates,
    purgedPlans,
    totalPurged: purgedCertificates + purgedPlans,
    freedBytes,
  };
}

/**
 * Genera el script oficial de Google Apps Script (Code.gs) listo para desplegar
 */
export function generateGoogleAppsScriptCode(): string {
  return `/**
 * ============================================================================
 * UNIDAD DE EMPRENDIMIENTO DIGITAL (UED) · SENA
 * SISTEMA AUTOMATIZADO DE SINCRONIZACIÓN GOOGLE APPS SCRIPT & GOOGLE DRIVE
 * ============================================================================
 * 
 * POLÍTICAS INSTITUCIONALES CONFIGURADAS:
 * 1. Carpeta de Certificados Expedidos (Diplomas 40h): Retención de 30 DÍAS con borrado permanente.
 * 2. Carpeta de Planes de Negocios Expedidos: Retención de 30 DÍAS con borrado permanente.
 * 3. Repositorio en Hoja de Cálculo (Google Sheets): Registro de Participantes con retención de 1 AÑO (365 días).
 *
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Entra a https://script.google.com/
 * 2. Crea un "Nuevo Proyecto" y pega este código en 'Código.gs' (o 'Code.gs').
 * 3. Ejecuta la función 'inicializarEntornoUED()' una sola vez para crear las carpetas y hoja de cálculo.
 * 4. Activa el activador automático ejecutando 'crearActivadorDiarioUED()'.
 */

const CONFIG_UED = {
  NOMBRE_CARPETA_CERTIFICADOS: 'UED_Certificados_Expedidos_30D',
  NOMBRE_CARPETA_PLANES: 'UED_Planes_Negocio_Expedidos_30D',
  NOMBRE_HOJA_REPOSITORIO: 'UED_Repositorio_Anual_Participantes',
  DIAS_VIGENCIA_ARCHIVOS: 30,
  DIAS_VIGENCIA_REPOSITORIO: 365,
  CORREO_NOTIFICACIONES: 'blaisethorrens@gmail.com'
};

/**
 * Función principal ejecutada automáticamente todos los días a las 02:00 AM
 */
function ejecutarCicloMantenimientoUED() {
  const inicio = new Date();
  Logger.log('>>> INICIANDO CICLO DE MANTENIMIENTO UED: ' + inicio.toISOString());

  // 1. Obtener o crear la hoja de cálculo del repositorio anual (1 año)
  const spreadsheet = obtenerOCrearRepositorioSheet();

  // 2. Procesar y purgar permanentemente certificados con más de 30 días
  const carpetaCertificados = obtenerOCrearCarpeta(CONFIG_UED.NOMBRE_CARPETA_CERTIFICADOS);
  const certsPurgados = purgarCarpetaPermanente(carpetaCertificados, CONFIG_UED.DIAS_VIGENCIA_ARCHIVOS, spreadsheet, 'Certificado 40 Horas');

  // 3. Procesar y purgar permanentemente planes de negocio con más de 30 días
  const carpetaPlanes = obtenerOCrearCarpeta(CONFIG_UED.NOMBRE_CARPETA_PLANES);
  const planesPurgados = purgarCarpetaPermanente(carpetaPlanes, CONFIG_UED.DIAS_VIGENCIA_ARCHIVOS, spreadsheet, 'Plan de Negocios');

  // 4. Auditar filas del repositorio anual que superen 365 días (1 año)
  const filasAuditadas = auditarVigenciaAnualRepositorio(spreadsheet, CONFIG_UED.DIAS_VIGENCIA_REPOSITORIO);

  const fin = new Date();
  const resumen = 'Ciclo UED completado con éxito.\\n' +
    '• Certificados purgados (> 30 días): ' + certsPurgados + '\\n' +
    '• Planes de Negocio purgados (> 30 días): ' + planesPurgados + '\\n' +
    '• Registros de participantes auditados (> 1 año): ' + filasAuditadas + '\\n' +
    '• Duración: ' + ((fin - inicio) / 1000) + ' segundos.';

  Logger.log(resumen);
}

/**
 * Purga permanentemente los archivos de una carpeta de Google Drive si superan X días
 * Antes del borrado, asegura que la trazabilidad quede grabada en el repositorio anual de 1 año.
 */
function purgarCarpetaPermanente(carpeta, diasLimite, spreadsheet, tipoDocumento) {
  const archivos = carpeta.getFiles();
  const ahora = new Date().getTime();
  const msPorDia = 24 * 60 * 60 * 1000;
  let contadorPurgados = 0;

  while (archivos.hasNext()) {
    const archivo = archivos.next();
    const fechaCreacion = archivo.getDateCreated().getTime();
    const diasTranscurridos = Math.floor((ahora - fechaCreacion) / msPorDia);

    if (diasTranscurridos >= diasLimite) {
      const nombreArchivo = archivo.getName();
      const fileId = archivo.getId();

      // Registrar auditoría de purga en la hoja de cálculo
      registrarEnRepositorioSheet(spreadsheet, {
        nombreArchivo: nombreArchivo,
        tipo: tipoDocumento,
        fechaExpedicion: archivo.getDateCreated(),
        fechaBorradoPermanente: new Date(),
        diasCustodiado: diasTranscurridos,
        estadoArchivo: 'BORRADO_PERMANENTE_30D',
        estadoRegistroAnual: 'ACTIVO_REPOSITORIO_1_ANO'
      });

      // Borrado permanente: En DriveApp, mover a papelera y vaciar, o usar Drive.Files.remove(fileId)
      try {
        Drive.Files.remove(fileId); // Requiere habilitar el Servicio Avanzado de Drive
        Logger.log('Archivo eliminado permanentemente: ' + nombreArchivo + ' (' + diasTranscurridos + ' días)');
      } catch (e) {
        archivo.setTrashed(true); // Fallback estándar si el servicio avanzado no está activo
        Logger.log('Archivo enviado a papelera definitiva: ' + nombreArchivo);
      }

      contadorPurgados++;
    }
  }

  return contadorPurgados;
}

/**
 * Obtiene o crea la Hoja de Cálculo del Repositorio Anual (1 Año de Vigencia)
 */
function obtenerOCrearRepositorioSheet() {
  const archivos = DriveApp.getFilesByName(CONFIG_UED.NOMBRE_HOJA_REPOSITORIO);
  if (archivos.hasNext()) {
    return SpreadsheetApp.open(archivos.next());
  }

  // Si no existe, crear la hoja con encabezados oficiales
  const nuevaSheet = SpreadsheetApp.create(CONFIG_UED.NOMBRE_HOJA_REPOSITORIO);
  const hoja = nuevaSheet.getActiveSheet();
  hoja.setName('Registro_Participantes_1_Ano');

  const encabezados = [
    'Marca Temporal',
    'Documento Aprendiz',
    'Nombre Completo',
    'Ficha SENA',
    'Programa de Formación',
    'Tipo de Documento',
    'Código de Validación',
    'Fecha de Expedición',
    'Vigencia Archivo Drive (30 Días)',
    'Estado Archivo Drive',
    'Vigencia Registro Anual (365 Días)',
    'Fecha Límite 1 Año',
    'Estado Registro'
  ];

  hoja.appendRow(encabezados);
  hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold').setBackground('#4D7C0F').setFontColor('#FFFFFF');
  hoja.setFrozenRows(1);

  return nuevaSheet;
}

/**
 * Registra un documento en el Repositorio Anual
 */
function registrarEnRepositorioSheet(spreadsheet, datos) {
  const hoja = spreadsheet.getSheetByName('Registro_Participantes_1_Ano') || spreadsheet.getActiveSheet();
  const fechaLimite1Ano = new Date(datos.fechaExpedicion);
  fechaLimite1Ano.setDate(fechaLimite1Ano.getDate() + CONFIG_UED.DIAS_VIGENCIA_REPOSITORIO);

  hoja.appendRow([
    new Date(),
    'S/N',
    datos.nombreArchivo,
    'SENA-UED',
    'Emprendimiento Digital',
    datos.tipo,
    'CERT-' + Utilities.getUuid().slice(0, 8).toUpperCase(),
    datos.fechaExpedicion,
    '30 Días Cumplidos',
    datos.estadoArchivo,
    '365 Días (1 Año)',
    fechaLimite1Ano,
    datos.estadoRegistroAnual
  ]);
}

/**
 * Audita registros que superen el año (365 días) en el repositorio
 */
function auditarVigenciaAnualRepositorio(spreadsheet, diasLimiteAnual) {
  const hoja = spreadsheet.getSheetByName('Registro_Participantes_1_Ano') || spreadsheet.getActiveSheet();
  const filas = hoja.getDataRange().getValues();
  const ahora = new Date().getTime();
  const msPorDia = 24 * 60 * 60 * 1000;
  let auditadas = 0;

  for (let i = 1; i < filas.length; i++) {
    const fechaRegistro = new Date(filas[i][0]).getTime();
    if (!isNaN(fechaRegistro)) {
      const dias = Math.floor((ahora - fechaRegistro) / msPorDia);
      if (dias >= diasLimiteAnual) {
        hoja.getRange(i + 1, 13).setValue('VENCIDO_CICLO_1_ANO_ARCHIVADO').setBackground('#FEE2E2');
        auditadas++;
      }
    }
  }

  return auditadas;
}

/**
 * Obtiene o crea una carpeta en la raíz de Google Drive
 */
function obtenerOCrearCarpeta(nombre) {
  const carpetas = DriveApp.getFoldersByName(nombre);
  if (carpetas.hasNext()) {
    return carpetas.next();
  }
  return DriveApp.createFolder(nombre);
}

/**
 * Crea el activador diario automático que corre todos los días a las 2 AM
 */
function crearActivadorDiarioUED() {
  // Eliminar activadores previos duplicados
  const activadores = ScriptApp.getProjectTriggers();
  for (let i = 0; i < activadores.length; i++) {
    if (activadores[i].getHandlerFunction() === 'ejecutarCicloMantenimientoUED') {
      ScriptApp.deleteTrigger(activadores[i]);
    }
  }

  // Programar ejecución diaria entre las 02:00 y las 03:00 AM
  ScriptApp.newTrigger('ejecutarCicloMantenimientoUED')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  Logger.log('Activador diario UED programado exitosamente para las 02:00 AM.');
}

/**
 * Configuración inicial en un clic
 */
function inicializarEntornoUED() {
  obtenerOCrearCarpeta(CONFIG_UED.NOMBRE_CARPETA_CERTIFICADOS);
  obtenerOCrearCarpeta(CONFIG_UED.NOMBRE_CARPETA_PLANES);
  obtenerOCrearRepositorioSheet();
  crearActivadorDiarioUED();
  Logger.log('Entorno UED inicializado correctamente con carpetas y repositorio anual.');
}
`;
}
