import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://qsuzeeeawaqshkytdmgr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BOT_DASHBOARD_PATH = '/Users/pujamourya/Downloads/bot-dashboard';
const demoBookingConfirmationHtml = fs.readFileSync(
  path.join(BOT_DASHBOARD_PATH, 'email templates/DemoBookingConfirmation/index.html'),
  'utf-8'
);

const GETAIPILOT_PRODUCT_ID = 'cd793cdd-0642-42db-b225-f09d77dcee0e';

const templatesToSeed = [
  // 1. Demo Booking Confirmation
  {
    key: 'getaipilot_demo_booking_confirmation',
    name: 'GetAiPilot Demo Booking Confirmation (Default)',
    description: 'Sent to attendees immediately when they schedule a live demo or strategy session.',
    subject: 'Your Live Demo is Booked! 🚀',
    preheader: 'Your 1-on-1 strategy call with GetAIPilot engineering is confirmed.',
    category: 'transactional',
    industry: 'SaaS',
    compiled_html: demoBookingConfirmationHtml,
  },
  {
    key: 'demo_booking_confirmation',
    name: 'GetAiPilot Demo Booking Confirmation (Alias)',
    description: 'API alias for demo booking confirmation transactional dispatches.',
    subject: 'Your Live Demo is Booked! 🚀',
    preheader: 'Your 1-on-1 strategy call with GetAIPilot engineering is confirmed.',
    category: 'transactional',
    industry: 'SaaS',
    compiled_html: demoBookingConfirmationHtml,
  },
];

async function seed() {
  console.log(`Connecting to SuperMailBox Supabase at: ${supabaseUrl}`);

  for (const t of templatesToSeed) {
    console.log(`Processing template: ${t.key} ...`);

    // Check if exists
    const { data: existing, error: findError } = await supabase
      .from('email_templates')
      .select('id, key, current_version_id')
      .eq('key', t.key)
      .maybeSingle();

    if (findError) {
      console.error(`Error querying ${t.key}:`, findError);
      continue;
    }

    let templateId = existing?.id;

    if (existing) {
      console.log(`Found existing template for ${t.key} (ID: ${templateId}). Updating...`);
      const { error: updateError } = await supabase
        .from('email_templates')
        .update({
          name: t.name,
          description: t.description,
          subject: t.subject,
          preheader: t.preheader,
          category: t.category,
          industry: t.industry,
          compiled_html: t.compiled_html,
          product_id: GETAIPILOT_PRODUCT_ID,
          status: 'live',
          visibility: 'system',
          is_system_template: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId);

      if (updateError) {
        console.error(`Failed to update ${t.key}:`, updateError);
      } else {
        console.log(`✓ Updated ${t.key}`);
      }
    } else {
      console.log(`Creating new template for ${t.key}...`);
      const { data: inserted, error: insertError } = await supabase
        .from('email_templates')
        .insert({
          key: t.key,
          name: t.name,
          description: t.description,
          subject: t.subject,
          preheader: t.preheader,
          category: t.category,
          industry: t.industry,
          compiled_html: t.compiled_html,
          product_id: GETAIPILOT_PRODUCT_ID,
          status: 'live',
          visibility: 'system',
          is_system_template: true,
          version_number: 1,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`Failed to insert ${t.key}:`, insertError);
        continue;
      }
      templateId = inserted.id;
      console.log(`✓ Created ${t.key} with ID: ${templateId}`);
    }

    // Insert version record
    if (templateId) {
      const { data: ver, error: verError } = await supabase
        .from('template_versions')
        .insert({
          template_id: templateId,
          version_number: 1,
          subject: t.subject,
          html_source: t.compiled_html,
          status: 'live',
          save_reason: 'SuperMailBox Native Demo Template Release',
        })
        .select('id')
        .single();

      if (verError) {
        console.warn(`Warning inserting template_version for ${t.key}:`, verError.message);
      } else if (ver?.id) {
        await supabase
          .from('email_templates')
          .update({ current_version_id: ver.id })
          .eq('id', templateId);
        console.log(`✓ Linked current_version_id: ${ver.id}`);
      }
    }
  }

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
