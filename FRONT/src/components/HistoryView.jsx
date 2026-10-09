export default function HistoryView({ attendances = [], choirs = [], students = [] }) {
  const sortedAttendances = [...attendances].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Historial Registrado</h2>
          <p className="text-xs text-slate-500">Registros de asistencia guardados localmente</p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedAttendances.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl">
            Aún no hay asistencias guardadas.
          </p>
        ) : (
          sortedAttendances.map((item, index) => {
            const choir = choirs.find((c) => c.id === item.choirId);

            // Filtro con soporte para array choirIds o choirId simple
            const choirStudents = students.filter((s) => {
              if (!s.active) return false;
              const cIds = Array.isArray(s.choirIds) ? s.choirIds : [s.choirId];
              return cIds.map(Number).includes(Number(item.choirId));
            });

            const total = choirStudents.length;
            const presents = choirStudents.filter(
              (s) => item.records?.[s.id] === true
            ).length;
            const absents = total - presents;
            const percentage = total > 0 ? Math.round((presents / total) * 100) : 0;

            let badgeColor = 'bg-rose-50 text-rose-600 border-rose-200';
            if (percentage >= 80) {
              badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
            } else if (percentage >= 50) {
              badgeColor = 'bg-amber-50 text-amber-600 border-amber-200';
            }

            return (
              <div
                key={`${item.choirId}-${item.date}-${index}`}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md">
                    {item.date}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
                  >
                    {percentage}% Asistencia
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  {choir?.name || 'Coro / Sede no especificada'}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span>
                    👥 Total: <strong className="text-slate-800">{total}</strong>
                  </span>
                  <span>
                    ✓ Presentes: <strong className="text-emerald-600">{presents}</strong>
                  </span>
                  <span>
                    ✕ Ausentes: <strong className="text-rose-600">{absents}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}