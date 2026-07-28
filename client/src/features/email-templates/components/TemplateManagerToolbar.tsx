import React from 'react';
import { Grid2X2, List, Plus, RefreshCw, Upload } from 'lucide-react';

type Props = {
  count: number;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onCreate: () => void;
  onRefresh: () => void;
};

export const TemplateManagerToolbar: React.FC<Props> = ({ count, view, onViewChange, onCreate, onRefresh }) => (
  <div className="template-manager-toolbar">
    <div>
      <strong>{count}</strong>
      <span>templates</span>
    </div>
    <div className="template-toolbar-actions">
      <button className="btn-secondary compact" type="button" onClick={onRefresh}><RefreshCw size={15} /> Refresh</button>
      <button className="btn-secondary compact" type="button" disabled title="Import support lands after the MJML flow is verified"><Upload size={15} /> Import HTML</button>
      <button className={`icon-btn ${view === 'grid' ? 'active' : ''}`} type="button" onClick={() => onViewChange('grid')} title="Grid view"><Grid2X2 size={16} /></button>
      <button className={`icon-btn ${view === 'list' ? 'active' : ''}`} type="button" onClick={() => onViewChange('list')} title="List view"><List size={16} /></button>
      <button className="btn-primary compact" type="button" onClick={onCreate}><Plus size={16} /> Create Template</button>
    </div>
  </div>
);
