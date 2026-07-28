import React, { useCallback, useEffect, useState } from 'react';
import { BuilderBlocksPanel } from './BuilderBlocksPanel';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderSettingsPanel } from './BuilderSettingsPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { useEmailEditor } from './hooks/useEmailEditor';
import { useTemplateAutosave } from './hooks/useTemplateAutosave';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { TemplateQualityPanel } from '../components/TemplateQualityPanel';
import { TemplateExportDialog } from '../components/TemplateExportDialog';
import { TemplateVersionDialog } from '../components/TemplateVersionDialog';
import { AssetPickerDialog, ResourcePickerDialog } from '../../brand-library';
import { templateService } from '../services/template.service';
import type { EmailTemplate, PreviewDevice, QualityIssue, TemplateVersion } from '../types/template.types';

type Props = { template: EmailTemplate; onBack: () => void; onSavedExit: () => void };

export const EmailBuilder: React.FC<Props> = ({ template, onBack, onSavedExit }) => {
  const { adapterRef, setAdapter } = useEmailEditor();
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject || '');
  const [preheader, setPreheader] = useState(template.preheader || '');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [quality, setQuality] = useState<QualityIssue[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<unknown>(null);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [testEmail, setTestEmail] = useState('');
  const [notice, setNotice] = useState('');

  const collectDraft = useCallback(async () => ({
    name,
    subject,
    preheader,
    editorType: 'react-email-editor',
    projectJson: await adapterRef.current?.getProject(),
    mjmlContent: await adapterRef.current?.getMjml(),
    compiledHtml: await adapterRef.current?.getCompiledHtml(),
    plainText: await adapterRef.current?.getPlainText(),
  }), [adapterRef, name, preheader, subject]);

  const { saveState, versionNumber, markDirty, flush } = useTemplateAutosave(template.id, template.versionNumber, collectDraft);
  useUnsavedChanges(saveState === 'dirty' || saveState === 'failed');

  const setDirtyName = (value: string) => { setName(value); markDirty(); };
  const setDirtySubject = (value: string) => { setSubject(value); markDirty(); };
  const setDirtyPreheader = (value: string) => { setPreheader(value); markDirty(); };
  const refreshHistoryState = () => setHistoryState({
    canUndo: Boolean(adapterRef.current?.canUndo()),
    canRedo: Boolean(adapterRef.current?.canRedo()),
  });

  useEffect(() => {
    templateService.compileTemplate(template.id).then((result) => setQuality(result.quality)).catch(() => setQuality([]));
  }, [template.id, versionNumber]);

  const handleManualSave = async () => {
    const draft = await collectDraft();
    await templateService.updateTemplate(template.id, { ...draft, expectedVersion: versionNumber });
    setNotice('Saved');
  };

  const handleSaveExit = async () => {
    await flush();
    onSavedExit();
  };

  const handleVersions = async () => {
    setVersions(await templateService.listVersions(template.id));
    setShowVersions(true);
  };

  const handleRestore = async (versionId: string) => {
    await templateService.restoreVersion(template.id, versionId);
    window.location.reload();
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      setNotice('Enter a test recipient in the right panel first.');
      return;
    }
    const result = await templateService.sendTest(template.id, { recipientEmail: testEmail, subject: subject || template.name });
    setNotice(result.success ? `Test sent with ${result.provider}` : result.error || 'Test send failed');
  };

  const handleSelectedChange = (patch: unknown) => {
    adapterRef.current?.updateSelectedComponent(patch);
    const selected = adapterRef.current?.getSelectedComponent() || null;
    setSelectedComponent(selected);
    markDirty();
    refreshHistoryState();
  };

  const handleAddBlock = (blockType: string) => {
    adapterRef.current?.addBlock(blockType);
    markDirty();
    refreshHistoryState();
  };

  return (
    <div className="email-builder-shell">
      <BuilderToolbar
        name={name}
        saveState={saveState}
        device={device}
        onBack={onBack}
        onNameChange={setDirtyName}
        onSave={handleManualSave}
        onSaveExit={handleSaveExit}
        onUndo={() => { adapterRef.current?.undo(); refreshHistoryState(); }}
        onRedo={() => { adapterRef.current?.redo(); refreshHistoryState(); }}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        onDevice={(next) => { setDevice(next); adapterRef.current?.setDevice(next); }}
        onVersions={handleVersions}
        onTestSend={handleTestSend}
        onExport={() => setShowExport(true)}
        onOpenAssetPicker={() => setShowAssetPicker(true)}
        onOpenResourcePicker={() => setShowResourcePicker(true)}
      />
      {notice && <div className="builder-notice">{notice}</div>}
      <div className="email-builder-layout">
        <BuilderBlocksPanel onAddBlock={handleAddBlock} />
        <BuilderCanvas
          mjml={template.mjmlContent || ''}
          html={template.compiledHtml || ''}
          name={name}
          project={template.projectJson}
          onReady={(adapter) => { setAdapter(adapter); refreshHistoryState(); }}
          onChange={() => { markDirty(); refreshHistoryState(); }}
          onSelect={setSelectedComponent}
        />
        <div className="builder-right-column">
          <BuilderSettingsPanel
            subject={subject}
            preheader={preheader}
            selected={selectedComponent}
            onSubjectChange={setDirtySubject}
            onPreheaderChange={setDirtyPreheader}
            onSelectedChange={handleSelectedChange}
          />
          <label className="test-send-inline">
            Test recipient
            <input className="ui-input" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <TemplateQualityPanel issues={quality} />
        </div>
      </div>
      {showVersions && <TemplateVersionDialog versions={versions} onClose={() => setShowVersions(false)} onRestore={handleRestore} />}
      <TemplateExportDialog
        open={showExport}
        name={name}
        subject={subject}
        preheader={preheader}
        getMjml={async () => adapterRef.current?.getMjml() || ''}
        getHtml={async () => adapterRef.current?.getCompiledHtml() || ''}
        onClose={() => setShowExport(false)}
      />
      <AssetPickerDialog
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onSelectAsset={(asset) => {
          navigator.clipboard.writeText(asset.secure_url);
          setNotice(`Copied Cloudinary URL for "${asset.name}" to clipboard!`);
          setTimeout(() => setNotice(''), 4000);
        }}
      />
      <ResourcePickerDialog
        isOpen={showResourcePicker}
        onClose={() => setShowResourcePicker(false)}
        onSelectResource={(item) => {
          navigator.clipboard.writeText(item.tag);
          setNotice(`Copied token "${item.tag}" to clipboard!`);
          setTimeout(() => setNotice(''), 4000);
        }}
      />
    </div>
  );
};
