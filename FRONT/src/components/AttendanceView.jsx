import { useState, useEffect } from 'react';

export default function AttendanceView({
  choirs = [],
  students = [],
  attendances = [],
  onSaveAttendance,
}) {
  const [selectedChoirId, setSelectedChoirId] = useState(() => choirs[0]?.id || 1);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [currentAttendance, setCurrentAttendance] = useState({});

  useEffect(() => {
    if (choirs.length > 0 && !choirs.some((c) => c.id === Number(selectedChoirId))) {
      setSelectedChoirId(choirs[0].id);
    }
  }, [choirs, selectedChoirId]);

  useEffect(() => {
    const existing = (attendances || []).find(
      (a) => a.choirId === Number(selectedChoirId) && a.date === selectedDate
    );
    setCurrentAttendance(existing ? { ...existing.records } : {});
  }, [selectedChoirId, selectedDate, attendances]);

  // Filtra participantes asignados al coro seleccionado (soporta múltiples coros)
  const activeStudents = (students || []).filter((s) => {
    if (!s.active) return false;
    const cIds = Array.isArray(s.choirIds) ? s.choirIds : [s.choirId];
    return cIds.map(Number).includes(Number(selectedChoirId));
  });

  const togglePresence = (studentId) => {
    setCurrentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const presentCount = activeStudents.filter((s) => currentAttendance[s.id] === true).length;
  const absentCount = activeStudents.length - presentCount;

  const handleSave = () => {
    if (!selectedDate) return alert('Seleccioná una fecha válida.');
    if (typeof onSaveAttendance === 'function') {
      onSaveAttendance(Number(selectedChoirId), selectedDate, currentAttendance);
      alert('¡Asistencia guardada exitosamente en el dispositivo!');
    }
  };

  return (
    <section className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
        <h2 className="text-base font-semibold text-slate-700">Toma de Asistencia</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Coro / Sede</label>
            <select
              value={selectedChoirId}
              onChange={(e) => setSelectedChoirId(Number(e.target.value))}
              className="w-full text-sm mt-1 p-2 border border-slate-300 rounded-lg bg-white"
            >
              {(choirs || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Fecha del Ensayo</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-sm mt-1 p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs px-2 text-slate-600 font-medium">
        <span>
          Participantes: <strong className="text-slate-900">{activeStudents.length}</strong>
        </span>
        <span>
          Presentes: <strong className="text-emerald-600">{presentCount}</strong>
        </span>
        <span>
          Ausentes: <strong className="text-rose-600">{absentCount}</strong>
        </span>
      </div>

      <div className="space-y-2">
        {activeStudents.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl">
            No hay participantes registrados en este coro.
          </p>
        ) : (
          activeStudents.map((s) => {
            const isPresent = Boolean(currentAttendance[s.id]);
            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {s.lastname}, {s.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Tutor: {s.tutor || 'No especificado'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePresence(s.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer ${
                    isPresent
                      ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                      : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isPresent ? '✓ Presente' : '✕ Ausente'}
                </button>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
      >
        Guardar Asistencia Local
      </button>
    </section>
  );
}