import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Trash2, Star, Check, Tag } from 'lucide-react';
import { brandService } from '../services/brand.service';
import type { EmailSavedBlock, BlockCategory } from '../types/brand.types';

interface SavedBlockManagerProps {
  brandId?: string;
}

export const SavedBlockManager: React.FC<SavedBlockManagerProps> = ({ brandId }) => {
  const [blocks, setBlocks] = useState<EmailSavedBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const data = await brandService.listSavedBlocks(brandId, categoryFilter === 'all' ? undefined : categoryFilter);
      setBlocks(data || []);
    } catch (err) {
      console.warn('Could not load saved blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [brandId, categoryFilter]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            Reusable Email Blocks & Layout Sections
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store modular headers, heroes, CTA banners, and product showcase grids to drag and drop into new email templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="header">Headers</option>
            <option value="hero">Hero Sections</option>
            <option value="cta">CTA Banners</option>
            <option value="product">Product Grids</option>
            <option value="social">Social Bars</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading saved modular blocks...</div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
          <LayoutGrid className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Saved Email Blocks Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Save your favorite header, hero banner, or CTA section directly from the Visual Email Template Builder to reuse across future campaigns.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {blocks.map((block) => (
            <div key={block.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between group hover:border-indigo-400 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{block.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">{block.category}</span>
                </div>
                <div 
                  className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs overflow-hidden max-h-40"
                  dangerouslySetInnerHTML={{ __html: block.rendered_preview || '<em>Modular JSON block</em>' }}
                />
              </div>
              <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Used {block.usage_count || 0} times</span>
                <span className="font-mono">ID: {block.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
