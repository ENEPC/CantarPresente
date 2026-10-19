import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LoginView from './components/LoginView';
import Navbar from './components/Navbar';
import AttendanceView from './components/AttendanceView';
import ParticipantsView from './components/ParticipantsView';
import ChoirsView from './components/ChoirsView';
import HistoryView from './components/HistoryView';
import StatsView from './components/StatsView';
import VoluntariosView from './components/VoluntariosView';
import InstallButton from './components/InstallButton';
import StudentModal from './components/StudentModal';
import ChoirModal from './components/ChoirModal';
import { INITIAL_CHOIRS, INITIAL_STUDENTS } from './data/initialData';
import { KEYS, leerJson, guardarJson, migrarStorage, pedirPersistencia } from './lib/storage';
import { leerSesion, guardarSesion, borrarSesion } from './lib/auth';
import { me } from './api/auth';
import { enqueue } from './lib/outbox';
import { useSync, construirLote } from './lib/sync';
import { useOnline } from './lib/useOnline';

migrarStorage();

export default function App() {
  const [sesion, setSesion] = useState(() => leerSesion());

  // Token vencido o usuario desactivado detectado en cualquier request: al login.
  useEffect(() => {
    const alExpirada = () => setSesion(null);
    window.addEventListener('cp:auth-expirada', alExpirada);
    return () => window.removeEventListener('cp:auth-expirada', alExpirada);
  }, []);

  // Con sesión guardada y red disponible al arrancar: refrescar los datos del
  // usuario contra el servidor. Offline se sigue con la sesión local sin validar.
  useEffect(() => {
    if (!leerSesion() || !navigator.onLine) return;
    me()
      .then((usuario) => {
        setSesion((actual) => {
          if (!actual) return null;
          const nueva = { ...actual, usuario: { ...actual.usuario, ...usuario } };
          guardarSesion(nueva);
          return nueva;
        });
      })
      .catch(() => {});
  }, []);

  const cerrarSesion = () => {
    borrarSesion();
    setSesion(null);
  };

  if (!sesion) return <LoginView onLogin={setSesion} />;

  return <AppAutenticada usuario={sesion.usuario} onLogout={cerrarSesion} />;
}

function AppAutenticada({ usuario, onLogout }) {
  const [currentTab, setCurrentTab] = useState('attendance');

  // Estado local (fuente de verdad mientras no hay conexión)
  const [choirs, setChoirs] = useState(() => leerJson(KEYS.choirs, INITIAL_CHOIRS));
  const [students, setStudents] = useState(() => leerJson(KEYS.students, INITIAL_STUDENTS));
  const [attendances, setAttendances] = useState(() => leerJson(KEYS.attendances, []));

  useEffect(() => guardarJson(KEYS.choirs, choirs), [choirs]);
  useEffect(() => guardarJson(KEYS.students, students), [students]);
  useEffect(() => guardarJson(KEYS.attendances, attendances), [attendances]);

  const online = useOnline();
  const { pendientes, errores, sincronizando, sincronizar } = useSync({
    setChoirs,
    setStudents,
    setAttendances,
  });

  // Al montar: pedir almacenamiento persistente y, si hay conexión, sincronizar.
  useEffect(() => {
    pedirPersistencia();
    if (navigator.onLine) sincronizar();
  }, [sincronizar]);

  // Al recuperar la conexión, drenar la cola.
  const primerRender = useRef(true);
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    if (online) sincronizar();
  }, [online, sincronizar]);

  // Modales
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isChoirModalOpen, setIsChoirModalOpen] = useState(false);
  const [editingChoir, setEditingChoir] = useState(null);

  // Handlers Alumnos
  const handleSaveStudent = (alumno) => {
    if (editingStudent) {
      setStudents((prev) => prev.map((s) => (s.id === alumno.id ? alumno : s)));
      enqueue('editarAlumno', alumno);
    } else {
      setStudents((prev) => [...prev, alumno]);
      enqueue('crearAlumno', alumno);
    }
    if (navigator.onLine) sincronizar();
  };

  const handleToggleStudentStatus = (studentId) => {
    const actualizado = students.find((s) => s.id === studentId);
    if (!actualizado) return;
    const conEstado = {
      ...actualizado,
      activo: !actualizado.activo,
      updatedAt: new Date().toISOString(),
    };
    setStudents((prev) => prev.map((s) => (s.id === studentId ? conEstado : s)));
    enqueue('editarAlumno', conEstado);
    if (navigator.onLine) sincronizar();
  };

  // Handlers Coros
  const handleSaveChoir = (coro) => {
    if (editingChoir) {
      setChoirs((prev) => prev.map((c) => (c.id === coro.id ? coro : c)));
      enqueue('editarCoro', coro);
    } else {
      setChoirs((prev) => [...prev, coro]);
      enqueue('crearCoro', coro);
    }
    if (navigator.onLine) sincronizar();
  };

  // Baja lógica del coro: solo cambia activo, igual que el toggle de participantes.
  // Al desactivar, los alumnos que tienen únicamente ese coro también pasan a
  // inactivos (conservando su asignación al coro).
  const handleToggleChoirStatus = (choirId) => {
    const actualizado = choirs.find((c) => c.id === choirId);
    if (!actualizado) return;
    const desactivando = actualizado.activo;
    const ahora = new Date().toISOString();
    const conEstado = {
      ...actualizado,
      activo: !actualizado.activo,
      updatedAt: ahora,
    };
    setChoirs((prev) => prev.map((c) => (c.id === choirId ? conEstado : c)));

    if (desactivando) {
      const exclusivos = students.filter((s) => {
        const ids = Array.isArray(s.coroIds) ? s.coroIds : [];
        return s.activo && ids.length === 1 && ids[0] === choirId;
      });
      setStudents((prev) =>
        prev.map((s) =>
          exclusivos.some((a) => a.id === s.id)
            ? { ...s, activo: false, updatedAt: ahora }
            : s
        )
      );
      for (const s of exclusivos) {
        enqueue('editarAlumno', { ...s, activo: false, updatedAt: ahora });
      }
    }

    // El payload al servidor no lleva sede: el schema del backend es estricto y
    // rechaza el objeto completo (con id) que trae el estado local.
    const { sede, ...payload } = conEstado;
    enqueue('editarCoro', payload);
    if (navigator.onLine) sincronizar();
  };

  // Handler Asistencia
  const handleSaveAttendance = (clase) => {
    setAttendances((prev) => [
      ...prev.filter((a) => !(a.coroId === clase.coroId && a.fecha === clase.fecha)),
      clase,
    ]);
    enqueue('syncAsistencia', { claseId: clase.id, lote: construirLote(clase) });
    if (navigator.onLine) sincronizar();
  };

  return (
    <div className="min-w-[320px] max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      <Header
        online={online}
        pendientes={pendientes}
        errores={errores}
        sincronizando={sincronizando}
        onSync={sincronizar}
        usuario={usuario}
        onLogout={onLogout}
      />

      <main className="flex-1 p-4">
        {/* Botón de instalación (se oculta automáticamente si ya está instalada) */}
        <InstallButton />

        {currentTab === 'attendance' && (
          <AttendanceView
            choirs={choirs}
            students={students}
            attendances={attendances}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {currentTab === 'students' && (
          <ParticipantsView
            students={students}
            choirs={choirs}
            onAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(s) => {
              setEditingStudent(s);
              setIsStudentModalOpen(true);
            }}
            onToggleStatus={handleToggleStudentStatus}
          />
        )}

        {currentTab === 'choirs' && (
          <ChoirsView
            choirs={choirs}
            students={students}
            onAddChoir={() => {
              setEditingChoir(null);
              setIsChoirModalOpen(true);
            }}
            onEditChoir={(c) => {
              setEditingChoir(c);
              setIsChoirModalOpen(true);
            }}
            onToggleChoirStatus={handleToggleChoirStatus}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            attendances={attendances}
            choirs={choirs}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            choirs={choirs}
            students={students}
            attendances={attendances}
          />
        )}

        {currentTab === 'voluntarios' && <VoluntariosView />}
      </main>

      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} usuario={usuario} />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        choirs={choirs}
        editingStudent={editingStudent}
      />

      <ChoirModal
        isOpen={isChoirModalOpen}
        onClose={() => setIsChoirModalOpen(false)}
        onSave={handleSaveChoir}
        editingChoir={editingChoir}
      />
    </div>
  );
}