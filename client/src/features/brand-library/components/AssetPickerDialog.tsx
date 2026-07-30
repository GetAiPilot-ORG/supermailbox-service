import React, { useState, useEffect } from 'react';
import { X, Search, Image, Upload, Star, Phone, Link2, Share2, FileText, Check, Copy, ExternalLink, Globe } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { AssetGrid } from './AssetGrid';
import { AssetUploadDialog } from './AssetUploadDialog';
import type { 
  BrandAsset, AssetFolder, AssetType, 
  BrandContact, BrandLink, BrandSocialProfile, BrandSnippet 
} from '../types/brand.types';

interface AssetPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: BrandAsset) => void;
  brandId?: string;
  initialAssetType?: AssetType | 'all';
  initialFile?: File | null;
}

type PickerTab = 'all' | 'logo' | 'banner' | 'contacts' | 'links' | 'social' | 'snippets' | 'favorites';

export const AssetPickerDialog: React.FC<AssetPickerDialogProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  brandId,
  initialAssetType = 'all',
  initialFile,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<PickerTab>(
    initialAssetType === 'logo' ? 'logo' : initialAssetType === 'banner' ? 'banner' : 'all'
  );
  
  // Data States
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [contacts, setContacts] = useState<BrandContact[]>([]);
  const [links, setLinks] = useState<BrandLink[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<BrandSocialProfile[]>([]);
  const [snippets, setSnippets] = useState<BrandSnippet[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [assetList, folderList, contactList, linkList, socialList, snippetList] = await Promise.all([
        brandService.listAssets({
          brandId,
          type: (activeTab === 'logo' || activeTab === 'banner') ? activeTab : undefined,
          folderId: selectedFolderId,
          search: searchQuery || undefined,
          favourite: activeTab === 'favorites' ? true : undefined,
        }),
        brandService.listFolders(brandId),
        brandService.listContacts(brandId),
        brandService.listLinks(brandId),
        brandService.listSocialProfiles(brandId),
        brandService.listSnippets({ brandId }),
      ]);

      setAssets(assetList || []);
      setFolders(folderList || []);
      setContacts(contactList || []);
      setLinks(linkList || []);
      setSocialProfiles(socialList || []);
      setSnippets(snippetList || []);
    } catch (err) {
      console.error('Failed to fetch brand resources for picker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
      if (initialFile) {
        setIsUploadOpen(true);
      }
    }
  }, [isOpen, brandId, activeTab, selectedFolderId, searchQuery, initialFile]);

  const handleUploadComplete = (newAsset: BrandAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    setIsUploadOpen(false);
    onSelectAsset(newAsset);
    onClose();
  };

  const handleSelectUrlOrValue = (label: string, urlOrValue: string) => {
    const mockAsset: BrandAsset = {
      id: 'dynamic-' + Math.random().toString(36).substr(2, 9),
      name: label,
      asset_type: 'image',
      secure_url: urlOrValue,
      cloudinary_public_id: 'external-url',
    };
    onSelectAsset(mockAsset);
    onClose();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered lists by searchQuery
  const queryLower = searchQuery.toLowerCase().trim();
  
  const filteredContacts = contacts.filter(c => 
    !queryLower || c.label.toLowerCase().includes(queryLower) || c.value.toLowerCase().includes(queryLower)
  );

  const filteredLinks = links.filter(l => 
    !queryLower || l.label.toLowerCase().includes(queryLower) || l.url.toLowerCase().includes(queryLower)
  );

  const filteredSocial = socialProfiles.filter(sp => 
    !queryLower || sp.platform.toLowerCase().includes(queryLower) || sp.url.toLowerCase().includes(queryLower) || (sp.username && sp.username.toLowerCase().includes(queryLower))
  );

  const filteredSnippets = snippets.filter(s => 
    !queryLower || s.name.toLowerCase().includes(queryLower) || s.plain_text.toLowerCase().includes(queryLower)
  );

  return (
    <div className="brandLibraryRoot">
      <div className="modal-backdrop">
        <div className="bl-modal" style={{ maxWidth: '960px', width: '92%' }}>
          
          {/* Header */}
          <div className="bl-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0e7ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                <Image size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Select Brand Asset or Resource</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Choose media images, verified links, contacts, or social profile URLs</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bl-btn bl-btn--primary"
              >
                <Upload size={14} style={{ marginRight: '6px' }} /> Upload New Media
              </button>
              <button
                onClick={onClose}
                className="bl-asset-icon-btn"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Filters & Tabs Toolbar */}
          <div className="bl-modal-toolbar" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div className="bl-filter-group" style={{ flexWrap: 'wrap', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('all')}
                className={`bl-filter-btn ${activeTab === 'all' ? 'active' : ''}`}
              >
                All Media ({assets.length})
              </button>
              <button
                onClick={() => setActiveTab('logo')}
                className={`bl-filter-btn ${activeTab === 'logo' ? 'active' : ''}`}
              >
                Logos
              </button>
              <button
                onClick={() => setActiveTab('banner')}
                className={`bl-filter-btn ${activeTab === 'banner' ? 'active' : ''}`}
              >
                Banners
              </button>

              <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px', selfAlign: 'center' }} />

              <button
                onClick={() => setActiveTab('contacts')}
                className={`bl-filter-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Phone size={12} /> Contacts ({contacts.length})
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`bl-filter-btn ${activeTab === 'links' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Link2 size={12} /> URL Library ({links.length})
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`bl-filter-btn ${activeTab === 'social' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Share2 size={12} /> Social ({socialProfiles.length})
              </button>
              <button
                onClick={() => setActiveTab('snippets')}
                className={`bl-filter-btn ${activeTab === 'snippets' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <FileText size={12} /> Snippets ({snippets.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`bl-filter-btn ${activeTab === 'favorites' ? 'active-fav' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Star size={12} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} /> Favorites
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
              {(activeTab === 'all' || activeTab === 'logo' || activeTab === 'banner') && folders.length > 0 && (
                <select
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value || undefined)}
                  className="bl-select w-36"
                >
                  <option value="">All Folders</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              )}

              <div className="bl-toolbar-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bl-input"
                />
              </div>
            </div>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="bl-modal-body" style={{ minHeight: '360px', maxHeight: '55vh', overflowY: 'auto', padding: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '14px' }}>Loading brand resources...</div>
            ) : activeTab === 'contacts' ? (
              /* --- CONTACTS TAB --- */
              filteredContacts.length === 0 ? (
                <div className="bl-empty-state">
                  <Phone size={32} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                  <h4 className="bl-empty-state__title">No Brand Contacts Configured</h4>
                  <p className="bl-empty-state__desc">Add support emails, phone numbers, and physical addresses in the Brand Library workspace.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {filteredContacts.map((c) => (
                    <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>{c.contact_type}</span>
                          {c.is_default && <span style={{ fontSize: '9px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '1px 5px', borderRadius: '4px' }}>Default</span>}
                        </div>
                        <h4 style={{ margin: '4px 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{c.label}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#475569', wordBreak: 'break-all', fontFamily: 'monospace' }}>{c.value}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          onClick={() => handleSelectUrlOrValue(c.label, c.value)}
                          className="bl-btn bl-btn--primary"
                          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                        >
                          Use Value
                        </button>
                        <button
                          onClick={() => handleCopyText(c.id, `{{brand.${c.contact_type}}}`)}
                          className="bl-asset-action-btn"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                        >
                          {copiedId === c.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          <span>{copiedId === c.id ? 'Copied' : 'Token'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'links' ? (
              /* --- URL LIBRARY TAB --- */
              filteredLinks.length === 0 ? (
                <div className="bl-empty-state">
                  <Link2 size={32} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                  <h4 className="bl-empty-state__title">No Brand Links Saved</h4>
                  <p className="bl-empty-state__desc">Add your main website, 1-click unsubscribe links, and privacy policy URLs in the Brand Library.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {filteredLinks.map((l) => (
                    <div key={l.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#8b5cf6', background: '#f3e8ff', padding: '2px 6px', borderRadius: '4px' }}>{l.link_type}</span>
                          {l.is_default && <span style={{ fontSize: '9px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '1px 5px', borderRadius: '4px' }}>Default</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 2px' }}>
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${l.url.replace(/^https?:\/\//, '').split('/')[0]}&sz=64`}
                            alt=""
                            style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'contain', flexShrink: 0, background: '#fff', border: '1px solid #cbd5e1', padding: '1px' }}
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{l.label}</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#475569', wordBreak: 'break-all', fontFamily: 'monospace' }}>{l.url}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          onClick={() => handleSelectUrlOrValue(l.label, l.url)}
                          className="bl-btn bl-btn--primary"
                          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                        >
                          Use URL
                        </button>
                        <button
                          onClick={() => handleCopyText(l.id, `{{brand.${l.link_type}_url}}`)}
                          className="bl-asset-action-btn"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                        >
                          {copiedId === l.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          <span>{copiedId === l.id ? 'Copied' : 'Token'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'social' ? (
              /* --- SOCIAL PROFILES TAB --- */
              filteredSocial.length === 0 ? (
                <div className="bl-empty-state">
                  <Share2 size={32} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                  <h4 className="bl-empty-state__title">No Social Profiles Added</h4>
                  <p className="bl-empty-state__desc">Connect your Instagram, LinkedIn, and Twitter profiles in the Social Profiles tab.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {filteredSocial.map((sp) => {
                    const platformSlug = sp.platform.toLowerCase().replace(/[^a-z0-9]+/g, '');
                    const token = `{{brand.social.${platformSlug}}}`;

                    return (
                      <div key={sp.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4f46e5', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>{sp.platform}</span>
                          </div>
                          <h4 style={{ margin: '4px 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{sp.display_label || sp.platform}</h4>
                          <p style={{ margin: 0, fontSize: '11px', color: '#475569', wordBreak: 'break-all', fontFamily: 'monospace' }}>{sp.url}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                          <button
                            onClick={() => handleSelectUrlOrValue(sp.platform, sp.url)}
                            className="bl-btn bl-btn--primary"
                            style={{ flex: 1, padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                          >
                            Use Profile URL
                          </button>
                          <button
                            onClick={() => handleCopyText(sp.id, token)}
                            className="bl-asset-action-btn"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                          >
                            {copiedId === sp.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            <span>{copiedId === sp.id ? 'Copied' : 'Token'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : activeTab === 'snippets' ? (
              /* --- SNIPPETS TAB --- */
              filteredSnippets.length === 0 ? (
                <div className="bl-empty-state">
                  <FileText size={32} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                  <h4 className="bl-empty-state__title">No Content Snippets Found</h4>
                  <p className="bl-empty-state__desc">Create reusable intro text and legal statements in Content Snippets.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {filteredSnippets.map((s) => {
                    const cleanSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                    const token = `{{brand.snippets.${cleanSlug}}}`;

                    return (
                      <div key={s.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>{s.category}</span>
                          </div>
                          <h4 style={{ margin: '4px 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{s.name}</h4>
                          <p style={{ margin: 0, fontSize: '11px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.plain_text}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                          <button
                            onClick={() => handleSelectUrlOrValue(s.name, s.plain_text)}
                            className="bl-btn bl-btn--primary"
                            style={{ flex: 1, padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
                          >
                            Use Text
                          </button>
                          <button
                            onClick={() => handleCopyText(s.id, token)}
                            className="bl-asset-action-btn"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                          >
                            {copiedId === s.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            <span>{copiedId === s.id ? 'Copied' : 'Token'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* --- MEDIA GRID (ALL / LOGO / BANNER / FAVORITES) --- */
              <AssetGrid
                assets={assets}
                onSelect={(asset) => {
                  onSelectAsset(asset);
                  onClose();
                }}
                onOpenUpload={() => setIsUploadOpen(true)}
                searchQuery={searchQuery}
              />
            )}
          </div>

          {/* Footer */}
          <div className="bl-modal-footer" style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Select any media image or click <strong>Use URL / Use Value</strong> on Contacts, Links, & Social Profiles to insert them into your email template.
            </span>
            <button
              onClick={onClose}
              className="bl-btn bl-btn--secondary"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>

      <AssetUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        activeBrandId={brandId}
        defaultFolderId={selectedFolderId}
        onUploadComplete={handleUploadComplete}
        initialFile={initialFile}
      />
    </div>
  );
};
