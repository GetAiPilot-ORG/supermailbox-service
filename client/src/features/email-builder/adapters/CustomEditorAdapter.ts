import type { DesignRow, EmailEditorAdapter } from '../../email-templates/builder/adapters/EmailEditorAdapter';
import type { PreviewDevice } from '../../email-templates/types/template.types';
import { compileMjmlViaServer } from '../renderer/htmlCompiler';
import { documentToMjml } from '../renderer/mjmlRenderer';
import { parseTemplateToDocument } from '../renderer/migrationLayer';
import { useDocumentStore } from '../store/documentStore';
import type { BlockType } from '../types/document.types';

export class CustomEditorAdapter implements EmailEditorAdapter {
  async initialize(_container: HTMLElement): Promise<void> {
    return Promise.resolve();
  }

  async loadProject(project: unknown): Promise<void> {
    if (!project) return;
    const doc = parseTemplateToDocument({ project });
    useDocumentStore.getState().setDocument(doc);
  }

  async loadMjml(mjml: string): Promise<void> {
    if (!mjml) return;
    const doc = parseTemplateToDocument({ mjml });
    useDocumentStore.getState().setDocument(doc);
  }

  async loadHtml(html: string): Promise<void> {
    if (!html) return;
    const doc = parseTemplateToDocument({ html });
    useDocumentStore.getState().setDocument(doc);
  }

  async getProject(): Promise<unknown> {
    return useDocumentStore.getState().document;
  }

  async getMjml(): Promise<string> {
    const doc = useDocumentStore.getState().document;
    return documentToMjml(doc);
  }

  async getCompiledHtml(): Promise<string> {
    const doc = useDocumentStore.getState().document;
    const mjml = documentToMjml(doc);
    const compiled = await compileMjmlViaServer(mjml, {
      subject: doc.metadata.subject,
      preheader: doc.metadata.preheader,
    });
    return compiled.html;
  }

  async getPlainText(): Promise<string> {
    const doc = useDocumentStore.getState().document;
    const mjml = documentToMjml(doc);
    const compiled = await compileMjmlViaServer(mjml, {
      subject: doc.metadata.subject,
      preheader: doc.metadata.preheader,
    });
    return compiled.plainText;
  }

  addBlock(blockType: string): void {
    useDocumentStore.getState().addBlock(blockType as BlockType);
  }

  async getRows(): Promise<DesignRow[]> {
    const doc = useDocumentStore.getState().document;
    const result: DesignRow[] = [];
    const rows = Array.isArray(doc?.rows) ? doc.rows : [];

    rows.forEach((row, rIdx) => {
      let hasContents = false;
      row.columns.forEach((col) => {
        col.blocks.forEach((blk) => {
          hasContents = true;
          result.push({
            id: blk.id,
            label: `${blk.type.toUpperCase()} (${row.name || `Row ${rIdx + 1}`})`,
            contentType: blk.type,
          });
        });
      });
      if (!hasContents) {
        result.push({
          id: row.id,
          label: row.name || `Row ${rIdx + 1}`,
          contentType: 'row',
        });
      }
    });

    return result;
  }

  async reorderRows(newIdOrder: string[]): Promise<void> {
    useDocumentStore.getState().reorderRows(newIdOrder);
  }

  async selectRow(rowId: string): Promise<void> {
    useDocumentStore.getState().selectRow(rowId);
  }

  setDevice(device: PreviewDevice): void {
    useDocumentStore.getState().setDevice(device);
  }

  setViewportWidth(widthPx: number): void {
    useDocumentStore.getState().updateBodySettings({ contentWidth: widthPx });
  }

  getSelectedComponent(): unknown {
    const state = useDocumentStore.getState();
    if (state.selectedBlockId) {
      for (const r of state.document.rows) {
        for (const c of r.columns) {
          const b = c.blocks.find((blk) => blk.id === state.selectedBlockId);
          if (b) return b;
        }
      }
    }
    if (state.selectedRowId) {
      return state.document.rows.find((r) => r.id === state.selectedRowId) || null;
    }
    return null;
  }

  updateSelectedComponent(properties: unknown): void {
    const state = useDocumentStore.getState();
    if (state.selectedBlockId && properties && typeof properties === 'object') {
      state.updateBlock(state.selectedBlockId, properties as any);
    } else if (state.selectedRowId && properties && typeof properties === 'object') {
      state.updateRow(state.selectedRowId, properties as any);
    }
  }

  undo(): void {
    useDocumentStore.getState().undo();
  }

  redo(): void {
    useDocumentStore.getState().redo();
  }

  canUndo(): boolean {
    return useDocumentStore.getState().history.length > 0;
  }

  canRedo(): boolean {
    return useDocumentStore.getState().future.length > 0;
  }

  destroy(): void {}
}
