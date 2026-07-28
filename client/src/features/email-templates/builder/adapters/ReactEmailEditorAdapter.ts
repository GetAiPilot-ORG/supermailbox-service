import type { UnlayerEditor } from '@unlayer/types';
import type { EmailEditorAdapter } from './EmailEditorAdapter';
import type { PreviewDevice } from '../../types/template.types';

const row = (id: string, type: string, values: Record<string, unknown>) => ({
  id,
  cells: [1],
  columns: [{ id: `${id}-column`, contents: [{ id: `${id}-content`, type, values }] }],
  values: { backgroundColor: '#ffffff' },
});

export function designFromHtml(html: string, name: string) {
  return {
    counters: { u_row: 1, u_column: 1, u_content_html: 1 },
    body: {
      id: 'body',
      rows: [row('imported-html', 'html', { html: html || `<h1>${name}</h1><p>Start editing this template.</p>` })],
      values: { backgroundColor: '#eef2ef', contentWidth: '600px' },
    },
    schemaVersion: 17,
  };
}

const blockRows: Record<string, () => ReturnType<typeof row>> = {
  heading: () => row(`heading-${Date.now()}`, 'text', { text: '<h1>Write a clear headline</h1>', fontSize: '28px', lineHeight: '34px' }),
  paragraph: () => row(`paragraph-${Date.now()}`, 'text', { text: '<p>Add supporting copy that explains the next useful action.</p>', color: '#4b5563' }),
  image: () => row(`image-${Date.now()}`, 'image', { src: { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop' }, altText: 'Workspace preview' }),
  button: () => row(`button-${Date.now()}`, 'button', { text: 'Primary action', href: { name: 'web', values: { href: '{{cta_url}}', target: '_blank' } }, buttonColors: { color: '#ffffff', backgroundColor: '#769181' } }),
  divider: () => row(`divider-${Date.now()}`, 'divider', { border: { borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: '#d9dee5' } }),
  spacer: () => row(`spacer-${Date.now()}`, 'text', { text: '<p>&nbsp;</p>' }),
  hero: () => row(`hero-${Date.now()}`, 'text', { text: '<h1>A focused email hero</h1><p>Introduce the offer and keep one clear action.</p>' }),
  feature: () => ({
    id: `feature-${Date.now()}`,
    cells: [1, 1],
    columns: [
      { id: 'feature-one', contents: [{ id: 'feature-one-text', type: 'text', values: { text: '<h3>Feature one</h3><p>Explain the benefit in one sentence.</p>' } }] },
      { id: 'feature-two', contents: [{ id: 'feature-two-text', type: 'text', values: { text: '<h3>Feature two</h3><p>Add another reason to continue.</p>' } }] },
    ],
    values: { backgroundColor: '#f6f7f5' },
  }),
  footer: () => row(`footer-${Date.now()}`, 'text', { text: '<p>{{company_name}} | {{company_address}}<br><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Preferences</a></p>', fontSize: '12px', color: '#667085', textAlign: 'center' }),
};

export class ReactEmailEditorAdapter implements EmailEditorAdapter {
  private editor: UnlayerEditor;

  constructor(editor: UnlayerEditor) {
    this.editor = editor;
  }

  async initialize() {}

  async loadProject(project: unknown) {
    this.editor.loadDesign(project as never);
  }

  async loadMjml(_mjml: string) {}

  async getProject() {
    return new Promise((resolve) => this.editor.saveDesign((design) => resolve(design)));
  }

  async getCompiledHtml() {
    return new Promise<string>((resolve) => this.editor.exportHtml(({ html }) => resolve(html)));
  }

  async getMjml() {
    return '';
  }

  async getPlainText() {
    const html = await this.getCompiledHtml();
    return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  async addBlock(blockType: string) {
    const design = await this.getProject() as { body?: { rows?: unknown[] } };
    design.body?.rows?.push((blockRows[blockType] || blockRows.paragraph)());
    this.editor.loadDesign(design as never);
  }

  setDevice(_device: PreviewDevice) {}
  getSelectedComponent() { return null; }
  updateSelectedComponent(_properties: unknown) {}
  undo() { (this.editor as any).undo?.(); }
  redo() { (this.editor as any).redo?.(); }
  canUndo() { return true; }
  canRedo() { return true; }
  destroy() {}
}
