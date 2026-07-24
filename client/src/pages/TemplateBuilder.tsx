import React, { useRef, useState } from 'react';
import { Save, Check, ShieldCheck } from 'lucide-react';
import EmailEditor from 'react-email-editor';
import type { EditorRef, EmailEditorProps } from 'react-email-editor';
import type { Template } from '../services/api';

interface TemplateBuilderProps {
  templates: Template[];
  templateKey: string;
  onBack: () => void;
  onPromoteVersion?: (templateKey: string, versionName: string) => void;
  onSaveDraft?: (templateKey: string, subject: string, html: string, design?: any) => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  templates,
  templateKey,
  onBack,
  onSaveDraft,
}) => {
  const activeTemplate = templates.find((t) => t.key === templateKey) || templates[0];
  const liveVersion = activeTemplate?.versions.find((v) => v.status === 'Live') || activeTemplate?.versions[0];
  const templateStatus = liveVersion?.status || 'Draft';
  
  const [subject, setSubject] = useState(liveVersion?.subject || 'Welcome to our platform!');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const emailEditorRef = useRef<EditorRef>(null);

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    // A basic starter skeleton design
    const skeletonDesign = {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "text",
                    values: {
                      text: "<h1 style=\"text-align: center; color: #333;\">Your Awesome Email</h1><p style=\"text-align: center; color: #555;\">Start customizing this skeleton template.</p>"
                    }
                  },
                  {
                    type: "button",
                    values: {
                      text: "<strong>Call To Action</strong>",
                      buttonColors: {
                        color: "#FFFFFF",
                        backgroundColor: "#2357D8",
                        hoverColor: "#FFFFFF",
                        hoverBackgroundColor: "#1a46b3"
                      },
                      padding: "12px 24px",
                      borderRadius: "6px",
                      textAlign: "center"
                    }
                  }
                ],
                values: {
                  backgroundColor: "#ffffff",
                  padding: "40px",
                  borderRadius: "8px"
                }
              }
            ],
            values: {
              backgroundColor: "#f4f4f6",
              padding: "40px 20px"
            }
          }
        ],
        values: {
          backgroundColor: "#f4f4f6",
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif"
          }
        }
      }
    };
    
    // Load the skeleton design
    unlayer.loadDesign(skeletonDesign as any);
  };

  const handleSave = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.exportHtml((data) => {
      const { design, html } = data;
      // 'design' is the JSON representation, 'html' is the generated email markup
      if (onSaveDraft) {
        onSaveDraft(templateKey, subject, html, design);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    });
  };

  return (
    <div className="template-workshop" style={{ display: 'flex', flexDirection: 'column' }}>
      
      <header className="template-studio-command" style={{ margin: '0 24px', flexShrink: 0 }}>
        <div className="template-toolbar-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Back
          </button>
          <span>Templates</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '1rem', fontWeight: 300 }}>/</span>
          <strong>{activeTemplate?.name || 'Email builder'}</strong>
        </div>
        <div className="template-toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Email Subject Line"
            className="ui-input" 
            style={{ width: '320px', fontWeight: 500, margin: 0, padding: '8px 12px', height: 'auto', fontSize: '14px', boxShadow: 'none' }} 
          />
          <span className={`template-status-badge status-${templateStatus.toLowerCase()}`}>
            <ShieldCheck size={14} /> {templateStatus}
          </span>
          <button type="button" className="primary" onClick={handleSave}>
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            {saveSuccess ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative', borderTop: '1px solid var(--border-color)' }}>
        <EmailEditor 
          ref={emailEditorRef} 
          onReady={onReady} 
          minHeight="100%"
          style={{ flex: 1, display: 'flex', height: '100%' }}
        />
      </div>

    </div>
  );
};
