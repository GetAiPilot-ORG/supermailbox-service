import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Plus, Trash2, Star, AlertCircle, Check } from 'lucide-react';
import { brandService } from '../services/brand.service';
import { brandContactSchema } from '../schemas/brand.schema';
import type { BrandContact, ContactType } from '../types/brand.types';

interface ContactManagerProps {
  brandId?: string;
  onRefreshStats?: () => void;
}

export const ContactManager: React.FC<ContactManagerProps> = ({ brandId, onRefreshStats }) => {
  const [contacts, setContacts] = useState<BrandContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [contactType, setContactType] = useState<ContactType>('email_support');
  const [label, setLabel] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await brandService.listContacts(brandId);
      setContacts(data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load brand contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valRes = brandContactSchema.safeParse({ contact_type: contactType, label, value, is_default: isDefault });
    if (!valRes.success) {
      setError(valRes.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      await brandService.saveContact({
        brand_id: brandId,
        contact_type: contactType,
        label,
        value,
        is_default: isDefault,
      });
      setLabel('');
      setValue('');
      setIsDefault(false);
      setIsAdding(false);
      await fetchContacts();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setError(err.message || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('phone') || type === 'whatsapp') return <Phone className="w-4 h-4 text-emerald-600" />;
    if (type.includes('email')) return <Mail className="w-4 h-4 text-blue-600" />;
    if (type.includes('address')) return <MapPin className="w-4 h-4 text-purple-600" />;
    return <Clock className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-600" />
            Brand Contacts & Business Address
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store verified phone numbers, support emails, and physical addresses to use as <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">{'{{brand.support_email}}'}</span> tokens in email templates.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> Add New Contact
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-slate-50 border border-indigo-200 rounded-2xl p-5 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Add Brand Contact</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Category</label>
              <select
                value={contactType}
                onChange={(e) => {
                  const val = e.target.value as ContactType;
                  setContactType(val);
                  if (!label) {
                    if (val === 'email_support') setLabel('Customer Support Email');
                    if (val === 'phone_support') setLabel('Help Desk Helpline');
                    if (val === 'address_physical') setLabel('Corporate HQ Address');
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="email_support">Customer Support Email</option>
                <option value="email_primary">Primary Business Email</option>
                <option value="email_billing">Billing & Invoices Email</option>
                <option value="phone_support">Help Desk / Support Helpline</option>
                <option value="phone_main">Main Office Phone</option>
                <option value="whatsapp">WhatsApp Business Number</option>
                <option value="address_physical">Physical / HQ Address (CAN-SPAM)</option>
                <option value="address_billing">Billing Address</option>
                <option value="office_hours">Operating Hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Label</label>
              <input
                type="text"
                placeholder="e.g. 24/7 Global Help Desk"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Value / Address</label>
              <input
                type="text"
                placeholder="e.g. support@supermailbox.in or +91 80000 00000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Set as default contact for this category</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Contact'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Contacts Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading brand contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
          <Phone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Contacts Added Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your primary support email, helpline number, and corporate address to embed in transactional receipts and newsletters.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200/60">
                      {getIcon(c.contact_type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.label}</h4>
                      <span className="text-[10px] font-semibold uppercase text-slate-400">{c.contact_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {c.is_default && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-indigo-700" /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-3 bg-white px-3 py-2 rounded-xl border border-slate-200/80 font-mono select-all break-all">
                  {c.value}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-indigo-600">{'{{brand.' + (c.contact_type.includes('email') ? 'support_email' : c.contact_type.includes('phone') ? 'support_phone' : 'company_address') + '}}'}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition"
                  title="Delete contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
