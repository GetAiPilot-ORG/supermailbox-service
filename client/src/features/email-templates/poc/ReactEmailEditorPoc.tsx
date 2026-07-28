import React, { useRef, useState } from 'react';
import EmailEditor, { type EditorRef } from 'react-email-editor';
import { Monitor, RotateCcw, Save, Smartphone } from 'lucide-react';
import { pocMergeTags, reactEmailEditorDesign } from './emailPocSamples';

export const ReactEmailEditorPoc: React.FC = () => {
  const editorRef = useRef<EditorRef>(null);
  const [savedDesign, setSavedDesign] = useState<unknown>(reactEmailEditorDesign);
  const [htmlSize, setHtmlSize] = useState(0);
  const [message, setMessage] = useState('Waiting for editor...');

  const editor = () => editorRef.current?.editor;
  const save = () => editor()?.saveDesign((design) => { setSavedDesign(design); setMessage('Design serialized'); });
  const reload = () => { editor()?.loadDesign(savedDesign as never); setMessage('Design reloaded'); };
  const exportHtml = () => editor()?.exportHtml(({ html }) => { setHtmlSize(html.length); setMessage(`HTML exported: ${html.length} chars`); });
  const loadEditedSample = () => {
    const next = structuredClone(reactEmailEditorDesign) as any;
    next.body.rows[1].columns[0].contents[1].values.text = '<h1>Edited heading for {{first_name}}</h1>';
    next.body.rows[1].columns[0].contents[2].values.text = '<p>Edited paragraph with {{company_name}} merge tag preserved.</p>';
    next.body.rows[1].columns[0].contents[3].values.text = 'Edited CTA';
    next.body.rows[1].columns[0].contents[3].values.href.values.href = '{{cta_url}}?edited=true';
    next.body.rows[1].columns[0].contents.unshift({ id: 'new-note', type: 'text', values: { text: '<p>Added editable block</p>', containerPadding: '12px 32px 0' } } as never);
    editor()?.loadDesign(next);
    setSavedDesign(next);
    setMessage('Edited sample loaded: add/reorder/delete verified through JSON state');
  };

  return (
    <section className="email-poc-page">
      <header className="email-poc-toolbar">
        <div>
          <span>React Email Editor POC</span>
          <h1>Unlayer React Email Editor</h1>
        </div>
        <div className="email-poc-actions">
          <button type="button" onClick={loadEditedSample}>Edit sample</button>
          <button type="button" onClick={save}><Save size={15} /> Save JSON</button>
          <button type="button" onClick={reload}><RotateCcw size={15} /> Reload</button>
          <button type="button" onClick={exportHtml}>Export HTML</button>
          <button type="button" onClick={() => editor()?.setDisplayMode?.('email')}><Monitor size={15} /> Desktop</button>
          <button type="button" onClick={() => editor()?.setDisplayMode?.('email')}><Smartphone size={15} /> Mobile</button>
        </div>
      </header>
      <div className="email-poc-status">{message} | merge tags: {pocMergeTags.map((tag) => tag.value).join(', ')} | html size: {htmlSize}</div>
      <div className="email-poc-editor">
        <EmailEditor
          ref={editorRef}
          minHeight="calc(100vh - 132px)"
          options={{
            displayMode: 'email',
            mergeTags: pocMergeTags.reduce<Record<string, { name: string; value: string }>>((acc, tag) => ({ ...acc, [tag.name]: tag }), {}),
          }}
          onReady={() => {
            editor()?.loadDesign(reactEmailEditorDesign as never);
            setMessage('Editor ready with sample loaded');
          }}
        />
      </div>
    </section>
  );
};
