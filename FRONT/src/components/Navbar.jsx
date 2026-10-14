// Ids fijados por el seed del backend (db/seeds/001_roles.sql).
const ROL_ADMIN = 2;

export default function Navbar({ currentTab, setCurrentTab, usuario }) {
  const tabs = [
    { id: 'attendance', label: 'Asistencia', icon: '📋' },
    { id: 'students', label: 'Alumnos', icon: '👥' },
    { id: 'choirs', label: 'Coros/Sedes', icon: '🏛️', adminOnly: true },
    { id: 'history', label: 'Historial', icon: '📜' },
    { id: 'voluntarios', label: 'Voluntarios', icon: '🙋', adminOnly: true },
  ];

  const visibles = tabs.filter((tab) => !tab.adminOnly || usuario?.rolId === ROL_ADMIN);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className={`max-w-md mx-auto grid px-1 py-1 ${visibles.length === 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
        {visibles.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-lg leading-tight">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}