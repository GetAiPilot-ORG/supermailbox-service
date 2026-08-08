import React, { useState } from 'react';
import { EmailBuilder } from '../builder/EmailBuilder';
import type { EmailTemplate } from '../types/template.types';

const mockCustomTemplate: EmailTemplate = {
  id: 'custom-poc-template',
  key: 'custom-poc',
  name: 'Custom Email Builder POC',
  subject: 'Welcome to Custom Email Builder',
  preheader: 'Testing native React drag & drop builder',
  category: 'transactional',
  status: 'draft',
  visibility: 'private',
  editorType: 'custom-dnd',
  versionNumber: 1,
  isSystemTemplate: false,
  isArchived: false,
};

export const CustomEmailEditorPoc: React.FC = () => {
  const [notice, setNotice] = useState('Native Custom Drag-and-Drop Email Builder (Phase 1)');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EmailBuilder
        template={mockCustomTemplate}
        onBack={() => { window.location.href = '/dashboard/templates'; }}
        onSavedExit={() => { window.location.href = '/dashboard/templates'; }}
      />
    </div>
  );
};
