import { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import AttendanceView from './components/AttendanceView';
import ParticipantsView from './components/ParticipantsView';
import ChoirsView from './components/ChoirsView';
import HistoryView from './components/HistoryView';
import StudentModal from './components/StudentModal';
import ChoirModal from './components/ChoirModal';
import { INITIAL_CHOIRS, INITIAL_STUDENTS } from './data/initialData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('attendance');

  // Estado y persistencia de Coros
  const [choirs, setChoirs] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_choirs');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error al leer coros de localStorage:', e);
    }
    return INITIAL_CHOIRS || [];
  });

  useEffect(() => {
    localStorage.setItem('cp_choirs', JSON.stringify(choirs));
  }, [choirs]);

  // Estado y persistencia de Alumnos
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_students');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error al leer alumnos de localStorage:', e);
    }
    return INITIAL_STUDENTS || [];
  });

  useEffect(() => {
    localStorage.setItem('cp_students', JSON.stringify(students));
  }, [students]);

  // Estado y persistencia de Asistencias
  const [attendances, setAttendances] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_attendances');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error al leer asistencias de localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cp_attendances', JSON.stringify(attendances));
  }, [attendances]);

  // Modales
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isChoirModalOpen, setIsChoirModalOpen] = useState(false);
  const [editingChoir, setEditingChoir] = useState(null);

  // Handlers Alumnos
  const handleSaveStudent = (studentData) => {
    if (editingStudent) {
      setStudents(students.map((s) => (s.id === studentData.id ? studentData : s)));
    } else {
      setStudents([...students, studentData]);
    }
  };

  const handleToggleStudentStatus = (studentId) => {
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, active: !s.active } : s))
    );
  };

  // Handlers Coros
  const handleSaveChoir = (choirData) => {
    if (editingChoir) {
      setChoirs(choirs.map((c) => (c.id === choirData.id ? choirData : c)));
    } else {
      setChoirs([...choirs, choirData]);
    }
  };

  const handleDeleteChoir = (choirId) => {
    // Comprobar si algún alumno tiene este coro en sus asignaciones
    const assignedStudents = students.filter((s) => {
      const cIds = Array.isArray(s.choirIds) ? s.choirIds : [s.choirId];
      return cIds.map(Number).includes(Number(choirId));
    });

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
      setChoirs(choirs.filter((c) => c.id !== Number(choirId)));
    }
  };

  // Handler Asistencia
  const handleSaveAttendance = (choirId, date, records) => {
    const updated = attendances.filter(
      (a) => !(a.choirId === choirId && a.date === date)
    );
    setAttendances([...updated, { choirId, date, records }]);
  };

  return (
    <div className="min-w-[320px] max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      <Header />

      <main className="flex-1 p-4">
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
      </main>

      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

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