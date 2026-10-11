const DIAS_ETIQUETA = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export default function ChoirsView({
  choirs = [],
  students = [],
  onAddChoir,
  onEditChoir,
  onDeleteChoir,
}) {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Coros y Sedes</h2>
          <p className="text-xs text-slate-500">Gestión de grupos y espacios de ensayo</p>
        </div>
        <button
          type="button"
          onClick={onAddChoir}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>＋</span> Nuevo Coro
        </button>
      </div>

      <div className="space-y-3">
        {choirs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl">
            No hay coros registrados.
          </p>
        ) : (
          choirs.map((choir) => {
            const studentCount = students.filter((s) => {
              if (!s.activo) return false;
              return (Array.isArray(s.coroIds) ? s.coroIds : []).includes(choir.id);
            }).length;

            const sedeNombre = choir.sede?.nombre;
            const sedeLocalidad = choir.sede?.localidad;
            const horarioTexto = [
              choir.diaSemana ? DIAS_ETIQUETA[choir.diaSemana] || choir.diaSemana : null,
              choir.horario ? `${choir.horario} hs` : null,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={choir.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex justify-between items-center"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">{choir.nombre}</h3>
                  {sedeNombre && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      📍 {sedeNombre}
                      {sedeLocalidad ? ` (${sedeLocalidad})` : ''}
                    </p>
                  )}
                  {horarioTexto && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      🕒 {horarioTexto}
                    </p>
                  )}
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 rounded-md">
                      👥 {studentCount} participante{studentCount !== 1 ? 's' : ''} activo{studentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditChoir(choir)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                    title="Editar Coro"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteChoir(choir.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                    title="Eliminar Coro"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
