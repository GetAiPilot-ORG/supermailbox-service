import { templateService } from '../../email-templates/services/template.service';

export interface CompileResult {
  html: string;
  plainText: string;
  errors: string[];
}

export async function compileMjmlViaServer(
  mjmlContent: string,
  options?: { subject?: string; preheader?: string; category?: string }
): Promise<CompileResult> {
  try {
    const res = await templateService.compileMjml({
      mjmlContent,
      subject: options?.subject,
      preheader: options?.preheader,
      category: options?.category || 'transactional',
    });

    return {
      html: res.html || '',
      plainText: res.plainText || '',
      errors: res.errors || [],
    };
  } catch (err: any) {
    console.error('MJML Compilation failed via server endpoint:', err);
    return {
      html: `<!DOCTYPE html><html><body><div style="padding:20px;color:red;font-family:sans-serif">MJML Compilation Error: ${err?.message || 'Server compilation failed'}</div></body></html>`,
      plainText: `MJML Compilation Error: ${err?.message || 'Server compilation failed'}`,
      errors: [err?.message || 'MJML Compilation failed'],
    };
  }
}
