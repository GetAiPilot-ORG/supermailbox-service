import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmailBlock, EmailRow } from '../types/document.types';

export interface SavedItem {
  id: string;
  name: string;
  type: 'block' | 'row';
  data: EmailBlock | EmailRow;
  createdAt: string;
}

interface SavedBlocksState {
  items: SavedItem[];
  saveBlock: (name: string, block: EmailBlock) => void;
  saveRow: (name: string, row: EmailRow) => void;
  removeItem: (id: string) => void;
}

export const useSavedBlocksStore = create<SavedBlocksState>()(
  persist(
    (set) => ({
      items: [],

      saveBlock: (name, block) => {
        const newItem: SavedItem = {
          id: `saved-blk-${Date.now()}`,
          name,
          type: 'block',
          data: JSON.parse(JSON.stringify(block)),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      saveRow: (name, row) => {
        const newItem: SavedItem = {
          id: `saved-row-${Date.now()}`,
          name,
          type: 'row',
          data: JSON.parse(JSON.stringify(row)),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },
    }),
    {
      name: 'supermailbox_saved_email_blocks',
    }
  )
);
