import { z } from 'zod';

export const templateMetadataSchema = z.object({
  name: z.string().min(1, 'Template name is required.').max(140),
  subject: z.string().max(240).optional(),
  preheader: z.string().max(300).optional(),
  category: z.string().max(80).optional(),
  industry: z.string().max(80).optional(),
});

export const testSendSchema = z.object({
  recipientEmail: z.string().email('Enter a valid test recipient.'),
  subject: z.string().min(1).max(240),
});
