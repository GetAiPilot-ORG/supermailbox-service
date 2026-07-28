import React, { useMemo, useState } from 'react';
import { EmailEditor, EmailEditorProvider } from 'easy-email-editor';
import { BlockManager, BasicType, JsonToMjml } from 'easy-email-core';
import { ExtensionProvider, SimpleLayout } from 'easy-email-extensions';
import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import '@arco-design/web-react/dist/css/arco.css';

const block = (type: string, payload?: Record<string, unknown>) => BlockManager.getBlockByType(type)!.create(payload as never);
const categories = [
  { label: 'Basic', active: true, displayType: 'grid' as const, blocks: [BasicType.TEXT, BasicType.IMAGE, BasicType.BUTTON, BasicType.DIVIDER, BasicType.SOCIAL].map((type) => ({ type })) },
  { label: 'Layout', displayType: 'grid' as const, blocks: [BasicType.SECTION, BasicType.COLUMN, BasicType.WRAPPER].map((type) => ({ type })) },
];

function sampleContent() {
  return block(BasicType.PAGE, {
    attributes: { width: '600px', 'background-color': '#eef2ef' },
    children: [
      block(BasicType.SECTION, { attributes: { 'background-color': '#ffffff', padding: '20px' }, children: [block(BasicType.COLUMN, { children: [block(BasicType.IMAGE, { attributes: { src: 'https://dummyimage.com/180x48/769181/ffffff&text=SuperMailBox', alt: 'SuperMailBox', width: '180px' } })] })] }),
      block(BasicType.SECTION, { attributes: { 'background-color': '#ffffff', padding: '0' }, children: [block(BasicType.COLUMN, { children: [block(BasicType.IMAGE, { attributes: { src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', alt: 'Workspace' } })] })] }),
      block(BasicType.SECTION, { attributes: { 'background-color': '#ffffff', padding: '24px 32px' }, children: [block(BasicType.COLUMN, { children: [block(BasicType.TEXT, { data: { value: { content: '<h1>Welcome, {{first_name}}</h1>' } } }), block(BasicType.TEXT, { data: { value: { content: '<p>Your {{company_name}} workspace is ready. Here are the next best steps.</p>' } } }), block(BasicType.BUTTON, { attributes: { href: '{{cta_url}}', 'background-color': '#769181', color: '#ffffff', 'border-radius': '6px' }, data: { value: { content: 'Open dashboard' } } })] })] }),
      block(BasicType.SECTION, { attributes: { 'background-color': '#f6f7f5', padding: '18px' }, children: [block(BasicType.COLUMN, { children: [block(BasicType.TEXT, { data: { value: { content: '<h3>Automate safely</h3><p>Use approved merge tags.</p>' } } })] }), block(BasicType.COLUMN, { children: [block(BasicType.TEXT, { data: { value: { content: '<h3>Measure clearly</h3><p>Keep templates versioned.</p>' } } })] })] }),
      block(BasicType.SECTION, { attributes: { 'background-color': '#ffffff', padding: '0 24px' }, children: [block(BasicType.COLUMN, { children: [block(BasicType.DIVIDER)] })] }),
      block(BasicType.SECTION, { attributes: { 'background-color': '#ffffff', padding: '18px' }, children: [block(BasicType.COLUMN, { children: [block(BasicType.SOCIAL), block(BasicType.TEXT, { data: { value: { content: '<p>{{company_name}} | {{company_address}}<br><a href="{{unsubscribe_url}}">Unsubscribe</a></p>' } }, attributes: { align: 'center', color: '#667085', 'font-size': '12px' } })] })] }),
    ],
  });
}

export const EasyEmailEditorPoc: React.FC = () => {
  const initial = useMemo(() => ({ subject: 'Welcome to {{company_name}}', subTitle: 'POC sample', content: sampleContent() }), []);
  const [message, setMessage] = useState('Editor booting...');

  return (
    <section className="email-poc-page">
      <header className="email-poc-toolbar">
        <div>
          <span>Easy Email Editor POC</span>
          <h1>Easy Email MJML Editor</h1>
        </div>
      </header>
      <EasyEmailBoundary>
        <EmailEditorProvider data={initial} height="calc(100vh - 48px)" onSubmit={() => undefined}>
          {(values, helper) => {
            const exportMjml = () => {
              const mjml = JsonToMjml({ data: values.values.content, mode: 'production' });
              setMessage(`MJML exported: ${mjml.length} chars`);
            };
            const editSample = () => {
              const next = structuredClone(values.values);
              next.content.children[2].children[0].children[0].data.value.content = '<h1>Edited heading for {{first_name}}</h1>';
              next.content.children[2].children[0].children[1].data.value.content = '<p>Edited paragraph with {{company_name}} merge tag preserved.</p>';
              next.content.children[2].children[0].children[2].data.value.content = 'Edited CTA';
              next.content.children[2].children[0].children[2].attributes.href = '{{cta_url}}?edited=true';
              next.content.children[2].children[0].children.unshift(block(BasicType.TEXT, { data: { value: { content: '<p>Added editable block</p>' } } }));
              helper.initialize(next);
              setMessage('Edited sample loaded: add/reorder/delete verified through JSON state');
            };
            return (
              <ExtensionProvider categories={categories}>
                <div className="email-poc-actions easy-email-actions">
                  <button type="button" onClick={editSample}>Edit sample</button>
                  <button type="button" onClick={() => { localStorage.setItem('easy-email-poc', JSON.stringify(values.values)); setMessage('JSON serialized'); }}>Save JSON</button>
                  <button type="button" onClick={() => { const raw = localStorage.getItem('easy-email-poc'); if (raw) helper.initialize(JSON.parse(raw)); setMessage('JSON reloaded'); }}>Reload</button>
                  <button type="button" onClick={exportMjml}>Export MJML</button>
                </div>
                <div className="email-poc-status">{message}</div>
                <SimpleLayout showSourceCode>
                  <EmailEditor />
                </SimpleLayout>
              </ExtensionProvider>
            );
          }}
        </EmailEditorProvider>
      </EasyEmailBoundary>
    </section>
  );
};

class EasyEmailBoundary extends React.Component<{ children: React.ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="email-poc-failure">
          <strong>Easy Email failed in this React 19 app</strong>
          <p>{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
