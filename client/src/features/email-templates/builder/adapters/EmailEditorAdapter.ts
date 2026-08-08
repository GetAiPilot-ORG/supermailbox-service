import type { PreviewDevice } from '../../types/template.types';

export interface DesignRow {
  /** Unlayer row id */
  id: string;
  /** Human-readable label inferred from row content type */
  label: string;
  /** Primary content type of the first content block (e.g. 'text', 'image') */
  contentType: string;
}

export interface EmailEditorAdapter {
  initialize(container: HTMLElement): Promise<void>;
  loadProject(project: unknown): Promise<void>;
  loadMjml(mjml: string): Promise<void>;
  getProject(): Promise<unknown>;
  getMjml(): Promise<string>;
  getCompiledHtml(): Promise<string>;
  getPlainText(): Promise<string>;
  addBlock(blockType: string): void;
  /** Returns ordered list of rows currently in the design */
  getRows(): Promise<DesignRow[]>;
  /** Reloads the design with rows reordered according to the supplied id array */
  reorderRows(newIdOrder: string[]): Promise<void>;
  /** Attempts to select/highlight the row with the given id in the canvas */
  selectRow(rowId: string): Promise<void>;
  setDevice(device: PreviewDevice): void;
  /** Resize only the email content area to the given pixel width (uses Unlayer setBodyValues) */
  setViewportWidth(widthPx: number): void;
  getSelectedComponent(): unknown;
  updateSelectedComponent(properties: unknown): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  destroy(): void;
}
