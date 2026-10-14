import { useState, useEffect } from 'react';

export default function StatsView({ choirs = [], students = [], attendances = [] }) {
  const [selectedChoirId, setSelectedChoirId] = useState(() => choirs[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (choirs.length > 0 && !choirs.some((c) => c.id === selectedChoirId)) {
      setSelectedChoirId(choirs[0].id);
    }
  }, [choirs, selectedChoirId]);

  // Alumnos activos asignados a este coro
  const activeStudents = (students || []).filter((s) => {
    if (!s.activo) return false;
    return Array.isArray(s.coroIds) && s.coroIds.includes(selectedChoirId);
  });

  // Rango de fechas: desde el 1° del mes seleccionado hasta la fecha elegida
  const [year, month] = (selectedDate || '').split('-');
  const startOfMonth = `${year}-${month}-01`;

  // Asistencias del coro dentro del mes hasta la fecha de corte
  const monthlyAttendances = (attendances || []).filter((a) => {
    return (
      a.coroId === selectedChoirId &&
      a.fecha >= startOfMonth &&
      a.fecha <= selectedDate
    );
  });

  const totalRehearsals = monthlyAttendances.length;

  // Cálculo individual por alumno
  const studentMetrics = activeStudents.map((s) => {
    const presents = monthlyAttendances.filter(
      (a) => a.asistencias?.[s.id] === 'presente'
    ).length;
    const absents = totalRehearsals - presents;
    const percentage = totalRehearsals > 0 ? Math.round((presents / totalRehearsals) * 100) : 0;

    return {
      ...s,
      presents,
      absents,
      percentage,
    };
  });

  // Porcentaje global del coro
  const totalPossible = totalRehearsals * activeStudents.length;
  const totalPresents = studentMetrics.reduce((acc, s) => acc + s.presents, 0);
  const globalPercentage = totalPossible > 0 ? Math.round((totalPresents / totalPossible) * 100) : 0;

  // Top 5 con Mayor Asistencia (orden descendente)
  const topPresent = [...studentMetrics]
    .sort((a, b) => b.percentage - a.percentage || b.presents - a.presents || a.apellido.localeCompare(b.apellido))
    .slice(0, 5);

  // Top 5 con Menor Asistencia (orden ascendente)
  const topAbsent = [...studentMetrics]
    .sort((a, b) => a.percentage - b.percentage || a.presents - b.presents || a.apellido.localeCompare(b.apellido))
    .slice(0, 5);

  const choirName = choirs.find((c) => c.id === selectedChoirId)?.nombre || 'Coro / Sede';

  return (
    <section className="space-y-4">
      {/* Selector de Coro y Fecha de corte */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Estadísticas de Asistencia</h2>
          <p className="text-xs text-slate-500">Métricas acumuladas del mes hasta la fecha indicada</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Coro / Sede</label>
            <select
              value={selectedChoirId}
              onChange={(e) => setSelectedChoirId(e.target.value)}
              className="w-full text-sm mt-1 p-2 border border-slate-300 rounded-lg bg-white"
            >
              {(choirs || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Hasta la fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-sm mt-1 p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      {/* Estado vacío o tarjetas con métricas */}
      {activeStudents.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl">
          No hay alumnos activos registrados en este coro.
        </p>
      ) : totalRehearsals === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-amber-800">Sin ensayos registrados</p>
          <p className="text-xs text-amber-600 mt-1">
            No hay clases registradas en {choirName} entre el {startOfMonth} y el {selectedDate}.
          </p>
        </div>
      ) : (
        <>
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs text-center">
              <span className="text-[11px] font-bold text-blue-600 uppercase">Asistencia Global</span>
              <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{globalPercentage}%</p>
              <span className="text-[10px] text-slate-500">{totalRehearsals} ensayos en el mes</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Padrón Activo</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{activeStudents.length}</p>
              <span className="text-[10px] text-slate-500">participantes evaluados</span>
            </div>
          </div>

          {/* Top 5 Mayor Asistencia */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
              <span>🌟</span> 5 Alumnos con Mayor Asistencia
            </h3>

            <div className="divide-y divide-slate-100">
              {topPresent.map((s, idx) => (
                <div key={s.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      #{idx + 1} {s.apellido}, {s.nombre}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {s.presents} de {totalRehearsals} presentes
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
                    {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Menor Asistencia */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1.5">
              <span>⚠️</span> 5 Alumnos con Menor Asistencia
            </h3>

            <div className="divide-y divide-slate-100">
              {topAbsent.map((s, idx) => (
                <div key={s.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      #{idx + 1} {s.apellido}, {s.nombre}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {s.absents} {s.absents === 1 ? 'ausencia' : 'ausencias'} ({s.presents} presentes)
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-600 border-rose-200">
                    {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}