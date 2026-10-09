export default function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'attendance', label: 'Asistencia', icon: '📋' },
    { id: 'students', label: 'Alumnos', icon: '👥' },
    { id: 'choirs', label: 'Coros/Sedes', icon: '🏛️' },
    { id: 'history', label: 'Historial', icon: '📜' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 px-1 py-1">
        {tabs.map((tab) => {
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