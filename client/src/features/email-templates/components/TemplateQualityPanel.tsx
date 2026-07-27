import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { QualityIssue } from '../types/template.types';

type Props = { issues: QualityIssue[]; loading?: boolean };

export const TemplateQualityPanel: React.FC<Props> = ({ issues, loading }) => (
  <aside className="template-quality-panel">
    <h3>Quality checks</h3>
    {loading ? <p>Checking template...</p> : issues.map((issue) => (
      <div key={issue.code} className={`quality-row ${issue.level}`}>
        {issue.level === 'pass' ? <CheckCircle2 size={15} /> : issue.level === 'warning' ? <AlertTriangle size={15} /> : <XCircle size={15} />}
        <span>{issue.message}</span>
      </div>
    ))}
  </aside>
);
