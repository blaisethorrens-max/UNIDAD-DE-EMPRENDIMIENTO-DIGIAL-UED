import { useState, useEffect } from 'react';
import {
  IssuedDocument,
  ParticipantRepositoryRecord,
  getIssuedDocuments,
  getParticipantRepository,
  runPermanentPurge30Days,
  registerDocumentIssuance,
  generateGoogleAppsScriptCode,
} from '../services/gasRetentionService';
import UEDLogo from './UEDLogo';

interface DriveRetentionManagerProps {
  learners: any[];
}

export default function DriveRetentionManager({ learners }: DriveRetentionManagerProps) {
  const [documents, setDocuments] = useState<IssuedDocument[]>([]);
  const [repository, setRepository] = useState<ParticipantRepositoryRecord[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'archivos30d' | 'repositorio1ano' | 'appscript'>('archivos30d');
  const [filterType, setFilterType] = useState<'all' | 'certificate' | 'business_plan'>('all');
  const [purgeResult, setPurgeResult] = useState<{
    totalPurged: number;
    purgedCertificates: number;
    purgedPlans: number;
    freedBytes: number;
  } | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Load documents and repository records
  const refreshData = () => {
    setDocuments(getIssuedDocuments());
    setRepository(getParticipantRepository());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRunPurge = async () => {
    setIsPurging(true);
    try {
      const result = await runPermanentPurge30Days();
      setPurgeResult(result);
      refreshData();
      setTimeout(() => setPurgeResult(null), 6000);
    } catch (e) {
      console.error('Error running purge:', e);
    } finally {
      setIsPurging(false);
    }
  };

  const handleCopyScript = () => {
    const code = generateGoogleAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleDownloadScript = () => {
    const code = generateGoogleAppsScriptCode();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Code_UED_Mantenimiento_Drive_30D_1Ano.gs';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateDocument = (daysAgo: number, type: 'certificate' | 'business_plan') => {
    const sampleLearner = learners[0] || {
      id: 'demo-learner',
      name: 'Aprendiz Prueba SENA',
      ficha: '2845612',
      program: 'ADSO',
      documento: '1020304050',
      email: 'prueba@gmail.com',
    };

    const res = registerDocumentIssuance(type, sampleLearner);

    // Ajustar artificialmente la fecha para simular antigüedad
    const now = Date.now();
    const simulatedTimestamp = now - daysAgo * 24 * 60 * 60 * 1000;
    const allDocs = getIssuedDocuments();
    const updated = allDocs.map(d => {
      if (d.id === res.doc.id) {
        return {
          ...d,
          issuedTimestamp: simulatedTimestamp,
          issuedDate: new Date(simulatedTimestamp).toISOString().split('T')[0],
          daysElapsed: daysAgo,
          daysRemaining: 30 - daysAgo,
          status: (daysAgo >= 30 ? 'purged_permanent' : daysAgo >= 25 ? 'expiring_soon' : 'active') as any,
        };
      }
      return d;
    });
    localStorage.setItem('ued_gas_issued_documents', JSON.stringify(updated));
    refreshData();
    setIsSimulateModalOpen(false);
  };

  // Metrics
  const activeCertificates = documents.filter(d => d.type === 'certificate' && d.status !== 'purged_permanent').length;
  const activePlans = documents.filter(d => d.type === 'business_plan' && d.status !== 'purged_permanent').length;
  const expiringSoonCount = documents.filter(d => d.status === 'expiring_soon').length;
  const purgedCount = documents.filter(d => d.status === 'purged_permanent').length;

  const filteredDocs = documents.filter(d => filterType === 'all' || d.type === filterType);

  return (
    <div className="space-y-6">
      {/* Top Banner with UED Branding */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#4D7C0F] via-[#365314] to-emerald-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border-2 border-[#39FF14]/40">
        <div className="flex items-center gap-4">
          <UEDLogo size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#EA580C] px-2 py-0.5 rounded font-extrabold text-white">
                Google Apps Script & Drive Engine
              </span>
              <span className="text-[10px] text-[#39FF14] font-mono font-bold">
                Ciclos 30 Días & 1 Año
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Sincronización y Borrado Permanente Automatizado
            </h2>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Gestión de ciclo de vida: <strong>borrado permanente a los 30 días</strong> de certificados y planes de negocios en Google Drive, con custodia y <strong>repositorio en Hoja de Cálculo durante 1 año</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunPurge}
            disabled={isPurging}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 border border-white/20 disabled:opacity-50"
            title="Ejecutar ciclo de borrado permanente de archivos con más de 30 días"
          >
            <span>🧹</span>
            <span>{isPurging ? 'Ejecutando Purga...' : 'Ejecutar Purga (>30 días)'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appscript')}
            className="px-3.5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#22c55e] text-slate-950 text-xs font-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 border border-white/30"
            title="Ver y configurar el script de Google Apps Script"
          >
            <span>⚡</span>
            <span>Google Apps Script</span>
          </button>

          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold border border-emerald-700 transition-all flex items-center gap-1.5"
            title="Simular expedición con antigüedad para probar la purga"
          >
            <span>➕ Simular</span>
          </button>
        </div>
      </div>

      {/* Purge Success Banner */}
      {purgeResult && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white border-2 border-[#39FF14] shadow-xl flex items-center justify-between gap-4 animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="font-bold text-sm text-[#39FF14]">
                ¡Ciclo de Borrado Permanente Completado con Éxito!
              </h4>
              <p className="text-emerald-200">
                Se eliminaron permanentemente <strong>{purgeResult.totalPurged} archivos</strong> con más de 30 días de expedidos ({purgeResult.purgedCertificates} certificados y {purgeResult.purgedPlans} planes).
                Se liberaron ~{Math.round(purgeResult.freedBytes / 1024)} KB en Google Drive. El repositorio anual de participantes se mantiene 100% íntegro.
              </p>
            </div>
          </div>
          <button onClick={() => setPurgeResult(null)} className="text-emerald-300 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* 3 Metric Cards for the 3 Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Certificados Expedidos (30 Días) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-emerald-950/40 border-2 border-[#4D7C0F] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📜</span>
            <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#4D7C0F]/20 text-[#4D7C0F] dark:text-[#39FF14] border border-[#4D7C0F]/40">
              Retención: 30 Días
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-emerald-400 font-medium block">
              Carpeta Google Drive:
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              UED_Certificados_Expedidos_30D
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-emerald-800/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Archivos Activos:</span>
              <strong className="text-lg font-black text-[#4D7C0F] dark:text-[#39FF14]">
                {activeCertificates}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Purgados (&gt;30d):</span>
              <strong className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                {documents.filter(d => d.type === 'certificate' && d.status === 'purged_permanent').length}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Planes de Negocios (30 Días) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-emerald-950/40 border-2 border-orange-400 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📑</span>
            <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-300">
              Retención: 30 Días
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-emerald-400 font-medium block">
              Carpeta Google Drive:
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              UED_Planes_Negocio_Expedidos_30D
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-emerald-800/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Archivos Activos:</span>
              <strong className="text-lg font-black text-orange-600 dark:text-orange-400">
                {activePlans}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Purgados (&gt;30d):</span>
              <strong className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                {documents.filter(d => d.type === 'business_plan' && d.status === 'purged_permanent').length}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Repositorio en Hoja de Cálculo (1 Año) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📊</span>
            <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-400">
              Retención: 1 Año (365d)
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-emerald-400 font-medium block">
              Google Sheets Central:
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              UED_Repositorio_Anual_Participantes
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-emerald-800/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Participantes Custodiados:</span>
              <strong className="text-lg font-black text-emerald-700 dark:text-[#39FF14]">
                {repository.length}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Vigencia Anual:</span>
              <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-300 block mt-1">
                365 Días Activo
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('archivos30d')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'archivos30d'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span>📁</span>
          <span>Archivos en Drive (Ciclo de 30 Días)</span>
          <span className="ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-emerald-900">
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('repositorio1ano')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'repositorio1ano'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span>📊</span>
          <span>Repositorio en Hoja de Cálculo (Ciclo de 1 Año)</span>
          <span className="ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-bold">
            {repository.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('appscript')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'appscript'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
              : 'border-transparent text-emerald-900 dark:text-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span>⚡</span>
          <span>Script Automatizado (Code.gs & Activador)</span>
        </button>
      </div>

      {/* SUBTAB 1: ARCHIVOS DRIVE (30 DIAS) */}
      {activeSubTab === 'archivos30d' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-emerald-200">Filtrar por tipo:</span>
              <div className="flex gap-1">
                {(['all', 'certificate', 'business_plan'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === t
                        ? 'bg-[#4D7C0F] text-white'
                        : 'bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300'
                    }`}
                  >
                    {t === 'all' ? 'Todos' : t === 'certificate' ? 'Certificados (30d)' : 'Planes (30d)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-emerald-400">
              Mostrando {filteredDocs.length} archivos · {expiringSoonCount} próximos a vencer (&lt; 5d) · {purgedCount} purgados
            </div>
          </div>

          {/* Table of Issued Files with 30-Day Expiration Progress */}
          <div className="bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#4D7C0F] text-white font-mono text-[11px]">
                  <tr>
                    <th className="p-3 text-left">Documento / Archivo</th>
                    <th className="p-3 text-left">Aprendiz & Ficha</th>
                    <th className="p-3 text-center">Fecha Expedición</th>
                    <th className="p-3 text-center">Ciclo de 30 Días</th>
                    <th className="p-3 text-center">Días Restantes</th>
                    <th className="p-3 text-right">Estado en Drive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
                  {filteredDocs.map(doc => {
                    const percentElapsed = Math.min(100, Math.round((doc.daysElapsed / 30) * 100));
                    return (
                      <tr key={doc.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                        {/* File Name & Type */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl shrink-0">
                              {doc.type === 'certificate' ? '📜' : '📑'}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                                {doc.filename}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Carpeta: {doc.type === 'certificate' ? 'UED_Certificados_Expedidos_30D' : 'UED_Planes_Negocio_Expedidos_30D'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Learner Info */}
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-emerald-100">
                            {doc.learnerName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Ficha: <strong>{doc.ficha}</strong> · Doc: {doc.documento}
                          </div>
                        </td>

                        {/* Issued Date */}
                        <td className="p-3 text-center font-mono text-slate-600 dark:text-emerald-300">
                          {doc.issuedDate}
                        </td>

                        {/* 30-Day Progress Bar */}
                        <td className="p-3 text-center">
                          <div className="w-28 mx-auto space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                              <span>Día {doc.daysElapsed}</span>
                              <span>30d</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-emerald-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  doc.status === 'purged_permanent'
                                    ? 'bg-rose-600'
                                    : doc.status === 'expiring_soon'
                                    ? 'bg-amber-500'
                                    : 'bg-[#4D7C0F]'
                                }`}
                                style={{ width: `${percentElapsed}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Days Remaining */}
                        <td className="p-3 text-center font-mono">
                          {doc.status === 'purged_permanent' ? (
                            <span className="text-rose-600 font-bold text-[11px]">0 días (Vencido)</span>
                          ) : (
                            <span className={`font-bold text-xs ${doc.daysRemaining <= 5 ? 'text-amber-600 animate-pulse' : 'text-[#4D7C0F]'}`}>
                              {doc.daysRemaining} días
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 text-right">
                          {doc.status === 'purged_permanent' ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-300">
                              🗑️ Borrado Permanente
                            </span>
                          ) : doc.status === 'expiring_soon' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-300">
                              ⚠️ Próximo a Purgar
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-mono text-[10px] font-bold border border-emerald-300">
                              ✓ Activo en Drive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: REPOSITORIO ANUAL (1 AÑO) */}
      {activeSubTab === 'repositorio1ano' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-emerald-200 space-y-1">
            <div className="font-bold text-emerald-900 dark:text-white flex items-center gap-2">
              <span>📊 Repositorio Central de Participantes (Hoja de Cálculo Oficial UED):</span>
            </div>
            <p className="leading-relaxed">
              Mientras los archivos PDF en Google Drive se purgan automáticamente a los <strong>30 días</strong> para optimizar el almacenamiento institucional, esta Hoja de Cálculo mantiene la <strong>custodia y trazabilidad de todos los participantes durante 1 año calendario (365 días)</strong> para fines de auditoría del comité y Fondo Emprender.
            </p>
          </div>

          <div className="bg-white dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#4D7C0F] text-white font-mono text-[11px]">
                  <tr>
                    <th className="p-3 text-left">Participante / C.C.</th>
                    <th className="p-3 text-left">Ficha / Programa</th>
                    <th className="p-3 text-center">Código Certificación</th>
                    <th className="p-3 text-center">Fecha Registro</th>
                    <th className="p-3 text-center">Vigencia Anual (1 Año)</th>
                    <th className="p-3 text-center">Archivo 30d</th>
                    <th className="p-3 text-right">Estado Repositorio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
                  {repository.map(rec => (
                    <tr key={rec.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{rec.learnerName}</div>
                        <div className="text-[11px] text-slate-500">Doc: {rec.documento} · {rec.email}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-emerald-800 dark:text-emerald-300">Ficha: {rec.ficha}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{rec.program}</div>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-[#EA580C]">
                        {rec.certificateCode}
                      </td>

                      <td className="p-3 text-center font-mono text-slate-600 dark:text-emerald-300">
                        {rec.registeredDate}
                      </td>

                      <td className="p-3 text-center font-mono">
                        <span className="font-bold text-emerald-700 dark:text-[#39FF14]">
                          {rec.daysRemainingAnnual} días restantes
                        </span>
                        <span className="block text-[10px] text-slate-400">Vence: {rec.expirationDate1Year}</span>
                      </td>

                      <td className="p-3 text-center">
                        {rec.certificateStatus === 'file_purged_30d_archived' ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-mono">
                            Archivo purgado (30d)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#39FF14]/20 text-[#365314] dark:text-[#39FF14] text-[10px] font-mono font-bold">
                            Archivo disponible
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-mono text-[10px] font-bold border border-emerald-300">
                          ✓ Custodia 1 Año Activa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: GOOGLE APPS SCRIPT CODE & CRON TRIGGER */}
      {activeSubTab === 'appscript' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 text-white border-2 border-emerald-500 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#39FF14] to-[#4D7C0F] text-slate-950 flex items-center justify-center font-mono font-black text-lg">
                  gs
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Código Google Apps Script Oficial (Code.gs)
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Ejecutor diario programado a las 02:00 AM para borrado de 30 días y custodia de 1 año
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FB923C] to-[#EA580C] hover:from-[#f97316] hover:to-[#c2410c] text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📋</span>
                  <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>

                <button
                  onClick={handleDownloadScript}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📥 Descargar .gs</span>
                </button>

                <a
                  href="https://script.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>🔗 Abrir script.google.com</span>
                </a>
              </div>
            </div>

            {/* Step-by-Step Deployment Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 space-y-1">
                <span className="font-bold text-[#39FF14] block">Paso 1: Abrir Editor</span>
                <p className="text-slate-300 text-[11px]">
                  Entra a script.google.com con tu cuenta institucional SENA y pulsa en "Nuevo Proyecto".
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 space-y-1">
                <span className="font-bold text-[#39FF14] block">Paso 2: Pegar Código</span>
                <p className="text-slate-300 text-[11px]">
                  Pega el código íntegro en el archivo <code>Código.gs</code> y guarda el proyecto con Ctrl+S.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 space-y-1">
                <span className="font-bold text-[#39FF14] block">Paso 3: Inicializar</span>
                <p className="text-slate-300 text-[11px]">
                  Selecciona la función <code>inicializarEntornoUED</code> y pulsa "Ejecutar" otorgando permisos de Drive.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 space-y-1">
                <span className="font-bold text-[#39FF14] block">Paso 4: Activador 24/7</span>
                <p className="text-slate-300 text-[11px]">
                  El activador diario automático correrá todas las madrugadas (02:00 AM) de forma perpetua.
                </p>
              </div>
            </div>

            {/* Code Box */}
            <div className="p-4 rounded-2xl bg-black/80 font-mono text-xs text-emerald-300 border border-emerald-900 max-h-80 overflow-y-auto leading-relaxed">
              <pre>{generateGoogleAppsScriptCode()}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal to test different retention ages */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white dark:bg-emerald-950 p-6 rounded-3xl max-w-md w-full border border-emerald-300 dark:border-emerald-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🧪</span> Simulador de Expedición y Antigüedad
              </h4>
              <button onClick={() => setIsSimulateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <p className="text-slate-600 dark:text-emerald-300 text-[11px]">
              Genera un documento con antigüedad simulada para verificar cómo el motor de Google Apps Script detecta y purga los que superan 30 días.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleSimulateDocument(2, 'certificate')}
                className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-left hover:bg-emerald-100 transition-colors"
              >
                <strong className="text-emerald-900 dark:text-emerald-200 block">Certificado Expedido Hace 2 Días</strong>
                <span className="text-[10px] text-slate-500">Estado: Activo · Le restan 28 días de vigencia en Drive.</span>
              </button>

              <button
                onClick={() => handleSimulateDocument(28, 'business_plan')}
                className="w-full p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left hover:bg-amber-100 transition-colors"
              >
                <strong className="text-amber-900 dark:text-amber-200 block">Plan de Negocios Expedido Hace 28 Días</strong>
                <span className="text-[10px] text-slate-500">Estado: Próximo a vencer · Le restan 2 días para purga permanente.</span>
              </button>

              <button
                onClick={() => handleSimulateDocument(35, 'certificate')}
                className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-left hover:bg-rose-100 transition-colors"
              >
                <strong className="text-rose-900 dark:text-rose-200 block">Certificado Expedido Hace 35 Días (&gt;30d)</strong>
                <span className="text-[10px] text-slate-500">Estado: Vencido · Se purga permanentemente al correr el script.</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
