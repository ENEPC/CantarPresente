import { useState } from 'react';

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
  onToggleChoirStatus,
}) {
  const [filterStatus, setFilterStatus] = useState('activos');

  const filteredChoirs = choirs.filter((c) =>
    filterStatus === 'activos' ? c.activo : !c.activo
  );

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

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
        >
          <option value="activos">Coros Activos</option>
          <option value="inactivos">Coros Inactivos</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredChoirs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl">
            {filterStatus === 'activos'
              ? 'No hay coros activos.'
              : 'No hay coros inactivos.'}
          </p>
        ) : (
          filteredChoirs.map((choir) => {
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
                className={`p-4 bg-white border rounded-xl shadow-xs flex justify-between items-center transition-opacity ${
                  choir.activo ? 'border-slate-200' : 'border-slate-100 opacity-60 bg-slate-50/50'
                }`}
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
                    onClick={() => onToggleChoirStatus(choir.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      choir.activo
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {choir.activo ? 'Activo' : 'Inactivo'}
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
