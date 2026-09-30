import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const ClockContext = createContext<number>(Date.now());

/** A shared clock that ticks four times a second, so countdowns stay smooth. */
export function ClockProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

export function useNow(): number {
  return useContext(ClockContext);
}
