import { useState, useEffect, useCallback } from 'react';
import { brandService } from '../services/brand.service';
import type { Brand, AssetFolder, BrandOverviewStats } from '../types/brand.types';

export function useBrandLibrary() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [overview, setOverview] = useState<BrandOverviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [brandList, folderList, stats] = await Promise.all([
        brandService.listBrands(),
        brandService.listFolders(),
        brandService.getOverview(),
      ]);

      setBrands(brandList);
      const defaultBrand = brandList.find(b => b.is_default) || brandList[0] || null;
      setActiveBrand(defaultBrand);
      setFolders(folderList);
      setOverview(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load brand library workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const selectBrand = useCallback(async (brandId: string) => {
    const selected = brands.find(b => b.id === brandId) || null;
    setActiveBrand(selected);
    if (selected) {
      setLoading(true);
      try {
        const [folderList, stats] = await Promise.all([
          brandService.listFolders(selected.id),
          brandService.getOverview(selected.id),
        ]);
        setFolders(folderList);
        setOverview(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to switch brand context.');
      } finally {
        setLoading(false);
      }
    }
  }, [brands]);

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    try {
      const newFolder = await brandService.createFolder(name, parentId, activeBrand?.id);
      setFolders(prev => [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
      return newFolder;
    } catch (err: any) {
      throw new Error(err.message || 'Could not create folder.');
    }
  }, [activeBrand]);

  const refreshOverview = useCallback(async () => {
    if (!activeBrand) return;
    try {
      const stats = await brandService.getOverview(activeBrand.id);
      setOverview(stats);
    } catch (e) {
      console.warn('Could not refresh overview stats:', e);
    }
  }, [activeBrand]);

  return {
    brands,
    activeBrand,
    folders,
    overview,
    loading,
    error,
    selectBrand,
    createFolder,
    refreshOverview,
    refreshAll: fetchInitialData,
  };
}
