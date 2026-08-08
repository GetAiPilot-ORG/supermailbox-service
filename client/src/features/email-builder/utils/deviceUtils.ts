import type { EmailBlock, PreviewDevice } from '../types/document.types';

export function mergeStyles(
  baseStyle: Record<string, any> = {},
  tabletStyle?: Record<string, any>,
  mobileStyle?: Record<string, any>,
  device: PreviewDevice = 'desktop'
): Record<string, any> {
  if (device === 'desktop') {
    return { ...baseStyle };
  }
  if (device === 'tablet') {
    return { ...baseStyle, ...(tabletStyle || {}) };
  }
  if (device === 'mobile') {
    return { ...baseStyle, ...(tabletStyle || {}), ...(mobileStyle || {}) };
  }
  return { ...baseStyle };
}

export function isDeviceStyleOverridden(
  block: EmailBlock,
  property: string,
  device: 'tablet' | 'mobile'
): boolean {
  if (device === 'tablet') {
    return Boolean(block.tabletStyle && property in block.tabletStyle);
  }
  if (device === 'mobile') {
    return Boolean(block.mobileStyle && property in block.mobileStyle);
  }
  return false;
}

export function getEffectivePropertyValue(
  block: EmailBlock,
  property: string,
  device: PreviewDevice
): { value: any; isOverridden: boolean; inheritedFrom: 'desktop' | 'tablet' | 'own' } {
  const baseVal = block.style?.[property];
  const tabVal = block.tabletStyle?.[property];
  const mobVal = block.mobileStyle?.[property];

  if (device === 'mobile') {
    if (mobVal !== undefined) {
      return { value: mobVal, isOverridden: true, inheritedFrom: 'own' };
    }
    if (tabVal !== undefined) {
      return { value: tabVal, isOverridden: false, inheritedFrom: 'tablet' };
    }
    return { value: baseVal, isOverridden: false, inheritedFrom: 'desktop' };
  }

  if (device === 'tablet') {
    if (tabVal !== undefined) {
      return { value: tabVal, isOverridden: true, inheritedFrom: 'own' };
    }
    return { value: baseVal, isOverridden: false, inheritedFrom: 'desktop' };
  }

  return { value: baseVal, isOverridden: false, inheritedFrom: 'own' };
}
