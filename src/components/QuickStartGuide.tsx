export default function QuickStartGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-emerald-950/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg border border-emerald-200">
        <h2 className="text-2xl font-bold text-emerald-900 mb-4">Bienvenido a la UED</h2>
        <p className="text-emerald-800 mb-6">
          Sigue estos pasos para comenzar tu plan de negocios:
        </p>
        <ul className="list-decimal list-inside text-emerald-800 space-y-2 mb-6">
          <li>Selecciona un módulo de la lista lateral.</li>
          <li>Completa el desafío y el quiz de evaluación.</li>
          <li>Envía tu progreso para que tu asesor lo revise.</li>
        </ul>
        <button onClick={onClose} className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
          Entendido
        </button>
      </div>
    </div>
  );
}
