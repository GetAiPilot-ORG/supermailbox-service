import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qsuzeeeawaqshkytdmgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdXplZWVhd2Fxc2hreXRkbWdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNzU4MywiZXhwIjoyMTAzMjEzNTgzfQ.jW8DYP-d8cc-eg2L1DLXAjm42Qv1mLcE_Ir_ENYYVcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  const { count: totalSent } = await supabase.from('email_jobs').select('*', { count: 'exact', head: true }).in('status', ['sent', 'delivered', 'bounced', 'failed']);
  const { count: totalDelivered } = await supabase.from('email_jobs').select('*', { count: 'exact', head: true }).in('status', ['sent', 'delivered']);
  
  console.log('totalSent:', totalSent);
  console.log('totalDelivered:', totalDelivered);
}

checkCounts().catch(console.error);
