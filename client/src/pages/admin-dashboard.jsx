import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  Users, Calendar, Award, LogOut, RefreshCw, FileText, Database, Shield,
  ChevronRight, ArrowUpRight, Search, Download, HelpCircle, Edit3, Image, Video,
  CheckCircle2, AlertCircle, X, LayoutDashboard, Globe, Settings, BookOpen,
  DollarSign, MessageSquare, Layers, Upload, Trash2, Eye, EyeOff, GripVertical,
  Save, Send, RotateCcw, ChevronDown, ChevronUp, Plus, Link, Instagram,
  MapPin, Phone, Mail, Wifi, Tag, PanelLeft
} from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import CmsEditor, { MediaField } from '@/components/cms-editor';

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function Field({ label, children, className = '', required = false }) {
  return (
    <label className={`field-label ${className}`}>
      <span>{label}{required && <span className="text-[#ef4444] ml-1">*</span>}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder = '', type = 'text' }) {
  return <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} />;
}

function TextArea({ value, onChange, rows = 3, placeholder = '' }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full min-h-[70px] border border-[#242424] bg-[#0A0A0A] text-white p-3 text-sm focus:outline-none focus:border-[#F8BC06]"
    />
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#F8BC06]' : 'bg-[#333]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      {label && <span className="text-xs text-[#A3A3A3]">{label}</span>}
    </label>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-5">
      <h3 className="font-display text-base font-semibold border-b border-[#242424] pb-3 text-[#F8BC06] uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── MEDIA LIBRARY ────────────────────────────────────────────────────────────
function MediaLibraryPanel({ onSelect, selectMode = false }) {
  const { toast } = useToast();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | images | videos
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [metaAlt, setMetaAlt] = useState('');
  const fileInputRef = useRef();

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.fetchMediaLibrary();
      if (res.success) setMedia(res.data || []);
    } catch (err) {
      toast({ title: 'Media Library Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await api.uploadFile(file.name, file.type, reader.result);
        if (res.success) {
          toast({ title: 'Upload successful', description: `${file.name} uploaded.` });
          fetchMedia();
        }
      } catch (err) {
        toast({ title: 'Upload failed', description: err.message || 'Server error', variant: 'destructive' });
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (fileName) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    try {
      const res = await api.deleteMedia(fileName);
      if (res.success) {
        toast({ title: 'File deleted', description: fileName });
        fetchMedia();
      }
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const saveMeta = async () => {
    if (!editingMeta) return;
    try {
      await api.updateMediaMeta(editingMeta.fileName, { altText: metaAlt });
      toast({ title: 'Alt text saved' });
      setEditingMeta(null);
      fetchMedia();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = media.filter(m => {
    if (filter === 'images' && !m.isImage) return false;
    if (filter === 'videos' && !m.isVideo) return false;
    if (search && !m.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-[#0A0A0A] border border-[#242424] p-4">
        <div className="flex gap-2">
          {['all', 'images', 'videos'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors ${filter === f ? 'border-[#F8BC06] bg-[#F8BC06]/10 text-[#F8BC06]' : 'border-[#333] text-[#A3A3A3] hover:border-white hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files..."
              className="pl-8 !min-h-9 text-xs w-48"
            />
            <Search className="absolute left-2.5 top-2 text-[#555]" size={14} />
          </div>
          <label className={`button button-primary button-small cursor-pointer gap-2 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Media'}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          </label>
          <button onClick={fetchMedia} className="button button-outline button-small gap-1.5">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading media library...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#242424] text-[#A3A3A3]">
          No media files found. Upload your first image or video.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div
              key={item.fileName}
              className={`group border border-[#242424] bg-[#0A0A0A] overflow-hidden relative ${selectMode ? 'cursor-pointer hover:border-[#F8BC06]' : ''}`}
              onClick={selectMode ? () => onSelect?.(item) : undefined}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-[#111] overflow-hidden relative">
                {item.isImage ? (
                  <img src={item.url} alt={item.altText || item.fileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={32} className="text-[#555]" />
                  </div>
                )}
                {selectMode && (
                  <div className="absolute inset-0 bg-[#F8BC06]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-[#F8BC06] uppercase tracking-wider bg-black/70 px-2 py-1">Select</span>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="p-2">
                <p className="text-[10px] text-[#A3A3A3] truncate" title={item.fileName}>{item.originalName || item.fileName}</p>
                <p className="text-[9px] text-[#555] mt-0.5">{formatSize(item.sizeBytes)}</p>
                {item.altText && <p className="text-[9px] text-[#F8BC06]/70 mt-0.5 truncate" title={item.altText}>{item.altText}</p>}
              </div>

              {/* Actions */}
              {!selectMode && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast({ title: 'URL copied', description: item.url }); }}
                    title="Copy URL"
                    className="bg-black/80 p-1 border border-[#333] hover:border-[#F8BC06] hover:text-[#F8BC06]"
                  >
                    <Link size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingMeta(item); setMetaAlt(item.altText || ''); }}
                    title="Edit alt text"
                    className="bg-black/80 p-1 border border-[#333] hover:border-[#F8BC06] hover:text-[#F8BC06]"
                  >
                    <Edit3 size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.fileName); }}
                    title="Delete"
                    className="bg-black/80 p-1 border border-[#333] hover:border-[#ef4444] hover:text-[#ef4444]"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alt text editor modal */}
      {editingMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#242424] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg text-white">Edit Alt Text</h3>
              <button onClick={() => setEditingMeta(null)} className="text-[#A3A3A3] hover:text-white"><X size={18} /></button>
            </div>
            {editingMeta.isImage && <img src={editingMeta.url} alt="" className="w-full h-32 object-contain bg-[#111]" />}
            <p className="text-xs text-[#A3A3A3] break-all">{editingMeta.fileName}</p>
            <Field label="Alt text (for accessibility & SEO)">
              <TextInput value={metaAlt} onChange={e => setMetaAlt(e.target.value)} placeholder="Describe this image..." />
            </Field>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingMeta(null)} className="button button-outline button-small">Cancel</button>
              <button onClick={saveMeta} className="button button-primary button-small">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAVIGATION EDITOR ────────────────────────────────────────────────────────
function NavigationEditor({ cmsDraft, onFieldChange, onNestedChange }) {
  if (!cmsDraft) return null;
  const nav = cmsDraft.navigation || {};
  const items = nav.items || [];

  const addItem = () => {
    const newItems = [...items, { label: '', url: '#', external: false, visible: true, order: items.length }];
    onFieldChange('navigation', 'items', newItems);
  };

  const removeItem = (idx) => {
    const newItems = items.filter((_, i) => i !== idx);
    onFieldChange('navigation', 'items', newItems);
  };

  const updateItem = (idx, key, value) => {
    const newItems = items.map((item, i) => i === idx ? { ...item, [key]: value } : item);
    onFieldChange('navigation', 'items', newItems);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Navigation Links">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="border border-[#242424] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#F8BC06] font-semibold uppercase">Link {idx + 1}</span>
                <button onClick={() => removeItem(idx)} className="text-xs text-[#ef4444] hover:text-white">Remove</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label">
                  <TextInput value={item.label} onChange={e => updateItem(idx, 'label', e.target.value)} />
                </Field>
                <Field label="URL">
                  <TextInput value={item.url} onChange={e => updateItem(idx, 'url', e.target.value)} placeholder="#section or /page" />
                </Field>
              </div>
              <div className="flex gap-6">
                <Toggle checked={item.visible !== false} onChange={v => updateItem(idx, 'visible', v)} label="Visible" />
                <Toggle checked={!!item.external} onChange={v => updateItem(idx, 'external', v)} label="Open in new tab" />
              </div>
            </div>
          ))}
          <button onClick={addItem} className="button button-outline button-small gap-2 w-full">
            <Plus size={14} /> Add Navigation Link
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Header CTA Button">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA Label">
            <TextInput value={nav.ctaLabel} onChange={e => onFieldChange('navigation', 'ctaLabel', e.target.value)} />
          </Field>
          <Field label="CTA URL">
            <TextInput value={nav.ctaUrl} onChange={e => onFieldChange('navigation', 'ctaUrl', e.target.value)} />
          </Field>
        </div>
        <Toggle checked={nav.ctaVisible !== false} onChange={v => onFieldChange('navigation', 'ctaVisible', v)} label="Show CTA button" />
      </SectionCard>
    </div>
  );
}

// ─── SEO EDITOR ───────────────────────────────────────────────────────────────
function SEOEditor({ cmsDraft, onFieldChange, onUpload }) {
  if (!cmsDraft) return null;
  const seo = cmsDraft.seo || {};

  return (
    <div className="space-y-6">
      <SectionCard title="Homepage SEO">
        <Field label="Page Title (shown in browser tab & Google)">
          <TextInput value={seo.title} onChange={e => onFieldChange('seo', 'title', e.target.value)} />
        </Field>
        <Field label="Meta Description (shown in Google results)">
          <TextArea value={seo.description} onChange={e => onFieldChange('seo', 'description', e.target.value)} rows={3} />
        </Field>
        <Field label="Keywords (comma-separated)">
          <TextInput value={seo.keywords} onChange={e => onFieldChange('seo', 'keywords', e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard title="Open Graph (Social Preview)">
        <Field label="OG Title (leave blank to use page title)">
          <TextInput value={seo.ogTitle} onChange={e => onFieldChange('seo', 'ogTitle', e.target.value)} />
        </Field>
        <Field label="OG Description">
          <TextArea value={seo.ogDescription} onChange={e => onFieldChange('seo', 'ogDescription', e.target.value)} rows={2} />
        </Field>
        <MediaField
          label="OG Image (1200×630 recommended)"
          value={seo.ogImage}
          onChange={(e) => onFieldChange('seo', 'ogImage', e.target.value)}
          onUpload={(e) => onUpload?.('seo', 'ogImage', e)}
        />
      </SectionCard>

      <SectionCard title="Twitter / X Card">
        <Field label="Twitter Title">
          <TextInput value={seo.twitterTitle} onChange={e => onFieldChange('seo', 'twitterTitle', e.target.value)} />
        </Field>
        <Field label="Twitter Description">
          <TextArea value={seo.twitterDescription} onChange={e => onFieldChange('seo', 'twitterDescription', e.target.value)} rows={2} />
        </Field>
        <MediaField
          label="Twitter Image"
          value={seo.twitterImage}
          onChange={(e) => onFieldChange('seo', 'twitterImage', e.target.value)}
          onUpload={(e) => onUpload?.('seo', 'twitterImage', e)}
        />
      </SectionCard>
    </div>
  );
}

// ─── GLOBAL SETTINGS EDITOR ───────────────────────────────────────────────────
function GlobalSettingsEditor({ cmsDraft, onFieldChange, onUpload }) {
  if (!cmsDraft) return null;
  const gs = cmsDraft.globalSettings || {};

  return (
    <div className="space-y-6">
      <SectionCard title="Brand Assets">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business Name">
            <TextInput value={gs.businessName} onChange={e => onFieldChange('globalSettings', 'businessName', e.target.value)} />
          </Field>
          <Field label="Tagline / Short Description">
            <TextInput value={gs.shortDesc} onChange={e => onFieldChange('globalSettings', 'shortDesc', e.target.value)} />
          </Field>
          <MediaField
            label="Logo Asset"
            value={gs.logo}
            onChange={(e) => onFieldChange('globalSettings', 'logo', e.target.value)}
            onUpload={(e) => onUpload?.('globalSettings', 'logo', e)}
            accept="image/*"
          />
          <MediaField
            label="Favicon Asset (PNG / ICO / SVG)"
            value={gs.favicon}
            onChange={(e) => onFieldChange('globalSettings', 'favicon', e.target.value)}
            onUpload={(e) => onUpload?.('globalSettings', 'favicon', e)}
            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/ico,image/jpeg,image/webp,.ico,.png,.svg"
          />
          <MediaField
            label="OG / Social Sharing Image"
            value={gs.ogImage}
            onChange={(e) => onFieldChange('globalSettings', 'ogImage', e.target.value)}
            onUpload={(e) => onUpload?.('globalSettings', 'ogImage', e)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Contact Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <TextInput value={gs.phone} onChange={e => onFieldChange('globalSettings', 'phone', e.target.value)} />
          </Field>
          <Field label="WhatsApp Number">
            <TextInput value={gs.whatsapp} onChange={e => onFieldChange('globalSettings', 'whatsapp', e.target.value)} />
          </Field>
          <Field label="Email">
            <TextInput value={gs.email} onChange={e => onFieldChange('globalSettings', 'email', e.target.value)} />
          </Field>
          <Field label="Full Address">
            <TextInput value={gs.address} onChange={e => onFieldChange('globalSettings', 'address', e.target.value)} />
          </Field>
          <Field label="Landmark">
            <TextInput value={gs.landmark} onChange={e => onFieldChange('globalSettings', 'landmark', e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Social Links">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL">
            <TextInput value={gs.instagram} onChange={e => onFieldChange('globalSettings', 'instagram', e.target.value)} />
          </Field>
          <Field label="Facebook URL">
            <TextInput value={gs.facebook} onChange={e => onFieldChange('globalSettings', 'facebook', e.target.value)} />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput value={gs.linkedin} onChange={e => onFieldChange('globalSettings', 'linkedin', e.target.value)} />
          </Field>
          <Field label="YouTube URL">
            <TextInput value={gs.youtube} onChange={e => onFieldChange('globalSettings', 'youtube', e.target.value)} />
          </Field>
          <Field label="Google Business Profile URL">
            <TextInput value={gs.googleBusiness} onChange={e => onFieldChange('globalSettings', 'googleBusiness', e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Google Maps">
        <Field label="Maps Embed URL (for the iframe in footer)">
          <TextArea value={gs.mapsEmbedSrc} onChange={e => onFieldChange('globalSettings', 'mapsEmbedSrc', e.target.value)} rows={3} />
        </Field>
        <Field label="Directions Link (for 'Get Directions' button)">
          <TextArea value={gs.mapsUrl} onChange={e => onFieldChange('globalSettings', 'mapsUrl', e.target.value)} rows={2} />
        </Field>
      </SectionCard>

      <SectionCard title="Analytics (Measurement IDs only — no secrets)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Google Analytics ID (G-XXXXXXXXXX)">
            <TextInput value={gs.gaId} onChange={e => onFieldChange('globalSettings', 'gaId', e.target.value)} placeholder="G-XXXXXXXXXX" />
          </Field>
          <Field label="Google Tag Manager ID (GTM-XXXXXXX)">
            <TextInput value={gs.gtmId} onChange={e => onFieldChange('globalSettings', 'gtmId', e.target.value)} placeholder="GTM-XXXXXXX" />
          </Field>
          <Field label="Meta Pixel ID">
            <TextInput value={gs.metaPixelId} onChange={e => onFieldChange('globalSettings', 'metaPixelId', e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Footer">
        <Field label="Copyright text ({year} will be replaced with current year)">
          <TextInput value={gs.copyright} onChange={e => onFieldChange('globalSettings', 'copyright', e.target.value)} placeholder="© {year} Deven Co-Work" />
        </Field>
      </SectionCard>
    </div>
  );
}

// ─── SECTION VISIBILITY MANAGER ───────────────────────────────────────────────
function SectionManager({ cmsDraft, onChange }) {
  if (!cmsDraft) return null;

  const SECTION_LABELS = {
    hero: 'Hero — Headline, CTA, Background Media',
    problem: 'Problem — Pain points & image',
    guide: 'Guide — Brand story & gallery',
    plan: 'Plan — 3-step process',
    offerStack: "Founder's OS — Offer tiers",
    valueStack: 'Value Stack — Value comparison table',
    guarantee: 'Guarantee — Risk-free entry',
    socialProof: 'Social Proof — Testimonials',
    pricing: 'Pricing — Plans & scarcity',
    faq: 'FAQ — Questions & answers',
    finalCTA: 'Final CTA — Reservation form',
  };

  const order = cmsDraft.sectionOrder || Object.keys(SECTION_LABELS);
  const visibility = cmsDraft.sectionVisibility || {};

  const toggleVisibility = (key) => {
    onChange({
      ...cmsDraft,
      sectionVisibility: { ...visibility, [key]: !visibility[key] },
    });
  };

  const moveSection = (index, direction) => {
    const newOrder = [...order];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    onChange({ ...cmsDraft, sectionOrder: newOrder });
  };

  return (
    <SectionCard title="Section Order & Visibility">
      <p className="text-xs text-[#A3A3A3] mb-4">Use the arrows to reorder sections. Toggle visibility to show/hide sections on the live site.</p>
      <div className="space-y-2">
        {order.map((key, idx) => (
          <div key={key} className="flex items-center gap-3 border border-[#242424] bg-[#060606] p-3">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="text-[#555] hover:text-white disabled:opacity-25"><ChevronUp size={14} /></button>
              <button onClick={() => moveSection(idx, 1)} disabled={idx === order.length - 1} className="text-[#555] hover:text-white disabled:opacity-25"><ChevronDown size={14} /></button>
            </div>
            <span className="font-mono text-[11px] text-[#555] w-6">{String(idx + 1).padStart(2, '0')}</span>
            <span className="flex-1 text-sm text-[#F1F1F1] font-medium">{SECTION_LABELS[key] || key}</span>
            <Toggle
              checked={visibility[key] !== false}
              onChange={() => toggleVisibility(key)}
            />
            <span className={`text-[10px] uppercase tracking-wider font-bold ${visibility[key] !== false ? 'text-[#22c55e]' : 'text-[#555]'}`}>
              {visibility[key] !== false ? 'VISIBLE' : 'HIDDEN'}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── MAIN ADMIN DASHBOARD ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Auth state
  const [adminUser, setAdminUser] = useState(null);

  // Dashboard & reservations data
  const [reservations, setReservations] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sidebar navigation
  // top-level: 'dashboard' | 'homepage' | 'navigation' | 'footer' | 'global' | 'seo' | 'media' | 'leads' | 'seats' | 'logs'
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Leads filter state
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  // Lead details Modal state
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalStatus, setModalStatus] = useState('');
  const [modalPayment, setModalPayment] = useState('');
  const [modalRefundType, setModalRefundType] = useState('none');
  const [updatingLead, setUpdatingLead] = useState(false);

  // CMS State
  const [cmsDraft, setCmsDraft] = useState(null);
  const [cmsSaving, setCmsSaving] = useState(false);
  const [cmsPublishing, setCmsPublishing] = useState(false);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState(null);

  // Seat Override state
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatOverrideStatus, setSeatOverrideStatus] = useState('Available');
  const [updatingSeat, setUpdatingSeat] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await api.getMe();
      setAdminUser(profile.user);
      const resData = await api.getReservations();
      setReservations(resData.data || []);
      const seatsData = await api.fetchSeats();
      setSeats(seatsData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data. Please log in.');
      api.logout();
      setLocation('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCMSContent = useCallback(async () => {
    setCmsLoading(true);
    try {
      const res = await api.fetchDraftContent();
      if (res.success) {
        setCmsDraft(res.data);
        setIsDirty(false);
      }
    } catch (err) {
      toast({ title: 'Error loading CMS', description: err.message || 'Failed to retrieve draft content', variant: 'destructive' });
    } finally {
      setCmsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // WebSocket live sync connection for admin alerts
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'NEW_LEAD') {
          setReservations((prev) => {
            const exists = prev.some(r => r._id === message.lead._id);
            if (exists) return prev;
            return [message.lead, ...prev];
          });
          toast({ title: 'New Lead Received!', description: `${message.lead.name} submitted a reservation.` });
        } else if (message.type === 'PAYMENT_UPDATE') {
          setReservations((prev) =>
            prev.map((r) => r._id === message.leadId ? { ...r, paymentStatus: message.paymentStatus, status: message.status } : r)
          );
        } else if (message.type === 'SEAT_UPDATE') {
          setSeats((prev) => {
            const updated = [...prev];
            (message.seats || []).forEach((newSeat) => {
              const idx = updated.findIndex(s => s.zone === newSeat.zone && s.label === newSeat.label);
              if (idx !== -1) updated[idx] = newSeat;
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    return () => ws.close();
  }, []);

  // Fetch CMS when switching to a CMS panel
  const CMS_PANELS = ['homepage', 'navigation', 'footer', 'global', 'seo', 'sections'];
  useEffect(() => {
    if (CMS_PANELS.includes(activePanel) && !cmsDraft) {
      fetchCMSContent();
    }
  }, [activePanel, cmsDraft, fetchCMSContent]);

  // Unsaved changes warning on browser navigation
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleLogout = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
    api.logout();
    setLocation('/admin/login');
  };

  // ── CMS Change Handlers ──────────────────────────────────────────────────────
  const handleCMSFieldChange = (section, field, value) => {
    setIsDirty(true);
    setCmsDraft(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Deep nested change: section → array field → index → subfield → value
  const handleNestedChange = (section, field, index, subfield, value) => {
    setIsDirty(true);
    setCmsDraft(prev => {
      const arrCopy = [...(prev[section][field] || [])];
      arrCopy[index] = { ...arrCopy[index], [subfield]: value };
      return { ...prev, [section]: { ...prev[section], [field]: arrCopy } };
    });
  };

  // Top-level array (e.g., faq array directly on document)
  const handleTopLevelArrayChange = (arrayKey, index, subfield, value) => {
    setIsDirty(true);
    setCmsDraft(prev => {
      const arrCopy = [...(prev[arrayKey] || [])];
      arrCopy[index] = { ...arrCopy[index], [subfield]: value };
      return { ...prev, [arrayKey]: arrCopy };
    });
  };

  // Offer stack tier items (textarea → array)
  const handleTierItemsChange = (tierIndex, textareaValue) => {
    setIsDirty(true);
    const items = textareaValue.split('\n').filter(l => l.trim());
    setCmsDraft(prev => {
      const tiers = [...(prev.offerStack?.tiers || [])];
      tiers[tierIndex] = { ...tiers[tierIndex], items };
      return { ...prev, offerStack: { ...prev.offerStack, tiers } };
    });
  };

  // Add item to a nested array
  const handleAddItem = (section, field, newItem) => {
    setIsDirty(true);
    setCmsDraft(prev => {
      if (field === null) {
        // Top-level array (faq)
        return { ...prev, [section]: [...(prev[section] || []), newItem] };
      }
      return {
        ...prev,
        [section]: { ...prev[section], [field]: [...(prev[section]?.[field] || []), newItem] },
      };
    });
  };

  // Remove item from nested array
  const handleRemoveItem = (section, field, index) => {
    setIsDirty(true);
    setCmsDraft(prev => {
      if (field === null) {
        return { ...prev, [section]: (prev[section] || []).filter((_, i) => i !== index) };
      }
      return {
        ...prev,
        [section]: { ...prev[section], [field]: (prev[section]?.[field] || []).filter((_, i) => i !== index) },
      };
    });
  };

  // Move item up (-1) or down (+1) within an array
  const handleMoveItem = (section, field, index, direction) => {
    setIsDirty(true);
    setCmsDraft(prev => {
      if (field === null) {
        const arr = [...(prev[section] || [])];
        const target = index + direction;
        if (target < 0 || target >= arr.length) return prev;
        [arr[index], arr[target]] = [arr[target], arr[index]];
        return { ...prev, [section]: arr };
      }
      const arr = [...(prev[section]?.[field] || [])];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, [section]: { ...prev[section], [field]: arr } };
    });
  };

  // Duplicate item — deep-clone and insert immediately after the source index
  const handleDuplicateItem = (section, field, index) => {
    setIsDirty(true);
    setCmsDraft(prev => {
      if (field === null) {
        const arr = [...(prev[section] || [])];
        arr.splice(index + 1, 0, JSON.parse(JSON.stringify(arr[index])));
        return { ...prev, [section]: arr };
      }
      const arr = [...(prev[section]?.[field] || [])];
      arr.splice(index + 1, 0, JSON.parse(JSON.stringify(arr[index])));
      return { ...prev, [section]: { ...prev[section], [field]: arr } };
    });
  };

  // Image upload handler
  const handleCMSImageUpload = async (section, field, e, index, subfield) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        toast({ title: 'Uploading...', description: 'Please wait.' });
        const res = await api.uploadFile(file.name, file.type, reader.result);
        if (res.success && res.url) {
          const valueToStore = res.cloudinary ? {
            url: res.url,
            publicId: res.cloudinary.publicId,
            width: res.cloudinary.width,
            height: res.cloudinary.height,
            format: res.cloudinary.format,
            alt: res.altText || ''
          } : res.url;

          if (index !== undefined) {
            handleNestedChange(section, field, index, subfield, valueToStore);
          } else {
            handleCMSFieldChange(section, field, valueToStore);
          }
          toast({ title: 'Upload success', description: 'File uploaded and referenced in CMS.' });
        }
      } catch (err) {
        toast({ title: 'Upload failed', description: err.message || 'Server error', variant: 'destructive' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle full document change (from SectionManager)
  const handleDocumentChange = (newDoc) => {
    setIsDirty(true);
    setCmsDraft(newDoc);
  };

  // Save draft
  const saveCmsDraft = async () => {
    setCmsSaving(true);
    try {
      const res = await api.saveDraftContent(cmsDraft);
      if (res.success) {
        setIsDirty(false);
        toast({ title: 'Draft Saved', description: 'Changes saved. Publish to make them live.' });
      }
    } catch (err) {
      toast({ title: 'Save failed', description: err.message || 'Could not save draft.', variant: 'destructive' });
    } finally {
      setCmsSaving(false);
    }
  };

  // Save & publish
  const publishCmsContent = async () => {
    if (!confirm('Publish this draft to the live website? Visitors will see these changes immediately.')) return;
    setCmsPublishing(true);
    try {
      const resSave = await api.saveDraftContent(cmsDraft);
      if (resSave.success) {
        const resPub = await api.publishContent();
        if (resPub.success) {
          setIsDirty(false);
          setLastPublishedAt(new Date().toLocaleString());
          toast({ title: '🚀 Site Published Live!', description: 'Your updates are now visible to visitors.' });
        }
      }
    } catch (err) {
      toast({ title: 'Publish failed', description: err.message || 'Could not publish.', variant: 'destructive' });
    } finally {
      setCmsPublishing(false);
    }
  };

  // ── Leads actions ─────────────────────────────────────────────────────────────
  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setModalNotes(lead.notes || '');
    setModalStatus(lead.status || 'new');
    setModalPayment(lead.paymentStatus || 'pending');
    setModalRefundType(lead.refundType || 'none');
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setUpdatingLead(true);
    try {
      const res = await api.updateReservation(selectedLead._id, { notes: modalNotes, status: modalStatus, paymentStatus: modalPayment, refundType: modalRefundType });
      if (res.success) {
        toast({ title: 'Lead updated' });
        setSelectedLead(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingLead(false);
    }
  };

  const handleRetryCRM = async (leadId) => {
    try {
      const res = await api.retryCRMSync(leadId);
      if (res.success) {
        toast({ title: 'CRM Sync success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ title: 'CRM Sync failed', description: err.message, variant: 'destructive' });
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Seats Held', 'Plan', 'Payment Status', 'Deposit Amount', 'CRM Status', 'Source', 'Campaign', 'Date', 'Notes'];
    const rows = filteredReservations.map(res => [
      res.name, res.phone, res.seatNumbers?.join('|') || '', res.plan,
      res.paymentStatus, res.amount, res.crmSyncStatus, res.utmSource || 'Organic',
      res.utmCampaign || '', new Date(res.createdAt).toLocaleDateString(), res.notes || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replaceAll('"', '""')}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `deven_cowork_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(filterSearch.toLowerCase()) || res.phone.includes(filterSearch);
    const matchesStatus = filterStatus ? res.status === filterStatus : true;
    const matchesPayment = filterPayment ? res.paymentStatus === filterPayment : true;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // ── Seat Inventory ────────────────────────────────────────────────────────────
  const openSeatOverride = (seat) => {
    setSelectedSeat(seat);
    setSeatOverrideStatus(seat.isStaff ? 'Staff-Reserved' : seat.status === 'reserved' ? 'Reserved' : 'Available');
  };

  const handleUpdateSeatStatus = async () => {
    if (!selectedSeat) return;
    setUpdatingSeat(true);
    try {
      const res = await api.updateSeatStatus(selectedSeat.zone, selectedSeat.label, seatOverrideStatus);
      if (res.success) {
        toast({ title: 'Seat status updated', description: `Seat ${selectedSeat.zone}-${selectedSeat.label} → ${seatOverrideStatus}` });
        setSelectedSeat(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast({ title: 'Seat override failed', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingSeat(false);
    }
  };

  // ── Computed Stats ────────────────────────────────────────────────────────────
  const totalBookings = reservations.length;
  const totalSeatsReserved = seats.filter(s => s.status === 'reserved' && !s.isStaff).length;
  const seatsRemaining = Math.max(0, 50 - totalSeatsReserved);

  // ── Sidebar items config ──────────────────────────────────────────────────────
  const sidebarGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Website',
      items: [
        { id: 'sections', label: 'Section Manager', icon: Layers },
        { id: 'homepage', label: 'Homepage CMS', icon: Globe },
        { id: 'navigation', label: 'Navigation', icon: Link },
        { id: 'global', label: 'Global Settings', icon: Settings },
        { id: 'seo', label: 'SEO', icon: Tag },
      ]
    },
    {
      label: 'Media',
      items: [
        { id: 'media', label: 'Media Library', icon: Image },
      ]
    },
    {
      label: 'Operations',
      items: [
        { id: 'leads', label: 'Leads & Payments', icon: Users },
        { id: 'seats', label: 'Seat Inventory', icon: Database },
        { id: 'logs', label: 'CRM Sync Logs', icon: Shield },
      ]
    },
  ];

  // ── CMS Toolbar ───────────────────────────────────────────────────────────────
  const showCMSToolbar = CMS_PANELS.includes(activePanel);

  return (
    <div className="site-noise min-h-screen bg-[#000000] text-[#F1F1F1] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[#242424] bg-[#000000] z-20 sticky top-0">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#A3A3A3] hover:text-white p-1">
              <PanelLeft size={18} />
            </button>
            <div className="logo text-[#F1F1F1]">
              <span className="logo-mark" aria-hidden="true"><span /><span /></span>
              <span className="font-display text-[18px] tracking-[.02em]">DEVEN</span>
              <span className="mt-[3px] text-[9px] font-bold tracking-[.18em] text-[#A3A3A3]">ADMIN</span>
            </div>
          </div>

          {/* CMS Toolbar */}
          {showCMSToolbar && cmsDraft && (
            <div className="hidden md:flex items-center gap-3">
              {isDirty && <span className="text-xs text-amber-400 font-semibold animate-pulse">● Unsaved changes</span>}
              {lastPublishedAt && !isDirty && <span className="text-xs text-[#555]">Published {lastPublishedAt}</span>}
              <button onClick={fetchCMSContent} className="button button-outline button-small gap-2" disabled={cmsLoading}>
                <RotateCcw size={12} className={cmsLoading ? 'animate-spin' : ''} /> Reload
              </button>
              <button onClick={saveCmsDraft} disabled={cmsSaving || cmsLoading} className="button button-outline button-small gap-2">
                <Save size={12} /> {cmsSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button onClick={publishCmsContent} disabled={cmsPublishing || cmsLoading} className="button button-primary button-small gap-2">
                <Send size={12} /> {cmsPublishing ? 'Publishing...' : 'Publish Live'}
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-[#F8BC06] font-semibold uppercase tracking-wider">
              <Eye size={13} /> View Site
            </a>
            <span className="hidden sm:inline text-xs text-[#A3A3A3] uppercase tracking-wider font-semibold">
              {adminUser?.username || 'Admin'}
            </span>
            <button onClick={handleLogout} className="button button-outline button-small gap-2">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Mobile CMS toolbar */}
        {showCMSToolbar && cmsDraft && (
          <div className="md:hidden flex items-center gap-2 px-4 pb-3 border-t border-[#242424] pt-2">
            {isDirty && <span className="text-[10px] text-amber-400 font-semibold flex-1">● Unsaved changes</span>}
            <button onClick={saveCmsDraft} disabled={cmsSaving} className="button button-outline button-small gap-1 text-xs"><Save size={11} /> Save</button>
            <button onClick={publishCmsContent} disabled={cmsPublishing} className="button button-primary button-small gap-1 text-xs"><Send size={11} /> Publish</button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} transition-all duration-200 border-r border-[#242424] bg-[#000000] flex-shrink-0 flex flex-col overflow-y-auto`}>
          <nav className="flex-1 p-3 space-y-6 pt-4">
            {sidebarGroups.map(group => (
              <div key={group.label}>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#555] px-2 mb-2">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 text-xs font-semibold uppercase tracking-wider transition-colors text-left rounded-none ${
                        activePanel === item.id
                          ? 'bg-[#F8BC06]/10 text-[#F8BC06] border-l-2 border-[#F8BC06]'
                          : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <item.icon size={14} className="shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto space-y-8">

            {/* ── DASHBOARD ────────────────────────────────────────────────── */}
            {activePanel === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <div className="eyebrow flex items-center gap-3 text-[#F8BC06]">
                    <span className="h-px w-8 bg-[#F8BC06]" /> Admin Dashboard
                  </div>
                  <h1 className="mt-4 font-display text-3xl md:text-[44px] font-[650] leading-[1.1] tracking-[.02em] text-[#F1F1F1]">Control Panel</h1>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="border border-[#242424] bg-[#0A0A0A] p-6">
                    <div className="flex justify-between items-start">
                      <span className="eyebrow">Total Bookings</span>
                      <Calendar size={18} className="text-[#F8BC06]" />
                    </div>
                    <p className="mt-4 font-display text-5xl text-[#F1F1F1]">{loading ? '—' : totalBookings}</p>
                    <p className="mt-2 text-xs text-[#A3A3A3] uppercase tracking-wider">Leads & enquiries submitted</p>
                  </div>
                  <div className="border border-[#242424] bg-[#0A0A0A] p-6">
                    <div className="flex justify-between items-start">
                      <span className="eyebrow">Desks Reserved</span>
                      <Users size={18} className="text-[#F8BC06]" />
                    </div>
                    <p className="mt-4 font-display text-5xl text-[#F1F1F1]">
                      {loading ? '—' : totalSeatsReserved} <span className="text-xl text-[#A3A3A3]">/ 50</span>
                    </p>
                    <p className="mt-2 text-xs text-[#A3A3A3] uppercase tracking-wider">Founding batch locked seats</p>
                  </div>
                  <div className="border border-[#242424] bg-[#0A0A0A] p-6">
                    <div className="flex justify-between items-start">
                      <span className="eyebrow">Open Capacity</span>
                      <Award size={18} className="text-[#F8BC06]" />
                    </div>
                    <p className="mt-4 font-display text-5xl text-[#F8BC06]">{loading ? '—' : seatsRemaining}</p>
                    <p className="mt-2 text-xs text-[#A3A3A3] uppercase tracking-wider">Seats still available to lock</p>
                  </div>
                </div>

                {/* Quick access */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { id: 'homepage', label: 'Edit Homepage Content', icon: Globe, desc: 'Hero, pricing, FAQ & all sections' },
                    { id: 'sections', label: 'Manage Sections', icon: Layers, desc: 'Reorder and show/hide sections' },
                    { id: 'media', label: 'Media Library', icon: Image, desc: 'Upload and manage images & videos' },
                    { id: 'global', label: 'Global Settings', icon: Settings, desc: 'Business info, social, contact' },
                    { id: 'navigation', label: 'Navigation', icon: Link, desc: 'Header links & CTA button' },
                    { id: 'leads', label: 'View Leads', icon: Users, desc: 'Reservations and payment status' },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActivePanel(item.id)} className="border border-[#242424] bg-[#0A0A0A] p-5 text-left hover:border-[#F8BC06] transition-colors group">
                      <item.icon size={20} className="text-[#F8BC06] mb-3" />
                      <p className="font-semibold text-sm text-[#F1F1F1] group-hover:text-[#F8BC06] transition-colors">{item.label}</p>
                      <p className="text-xs text-[#A3A3A3] mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>

                {lastPublishedAt && (
                  <div className="border border-[#242424] bg-[#0A0A0A] p-4 flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                    <span className="text-xs text-[#A3A3A3]">Last published to live site: <strong className="text-white">{lastPublishedAt}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION MANAGER ───────────────────────────────────────────── */}
            {activePanel === 'sections' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Section Manager</h2>
                <p className="text-sm text-[#A3A3A3]">Reorder and show/hide homepage sections. Changes take effect after publishing.</p>
                {cmsLoading ? (
                  <div className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading...</div>
                ) : cmsDraft ? (
                  <SectionManager cmsDraft={cmsDraft} onChange={handleDocumentChange} />
                ) : (
                  <button onClick={fetchCMSContent} className="button button-primary">Load CMS Data</button>
                )}
              </div>
            )}

            {/* ── HOMEPAGE CMS ──────────────────────────────────────────────── */}
            {activePanel === 'homepage' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Homepage Content</h2>
                <p className="text-sm text-[#A3A3A3]">Edit all content sections. Use Save Draft to preview, then Publish Live to go live.</p>
                {cmsLoading ? (
                  <div className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading CMS data...</div>
                ) : !cmsDraft ? (
                  <button onClick={fetchCMSContent} className="button button-primary">Load CMS Data</button>
                ) : (
                  <CmsEditor
                    cmsDraft={cmsDraft}
                    onFieldChange={handleCMSFieldChange}
                    onNestedChange={handleNestedChange}
                    onTopLevelArrayChange={handleTopLevelArrayChange}
                    onTierItemsChange={handleTierItemsChange}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    onMoveItem={handleMoveItem}
                    onDuplicateItem={handleDuplicateItem}
                    onUpload={handleCMSImageUpload}
                  />
                )}
              </div>
            )}

            {/* ── NAVIGATION ────────────────────────────────────────────────── */}
            {activePanel === 'navigation' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Navigation</h2>
                {cmsLoading ? (
                  <div className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading...</div>
                ) : cmsDraft ? (
                  <NavigationEditor cmsDraft={cmsDraft} onFieldChange={handleCMSFieldChange} onNestedChange={handleNestedChange} />
                ) : (
                  <button onClick={fetchCMSContent} className="button button-primary">Load CMS Data</button>
                )}
              </div>
            )}

            {/* ── GLOBAL SETTINGS ───────────────────────────────────────────── */}
            {activePanel === 'global' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Global Settings</h2>
                <p className="text-sm text-[#A3A3A3]">Business information, brand assets, contact details, and social links used across the entire site.</p>
                {cmsLoading ? (
                  <div className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading...</div>
                ) : cmsDraft ? (
                  <GlobalSettingsEditor
                    cmsDraft={cmsDraft}
                    onFieldChange={handleCMSFieldChange}
                    onUpload={handleCMSImageUpload}
                  />
                ) : (
                  <button onClick={fetchCMSContent} className="button button-primary">Load CMS Data</button>
                )}
              </div>
            )}

            {/* ── SEO ───────────────────────────────────────────────────────── */}
            {activePanel === 'seo' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">SEO Settings</h2>
                <p className="text-sm text-[#A3A3A3]">Control meta titles, descriptions, and social sharing previews. Publish to apply.</p>
                {cmsLoading ? (
                  <div className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading...</div>
                ) : cmsDraft ? (
                  <SEOEditor
                    cmsDraft={cmsDraft}
                    onFieldChange={handleCMSFieldChange}
                    onUpload={handleCMSImageUpload}
                  />
                ) : (
                  <button onClick={fetchCMSContent} className="button button-primary">Load CMS Data</button>
                )}
              </div>
            )}

            {/* ── MEDIA LIBRARY ────────────────────────────────────────────── */}
            {activePanel === 'media' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Media Library</h2>
                <p className="text-sm text-[#A3A3A3]">Upload and manage images, videos, and logos. Click Copy URL to use a file in any CMS field.</p>
                <MediaLibraryPanel />
              </div>
            )}

            {/* ── LEADS & PAYMENTS ─────────────────────────────────────────── */}
            {activePanel === 'leads' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Leads & Payments</h2>
                  <div className="flex gap-2">
                    <button onClick={exportToCSV} className="button button-outline button-small gap-2"><Download size={14} /> Export CSV</button>
                    <button onClick={fetchDashboardData} disabled={loading} className="button button-outline button-small gap-2">
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid gap-4 sm:grid-cols-3 bg-[#0A0A0A] border border-[#242424] p-5">
                  <div className="field-label w-full">
                    <span>Search Customer</span>
                    <div className="relative">
                      <input type="text" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Name or phone..." className="pl-10 !min-h-11" />
                      <Search className="absolute left-3.5 top-3.5 text-[#555]" size={15} />
                    </div>
                  </div>
                  <div className="field-label w-full">
                    <span>Lead Status</span>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="!min-h-11">
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="field-label w-full">
                    <span>Payment Status</span>
                    <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="!min-h-11">
                      <option value="">All Payments</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed / Paid</option>
                      <option value="failed">Failed / Abandoned</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-[#242424] bg-[#0A0A0A] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#242424] text-xs uppercase tracking-wider text-[#A3A3A3] bg-black/30">
                          <th className="py-4 px-6 font-semibold">Name</th>
                          <th className="py-4 px-6 font-semibold">Phone</th>
                          <th className="py-4 px-6 font-semibold text-center">Seats</th>
                          <th className="py-4 px-6 font-semibold">Plan</th>
                          <th className="py-4 px-6 font-semibold">Lead Status</th>
                          <th className="py-4 px-6 font-semibold">Payment</th>
                          <th className="py-4 px-6 font-semibold text-center">Zoho Sync</th>
                          <th className="py-4 px-6 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {loading ? (
                          <tr><td colSpan="8" className="py-20 text-center text-[#A3A3A3] animate-pulse">Loading leads data...</td></tr>
                        ) : filteredReservations.length === 0 ? (
                          <tr><td colSpan="8" className="py-20 text-center text-[#A3A3A3]">No matched reservations found.</td></tr>
                        ) : (
                          filteredReservations.map((res) => (
                            <tr key={res._id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 font-semibold text-[#F1F1F1]">
                                <div>
                                  <p>{res.name}</p>
                                  <p className="text-[10px] text-[#A3A3A3] font-normal mt-0.5">{new Date(res.createdAt).toLocaleDateString()}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-[#b5b1a7]">{res.phone}</td>
                              <td className="py-4 px-6 text-center font-bold text-[#F8BC06]">{res.seatNumbers?.length || 0}</td>
                              <td className="py-4 px-6 text-xs text-[#b5b1a7]">{res.plan}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  res.status === 'confirmed' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' :
                                  res.status === 'contacted' ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30' :
                                  (res.status === 'refunded' || res.status === 'cancelled') ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' :
                                  'bg-white/10 text-white border border-white/20'
                                }`}>{res.status}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  res.paymentStatus === 'confirmed' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' :
                                  res.paymentStatus === 'failed' ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' :
                                  res.paymentStatus === 'refunded' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                  'bg-white/10 text-white border border-white/20'
                                }`}>{res.paymentStatus === 'confirmed' ? 'paid' : res.paymentStatus}</span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {res.crmSyncStatus === 'success' ? (
                                  <span className="text-[#22c55e] text-xs flex items-center justify-center gap-1 font-semibold"><CheckCircle2 size={12} /> Sync</span>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-[#ef4444] text-xs flex items-center gap-1 font-semibold"><AlertCircle size={12} /> Fail</span>
                                    <button onClick={() => handleRetryCRM(res._id)} className="text-[9px] font-bold uppercase tracking-wider text-[#F8BC06] border-b border-[#F8BC06]/30 hover:border-[#F8BC06]">Retry</button>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button onClick={() => openLeadDetails(res)} className="text-xs font-bold uppercase tracking-wider text-[#F8BC06] hover:text-white">
                                  Edit details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SEAT INVENTORY ────────────────────────────────────────────── */}
            {activePanel === 'seats' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Seat Inventory</h2>
                <div className="bg-[#0A0A0A] border border-[#242424] p-5">
                  <p className="text-sm font-semibold">Live Seat Inventory Override</p>
                  <p className="text-xs text-[#A3A3A3] mt-1">Directly change any desk to Available, Reserved (offline), or Staff-Reserved.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                  <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-6">
                    <h3 className="font-display text-lg border-b border-[#242424] pb-3 text-[#F8BC06]">Desks Layout Grid</h3>
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 max-h-[500px] overflow-y-auto pr-2">
                      {seats.map((seat) => (
                        <button
                          key={seat._id}
                          onClick={() => openSeatOverride(seat)}
                          className={`p-3 border text-xs font-semibold flex flex-col justify-between items-center text-center transition-all ${
                            seat.isStaff ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]' :
                            seat.status === 'reserved' ? 'border-[#242424] bg-white/5 text-[#888]' :
                            'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                          }`}
                        >
                          <span className="text-[10px] uppercase text-white/55 font-mono mb-2">{seat.zone}</span>
                          <span className="text-base font-bold mb-2">{seat.label}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider block">
                            {seat.isStaff ? 'Staff' : seat.status === 'reserved' ? 'Locked' : 'Open'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    {selectedSeat ? (
                      <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-6">
                        <h3 className="font-display text-lg border-b border-[#242424] pb-3 text-[#F8BC06]">
                          Modify Seat: {selectedSeat.zone}-{selectedSeat.label}
                        </h3>
                        <label className="field-label">
                          <span>Manual Status Override</span>
                          <select value={seatOverrideStatus} onChange={(e) => setSeatOverrideStatus(e.target.value)}>
                            <option value="Available">Available (Open for booking)</option>
                            <option value="Reserved">Reserved (Offline Lock)</option>
                            <option value="Staff-Reserved">Staff-Reserved (Hidden)</option>
                          </select>
                        </label>
                        <div className="flex gap-4 justify-end">
                          <button onClick={() => setSelectedSeat(null)} className="button button-outline button-small">Cancel</button>
                          <button onClick={handleUpdateSeatStatus} disabled={updatingSeat} className="button button-primary button-small">
                            {updatingSeat ? 'Saving...' : 'Apply Status'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#242424] bg-white/[0.01] p-12 text-center text-[#A3A3A3] text-sm">
                        Select a desk to modify its availability.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── CRM SYNC LOGS ─────────────────────────────────────────────── */}
            {activePanel === 'logs' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">CRM Sync Logs</h2>
                <div className="bg-[#0A0A0A] border border-[#242424] p-5">
                  <p className="text-sm font-semibold">Zoho Bigin CRM Synchronization Logs</p>
                  <p className="text-xs text-[#A3A3A3] mt-1">Monitor API pipeline sync outputs. Click "Retry" on any failures to force sync.</p>
                </div>
                <div className="border border-[#242424] bg-[#0A0A0A] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#242424] text-xs uppercase tracking-wider text-[#A3A3A3] bg-black/30">
                          <th className="py-4 px-6 font-semibold">Lead Contact</th>
                          <th className="py-4 px-6 font-semibold">Sync Stage</th>
                          <th className="py-4 px-6 font-semibold text-center">Status</th>
                          <th className="py-4 px-6 font-semibold">Error Message</th>
                          <th className="py-4 px-6 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {reservations.map((res) => (
                          <tr key={res._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6 font-semibold text-white">
                              <p>{res.name}</p>
                              <p className="text-xs text-[#A3A3A3] font-normal">{res.phone}</p>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs">{res.crmStage || 'New Lead'}</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                                res.crmSyncStatus === 'success' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                              }`}>{res.crmSyncStatus}</span>
                            </td>
                            <td className="py-4 px-6 text-xs text-[#A3A3A3] max-w-xs truncate" title={res.crmSyncError}>{res.crmSyncError || 'None'}</td>
                            <td className="py-4 px-6 text-right">
                              <button onClick={() => handleRetryCRM(res._id)} className="button button-outline button-small">Force Retry</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Lead details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0A0A0A] border border-[#242424] p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedLead(null)} className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white"><X size={20} /></button>
            <h2 className="font-display text-2xl tracking-wider text-white mb-6 border-b border-[#242424] pb-4">
              Lead Detail: {selectedLead.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 mb-6">
              <div><p className="text-xs uppercase text-[#A3A3A3] tracking-wider mb-1">Phone</p><p className="text-sm font-semibold">{selectedLead.phone}</p></div>
              <div><p className="text-xs uppercase text-[#A3A3A3] tracking-wider mb-1">Seats Selected</p><p className="text-sm font-semibold text-[#F8BC06]">{selectedLead.seatNumbers?.join(', ') || 'None'}</p></div>
              <div><p className="text-xs uppercase text-[#A3A3A3] tracking-wider mb-1">Plan</p><p className="text-sm font-semibold">{selectedLead.plan}</p></div>
              <div><p className="text-xs uppercase text-[#A3A3A3] tracking-wider mb-1">Registered</p><p className="text-sm font-semibold">{new Date(selectedLead.createdAt).toLocaleString()}</p></div>
              <div><p className="text-xs uppercase text-[#A3A3A3] tracking-wider mb-1">UTM Source / Campaign</p><p className="text-sm font-semibold">{selectedLead.utmSource || 'N/A'} / {selectedLead.utmCampaign || 'N/A'}</p></div>
              <div><p className="text-xs uppercase text-[#A3A3A3] tracking-wider mb-1">Razorpay ID & Deposit</p><p className="text-sm font-semibold">{selectedLead.razorpayPaymentId || 'N/A'} (₹{selectedLead.amount})</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <label className="field-label">
                <span>Lead Status</span>
                <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
              <label className="field-label">
                <span>Payment Status</span>
                <select value={modalPayment} onChange={(e) => setModalPayment(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed / Paid</option>
                  <option value="failed">Failed / Abandoned</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
              {(modalStatus === 'refunded' || modalPayment === 'refunded') && (
                <label className="field-label">
                  <span>Refund Type</span>
                  <select value={modalRefundType} onChange={(e) => setModalRefundType(e.target.value)}>
                    <option value="none">None</option>
                    <option value="pre_launch">Pre-Launch Deposit</option>
                    <option value="post_opening_guarantee">Post-Opening Guarantee</option>
                  </select>
                </label>
              )}
            </div>
            {selectedLead.crmSyncStatus === 'failed' && (
              <div className="border border-[#ef4444]/20 bg-[#ef4444]/5 p-3 text-xs text-[#ef4444] mb-6 flex justify-between items-center">
                <span><strong>CRM Sync Failed:</strong> {selectedLead.crmSyncError || 'Unknown Error'}</span>
                <button onClick={() => handleRetryCRM(selectedLead._id)} className="bg-[#ef4444]/20 px-2 py-1 uppercase tracking-wider font-bold text-white hover:bg-[#ef4444]/30">Retry Now</button>
              </div>
            )}
            <label className="field-label mb-6">
              <span>Internal Team Notes</span>
              <textarea value={modalNotes} onChange={(e) => setModalNotes(e.target.value)} placeholder="Type notes after calls here..." className="w-full min-h-[90px] border border-[#242424] bg-[#0A0A0A] text-white p-3 text-sm focus:outline-none focus:border-[#F8BC06]" />
            </label>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setSelectedLead(null)} className="button button-outline button-small">Cancel</button>
              <button onClick={handleUpdateLead} disabled={updatingLead} className="button button-primary button-small">
                {updatingLead ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
