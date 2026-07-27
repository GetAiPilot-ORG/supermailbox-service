import { useEffect } from 'react';

export function useUnsavedChanges(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}
