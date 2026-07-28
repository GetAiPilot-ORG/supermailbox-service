import { useState, useCallback } from 'react';
import type { BrandAsset, AssetType } from '../types/brand.types';

export interface OpenAssetPickerOptions {
  assetType?: AssetType | 'all';
  folderId?: string;
  onSelect: (asset: BrandAsset) => void;
}

export function useAssetPicker() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | 'all'>('all');
  const [folderIdFilter, setFolderIdFilter] = useState<string | undefined>(undefined);
  const [callback, setCallback] = useState<((asset: BrandAsset) => void) | null>(null);

  const openPicker = useCallback((options: OpenAssetPickerOptions) => {
    if (options.assetType) setAssetTypeFilter(options.assetType);
    else setAssetTypeFilter('all');

    setFolderIdFilter(options.folderId);
    setCallback(() => options.onSelect);
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
    setCallback(null);
  }, []);

  const selectAsset = useCallback((asset: BrandAsset) => {
    if (callback) {
      callback(asset);
    }
    closePicker();
  }, [callback, closePicker]);

  return {
    isOpen,
    assetTypeFilter,
    folderIdFilter,
    openPicker,
    closePicker,
    selectAsset,
    setAssetTypeFilter,
    setFolderIdFilter,
  };
}
