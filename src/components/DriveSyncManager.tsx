import { useState, useEffect } from 'react';
import {
  DriveFichaFolder,
  getLocalDriveFolders,
  createFichaFolderInDrive,
  deleteFichaFolderFromDrive,
  exportLearnersToGoogleSheet,
} from '../services/workspaceService';
import { generateAlertMessageWithGemini } from '../services/geminiService';
import { getAccessToken } from '../auth';

interface DriveSyncManagerProps {
  learners: any[];
}

export default function DriveSyncManager({ learners }: DriveSyncManagerProps) {
  const [folders, setFolders] = useState<DriveFichaFolder[]>([]);
  const [newFicha, setNewFicha] = useState('');
  const [newProgram, setNewProgram] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [generatedMsgModal, setGeneratedMsgModal] = useState<{ ficha: string; text: string } | null>(null);

  const hasGoogleToken = !!getAccessToken();

  useEffect(() => {
    // Load stored folders
    const stored = getLocalDriveFolders();
    setFolders(stored);

    // Auto-detect any fichas in registered learners that aren't yet in Drive folders
    const existingFichas = new Set(stored.map(f => f.ficha));
    const uniqueLearnerFichas = Array.from(new Set(learners.map(l => l.ficha).filter(Boolean)));

    uniqueLearnerFichas.forEach(f => {
      if (!existingFichas.has(f)) {
        const sampleLearner = learners.find(l => l.ficha === f);
        createFichaFolderInDrive(f, sampleLearner?.program || 'Emprendimiento', learners).then(() => {
          setFolders(getLocalDriveFolders());
        });
      }
    });
  }, [learners]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFicha.trim() || !newProgram.trim()) return;

    setLoading(true);
    try {
      const created = await createFichaFolderInDrive(newFicha.trim(), newProgram.trim(), learners);
      setFolders(getLocalDriveFolders());
      setNewFicha('');
      setNewProgram('');
      setMessage(`Carpeta "${created.name}" creada y sincronizada con éxito en Drive y Sheets.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setMessage('Error al crear la carpeta en Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    setLoading(true);
    try {
      await deleteFichaFolderFromDrive(folderId);
      setFolders(getLocalDriveFolders());
      setDeleteConfirmId(null);
      setMessage(`La carpeta "${folderName}" ha sido eliminada y desvinculada de la sincronización.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Error al eliminar la carpeta.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSheet = async (folder: DriveFichaFolder) => {
    setLoading(true);
    try {
      const result = await exportLearnersToGoogleSheet(folder.ficha, learners);
      setMessage(`Se sincronizaron ${result.count} aprendices en la hoja de cálculo de Google Sheets.`);
      window.open(result.url, '_blank');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Error al sincronizar con Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroupAlert = async (folder: DriveFichaFolder) => {
    setLoading(true);
    try {
      const text = await generateAlertMessageWithGemini(
        `Aprendices Ficha ${folder.ficha}`,
        folder.ficha,
        folder.program,
        65,
        ['Módulo 3: Operación', 'Módulo 5: Plan Financiero'],
        'WhatsApp'
      );
      setGeneratedMsgModal({ ficha: folder.ficha, text });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xl shadow">
            📁
          </div>
          <div>
            <h3 className="font-semibold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              Sincronizador Google Drive & Google Sheets
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200">
                {hasGoogleToken ? 'Conectado a Google Workspace' : 'Modo Sincronizado UED'}
              </span>
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Las carpetas por ficha y sus hojas de cálculo se organizan automáticamente para el control del asesor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-900 dark:text-emerald-200">
            {folders.length} Fichas organizadas en Drive
          </span>
        </div>
      </div>

      {message && (
        <div className="p-3 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 animate-fade-in flex items-center justify-between">
          <span>✓ {message}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Form: Add New Ficha Folder */}
      <form
        onSubmit={handleCreateFolder}
        className="p-5 bg-white dark:bg-emerald-900/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col md:flex-row items-end gap-3"
      >
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
            Número de Ficha
          </label>
          <input
            type="text"
            placeholder="Ej: 2845612"
            value={newFicha}
            onChange={e => setNewFicha(e.target.value)}
            required
            className="w-full p-2.5 text-sm rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full md:w-1/2">
          <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
            Programa de Formación
          </label>
          <input
            type="text"
            placeholder="Ej: Multimedia y Negocios Digitales"
            value={newProgram}
            onChange={e => setNewProgram(e.target.value)}
            required
            className="w-full p-2.5 text-sm rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>+ Sincronizar Nueva Ficha en Drive</span>
        </button>
      </form>

      {/* Folders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {folders.map(folder => {
          const fichaLearners = learners.filter(l => l.ficha === folder.ficha);

          return (
            <div
              key={folder.id}
              className="p-5 bg-white dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📁</span>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                        {folder.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-emerald-400">
                        Ficha: <strong className="text-emerald-700 dark:text-emerald-300">{folder.ficha}</strong> · {folder.program}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                    Sincronizado
                  </span>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400">Aprendices vinculados:</span>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {fichaLearners.length || folder.learnerCount} registrados
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-emerald-400">Última sync:</span>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {folder.modifiedAt || folder.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/80 flex flex-wrap gap-2 text-xs">
                {/* Open Drive folder */}
                <a
                  href={folder.webViewLink || `https://drive.google.com/drive/search?q=${encodeURIComponent(folder.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-200 font-medium flex items-center gap-1"
                >
                  <span>Google Drive ↗</span>
                </a>

                {/* Google Sheet export/open */}
                <button
                  onClick={() => handleExportSheet(folder)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-sm"
                >
                  <span>📊 Hoja de Cálculo</span>
                </button>

                {/* WhatsApp Group Alert with Gemini */}
                <button
                  onClick={() => handleGenerateGroupAlert(folder)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-1 shadow-sm"
                >
                  <span>💬 Alerta Gemini 3.8 Flash</span>
                </button>

                {/* Delete folder */}
                <button
                  onClick={() => setDeleteConfirmId(folder.id)}
                  disabled={loading}
                  className="px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium ml-auto"
                  title="Eliminar carpeta de Drive"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Delete Operation (Google Workspace policy mandatory) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl max-w-md w-full border border-red-200 dark:border-red-900 shadow-2xl">
            <h4 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
              ¿Eliminar carpeta de Drive?
            </h4>
            <p className="text-sm text-slate-700 dark:text-emerald-200 mb-6">
              Esta acción eliminará la carpeta de la ficha y desvinculará la sincronización de archivos de Google Drive y Google Sheets. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const target = folders.find(f => f.id === deleteConfirmId);
                  if (target) handleDeleteFolder(target.id, target.name);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow"
              >
                Confirmar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Alert Modal */}
      {generatedMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl max-w-lg w-full border border-emerald-300 dark:border-emerald-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <span>💬 Mensaje Generado con Gemini 3.8 Flash</span>
              </h4>
              <button
                onClick={() => setGeneratedMsgModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-emerald-400">
              Mensaje institucional listo para enviar por WhatsApp al grupo de la Ficha {generatedMsgModal.ficha}:
            </p>
            <textarea
              readOnly
              value={generatedMsgModal.text}
              className="w-full h-36 p-3 text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedMsgModal.text);
                  alert('¡Mensaje copiado al portapapeles!');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-semibold hover:bg-emerald-200"
              >
                📋 Copiar Texto
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(generatedMsgModal.text)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
              >
                Abrir en WhatsApp Web
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
