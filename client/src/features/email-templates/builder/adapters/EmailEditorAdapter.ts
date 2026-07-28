import type { PreviewDevice } from '../../types/template.types';

export interface EmailEditorAdapter {
  initialize(container: HTMLElement): Promise<void>;
  loadProject(project: unknown): Promise<void>;
  loadMjml(mjml: string): Promise<void>;
  getProject(): Promise<unknown>;
  getMjml(): Promise<string>;
  getCompiledHtml(): Promise<string>;
  getPlainText(): Promise<string>;
  addBlock(blockType: string): void;
  setDevice(device: PreviewDevice): void;
  getSelectedComponent(): unknown;
  updateSelectedComponent(properties: unknown): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  destroy(): void;
}
