import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveState } from '../../types/template.types';
import { templateService } from '../../services/template.service';

export function useTemplateAutosave(templateId: string, initialVersion: number, collectDraft: () => Promise<Record<string, unknown>>) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [versionNumber, setVersionNumber] = useState(initialVersion);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(0);

  const flush = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setSaveState('saving');
    try {
      const draft = await collectDraft();
      localStorage.setItem(`email-template-recovery:${templateId}`, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
      const saved = await templateService.autosaveTemplate(templateId, { ...draft, expectedVersion: versionNumber });
      if (requestRef.current !== requestId) return;
      setVersionNumber(saved.versionNumber);
      localStorage.removeItem(`email-template-recovery:${templateId}`);
      setSaveState('saved');
    } catch {
      if (requestRef.current === requestId) setSaveState('failed');
    }
  }, [collectDraft, templateId, versionNumber]);

  const markDirty = useCallback(() => {
    setSaveState('dirty');
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void flush();
    }, 1800);
  }, [flush]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return { saveState, versionNumber, markDirty, flush };
}
