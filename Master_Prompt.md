You are a senior SaaS product architect, React engineer, UX designer, and email infrastructure specialist.

We need to redesign and rebuild the Email Template Management flow inside the existing SupermailBox/GetAIPilot application.

IMPORTANT:
Do not immediately start writing code.

First inspect the complete existing repository, routes, database integrations, authentication system, UI components, design tokens, existing email templates, campaign flow, API clients, Supabase tables, Cloudinary upload implementation, and any current email editor implementation.

Do not build a duplicate system.

Reuse stable existing components and services where appropriate, but remove or replace the current template creation flow if it conflicts with the architecture defined below.

==================================================
PRIMARY PRODUCT GOAL
==================================================

Replace the current fragmented email-template flow with a clean three-stage workflow:

1. Template Manager
2. Template Gallery
3. Email Template Builder

Expected user journey:

Sidebar
→ Template Manager
→ Click “Create Template”
→ Template Gallery
→ Select a premade template or blank template
→ Email Builder
→ Customize
→ Save
→ Return to Template Manager

The experience should feel like a premium SaaS product inspired by modern tools such as Canva, Stripo, BeeFree, Linear, Notion, and Apple-style productivity interfaces.

Do not copy any competitor UI exactly.

Use the attached screenshots only as structural inspiration for:
- Template gallery layout
- Filters
- Search
- Template cards
- Hover preview
- Premium badges
- Category chips

The final UI must remain consistent with the existing application’s design system.

==================================================
RECOMMENDED EDITOR ARCHITECTURE
==================================================

Use:

- React
- TypeScript
- Existing application framework and router
- GrapesJS as the visual builder framework
- grapesjs-mjml for email-compatible components
- MJML for responsive email structure
- Supabase for template persistence
- Cloudinary for user-uploaded images
- Zod for schema validation
- Existing authentication and workspace system
- Existing toast, modal, dropdown, button, input and dialog components

Do not use a generic web-page HTML editor configuration.

The editor must operate specifically in email mode using MJML-compatible components.

Do not store only the generated HTML.

Persist all of the following:

1. Editor project JSON
2. MJML source
3. Compiled HTML
4. Plain-text fallback
5. Template metadata
6. Thumbnail or preview image URL
7. Template version number

Generated HTML is an export artifact.

The editable project JSON and MJML source are the source of truth.

==================================================
ROUTES
==================================================

Use the existing route conventions after inspecting the repository.

Conceptually, implement these routes:

/dashboard/templates
Template Manager page

/dashboard/templates/new
Template Gallery page

/dashboard/templates/:templateId/edit
Email Builder page

/dashboard/templates/:templateId/preview
Optional full-screen preview page

Do not break old template URLs without providing redirects or backward compatibility.

==================================================
STAGE 1: TEMPLATE MANAGER
==================================================

Create a premium Template Manager page.

Page header:

Title:
Email Templates

Description:
Create, manage and reuse professionally designed email templates.

Primary action:
+ Create Template

Secondary actions where useful:
- Import HTML
- Create Folder
- Refresh

Template Manager should include:

1. Search
2. Status filter
3. Category filter
4. Folder filter
5. Sort dropdown
6. Grid/list view toggle
7. Template count
8. Selection mode
9. Bulk actions
10. Pagination or cursor-based loading

Tabs:

- All Templates
- My Templates
- Shared
- Drafts
- Archived

Each template card should display:

- Generated thumbnail
- Template name
- Subject line
- Category
- Last updated timestamp
- Creator
- Draft/published status
- Desktop/mobile indicator
- Usage count if available
- Folder
- Shared/private indicator

Card actions:

- Edit
- Preview
- Duplicate
- Rename
- Move to folder
- Export HTML
- Export MJML
- Archive
- Delete

Deleting must use a confirmation dialog.

Prefer soft deletion over permanent deletion.

Empty state:

Headline:
Create your first email template

Supporting text:
Start from a professionally designed template or create one from scratch.

CTA:
Browse Templates

Manager loading state:
Use skeleton cards.

Error state:
Show a clear retry action.

==================================================
STAGE 2: TEMPLATE GALLERY
==================================================

When the user clicks “Create Template”, navigate to the Template Gallery.

Do not open the editor immediately.

The gallery should have a premium hero section:

Heading:
Choose a starting point

Description:
Start from a professionally designed email template or build your own from scratch.

Place search prominently.

Gallery filters:

- Free
- Premium
- Type
- Industry
- Occasion
- Feature
- Integration
- Language

Possible email types:

- Newsletter
- Promotional
- Welcome
- Onboarding
- Transactional
- Abandoned Cart
- Product Update
- Event Invitation
- Announcement
- Re-engagement
- Feedback
- Birthday
- Holiday
- Lead Nurturing
- Payment
- Verification

Possible industries:

- SaaS
- E-commerce
- Education
- Finance
- Healthcare
- Travel
- Real Estate
- Agency
- Creator
- Restaurant
- Retail
- Technology

Required first gallery card:

Blank Template

The blank template card should be visually distinct and always appear first unless filtered out intentionally.

Template card requirements:

- Accurate email preview
- Fixed thumbnail aspect ratio
- Name
- Category
- Free/premium badge
- Featured badge when relevant
- Mobile responsive badge
- Hover overlay
- “Use Template” button
- “Preview” button
- Favourite button
- Template creator attribution if relevant

Clicking the card itself should open a template detail or preview modal.

Clicking “Use Template” should:

1. Create a new user-owned template record.
2. Clone the selected template’s source data.
3. Assign a unique template ID.
4. Mark it as draft.
5. Navigate to the builder route.
6. Never edit the original system template.

Preview modal:

- Desktop preview
- Mobile preview
- Template information
- Supported use cases
- Use Template CTA
- Close action
- Keyboard accessible
- Escape key should close it

Premium templates:

The data model should support premium templates even if billing enforcement is not implemented yet.

If the user cannot access a premium template, show a clear locked state and upgrade action rather than failing silently.

Search and filtering should be URL driven where practical so that filters survive refresh and browser navigation.

Example:

/dashboard/templates/new?category=newsletter&industry=saas&pricing=free

==================================================
STAGE 3: EMAIL TEMPLATE BUILDER
==================================================

Build a dedicated full-screen email editor.

Suggested layout:

Top toolbar
Left block panel
Central email canvas
Right settings panel
Optional bottom status bar

--------------------------------------------------
TOP TOOLBAR
--------------------------------------------------

Include:

- Back button
- Editable template name
- Save status:
  - Saving...
  - Saved
  - Unsaved changes
  - Save failed
- Undo
- Redo
- Desktop preview
- Mobile preview
- Preview
- Send Test
- Save
- Save and Exit
- More actions menu

More actions:

- Duplicate
- Export HTML
- Export MJML
- View version history
- Reset template
- Archive

Do not show excessive controls simultaneously.

Use tooltips for icon-only actions.

--------------------------------------------------
LEFT SIDEBAR
--------------------------------------------------

Organize editor blocks into collapsible groups:

Basic:
- Text
- Heading
- Image
- Button
- Divider
- Spacer
- Social Links

Layout:
- One Column
- Two Columns
- Three Columns
- Sidebar Layout
- Full Width Section

Marketing:
- Hero
- Product Card
- Coupon
- Feature Grid
- Testimonial
- Pricing Block
- Countdown placeholder
- Call To Action
- Blog Article
- Event Details

Commerce:
- Product Row
- Product Grid
- Cart Summary
- Order Summary
- Discount Block
- Recommended Products

Utility:
- Header
- Footer
- Logo
- Navigation
- Unsubscribe
- Preferences Link
- View in Browser
- Address/Compliance Block

Saved Blocks:
- User-created reusable blocks
- Workspace-shared blocks

Allow users to save selected sections as reusable blocks.

--------------------------------------------------
CENTRAL CANVAS
--------------------------------------------------

Requirements:

- Email-width canvas
- Default width approximately 600px
- Visible canvas boundary
- Desktop/mobile mode
- Drag-and-drop insertion indicators
- Selected component outline
- Section move handles
- Duplicate section action
- Delete section action
- Empty canvas guidance
- Smooth but subtle transitions
- No distracting animations

The canvas background should be visually separated from the email body.

Do not allow unsupported freeform positioning.

Emails must remain based on sections, columns and blocks so that exported output stays reliable across email clients.

--------------------------------------------------
RIGHT SETTINGS PANEL
--------------------------------------------------

Show contextual properties for the selected item.

Categories:

Content:
- Text
- Image URL
- Alt text
- Link
- Button label
- Social links

Typography:
- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Alignment
- Text colour

Spacing:
- Padding
- Margin where email-safe
- Section spacing

Appearance:
- Background colour
- Border
- Border radius where supported
- Button style
- Image alignment
- Image width

Responsive:
- Hide on desktop
- Hide on mobile
- Mobile alignment
- Stack columns on mobile

Advanced:
- Element ID
- Custom class where supported
- Personalization variables
- Conditional block metadata
- Tracking metadata

Use controlled inputs and validate all settings.

Do not expose unsafe arbitrary JavaScript.

Sanitize any imported HTML and user-entered URLs.

==================================================
DOCUMENT SETTINGS
==================================================

When no component is selected, show document-level settings:

- Email background
- Content background
- Content width
- Default font
- Default text colour
- Link colour
- Preheader text
- Subject line
- Sender name placeholder
- Language
- Text direction
- Global spacing
- Mobile breakpoint where supported

Include standard merge tags:

{{first_name}}
{{last_name}}
{{full_name}}
{{email}}
{{company_name}}
{{unsubscribe_url}}
{{preferences_url}}
{{current_year}}

Merge tags must be inserted as structured tokens, not silently converted into fixed text.

The architecture must allow custom workspace merge tags later.

==================================================
AUTOSAVE
==================================================

Implement reliable debounced autosave.

Requirements:

- Save approximately 1.5 to 2.5 seconds after the last meaningful change.
- Avoid saving on every keystroke.
- Prevent stale requests from overwriting newer content.
- Use revision numbers or optimistic concurrency control.
- Display current save state.
- Retry temporary failures with bounded exponential backoff.
- Warn before navigation when unsaved changes remain.
- Flush pending changes before “Save and Exit”.
- Do not show a success toast after every autosave.
- Show an error message only when autosave genuinely fails.

Store a local recovery snapshot so that accidental refresh does not immediately destroy unsaved work.

Clear the recovery snapshot after a confirmed server save.

==================================================
VERSION HISTORY
==================================================

Create template version records for:

- Manual save checkpoints
- Save and Exit
- Restore operation
- Optional scheduled snapshots after meaningful edits

Version history UI should show:

- Version number
- Timestamp
- User
- Save reason
- Preview
- Restore

Restoring an older version must create a new version.

It must not delete newer version history.

==================================================
TEST EMAIL
==================================================

Implement a “Send Test” dialog.

Fields:

- Recipient email
- Optional sample merge-tag data
- Subject
- Preheader

Before sending:

1. Validate the email address.
2. Compile MJML on the server.
3. Sanitize output.
4. Inject test merge-tag data.
5. Add a visible test-email marker when appropriate.
6. Send through the existing email delivery abstraction.

Do not directly couple the builder UI to ZeptoMail or SES.

Use a provider-independent EmailDeliveryService abstraction.

Apply rate limiting to test sends.

==================================================
IMPORT AND EXPORT
==================================================

Import support:

- HTML upload
- Paste HTML
- MJML upload
- Paste MJML

HTML import limitations must be explained.

Do not promise that arbitrary HTML can always be converted into fully editable builder blocks.

For imported HTML, support one of these explicit modes:

1. Editable converted layout where safely possible.
2. Raw HTML block mode.
3. Read-only imported template mode.

Export support:

- Compiled HTML
- MJML
- Plain text
- Project JSON where appropriate

==================================================
DATABASE DESIGN
==================================================

Inspect the existing Supabase schema before creating migrations.

Do not create duplicate tables if compatible tables already exist.

Recommended conceptual tables:

email_templates
- id UUID primary key
- workspace_id UUID
- owner_id UUID
- folder_id UUID nullable
- source_template_id UUID nullable
- name text
- description text nullable
- subject text nullable
- preheader text nullable
- category text nullable
- industry text nullable
- language text default 'en'
- status text
- visibility text
- editor_type text
- project_json jsonb
- mjml_content text
- compiled_html text
- plain_text text
- thumbnail_url text nullable
- version_number integer
- is_system_template boolean default false
- is_premium boolean default false
- is_archived boolean default false
- last_used_at timestamptz nullable
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz nullable

email_template_versions
- id UUID primary key
- template_id UUID
- workspace_id UUID
- version_number integer
- project_json jsonb
- mjml_content text
- compiled_html text
- plain_text text
- created_by UUID
- save_reason text
- created_at timestamptz

email_template_folders
- id UUID primary key
- workspace_id UUID
- name text
- parent_id UUID nullable
- created_by UUID
- created_at timestamptz

email_saved_blocks
- id UUID primary key
- workspace_id UUID
- owner_id UUID
- name text
- category text nullable
- block_json jsonb
- mjml_content text
- thumbnail_url text nullable
- visibility text
- created_at timestamptz
- updated_at timestamptz

email_template_favourites
- user_id UUID
- template_id UUID
- created_at timestamptz

template_categories
Optional if categories need admin management.

Use proper foreign keys and indexes.

Important indexes:

- workspace_id
- owner_id
- status
- category
- industry
- updated_at
- deleted_at
- lower(name)
- source_template_id

Use Row Level Security.

Users must not access templates belonging to unauthorized workspaces.

System gallery templates can be readable by authenticated users but cannot be modified by normal users.

==================================================
API/SERVICE LAYER
==================================================

Do not place Supabase queries throughout UI components.

Create a dedicated template service or repository layer.

Expected operations:

- listTemplates
- getTemplate
- createBlankTemplate
- cloneSystemTemplate
- updateTemplate
- autosaveTemplate
- duplicateTemplate
- archiveTemplate
- restoreTemplate
- softDeleteTemplate
- listTemplateVersions
- createTemplateVersion
- restoreTemplateVersion
- listGalleryTemplates
- favouriteTemplate
- unfavouriteTemplate
- compileTemplate
- generateTemplateThumbnail
- sendTestTemplate
- createSavedBlock
- listSavedBlocks

Use typed request and response models.

Validate server-side inputs with Zod or the project’s existing validation library.

Use meaningful domain errors.

==================================================
TEMPLATE DATA MODEL
==================================================

Create a versioned template-document schema.

Example concept:

{
  "schemaVersion": 1,
  "editor": "grapesjs-mjml",
  "project": {},
  "metadata": {
    "subject": "",
    "preheader": "",
    "language": "en",
    "direction": "ltr"
  },
  "mergeTags": [],
  "assets": [],
  "settings": {}
}

Do not assume the editor’s internal JSON structure will never change.

Provide schemaVersion and migration utilities.

==================================================
PREMADE TEMPLATE SEEDING
==================================================

Create an initial professionally designed seed library.

Do not generate 1,650 low-quality templates.

Begin with approximately 20–30 high-quality templates across important categories.

Suggested initial templates:

1. Blank Template
2. SaaS Welcome
3. Account Verification
4. Password Reset
5. Product Launch
6. Weekly Newsletter
7. Monthly Newsletter
8. E-commerce Promotion
9. Abandoned Cart
10. Order Confirmation
11. Payment Confirmation
12. Event Invitation
13. Webinar Reminder
14. Customer Feedback
15. Re-engagement
16. Birthday Offer
17. Product Update
18. Agency Proposal Follow-up
19. Lead Nurturing
20. Creator Newsletter
21. Travel Promotion
22. Education Course Launch
23. Real Estate Listing
24. Festival Promotion

Every seed template must:

- Use MJML
- Be responsive
- Include alt text
- Include editable content
- Include a compliant footer
- Include unsubscribe placeholder where required
- Avoid inaccessible colour contrast
- Have realistic content
- Have a thumbnail
- Include category and industry metadata

Do not use copyrighted competitor templates.

==================================================
DESIGN SYSTEM
==================================================

Use the application’s existing design tokens.

Visual direction:

- Premium
- Spacious
- Clean
- High information clarity
- Soft neutral surfaces
- Subtle borders
- Controlled shadows
- Consistent radius
- Strong typography hierarchy
- Minimal gradients
- No random colours
- No excessive glassmorphism
- No oversized empty spaces
- No generic AI-generated dashboard appearance

The page must work well on:

- Large desktop
- Laptop
- Tablet
- Small screens

The full email builder may provide a tablet/mobile fallback message if drag-and-drop editing is unsuitable on very small screens, but preview and simple text edits should remain available where practical.

==================================================
ACCESSIBILITY
==================================================

Meet strong accessibility standards.

Include:

- Keyboard navigation
- Visible focus styles
- Semantic labels
- Accessible dialogs
- Escape-to-close
- ARIA descriptions where needed
- Proper colour contrast
- Non-colour status indicators
- Accessible form errors

All images inside email templates must support alt text.

==================================================
PERFORMANCE
==================================================

Requirements:

- Lazy-load the GrapesJS editor.
- Do not include the full editor bundle on the Template Manager page.
- Lazy-load gallery thumbnails.
- Use optimized images.
- Paginate gallery results.
- Debounce search.
- Avoid re-rendering the entire editor on each property change.
- Cache gallery metadata.
- Virtualize large lists only if necessary.
- Prevent duplicate API requests.
- Use AbortController for obsolete search/filter requests.
- Keep editor initialization deterministic.

==================================================
EMAIL SAFETY AND COMPATIBILITY
==================================================

Do not treat email HTML like normal web HTML.

Requirements:

- Compile MJML server-side before production send.
- Inline styles where required.
- Remove scripts.
- Reject unsafe URLs.
- Sanitize imported markup.
- Do not rely on unsupported CSS.
- Do not rely only on web fonts.
- Provide fallback fonts.
- Do not use CSS Grid for critical layouts.
- Do not use JavaScript in emails.
- Include plain-text fallback.
- Preserve unsubscribe placeholders.
- Include physical-address/company compliance placeholders where required.
- Validate maximum email size.
- Warn about excessively large images.
- Warn about missing alt text.
- Warn about missing unsubscribe link for marketing templates.

==================================================
QUALITY CHECK PANEL
==================================================

Add a pre-send checklist accessible from the builder:

- Subject present
- Preheader present
- Unsubscribe link present
- Missing image alt text
- Broken or empty links
- Oversized images
- Empty buttons
- Unsupported content
- Missing plain-text fallback
- Missing company address
- Email size warning
- Merge tags without fallback values

Show:

- Errors
- Warnings
- Passed checks

Do not block saving because of quality warnings.

Only block sending when a critical requirement is missing.

==================================================
STATE MANAGEMENT
==================================================

Use the existing project state solution if suitable.

Do not add Redux or another global state library without justification.

Separate:

- Server state
- Editor document state
- UI panel state
- Autosave state
- Preview state

Do not store the complete editor project globally if it creates unnecessary application-wide rerenders.

==================================================
IMPLEMENTATION PROCESS
==================================================

Work in the following phases.

PHASE 1: Audit

Inspect and document:

- Current template-related routes
- Existing components
- Existing database tables
- Existing campaign-template relationship
- Existing sending service
- Existing Cloudinary integration
- Existing workspace permissions
- Existing editor or HTML storage
- Code that can be reused
- Code that should be deprecated

Before coding, provide:

1. Current-state summary
2. Gap analysis
3. Files to modify
4. Files to create
5. Database changes
6. Migration risks
7. Backward-compatibility risks
8. Recommended implementation order

PHASE 2: Architecture

Create:

- Type definitions
- Zod schemas
- Service layer
- Database migrations
- RLS policies
- Route structure
- Editor adapter interface

Create an editor adapter such as:

interface EmailEditorAdapter {
  load(document: EmailTemplateDocument): Promise<void>;
  exportProject(): Promise<unknown>;
  exportMjml(): Promise<string>;
  exportHtml(): Promise<string>;
  setDevice(device: 'desktop' | 'mobile'): void;
  undo(): void;
  redo(): void;
  destroy(): void;
}

This prevents the entire application from being permanently coupled to one editor implementation.

PHASE 3: Template Manager

Build the manager page and connect real data.

PHASE 4: Template Gallery

Build system template seeding, gallery, filters, previews and cloning.

PHASE 5: Builder

Integrate GrapesJS and MJML behind the adapter.

PHASE 6: Saving and Versions

Implement autosave, manual save, conflict protection, local recovery and version history.

PHASE 7: Test Send and Export

Implement server-side compilation, quality checks, test send and export.

PHASE 8: Migration

Migrate compatible existing templates.

Preserve old data.

Do not delete old tables or fields until the migration is verified.

PHASE 9: Testing

Add tests for:

- Template listing
- Template cloning
- Workspace permissions
- Autosave
- Save conflicts
- Version restoration
- HTML compilation
- Invalid MJML
- Sanitization
- Premium locking
- Filter persistence
- Unsaved-change warning
- Test-send rate limiting

==================================================
ACCEPTANCE CRITERIA
==================================================

The work is complete only when:

1. User can open Template Manager from the sidebar.
2. User can click Create Template.
3. User sees a searchable/filterable gallery.
4. Blank Template appears as the first gallery option.
5. User can preview a premade template.
6. User can select a template.
7. A user-owned copy is created.
8. The builder opens with the selected design.
9. User can drag, edit, reorder, duplicate and delete blocks.
10. User can switch between desktop and mobile previews.
11. Autosave works without excessive requests.
12. Refresh can recover recently unsaved content.
13. User can manually save and exit.
14. Templates appear in Template Manager.
15. User can duplicate, archive and soft-delete templates.
16. HTML is generated from validated MJML.
17. Test email can be sent through the existing provider abstraction.
18. Workspace permissions are enforced.
19. Existing campaigns do not break.
20. Existing templates remain accessible.
21. Editor resources are cleaned up when leaving the page.
22. No console errors occur.
23. No fake buttons or placeholder interactions remain.
24. Loading, empty and error states are implemented.
25. The UI matches the application’s design system.
26. The implementation passes type checking, linting and tests.

==================================================
CODE QUALITY RULES
==================================================

- Use strict TypeScript.
- Avoid any unless unavoidable and documented.
- Keep components focused.
- Extract complex editor integration into hooks and services.
- Do not put all builder code into one giant component.
- Do not hardcode workspace or user IDs.
- Do not expose service keys in frontend code.
- Do not compile untrusted MJML only in the browser for production sends.
- Do not silently swallow errors.
- Do not leave TODO-only features visible to users.
- Do not use mock data after real integration is ready.
- Do not rewrite unrelated parts of the application.
- Maintain existing authentication and navigation behavior.

==================================================
EXPECTED OUTPUT FROM YOU
==================================================

Begin by auditing the repository.

Your first response must contain:

1. Existing implementation findings
2. Proposed final architecture
3. Library compatibility review
4. Exact file-by-file implementation plan
5. Database migration plan
6. Routes and component hierarchy
7. Risks and mitigations
8. Phased checklist

Wait for architecture approval before performing destructive migrations or deleting the old flow.

After approval, implement the phases sequentially and report after every phase:

- Files changed
- Database changes
- Tests added
- Tests passed
- Remaining issues
- Next phase


src/
├── features/
│   └── email-templates/
│       ├── components/
│       │   ├── TemplateCard.tsx
│       │   ├── TemplateFilters.tsx
│       │   ├── TemplatePreviewDialog.tsx
│       │   ├── TemplateManagerToolbar.tsx
│       │   ├── TemplateQualityPanel.tsx
│       │   └── TemplateVersionDialog.tsx
│       │
│       ├── builder/
│       │   ├── EmailBuilder.tsx
│       │   ├── BuilderToolbar.tsx
│       │   ├── BuilderCanvas.tsx
│       │   ├── BuilderBlocksPanel.tsx
│       │   ├── BuilderSettingsPanel.tsx
│       │   ├── adapters/
│       │   │   ├── EmailEditorAdapter.ts
│       │   │   └── GrapesJSMjmlAdapter.ts
│       │   └── hooks/
│       │       ├── useEmailEditor.ts
│       │       ├── useTemplateAutosave.ts
│       │       └── useUnsavedChanges.ts
│       │
│       ├── pages/
│       │   ├── TemplateManagerPage.tsx
│       │   ├── TemplateGalleryPage.tsx
│       │   └── TemplateBuilderPage.tsx
│       │
│       ├── services/
│       │   ├── template.service.ts
│       │   ├── templateCompiler.service.ts
│       │   ├── templateVersion.service.ts
│       │   └── templateThumbnail.service.ts
│       │
│       ├── schemas/
│       │   └── template.schema.ts
│       │
│       └── types/
│           └── template.types.ts