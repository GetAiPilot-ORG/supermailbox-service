import React, { useState } from 'react';
import { Plus, X, Edit2, Layers, Search, Clock, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Template } from '../services/api';

const AutoScalingPreview = ({ html }: { html: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(600);

  const updateScale = React.useCallback(() => {
    if (containerRef.current) {
      const containerH = containerRef.current.clientHeight;
      if (contentHeight > containerH && containerH > 0) {
        // Add a small 0.98 multiplier to give a tiny bit of visual padding at the top/bottom
        setScale((containerH / contentHeight) * 0.96);
      } else {
        setScale(1);
      }
    }
  }, [contentHeight]);

  React.useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ 
        width: `${100 / scale}%`, 
        height: contentHeight,
        transform: `scale(${scale})`, 
        transformOrigin: 'top center',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <iframe 
          title="Template Preview" 
          srcDoc={html} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
          onLoad={(e) => {
             try {
               const doc = e.currentTarget.contentWindow?.document;
               if (doc) {
                  // small delay to ensure styles and images affect scrollHeight
                  setTimeout(() => {
                    const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
                    setContentHeight(Math.max(height + 20, 600)); // +20 for bottom padding
                  }, 50);
               }
             } catch(err) {}
          }}
        />
      </div>
    </div>
  );
};

interface TemplateManagerProps {
  templates: Template[];
  onEditTemplate: (templateKey: string) => void;
  onCreateTemplate?: (newTemplate: Template) => void;
  onDeleteTemplate?: (templateKey: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onEditTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplKey, setNewTmplKey] = useState('');
  const [newTmplCategory, setNewTmplCategory] = useState('transactional');

  const filteredTemplates = templates.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewTemplate = () => {
    if (!newTmplName.trim()) return;
    const key = newTmplKey.trim() || newTmplName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    const defaultHtml = `<div style="background: #FFFFFC; padding: 40px; border-radius: 16px; border: 1px solid #D9D6CD; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #252722; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.02em; font-family: 'Host Grotesk', sans-serif;">New Template</h1>
  </div>
  <div style="color: #676D63; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center; font-family: 'Host Grotesk', sans-serif;">
    Start building your template here.
  </div>
</div>`;

    const newTmpl: Template = {
      key,
      name: newTmplName,
      category: (newTmplCategory === 'marketing' ? 'marketing' : 'transactional'),
      versions: [
        {
          version: 'v1.0.0',
          status: 'Draft',
          html: defaultHtml,
          subject: newTmplName,
          author: 'Admin User',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          variables: ['name']
        }
      ]
    };
    if (onCreateTemplate) {
      onCreateTemplate(newTmpl);
      onEditTemplate(newTmpl.key);
    }
    setShowCreateModal(false);
    setNewTmplName('');
    setNewTmplKey('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="template-manager" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--background)' }}>
      
      {/* Header Section */}
      <div style={{ 
        padding: '32px 48px 24px',
        background: 'var(--background)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Message Templates</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
              Manage your email message templates
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '0 48px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="ui-input"
              placeholder="Search template name or message..." 
              style={{ 
                width: '100%', 
                padding: '8px 12px 8px 36px',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-muted)',
                boxSizing: 'border-box'
              }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Layers size={16} color="var(--text-secondary)" /> All Templates
          </button>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 5</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}><Clock size={14} /> 5</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> 0</span>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Clock size={16} /> Sync Status
          </button>
        </div>

        {/* Banner */}
        <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--warning)', marginTop: '2px' }}><Clock size={18} /></div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px 0' }}>Template approval taking longer?</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Check content, category, account health and Meta review steps.</p>
            </div>
          </div>
          <button style={{ fontSize: '0.75rem', color: 'var(--ink)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            8 checks <Clock size={12} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '40px' }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 2.5fr 1fr 1fr 80px', 
            padding: '12px 24px', 
            borderBottom: '1px solid var(--border)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Template name <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Category <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Subject / Details <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Versions <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Last edited <span style={{ fontSize: '0.6rem' }}>↓</span></div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Body */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTemplates.map((template, index) => {
              const liveVersion = template.versions.find(v => v.status === 'Live') || template.versions[0];
              const isLast = index === filteredTemplates.length - 1;
              
              return (
                <div 
                  key={template.key} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 2.5fr 1fr 1fr 80px', 
                    padding: '16px 24px', 
                    alignItems: 'center',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    background: 'var(--surface-muted)',
                    cursor: 'pointer',
                  }} 
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; }}
                  onClick={() => setPreviewTemplate(template)}
                >
                  
                  {/* Name & Key */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '16px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>
                      {template.name || template.key}
                    </span>
                  </div>

                  {/* Category */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {template.category === 'marketing' ? 'Marketing' : 'Transactional'}
                  </div>

                  {/* Subject */}
                  <div style={{ paddingRight: '16px' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>
                      {liveVersion?.subject || 'No subject set'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {template.key}
                    </div>
                  </div>

                  {/* Versions */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', background: 'var(--surface)' }}>
                       <Clock size={12} color="var(--text-secondary)" /> {template.versions.length} version{template.versions.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {liveVersion?.date?.split(' ')[0] || 'Unknown'}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditTemplate(template.key); }} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Edit Template"
                    >
                      <Edit2 size={16} />
                    </button>
                    {onDeleteTemplate && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteTemplate(template.key); }} 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-muted)' }}>
              <div>{filteredTemplates.length} templates shown</div>
              <div>Live from Meta</div>
            </div>
          </div>
        </div>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Layers size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>No templates found</h4>
            <p style={{ fontSize: '0.875rem' }}>Adjust your search or create a new template to get started.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ width: '100%', maxWidth: '440px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px 0' }}>New Template</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Define your template settings.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}><X size={20} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Template Name</label>
                  <input type="text" value={newTmplName} onChange={(e) => { setNewTmplName(e.target.value); setNewTmplKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')); }} placeholder="e.g. Monthly Newsletter" className="ui-input" style={{ width: '100%', borderRadius: 'var(--radius-md)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Unique Key</label>
                  <input type="text" value={newTmplKey} onChange={(e) => setNewTmplKey(e.target.value)} placeholder="e.g. monthly_newsletter" className="ui-input" style={{ width: '100%', fontFamily: 'monospace', borderRadius: 'var(--radius-md)', background: 'var(--surface)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Category</label>
                  <select value={newTmplCategory} onChange={(e) => setNewTmplCategory(e.target.value)} className="ui-input" style={{ width: '100%', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--surface-muted)', boxSizing: 'border-box' }}>
                    <option value="transactional">Transactional (Receipts, Auth, Alerts)</option>
                    <option value="marketing">Marketing (Newsletters, Promos)</option>
                  </select>
                </div>
              </div>
              
              <button onClick={handleCreateNewTemplate} style={{ width: '100%', padding: '10px', fontSize: '0.875rem', fontWeight: 500, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>Create & Start Editing</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} 
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ width: '100%', maxWidth: '900px', height: '85vh', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', overflow: 'hidden' }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Preview: {previewTemplate.name || previewTemplate.key}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{previewTemplate.key}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => { onEditTemplate(previewTemplate.key); setPreviewTemplate(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: 500, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <Edit2 size={14} /> Open Editor
                  </button>
                  <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
                  <button onClick={() => setPreviewTemplate(null)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div style={{ flex: 1, background: 'var(--surface)', padding: '32px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '680px', height: '100%', background: 'var(--surface-muted)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {(() => {
                    const liveVersion = previewTemplate.versions.find((v) => v.status === 'Live') || previewTemplate.versions[0];
                    if (liveVersion && liveVersion.html) {
                      return <AutoScalingPreview html={liveVersion.html} />;
                    } else {
                      return (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
                          <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>No HTML content</h4>
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>This template is currently empty. Click "Open Editor" to start building it.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
