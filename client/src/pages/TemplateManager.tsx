// Pre-built Templates Gallery & Manager Component
import React, { useState } from 'react';
import { Plus, X, Edit2, Layers, Search, Clock, FileText, Trash2, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Mail, Zap, Layout, Rocket, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Template } from '../services/api';

const PREBUILT_TEMPLATES = [
  {
    id: 'saas_welcome',
    title: 'SaaS Welcome & Onboarding',
    description: 'Warm welcome email with step-by-step onboarding checklist and clear CTA.',
    category: 'marketing',
    tag: 'Onboarding',
    badge: 'Popular',
    color: '#6366F1',
    previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 24px;"><span style="background: #e0e7ff; color: #4338ca; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em;">WELCOME ABOARD</span></div><h1 style="color: #0f172a; font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 16px;">Welcome to the Platform! 🎉</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">We're thrilled to have you with us. Here are three quick steps to get started with your new workspace:</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px;"><p style="margin: 0 0 12px 0; font-weight: 600; color: #1e293b;">1. Complete your profile & verify email</p><p style="margin: 0 0 12px 0; font-weight: 600; color: #1e293b;">2. Connect your first API channel or social account</p><p style="margin: 0; font-weight: 600; color: #1e293b;">3. Launch your first automated test campaign</p></div><div style="text-align: center;"><a href="#" style="background: #4f46e5; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; display: inline-block;">Go to Dashboard →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Welcome to the Platform! 🎉", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 16px; line-height: 1.6;\">We're thrilled to have you with us. Here are three quick steps to get started with your new workspace:</p>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Go to Dashboard →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#4f46e5", hoverColor: "#FFFFFF", hoverBackgroundColor: "#4338ca" }, padding: "20px", borderRadius: "10px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'payment_receipt',
    title: 'Payment Receipt & Invoice Summary',
    description: 'Clean transaction confirmation with invoice breakdown and PDF download link.',
    category: 'transactional',
    tag: 'Receipts',
    badge: 'Essential',
    color: '#10B981',
    previewBg: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 24px;"><span style="background: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em;">PAYMENT CONFIRMED</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">Thank you for your order! 💳</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">We've received your payment. Here is your summary:</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;"><div style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Invoice ID:</span><strong>{{invoice_id}}</strong></div><div style="display: flex; justify-content: space-between; font-size: 18px;"><span>Total Paid:</span><strong style="color: #059669;">{{amount}}</strong></div></div><div style="text-align: center;"><a href="#" style="background: #059669; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; display: inline-block;">Download PDF Invoice →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Thank you for your order! 💳", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px; line-height: 1.6;\">We've received your payment. Here is your transaction summary for Invoice {{invoice_id}}.</p>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Download PDF Invoice →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#059669", hoverColor: "#FFFFFF", hoverBackgroundColor: "#047857" }, padding: "16px 28px", borderRadius: "8px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'security_otp',
    title: 'Secure OTP & Login Code',
    description: 'High-contrast authentication email displaying a 6-digit verification code.',
    category: 'transactional',
    tag: 'Security',
    badge: 'Auth',
    color: '#F59E0B',
    previewBg: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;"><h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Verification Code 🔐</h2><p style="color: #64748b; font-size: 15px; margin-bottom: 28px;">Please use the following OTP code to sign in to your GetAiPilot account:</p><div style="background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #b45309; margin-bottom: 28px;">{{otp_code}}</div><p style="color: #94a3b8; font-size: 13px; margin: 0;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Verification Code 🔐", headingType: "h2", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px;\">Please use the following OTP code to sign in to your GetAiPilot account:</p>", padding: "10px 20px" } },
                  { type: "text", values: { text: "<div style=\"text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #b45309; background: #fffbeb; padding: 20px; border-radius: 12px; border: 2px dashed #f59e0b;\">{{otp_code}}</div>", padding: "10px 30px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #94a3b8; font-size: 13px;\">This code expires in 10 minutes. Do not share it with anyone.</p>", padding: "20px 20px 10px 20px" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'product_update',
    title: 'Product Launch & Feature Update',
    description: 'Vibrant announcement template with feature highlights and action buttons.',
    category: 'marketing',
    tag: 'Newsletters',
    badge: 'New',
    color: '#EC4899',
    previewBg: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 20px;"><span style="background: #fce7f3; color: #be185d; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em;">NEW RELEASE 🚀</span></div><h1 style="color: #0f172a; font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 16px;">Meet Autonomous 2.0 ✨</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 28px;">We just released our biggest update of the year, featuring multi-agent collaboration, instant WhatsApp broadcasts, and real-time telemetry.</p><div style="text-align: center;"><a href="#" style="background: #db2777; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; display: inline-block;">Explore New Features →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Meet Autonomous 2.0 ✨", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 16px; line-height: 1.6;\">We just released our biggest update of the year, featuring multi-agent collaboration, instant WhatsApp broadcasts, and real-time telemetry.</p>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Explore New Features →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#db2777", hoverColor: "#FFFFFF", hoverBackgroundColor: "#be185d" }, padding: "16px 32px", borderRadius: "10px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'monthly_newsletter',
    title: 'Monthly Community Newsletter',
    description: 'Multi-column editorial layout for blogs, company updates, and user spotlights.',
    category: 'marketing',
    tag: 'Newsletters',
    badge: 'Curated',
    color: '#3B82F6',
    previewBg: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 8px;">The Monthly Pilot 🗞️</h1><p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 28px;">Your monthly dose of AI engineering and automation insights.</p><div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin-bottom: 24px;"><h3 style="color: #1e293b; font-size: 18px; margin: 0 0 8px 0;">Top Story: How to Scale Email Infrastructure to 1M Daily Blasts</h3><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">Learn how our engineering team optimized Redis BullMQ pipelines and ZeptoMail webhooks for ultra-high deliverability.</p></div><div style="text-align: center;"><a href="#" style="background: #2563eb; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; display: inline-block;">Read Full Article →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "The Monthly Pilot 🗞️", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 5px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 14px;\">Your monthly dose of AI engineering and automation insights.</p>", padding: "0px 20px 20px 20px" } },
                  { type: "divider", values: { width: "100%", borderSize: "1px", borderStyle: "solid", borderColor: "#e2e8f0", padding: "10px 20px" } },
                  { type: "heading", values: { text: "Top Story: Scaling Email Infrastructure to 1M Daily Blasts", headingType: "h3", textAlign: "left", color: "#1e293b", padding: "10px 20px 5px 20px" } },
                  { type: "text", values: { text: "<p style=\"color: #64748b; font-size: 15px; line-height: 1.6;\">Learn how our engineering team optimized Redis BullMQ pipelines and ZeptoMail webhooks for ultra-high deliverability.</p>", padding: "5px 20px 20px 20px" } },
                  { type: "button", values: { text: "<strong>Read Full Article →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#2563eb", hoverColor: "#FFFFFF", hoverBackgroundColor: "#1d4ed8" }, padding: "14px 28px", borderRadius: "8px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'whatsapp_alert',
    title: 'WhatsApp Campaign Broadcast Alert',
    description: 'System status notification informing users of campaign delivery metrics.',
    category: 'transactional',
    tag: 'Alerts',
    badge: 'Automations',
    color: '#059669',
    previewBg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #10b981 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;"><span style="background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 11px;">✓ BROADCAST PUBLISHED</span></div><h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">WhatsApp Campaign Live! 🚀</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Your broadcast campaign <strong>{{campaign_name}}</strong> has been successfully dispatched to your subscriber list.</p><div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 24px;"><p style="margin: 0; color: #166534; font-weight: 600;">Audience Reach: ~1,840 Contacts &bull; Delivered Rate: 99.2%</p></div><a href="#" style="background: #059669; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; display: inline-block;">View Analytics Dashboard →</a></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "WhatsApp Campaign Live! 🚀", headingType: "h1", textAlign: "left", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"color: #64748b; font-size: 15px; line-height: 1.6;\">Your broadcast campaign <strong>{{campaign_name}}</strong> has been successfully dispatched to your subscriber list.</p>", padding: "10px 20px" } },
                  { type: "text", values: { text: "<div style=\"background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; color: #166534; font-weight: 600;\">Audience Reach: ~1,840 Contacts &bull; Delivered Rate: 99.2%</div>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>View Analytics Dashboard →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#059669", hoverColor: "#FFFFFF", hoverBackgroundColor: "#047857" }, padding: "14px 28px", borderRadius: "8px", textAlign: "left" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'flash_sale',
    title: 'Exclusive Flash Sale Promo',
    description: 'High-converting promotional email with countdown banner and discount coupon.',
    category: 'marketing',
    tag: 'Promotions',
    badge: 'Hot',
    color: '#EF4444',
    previewBg: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #ef4444 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;"><div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; display: inline-block; margin-bottom: 20px;">⚡ 48-HOUR FLASH SALE ⚡</div><h1 style="color: #0f172a; font-size: 30px; font-weight: 800; margin-bottom: 14px;">Get 40% Off Everything! 🛍️</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Use code below at checkout to unlock your exclusive VIP discount before the timer runs out.</p><div style="background: #1e293b; color: #f8fafc; font-size: 24px; font-weight: 800; letter-spacing: 4px; padding: 16px 32px; border-radius: 12px; display: inline-block; margin-bottom: 28px;">VIP40OFF</div><br><a href="#" style="background: #dc2626; color: #ffffff; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(220,38,38,0.4);">Claim Your Discount Now →</a></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Get 40% Off Everything! 🛍️", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 16px; line-height: 1.6;\">Use code below at checkout to unlock your exclusive VIP discount before the timer runs out.</p>", padding: "10px 30px" } },
                  { type: "text", values: { text: "<div style=\"text-align: center; background: #1e293b; color: #f8fafc; font-size: 24px; font-weight: 800; letter-spacing: 4px; padding: 16px 32px; border-radius: 12px; display: inline-block;\">VIP40OFF</div>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Claim Your Discount Now →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#dc2626", hoverColor: "#FFFFFF", hoverBackgroundColor: "#b91c1c" }, padding: "16px 36px", borderRadius: "10px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'blank_canvas',
    title: 'Blank Custom Canvas',
    description: 'Start from a clean slate. Build your custom email structure using the drag-and-drop studio.',
    category: 'transactional',
    tag: 'Blank',
    badge: 'Custom',
    color: '#64748B',
    previewBg: 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;"><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin-bottom: 16px;">New Template</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6;">Start dragging blocks from the right sidebar to build your custom layout.</p></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "New Template", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px;\">Start dragging blocks from the right sidebar to build your custom layout.</p>", padding: "10px 20px" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  }
];

const AutoScalingPreview = ({ html }: { html: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(600);

  const updateScale = React.useCallback(() => {
    if (containerRef.current) {
      const containerH = containerRef.current.clientHeight;
      if (contentHeight > containerH && containerH > 0) {
        // Add a small 0.98 multiplier to give a tiny bit of visual padding at the top/bottom
        setScale((containerH / contentHeight) * 0.96);
      } else {
        setScale(1);
      }
    }
  }, [contentHeight]);

  React.useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ 
        width: `${100 / scale}%`, 
        height: contentHeight,
        transform: `scale(${scale})`, 
        transformOrigin: 'top center',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <iframe 
          title="Template Preview" 
          srcDoc={html} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
          onLoad={(e) => {
             try {
               const doc = e.currentTarget.contentWindow?.document;
               if (doc) {
                  // small delay to ensure styles and images affect scrollHeight
                  setTimeout(() => {
                    const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
                    setContentHeight(Math.max(height + 20, 600)); // +20 for bottom padding
                  }, 50);
               }
             } catch(err) {}
          }}
        />
      </div>
    </div>
  );
};

interface TemplateManagerProps {
  templates: Template[];
  onEditTemplate: (templateKey: string) => void;
  onCreateTemplate?: (newTemplate: Template) => void;
  onDeleteTemplate?: (templateKey: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onEditTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'getaipilot' | 'socialpilot' | 'whatsapp' | 'general'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'transactional' | 'marketing'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplKey, setNewTmplKey] = useState('');
  const [newTmplCategory, setNewTmplCategory] = useState('transactional');
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<any | null>(null);

  const getPlatform = (t: Template): 'getaipilot' | 'socialpilot' | 'whatsapp' | 'general' => {
    const k = (t.key || '').toLowerCase();
    const n = (t.name || '').toLowerCase();
    if (
      k.includes('whatsapp') || n.includes('whatsapp') ||
      k === 'broadcast_success' || k === 'broadcast_failed' || k === 'team_invite'
    ) return 'whatsapp';
    if (
      k.includes('getaipilot') || n.includes('getaipilot') ||
      k === 'billing_receipt' || k === 'product_announcement'
    ) return 'getaipilot';
    if (
      k.includes('socialpilot') || n.includes('socialpilot') ||
      k.includes('quickpost') || n.includes('quickpost') ||
      k === 'broadcast_notification' || k === 'auth_welcome' ||
      k === 'automation_created' || k === 'account_connected'
    ) return 'socialpilot';
    return 'general';
  };

  const platformCounts = {
    all: templates.length,
    getaipilot: templates.filter(t => getPlatform(t) === 'getaipilot').length,
    socialpilot: templates.filter(t => getPlatform(t) === 'socialpilot').length,
    whatsapp: templates.filter(t => getPlatform(t) === 'whatsapp').length,
    general: templates.filter(t => getPlatform(t) === 'general').length,
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const platform = getPlatform(t);
    const matchesPlatform = selectedPlatform === 'all' || platform === selectedPlatform;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const handleCreateNewTemplate = () => {
    if (!newTmplName.trim()) return;
    const key = newTmplKey.trim() || newTmplName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    const chosen = selectedPrebuilt || PREBUILT_TEMPLATES[7]; // default to blank
    const defaultHtml = chosen.html;
    const defaultDesign = chosen.design;

    const newTmpl: Template = {
      key,
      name: newTmplName,
      category: (newTmplCategory === 'marketing' ? 'marketing' : 'transactional'),
      versions: [
        {
          version: 'v1.0.0',
          status: 'Draft',
          html: defaultHtml,
          design: defaultDesign,
          subject: newTmplName,
          author: 'Admin User',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          variables: ['name']
        }
      ]
    };
    if (onCreateTemplate) {
      onCreateTemplate(newTmpl);
      onEditTemplate(newTmpl.key);
    }
    setShowCreateModal(false);
    setSelectedPrebuilt(null);
    setNewTmplName('');
    setNewTmplKey('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="template-manager" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--background)' }}>
      
      {/* Header Section */}
      <div style={{ 
        padding: '32px 48px 24px',
        background: 'var(--background)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Message Templates</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
              Manage and organize email broadcast templates by platform & category
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '0 48px' }}>
        
        {/* Platform Tabs & Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          
          {/* Platform Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <button 
              onClick={() => setSelectedPlatform('all')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: selectedPlatform === 'all' ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: selectedPlatform === 'all' ? 'var(--primary)' : 'var(--surface-muted)',
                color: selectedPlatform === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              All Platforms ({platformCounts.all})
            </button>
            <button 
              onClick={() => setSelectedPlatform('getaipilot')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: selectedPlatform === 'getaipilot' ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: selectedPlatform === 'getaipilot' ? 'var(--primary)' : 'var(--surface-muted)',
                color: selectedPlatform === 'getaipilot' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⚡ GetAiPilot ({platformCounts.getaipilot})
            </button>
            <button 
              onClick={() => setSelectedPlatform('socialpilot')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: selectedPlatform === 'socialpilot' ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: selectedPlatform === 'socialpilot' ? 'var(--primary)' : 'var(--surface-muted)',
                color: selectedPlatform === 'socialpilot' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📢 QuickPost & SocialPilot ({platformCounts.socialpilot})
            </button>
            <button 
              onClick={() => setSelectedPlatform('whatsapp')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: selectedPlatform === 'whatsapp' ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: selectedPlatform === 'whatsapp' ? 'var(--primary)' : 'var(--surface-muted)',
                color: selectedPlatform === 'whatsapp' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💬 GAP WhatsApp ({platformCounts.whatsapp})
            </button>
            <button 
              onClick={() => setSelectedPlatform('general')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: selectedPlatform === 'general' ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: selectedPlatform === 'general' ? 'var(--primary)' : 'var(--surface-muted)',
                color: selectedPlatform === 'general' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✉️ SuperMailBox / General ({platformCounts.general})
            </button>
          </div>

          {/* Search Bar & Category Filter */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="ui-input"
                placeholder="Search by template name, key, or details..." 
                style={{ 
                  width: '100%', 
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-muted)',
                  boxSizing: 'border-box'
                }} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="ui-input"
              style={{
                padding: '8px 12px',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-muted)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                minWidth: '170px'
              }}
            >
              <option value="all">All Categories</option>
              <option value="transactional">Transactional</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '40px' }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 2.5fr 1fr 1fr 80px', 
            padding: '12px 24px', 
            borderBottom: '1px solid var(--border)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Template name <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Category <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Subject / Details <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Versions <span style={{ fontSize: '0.6rem' }}>↑</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Last edited <span style={{ fontSize: '0.6rem' }}>↓</span></div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Body */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTemplates.map((template, index) => {
              const liveVersion = template.versions.find(v => v.status === 'Live') || template.versions[0];
              const isLast = index === filteredTemplates.length - 1;
              
              return (
                <div 
                  key={template.key} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 2.5fr 1fr 1fr 80px', 
                    padding: '16px 24px', 
                    alignItems: 'center',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    background: 'var(--surface-muted)',
                    cursor: 'pointer',
                  }} 
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; }}
                  onClick={() => setPreviewTemplate(template)}
                >
                  
                  {/* Name & Key */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>
                        {template.name || template.key}
                      </span>
                      {getPlatform(template) === 'whatsapp' ? (
                        <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(37, 211, 102, 0.15)', color: '#16a34a', fontWeight: 600 }}>💬 WhatsApp</span>
                      ) : getPlatform(template) === 'socialpilot' ? (
                        <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.15)', color: '#6366f1', fontWeight: 600 }}>📢 SocialPilot</span>
                      ) : getPlatform(template) === 'getaipilot' ? (
                        <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontWeight: 600 }}>⚡ GetAiPilot</span>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: '4px', background: 'var(--border)', color: 'var(--text-secondary)', fontWeight: 500 }}>📧 Email</span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {template.category === 'marketing' ? 'Marketing' : 'Transactional'}
                  </div>

                  {/* Subject */}
                  <div style={{ paddingRight: '16px' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>
                      {liveVersion?.subject || 'No subject set'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {template.key}
                    </div>
                  </div>

                  {/* Versions */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', background: 'var(--surface)' }}>
                       <Clock size={12} color="var(--text-secondary)" /> {template.versions.length} version{template.versions.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {liveVersion?.date?.split(' ')[0] || 'Unknown'}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditTemplate(template.key); }} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Edit Template"
                    >
                      <Edit2 size={16} />
                    </button>
                    {onDeleteTemplate && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteTemplate(template.key); }} 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-muted)' }}>
              <div>{filteredTemplates.length} templates shown</div>
              <div>Ready for Broadcast</div>
            </div>
          </div>
        </div>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Layers size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>No templates found</h4>
            <p style={{ fontSize: '0.875rem' }}>Adjust your search or create a new template to get started.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 12, 0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => { setShowCreateModal(false); setSelectedPrebuilt(null); }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '1150px', height: '88vh', maxHeight: '850px', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', overflow: 'hidden' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Create a Message Template</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>Choose a pre-built template from our library or start with a clean blank canvas.</p>
                  </div>
                </div>
                <button onClick={() => { setShowCreateModal(false); setSelectedPrebuilt(null); }} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.color = 'var(--ink)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <X size={22} />
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { id: 'all', label: 'All Templates' },
                    { id: 'marketing', label: 'Marketing' },
                    { id: 'transactional', label: 'Transactional' },
                    { id: 'Newsletters', label: 'Newsletters' },
                    { id: 'Alerts', label: 'Alerts & Auth' },
                    { id: 'Blank', label: 'Blank Canvas' }
                  ].map(tab => {
                    const isActive = galleryCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGalleryCategory(tab.id)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '999px',
                          fontSize: '0.82rem',
                          fontWeight: isActive ? 600 : 500,
                          border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                          background: isActive ? 'var(--primary)' : 'var(--surface-muted)',
                          color: isActive ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ position: 'relative', width: '260px', flexShrink: 0 }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search library..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%', padding: '7px 12px 7px 34px', fontSize: '0.82rem', borderRadius: '999px', background: 'var(--surface-muted)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Grid Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'var(--surface-muted)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {PREBUILT_TEMPLATES.filter(t => {
                    const matchesSearch = t.title.toLowerCase().includes(gallerySearch.toLowerCase()) || t.description.toLowerCase().includes(gallerySearch.toLowerCase()) || t.tag.toLowerCase().includes(gallerySearch.toLowerCase());
                    const matchesCat = 
                      galleryCategory === 'all' || 
                      t.category === galleryCategory || 
                      t.tag === galleryCategory ||
                      (galleryCategory === 'Alerts' && (t.tag === 'Alerts' || t.tag === 'Security' || t.tag === 'Receipts'));
                    return matchesSearch && matchesCat;
                  }).map(tmpl => {
                    const isSelected = selectedPrebuilt?.id === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedPrebuilt(tmpl);
                          setNewTmplName(tmpl.title === 'Blank Custom Canvas' ? 'My New Template' : tmpl.title);
                          setNewTmplKey((tmpl.title === 'Blank Custom Canvas' ? 'my_new_template' : tmpl.title).toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                          setNewTmplCategory(tmpl.category);
                        }}
                        style={{
                          background: 'var(--surface)',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 8px 24px rgba(79, 70, 229, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          position: 'relative'
                        }}
                      >
                        {/* Preview Banner */}
                        <div style={{ height: '140px', background: tmpl.previewBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' }}>
                          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.03em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.15)' }}>
                            {tmpl.badge}
                          </span>
                          {isSelected && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                              <CheckCircle2 size={15} />
                            </div>
                          )}
                          {/* Mini visual icon representing template */}
                          <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
                            {tmpl.id === 'saas_welcome' && <Rocket size={26} />}
                            {tmpl.id === 'payment_receipt' && <FileText size={26} />}
                            {tmpl.id === 'security_otp' && <ShieldCheck size={26} />}
                            {tmpl.id === 'product_update' && <Sparkles size={26} />}
                            {tmpl.id === 'monthly_newsletter' && <Mail size={26} />}
                            {tmpl.id === 'whatsapp_alert' && <Zap size={26} />}
                            {tmpl.id === 'flash_sale' && <Tag size={26} />}
                            {tmpl.id === 'blank_canvas' && <Layout size={26} />}
                          </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: tmpl.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{tmpl.tag}</span>
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px 0', lineHeight: 1.3 }}>{tmpl.title}</h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{tmpl.description}</p>
                          </div>
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                            <span>{isSelected ? 'Selected' : 'Click to select'} &rarr;</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Config Bar */}
              <div style={{ padding: '18px 32px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', boxShadow: '0 -4px 16px rgba(0,0,0,0.03)' }}>
                {selectedPrebuilt ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: selectedPrebuilt.previewBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                      ✓
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Selected Design</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{selectedPrebuilt.title}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', marginRight: '8px' }}></span>
                    Please select a template design above to configure and launch.
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Template Name</label>
                    <input
                      type="text"
                      disabled={!selectedPrebuilt}
                      value={newTmplName}
                      onChange={(e) => {
                        setNewTmplName(e.target.value);
                        setNewTmplKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                      }}
                      placeholder="Template name..."
                      className="ui-input"
                      style={{ padding: '7px 12px', fontSize: '0.82rem', width: '180px', borderRadius: '8px', height: '36px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Unique Key</label>
                    <input
                      type="text"
                      disabled={!selectedPrebuilt}
                      value={newTmplKey}
                      onChange={(e) => setNewTmplKey(e.target.value)}
                      placeholder="unique_key"
                      className="ui-input"
                      style={{ padding: '7px 12px', fontSize: '0.82rem', fontFamily: 'monospace', width: '160px', borderRadius: '8px', height: '36px', background: 'var(--surface-muted)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                    <select
                      disabled={!selectedPrebuilt}
                      value={newTmplCategory}
                      onChange={(e) => setNewTmplCategory(e.target.value)}
                      className="ui-input"
                      style={{ padding: '7px 12px', fontSize: '0.82rem', width: '140px', borderRadius: '8px', height: '36px', cursor: 'pointer', background: 'var(--surface-muted)', boxSizing: 'border-box' }}
                    >
                      <option value="transactional">Transactional</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', marginLeft: '8px' }}>
                    <button
                      disabled={!selectedPrebuilt || !newTmplName.trim()}
                      onClick={handleCreateNewTemplate}
                      style={{
                        padding: '0 20px',
                        height: '36px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        background: selectedPrebuilt && newTmplName.trim() ? 'var(--primary)' : 'var(--surface-muted)',
                        color: selectedPrebuilt && newTmplName.trim() ? '#FFFFFF' : 'var(--text-muted)',
                        border: 'none',
                        cursor: selectedPrebuilt && newTmplName.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: selectedPrebuilt && newTmplName.trim() ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Rocket size={16} /> Create & Start Editing
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} 
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ width: '100%', maxWidth: '900px', height: '85vh', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', overflow: 'hidden' }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Preview: {previewTemplate.name || previewTemplate.key}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{previewTemplate.key}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => { onEditTemplate(previewTemplate.key); setPreviewTemplate(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: 500, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <Edit2 size={14} /> Open Editor
                  </button>
                  <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
                  <button onClick={() => setPreviewTemplate(null)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div style={{ flex: 1, background: 'var(--surface)', padding: '32px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '680px', height: '100%', background: 'var(--surface-muted)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {(() => {
                    const liveVersion = previewTemplate.versions.find((v) => v.status === 'Live') || previewTemplate.versions[0];
                    if (liveVersion && liveVersion.html) {
                      return <AutoScalingPreview html={liveVersion.html} />;
                    } else {
                      return (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
                          <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>No HTML content</h4>
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>This template is currently empty. Click "Open Editor" to start building it.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
