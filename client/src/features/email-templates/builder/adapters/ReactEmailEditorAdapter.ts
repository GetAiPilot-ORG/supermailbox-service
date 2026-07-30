import type { UnlayerEditor } from '@unlayer/types';
import type { EmailEditorAdapter, DesignRow } from './EmailEditorAdapter';
import type { PreviewDevice } from '../../types/template.types';

const row = (id: string, type: string, values: Record<string, unknown>) => ({
  id,
  cells: [1],
  columns: [{ id: `${id}-column`, contents: [{ id: `${id}-content`, type, values }] }],
  values: { backgroundColor: '#ffffff' },
});

const VOID_TAGS = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr',
]);

const RAW_CONTENT_TAGS = new Set(['style', 'script', 'pre', 'textarea']);

export function cleanAndFormatHtml(raw: string): string {
  if (!raw) return '';
  try {
    const INDENT = '  ';
    // Match HTML comments, tags, or text between tags
    const TOKEN_RE = /<!--[\s\S]*?-->|<[^>]+>|[^<]+/g;
    const tokens = raw.match(TOKEN_RE) ?? [];

    let level = 0;
    let inRawTag = '';   // when inside <style>/<script>/etc.
    const lines: string[] = [];

    const pad = () => INDENT.repeat(Math.max(0, level));

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      // ── Inside a raw-content block (style/script/pre) ──────────────────
      if (inRawTag) {
        const closeRe = new RegExp(`^<\\/${inRawTag}`, 'i');
        if (closeRe.test(tok.trim())) {
          level = Math.max(0, level - 1);
          lines.push(pad() + tok.trim());
          inRawTag = '';
        } else {
          // Preserve lines inside styles/scripts but trim excessive indentation
          const rawLines = tok.split(/\r?\n/);
          for (const rl of rawLines) {
            if (rl.trim()) {
              lines.push(pad() + rl.trim());
            }
          }
        }
        continue;
      }

      const trimmed = tok.trim();
      if (!trimmed) continue;

      // ── HTML comment ───────────────────────────────────────────────────
      if (trimmed.startsWith('<!--')) {
        lines.push(pad() + trimmed);
        continue;
      }

      // ── DOCTYPE ────────────────────────────────────────────────────────
      if (/^<!doctype/i.test(trimmed)) {
        lines.push(pad() + trimmed);
        continue;
      }

      // ── Closing tag ────────────────────────────────────────────────────
      if (trimmed.startsWith('</')) {
        level = Math.max(0, level - 1);
        lines.push(pad() + trimmed);
        continue;
      }

      // ── Self-closing or void tag ───────────────────────────────────────
      const tagName = (trimmed.match(/^<([a-z][a-z0-9-]*)/i) ?? [])[1]?.toLowerCase() ?? '';
      const isSelfClose = trimmed.endsWith('/>') || VOID_TAGS.has(tagName);

      if (trimmed.startsWith('<') && isSelfClose) {
        lines.push(pad() + trimmed);
        continue;
      }

      // ── Opening tag ────────────────────────────────────────────────────
      if (trimmed.startsWith('<')) {
        // Check if inline close tag matches: e.g. <title>text</title> or <td>text</td>
        const inlineClose = new RegExp(`</${tagName}>\\s*$`, 'i');
        if (inlineClose.test(trimmed)) {
          lines.push(pad() + trimmed);
        } else {
          lines.push(pad() + trimmed);
          level++;
          if (RAW_CONTENT_TAGS.has(tagName)) {
            inRawTag = tagName;
          }
        }
        continue;
      }

      // ── Text node ──────────────────────────────────────────────────────
      const textLines = trimmed.split(/\r?\n/);
      for (const tl of textLines) {
        const t = tl.trim();
        if (t) {
          lines.push(pad() + t);
        }
      }
    }

    // Collapse multiple blank lines
    return lines.join('\n').replace(/\n([ \t]*\n){2,}/g, '\n\n');
  } catch {
    return raw;
  }
}

export function formatHtmlInProject(project: any, socialMap?: Record<string, string>): any {
  if (!project || typeof project !== 'object') return project;
  try {
    const cloned = JSON.parse(JSON.stringify(project));
    const rows = cloned.body?.rows || [];
    for (const row of rows) {
      const columns = row.columns || [];
      for (const col of columns) {
        const contents = col.contents || [];
        for (const content of contents) {
          if (
            (content.type === 'html' || content.type === 'imported-html') &&
            content.values &&
            typeof content.values.html === 'string'
          ) {
            content.values.html = cleanAndFormatHtml(content.values.html);
          }
          if (content.type === 'social' && content.values?.icons?.icons && socialMap) {
            const icons = content.values.icons.icons;
            if (Array.isArray(icons)) {
              for (const icon of icons) {
                if (icon && icon.name && socialMap[icon.name.toLowerCase()]) {
                  const savedUrl = socialMap[icon.name.toLowerCase()];
                  const currentUrl = (icon.url || '').trim();
                  const isGeneric = !currentUrl || /^(https?:\/\/)?(www\.)?(facebook|instagram|twitter|x|linkedin|youtube|pinterest|whatsapp|github|tiktok)\.com\/?$/i.test(currentUrl);
                  if (isGeneric && savedUrl) {
                    icon.url = savedUrl;
                  }
                }
              }
            }
          }
        }
      }
    }
    return cloned;
  } catch {
    return project;
  }
}

export function designFromHtml(html: string, name: string) {
  const formattedHtml = cleanAndFormatHtml(html) || `<h1>${name}</h1><p>Start editing this template.</p>`;
  return {
    counters: { u_row: 1, u_column: 1, u_content_html: 1 },
    body: {
      id: 'body',
      rows: [row('imported-html', 'html', { html: formattedHtml })],
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
  menu: () => row(`favmenu-${Date.now()}`, 'html', {
    html: `
      <div style="text-align: center; padding: 14px 16px; background-color: #ffffff; border-radius: 8px;">
        <a href="https://voice.getaipilot.in" target="_blank" style="text-decoration: none; color: #2563eb; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=voice.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #2563eb;">GAP Voice Pilot</span>
        </a>
        <a href="https://social.getaipilot.in" target="_blank" style="text-decoration: none; color: #dc2626; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=social.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #dc2626;">GAP Social Pilot</span>
        </a>
        <a href="https://whatsapp.getaipilot.in" target="_blank" style="text-decoration: none; color: #16a34a; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=whatsapp.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #16a34a;">GAP Whatsapp Pilot</span>
        </a>
        <a href="https://crm.getaipilot.in" target="_blank" style="text-decoration: none; color: #9333ea; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=crm.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #9333ea;">GAP CRM</span>
        </a>
        <a href="https://telegram.getaipilot.in" target="_blank" style="text-decoration: none; color: #0284c7; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=telegram.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #0284c7;">GAP Telegram Automation</span>
        </a>
        <a href="https://free.getaipilot.in" target="_blank" style="text-decoration: none; color: #ea580c; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=free.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #ea580c;">GAP Free Tools</span>
        </a>
      </div>
    `.trim(),
  }),
  favicon_menu: () => row(`favmenu-${Date.now()}`, 'html', {
    html: `
      <div style="text-align: center; padding: 14px 16px; background-color: #ffffff; border-radius: 8px;">
        <a href="https://voice.getaipilot.in" target="_blank" style="text-decoration: none; color: #2563eb; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=voice.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #2563eb;">GAP Voice Pilot</span>
        </a>
        <a href="https://social.getaipilot.in" target="_blank" style="text-decoration: none; color: #dc2626; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=social.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #dc2626;">GAP Social Pilot</span>
        </a>
        <a href="https://whatsapp.getaipilot.in" target="_blank" style="text-decoration: none; color: #16a34a; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=whatsapp.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #16a34a;">GAP Whatsapp Pilot</span>
        </a>
        <a href="https://crm.getaipilot.in" target="_blank" style="text-decoration: none; color: #9333ea; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=crm.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #9333ea;">GAP CRM</span>
        </a>
        <a href="https://telegram.getaipilot.in" target="_blank" style="text-decoration: none; color: #0284c7; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=telegram.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #0284c7;">GAP Telegram Automation</span>
        </a>
        <a href="https://free.getaipilot.in" target="_blank" style="text-decoration: none; color: #ea580c; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 6px 14px; display: inline-block;">
          <img src="https://www.google.com/s2/favicons?domain=free.getaipilot.in&sz=64" width="16" height="16" style="vertical-align: middle; margin-right: 6px; border-radius: 3px; display: inline-block;" alt="" />
          <span style="color: #ea580c;">GAP Free Tools</span>
        </a>
      </div>
    `.trim(),
  }),
};

/** Derive a friendly name from the row's id prefix or content type */
function inferRowLabel(rowId: string, contentType: string): string {
  const prefixMap: Record<string, string> = {
    hero: 'Hero',
    footer: 'Footer',
    feature: 'Features',
    heading: 'Heading',
    paragraph: 'Text',
    image: 'Image',
    button: 'Button',
    divider: 'Divider',
    spacer: 'Spacer',
    'imported-html': 'HTML',
  };
  for (const [prefix, name] of Object.entries(prefixMap)) {
    if (rowId.startsWith(prefix)) return name;
  }
  const typeMap: Record<string, string> = {
    text: 'Text',
    image: 'Image',
    button: 'Button',
    divider: 'Divider',
    html: 'HTML',
    'imported-html': 'HTML',
    video: 'Video',
  };
  return typeMap[contentType] ?? 'Block';
}

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
    return new Promise<string>((resolve) => this.editor.exportHtml(({ html }) => {
      // Synchronize inner span colors to <a> tag inline style
      const syncedHtml = html.replace(/<a\s+([^>]*style=["'][^"']*)color:\s*([^;"'\s]+)([^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi, (match, before, colorVal, after, inner) => {
        const innerColorMatch = inner.match(/<span\s+[^>]*style=["'][^"']*color:\s*([^;"'\s]+)/i);
        if (innerColorMatch && innerColorMatch[1]) {
          const hex = innerColorMatch[1];
          return match.replace(/color:\s*[^;"'\s]+/gi, `color: ${hex}`);
        }
        return match;
      });
      resolve(syncedHtml);
    }));
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

  async addImageBlock(imageUrl: string, altText?: string) {
    const design = await this.getProject() as { body?: { rows?: unknown[] } };
    const newImageRow = row(`image-${Date.now()}`, 'image', {
      src: { url: imageUrl },
      altText: altText || 'Brand image',
    });
    design.body?.rows?.push(newImageRow);
    this.editor.loadDesign(design as never);
  }

  async getRows(): Promise<DesignRow[]> {
    // Wait for Unlayer to commit the design before reading it back.
    await new Promise((res) => setTimeout(res, 200));
    const design = await this.getProject() as { body?: { rows?: any[] } };
    const rawRows: any[] = design.body?.rows ?? [];
    const result: DesignRow[] = [];

    rawRows.forEach((row: any, rowIndex: number) => {
      const rowId: string = row.id ?? `row-${rowIndex}`;
      const columns: any[] = row.columns ?? [];
      let hasContents = false;

      columns.forEach((col: any, colIdx: number) => {
        const contents: any[] = col.contents ?? [];
        contents.forEach((content: any, ci: number) => {
          hasContents = true;
          const contentType: string = content.type ?? 'text';
          const contentId: string = content.id ?? `${rowId}-col${colIdx}-c${ci}`;
          const label = inferRowLabel(contentId, contentType);
          result.push({ id: contentId, label, contentType });
        });
      });

      // If the row has no contents at all, represent the row itself
      if (!hasContents) {
        const label = inferRowLabel(rowId, 'text');
        result.push({ id: rowId, label, contentType: 'text' });
      }
    });

    return result;
  }

  async reorderRows(newIdOrder: string[]): Promise<void> {
    const design = await this.getProject() as { body?: { rows?: any[] } };
    const rows: any[] = design.body?.rows ?? [];

    // Build a flat index: contentId → { col, content }
    type ContentRef = { col: any; content: any };
    const contentById = new Map<string, ContentRef>();
    rows.forEach((row: any) => {
      (row.columns ?? []).forEach((col: any) => {
        (col.contents ?? []).forEach((content: any) => {
          if (content.id) contentById.set(content.id, { col, content });
        });
      });
    });

    const rowIds = new Set(rows.map((r: any) => r.id).filter(Boolean));
    const allAreRows = newIdOrder.every((id) => rowIds.has(id));

    if (allAreRows) {
      // ── Row-level reorder (original behaviour) ───────────────────────────
      const byId = new Map(rows.map((r) => [r.id, r]));
      const reordered = newIdOrder.map((id) => byId.get(id)).filter(Boolean);
      const known = new Set(newIdOrder);
      rows.forEach((r) => { if (!known.has(r.id)) reordered.push(r); });
      if (design.body) design.body.rows = reordered;
    } else {
      // ── Content-level reorder: group by column object ────────────────────
      const groups = new Map<any, any[]>(); // col object → new ordered contents
      for (const id of newIdOrder) {
        const ref = contentById.get(id);
        if (!ref) continue;
        if (!groups.has(ref.col)) groups.set(ref.col, []);
        groups.get(ref.col)!.push(ref.content);
      }
      // Apply new order per column; append any contents not in newIdOrder
      groups.forEach((orderedContents, col) => {
        const known = new Set(newIdOrder);
        const remaining = (col.contents ?? []).filter((c: any) => !known.has(c.id));
        col.contents = [...orderedContents, ...remaining];
      });
    }

    this.editor.loadDesign(design as never);
  }

  async selectRow(rowId: string): Promise<void> {
    // 1. Try Unlayer's internal API if available
    try {
      (this.editor as any).selectRow?.(rowId);
    } catch {}

    // 2. Find the Unlayer iframe and click the rendered element
    try {
      const iframes = document.querySelectorAll('iframe');
      for (const iframe of Array.from(iframes)) {
        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (!doc) continue;

        // Try row-level selectors first, then content-level selectors
        const el: Element | null =
          doc.querySelector(`[data-row="${rowId}"]`) ??
          doc.querySelector(`[data-id="${rowId}"]`) ??
          doc.querySelector(`[data-row-id="${rowId}"]`) ??
          doc.querySelector(`[data-content-id="${rowId}"]`) ??
          doc.getElementById(rowId) ??
          null;

        if (el) {
          (el as HTMLElement).click();
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }

        // Last resort: click the nth .blockbuilder-row by matching design order
        const design = await this.getProject() as { body?: { rows?: any[] } };
        const rows: any[] = design.body?.rows ?? [];
        const rowIndex = rows.findIndex((r) => r.id === rowId);
        if (rowIndex !== -1) {
          const rowEls = doc.querySelectorAll('.blockbuilder-row, [data-row], .u-row');
          const target = rowEls[rowIndex] as HTMLElement | undefined;
          if (target) {
            target.click();
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
          }
        }
      }
    } catch (err) {
      // Silently ignore — selecting in canvas is best-effort
    }
  }


  /** Original content width saved on first setViewportWidth call, so desktop can restore it */
  private _originalContentWidth: string | null = null;

  setDevice(device: PreviewDevice) {
    // Dismiss any Unlayer preview overlay that may be open to return to the editor.
    try { (this.editor as any).hidePreview?.(); } catch {}
    try { (this.editor as any).editor?.hidePreview?.(); } catch {}
    
    // Apply the standard width for the chosen device
    const targetWidth = device === 'mobile' ? 320 : device === 'tablet' ? 480 : 600;
    this.setViewportWidth(targetWidth);
  }

  setViewportWidth(widthPx: number) {
    try {
      // Unlayer's setBodyValues changes only the email content width in JSON
      (this.editor as any).setBodyValues?.({ contentWidth: `${widthPx}px` });
    } catch {
      // Silently ignore if API unavailable
    }

    try {
      // Inject CSS into Unlayer iframe to physically resize the canvas wrapper element on screen
      const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
      for (const iframe of Array.from(iframes)) {
        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (!doc || !doc.head) continue;

        let style = doc.getElementById('__gap-canvas-width-style') as HTMLStyleElement | null;
        if (!style) {
          style = doc.createElement('style');
          style.id = '__gap-canvas-width-style';
          doc.head.appendChild(style);
        }

        style.textContent = `
          .blockbuilder-page,
          .blockbuilder-layer,
          .blockbuilder-content,
          .blockbuilder-page-container,
          .blockbuilder-workspace-canvas,
          .u_body,
          [class*="page-container"],
          [class*="content-container"],
          [class*="body-container"] {
            max-width: ${widthPx}px !important;
            width: ${widthPx}px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            transition: width 0.2s ease, max-width 0.2s ease !important;
          }
        `;
      }
    } catch (_) {}
  }

  /** Currently-selected element data set via BuilderCanvas element:selected event */
  private _selectedData: any = null;

  /** Called from BuilderCanvas when Unlayer fires element:selected */
  setSelectedData(data: any) {
    this._selectedData = data;
  }

  getSelectedComponent() {
    return this._selectedData;
  }

  /**
   * Apply a style/content patch to the currently selected element.
   * For gradient text: wraps plain text in a <span> with webkit gradient CSS.
   * For gradient background: injects it via Unlayer setBodyValues on the row.
   */
  updateSelectedComponent(properties: unknown) {
    const patch = properties as Record<string, any>;
    if (!patch) return;

    try {
      // If there's a `content` patch (gradient text), update via exportHtml -> modify JSON -> loadDesign
      if (patch.content !== undefined && this._selectedData) {
        (this.editor as any).exportHtml?.((data: any) => {
          try {
            const design = data?.design;
            if (!design?.body?.rows) return;
            let patched = false;
            for (const r of design.body.rows) {
              for (const col of r.columns ?? []) {
                for (const content of col.contents ?? []) {
                  if (content.type === 'text' || content.type === 'heading') {
                    content.values = content.values ?? {};
                    content.values.text = patch.content;
                    patched = true;
                    break;
                  }
                }
                if (patched) break;
              }
              if (patched) break;
            }
            if (patched) {
              (this.editor as any).loadDesign?.(design);
            }
          } catch (_) {}
        });
        return;
      }

      // If there's a style.background or background-color (gradient BG), inject CSS
      const bg = patch?.style?.['background'] || patch?.style?.['background-color'];
      if (bg) {
        try {
          const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
          for (const iframe of Array.from(iframes)) {
            const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
            if (!doc?.head) continue;

            const selected = doc.querySelector('.is-selected, .selected, [class*="selected-"]');
            if (selected) {
              (selected as HTMLElement).style.background = bg;
            }

            let styleTag = doc.getElementById('__gap-gradient-bg') as HTMLStyleElement | null;
            if (!styleTag) {
              styleTag = doc.createElement('style');
              styleTag.id = '__gap-gradient-bg';
              doc.head.appendChild(styleTag);
            }
            styleTag.textContent = `
              .blockbuilder-content-tools.selected > .blockbuilder-layer-content,
              [class*="selected"] > .blockbuilder-layer-content,
              .is-selected .blockbuilder-layer-content {
                background: ${bg} !important;
              }
            `;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }
  undo() { (this.editor as any).undo?.(); }
  redo() { (this.editor as any).redo?.(); }
  canUndo() { return true; }
  canRedo() { return true; }
  destroy() {}
}
