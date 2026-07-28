import React from 'react';
import { ArrowLeft, Download, History, Mail, Monitor, Redo2, Save, Smartphone, Undo2, Image, Code } from 'lucide-react';
import type { PreviewDevice, SaveState } from '../types/template.types';

type Props = {
  name: string;
  saveState: SaveState;
  device: PreviewDevice;
  onBack: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onSaveExit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDevice: (device: PreviewDevice) => void;
  onVersions: () => void;
  onTestSend: () => void;
  onExport: () => void;
  onOpenAssetPicker?: () => void;
  onOpenResourcePicker?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export const BuilderToolbar: React.FC<Props> = ({ name, saveState, device, onBack, onNameChange, onSave, onSaveExit, onUndo, onRedo, onDevice, onVersions, onTestSend, onExport, onOpenAssetPicker, onOpenResourcePicker, canUndo = true, canRedo = true }) => (
  <header className="email-builder-toolbar">
    <div className="builder-title-row">
      <button className="icon-btn" type="button" onClick={onBack} title="Back"><ArrowLeft size={17} /></button>
      <input value={name} onChange={(event) => onNameChange(event.target.value)} aria-label="Template name" />
      <span className={`save-state ${saveState}`}>{saveState === 'dirty' ? 'Unsaved changes' : saveState}</span>
    </div>
    <div className="builder-actions">
      <button className="icon-btn" type="button" onClick={onUndo} disabled={!canUndo} title="Undo"><Undo2 size={16} /></button>
      <button className="icon-btn" type="button" onClick={onRedo} disabled={!canRedo} title="Redo"><Redo2 size={16} /></button>
      <button className={`icon-btn ${device === 'desktop' ? 'active' : ''}`} type="button" onClick={() => onDevice('desktop')} title="Desktop preview"><Monitor size={16} /></button>
      <button className={`icon-btn ${device === 'mobile' ? 'active' : ''}`} type="button" onClick={() => onDevice('mobile')} title="Mobile preview"><Smartphone size={16} /></button>
      {onOpenAssetPicker && (
        <button className="btn-secondary compact" type="button" onClick={onOpenAssetPicker} title="Select Image from Brand Library">
          <Image size={15} /> Brand Media
        </button>
      )}
      {onOpenResourcePicker && (
        <button className="btn-secondary compact" type="button" onClick={onOpenResourcePicker} title="Insert Brand Merge Tag Token">
          <Code size={15} /> Merge Tags
        </button>
      )}
      <button className="btn-secondary compact" type="button" onClick={onVersions}><History size={15} /> Versions</button>
      <button className="btn-secondary compact" type="button" onClick={onTestSend}><Mail size={15} /> Send Test</button>
      <button className="btn-secondary compact" type="button" onClick={onExport}><Download size={15} /> Export</button>
      <button className="btn-secondary compact" type="button" onClick={onSave}><Save size={15} /> Save</button>
      <button className="btn-primary compact" type="button" onClick={onSaveExit}>Save and Exit</button>
    </div>
  </header>
);

