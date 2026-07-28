import { z } from 'zod';

/**
 * Validates a secure HTTP/HTTPS URL and rejects javascript:, data:, or unsafe protocols.
 */
export const secureUrlSchema = z
  .string()
  .min(1, 'URL is required.')
  .refine(
    url => url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:'),
    { message: 'URL must start with http://, https://, mailto:, or tel:.' }
  )
  .refine(
    url => !url.toLowerCase().includes('javascript:') && !url.toLowerCase().includes('data:'),
    { message: 'Unsafe URL protocol detected.' }
  );

export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code (e.g. #6366F1).');

export const brandAssetSchema = z.object({
  asset_type: z.enum(['logo', 'image', 'banner', 'icon', 'document']),
  name: z.string().min(2, 'Asset name must be at least 2 characters.'),
  description: z.string().optional(),
  alt_text: z.string().optional(),
  secure_url: secureUrlSchema,
  folder_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  is_default: z.boolean().optional(),
});

export const brandContactSchema = z.object({
  contact_type: z.string().min(1, 'Contact type is required.'),
  label: z.string().min(2, 'Label must be at least 2 characters (e.g. Primary Support Email).'),
  value: z.string().min(3, 'Contact value must be at least 3 characters.'),
  is_default: z.boolean().optional(),
});

export const brandLinkSchema = z.object({
  link_type: z.string().min(1, 'Link type is required.'),
  label: z.string().min(2, 'Label must be at least 2 characters (e.g. Official Help Centre).'),
  url: secureUrlSchema,
  description: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const brandSocialProfileSchema = z.object({
  platform: z.string().min(2, 'Platform name is required (e.g. LinkedIn, X / Twitter).'),
  username: z.string().optional(),
  url: secureUrlSchema,
  display_label: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const brandStylesSchema = z.object({
  primary_color: hexColorSchema,
  secondary_color: hexColorSchema,
  accent_color: hexColorSchema,
  background_color: hexColorSchema,
  text_color: hexColorSchema,
  muted_text_color: hexColorSchema,
  link_color: hexColorSchema,
  button_color: hexColorSchema,
  button_text_color: hexColorSchema,
  border_color: hexColorSchema,
  font_heading: z.string().min(1, 'Heading font stack is required.'),
  font_body: z.string().min(1, 'Body font stack is required.'),
  default_border_radius: z.string().min(1, 'Border radius is required.'),
  default_email_width: z.string().min(1, 'Default email width is required (e.g. 600px).'),
  default_logo_width: z.string().min(1, 'Default logo width is required (e.g. 160px).'),
  default_spacing_scale: z.string().min(1, 'Spacing scale is required.'),
});

export const brandSnippetSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  name: z.string().min(2, 'Snippet name must be at least 2 characters.'),
  plain_text: z.string().min(5, 'Snippet content must be at least 5 characters.'),
  tags: z.array(z.string()).optional(),
  is_favourite: z.boolean().optional(),
});
