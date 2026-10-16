import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya corre instalada en modo standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detectar si el dispositivo es iOS (iPhone / iPad)
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    // 3. Capturar el evento nativo en Android / Chrome / Edge
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Si ya está instalada o no cumple los requisitos todavía, no muestra nada
  if (isInstalled || (!deferredPrompt && !isIOS)) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    // Disparar el cartel nativo del navegador
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Botón principal grande y llamativo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 shadow-lg text-white mb-4 border border-blue-400/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl bg-white/20 p-2 rounded-xl">📲</span>
          <div>
            <h3 className="font-extrabold text-base leading-tight">
              Instalá Cantar Presente
            </h3>
            <p className="text-xs text-blue-100">
              Usala sin conexión a internet y entrá directo desde tu pantalla
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full py-3.5 px-4 bg-white text-blue-700 hover:bg-blue-50 active:scale-98 font-black text-sm tracking-wide uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>⬇️</span> Instalar en este celular
        </button>
      </div>

      {/* Modal explicativo exclusivo para iPhone / iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>🍏</span> Cómo instalar en iPhone
              </h4>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <ol className="text-xs text-slate-600 space-y-3 list-decimal list-inside font-medium">
              <li>
                Tocá el botón <strong>Compartir</strong> en la barra inferior de Safari (el ícono del cuadrado con la flecha hacia arriba ⎋).
              </li>
              <li>
                Desplazate hacia abajo y seleccioná <strong>"Agregar a la pantalla de inicio"</strong>.
              </li>
              <li>
                Tocá <strong>"Agregar"</strong> arriba a la derecha.
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}