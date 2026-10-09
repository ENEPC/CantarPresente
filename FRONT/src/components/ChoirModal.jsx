import { useState, useEffect } from 'react';

export default function ChoirModal({ isOpen, onClose, onSave, editingChoir }) {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [schedule, setSchedule] = useState('');

  useEffect(() => {
    if (editingChoir) {
      setName(editingChoir.name || '');
      setVenue(editingChoir.venue || editingChoir.location || '');
      setSchedule(editingChoir.schedule || '');
    } else {
      setName('');
      setVenue('');
      setSchedule('');
    }
  }, [editingChoir, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingChoir ? editingChoir.id : Date.now(),
      name: name.trim(),
      venue: venue.trim(),
      location: venue.trim(),
      schedule: schedule.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          {editingChoir ? 'Editar Coro / Sede' : 'Nuevo Coro / Sede'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nombre del Coro *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Coro Niños"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Sede / Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej: Virreyes Oeste / Parroquia San Cayetano"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Día y Horario de Ensayo
            </label>
            <input
              type="text"
              placeholder="Ej: Sábados 10:30 hs"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}