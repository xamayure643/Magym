import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  titulo = "¿Estás seguro?", 
  mensaje = "Esta acción no se puede deshacer.", 
  textoConfirmar = "Eliminar", 
  textoCancel = "Cancelar",
  onConfirm, 
  onCancel,
  isDangerous = true 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-sm w-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{titulo}</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-zinc-300 font-medium">{mensaje}</p>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex justify-end gap-4">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 font-bold bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 rounded-lg transition-colors"
          >
            {textoCancel}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-6 py-2.5 font-bold rounded-lg transition duration-200 text-white ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95'
                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95'
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
