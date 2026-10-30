---
name: SupermailBox Operations
description: A calm, action-first control desk for repeated sales, support, and mail operations.
colors:
  mineral-ground: "#F5F1EC"
  working-surface: "#FFFFFF"
  graphite-ink: "#1C1E21"
  text-primary: "#0A1317"
  text-secondary: "#4B4C4F"
  text-muted: "#5D6C7B"
  hairline: "#DEE3E9"
  hairline-strong: "#CED0D4"
  sage: "#769181"
  sage-deep: "#5A7163"
  sage-soft: "#DFE9E3"
  success: "#31A24C"
  warning: "#F7B928"
  danger: "#E41E3F"
typography:
  display:
    fontFamily: "Geist, Optimistic VF, Montserrat, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.35rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist, Optimistic VF, Montserrat, Helvetica, Arial, sans-serif"
    fontSize: "1.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.028em"
  title:
    fontFamily: "Geist, Optimistic VF, Montserrat, Helvetica, Arial, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, Optimistic VF, Montserrat, Helvetica, Arial, sans-serif"
    fontSize: "0.79rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, Optimistic VF, Montserrat, Helvetica, Arial, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "4px"
  md: "6px"
  control: "8px"
  panel: "12px"
  workspace: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "18px"
  xxl: "24px"
  page: "30px"
components:
  button-primary:
    backgroundColor: "{colors.sage-deep}"
    textColor: "{colors.working-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  input:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
    height: "40px"
  work-panel:
    backgroundColor: "{colors.working-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: "18px"
---

# Design System: SupermailBox Operations

## Overview

**Creative North Star: "The Calm Control Desk"**

SupermailBox is an Operate-mode product surface: disciplined, compact, and calm under operational pressure. Its warm mineral ground and white working planes keep dense records approachable, while graphite text and restrained sage states make the current action obvious without marketing-style spectacle.

The interface behaves like a well-run desk rather than a passive report. Action queues lead; metrics and funnels support decisions. Plain-language labels, contact facts, recommended next steps, and progress checklists reduce interpretation work. Decoration is subordinate to scanability, recoverability, and accessible repeated use.

**Key Characteristics:**

- Warm mineral canvas with crisp white work surfaces.
- Sage is the single interaction accent; semantic colors communicate real state.
- Dense ledgers, tables, and hairline divisions preserve information without visual noise.
- Actions stay close to the person, record, or state they affect.
- Lucide-style line icons and tabular numerals provide a consistent operational vocabulary.

## Colors

The palette combines warm neutral materials with a quiet botanical accent and sparing semantic signals.

### Primary

- **Control Sage** (`sage`, `sage-deep`, `sage-soft`): active navigation, primary actions, focus-adjacent emphasis, avatars, and selected states.

### Secondary

- **Operational Signals** (`success`, `warning`, `danger`): reserved for confirmed success, attention, overdue, destructive, or urgent meaning—not decoration.

### Neutral

- **Warm Mineral Ground** (`mineral-ground`): the persistent application canvas.
- **Working White** (`working-surface`): panels, fields, records, and task surfaces.
- **Graphite Family** (`graphite-ink`, `text-primary`, `text-secondary`, `text-muted`): a stepped hierarchy for decisions, supporting copy, and metadata.
- **Hairline Family** (`hairline`, `hairline-strong`): divisions, field boundaries, and compact grouping.

**The One Accent Rule.** Sage carries interaction and selection; do not introduce another decorative accent.

**The Semantic Honesty Rule.** Green, amber, and red appear only when the underlying state earns that meaning.

## Typography

**Display Font:** Geist with Optimistic VF, Montserrat, Helvetica, and Arial fallbacks  
**Body Font:** Geist with the same system-safe fallbacks  
**Label/Mono Font:** UI monospace is reserved for identifiers and technical evidence.

**Character:** Neutral sans typography keeps operational content direct. Weight, size, spacing, and tabular numerals—not ornamental type—create hierarchy.

### Hierarchy

- **Display:** used only for the workspace chooser's decisive entry heading.
- **Headline:** compact page titles and command-strip orientation.
- **Title:** panel and section headings; concise and sentence case.
- **Body:** instructions, record detail, and form content; keep explanatory lines near 48–64 characters where practical.
- **Label:** status, metadata, navigation, and field labels. Keep product-facing language in natural sentence case; do not force all-caps.

**The Plain Language Rule.** Prefer “User status,” “Sales stage,” and “Recommended next step” over internal system terminology or abbreviations.

## Layout

Desktop uses a narrow persistent rail with a flexible work canvas. The Today view presents a five-cell metric ledger, then an action-first two-column field where the signal queue is dominant and the funnel is supporting evidence. Panels use compact 12–18px internal spacing, 14px inter-panel gaps, and hairline separation.

At 1100px the rail compresses and multi-column work stacks. At 700px, navigation becomes a fixed five-item bottom bar, tables become labeled record cards, command actions form a two-column control group, and wide pipeline structures remain horizontally discoverable. Customer detail becomes a full-width drawer. Mobile drawer actions use at least 44px targets, account for safe-area insets, and preserve readable labels.

The customer record is a shared 720px contextual drawer with three stable tabs: Overview, Sales work, and History. Overview leads with identity, interest, a recommended next step, contact details, customer progress, and account facts; work contains mutations; history preserves evidence.

**The Queue Before Report Rule.** The first working viewport must answer “what needs action now?” before it explains aggregate performance.

## Elevation & Depth

The system is flat by default. Borders, warm-to-white tonal layering, sticky headers, and adjacency create most depth. Shadows are reserved for transient or elevated contexts: the workspace chooser, floating feedback, draggable pipeline cards, and the record drawer. The drawer uses a directional left shadow to communicate that it sits above, but remains connected to, the current queue.

**The Flat-by-Default Rule.** Do not add ambient card shadows to ordinary panels; use a hairline border and material contrast first.

## Shapes

Controls use gently curved 7–8px corners; work panels and record sections use 12px corners; the workspace entry panel may use 16px. Status chips stay compact with 6px corners rather than pills, reflecting the system's ledger-like character. Hairline borders define most silhouettes. Avatars and icon tiles reuse the same softly squared geometry.

## Components

### Buttons

- **Primary:** deep sage, white text, compact strong label, 8px corner, and 38px desktop height.
- **Secondary:** white surface with strong hairline border; sage-soft hover treatment.
- **Mobile:** customer-drawer actions expand to at least 44px high.
- **Focus / state:** visible sage focus outline; active controls compress subtly; disabled controls reduce opacity without hiding their label.

### Chips

- **Style:** compact bordered rectangles with sentence-case labels.
- **State:** neutral is quiet gray; success, warning, danger, informational blue, and workflow violet remain distinct and meaning-driven.

### Cards / Containers

- **Work panels:** white surface, 12px corner, hairline border, no resting shadow.
- **Metric ledger:** one bordered container divided into equal cells; tabular numerals carry emphasis.
- **Recommended next step:** sage-tinted inset with a direct action, visually stronger than ordinary facts but quieter than an alert.

### Inputs / Fields

- **Style:** white field, strong hairline border, 8px corner, 40px base height, readable sentence-case labels.
- **Focus:** visible outline with offset; native control affordances remain intact.
- **Validation:** explain the required correction in plain language near the field or action.

### Navigation

Desktop uses a restrained rail with a solid deep-sage active item. Mobile converts the same five destinations to a fixed bottom bar with icon and visible label. The three drawer tabs are sticky, equal width, and use a two-pixel sage underline for the active section.

### Signal Queue

Each row carries a semantic dot, plain-language signal type, person/action title, supporting reason, and a clear drill-in affordance. Sparse queues show category health instead of leaving a large empty cavity.

### Customer Drawer

Overview, Sales work, and History separate reading, changing, and auditing. Contact and account facts are prominent; copy actions sit beside the exact value. Recommended guidance gives one concrete next step, while the progress checklist shows completed and pending product milestones. Focus is trapped while open, Escape closes it, background content becomes inert, and focus returns to the invoking control.

## Do's and Don'ts

### Do:

- **Do** lead repeated-use screens with the next operational action.
- **Do** use plain-language sentence-case labels and short explanatory copy.
- **Do** keep contact details, plan, user status, interest, sales stage, and follow-up visible near the person.
- **Do** use tabular numerals for metrics, scores, and counts.
- **Do** provide 44px mobile targets and visible keyboard focus.
- **Do** remove nonessential transitions and drawer animation when reduced motion is requested.

### Don't:

- **Don't** turn the interface into a grid of equal KPI cards with no action hierarchy.
- **Don't** use forced all-caps labels, decorative gradients, glass effects, or promotional illustration in operational surfaces.
- **Don't** use semantic colors as decoration or rely on color alone to communicate state.
- **Don't** hide critical contact or account facts behind additional navigation.
- **Don't** add shadows to ordinary panels when a border and tonal layer are sufficient.
