import { useState, useEffect, useCallback } from 'react';
import { listUsuarios, createUsuario, setUsuarioActivo } from '../api/usuarios';
import VoluntarioModal from './VoluntarioModal';

const ROL_NOMBRE = { 1: 'Voluntario', 2: 'Admin' };

export default function VoluntariosView() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setUsuarios(await listUsuarios());
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de usuarios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleCrear = async (datos) => {
    const nuevo = await createUsuario(datos);
    setUsuarios((prev) => [...prev, nuevo]);
  };

  const handleBaja = async (usuario) => {
    const confirmado = window.confirm(
      `¿Dar de baja a ${usuario.nombre} ${usuario.apellido}? No podrá volver a ingresar al sistema.`
    );
    if (!confirmado) return;
    try {
      const actualizado = await setUsuarioActivo(usuario.id, false);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? actualizado : u)));
    } catch (err) {
      alert(err.message || 'No se pudo dar de baja al usuario');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Voluntarios</h2>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          + Nuevo usuario
        </button>
      </div>

      {cargando && <p className="text-sm text-slate-500">Cargando…</p>}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p>{error}</p>
          <button
            type="button"
            onClick={cargar}
            className="mt-1 text-xs font-semibold underline cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && usuarios.length === 0 && (
        <p className="text-sm text-slate-500">No hay usuarios registrados.</p>
      )}

      <ul className="space-y-2">
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {usuario.nombre} {usuario.apellido}
              </p>
              <p className="text-xs text-slate-500 truncate">{usuario.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                  {ROL_NOMBRE[usuario.rolId] ?? `Rol ${usuario.rolId}`}
                </span>
                <span
                  className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${
                    usuario.activo
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}
                >
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {usuario.activo && (
              <button
                type="button"
                onClick={() => handleBaja(usuario)}
                className="text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 transition-colors shrink-0 cursor-pointer"
              >
                Dar de baja
              </button>
            )}
          </li>
        ))}
      </ul>

      <VoluntarioModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={handleCrear}
      />
    </div>
  );
}
