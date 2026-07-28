import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, Save, Check, Type, Layout, ShieldAlert, AlertCircle } from 'lucide-react';
import { useBrandStyles, DEFAULT_STYLES } from '../hooks/useBrandStyles';
import { brandStylesSchema } from '../schemas/brand.schema';
import type { BrandStyles } from '../types/brand.types';

interface BrandStyleEditorProps {
  brandId?: string;
}

export const BrandStyleEditor: React.FC<BrandStyleEditorProps> = ({ brandId }) => {
  const { styles, loading, saving, error: hookError, saveStyles, resetToDefaults } = useBrandStyles(brandId);
  const [tokens, setTokens] = useState<BrandStyles>(DEFAULT_STYLES);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (styles) setTokens(styles);
  }, [styles]);

  const handleChange = (field: keyof BrandStyles, val: string) => {
    setTokens(prev => ({ ...prev, [field]: val }));
    setSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const valRes = brandStylesSchema.safeParse(tokens);
    if (!valRes.success) {
      setError(valRes.error.issues[0].message);
      return;
    }

    try {
      await saveStyles(tokens);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Could not save brand styles.');
    }
  };

  const handleReset = async () => {
    setError(null);
    try {
      const defs = await resetToDefaults();
      setTokens(defs);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Could not reset styles.');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading brand design tokens...</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Controls */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            Brand Design Tokens & Typography Scale
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define harmonious color palettes, font stacks, and layout defaults. These tokens automatically apply across your email templates and builder canvases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Reset to Host Grotesk & Indigo defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Tokens...' : 'Save Design Tokens'}</span>
          </button>
        </div>
      </div>

      {(error || hookError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-red-700 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || hookError}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-slideDown">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Brand design tokens saved successfully!</span>
        </div>
      )}

      {/* Main Form & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Form Columns (2 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Color Palette */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Palette className="w-4 h-4 text-indigo-500" />
              Color Palette Swatches
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Primary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Color (CTA / Highlights)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={tokens.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    maxLength={7}
                    required
                  />
                </div>
              </div>

              {/* Secondary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Color (Accents / Borders)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={tokens.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    maxLength={7}
                    required
                  />
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={tokens.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    maxLength={7}
                    required
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.text_color}
                    onChange={(e) => handleChange('text_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={tokens.text_color}
                    onChange={(e) => handleChange('text_color', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    maxLength={7}
                    required
                  />
                </div>
              </div>

              {/* Muted Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Muted Text / Footers Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.muted_text_color}
                    onChange={(e) => handleChange('muted_text_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={tokens.muted_text_color}
                    onChange={(e) => handleChange('muted_text_color', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    maxLength={7}
                    required
                  />
                </div>
              </div>

              {/* Link Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hyperlinks & Anchor Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.link_color}
                    onChange={(e) => handleChange('link_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={tokens.link_color}
                    onChange={(e) => handleChange('link_color', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    maxLength={7}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Typography & Spacing */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Type className="w-4 h-4 text-purple-500" />
              Typography Stacks & Layout Dimensions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Heading Typography Stack</label>
                <input
                  type="text"
                  value={tokens.font_heading}
                  onChange={(e) => handleChange('font_heading', e.target.value)}
                  placeholder="Host Grotesk, -apple-system, sans-serif"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Body Typography Stack</label>
                <input
                  type="text"
                  value={tokens.font_body}
                  onChange={(e) => handleChange('font_body', e.target.value)}
                  placeholder="-apple-system, BlinkMacSystemFont, Roboto, sans-serif"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Email Container Width</label>
                <select
                  value={tokens.default_email_width}
                  onChange={(e) => handleChange('default_email_width', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="600px">600px (Industry Standard)</option>
                  <option value="640px">640px (Wide Desktop Focus)</option>
                  <option value="560px">560px (Compact Mobile)</option>
                  <option value="680px">680px (Newsletter Large)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Border Radius</label>
                <select
                  value={tokens.default_border_radius}
                  onChange={(e) => handleChange('default_border_radius', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="8px">8px (Modern Standard)</option>
                  <option value="4px">4px (Professional / Subtle)</option>
                  <option value="12px">12px (Rounded Contemporary)</option>
                  <option value="0px">0px (Sharp Corporate)</option>
                  <option value="16px">16px (Extra Rounded)</option>
                </select>
              </div>
            </div>
          </div>

        </form>

        {/* Live Preview Panel (Right Col) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layout className="w-4 h-4 text-indigo-500" />
              Live Email Component Preview
            </h3>

            {/* Email Preview Card Box */}
            <div 
              className="mt-4 p-6 rounded-2xl border transition duration-300 shadow-sm overflow-hidden"
              style={{
                backgroundColor: tokens.background_color,
                borderColor: tokens.border_color,
                color: tokens.text_color,
                fontFamily: tokens.font_body,
                borderRadius: tokens.default_border_radius,
              }}
            >
              {/* Fake Header */}
              <div className="pb-4 border-b mb-4 flex items-center justify-between" style={{ borderColor: tokens.border_color }}>
                <span className="text-sm font-extrabold tracking-tight" style={{ color: tokens.primary_color, fontFamily: tokens.font_heading }}>
                  SUPERMAIL BOX
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded" style={{ backgroundColor: tokens.secondary_color + '20', color: tokens.secondary_color }}>
                  Preview
                </span>
              </div>

              {/* Fake Body */}
              <div className="space-y-3 text-xs leading-relaxed">
                <h4 className="text-base font-bold" style={{ color: tokens.text_color, fontFamily: tokens.font_heading }}>
                  Welcome to Your New Brand System!
                </h4>
                <p>
                  This dynamic preview renders in real-time as you modify your brand color swatches, font stacks, and layout dimensions.
                </p>
                <p style={{ color: tokens.muted_text_color }}>
                  All transactional receipts and marketing campaigns will automatically inherit these visual tokens.
                </p>

                {/* Fake CTA Button */}
                <div className="pt-3">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 font-bold text-xs transition shadow-sm"
                    style={{
                      backgroundColor: tokens.primary_color,
                      color: tokens.button_text_color,
                      borderRadius: tokens.default_border_radius,
                    }}
                  >
                    Verify Account & Get Started →
                  </button>
                </div>
              </div>

              {/* Fake Footer */}
              <div className="mt-6 pt-4 border-t text-[10px] text-center space-y-1" style={{ borderColor: tokens.border_color, color: tokens.muted_text_color }}>
                <p>© 2026 SuperMail Box CPaaS. All rights reserved.</p>
                <p>
                  <a href="#link" style={{ color: tokens.link_color }}>Unsubscribe</a> • <a href="#link" style={{ color: tokens.link_color }}>Preferences</a>
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 block mb-0.5">💡 Token Usage in Templates</span>
              Use <span className="font-mono text-indigo-600 bg-white px-1 py-0.5 rounded border border-slate-200">{'{{brand.primary_color}}'}</span> or <span className="font-mono text-indigo-600 bg-white px-1 py-0.5 rounded border border-slate-200">{'{{brand.font_heading}}'}</span> in custom HTML to bind to these styles dynamically.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
