export default function Header({
  online = true,
  pendientes = 0,
  errores = 0,
  sincronizando = false,
  onSync,
  usuario,
  onLogout,
  onOpenErrores,
}) {
  const hayPendientes = pendientes > 0;
  const hayErrores = errores > 0;
  const estado = !online
    ? { texto: 'Sin conexión', clase: 'bg-slate-500' }
    : hayErrores
    ? { texto: `${errores} ${errores === 1 ? 'error' : 'errores'} · Revisar`, clase: 'bg-red-600' }
    : hayPendientes
    ? { texto: `${pendientes} por sincronizar`, clase: 'bg-amber-500' }
    : { texto: 'Sincronizado', clase: 'bg-emerald-500' };

  const pillClase = `text-[10px] text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${estado.clase}`;
  const pillContenido = (
    <>
      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
      {estado.texto}
    </>
  );

  return (
    <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-30">
      <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-2xl">🎵</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Cantar Presente</h1>
            <p className="text-xs text-blue-200">
              {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sembrar Cantando'}
            </p>
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
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              className="text-xs font-semibold text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              Salir
            </button>
          )}
          {hayErrores && onOpenErrores ? (
            <button
              type="button"
              onClick={onOpenErrores}
              title="Revisar y gestionar los errores de sincronización"
              className={`${pillClase} cursor-pointer`}
            >
              {pillContenido}
            </button>
          ) : (
            <span className={pillClase}>{pillContenido}</span>
          )}
        </div>
      </div>
    </header>
  );
}
