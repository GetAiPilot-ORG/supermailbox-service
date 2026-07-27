import React from 'react';

type Props = {
  subject: string;
  preheader: string;
  selected: any;
  onSubjectChange: (value: string) => void;
  onPreheaderChange: (value: string) => void;
  onSelectedChange: (patch: unknown) => void;
};

export const BuilderSettingsPanel: React.FC<Props> = ({ subject, preheader, selected, onSubjectChange, onPreheaderChange, onSelectedChange }) => (
  <aside className="builder-side-panel settings">
    <h3>Document</h3>
    <label>
      Subject
      <input className="ui-input" value={subject} onChange={(event) => onSubjectChange(event.target.value)} />
    </label>
    <label>
      Preheader
      <textarea className="ui-input" value={preheader} onChange={(event) => onPreheaderChange(event.target.value)} rows={3} />
    </label>
    <h3>Selected block</h3>
    {selected ? (
      <>
        <label>
          Content
          <textarea
            className="ui-input"
            value={String(selected.content || '')}
            onChange={(event) => onSelectedChange({ content: event.target.value })}
            rows={4}
          />
        </label>
        <label>
          Link or image URL
          <input
            className="ui-input"
            value={selected.attributes?.href || selected.attributes?.src || ''}
            onChange={(event) => onSelectedChange({ attributes: selected.attributes?.src !== undefined ? { src: event.target.value } : { href: event.target.value } })}
            placeholder="https://..."
          />
        </label>
        <div className="settings-two-col">
          <label>
            Text color
            <input className="ui-input" type="color" value={selected.style?.color || '#25302a'} onChange={(event) => onSelectedChange({ style: { color: event.target.value } })} />
          </label>
          <label>
            Background
            <input className="ui-input" type="color" value={selected.style?.['background-color'] || '#ffffff'} onChange={(event) => onSelectedChange({ style: { 'background-color': event.target.value } })} />
          </label>
        </div>
      </>
    ) : <p className="muted-panel-copy">Select a canvas block to edit its content and style.</p>}
    <div className="merge-tag-list">
      {['{{first_name}}', '{{last_name}}', '{{email}}', '{{company_name}}', '{{unsubscribe_url}}', '{{current_year}}'].map((tag) => <code key={tag}>{tag}</code>)}
    </div>
  </aside>
);
