import { useEffect } from 'react';
import { describirOp } from '../lib/sync.js';

export default function ErroresPanel({ isOpen, errores, choirs, onClose, onDescartar }) {
  useEffect(() => {
    if (isOpen && errores.length === 0) onClose();
  }, [errores, isOpen, onClose]);

  if (!isOpen) return null;

  const handleDescartar = (op) => {
    const descripcion = describirOp(op, choirs);
    if (
      confirm(
        `¿Descartar "${descripcion}"?\nEl cambio se eliminará de este dispositivo y no se volverá a intentar.`
      )
    ) {
      onDescartar(op.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold text-slate-800">Errores de sincronización</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Estos cambios no pudieron enviarse al servidor. Podés descartarlos para que dejen de
          bloquear la sincronización.
        </p>

        <div className="overflow-y-auto space-y-3 pr-1">
          {errores.map((op) => {
            const detalle = Array.isArray(op.error?.detalles) ? op.error.detalles : [];
            return (
              <div key={op.id} className="border border-red-200 bg-red-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-slate-800">{describirOp(op, choirs)}</p>
                <p className="text-xs text-red-700 mt-1">
                  {op.error?.mensaje || 'Error desconocido'}
                </p>
                {detalle.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {detalle.map((d, i) => (
                      <li key={i} className="text-xs text-slate-600">
                        {d.campo ? `${d.campo}: ` : ''}
                        {d.mensaje}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">
                    {op.error?.status ? `HTTP ${op.error.status}` : ''}
                    {op.creadoEn
                      ? `${op.error?.status ? ' · ' : ''}${new Date(op.creadoEn).toLocaleString()}`
                      : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDescartar(op)}
                    className="text-xs font-semibold bg-white text-red-600 border border-red-300 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
