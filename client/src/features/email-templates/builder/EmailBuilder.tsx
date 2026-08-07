import React, { useCallback, useEffect, useState } from 'react';
import { BuilderToolbar } from './BuilderToolbar';
import { useEmailEditor } from './hooks/useEmailEditor';
import { useTemplateAutosave } from './hooks/useTemplateAutosave';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import type { DesignRow } from './adapters/EmailEditorAdapter';
import { TemplateQualityPanel } from '../components/TemplateQualityPanel';
import { TemplateExportDialog } from '../components/TemplateExportDialog';
import { TemplateVersionDialog } from '../components/TemplateVersionDialog';
import { AssetPickerDialog, ResourcePickerDialog, brandService } from '../../brand-library';
import { CustomBuilderCanvas } from '../../email-builder';
import { HtmlSourcePanel } from './HtmlSourcePanel';
import { evaluateQualityChecks } from '../utils/qualityChecks';
import { templateService } from '../services/template.service';
import type { EmailTemplate, PreviewDevice, QualityIssue, TemplateVersion } from '../types/template.types';

type Props = { template: EmailTemplate; onBack: () => void; onSavedExit: () => void };

export const EmailBuilder: React.FC<Props> = ({ template, onBack, onSavedExit }) => {
  const { adapterRef, setAdapter } = useEmailEditor();
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject || '');
  const [preheader, setPreheader] = useState(template.preheader || '');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [canvasWidth, setCanvasWidth] = useState<number | undefined>(undefined);
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
  const [rows, setRows] = useState<DesignRow[]>([]);
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const [assetPickerCallback, setAssetPickerCallback] = useState<((data: { url: string }) => void) | null>(null);
  const [assetPickerInitialFile, setAssetPickerInitialFile] = useState<File | null>(null);
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(null);
  const [socialProfiles, setSocialProfiles] = useState<any[]>([]);

  useEffect(() => {
    brandService.listSocialProfiles()
      .then(res => setSocialProfiles(res || []))
      .catch(err => console.warn('Could not load social profiles for builder:', err));
  }, []);

  const collectDraft = useCallback(async () => ({
    name,
    subject,
    preheader,
    editorType: 'custom-dnd',
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

  const refreshQualityChecks = useCallback(async () => {
    const html = await adapterRef.current?.getCompiledHtml();
    const mjml = await adapterRef.current?.getMjml();
    setQuality(evaluateQualityChecks({
      subject,
      preheader,
      category: template.category,
      html: html || template.compiledHtml,
      mjml: mjml || template.mjmlContent,
    }));
  }, [adapterRef, preheader, subject, template.category, template.compiledHtml, template.mjmlContent]);

  useEffect(() => {
    refreshQualityChecks();
  }, [refreshQualityChecks]);

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

  const refreshRows = useCallback(async () => {
    const fetched = await adapterRef.current?.getRows();
    if (fetched) setRows(fetched);
  }, [adapterRef]);

  const handleReorder = useCallback(async (newIdOrder: string[]) => {
    await adapterRef.current?.reorderRows(newIdOrder);
    markDirty();
    refreshHistoryState();
    await refreshRows();
  }, [adapterRef, markDirty, refreshHistoryState, refreshRows]);

  const handleSelectRow = useCallback(async (rowId: string) => {
    setSelectedRowId(rowId);
    await adapterRef.current?.selectRow(rowId);
  }, [adapterRef]);

  // Refresh the layers list whenever the user opens the Layers tab, and
  // keep refreshing every 2 s while it's active so blocks added via Unlayer's
  // own native panel (which may fire design:updated with a variable lag) are
  // always reflected without relying solely on the event-driven path.
  useEffect(() => {
    if (activeTab !== 'layers') return;
    refreshRows();
    const interval = setInterval(refreshRows, 2000);
    return () => clearInterval(interval);
  }, [activeTab, refreshRows]);

  return (
    <div className="email-builder-shell">
      <BuilderToolbar
        name={name}
        saveState={saveState}
        device={device}
        canvasWidth={canvasWidth}
        onBack={onBack}
        onNameChange={setDirtyName}
        onSave={handleManualSave}
        onSaveExit={handleSaveExit}
        onUndo={() => { adapterRef.current?.undo(); refreshHistoryState(); }}
        onRedo={() => { adapterRef.current?.redo(); refreshHistoryState(); }}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        onDevice={(next) => {
          setDevice(next);
          adapterRef.current?.setDevice(next);
          // Reset canvasWidth to the device default
          const defaultWidth = next === 'mobile' ? 320 : next === 'tablet' ? 480 : undefined;
          setCanvasWidth(defaultWidth);
        }}
        onCanvasWidth={(w) => {
          setCanvasWidth(w);
          if (w !== undefined) adapterRef.current?.setViewportWidth(w);
          else adapterRef.current?.setViewportWidth(600); // desktop reset
        }}
        onVersions={handleVersions}
        onTestSend={handleTestSend}
        onExport={() => setShowExport(true)}
        onOpenAssetPicker={() => { setAssetPickerCallback(null); setShowAssetPicker(true); }}
        onOpenResourcePicker={() => setShowResourcePicker(true)}
      />
      {notice && <div className="builder-notice">{notice}</div>}
      <div className="email-builder-layout" style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>
        <CustomBuilderCanvas
          mjml={template.mjmlContent || ''}
          html={template.compiledHtml || ''}
          name={name}
          project={template.projectJson}
          device={device}
          canvasWidth={canvasWidth}
          activeTab={activeTab}
          onReady={async (adapter) => { setAdapter(adapter); refreshHistoryState(); await refreshRows(); refreshQualityChecks(); }}
          onChange={async () => { markDirty(); refreshHistoryState(); await refreshRows(); refreshQualityChecks(); }}
          onSelect={setSelectedComponent}
          onRequestImageUpload={(done, file) => {
            setAssetPickerCallback(() => done);
            setAssetPickerInitialFile(file || null);
            setShowAssetPicker(true);
          }}
        />
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
        initialFile={assetPickerInitialFile}
        onClose={() => {
          setShowAssetPicker(false);
          setAssetPickerCallback(null);
          setAssetPickerInitialFile(null);
        }}
        onSelectAsset={async (asset) => {
          if (assetPickerCallback) {
            assetPickerCallback({ url: asset.secure_url });
            setAssetPickerCallback(null);
            setShowAssetPicker(false);
          } else {
            if (adapterRef.current && (adapterRef.current as any).addImageBlock) {
              await (adapterRef.current as any).addImageBlock(asset.secure_url, asset.name);
            }
            setShowAssetPicker(false);
            setNotice(`Inserted image "${asset.name}" into email template!`);
            setTimeout(() => setNotice(''), 4000);
          }
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
