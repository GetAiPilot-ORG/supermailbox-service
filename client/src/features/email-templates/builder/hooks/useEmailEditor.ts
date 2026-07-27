import { useCallback, useRef, useState } from 'react';
import type { EmailEditorAdapter } from '../adapters/EmailEditorAdapter';

export function useEmailEditor() {
  const adapterRef = useRef<EmailEditorAdapter | null>(null);
  const [ready, setReady] = useState(false);

  const setAdapter = useCallback((adapter: EmailEditorAdapter) => {
    adapterRef.current = adapter;
    setReady(true);
  }, []);

  return { adapterRef, ready, setAdapter };
}
