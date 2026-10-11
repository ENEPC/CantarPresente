import { useState, useEffect } from 'react';
import { newUuid } from '../lib/ids.js';

export default function StudentModal({
  isOpen,
  onClose,
  onSave,
  choirs = [],
  editingStudent = null,
}) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [responsableNombre, setResponsableNombre] = useState('');
  const [responsableTelefono, setResponsableTelefono] = useState('');
  const [selectedChoirIds, setSelectedChoirIds] = useState([]);

  useEffect(() => {
    if (editingStudent) {
      setNombre(editingStudent.nombre || '');
      setApellido(editingStudent.apellido || '');
      setResponsableNombre(editingStudent.responsableNombre || '');
      setResponsableTelefono(editingStudent.responsableTelefono || '');
      setSelectedChoirIds(Array.isArray(editingStudent.coroIds) ? editingStudent.coroIds : []);
    } else {
      setNombre('');
      setApellido('');
      setResponsableNombre('');
      setResponsableTelefono('');
      setSelectedChoirIds(choirs[0] ? [choirs[0].id] : []);
    }
  }, [editingStudent, isOpen, choirs]);

  if (!isOpen) return null;

  const handleToggleChoir = (id) => {
    setSelectedChoirIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      return alert('El nombre y apellido son obligatorios.');
    }
    if (selectedChoirIds.length === 0) {
      return alert('Debés asignar al participante a por lo menos un coro o sede.');
    }

    const ahora = new Date().toISOString();
    onSave({
      id: editingStudent ? editingStudent.id : newUuid(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      fechaNacimiento: editingStudent?.fechaNacimiento ?? null,
      responsableNombre: responsableNombre.trim() || null,
      responsableTelefono: responsableTelefono.trim() || null,
      observaciones: editingStudent?.observaciones ?? null,
      activo: editingStudent ? editingStudent.activo : true,
      coroIds: selectedChoirIds,
      createdAt: editingStudent?.createdAt ?? ahora,
      updatedAt: ahora,
      deletedAt: editingStudent?.deletedAt ?? null,
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
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Apellido *</label>
            <input
              type="text"
              required
              placeholder="Ej: Gómez"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Responsable / Contacto
            </label>
            <input
              type="text"
              placeholder="Ej: Rosa Gómez"
              value={responsableNombre}
              onChange={(e) => setResponsableNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Teléfono del Responsable
            </label>
            <input
              type="tel"
              placeholder="Ej: 11-5555-1234"
              value={responsableTelefono}
              onChange={(e) => setResponsableTelefono(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Coros a los que pertenece * (podés marcar varios)
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
              {choirs.map((choir) => {
                const isChecked = selectedChoirIds.includes(choir.id);
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
                      {choir.nombre}
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
