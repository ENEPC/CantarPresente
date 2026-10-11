export default function Header({
  online = true,
  pendientes = 0,
  errores = 0,
  sincronizando = false,
  onSync,
}) {
  const hayPendientes = pendientes > 0 || errores > 0;
  const estado = !online
    ? { texto: 'Sin conexión', clase: 'bg-slate-500' }
    : hayPendientes
    ? {
        texto: `${pendientes} por sincronizar${errores > 0 ? ` · ${errores} con error` : ''}`,
        clase: 'bg-amber-500',
      }
    : { texto: 'Sincronizado', clase: 'bg-emerald-500' };

  return (
    <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-30">
      <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-2xl">🎵</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Cantar Presente</h1>
            <p className="text-xs text-blue-200">Sembrar Cantando · Offline-first</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {online && hayPendientes && (
            <button
              type="button"
              onClick={onSync}
              disabled={sincronizando}
              className="text-xs font-semibold bg-white text-blue-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {sincronizando ? 'Sincronizando…' : 'Sincronizar'}
            </button>
          )}
          <span
            className={`text-[10px] text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${estado.clase}`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            {estado.texto}
          </span>
        </div>
      </div>
    </header>
  );
}
