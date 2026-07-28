import type { EmailEditorAdapter } from './EmailEditorAdapter';
import type { PreviewDevice } from '../../types/template.types';

type GrapesEditor = {
  setComponents: (components: string) => void;
  addComponents: (components: string) => unknown;
  loadProjectData: (data: unknown) => void;
  getProjectData: () => unknown;
  runCommand?: (command: string, options?: unknown) => unknown;
  getHtml: () => string;
  getCss: () => string;
  getComponents: () => { toString: () => string };
  getWrapper?: () => { append: (components: string) => unknown };
  getSelected: () => any;
  setDevice: (device: string) => void;
  UndoManager: { undo: () => void; redo: () => void; hasUndo: () => boolean; hasRedo: () => boolean };
  destroy: () => void;
};

const blockMjml: Record<string, string> = {
  heading: '<mj-section><mj-column><mj-text font-size="28px" font-weight="700" line-height="34px">Write a clear headline</mj-text></mj-column></mj-section>',
  paragraph: '<mj-section><mj-column><mj-text color="#4b5563">Add supporting copy that explains the next useful action.</mj-text></mj-column></mj-section>',
  image: '<mj-section><mj-column><mj-image src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop" alt="Workspace preview" border-radius="8px" /></mj-column></mj-section>',
  button: '<mj-section><mj-column><mj-button href="{{cta_url}}">Primary action</mj-button></mj-column></mj-section>',
  divider: '<mj-section padding="8px 24px"><mj-column><mj-divider border-color="#d9dee5" /></mj-column></mj-section>',
  spacer: '<mj-section padding="16px 24px"><mj-column><mj-spacer height="24px" /></mj-column></mj-section>',
  hero: '<mj-section background-color="#25302a" padding="34px 28px"><mj-column><mj-text color="#ffffff" font-size="32px" font-weight="700" line-height="38px" align="center">A focused email hero</mj-text><mj-text color="#d7ded8" align="center">Introduce the offer and keep one clear action.</mj-text><mj-button href="{{cta_url}}" background-color="#769181">Get started</mj-button></mj-column></mj-section>',
  feature: '<mj-section><mj-column><mj-text font-size="18px" font-weight="700">Feature one</mj-text><mj-text color="#667085">Explain the benefit in one sentence.</mj-text></mj-column><mj-column><mj-text font-size="18px" font-weight="700">Feature two</mj-text><mj-text color="#667085">Add another reason to continue.</mj-text></mj-column></mj-section>',
  footer: '<mj-section background-color="#f4f6f4" padding="20px 24px"><mj-column><mj-text font-size="12px" color="#667085" align="center">{{company_name}} · {{company_address}}<br /><a href="{{unsubscribe_url}}">Unsubscribe</a> · <a href="{{preferences_url}}">Preferences</a></mj-text></mj-column></mj-section>',
};

export class GrapesJSMjmlAdapter implements EmailEditorAdapter {
  private editor: GrapesEditor;

  constructor(editor: GrapesEditor) {
    this.editor = editor;
  }

  async initialize(_container: HTMLElement) {
    return Promise.resolve();
  }

  async loadProject(project: unknown) {
    this.editor.loadProjectData(project);
  }

  async loadMjml(mjml: string) {
    this.editor.setComponents(mjml);
  }

  private rawMjml() {
    return ((this.editor.runCommand?.('mjml-code') as string | undefined) || this.editor.getComponents().toString()).trim();
  }

  private normalizeMjml(mjml: string) {
    let next = mjml.trim();
    const trailing = next.match(/<\/mjml>\s*([\s\S]+)$/i);
    if (trailing?.[1]) {
      next = next.replace(/<\/mjml>\s*[\s\S]+$/i, '').replace(/<\/mj-body>/i, `${trailing[1]}</mj-body>`) + '</mjml>';
    }
    return /<mjml[\s>]/i.test(next) ? next : `<mjml><mj-body>${next}</mj-body></mjml>`;
  }

  async getProject() {
    return this.editor.getProjectData();
  }

  async getMjml() {
    return this.normalizeMjml(this.rawMjml());
  }

  async getCompiledHtml() {
    return `${this.editor.getHtml()}<style>${this.editor.getCss()}</style>`;
  }

  async getPlainText() {
    const html = await this.getCompiledHtml();
    return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  addBlock(blockType: string) {
    const block = blockMjml[blockType] || blockMjml.paragraph;
    const current = this.normalizeMjml(this.rawMjml());
    const next = current.replace(/<\/mj-body>/i, `${block}</mj-body>`);
    this.editor.setComponents(next);
  }

  setDevice(device: PreviewDevice) {
    this.editor.setDevice(device === 'mobile' ? 'Mobile' : 'Desktop');
  }

  getSelectedComponent() {
    const selected = this.editor.getSelected();
    if (!selected) return null;
    return {
      type: selected.get?.('type') || selected.get?.('tagName') || 'component',
      content: selected.components?.().length ? selected.components().map((child: any) => child.toHTML?.() || '').join('') : selected.get?.('content') || '',
      attributes: selected.getAttributes?.() || {},
      style: selected.getStyle?.() || {},
    };
  }

  updateSelectedComponent(properties: unknown) {
    const selected = this.editor.getSelected();
    if (!selected || !properties || typeof properties !== 'object') return;
    const patch = properties as { content?: string; attributes?: Record<string, string>; style?: Record<string, string> };
    if (patch.content !== undefined) selected.components?.(patch.content);
    if (patch.attributes) selected.addAttributes?.(patch.attributes);
    if (patch.style) selected.setStyle?.(patch.style);
  }

  undo() {
    this.editor.UndoManager.undo();
  }

  redo() {
    this.editor.UndoManager.redo();
  }

  canUndo() {
    return this.editor.UndoManager.hasUndo();
  }

  canRedo() {
    return this.editor.UndoManager.hasRedo();
  }

  destroy() {
    this.editor.destroy();
  }
}
