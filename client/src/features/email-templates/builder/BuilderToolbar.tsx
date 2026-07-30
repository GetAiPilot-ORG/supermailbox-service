import React, { useState } from 'react';
import { ArrowLeft, Download, History, Mail, Monitor, Redo2, Save, Smartphone, Tablet, Undo2, Image, Code } from 'lucide-react';
import type { PreviewDevice, SaveState } from '../types/template.types';

type Props = {
  name: string;
  saveState: SaveState;
  device: PreviewDevice;
  canvasWidth?: number;
  onBack: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onSaveExit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDevice: (device: PreviewDevice) => void;
  onCanvasWidth: (width: number | undefined) => void;
  onVersions: () => void;
  onTestSend: () => void;
  onExport: () => void;
  onOpenAssetPicker?: () => void;
  onOpenResourcePicker?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export const BuilderToolbar: React.FC<Props> = ({
  name, saveState, device, canvasWidth,
  onBack, onNameChange, onSave, onSaveExit,
  onUndo, onRedo, onDevice, onCanvasWidth,
  onVersions, onTestSend, onExport,
  onOpenAssetPicker, onOpenResourcePicker,
  canUndo = true, canRedo = true,
}) => {
  const [widthInput, setWidthInput] = useState(String(canvasWidth ?? (device === 'mobile' ? 320 : device === 'tablet' ? 480 : 600)));

  const applyWidth = () => {
    const val = parseInt(widthInput, 10);
    if (!isNaN(val) && val >= 200 && val <= 1400) {
      onCanvasWidth(val);
    }
  };

  const handleDeviceClick = (next: PreviewDevice) => {
    if (next === 'desktop') {
      setWidthInput('600');
      onCanvasWidth(undefined);
      onDevice('desktop');
    } else if (next === 'tablet') {
      setWidthInput('480');
      onCanvasWidth(480);
      onDevice('tablet');
    } else {
      setWidthInput('320');
      onCanvasWidth(320);
      onDevice('mobile');
    }
  };

  return (
    <header className="email-builder-toolbar">
      <div className="builder-title-row">
        <button className="icon-btn" type="button" onClick={onBack} title="Back"><ArrowLeft size={17} /></button>
        <input value={name} onChange={(event) => onNameChange(event.target.value)} aria-label="Template name" />
        <span className={`save-state ${saveState}`}>{saveState === 'dirty' ? 'Unsaved changes' : saveState}</span>
      </div>
      <div className="builder-actions">
        <button className="icon-btn" type="button" onClick={onUndo} disabled={!canUndo} title="Undo"><Undo2 size={16} /></button>
        <button className="icon-btn" type="button" onClick={onRedo} disabled={!canRedo} title="Redo"><Redo2 size={16} /></button>

        {/* ── Viewport controls ───────────────────────────────────────── */}
        <button
          className={`icon-btn ${device === 'desktop' ? 'active' : ''}`}
          type="button"
          onClick={() => handleDeviceClick('desktop')}
          title="Desktop preview (600px)"
        >
          <Monitor size={16} />
        </button>
        <button
          className={`icon-btn ${device === 'tablet' ? 'active' : ''}`}
          type="button"
          onClick={() => handleDeviceClick('tablet')}
          title="Tablet preview (480px)"
        >
          <Tablet size={16} />
        </button>
        <button
          className={`icon-btn ${device === 'mobile' ? 'active' : ''}`}
          type="button"
          onClick={() => handleDeviceClick('mobile')}
          title="Mobile preview (320px)"
        >
          <Smartphone size={16} />
        </button>

        {/* Width input — always visible so user can type any size */}
        <div className="canvas-width-control" title="Email canvas width in pixels">
          <input
            type="number"
            className="canvas-width-input"
            value={widthInput}
            min={200}
            max={1400}
            step={10}
            aria-label="Canvas width in pixels"
            onChange={(e) => setWidthInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyWidth(); }}
            onBlur={applyWidth}
          />
          <span className="canvas-width-unit">px</span>
        </div>

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
};
