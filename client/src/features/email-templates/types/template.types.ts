export type TemplateStatus = 'draft' | 'published' | 'archived';
export type TemplateVisibility = 'private' | 'shared' | 'system';
export type SaveState = 'idle' | 'saving' | 'saved' | 'dirty' | 'failed';
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type EmailTemplateDocument = {
  schemaVersion: 1;
  editor: 'grapesjs-mjml';
  project: unknown;
  metadata: {
    subject: string;
    preheader: string;
    language: string;
    direction: 'ltr' | 'rtl';
  };
  mergeTags: string[];
  assets: { url: string; alt?: string }[];
  settings: Record<string, unknown>;
};

export type EmailTemplate = {
  id: string;
  key: string;
  name: string;
  description?: string;
  subject?: string;
  preheader?: string;
  category?: string;
  industry?: string;
  language?: string;
  status: TemplateStatus;
  visibility: TemplateVisibility;
  editorType: string;
  projectJson?: unknown;
  mjmlContent?: string;
  compiledHtml?: string;
  plainText?: string;
  thumbnailUrl?: string | null;
  versionNumber: number;
  isSystemTemplate: boolean;
  isArchived: boolean;
  updatedAt?: string;
  createdAt?: string;
};

export type GalleryTemplate = {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  preheader: string;
  category: string;
  industry: string;
  mjmlContent: string;
  compiledHtml?: string;
  isSystemTemplate: boolean;
  featured?: boolean;
  responsive?: boolean;
  creator?: string;
};

export type TemplateVersion = {
  id: string;
  template_id: string;
  version_number: number;
  subject: string;
  html_source: string;
  mjml_source?: string;
  status: string;
  created_by?: string;
  created_at: string;
  save_reason?: string;
};

export type QualityIssue = {
  code: string;
  level: 'error' | 'warning' | 'pass';
  message: string;
};

export type CategoryTemplateItem = EmailTemplate & {
  isDefault: boolean;
};

export type CategoryGroupItem = {
  id: string;
  name: string;
  app: 'getaipilot' | 'campaign' | 'gap_whatsapp' | 'socialpilot' | 'general';
  appName: string;
  description: string;
  eventTrigger: string;
  defaultKey: string;
  supportsDefault?: boolean;
  activeDefaultTemplateId: string | null;
  activeDefaultTemplateKey: string;
  activeDefaultTemplateName: string;
  variantsCount: number;
  templates: CategoryTemplateItem[];
};

export type CategoryAppSummary = {
  id: string;
  name: string;
  count: number;
};

export type CategorySummary = {
  totalCategories: number;
  totalVariants: number;
  totalLibraryTemplates: number;
  totalDefaultCategories: number;
  activeDefaultsAssigned: number;
  apps: CategoryAppSummary[];
};

export type CategoryDefaultsResponse = {
  categories: CategoryGroupItem[];
  summary: CategorySummary;
};

