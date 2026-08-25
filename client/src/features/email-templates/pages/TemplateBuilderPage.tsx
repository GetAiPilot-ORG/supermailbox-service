import React, { useEffect, useState } from 'react';
import { EmailBuilder } from '../builder/EmailBuilder';
import { templateService } from '../services/template.service';
import type { EmailTemplate } from '../types/template.types';

type Props = {
  templateId: string;
  onBack: () => void;
  onSavedExit: () => void;
};

export const TemplateBuilderPage: React.FC<Props> = ({ templateId, onBack, onSavedExit }) => {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    templateService.getTemplate(templateId)
      .then((data) => data ? setTemplate(data) : setError('Template not found.'))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load template.'));
  }, [templateId]);

  if (error) {
    return <div className="template-state"><strong>Builder failed</strong><p>{error}</p><button className="btn-secondary" type="button" onClick={onBack}>Back</button></div>;
  }

  if (!template) {
    return <div className="template-state"><strong>Opening builder...</strong><p>Loading template source and editor assets.</p></div>;
  }

  return <EmailBuilder key={template.id} template={template} onBack={onBack} onSavedExit={onSavedExit} />;
};
