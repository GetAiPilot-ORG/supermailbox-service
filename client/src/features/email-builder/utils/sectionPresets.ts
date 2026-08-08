import type { EmailRow } from '../types/document.types';
import { createBlock, createUniqueId } from './blockDefaults';

export interface SectionPreset {
  id: string;
  name: string;
  category: 'Header' | 'Hero' | 'Content' | 'Call to Action' | 'Footer';
  description: string;
  createRows: () => EmailRow[];
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    id: 'hero-classic',
    name: 'Classic Hero Section',
    category: 'Hero',
    description: 'Prominent headline, subtext, and call-to-action button',
    createRows: () => {
      const rowId = createUniqueId('row-hero');
      const heading = createBlock('heading');
      heading.content = { text: 'Welcome to SuperMailBox', level: 'h1' };
      heading.style = { ...heading.style, fontSize: '32px', textAlign: 'center', color: '#0f172a' };

      const para = createBlock('paragraph');
      para.content = { text: 'Engage your audience with automated, personalized email campaigns built for conversions.' };
      para.style = { ...para.style, fontSize: '16px', textAlign: 'center', color: '#475569' };

      const btn = createBlock('button');
      btn.content = { label: 'Get Started Now', url: 'https://example.com' };
      btn.style = { ...btn.style, align: 'center', backgroundColor: '#2563eb', padding: '14px 28px' };

      return [
        {
          id: rowId,
          name: 'Hero Section',
          settings: {
            backgroundColor: '#f8fafc',
            contentBackgroundColor: '#ffffff',
            padding: '40px 20px',
            borderRadius: '12px',
            stackOnMobile: true,
          },
          columns: [
            {
              id: `${rowId}-col-1`,
              width: 100,
              settings: { padding: '10px', verticalAlign: 'top' },
              blocks: [heading, para, btn],
            },
          ],
        },
      ];
    },
  },

  {
    id: 'header-simple',
    name: 'Logo & Tagline Header',
    category: 'Header',
    description: 'Clean header with centered logo and divider',
    createRows: () => {
      const rowId = createUniqueId('row-header');
      const heading = createBlock('heading');
      heading.content = { text: 'COMPANY BRAND', level: 'h3' };
      heading.style = { ...heading.style, fontSize: '20px', textAlign: 'center', color: '#1e293b', letterSpacing: '0.05em' };

      const divider = createBlock('divider');
      divider.style = { borderColor: '#e2e8f0', borderWidth: '1px', padding: '8px 0' };

      return [
        {
          id: rowId,
          name: 'Header Section',
          settings: {
            backgroundColor: '#ffffff',
            contentBackgroundColor: '#ffffff',
            padding: '20px 0px',
          },
          columns: [
            {
              id: `${rowId}-col-1`,
              width: 100,
              settings: { padding: '0px', verticalAlign: 'top' },
              blocks: [heading, divider],
            },
          ],
        },
      ];
    },
  },

  {
    id: 'features-2col',
    name: 'Two Column Feature Grid',
    category: 'Content',
    description: 'Side-by-side feature columns with headings and text',
    createRows: () => {
      const rowId = createUniqueId('row-features');

      const head1 = createBlock('heading');
      head1.content = { text: '⚡ Lightning Fast', level: 'h3' };
      head1.style = { ...head1.style, fontSize: '18px', color: '#1e293b' };

      const text1 = createBlock('paragraph');
      text1.content = { text: 'Deliver thousands of emails per minute with zero latency and high deliverability.' };

      const head2 = createBlock('heading');
      head2.content = { text: '📊 Real-time Analytics', level: 'h3' };
      head2.style = { ...head2.style, fontSize: '18px', color: '#1e293b' };

      const text2 = createBlock('paragraph');
      text2.content = { text: 'Track opens, clicks, bounces, and unsubscribes live from your unified dashboard.' };

      return [
        {
          id: rowId,
          name: 'Features Grid',
          settings: {
            backgroundColor: '#ffffff',
            contentBackgroundColor: '#ffffff',
            padding: '30px 10px',
            stackOnMobile: true,
          },
          columns: [
            {
              id: `${rowId}-col-1`,
              width: 50,
              settings: { padding: '12px', verticalAlign: 'top' },
              blocks: [head1, text1],
            },
            {
              id: `${rowId}-col-2`,
              width: 50,
              settings: { padding: '12px', verticalAlign: 'top' },
              blocks: [head2, text2],
            },
          ],
        },
      ];
    },
  },

  {
    id: 'cta-banner',
    name: 'Dark Call to Action Banner',
    category: 'Call to Action',
    description: 'High-converting dark banner with button',
    createRows: () => {
      const rowId = createUniqueId('row-cta');

      const head = createBlock('heading');
      head.content = { text: 'Ready to elevate your email marketing?', level: 'h2' };
      head.style = { ...head.style, fontSize: '24px', textAlign: 'center', color: '#ffffff' };

      const btn = createBlock('button');
      btn.content = { label: 'Start Free Trial', url: 'https://example.com' };
      btn.style = { ...btn.style, align: 'center', backgroundColor: '#38bdf8', textColor: '#0f172a', padding: '12px 24px' };

      return [
        {
          id: rowId,
          name: 'CTA Banner',
          settings: {
            backgroundColor: '#0f172a',
            contentBackgroundColor: '#0f172a',
            padding: '36px 20px',
            borderRadius: '8px',
          },
          columns: [
            {
              id: `${rowId}-col-1`,
              width: 100,
              settings: { padding: '10px', verticalAlign: 'top' },
              blocks: [head, btn],
            },
          ],
        },
      ];
    },
  },

  {
    id: 'footer-social',
    name: 'Footer with Social & Unsubscribe',
    category: 'Footer',
    description: 'Complete email footer with social links and compliance tokens',
    createRows: () => {
      const rowId = createUniqueId('row-footer');

      const social = createBlock('social');
      social.content = {
        profiles: [
          { platform: 'Twitter', url: '{{brand.social.twitter}}' },
          { platform: 'LinkedIn', url: '{{brand.social.linkedin}}' },
          { platform: 'Facebook', url: '{{brand.social.facebook}}' },
          { platform: 'Instagram', url: '{{brand.social.instagram}}' },
        ],
      };
      social.style = { align: 'center', padding: '8px 0' };

      const para = createBlock('paragraph');
      para.content = {
        text: '{{company_name}} · {{company_address}}<br/><a href="{{unsubscribe_url}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> · <a href="{{preferences_url}}" style="color: #64748b; text-decoration: underline;">Preferences</a>',
      };
      para.style = { ...para.style, fontSize: '12px', textAlign: 'center', color: '#64748b' };

      return [
        {
          id: rowId,
          name: 'Footer Section',
          settings: {
            backgroundColor: '#f1f5f9',
            contentBackgroundColor: '#f1f5f9',
            padding: '24px 16px',
          },
          columns: [
            {
              id: `${rowId}-col-1`,
              width: 100,
              settings: { padding: '0px', verticalAlign: 'top' },
              blocks: [social, para],
            },
          ],
        },
      ];
    },
  },
];
