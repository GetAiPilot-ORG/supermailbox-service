import { supabase } from './dist/supabase.js';

async function main() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('id, key, name, subject, compiled_html')
    .eq('id', '71624932-03d9-436b-8657-987d98a95534')
    .single();

  console.log('Template 71624932-03d9-436b-8657-987d98a95534:');
  console.log('Subject:', data?.subject);
  console.log('Has Token?:', data?.compiled_html?.includes('Token') || data?.compiled_html?.includes('otp'));
  console.log('HTML snippet around link:', data?.compiled_html?.substring(data?.compiled_html?.indexOf('ConfirmationURL') - 100, data?.compiled_html?.indexOf('ConfirmationURL') + 100));
}

main().catch(console.error);
