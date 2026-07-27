import { useState, useCallback } from 'react';

export type ResourcePickerType = 'contact' | 'link' | 'social' | 'snippet' | 'signature' | 'footer' | 'saved_block' | 'merge_tag';

export interface OpenResourcePickerOptions {
  resourceType?: ResourcePickerType;
  category?: string;
  onSelect: (item: { type: ResourcePickerType; tag?: string; url?: string; value?: string; html?: string; json?: any; label: string }) => void;
}

export function useResourcePicker() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<ResourcePickerType>('merge_tag');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [callback, setCallback] = useState<((item: any) => void) | null>(null);

  const openPicker = useCallback((options: OpenResourcePickerOptions) => {
    setResourceTypeFilter(options.resourceType || 'merge_tag');
    setCategoryFilter(options.category);
    setCallback(() => options.onSelect);
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
    setCallback(null);
  }, []);

  const selectResource = useCallback((item: any) => {
    if (callback) {
      callback(item);
    }
    closePicker();
  }, [callback, closePicker]);

  return {
    isOpen,
    resourceTypeFilter,
    categoryFilter,
    openPicker,
    closePicker,
    selectResource,
    setResourceTypeFilter,
    setCategoryFilter,
  };
}
