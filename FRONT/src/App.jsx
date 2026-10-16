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

  const handleDeleteChoir = (choirId) => {
    const assignedStudents = students.filter((s) =>
      (Array.isArray(s.coroIds) ? s.coroIds : []).includes(choirId)
    );

    if (assignedStudents.length > 0) {
      alert(
        `No se puede eliminar este coro porque tiene ${assignedStudents.length} participante(s) asignado(s). Reasigná o eliminá los alumnos primero.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseás eliminar este coro/sede?'
    );

    if (confirmDelete) {
      const coro = choirs.find((c) => c.id === choirId);
      if (coro) {
        const dadoDeBaja = {
          ...coro,
          activo: false,
          updatedAt: new Date().toISOString(),
        };
        enqueue('editarCoro', dadoDeBaja);
      }
      setChoirs((prev) => prev.filter((c) => c.id !== choirId));
      if (navigator.onLine) sincronizar();
    }
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
            onDeleteChoir={handleDeleteChoir}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            attendances={attendances}
            choirs={choirs}
            students={students}
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