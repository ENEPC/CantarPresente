import { useEffect, useState } from 'react';

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const alVolver = () => setOnline(true);
    const alCaer = () => setOnline(false);
    window.addEventListener('online', alVolver);
    window.addEventListener('offline', alCaer);
    return () => {
      window.removeEventListener('online', alVolver);
      window.removeEventListener('offline', alCaer);
    };
  }, []);

  return online;
}
