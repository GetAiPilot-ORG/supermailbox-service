// Pre-built Templates Gallery & Manager Component
import React, { useState } from 'react';
import { Plus, X, Edit2, Layers, Search, Clock, FileText, Trash2, ArrowRight, CheckCircle2, ShieldCheck, Mail, Layout, Tag, Bell, Newspaper, Shield } from 'lucide-react';
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 24px;"><span style="background: #e0e7ff; color: #4338ca; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em;">WELCOME ABOARD</span></div><h1 style="color: #0f172a; font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 16px;">Welcome to the Platform</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">We're thrilled to have you with us. Here are three quick steps to get started with your new workspace:</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px;"><p style="margin: 0 0 12px 0; font-weight: 600; color: #1e293b;">1. Complete your profile & verify email</p><p style="margin: 0 0 12px 0; font-weight: 600; color: #1e293b;">2. Connect your first API channel or social account</p><p style="margin: 0; font-weight: 600; color: #1e293b;">3. Launch your first automated test campaign</p></div><div style="text-align: center;"><a href="#" style="background: #4f46e5; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; display: inline-block;">Go to Dashboard →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Welcome to the Platform", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 24px;"><span style="background: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em;">PAYMENT CONFIRMED</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">Thank you for your order</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">We've received your payment. Here is your summary:</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;"><div style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Invoice ID:</span><strong>{{invoice_id}}</strong></div><div style="display: flex; justify-content: space-between; font-size: 18px;"><span>Total Paid:</span><strong style="color: #059669;">{{amount}}</strong></div></div><div style="text-align: center;"><a href="#" style="background: #059669; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; display: inline-block;">Download PDF Invoice →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Thank you for your order", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;"><h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Verification Code</h2><p style="color: #64748b; font-size: 15px; margin-bottom: 28px;">Please use the following OTP code to sign in to your GetAiPilot account:</p><div style="background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #b45309; margin-bottom: 28px;">{{otp_code}}</div><p style="color: #94a3b8; font-size: 13px; margin: 0;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Verification Code", headingType: "h2", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 20px;"><span style="background: #fce7f3; color: #be185d; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em;">NEW RELEASE</span></div><h1 style="color: #0f172a; font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 16px;">Meet Autonomous 2.0</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 28px;">We just released our biggest update of the year, featuring multi-agent collaboration, instant WhatsApp broadcasts, and real-time telemetry.</p><div style="text-align: center;"><a href="#" style="background: #db2777; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; display: inline-block;">Explore New Features →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Meet Autonomous 2.0", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 8px;">The Monthly Pilot</h1><p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 28px;">Your monthly dose of AI engineering and automation insights.</p><div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin-bottom: 24px;"><h3 style="color: #1e293b; font-size: 18px; margin: 0 0 8px 0;">Top Story: How to Scale Email Infrastructure to 1M Daily Blasts</h3><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">Learn how our engineering team optimized Redis BullMQ pipelines and ZeptoMail webhooks for ultra-high deliverability.</p></div><div style="text-align: center;"><a href="#" style="background: #2563eb; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; display: inline-block;">Read Full Article →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "The Monthly Pilot", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 5px 20px" } },
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;"><span style="background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 11px;">✓ BROADCAST PUBLISHED</span></div><h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">WhatsApp Campaign Live</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Your broadcast campaign <strong>{{campaign_name}}</strong> has been successfully dispatched to your subscriber list.</p><div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 24px;"><p style="margin: 0; color: #166534; font-weight: 600;">Audience Reach: ~1,840 Contacts &bull; Delivered Rate: 99.2%</p></div><a href="#" style="background: #059669; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; display: inline-block;">View Analytics Dashboard →</a></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "WhatsApp Campaign Live", headingType: "h1", textAlign: "left", color: "#0f172a", padding: "20px 20px 10px 20px" } },
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
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;"><div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; display: inline-block; margin-bottom: 20px;">48-HOUR FLASH SALE</div><h1 style="color: #0f172a; font-size: 30px; font-weight: 800; margin-bottom: 14px;">Get 40% Off Everything</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Use code below at checkout to unlock your exclusive VIP discount before the timer runs out.</p><div style="background: #1e293b; color: #f8fafc; font-size: 24px; font-weight: 800; letter-spacing: 4px; padding: 16px 32px; border-radius: 12px; display: inline-block; margin-bottom: 28px;">VIP40OFF</div><br><a href="#" style="background: #dc2626; color: #ffffff; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(220,38,38,0.4);">Claim Your Discount Now →</a></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Get 40% Off Everything", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
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
    id: 'pwd_reset',
    title: 'Password Reset Request',
    description: 'Secure link verification email to safely reset an account password.',
    category: 'transactional',
    tag: 'Security',
    badge: 'Auth',
    color: '#0284C7',
    previewBg: 'linear-gradient(135deg, #075985 0%, #0369a1 50%, #0284c7 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;"><div style="background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; margin-bottom: 20px;">SECURITY NOTICE</div><h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Reset Your Password</h2><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">We received a request to reset the password for your account associated with <strong>{{email}}</strong>. Click the button below to proceed:</p><a href="{{reset_link}}" style="background: #0284c7; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; display: inline-block; margin-bottom: 28px;">Reset My Password →</a><p style="color: #94a3b8; font-size: 13px; margin: 0;">This secure link expires in 15 minutes. If you did not initiate this request, no action is required.</p></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Reset Your Password", headingType: "h2", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px; line-height: 1.6;\">We received a request to reset the password for your account associated with <strong>{{email}}</strong>. Click the button below to proceed:</p>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>Reset My Password →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#0284c7", hoverColor: "#FFFFFF", hoverBackgroundColor: "#0369a1" }, padding: "14px 32px", borderRadius: "6px", textAlign: "center" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #94a3b8; font-size: 13px;\">This secure link expires in 15 minutes. If you did not initiate this request, no action is required.</p>", padding: "20px 20px 10px 20px" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'sub_renewal',
    title: 'Subscription Renewal & Billing Notice',
    description: 'Upcoming billing reminder with plan details, renewal date, and payment method summary.',
    category: 'transactional',
    tag: 'Receipts',
    badge: 'Billing',
    color: '#4F46E5',
    previewBg: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #4f46e5 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 20px;"><span style="background: #e0e7ff; color: #3730a3; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px;">UPCOMING BILLING</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 14px;">Subscription Renewal Notice</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">Your <strong>{{plan_name}}</strong> workspace subscription is scheduled to renew automatically on <strong>{{renewal_date}}</strong>.</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;"><div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #475569; font-size: 14px;"><span>Billing Period:</span><strong>Monthly Recurring</strong></div><div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #475569; font-size: 14px;"><span>Payment Method:</span><strong>Card ending in {{card_last4}}</strong></div><div style="display: flex; justify-content: space-between; font-size: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #0f172a;"><span>Estimated Charge:</span><strong style="color: #4f46e5;">{{amount}}</strong></div></div><div style="text-align: center;"><a href="{{billing_url}}" style="background: #4f46e5; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; display: inline-block;">Manage Billing Settings →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Subscription Renewal Notice", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px; line-height: 1.6;\">Your <strong>{{plan_name}}</strong> workspace subscription is scheduled to renew automatically on <strong>{{renewal_date}}</strong>.</p>", padding: "10px 30px" } },
                  { type: "text", values: { text: "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;\"><div style=\"margin-bottom: 8px;\">Payment Method: <strong>Card ending in {{card_last4}}</strong></div><div style=\"font-size: 18px; color: #0f172a;\">Estimated Charge: <strong style=\"color: #4f46e5;\">{{amount}}</strong></div></div>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Manage Billing Settings →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#4f46e5", hoverColor: "#FFFFFF", hoverBackgroundColor: "#3730a3" }, padding: "14px 28px", borderRadius: "6px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'team_invite',
    title: 'Workspace Invitation & Role Assignment',
    description: 'Professional invitation email to join an enterprise workspace or organization.',
    category: 'marketing',
    tag: 'Onboarding',
    badge: 'Invite',
    color: '#0D9488',
    previewBg: 'linear-gradient(135deg, #115e59 0%, #0f766e 50%, #0d9488 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 20px;"><span style="background: #ccfbf1; color: #0f766e; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px;">WORKSPACE INVITATION</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 16px;">You've Been Invited</h1><p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 24px;"><strong>{{inviter_name}}</strong> has invited you to collaborate in the <strong>{{workspace_name}}</strong> workspace as an <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #0f172a; font-weight: 600;">{{role}}</span>.</p><div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 16px 20px; margin-bottom: 28px; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">&ldquo;We're configuring our automated workflows and API channels. Looking forward to having you on the team!&rdquo;</p></div><div style="text-align: center;"><a href="{{invite_url}}" style="background: #0d9488; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; display: inline-block;">Accept Invitation &rarr;</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "You've Been Invited", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 16px; line-height: 1.6;\"><strong>{{inviter_name}}</strong> has invited you to collaborate in the <strong>{{workspace_name}}</strong> workspace as an <strong>{{role}}</strong>.</p>", padding: "10px 30px" } },
                  { type: "text", values: { text: "<div style=\"background: #f8fafc; border-left: 4px solid #0d9488; padding: 16px 20px; border-radius: 0 8px 8px 0;\"><p style=\"margin: 0; color: #334155; font-size: 14px;\">&ldquo;Looking forward to collaborating on our email infrastructure!&rdquo;</p></div>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Accept Invitation &rarr;</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#0d9488", hoverColor: "#FFFFFF", hoverBackgroundColor: "#0f766e" }, padding: "14px 32px", borderRadius: "6px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'api_limit_warning',
    title: 'API Quota & Usage Limit Alert',
    description: 'Automated telemetry alert alerting engineers when account API consumption reaches 85% or 90%.',
    category: 'transactional',
    tag: 'Alerts',
    badge: 'System',
    color: '#E11D48',
    previewBg: 'linear-gradient(135deg, #881337 0%, #9f1239 50%, #e11d48 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;"><span style="background: #ffe4e6; color: #9f1239; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 11px;">⚠️ QUOTA THRESHOLD EXCEEDED</span></div><h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">85% API Quota Reached</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Your project <strong>{{project_name}}</strong> has consumed 85% of its monthly allocated email API requests in the current billing cycle.</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px;"><div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #334155;"><span>Current Consumption</span><span>85,420 / 100,000 reqs</span></div><div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;"><div style="width: 85.4%; height: 100%; background: #e11d48;"></div></div></div><div style="display: flex; gap: 12px;"><a href="{{dashboard_url}}" style="background: #e11d48; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; display: inline-block;">Upgrade Tier Quota →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "85% API Quota Reached", headingType: "h1", textAlign: "left", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"color: #64748b; font-size: 15px; line-height: 1.6;\">Your project <strong>{{project_name}}</strong> has consumed 85% of its monthly allocated email API requests in the current billing cycle.</p>", padding: "10px 20px" } },
                  { type: "text", values: { text: "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;\"><div style=\"margin-bottom: 8px; font-weight: 600; color: #334155;\">Current Consumption: 85,420 / 100,000 reqs</div></div>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>Upgrade Tier Quota →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#e11d48", hoverColor: "#FFFFFF", hoverBackgroundColor: "#9f1239" }, padding: "14px 28px", borderRadius: "6px", textAlign: "left" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'weekly_analytics',
    title: 'Weekly Telemetry & Performance Report',
    description: 'Data-driven weekly summary report highlighting key project metrics and system uptime.',
    category: 'marketing',
    tag: 'Newsletters',
    badge: 'Report',
    color: '#6366F1',
    previewBg: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 16px;"><span style="background: #e0e7ff; color: #4338ca; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 11px;">WEEKLY TELEMETRY</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 8px;">System Performance Summary</h1><p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 28px;">Weekly overview for workspace: <strong>{{workspace_name}}</strong></p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px;"><div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: center;"><span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">DELIVERY UPTIME</span><strong style="font-size: 22px; color: #10b981;">99.99%</strong></div><div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: center;"><span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">AVG LATENCY</span><strong style="font-size: 22px; color: #6366f1;">42ms</strong></div><div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: center;"><span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">DISPATCHED MAILS</span><strong style="font-size: 22px; color: #0f172a;">1,428,910</strong></div><div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: center;"><span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">BOUNCE RATE</span><strong style="font-size: 22px; color: #0f172a;">0.08%</strong></div></div><div style="text-align: center;"><a href="{{analytics_url}}" style="background: #6366f1; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; display: inline-block;">View Deep Analytics Dashboard →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "System Performance Summary", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 14px;\">Weekly overview for workspace: <strong>{{workspace_name}}</strong></p>", padding: "0 20px 20px 20px" } },
                  { type: "text", values: { text: "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center;\"><p style=\"margin: 0; font-size: 16px; color: #0f172a;\">Delivery Uptime: <strong style=\"color: #10b981;\">99.99%</strong> | Avg Latency: <strong style=\"color: #6366f1;\">42ms</strong></p></div>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>View Deep Analytics Dashboard →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#6366f1", hoverColor: "#FFFFFF", hoverBackgroundColor: "#4338ca" }, padding: "14px 28px", borderRadius: "6px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'customer_feedback',
    title: 'CSAT & Product Feedback Survey',
    description: 'Clean 1-click customer satisfaction survey to gather actionable product insights.',
    category: 'marketing',
    tag: 'Promotions',
    badge: 'Survey',
    color: '#D97706',
    previewBg: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #d97706 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;"><div style="background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; margin-bottom: 20px;">1-CLICK FEEDBACK</div><h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">How was your experience?</h2><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">We're constantly optimizing our developer APIs and automation builder. How satisfied are you with our latest platform update?</p><div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 28px;"><a href="{{survey_url}}?score=1" style="width: 44px; height: 44px; line-height: 44px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 700; color: #0f172a; font-size: 16px; display: inline-block;">1</a><a href="{{survey_url}}?score=2" style="width: 44px; height: 44px; line-height: 44px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 700; color: #0f172a; font-size: 16px; display: inline-block;">2</a><a href="{{survey_url}}?score=3" style="width: 44px; height: 44px; line-height: 44px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 700; color: #0f172a; font-size: 16px; display: inline-block;">3</a><a href="{{survey_url}}?score=4" style="width: 44px; height: 44px; line-height: 44px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-decoration: none; font-weight: 700; color: #0f172a; font-size: 16px; display: inline-block;">4</a><a href="{{survey_url}}?score=5" style="width: 44px; height: 44px; line-height: 44px; background: #d97706; border: 1px solid #d97706; border-radius: 8px; text-decoration: none; font-weight: 700; color: #ffffff; font-size: 16px; display: inline-block;">5</a></div><p style="color: #94a3b8; font-size: 13px; margin: 0;">Scale: 1 (Unsatisfied) to 5 (Extremely Satisfied)</p></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "How was your experience?", headingType: "h2", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px; line-height: 1.6;\">We're constantly optimizing our developer APIs and automation builder. How satisfied are you with our latest platform update?</p>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>Share Feedback (2 mins) →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#d97706", hoverColor: "#FFFFFF", hoverBackgroundColor: "#92400e" }, padding: "14px 28px", borderRadius: "8px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'account_suspension',
    title: 'Action Required: Compliance Verification',
    description: 'High-priority compliance notification requiring immediate action to prevent service interruption.',
    category: 'transactional',
    tag: 'Alerts',
    badge: 'Urgent',
    color: '#DC2626',
    previewBg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #fca5a5;"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;"><span style="background: #fee2e2; color: #b91c1c; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 11px;">ACTION REQUIRED</span></div><h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Verify Sender Domain Identity</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">To maintain compliance with DMARC and SPF sending policies, we require periodic verification of your registered sending domain <strong>{{sender_domain}}</strong>.</p><div style="background: #fff5f5; border: 1px solid #fecaca; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px; color: #991b1b; font-size: 14px; font-weight: 600;">Deadline: Complete domain TXT verification within 72 hours to avoid outgoing mail throttling.</div><a href="{{verify_url}}" style="background: #dc2626; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; display: inline-block;">Complete DNS Verification →</a></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Verify Sender Domain Identity", headingType: "h1", textAlign: "left", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"color: #64748b; font-size: 15px; line-height: 1.6;\">To maintain compliance with DMARC and SPF sending policies, we require periodic verification of your registered sending domain <strong>{{sender_domain}}</strong>.</p>", padding: "10px 20px" } },
                  { type: "text", values: { text: "<div style=\"background: #fff5f5; border: 1px solid #fecaca; padding: 16px 20px; border-radius: 8px; color: #991b1b; font-size: 14px; font-weight: 600;\">Deadline: Complete domain TXT verification within 72 hours.</div>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>Complete DNS Verification →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#dc2626", hoverColor: "#FFFFFF", hoverBackgroundColor: "#991b1b" }, padding: "14px 28px", borderRadius: "6px", textAlign: "left" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #fca5a5", bottom: "1px solid #fca5a5", left: "1px solid #fca5a5", right: "1px solid #fca5a5" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'webinar_invitation',
    title: 'Technical Deep Dive: Live Engineering Webinar',
    description: 'Structured event invitation with agenda breakdown, speaker info, and calendar sync link.',
    category: 'marketing',
    tag: 'Newsletters',
    badge: 'Event',
    color: '#7C3AED',
    previewBg: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 20px;"><span style="background: #f3e8ff; color: #6b21a8; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px;">ENGINEERING LIVE SESSION</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 14px;">High-Throughput Caching with Redis & BullMQ</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">Join our Lead Distributed Systems Engineer for an interactive 45-minute architectural deep dive.</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;"><div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span>Date & Time:</span><strong>Thu, Aug 14 at 10:00 AM PT</strong></div><div style="display: flex; justify-content: space-between; font-size: 14px;"><span>Speaker:</span><strong>Sarah Jenkins (Principal Tech Lead)</strong></div></div><div style="text-align: center;"><a href="{{register_url}}" style="background: #7c3aed; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; display: inline-block;">Reserve Your Seat →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "High-Throughput Caching with Redis & BullMQ", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px; line-height: 1.6;\">Join our Lead Distributed Systems Engineer for an interactive 45-minute architectural deep dive.</p>", padding: "10px 30px" } },
                  { type: "text", values: { text: "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;\"><div style=\"font-size: 14px;\">Date & Time: <strong>Thu, Aug 14 at 10:00 AM PT</strong></div></div>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Reserve Your Seat →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#7c3aed", hoverColor: "#FFFFFF", hoverBackgroundColor: "#5b21b6" }, padding: "14px 32px", borderRadius: "6px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'webhook_failure',
    title: 'Webhook Delivery Failure Diagnostic',
    description: 'Real-time developer diagnostic alert alerting when endpoint webhook attempts fail consecutively.',
    category: 'transactional',
    tag: 'Alerts',
    badge: 'DevOps',
    color: '#EA580C',
    previewBg: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #ea580c 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;"><span style="background: #ffedd5; color: #9a3412; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 11px;">🔴 WEBHOOK DISPATCH ERROR</span></div><h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Delivery Failed (HTTP 502)</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">We attempted to deliver event payload <strong>{{event_type}}</strong> to your registered target endpoint but received an upstream server error.</p><div style="background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; margin-bottom: 24px; overflow-x: auto;">POST https://api.client.app/v1/webhooks/zepto<br>Status: 502 Bad Gateway | Retries: 4/4 (Exhausted)</div><a href="{{dlq_url}}" style="background: #ea580c; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; display: inline-block;">Inspect Dead Letter Queue →</a></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Delivery Failed (HTTP 502)", headingType: "h1", textAlign: "left", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"color: #64748b; font-size: 15px; line-height: 1.6;\">We attempted to deliver event payload <strong>{{event_type}}</strong> to your registered target endpoint but received an upstream server error.</p>", padding: "10px 20px" } },
                  { type: "text", values: { text: "<div style=\"background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px;\">POST https://api.client.app/v1/webhooks/zepto<br>Status: 502 Bad Gateway | Retries Exhausted</div>", padding: "10px 20px" } },
                  { type: "button", values: { text: "<strong>Inspect Dead Letter Queue →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#ea580c", hoverColor: "#FFFFFF", hoverBackgroundColor: "#9a3412" }, padding: "14px 28px", borderRadius: "6px", textAlign: "left" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
              }
            ],
            values: { backgroundColor: "#f8fafc", padding: "40px 20px" }
          }
        ]
      }
    }
  },
  {
    id: 'feature_deprecation',
    title: 'SDK Deprecation & Migration Roadmap',
    description: 'Engineering advisory notice outlining upcoming SDK version sunset dates and migration steps.',
    category: 'marketing',
    tag: 'Onboarding',
    badge: 'Advisory',
    color: '#0284C7',
    previewBg: 'linear-gradient(135deg, #075985 0%, #0369a1 50%, #0284c7 100%)',
    html: `<div style="font-family: 'Host Grotesk', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><div style="text-align: center; margin-bottom: 20px;"><span style="background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px;">DEVELOPER ROADMAP</span></div><h1 style="color: #0f172a; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 14px;">Sunsetting SDK v1.x Series</h1><p style="color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">As part of our continuous performance upgrades, support for Node SDK v1.x will conclude on <strong>October 31st</strong>. Please migrate to v2.4 LTS.</p><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-family: monospace; font-size: 14px; color: #0f172a; text-align: center;">npm install @getaipilot/sdk@latest</div><div style="text-align: center;"><a href="{{migration_guide}}" style="background: #0284c7; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; display: inline-block;">Read v2.0 Migration Guide →</a></div></div>`,
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  { type: "heading", values: { text: "Sunsetting SDK v1.x Series", headingType: "h1", textAlign: "center", color: "#0f172a", padding: "20px 20px 10px 20px" } },
                  { type: "text", values: { text: "<p style=\"text-align: center; color: #64748b; font-size: 15px; line-height: 1.6;\">As part of our continuous performance upgrades, support for Node SDK v1.x will conclude on <strong>October 31st</strong>. Please migrate to v2.4 LTS.</p>", padding: "10px 30px" } },
                  { type: "text", values: { text: "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 14px; color: #0f172a; text-align: center;\">npm install @getaipilot/sdk@latest</div>", padding: "10px 30px" } },
                  { type: "button", values: { text: "<strong>Read v2.0 Migration Guide →</strong>", buttonColors: { color: "#FFFFFF", backgroundColor: "#0284c7", hoverColor: "#FFFFFF", hoverBackgroundColor: "#0369a1" }, padding: "14px 32px", borderRadius: "6px", textAlign: "center" } }
                ],
                values: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: { top: "1px solid #e2e8f0", bottom: "1px solid #e2e8f0", left: "1px solid #e2e8f0", right: "1px solid #e2e8f0" } }
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

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
    <>
    <div className="template-manager" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--background)', color: 'var(--ink)' }}>
      
      {/* Top Hero Header */}
      <div style={{ 
        padding: '36px 48px 24px',
        background: 'var(--background)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                Template Studio
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>Message Templates</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.925rem' }}>
              Design, organize, and version-control responsive email & broadcast templates across all your channels.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px -2px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(79, 70, 229, 0.6)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(79, 70, 229, 0.5)'; }}
          >
            <Plus size={18} /> New Template
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '32px 48px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Platform Tabs & Filter Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          
          {/* Platform Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Platforms', count: platformCounts.all },
              { id: 'getaipilot', label: 'GetAiPilot', count: platformCounts.getaipilot },
              { id: 'socialpilot', label: 'SocialPilot', count: platformCounts.socialpilot },
              { id: 'whatsapp', label: 'GAP WhatsApp', count: platformCounts.whatsapp },
              { id: 'general', label: 'SuperMailBox / General', count: platformCounts.general },
            ].map((tab) => {
              const isActive = selectedPlatform === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setSelectedPlatform(tab.id as any)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.825rem',
                    fontWeight: isActive ? 600 : 500,
                    borderRadius: '6px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: isActive ? 'var(--primary)' : 'var(--surface)',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? '0 2px 6px rgba(79, 70, 229, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                  <span style={{ 
                    fontSize: '0.72rem', 
                    padding: '1px 6px', 
                    borderRadius: '4px', 
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--surface-muted)', 
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 600
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Category Dropdown */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: '380px', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="ui-input"
                placeholder="Search templates by name, key..." 
                style={{ 
                  width: '100%', 
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-muted)',
                  color: 'var(--ink)',
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
                padding: '8px 14px',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--surface-muted)',
                color: 'var(--ink)',
                fontWeight: 500,
                cursor: 'pointer',
                minWidth: '160px'
              }}
            >
              <option value="all">All Categories</option>
              <option value="transactional">Transactional</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>

        {/* Templates Table Container */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginBottom: '40px' }}>
          
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 2.5fr 1fr 1fr 100px', 
            padding: '14px 28px', 
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-muted)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div>Template Name</div>
            <div>Category</div>
            <div>Subject & Key</div>
            <div>Versions</div>
            <div>Last Modified</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Body Container with internal scroll limit */}
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
            {paginatedTemplates.map((template, index) => {
              const liveVersion = template.versions.find(v => v.status === 'Live') || template.versions[0];
              const isLast = index === filteredTemplates.length - 1;
              const platform = getPlatform(template);
              
              return (
                <div 
                  key={template.key} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 2.5fr 1fr 1fr 100px', 
                    padding: '18px 28px', 
                    alignItems: 'center',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }} 
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                  onClick={() => setPreviewTemplate(template)}
                >
                  
                  {/* Name & Platform Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
                        {template.name || template.key}
                      </span>
                    </div>
                    <div>
                      {platform === 'whatsapp' ? (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(37, 211, 102, 0.12)', color: '#16a34a', fontWeight: 600, border: '1px solid rgba(37, 211, 102, 0.2)' }}>WhatsApp</span>
                      ) : platform === 'socialpilot' ? (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.12)', color: '#6366f1', fontWeight: 600, border: '1px solid rgba(79, 70, 229, 0.2)' }}>SocialPilot</span>
                      ) : platform === 'getaipilot' ? (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}>GetAiPilot</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-muted)', color: 'var(--text-secondary)', fontWeight: 600, border: '1px solid var(--border)' }}>Email</span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      background: template.category === 'marketing' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: template.category === 'marketing' ? '#db2777' : '#059669',
                      border: template.category === 'marketing' ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      {template.category === 'marketing' ? 'Marketing' : 'Transactional'}
                    </span>
                  </div>

                  {/* Subject & Key */}
                  <div style={{ paddingRight: '20px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>
                      {liveVersion?.subject || 'No subject set'}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {template.key}
                    </div>
                  </div>

                  {/* Versions */}
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, background: 'var(--surface-muted)', color: 'var(--text-secondary)' }}>
                       <Clock size={13} color="var(--text-muted)" /> {template.versions.length} {template.versions.length === 1 ? 'version' : 'versions'}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {liveVersion?.date?.split(' ')[0] || 'Unknown'}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditTemplate(template.key); }} 
                      style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      title="Edit Template Design"
                    >
                      <Edit2 size={15} />
                    </button>
                    {onDeleteTemplate && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteTemplate(template.key); }} 
                        style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        title="Delete Template"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

            {/* Table Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-muted)' }}>
              <div>Showing {filteredTemplates.length} of {templates.length} total templates</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span> Active Broadcast Ready
              </div>
            </div>
          </div>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-secondary)', background: 'var(--surface)', borderRadius: '6px', border: '1px dashed var(--border)', margin: '20px 0' }}>
            <Layers size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto', color: 'var(--primary)' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>No templates found</h4>
            <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 24px auto' }}>We couldn't find any message templates matching your current filter or search query.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedPlatform('all'); setSelectedCategory('all'); }} style={{ padding: '8px 16px', borderRadius: '6px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Pre-built Templates Gallery & Creation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 12, 0.82)', backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => { setShowCreateModal(false); setSelectedPrebuilt(null); }}
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                width: '100%', 
                maxWidth: '1240px', 
                height: '88vh', 
                maxHeight: '880px', 
                background: 'var(--surface)', 
                borderRadius: '8px', 
                border: '1px solid var(--border)', 
                display: 'flex', 
                flexDirection: 'column', 
                boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.5)', 
                overflow: 'hidden' 
              }}
            >
              {/* Clean Minimal Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--surface-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
                    <Layout size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 650, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>Create Message Template</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Choose a starting template or build from an empty canvas.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowCreateModal(false); setSelectedPrebuilt(null); }} 
                  style={{ background: 'transparent', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '6px', transition: 'all 0.15s ease' }} 
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--surface-muted)'; }} 
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                  title="Close Gallery"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Minimalist Filter & Search Toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '12px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { id: 'all', label: 'All Templates' },
                    { id: 'marketing', label: 'Marketing' },
                    { id: 'transactional', label: 'Transactional' },
                    { id: 'Onboarding', label: 'Onboarding' },
                    { id: 'Newsletters', label: 'Newsletters' },
                    { id: 'Alerts', label: 'Alerts' },
                    { id: 'Receipts', label: 'Receipts' },
                    { id: 'Promotions', label: 'Promotions' },
                    { id: 'Security', label: 'Security' },
                    { id: 'Blank', label: 'Blank Canvas' }
                  ].map(tab => {
                    const isActive = galleryCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGalleryCategory(tab.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 600 : 500,
                          border: isActive ? '1px solid var(--ink)' : '1px solid transparent',
                          background: isActive ? 'var(--ink)' : 'transparent',
                          color: isActive ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-muted)'; }}
                        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ position: 'relative', width: '240px', flexShrink: 0 }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '0.8rem', borderRadius: '6px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Scrollable Templates Gallery Grid (Visual Previews, No Text Paragraphs!) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 32px', background: '#F8FAFC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                  {PREBUILT_TEMPLATES.filter(t => {
                    const matchesSearch = t.title.toLowerCase().includes(gallerySearch.toLowerCase()) || t.description.toLowerCase().includes(gallerySearch.toLowerCase()) || t.tag.toLowerCase().includes(gallerySearch.toLowerCase());
                    const matchesCat = galleryCategory === 'all' || t.category === galleryCategory || t.tag === galleryCategory;
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
                          borderRadius: '6px',
                          border: isSelected ? '2px solid var(--ink)' : '1px solid var(--border)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = 'var(--text-muted)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        {/* Live Visual Preview Thumbnail - Mathematically Centered! */}
                        <div style={{ 
                          height: '210px', 
                          background: '#F1F5F9', 
                          borderBottom: '1px solid var(--border)', 
                          position: 'relative', 
                          overflow: 'hidden' 
                        }}>
                          {tmpl.id === 'blank_canvas' ? (
                            <div style={{
                              position: 'absolute',
                              top: '18px',
                              left: '6%',
                              width: '88%',
                              height: '174px',
                              background: '#ffffff',
                              border: '1px dashed var(--border)',
                              borderRadius: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted)',
                              gap: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}>
                              <Layout size={24} style={{ opacity: 0.5 }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Empty Canvas</span>
                            </div>
                          ) : (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '50%',
                              width: '560px',
                              height: '420px',
                              marginLeft: '-126px',
                              transform: 'scale(0.45)',
                              transformOrigin: '0 0',
                              pointerEvents: 'none',
                              background: '#ffffff',
                              borderRadius: '8px',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                              border: '1px solid #E2E8F0',
                              overflow: 'hidden'
                            }}>
                              <iframe
                                srcDoc={tmpl.html}
                                title={tmpl.title}
                                scrolling="no"
                                tabIndex={-1}
                                style={{
                                  width: '560px',
                                  height: '420px',
                                  border: 'none',
                                  pointerEvents: 'none',
                                  background: '#ffffff'
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Ultra-Minimal Footer Bar - 2 Lines for Title & Tag in Separator Row! */}
                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--surface)', flex: 1 }}>
                          <h4 style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 650, 
                            color: 'var(--ink)', 
                            margin: '0 0 12px 0', 
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '34px'
                          }}>
                            {tmpl.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {tmpl.tag}
                            </span>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'var(--ink)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                              {isSelected ? (
                                <>
                                  <CheckCircle2 size={14} style={{ color: 'var(--ink)' }} />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <span>Select &rarr;</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Minimal Bottom Launch Dock */}
              <div style={{ 
                padding: '16px 28px', 
                background: 'var(--surface)', 
                borderTop: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '20px', 
                boxShadow: '0 -4px 16px rgba(0,0,0,0.03)' 
              }}>
                {selectedPrebuilt ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', display: 'block' }}>Selected Design</span>
                      <strong style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--ink)' }}>{selectedPrebuilt.title}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 500 }}>
                    <span>Select a template from the gallery to continue.</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px', maxWidth: '260px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>Template Name</label>
                    <input
                      type="text"
                      disabled={!selectedPrebuilt}
                      value={newTmplName}
                      onChange={(e) => {
                        setNewTmplName(e.target.value);
                        setNewTmplKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                      }}
                      placeholder="e.g. Onboarding Welcome v2"
                      className="ui-input"
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '0.825rem', 
                        fontWeight: 500,
                        width: '100%', 
                        borderRadius: '6px', 
                        height: '34px', 
                        border: '1px solid var(--border)',
                        background: selectedPrebuilt ? 'var(--surface)' : 'var(--surface-muted)', 
                        color: 'var(--ink)',
                        boxSizing: 'border-box' 
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px', maxWidth: '260px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>Unique Key</label>
                    <input
                      type="text"
                      disabled={!selectedPrebuilt}
                      value={newTmplKey}
                      onChange={(e) => setNewTmplKey(e.target.value)}
                      placeholder="onboarding_welcome_v2"
                      className="ui-input"
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '0.825rem', 
                        fontFamily: 'var(--font-mono)', 
                        width: '100%', 
                        borderRadius: '6px', 
                        height: '34px', 
                        border: '1px solid var(--border)',
                        background: selectedPrebuilt ? 'var(--surface)' : 'var(--surface-muted)', 
                        color: 'var(--ink)',
                        boxSizing: 'border-box' 
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '140px', flexShrink: 0 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>Category</label>
                    <select
                      disabled={!selectedPrebuilt}
                      value={newTmplCategory}
                      onChange={(e) => setNewTmplCategory(e.target.value)}
                      className="ui-input"
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '0.825rem', 
                        fontWeight: 500,
                        width: '100%', 
                        borderRadius: '6px', 
                        height: '34px', 
                        cursor: selectedPrebuilt ? 'pointer' : 'not-allowed', 
                        border: '1px solid var(--border)',
                        background: selectedPrebuilt ? 'var(--surface)' : 'var(--surface-muted)', 
                        color: 'var(--ink)',
                        boxSizing: 'border-box' 
                      }}
                    >
                      <option value="transactional">Transactional</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div style={{ height: '34px', display: 'flex', alignItems: 'flex-end', marginLeft: '4px' }}>
                    <button
                      disabled={!selectedPrebuilt || !newTmplName.trim()}
                      onClick={handleCreateNewTemplate}
                      style={{
                        padding: '0 18px',
                        height: '34px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: selectedPrebuilt && newTmplName.trim() ? 'var(--ink)' : 'var(--surface-muted)',
                        color: selectedPrebuilt && newTmplName.trim() ? '#FFFFFF' : 'var(--text-muted)',
                        border: selectedPrebuilt && newTmplName.trim() ? 'none' : '1px solid var(--border)',
                        cursor: selectedPrebuilt && newTmplName.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        if (selectedPrebuilt && newTmplName.trim()) {
                          e.currentTarget.style.opacity = '0.9';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedPrebuilt && newTmplName.trim()) {
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      <span>Create & Start Editing &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 12, 0.82)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} 
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              style={{ width: '100%', maxWidth: '960px', height: '86vh', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)', overflow: 'hidden' }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--surface-muted)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Live Preview</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{previewTemplate.name || previewTemplate.key}</h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{previewTemplate.key}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { onEditTemplate(previewTemplate.key); setPreviewTemplate(null); }} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)', transition: 'all 0.15s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <Edit2 size={15} /> Open in Unlayer Studio &rarr;
                  </button>
                  <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
                  <button 
                    onClick={() => setPreviewTemplate(null)} 
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', width: '34px', height: '34px', borderRadius: '6px', transition: 'all 0.15s ease' }} 
                    onMouseOver={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }} 
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    title="Close Preview"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div style={{ flex: 1, background: 'var(--background)', padding: '32px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '720px', height: '100%', background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  {(() => {
                    const liveVersion = previewTemplate.versions.find((v) => v.status === 'Live') || previewTemplate.versions[0];
                    if (liveVersion && liveVersion.html) {
                      return <AutoScalingPreview html={liveVersion.html} />;
                    } else {
                      return (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: '#64748b' }}>
                          <FileText size={54} style={{ opacity: 0.4, margin: '0 auto 16px auto', color: '#3b82f6' }} />
                          <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, margin: '0 0 8px 0' }}>No HTML content yet</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>This template is currently empty. Click "Open in Unlayer Studio" to start building it.</p>
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
    </>
  );
};
