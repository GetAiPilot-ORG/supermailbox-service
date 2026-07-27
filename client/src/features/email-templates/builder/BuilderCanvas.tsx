import React, { useRef } from 'react';
import EmailEditor, { type EditorRef } from 'react-email-editor';
import { ReactEmailEditorAdapter, designFromHtml } from './adapters/ReactEmailEditorAdapter';
import type { EmailEditorAdapter } from './adapters/EmailEditorAdapter';

type Props = {
  mjml: string;
  html?: string;
  name: string;
  project?: unknown;
  onReady: (adapter: EmailEditorAdapter) => void;
  onChange: () => void;
  onSelect: (component: unknown) => void;
};

const isUnlayerDesign = (value: unknown): value is { body: unknown } => Boolean(value && typeof value === 'object' && 'body' in value);

export const BuilderCanvas: React.FC<Props> = ({ html, name, project, onReady, onChange, onSelect }) => {
  const editorRef = useRef<EditorRef>(null);

  return (
    <div className="builder-canvas-shell">
      <EmailEditor
        ref={editorRef}
        minHeight="100%"
        options={{
          displayMode: 'email',
          mergeTags: {
            first_name: { name: 'First name', value: '{{first_name}}' },
            company_name: { name: 'Company name', value: '{{company_name}}' },
            cta_url: { name: 'CTA URL', value: '{{cta_url}}' },
            unsubscribe_url: { name: 'Unsubscribe URL', value: '{{unsubscribe_url}}' },
          },
        }}
        onReady={(editor) => {
          const adapter = new ReactEmailEditorAdapter(editor);
          editor.loadDesign((isUnlayerDesign(project) ? project : designFromHtml(html || '', name)) as never);
          (editor as any).addEventListener?.('design:updated', onChange);
          onReady(adapter);
          onSelect(null);
        }}
      />
    </div>
  );
};
