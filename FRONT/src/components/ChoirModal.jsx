import { useState, useEffect } from 'react';
import { newUuid } from '../lib/ids.js';

const DIAS = [
  ['', 'Sin día fijo'],
  ['lunes', 'Lunes'],
  ['martes', 'Martes'],
  ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'],
  ['viernes', 'Viernes'],
  ['sabado', 'Sábado'],
  ['domingo', 'Domingo'],
];

export default function ChoirModal({ isOpen, onClose, onSave, editingChoir }) {
  const [nombre, setNombre] = useState('');
  const [sedeNombre, setSedeNombre] = useState('');
  const [sedeLocalidad, setSedeLocalidad] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [horario, setHorario] = useState('');

  useEffect(() => {
    if (editingChoir) {
      setNombre(editingChoir.nombre || '');
      setSedeNombre(editingChoir.sede?.nombre || '');
      setSedeLocalidad(editingChoir.sede?.localidad || '');
      setDiaSemana(editingChoir.diaSemana || '');
      setHorario(editingChoir.horario || '');
    } else {
      setNombre('');
      setSedeNombre('');
      setSedeLocalidad('');
      setDiaSemana('');
      setHorario('');
    }
  }, [editingChoir, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    if (!sedeNombre.trim()) {
      return alert('El nombre de la sede es obligatorio.');
    }

    const ahora = new Date().toISOString();
    onSave({
      id: editingChoir ? editingChoir.id : newUuid(),
      nombre: nombre.trim(),
      activo: editingChoir ? editingChoir.activo : true,
      diaSemana: diaSemana || null,
      horario: horario || null,
      sede: {
        nombre: sedeNombre.trim(),
        localidad: sedeLocalidad.trim() || null,
      },
      createdAt: editingChoir?.createdAt ?? ahora,
      updatedAt: ahora,
      deletedAt: editingChoir?.deletedAt ?? null,
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
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Sede / Ubicación *
            </label>
            <input
              type="text"
              placeholder="Ej: Parroquia San Cayetano"
              value={sedeNombre}
              onChange={(e) => setSedeNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Localidad
            </label>
            <input
              type="text"
              placeholder="Ej: Virreyes Oeste"
              value={sedeLocalidad}
              onChange={(e) => setSedeLocalidad(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Día de Ensayo
              </label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                {DIAS.map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Horario
              </label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
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
