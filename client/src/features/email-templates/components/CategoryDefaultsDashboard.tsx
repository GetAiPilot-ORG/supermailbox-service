import React, { useState, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  FileCode,
  Flame,
  Layers,
  LayoutGrid,
  Mail,
  Pencil,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import type { CategoryGroupItem, CategoryTemplateItem, EmailTemplate } from '../types/template.types';
import { getTemplateThumbnailHtml } from '../services/templateThumbnail.service';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { templateService } from '../services/template.service';

interface Props {
  categories: CategoryGroupItem[];
  summary: {
    totalCategories: number;
    totalVariants: number;
    activeDefaultsAssigned: number;
    apps: { id: string; name: string; count: number }[];
  };
  loading?: boolean;
  onRefresh: () => Promise<void>;
  onEditTemplate: (templateId: string) => void;
}

export const CategoryDefaultsDashboard: React.FC<Props> = ({
  categories,
  summary,
  loading = false,
  onRefresh,
  onEditTemplate,
}) => {
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [testSendTarget, setTestSendTarget] = useState<CategoryTemplateItem | null>(null);
  const [testEmail, setTestEmail] = useState<string>('priyansh.metabull@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSetDefault = async (categoryId: string, template: CategoryTemplateItem) => {
    if (template.isDefault || settingDefaultId) return;
    setSettingDefaultId(template.id);
    try {
      await templateService.setDefaultTemplate(categoryId, template.id);
      showToast(`✓ "${template.name}" is now the active default for ${categories.find(c => c.id === categoryId)?.name || 'this category'}!`);
      await onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update default template.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleExecuteTestSend = async () => {
    if (!testSendTarget || !testEmail) return;
    setIsSendingTest(true);
    setTestSendResult(null);
    try {
      const sampleData: Record<string, string> = {
        name: 'Priyansh Sharma',
        full_name: 'Priyansh Sharma',
        email: testEmail,
        Token: '849201',
        token: '849201',
        ConfirmationURL: 'https://getaipilot.in/auth/callback?token_hash=849201&type=signup',
        confirmation_url: 'https://getaipilot.in/auth/callback?token_hash=849201&type=signup',
        verify_url: 'https://getaipilot.in/auth/callback?token_hash=849201&type=signup',
        reset_link: 'https://getaipilot.in/auth/callback?token_hash=849201&type=recovery',
        NewEmail: 'new-email@getaipilot.in',
        InviterName: 'Metabull Admin',
        WorkspaceName: 'GetAiPilot Pro Studio',
      };

      const result = await templateService.sendTest(testSendTarget.id, {
        recipientEmail: testEmail,
        subject: `[TEST DEFAULT] ${testSendTarget.subject || testSendTarget.name}`,
        sampleData,
      });

      if (result.success) {
        setTestSendResult({
          success: true,
          message: `Email dispatched successfully to ${testEmail} via ${result.provider || 'ZeptoMail'}!`,
        });
      } else {
        setTestSendResult({
          success: false,
          message: result.error || 'Test send failed to dispatch.',
        });
      }
    } catch (err) {
      setTestSendResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send test email.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchApp = selectedApp === 'all' || cat.app === selectedApp;
      if (!matchApp) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchCat = cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q) || cat.eventTrigger.toLowerCase().includes(q);
      const matchTemplates = cat.templates.some(t => t.name.toLowerCase().includes(q) || (t.subject && t.subject.toLowerCase().includes(q)) || t.key.toLowerCase().includes(q));
      return matchCat || matchTemplates;
    });
  }, [categories, selectedApp, searchQuery]);

  return (
    <div className="category-defaults-dashboard">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="category-toast animate-slide-in">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Stats Hero Bar */}
      <div className="cat-kpi-grid">
        <div className="cat-kpi-card highlight">
          <div className="cat-kpi-header">
            <span className="cat-kpi-title">Categories In Use</span>
            <div className="cat-kpi-icon-pill">
              <Layers size={18} />
            </div>
          </div>
          <div className="cat-kpi-value">{summary.totalCategories}</div>
          <div className="cat-kpi-sub">
            <span className="kpi-tag getaipilot">{summary.apps.find(a => a.id === 'getaipilot')?.count || 9} Core</span>
            <span className="kpi-tag gap">{summary.apps.find(a => a.id === 'gap_whatsapp')?.count || 1} WhatsApp</span>
            <span className="kpi-tag social">{summary.apps.find(a => a.id === 'socialpilot')?.count || 1} Social</span>
          </div>
        </div>

        <div className="cat-kpi-card success">
          <div className="cat-kpi-header">
            <span className="cat-kpi-title">Active Production Defaults</span>
            <div className="cat-kpi-icon-pill success">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="cat-kpi-value">
            {summary.activeDefaultsAssigned} <span className="cat-kpi-denom">/ {summary.totalCategories}</span>
          </div>
          <div className="cat-kpi-sub">
            <span className="status-indicator-dot online" />
            <span className="text-emerald">100% Routed & Ready in Production</span>
          </div>
        </div>

        <div className="cat-kpi-card">
          <div className="cat-kpi-header">
            <span className="cat-kpi-title">Available Variants</span>
            <div className="cat-kpi-icon-pill">
              <LayoutGrid size={18} />
            </div>
          </div>
          <div className="cat-kpi-value">{summary.totalVariants}</div>
          <div className="cat-kpi-sub text-muted">
            Across {summary.totalCategories} transaction & marketing flows
          </div>
        </div>

        <div className="cat-kpi-card">
          <div className="cat-kpi-header">
            <span className="cat-kpi-title">Delivery Engine</span>
            <div className="cat-kpi-icon-pill warning">
              <Zap size={18} />
            </div>
          </div>
          <div className="cat-kpi-value" style={{ fontSize: '1.4rem' }}>ZeptoMail REST</div>
          <div className="cat-kpi-sub">
            <span className="status-indicator-dot online" />
            <span className="text-muted">Direct Deno & Node API Integration</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cat-toolbar">
        <div className="cat-filter-tabs" role="tablist">
          <button
            type="button"
            className={`cat-tab-btn ${selectedApp === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedApp('all')}
          >
            All Categories ({summary.totalCategories})
          </button>
          <button
            type="button"
            className={`cat-tab-btn ${selectedApp === 'getaipilot' ? 'active' : ''}`}
            onClick={() => setSelectedApp('getaipilot')}
          >
            <span className="app-dot getaipilot" />
            GetAiPilot Core ({summary.apps.find(a => a.id === 'getaipilot')?.count || 9})
          </button>
          <button
            type="button"
            className={`cat-tab-btn ${selectedApp === 'gap_whatsapp' ? 'active' : ''}`}
            onClick={() => setSelectedApp('gap_whatsapp')}
          >
            <span className="app-dot gap" />
            GAP WhatsApp ({summary.apps.find(a => a.id === 'gap_whatsapp')?.count || 1})
          </button>
          <button
            type="button"
            className={`cat-tab-btn ${selectedApp === 'socialpilot' ? 'active' : ''}`}
            onClick={() => setSelectedApp('socialpilot')}
          >
            <span className="app-dot social" />
            SocialPilot ({summary.apps.find(a => a.id === 'socialpilot')?.count || 1})
          </button>
        </div>

        <div className="cat-search-box">
          <Search size={16} className="cat-search-icon" />
          <input
            type="text"
            placeholder="Search category, event trigger, template name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cat-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="cat-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Groups List */}
      <div className="cat-groups-list">
        {filteredCategories.map((category) => {
          const isCollapsed = expandedCategories[category.id] === false; // default expanded
          const activeTemplate = category.templates.find((t) => t.isDefault) || category.templates[0];

          return (
            <section key={category.id} className="category-section-card">
              {/* Category Header */}
              <div className="cat-card-header" onClick={() => toggleCategoryExpand(category.id)}>
                <div className="cat-header-left">
                  <div className="cat-title-row">
                    <span className={`cat-app-badge ${category.app}`}>
                      {category.appName}
                    </span>
                    <h3 className="cat-title">{category.name}</h3>
                    <span className="cat-variant-pill">
                      {category.variantsCount} {category.variantsCount === 1 ? 'Variant' : 'Variants'}
                    </span>
                  </div>
                  <p className="cat-desc">{category.description}</p>
                </div>

                <div className="cat-header-right">
                  <div className="cat-trigger-tag" title="API / Auth Event Trigger Key">
                    <Code2 size={13} />
                    <span>{category.eventTrigger}</span>
                  </div>

                  <div className="cat-active-summary-pill" title="Currently Active Production Default">
                    <span className="cat-star-icon">★</span>
                    <span className="cat-active-name">{category.activeDefaultTemplateName}</span>
                  </div>

                  <button
                    type="button"
                    className="cat-collapse-btn"
                    aria-label="Toggle category expansion"
                  >
                    {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>
              </div>

              {/* Category Body & Variants Grid */}
              {!isCollapsed && (
                <div className="cat-card-body">
                  <div className="variants-grid">
                    {category.templates.map((template) => {
                      const isDefault = template.isDefault;
                      const isSavingThis = settingDefaultId === template.id;
                      const htmlContent = template.compiledHtml || template.mjmlContent || '';

                      return (
                        <article
                          key={template.id}
                          className={`variant-card ${isDefault ? 'is-active-default' : ''}`}
                        >
                          {/* Top Status Banner */}
                          <div className="variant-status-bar">
                            {isDefault ? (
                              <div className="variant-badge active-default">
                                <Check size={13} strokeWidth={3} />
                                <span>ACTIVE DEFAULT</span>
                              </div>
                            ) : (
                              <div className="variant-badge alternate">
                                <span>Variant</span>
                              </div>
                            )}

                            <span className={`variant-publish-tag ${template.status}`}>
                              {template.status}
                            </span>
                          </div>

                          {/* Live Preview Thumbnail Container */}
                          <div
                            className="variant-preview-container"
                            onClick={() => setPreviewTemplate(template)}
                            title="Click for full interactive preview"
                          >
                            <iframe
                              title={`${template.name} preview`}
                              srcDoc={getTemplateThumbnailHtml(htmlContent)}
                              loading="lazy"
                              tabIndex={-1}
                              className="variant-preview-iframe"
                            />
                            <div className="variant-preview-overlay">
                              <Eye size={18} />
                              <span>Full Preview</span>
                            </div>
                          </div>

                          {/* Variant Details */}
                          <div className="variant-info">
                            <h4 className="variant-name" title={template.name}>
                              {template.name}
                            </h4>
                            <p className="variant-subject" title={template.subject || 'No subject line'}>
                              {template.subject || '— No Subject Line Set —'}
                            </p>
                            <div className="variant-meta">
                              <span className="variant-key" title={`System Key: ${template.key}`}>
                                <code>{template.key}</code>
                              </span>
                              {template.updatedAt && (
                                <span className="variant-updated" title="Last Updated">
                                  <Clock size={12} />
                                  {new Date(template.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="variant-actions">
                            {isDefault ? (
                              <button
                                type="button"
                                className="btn-default-active"
                                disabled
                              >
                                <CheckCircle2 size={15} />
                                Active in Production
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-set-default"
                                disabled={isSavingThis || !!settingDefaultId}
                                onClick={() => handleSetDefault(category.id, template)}
                              >
                                {isSavingThis ? (
                                  <span className="spinner-sm" />
                                ) : (
                                  <Star size={14} className="star-icon" />
                                )}
                                Set as Active Default
                              </button>
                            )}

                            <div className="variant-secondary-actions">
                              <button
                                type="button"
                                className="btn-icon-action"
                                title="Instant Test Send to Inbox"
                                onClick={() => {
                                  setTestSendTarget(template);
                                  setTestSendResult(null);
                                }}
                              >
                                <Send size={14} />
                                <span>Test Send</span>
                              </button>

                              <button
                                type="button"
                                className="btn-icon-action"
                                title="Edit in Visual Builder"
                                onClick={() => onEditTemplate(template.id)}
                              >
                                <Pencil size={14} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="cat-empty-state">
            <Layers size={40} className="empty-icon" />
            <h3>No categories match your search</h3>
            <p>Try clearing filters or search terms to see all email categories.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => { setSelectedApp('all'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewDialog
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Quick Test Send Modal */}
      {testSendTarget && (
        <div className="cat-modal-backdrop" onClick={() => !isSendingTest && setTestSendTarget(null)}>
          <div className="cat-test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal-header">
              <div className="modal-title-wrap">
                <Send size={18} className="text-emerald" />
                <h3>Quick Test Dispatch</h3>
              </div>
              <button
                type="button"
                className="cat-modal-close"
                disabled={isSendingTest}
                onClick={() => setTestSendTarget(null)}
              >
                ×
              </button>
            </div>

            <div className="cat-modal-body">
              <div className="test-target-banner">
                <div className="target-pill">Target Template</div>
                <div className="target-name">{testSendTarget.name}</div>
                <div className="target-key"><code>{testSendTarget.key}</code></div>
              </div>

              <div className="cat-form-group">
                <label htmlFor="test-recipient-input">Recipient Email Address</label>
                <input
                  id="test-recipient-input"
                  type="email"
                  className="cat-input"
                  placeholder="name@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={isSendingTest}
                />
                <span className="cat-input-hint">
                  Realistic test variables (Token, ConfirmationURL, InviterName, Workspace) are automatically injected.
                </span>
              </div>

              {testSendResult && (
                <div className={`test-result-box ${testSendResult.success ? 'success' : 'error'}`}>
                  {testSendResult.success ? (
                    <CheckCircle2 size={18} className="result-icon success" />
                  ) : (
                    <Zap size={18} className="result-icon error" />
                  )}
                  <p>{testSendResult.message}</p>
                </div>
              )}
            </div>

            <div className="cat-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSendingTest}
                onClick={() => setTestSendTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isSendingTest || !testEmail}
                onClick={handleExecuteTestSend}
              >
                {isSendingTest ? (
                  <>
                    <span className="spinner-sm" />
                    Sending via ZeptoMail...
                  </>
                ) : (
                  <>
                    <Zap size={15} />
                    Send Test Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
