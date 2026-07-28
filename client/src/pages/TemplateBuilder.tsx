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
    // Register image upload callback with Cloudinary support
    unlayer.registerCallback('image', async (file: any, done: Function) => {
      const uploadFile = file.attachments[0];
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      const fallbackToBase64 = () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          done({ progress: 100, url: e.target?.result });
        };
        reader.readAsDataURL(uploadFile);
      };

      if (cloudName && uploadPreset) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('upload_preset', uploadPreset);

        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.secure_url) {
            done({ progress: 100, url: data.secure_url });
          } else {
            console.error('Cloudinary upload failed:', data);
            fallbackToBase64();
          }
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          fallbackToBase64();
        }
      } else {
        fallbackToBase64();
      }
    });

    // A robust skeleton design matching standard newsletter layout
    const skeletonDesign = {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "image",
                    values: {
                      src: {
                        url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=200&fit=crop",
                        width: 600,
                        height: 200
                      },
                      padding: "0px",
                      textAlign: "center"
                    }
                  },
                  {
                    type: "heading",
                    values: {
                      headingType: "h1",
                      text: "Welcome to the Platform",
                      textAlign: "center",
                      color: "#111111",
                      padding: "30px 20px 10px 20px"
                    }
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style=\"text-align: center; color: #555555; font-size: 16px; line-height: 1.6;\">This is a great starting point for your email. You can easily drag and drop new blocks from the right panel, edit this text, or replace the header image.</p>",
                      padding: "10px 30px"
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
                      padding: "20px",
                      borderRadius: "6px",
                      textAlign: "center"
                    }
                  },
                  {
                    type: "divider",
                    values: {
                      width: "100%",
                      borderSize: "1px",
                      borderStyle: "solid",
                      borderColor: "#EEEEEE",
                      padding: "20px"
                    }
                  },
                  {
                    type: "social",
                    values: {
                      textAlign: "center",
                      padding: "10px 20px 30px 20px"
                    }
                  }
                ],
                values: {
                  backgroundColor: "#ffffff",
                  padding: "0px",
                  borderRadius: "12px",
                  overflow: "hidden"
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
    
    if (liveVersion?.design) {
      try {
        const d = typeof liveVersion.design === 'string' ? JSON.parse(liveVersion.design) : liveVersion.design;
        unlayer.loadDesign(d);
      } catch (e) {
        console.error('Error parsing template design JSON:', e);
        unlayer.loadDesign(skeletonDesign as any);
      }
    } else {
      unlayer.loadDesign(skeletonDesign as any);
    }
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
    <div className="template-workshop" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 24px)', padding: 0, gap: 0, overflow: 'hidden' }}>
      
      <header className="template-studio-command" style={{ 
        margin: 0, 
        padding: '0 24px', 
        flexShrink: 0, 
        background: '#ffffff', 
        borderBottom: '1px solid #e1e1e1',
        minHeight: '60px'
      }}>
        <div className="template-toolbar-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}>
            Back
          </button>
          <span>Templates</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '1rem', fontWeight: 300 }}>/</span>
          <strong style={{ fontSize: '0.95rem' }}>{activeTemplate?.name || 'Email builder'}</strong>
        </div>
        <div className="template-toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Email Subject Line"
            className="ui-input" 
            style={{ width: '320px', fontWeight: 500, margin: 0, padding: '8px 14px', height: 'auto', fontSize: '14px', boxShadow: 'none', borderRadius: '6px' }} 
          />
          <span className={`template-status-badge status-${templateStatus.toLowerCase()}`}>
            <ShieldCheck size={14} /> {templateStatus}
          </span>
          <button type="button" className="primary" onClick={handleSave} style={{ padding: '8px 18px', borderRadius: '6px' }}>
            {saveSuccess ? <Check size={16} /> : <Save size={16} />}
            {saveSuccess ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <EmailEditor 
          ref={emailEditorRef} 
          onReady={onReady} 
          minHeight="100%"
          style={{ flex: 1, display: 'flex', height: '100%' }}
          options={{
            customFonts: [
              {
                label: "Body Font",
                value: "'Host Grotesk', sans-serif",
                url: "https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300;400;500;600;700;800&display=swap"
              },
              { label: "Arial", value: "arial,helvetica,sans-serif" },
              { label: "Courier New", value: "'courier new',courier,monospace" },
              { label: "Georgia", value: "georgia,palatino,serif" },
              { label: "Helvetica", value: "helvetica,arial,sans-serif" },
              { label: "Times New Roman", value: "'times new roman',times,serif" },
              { label: "Verdana", value: "verdana,geneva,sans-serif" }
            ]
          } as any}
        />
      </div>

    </div>
  );
};
