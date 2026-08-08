export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'html'
  | 'social'
  | 'video'
  | 'menu'
  | 'product_card'
  | 'product_grid'
  | 'countdown'
  | 'qr_code'
  | 'quote'
  | 'table'
  | 'badge'
  | 'alert'
  | 'coupon'
  | 'signature';

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  style: Record<string, any>;
  tabletStyle?: Record<string, any>;
  mobileStyle?: Record<string, any>;
  visibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface EmailColumn {
  id: string;
  width: number; // percentage width e.g., 50 for 50%
  settings: {
    backgroundColor?: string;
    padding?: string;
    border?: string;
    borderRadius?: string;
    verticalAlign?: 'top' | 'middle' | 'bottom';
    [key: string]: any;
  };
  blocks: EmailBlock[];
}

export interface EmailRow {
  id: string;
  name?: string;
  settings: {
    backgroundColor?: string;
    contentBackgroundColor?: string;
    padding?: string;
    margin?: string;
    border?: string;
    borderRadius?: string;
    gap?: string;
    stackOnMobile?: boolean;
    reverseStackOnMobile?: boolean;
    hideOnDesktop?: boolean;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
    [key: string]: any;
  };
  columns: EmailColumn[];
}

export interface EmailDocumentMetadata {
  subject: string;
  preheader: string;
  language: string;
  direction: 'ltr' | 'rtl';
}

export interface EmailBodySettings {
  backgroundColor: string;
  contentBackgroundColor: string;
  contentWidth: number; // e.g. 600
  defaultFontFamily: string;
  defaultFontSize: string;
  textColor: string;
  linkColor: string;
  globalPadding: string;
  mobileBreakpoint: number;
}

export interface DesignTokens {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  brandLogo?: string;
}

export interface EmailDocument {
  schemaVersion: 2;
  metadata: EmailDocumentMetadata;
  bodySettings: EmailBodySettings;
  designTokens?: DesignTokens;
  rows: EmailRow[];
}

export interface SelectionState {
  rowId: string | null;
  columnId: string | null;
  blockId: string | null;
}

export interface DragState {
  isDragging: boolean;
  activeId: string | null;
  activeType: 'sidebar-block' | 'canvas-block' | 'canvas-row' | null;
  draggedBlockType?: BlockType | null;
  sourceColumnId?: string | null;
  sourceRowId?: string | null;
}

export type RowLayoutPreset =
  | '1-col'
  | '2-col-equal'
  | '3-col-equal'
  | '4-col-equal'
  | '1-3_2-3'
  | '2-3_1-3'
  | '1-4_3-4'
  | '3-4_1-4'
  | '1-4_1-2_1-4';
