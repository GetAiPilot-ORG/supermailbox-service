import { brandService } from './brand.service';

export interface BrandMergeTag {
  tag: string;
  label: string;
  category: 'Company' | 'Design & Colors' | 'Contacts' | 'URLs & Links' | 'System';
  description: string;
}

/**
 * Service to resolve Brand Library tokens in preview canvases and provide merge tag catalogs.
 */
export const resourceResolverService = {
  async resolveInPreview(content: string, brandId?: string): Promise<string> {
    if (!content) return '';
    try {
      return await brandService.resolveTokens(content, brandId);
    } catch (e) {
      console.warn('[Resource Resolver] Could not resolve tokens from server, returning original content:', e);
      return content;
    }
  },

  getAvailableMergeTags(): BrandMergeTag[] {
    return [
      {
        tag: '{{brand.company_name}}',
        label: 'Company Name',
        category: 'Company',
        description: 'Primary workspace or brand name (e.g. SuperMail Box)',
      },
      {
        tag: '{{brand.logo_url}}',
        label: 'Brand Logo URL',
        category: 'Company',
        description: 'URL of the default brand logo asset',
      },
      {
        tag: '{{brand.company_address}}',
        label: 'Physical Address',
        category: 'Contacts',
        description: 'Physical or billing address for CAN-SPAM / GDPR compliance',
      },
      {
        tag: '{{brand.support_email}}',
        label: 'Support Email',
        category: 'Contacts',
        description: 'Primary customer support email address',
      },
      {
        tag: '{{brand.support_phone}}',
        label: 'Support Phone',
        category: 'Contacts',
        description: 'Primary support or help desk helpline number',
      },
      {
        tag: '{{brand.website_url}}',
        label: 'Website URL',
        category: 'URLs & Links',
        description: 'Official main website home URL',
      },
      {
        tag: '{{brand.unsubscribe_url}}',
        label: 'Unsubscribe Link',
        category: 'URLs & Links',
        description: 'Mandatory 1-click unsubscribe preference link',
      },
      {
        tag: '{{brand.preferences_url}}',
        label: 'Preferences Link',
        category: 'URLs & Links',
        description: 'Subscriber email notification preferences page',
      },
      {
        tag: '{{brand.primary_color}}',
        label: 'Primary Brand Color',
        category: 'Design & Colors',
        description: 'Hex code of the primary brand color (#6366F1)',
      },
      {
        tag: '{{brand.secondary_color}}',
        label: 'Secondary Color',
        category: 'Design & Colors',
        description: 'Hex code of the secondary brand color (#4F46E5)',
      },
      {
        tag: '{{brand.font_heading}}',
        label: 'Heading Typography Stack',
        category: 'Design & Colors',
        description: 'CSS font family string for headings',
      },
      {
        tag: '{{brand.font_body}}',
        label: 'Body Typography Stack',
        category: 'Design & Colors',
        description: 'CSS font family string for body text',
      },
      {
        tag: '{{current_year}}',
        label: 'Current Year',
        category: 'System',
        description: 'Dynamic 4-digit current year (e.g. 2026)',
      },
    ];
  },
};
