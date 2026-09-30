// GetAiPilot & SocialPilot Main Application
// GetAiPilot & SocialPilot Main Application
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sidebar, type TabType } from './components/Sidebar';
import { DashboardQueueMonitor } from './pages/DashboardQueueMonitor';
import { ProjectLogsViewer } from './pages/ProjectLogsViewer';
import { BrandLibraryPage } from './features/brand-library';
import { TemplateManagerPage } from './features/email-templates/pages/TemplateManagerPage';
import { TemplateGalleryPage } from './features/email-templates/pages/TemplateGalleryPage';
import { TemplateBuilderPage } from './features/email-templates/pages/TemplateBuilderPage';
import { EasyEmailEditorPoc } from './features/email-templates/poc/EasyEmailEditorPoc';
import { LoginPage } from './pages/LoginPage';
import { SegmentBuilder } from './pages/SegmentBuilder';
import { SuppressionManager } from './pages/SuppressionManager';
import { ApiService } from './services/api';
import type { MetricCardData, QueueJob, ActivityLog, Template, Campaign, SuppressionItem, BounceReportItem } from './services/api';
import './App.css';



import { CustomEmailEditorPoc } from './features/email-templates/poc/CustomEmailEditorPoc';

gsap.registerPlugin(useGSAP);

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('adminToken'));

  if (window.location.pathname === '/dev/email-editor/custom') return <CustomEmailEditorPoc />;
  if (window.location.pathname === '/dev/email-editor/easy-email') return <EasyEmailEditorPoc />;
  
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <DashboardApp />;
};

const DashboardApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/dashboard/templates')) return 'templates';
    if (path.startsWith('/dashboard/project_logs')) return 'project_logs';
    if (path.startsWith('/dashboard/brand_library')) return 'brand_library';
    if (path.startsWith('/dashboard/campaigns')) return 'campaigns';
    if (path.startsWith('/dashboard/contacts')) return 'contacts';
    return 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia('(max-width: 840px)').matches);
  const [templateRoute, setTemplateRoute] = useState<{ page: 'manager' | 'gallery' | 'builder'; templateId?: string }>(() => {
    const match = window.location.pathname.match(/^\/dashboard\/templates\/([^/]+)\/edit$/);
    if (match) return { page: 'builder', templateId: match[1] };
    if (window.location.pathname === '/dashboard/templates/new') return { page: 'gallery' };
    return { page: 'manager' };
  });
  const mainRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (activeTab === 'templates') {
      setSidebarCollapsed(true);
    }
  }, [activeTab]);

  useEffect(() => {
    const readTemplateRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/dashboard/templates')) {
         setActiveTab('templates');
      } else if (path.startsWith('/dashboard/project_logs')) {
         setActiveTab('project_logs');
      } else if (path.startsWith('/dashboard/brand_library')) {
         setActiveTab('brand_library');
      } else if (path.startsWith('/dashboard/campaigns')) {
         setActiveTab('campaigns');
      } else if (path.startsWith('/dashboard/contacts')) {
         setActiveTab('contacts');
      } else {
         setActiveTab('dashboard');
      }

      const match = path.match(/^\/dashboard\/templates\/([^/]+)\/edit$/);
      if (match) return setTemplateRoute({ page: 'builder', templateId: match[1] });
      if (path === '/dashboard/templates/new') return setTemplateRoute({ page: 'gallery' });
      if (path.startsWith('/dashboard/templates')) return setTemplateRoute({ page: 'manager' });
    };
    window.addEventListener('popstate', readTemplateRoute);
    return () => window.removeEventListener('popstate', readTemplateRoute);
  }, []);

  // App Data State
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionItem[]>([]);
  const [bounceReports, setBounceReports] = useState<BounceReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, j, l, t, c, s, b] = await Promise.all([
        ApiService.getMetrics(),
        ApiService.getQueueJobs(),
        ApiService.getActivityLogs(),
        ApiService.getTemplates(),
        ApiService.getCampaigns(),
        ApiService.getSuppressions(),
        ApiService.getBounceReports(),
      ]);
      setMetrics(m);
      setJobs(j);
      setLogs(l);
      setTemplates(t || []);
      setCampaigns(c);
      setSuppressions(s);
      setBounceReports(b);
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useGSAP(() => {
    const root = mainRef.current;
    if (!root || shouldReduceMotion) return;

    const targets = root.querySelectorAll('.dashboard-command-hero, .screen-hero, .project-logs-hero, .dashboard-kpi-card');
    if (targets.length === 0) return;

    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        ease: 'power3.out',
        stagger: 0.035,
        overwrite: true,
      }
    );

    return () => gsap.killTweensOf(targets);
  }, { scope: mainRef, dependencies: [activeTab, loading, shouldReduceMotion], revertOnUpdate: true });

  useEffect(() => {
    const root = mainRef.current;
    if (!root || shouldReduceMotion) return;

    const items = root.querySelectorAll<HTMLElement>(
      '.dashboard-status-stack > div, .dashboard-health-list > div, .dashboard-job-row, tbody tr'
    );
    items.forEach((item) => item.classList.add('io-reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [activeTab, loading, shouldReduceMotion]);

  const navigateTemplateRoute = (route: { page: 'manager' | 'gallery' | 'builder'; templateId?: string }) => {
    setTemplateRoute(route);
    const path = route.page === 'gallery'
      ? '/dashboard/templates/new'
      : route.page === 'builder' && route.templateId
        ? `/dashboard/templates/${route.templateId}/edit`
        : '/dashboard/templates';
    window.history.pushState(null, '', path);
  };

  const handleLaunchCampaign = async (_name: string, _templateKey: string, _scheduledAt?: string) => {
    const freshCampaigns = await ApiService.getCampaigns();
    if (freshCampaigns) setCampaigns(freshCampaigns);
  };

  const handleAddSuppression = async (email: string, reason: SuppressionItem['reason']) => {
    try {
      const savedItem = await ApiService.addSuppression(email, reason);
      if (savedItem) {
        setSuppressions((prev) => [savedItem, ...prev.filter((item) => item.id !== savedItem.id)]);
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Unable to add suppression');
    }
  };

  const handleRemoveSuppression = async (id: string) => {
    try {
      const removed = await ApiService.removeSuppression(id);
      if (removed) {
        setSuppressions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Unable to remove suppression');
    }
  };

  const isBuilderMode = activeTab === 'templates' && templateRoute.page === 'builder';

  return (
    <div className={`app-shell${isBuilderMode ? ' app-shell--fullscreen' : ''}`}>
      {/* Collapsible Sidebar */}
      {!isBuilderMode && (
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'templates') {
              navigateTemplateRoute({ page: 'manager' });
            } else {
              const path = tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`;
              window.history.pushState(null, '', path);
            }
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Workspace Content */}
      <div className="app-workspace">

        {/* Dynamic Screen Viewport */}
        <main className="app-main" ref={mainRef}>
          {loading ? (
            <div className="app-loading">
              <div className="spin-loader" />
              <p>Synchronizing CPaaS data streams...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="app-page-motion"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
              {activeTab === 'dashboard' && (
                <DashboardQueueMonitor
                  metrics={metrics}
                  jobs={jobs}
                  logs={logs}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'project_logs' && (
                <ProjectLogsViewer />
              )}
              {activeTab === 'templates' && (
                templateRoute.page === 'builder' && templateRoute.templateId ? (
                  <TemplateBuilderPage
                    templateId={templateRoute.templateId}
                    onBack={() => navigateTemplateRoute({ page: 'manager' })}
                    onSavedExit={() => navigateTemplateRoute({ page: 'manager' })}
                  />
                ) : templateRoute.page === 'gallery' ? (
                  <TemplateGalleryPage
                    onBack={() => navigateTemplateRoute({ page: 'manager' })}
                    onOpenBuilder={(templateId) => navigateTemplateRoute({ page: 'builder', templateId })}
                  />
                ) : (
                  <TemplateManagerPage
                    onCreate={() => navigateTemplateRoute({ page: 'gallery' })}
                    onEdit={(templateId) => navigateTemplateRoute({ page: 'builder', templateId })}
                  />
                )
              )}
              {activeTab === 'brand_library' && (
                <BrandLibraryPage />
              )}
              {activeTab === 'campaigns' && (
                <SegmentBuilder
                  campaigns={campaigns}
                  templates={templates}
                  onLaunchCampaign={handleLaunchCampaign}
                />
              )}
              {activeTab === 'contacts' && (
                <SuppressionManager
                  suppressions={suppressions}
                  bounceReports={bounceReports}
                  onAddSuppression={handleAddSuppression}
                  onRemoveSuppression={handleRemoveSuppression}
                />
              )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
