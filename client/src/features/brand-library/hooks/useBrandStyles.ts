import { useState, useEffect, useCallback } from 'react';
import { brandService } from '../services/brand.service';
import type { BrandStyles } from '../types/brand.types';

export const DEFAULT_STYLES: BrandStyles = {
  primary_color: '#6366F1',
  secondary_color: '#4F46E5',
  accent_color: '#10B981',
  background_color: '#F8FAFC',
  text_color: '#0F172A',
  muted_text_color: '#64748B',
  link_color: '#6366F1',
  button_color: '#6366F1',
  button_text_color: '#FFFFFF',
  border_color: '#E2E8F0',
  font_heading: "Host Grotesk, -apple-system, sans-serif",
  font_body: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  default_border_radius: '8px',
  default_email_width: '600px',
  default_logo_width: '160px',
  default_spacing_scale: 'normal',
};

export function useBrandStyles(brandId?: string) {
  const [styles, setStyles] = useState<BrandStyles>(DEFAULT_STYLES);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStyles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await brandService.getStyles(brandId);
      setStyles(data || DEFAULT_STYLES);
    } catch (err: any) {
      setError(err.message || 'Could not load brand style tokens.');
      setStyles(DEFAULT_STYLES);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const saveStyles = useCallback(async (newTokens: Partial<BrandStyles>) => {
    setSaving(true);
    setError(null);
    try {
      const merged = { ...styles, ...newTokens };
      const updated = await brandService.updateStyles(merged, brandId);
      setStyles(updated);
      return updated;
    } catch (err: any) {
      const msg = err.message || 'Could not save brand styles.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, [styles, brandId]);

  const resetToDefaults = useCallback(async () => {
    return saveStyles(DEFAULT_STYLES);
  }, [saveStyles]);

  return {
    styles,
    loading,
    saving,
    error,
    saveStyles,
    resetToDefaults,
    refreshStyles: fetchStyles,
  };
}
