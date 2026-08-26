import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qsuzeeeawaqshkytdmgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdXplZWVhd2Fxc2hreXRkbWdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYzNzU4MywiZXhwIjoyMTAzMjEzNTgzfQ.jW8DYP-d8cc-eg2L1DLXAjm42Qv1mLcE_Ir_ENYYVcE';

const supabase = createClient(supabaseUrl, supabaseKey);

const classifyBounceReason = (reason, type) => type === 'hard' ? 'Permanent failure' : 'Temporary failure';
const formatBounceRecord = (record, fallbackId) => {
  const bounceType = record.bounceType === 'soft' ? 'soft' : 'hard';
  const reason = record.reason || record.diagnostic || '';
  const processedAt = record.processedAt || record.timestamp || new Date().toISOString();
  
  return {
    id: record.id || fallbackId,
    email: String(record.email || '').toLowerCase().trim(),
    bounceType,
    category: record.category || classifyBounceReason(reason, bounceType),
    reason,
    subject: record.subject || 'Unknown subject',
    source: record.source || 'ZeptoMail',
    processedAt,
  };
};

async function checkWebhooks() {
  const { data: logs, error } = await supabase
    .from('webhook_logs')
    .select('id, provider, received_at, raw_payload')
    .in('provider', ['zeptomail', 'zeptomail_export'])
    .order('received_at', { ascending: false })
    .limit(10);

  const bounceReports = (logs || []).flatMap((log) => {
    if (log.provider === 'zeptomail') {
       const events = Array.isArray(log.raw_payload?.events) ? log.raw_payload.events : [log.raw_payload];
       const reports = [];
       for (const event of events) {
         if (!event) continue;
         const messages = Array.isArray(event?.event_message) ? event.event_message : [];
         for (let i = 0; i < messages.length; i++) {
           const message = messages[i];
           const email = message?.email_info?.to?.[0]?.email_address?.address || '';
           const subject = message?.email_info?.subject || '';
           const eventData = Array.isArray(message?.event_data) ? message.event_data : [];
           
           for (const ed of eventData) {
             const details = Array.isArray(ed?.details) ? ed.details : [ed];
             for (const detail of details) {
               if (detail && (detail.reason || detail.diagnostic_message)) {
                 const isHard = (Array.isArray(event.event_name) && event.event_name[0] === 'hardbounce') || ed.object === 'hardbounce';
                 reports.push(formatBounceRecord({
                   id: `${log.id}_${reports.length}`,
                   email: detail.bounced_recipient || email,
                   bounceType: isHard ? 'hard' : 'soft',
                   reason: `${detail.reason ? `Reason: ${detail.reason}\n` : ''}${detail.diagnostic_message || ''}`,
                   subject,
                   processedAt: detail.time || log.received_at
                 }, `${log.id}_${reports.length}`));
               }
             }
           }
         }
       }
       return reports;
    }

    const records = Array.isArray(log.raw_payload?.records)
      ? log.raw_payload.records
      : Array.isArray(log.raw_payload)
      ? log.raw_payload
      : [log.raw_payload];

    return records.map((record, index) => formatBounceRecord(record, `${log.id}_${index}`));
  }).filter((record) => record && record.email);

  console.log(JSON.stringify(bounceReports, null, 2));
}

checkWebhooks().catch(console.error);
