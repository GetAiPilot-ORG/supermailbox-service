import { useCallback } from 'react';
import { brandService } from '../services/brand.service';

export function useAssetUsage() {
  const recordUsage = useCallback(async (assetId: string, resourceType: string, resourceId: string, context?: string) => {
    try {
      await brandService.trackAssetUsage(assetId, resourceType, resourceId, context);
    } catch (err) {
      console.warn('[useAssetUsage] Error tracking asset usage:', err);
    }
  }, []);

  return { recordUsage };
}
