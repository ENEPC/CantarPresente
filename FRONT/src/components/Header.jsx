export default function Header() {
  return (
    <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-30">
      <div className="w-full max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎵</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Cantar Presente</h1>
            <p className="text-xs text-blue-200">Sembrar Cantando · Modo Local</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-500 text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Local
        </span>
      </div>
    </header>
  );
}