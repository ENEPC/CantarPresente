const ESTADO_ESTILO = {
  presente: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  justificado: 'bg-amber-50 text-amber-700 border-amber-200',
  ausente: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ESTADO_ETIQUETA = {
  presente: 'Presente',
  justificado: 'Justificado',
  ausente: 'Ausente',
};

export default function StudentHistoryView({ student, attendances = [], choirs = [], onBack }) {
  const clases = [...attendances]
    .filter((a) => a.asistencias && a.asistencias[student.id] !== undefined)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const total = clases.length;
  const presentes = clases.filter((c) => c.asistencias[student.id] === 'presente').length;
  const ausentes = total - presentes;
  const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          ← Volver
        </button>
        <h2 className="text-base font-semibold text-slate-800">
          {student.apellido}, {student.nombre}
        </h2>
      </div>

      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-around text-center">
        <div>
          <p className="text-lg font-bold text-slate-800">{total}</p>
          <p className="text-[10px] text-slate-500">Clases</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-600">{presentes}</p>
          <p className="text-[10px] text-slate-500">Presentes</p>
        </div>
        <div>
          <p className="text-lg font-bold text-rose-600">{ausentes}</p>
          <p className="text-[10px] text-slate-500">Ausentes</p>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-600">{pct}%</p>
          <p className="text-[10px] text-slate-500">Asistencia</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {clases.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl">
            Este participante no tiene clases registradas.
          </p>
        ) : (
          clases.map((clase, index) => {
            const estado = clase.asistencias[student.id];
            const choir = choirs.find((c) => c.id === clase.coroId);
            return (
              <div
                key={`${clase.id}-${index}`}
                className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-blue-600">{clase.fecha}</p>
                  <p className="text-xs text-slate-500">
                    {choir?.nombre || 'Coro / Sede no especificada'}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    ESTADO_ESTILO[estado] || ESTADO_ESTILO.ausente
                  }`}
                >
                  {ESTADO_ETIQUETA[estado] || ESTADO_ETIQUETA.ausente}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
