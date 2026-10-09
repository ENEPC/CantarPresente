import { useState } from 'react';

export default function ParticipantsView({
  students = [],
  choirs = [],
  onAddStudent,
  onEditStudent,
  onToggleStatus,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChoirId, setFilterChoirId] = useState('all');

  const filteredStudents = students.filter((student) => {
    const studentChoirIds = Array.isArray(student.choirIds)
      ? student.choirIds
      : student.choirId
      ? [student.choirId]
      : [];

    const belongsToChoir =
      filterChoirId === 'all' ||
      studentChoirIds.map(Number).includes(Number(filterChoirId));

    const matchesSearch =
      `${student.name} ${student.lastname} ${student.tutor || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return belongsToChoir && matchesSearch;
  });

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Participantes</h2>
          <p className="text-xs text-slate-500">Padrón general de integrantes</p>
        </div>
        <button
          type="button"
          onClick={onAddStudent}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>＋</span> Nuevo Participante
        </button>
      </div>

      <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o tutor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
        />

        <select
          value={filterChoirId}
          onChange={(e) => setFilterChoirId(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
        >
          <option value="all">Todos los Coros / Sedes</option>
          {choirs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        {filteredStudents.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl">
            No se encontraron participantes.
          </p>
        ) : (
          filteredStudents.map((s) => {
            const studentChoirIds = Array.isArray(s.choirIds)
              ? s.choirIds
              : s.choirId
              ? [s.choirId]
              : [];

            const assignedChoirNames = choirs
              .filter((c) => studentChoirIds.map(Number).includes(Number(c.id)))
              .map((c) => c.name);

            return (
              <div
                key={s.id}
                className={`p-3 bg-white border rounded-xl shadow-xs transition-opacity ${
                  s.active ? 'border-slate-200' : 'border-slate-100 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {s.lastname}, {s.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tutor: {s.tutor || 'No especificado'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditStudent(s)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(s.id)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        s.active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {s.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                  {assignedChoirNames.length === 0 ? (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      Sin coro asignado
                    </span>
                  ) : (
                    assignedChoirNames.map((cName, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md"
                      >
                        🎵 {cName}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}