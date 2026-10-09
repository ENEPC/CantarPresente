import { useState, useEffect } from 'react';

export default function StudentModal({
  isOpen,
  onClose,
  onSave,
  choirs = [],
  editingStudent = null,
}) {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [tutor, setTutor] = useState('');
  const [selectedChoirIds, setSelectedChoirIds] = useState([]);

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name || '');
      setLastname(editingStudent.lastname || '');
      setTutor(editingStudent.tutor || '');

      // Compatibilidad: si ya tenía array choirIds o el choirId numérico inicial
      if (Array.isArray(editingStudent.choirIds)) {
        setSelectedChoirIds(editingStudent.choirIds.map(Number));
      } else if (editingStudent.choirId) {
        setSelectedChoirIds([Number(editingStudent.choirId)]);
      } else {
        setSelectedChoirIds([]);
      }
    } else {
      setName('');
      setLastname('');
      setTutor('');
      setSelectedChoirIds(choirs[0] ? [Number(choirs[0].id)] : []);
    }
  }, [editingStudent, isOpen, choirs]);

  if (!isOpen) return null;

  const handleToggleChoir = (id) => {
    const numId = Number(id);
    setSelectedChoirIds((prev) =>
      prev.includes(numId) ? prev.filter((cId) => cId !== numId) : [...prev, numId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !lastname.trim()) {
      return alert('El nombre y apellido son obligatorios.');
    }
    if (selectedChoirIds.length === 0) {
      return alert('Debés asignar al participante a por lo menos un coro o sede.');
    }

    onSave({
      id: editingStudent ? editingStudent.id : Date.now(),
      name: name.trim(),
      lastname: lastname.trim(),
      tutor: tutor.trim(),
      choirIds: selectedChoirIds,
      choirId: selectedChoirIds[0], // Compatibilidad con vistas simples
      active: editingStudent ? editingStudent.active : true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-base font-bold text-slate-800 mb-3">
          {editingStudent ? 'Editar Participante' : 'Nuevo Participante'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
            <input
              type="text"
              required
              placeholder="Ej: Mateo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Apellido *</label>
            <input
              type="text"
              required
              placeholder="Ej: Gómez"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tutor / Contacto</label>
            <input
              type="text"
              placeholder="Ej: Rosa Gómez"
              value={tutor}
              onChange={(e) => setTutor(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Coros a los que pertenece * (podés marcar varios)
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
              {choirs.map((choir) => {
                const isChecked = selectedChoirIds.includes(Number(choir.id));
                return (
                  <label
                    key={choir.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleChoir(choir.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      {choir.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}