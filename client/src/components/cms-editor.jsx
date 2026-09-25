import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Copy, Image, Video, Eye, EyeOff } from 'lucide-react';

// â”€â”€â”€ PRIMITIVE FORM COMPONENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Field({ label, children, className = '' }) {
  return (
    <label className={`field-label ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder = '', type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function TextArea({ value, onChange, rows = 3, placeholder = '' }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full min-h-[70px] border border-[#242424] bg-[#0A0A0A] text-white p-3 text-sm focus:outline-none focus:border-[#04B8BB] resize-y"
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
        className={`relative w-9 h-[18px] rounded-full transition-colors shrink-0 ${checked ? 'bg-[#04B8BB]' : 'bg-[#333]'}`}
      >
        <span className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${checked ? 'translate-x-[18px]' : ''}`} />
      </button>
      {label && <span className="text-xs text-[#A3A3A3]">{label}</span>}
    </label>
  );
}

export function MediaField({ label, value, onChange, onUpload, accept = 'image/*' }) {
  const url = typeof value === 'string' ? value : (value?.url || '');
  const isImage = accept.includes('image');
  const isVideo = accept.includes('video');

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Determine metadata
  let details = [];
  let altText = '';

  if (typeof value === 'object' && value !== null) {
    altText = value.alt || '';
    if (value.publicId) {
      details.push('Cloudinary');
    }
    if (value.width && value.height) {
      details.push(`${value.width} Ã— ${value.height}`);
    }
    if (value.format) {
      details.push(value.format.toUpperCase());
    }
  }

  const handleAltChange = (newAlt) => {
    const baseValue = typeof value === 'string' ? { url: value } : (value || { url: '' });
    onChange({
      target: {
        value: {
          ...baseValue,
          alt: newAlt
        }
      }
    });
  };

  const handleUrlChange = (newUrl) => {
    if (typeof value === 'object' && value !== null) {
      onChange({
        target: {
          value: {
            ...value,
            url: newUrl
          }
        }
      });
    } else {
      onChange({ target: { value: newUrl } });
    }
  };

  const handleRemove = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <Field label={label}>
      <div className="space-y-3 mt-1">
        {/* Preview Frame */}
        {url ? (
          <div className="border border-[#242424] bg-[#0E0E0E] p-3 rounded flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Visual Thumbnail */}
            <div className="relative w-24 h-24 bg-[#050505] border border-[#242424] flex items-center justify-center overflow-hidden rounded shrink-0">
              {isVideo || url.endsWith('.mp4') ? (
                <video src={url} className="w-full h-full object-cover pointer-events-none grayscale opacity-60" />
              ) : (
                <img src={url} alt={altText || 'Preview'} className="w-full h-full object-cover grayscale opacity-70" />
              )}
            </div>

            {/* Metadata & Actions */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                {details.map((d, i) => (
                  <span key={i} className="text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#A3A3A3] px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                    {d}
                  </span>
                ))}
                {url.startsWith('/uploads/') && (
                  <span className="text-[10px] bg-[#3A1E1E] border border-[#5A2E2E] text-[#FF5A5A] px-2 py-0.5 rounded font-bold">
                    Local Path
                  </span>
                )}
              </div>

              {/* Alt Text Input */}
              {isImage && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3] font-bold">Alt Description (SEO):</span>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => handleAltChange(e.target.value)}
                    placeholder="Describe this image for screen readers and SEO..."
                    className="w-full bg-[#151515] border border-[#242424] text-xs text-[#F1F1F1] px-3 py-1.5 focus:border-[#04B8BB] focus:outline-none transition-colors rounded"
                  />
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <label className="button button-outline button-small cursor-pointer gap-1.5 py-1.5 text-[10px] uppercase tracking-wider font-bold !min-h-[28px]">
                  {accept.includes('video') ? <Video size={11} /> : <Image size={11} />}
                  Replace
                  <input type="file" accept={accept} className="hidden" onChange={onUpload} />
                </label>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="button button-outline button-small border-[#3A1E1E] hover:border-[#FF5A5A] text-[#FF5A5A] hover:bg-[#FF5A5A]/5 py-1.5 text-[10px] uppercase tracking-wider font-bold !min-h-[28px]"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[10px] text-[#A3A3A3] hover:text-[#04B8BB] ml-auto"
                >
                  {showAdvanced ? 'Hide Link' : 'Advanced Link'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Trigger State */
          <div className="border border-dashed border-[#333] hover:border-[#04B8BB] transition-colors bg-[#080808] p-6 text-center rounded">
            <label className="cursor-pointer inline-flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#242424] flex items-center justify-center text-[#A3A3A3]">
                {accept.includes('video') ? <Video size={16} /> : <Plus size={16} />}
              </div>
              <span className="text-xs text-[#A3A3A3] font-bold uppercase tracking-wider">
                Click to upload {isImage ? 'image' : 'video'}
              </span>
              <span className="text-[10px] text-[#555] font-semibold">
                JPG, PNG, WebP, SVG, MP4, MOV (max 50MB)
              </span>
              <input type="file" accept={accept} className="hidden" onChange={onUpload} />
            </label>
          </div>
        )}

        {/* Advanced Section for manually editing the URL */}
        {(showAdvanced || !url) && (
          <div className="space-y-1">
            {url && <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3] font-bold">Direct URL / Path:</span>}
            <div className="flex gap-2">
              <TextInput value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://... or /uploads/..." />
              {!url && (
                <label className="button button-outline button-small cursor-pointer shrink-0 !min-h-[52px] gap-1.5">
                  {accept.includes('video') ? <Video size={13} /> : <Image size={13} />}
                  Upload
                  <input type="file" accept={accept} className="hidden" onChange={onUpload} />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

// â”€â”€â”€ SECTION PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionPanel({ number, title, children }) {
  return (
    <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-6">
      <h3 className="font-display text-lg tracking-wider border-b border-[#242424] pb-3 text-[#04B8BB]">
        {number}. {title}
      </h3>
      {children}
    </div>
  );
}

function FieldGroup({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#A3A3A3] border-b border-[#1a1a1a] pb-2">{title}</p>
      {children}
    </div>
  );
}

// â”€â”€â”€ REPEATABLE BLOCK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Reusable component for all dynamic/repeatable content lists.

function RepeatableBlock({
  items = [],
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  renderItem,
  addLabel = 'Add Item',
  emptyLabel = 'No items yet. Click below to add.',
  itemLabel = 'Item',
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="border border-dashed border-[#333] p-8 text-center text-[#A3A3A3] text-sm">
          {emptyLabel}
        </div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="border border-[#242424] bg-[#060606] overflow-hidden">
            {/* Card header with controls */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0A] border-b border-[#242424]">
              <span className="font-mono text-[11px] font-bold tracking-[.15em] text-[#04B8BB] uppercase">
                {itemLabel} {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onMoveUp(idx)}
                  disabled={idx === 0}
                  title="Move up"
                  className="p-1.5 text-[#555] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveDown(idx)}
                  disabled={idx === items.length - 1}
                  title="Move down"
                  className="p-1.5 text-[#555] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(idx)}
                  title="Duplicate"
                  className="p-1.5 text-[#555] hover:text-[#04B8BB] transition-colors rounded flex items-center gap-1"
                >
                  <Copy size={13} />
                </button>
                <div className="w-px h-4 bg-[#333] mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${itemLabel} ${String(idx + 1).padStart(2, '0')}?`)) {
                      onRemove(idx);
                    }
                  }}
                  title="Delete"
                  className="p-1.5 text-[#555] hover:text-[#ef4444] transition-colors rounded"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {/* Item content */}
            <div className="p-4 space-y-4">
              {renderItem(item, idx)}
            </div>
          </div>
        ))
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={() => onAdd()}
        className="w-full border border-dashed border-[#333] bg-transparent text-[#A3A3A3] hover:border-[#04B8BB] hover:text-[#04B8BB] transition-all py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

// â”€â”€â”€ MAIN CMS EDITOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CmsEditor({
  cmsDraft,
  onFieldChange,
  onNestedChange,
  onTopLevelArrayChange,
  onTierItemsChange,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onDuplicateItem,
  onUpload,
}) {
  if (!cmsDraft) return null;

  // Helper: creates standard RepeatableBlock handlers for nested arrays
  const nested = (section, field, defaultItem = {}) => ({
    onAdd: () => onAddItem(section, field, defaultItem),
    onRemove: (idx) => onRemoveItem(section, field, idx),
    onMoveUp: (idx) => onMoveItem(section, field, idx, -1),
    onMoveDown: (idx) => onMoveItem(section, field, idx, 1),
    onDuplicate: (idx) => onDuplicateItem(section, field, idx),
  });

  // Helper: creates standard RepeatableBlock handlers for top-level arrays (e.g., faq)
  const topLevel = (key, defaultItem = {}) => ({
    onAdd: () => onAddItem(key, null, defaultItem),
    onRemove: (idx) => onRemoveItem(key, null, idx),
    onMoveUp: (idx) => onMoveItem(key, null, idx, -1),
    onMoveDown: (idx) => onMoveItem(key, null, idx, 1),
    onDuplicate: (idx) => onDuplicateItem(key, null, idx),
  });

  return (
    <div className="space-y-8">
      <SectionPanel number="00" title="Header & Footer">
        <FieldGroup title="Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Header phone number">
              <TextInput
                value={cmsDraft.header?.phone}
                onChange={(e) => onFieldChange('header', 'phone', e.target.value)}
              />
            </Field>
            <Field label="Footer tagline">
              <TextInput
                value={cmsDraft.footer?.tagline}
                onChange={(e) => onFieldChange('footer', 'tagline', e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Footer Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Footer address">
              <TextArea
                value={cmsDraft.footer?.address}
                onChange={(e) => onFieldChange('footer', 'address', e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Footer phone">
              <TextInput
                value={cmsDraft.footer?.phone}
                onChange={(e) => onFieldChange('footer', 'phone', e.target.value)}
              />
            </Field>
            <Field label="Footer email">
              <TextInput
                value={cmsDraft.footer?.email}
                onChange={(e) => onFieldChange('footer', 'email', e.target.value)}
              />
            </Field>
            <Field label="WhatsApp number">
              <TextInput
                value={cmsDraft.footer?.whatsapp}
                onChange={(e) => onFieldChange('footer', 'whatsapp', e.target.value)}
              />
            </Field>
            <Field label="Google Maps embed URL" className="sm:col-span-2">
              <TextArea
                value={cmsDraft.location?.mapEmbedSrc}
                onChange={(e) => onFieldChange('location', 'mapEmbedSrc', e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Google Maps directions link" className="sm:col-span-2">
              <TextArea
                value={cmsDraft.location?.directionsUrl}
                onChange={(e) => onFieldChange('location', 'directionsUrl', e.target.value)}
                rows={2}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Footer Quick Links">
          <RepeatableBlock
            items={cmsDraft.footer?.quickLinks || []}
            {...nested('footer', 'quickLinks', { label: '', href: '' })}
            itemLabel="Link"
            addLabel="Add Quick Link"
            emptyLabel="No quick links added yet."
            renderItem={(link, idx) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label">
                  <TextInput
                    value={link.label}
                    onChange={(e) => onNestedChange('footer', 'quickLinks', idx, 'label', e.target.value)}
                  />
                </Field>
                <Field label="URL / href">
                  <TextInput
                    value={link.href}
                    onChange={(e) => onNestedChange('footer', 'quickLinks', idx, 'href', e.target.value)}
                    placeholder="#section or https://..."
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 01. HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="01" title="Hero Section">
        <FieldGroup title="Text Content">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow label (above headline)">
              <TextInput
                value={cmsDraft.hero?.eyebrow}
                onChange={(e) => onFieldChange('hero', 'eyebrow', e.target.value)}
                placeholder="RAIPUR'S FOUNDERS' WORKSPACE"
              />
            </Field>
            <Field label="Location / Address line">
              <TextInput
                value={cmsDraft.hero?.location}
                onChange={(e) => onFieldChange('hero', 'location', e.target.value)}
              />
            </Field>
            <Field label="Headline (use new lines for visual breaks)" className="sm:col-span-2">
              <TextArea
                value={cmsDraft.hero?.headline}
                onChange={(e) => onFieldChange('hero', 'headline', e.target.value)}
                rows={3}
                placeholder={"Not Just a Desk.\nYour Complete Founder's Operating System."}
              />
            </Field>
            <Field label="Subheadline" className="sm:col-span-2">
              <TextArea
                value={cmsDraft.hero?.subheadline}
                onChange={(e) => onFieldChange('hero', 'subheadline', e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="CTAs">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary CTA Label">
              <TextInput
                value={cmsDraft.hero?.primaryCtaLabel}
                onChange={(e) => onFieldChange('hero', 'primaryCtaLabel', e.target.value)}
              />
            </Field>
            <Field label="Primary CTA URL">
              <TextInput
                value={cmsDraft.hero?.primaryCtaUrl}
                onChange={(e) => onFieldChange('hero', 'primaryCtaUrl', e.target.value)}
              />
            </Field>
            <Field label="Secondary CTA Label">
              <TextInput
                value={cmsDraft.hero?.secondaryCtaLabel}
                onChange={(e) => onFieldChange('hero', 'secondaryCtaLabel', e.target.value)}
              />
            </Field>
            <Field label="Secondary CTA URL">
              <TextInput
                value={cmsDraft.hero?.secondaryCtaUrl}
                onChange={(e) => onFieldChange('hero', 'secondaryCtaUrl', e.target.value)}
              />
            </Field>
            <Field label="Founding price note (below CTAs)" className="sm:col-span-2">
              <TextInput
                value={cmsDraft.hero?.foundingPriceNote}
                onChange={(e) => onFieldChange('hero', 'foundingPriceNote', e.target.value)}
                placeholder="Founding plan from â‚¹5,999 / month Â· Rate locked for founding batch"
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Background Media">
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaField
              label="Background video URL"
              value={cmsDraft.hero?.videoUrl}
              onChange={(e) => onFieldChange('hero', 'videoUrl', e.target.value)}
              onUpload={(e) => onUpload('hero', 'videoUrl', e)}
              accept="video/*"
            />
            <MediaField
              label="Fallback image URL"
              value={cmsDraft.hero?.imageUrl}
              onChange={(e) => onFieldChange('hero', 'imageUrl', e.target.value)}
              onUpload={(e) => onUpload('hero', 'imageUrl', e)}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Stats Bar">
          <RepeatableBlock
            items={cmsDraft.hero?.stats || []}
            {...nested('hero', 'stats', { main: '', sub: '' })}
            itemLabel="Stat"
            addLabel="Add Stat"
            emptyLabel="No stats added yet."
            renderItem={(stat, idx) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Main text (large)">
                  <TextInput
                    value={typeof stat === 'object' ? stat.main : stat}
                    onChange={(e) => onNestedChange('hero', 'stats', idx, 'main', e.target.value)}
                    placeholder="500 Mbps Wifi"
                  />
                </Field>
                <Field label="Sub text (small)">
                  <TextInput
                    value={typeof stat === 'object' ? stat.sub : ''}
                    onChange={(e) => onNestedChange('hero', 'stats', idx, 'sub', e.target.value)}
                    placeholder="High Speed"
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>

        <FieldGroup title="Hero Floating Stat Cards">
          <p className="text-xs text-[#A3A3A3]">Small floating cards shown over the hero (e.g., "50 / Founding Seats").</p>
          <RepeatableBlock
            items={cmsDraft.hero?.floatingStats || []}
            {...nested('hero', 'floatingStats', { value: '', label: '' })}
            itemLabel="Stat Card"
            addLabel="Add Stat Card"
            emptyLabel="No floating stat cards added."
            renderItem={(stat, idx) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Value (large, bold)">
                  <TextInput
                    value={stat.value || ''}
                    onChange={(e) => onNestedChange('hero', 'floatingStats', idx, 'value', e.target.value)}
                    placeholder="50"
                  />
                </Field>
                <Field label="Label (small, muted)">
                  <TextInput
                    value={stat.label || ''}
                    onChange={(e) => onNestedChange('hero', 'floatingStats', idx, 'label', e.target.value)}
                    placeholder="Founding Seats"
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>

        <FieldGroup title="Bottom Metadata Strip">
          <p className="text-xs text-[#A3A3A3]">Small items shown in the metadata bar at the very bottom of the hero.</p>
          <Field label="Meta items (one per line)">
            <TextArea
              value={(cmsDraft.hero?.metaItems || []).join('\n')}
              onChange={(e) => onFieldChange('hero', 'metaItems', e.target.value.split('\n').filter(Boolean))}
              rows={4}
              placeholder={"RAIPUR\nVIP ESTATE\n50 SEATS\nFRI â€” SAT FREE TRIAL"}
            />
          </Field>
          <Field label="Highlight words (comma-separated)">
            <TextInput
              value={cmsDraft.hero?.highlightWords || ''}
              onChange={(e) => onFieldChange('hero', 'highlightWords', e.target.value)}
              placeholder="beautiful, premium"
            />
          </Field>
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 02. PROBLEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="02" title="Problem Section">
        <FieldGroup title="Section Header">
          <Field label="Section headline">
            <TextInput
              value={cmsDraft.problem?.headline}
              onChange={(e) => onFieldChange('problem', 'headline', e.target.value)}
            />
          </Field>
          <Field label="Section body text">
            <TextArea
              value={cmsDraft.problem?.body}
              onChange={(e) => onFieldChange('problem', 'body', e.target.value)}
              rows={4}
            />
          </Field>
          <MediaField
            label="Section image URL"
            value={cmsDraft.problem?.imageUrl}
            onChange={(e) => onFieldChange('problem', 'imageUrl', e.target.value)}
            onUpload={(e) => onUpload('problem', 'imageUrl', e)}
          />
          <div className="grid gap-4 sm:grid-cols-2 pt-1">
            <Field label="Quote card text (overlaps the image)">
              <TextArea
                value={cmsDraft.problem?.quoteText || ''}
                onChange={(e) => onFieldChange('problem', 'quoteText', e.target.value)}
                rows={2}
                placeholder="You're not lazy. Your environment is holding you back."
              />
            </Field>
            <Field label="Quote author (optional)">
              <TextInput
                value={cmsDraft.problem?.quoteAuthor || ''}
                onChange={(e) => onFieldChange('problem', 'quoteAuthor', e.target.value)}
                placeholder="â€” Deven Co-Work"
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Problem Points">
          <p className="text-xs text-[#A3A3A3]">
            Each problem point is numbered automatically from its position. Add as many as you need â€” no maximum.
          </p>
          <RepeatableBlock
            items={cmsDraft.problem?.problemPoints || []}
            {...nested('problem', 'problemPoints', { title: '', description: '' })}
            itemLabel="Problem Point"
            addLabel="Add Problem Point"
            emptyLabel="No problem points added yet. Click below to create the first one."
            renderItem={(point, idx) => (
              <div className="space-y-3">
                <Field label="Title">
                  <TextInput
                    value={point.title}
                    onChange={(e) => onNestedChange('problem', 'problemPoints', idx, 'title', e.target.value)}
                    placeholder="The Dining Table Trap"
                  />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={point.description}
                    onChange={(e) => onNestedChange('problem', 'problemPoints', idx, 'description', e.target.value)}
                    placeholder="Your family loves you, but they are also your loudest distractions..."
                    rows={3}
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>

        <FieldGroup title="Section CTA">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA Label">
              <TextInput
                value={cmsDraft.problem?.cta?.label}
                onChange={(e) => {
                  const cta = { ...(cmsDraft.problem?.cta || {}), label: e.target.value };
                  onFieldChange('problem', 'cta', cta);
                }}
                placeholder="Book Your Free 2-Day Trial"
              />
            </Field>
            <Field label="CTA URL">
              <TextInput
                value={cmsDraft.problem?.cta?.url}
                onChange={(e) => {
                  const cta = { ...(cmsDraft.problem?.cta || {}), url: e.target.value };
                  onFieldChange('problem', 'cta', cta);
                }}
                placeholder="#reservation"
              />
            </Field>
          </div>
          <Toggle
            checked={(cmsDraft.problem?.cta?.enabled) !== false}
            onChange={(v) => {
              const cta = { ...(cmsDraft.problem?.cta || {}), enabled: v };
              onFieldChange('problem', 'cta', cta);
            }}
            label="Show CTA button"
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 03. GUIDE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="03" title="Guide Section">
        <FieldGroup title="Section Text">
          <Field label="Section headline">
            <TextInput
              value={cmsDraft.guide?.headline}
              onChange={(e) => onFieldChange('guide', 'headline', e.target.value)}
            />
          </Field>
          <Field label="Body paragraph 1">
            <TextArea
              value={cmsDraft.guide?.body1}
              onChange={(e) => onFieldChange('guide', 'body1', e.target.value)}
            />
          </Field>
          <Field label="Body paragraph 2">
            <TextArea
              value={cmsDraft.guide?.body2}
              onChange={(e) => onFieldChange('guide', 'body2', e.target.value)}
            />
          </Field>
          <Field label="Gallery section title">
            <TextInput
              value={cmsDraft.guide?.galleryTitle}
              onChange={(e) => onFieldChange('guide', 'galleryTitle', e.target.value)}
              placeholder="A Space Built for Professional Work"
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Gallery Images">
          <p className="text-xs text-[#A3A3A3]">Upload or paste URLs for gallery images. Add as many as needed.</p>
          <RepeatableBlock
            items={cmsDraft.guide?.gallery || []}
            {...nested('guide', 'gallery', { image: '', label: '' })}
            itemLabel="Gallery Image"
            addLabel="Add Gallery Image"
            emptyLabel="No gallery images added yet."
            renderItem={(item, idx) => (
              <div className="space-y-3">
                <MediaField
                  label="Image URL"
                  value={item.image}
                  onChange={(e) => onNestedChange('guide', 'gallery', idx, 'image', e.target.value)}
                  onUpload={(e) => onUpload('guide', 'gallery', e, idx, 'image')}
                />
                {item.image && (
                  <img src={item.image} alt="" className="h-24 w-auto object-cover border border-[#242424] opacity-60" />
                )}
                <Field label="Caption / label">
                  <TextInput
                    value={item.label}
                    onChange={(e) => onNestedChange('guide', 'gallery', idx, 'label', e.target.value)}
                    placeholder="MAIN AREA"
                  />
                </Field>
                <Field label="Caption text (hover reveal)">
                  <TextInput
                    value={item.caption || ''}
                    onChange={(e) => onNestedChange('guide', 'gallery', idx, 'caption', e.target.value)}
                    placeholder="The main workspace floor"
                  />
                </Field>
                <Field label="Size hint">
                  <select
                    value={item.size || 'medium'}
                    onChange={(e) => onNestedChange('guide', 'gallery', idx, 'size', e.target.value)}
                    className="w-full min-h-[44px] border border-[#242424] bg-[#0A0A0A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#04B8BB]"
                  >
                    <option value="large">Large (left column, tall)</option>
                    <option value="medium">Medium</option>
                    <option value="small">Small</option>
                  </select>
                </Field>
              </div>
            )}
          />
        </FieldGroup>

        <FieldGroup title="Feature Blocks">
          <RepeatableBlock
            items={cmsDraft.guide?.blocks || []}
            {...nested('guide', 'blocks', { title: '', description: '' })}
            itemLabel="Block"
            addLabel="Add Feature Block"
            emptyLabel="No feature blocks added yet."
            renderItem={(block, idx) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <TextInput
                    value={block.title}
                    onChange={(e) => onNestedChange('guide', 'blocks', idx, 'title', e.target.value)}
                  />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={block.description}
                    onChange={(e) => onNestedChange('guide', 'blocks', idx, 'description', e.target.value)}
                    rows={2}
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 04. PLAN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="04" title="Plan Section">
        <FieldGroup title="Section Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section headline">
              <TextInput
                value={cmsDraft.plan?.headline}
                onChange={(e) => onFieldChange('plan', 'headline', e.target.value)}
                placeholder="Getting Started Is Simple"
              />
            </Field>
            <Field label="CTA label">
              <TextInput
                value={cmsDraft.plan?.ctaLabel}
                onChange={(e) => onFieldChange('plan', 'ctaLabel', e.target.value)}
                placeholder="Start With Your Free Trial"
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Steps">
          <p className="text-xs text-[#A3A3A3]">Steps are numbered automatically (01, 02, 03â€¦).</p>
          <RepeatableBlock
            items={cmsDraft.plan?.steps || []}
            {...nested('plan', 'steps', { title: '', description: '' })}
            itemLabel="Step"
            addLabel="Add Step"
            emptyLabel="No steps added yet."
            renderItem={(step, idx) => (
              <div className="space-y-3">
                <Field label="Title">
                  <TextInput
                    value={step.title}
                    onChange={(e) => onNestedChange('plan', 'steps', idx, 'title', e.target.value)}
                  />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={step.description}
                    onChange={(e) => onNestedChange('plan', 'steps', idx, 'description', e.target.value)}
                    rows={2}
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 05. OFFER STACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="05" title="Founder's OS / Offer Stack">
        <FieldGroup title="Section Header">
          <Field label="Section headline">
            <TextInput
              value={cmsDraft.offerStack?.headline}
              onChange={(e) => onFieldChange('offerStack', 'headline', e.target.value)}
            />
          </Field>
          <Field label="Section subheadline">
            <TextArea
              value={cmsDraft.offerStack?.subheadline}
              onChange={(e) => onFieldChange('offerStack', 'subheadline', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Tiers">
          <p className="text-xs text-[#A3A3A3]">Each tier is a group of items (e.g., Workspace, Learning, Community). Items within a tier are one item per line.</p>
          <RepeatableBlock
            items={cmsDraft.offerStack?.tiers || []}
            {...nested('offerStack', 'tiers', { heading: '', items: [], isDevenEdge: false })}
            itemLabel="Tier"
            addLabel="Add Tier"
            emptyLabel="No tiers added yet."
            renderItem={(tier, idx) => (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Field label="Tier heading">
                      <TextInput
                        value={tier.heading}
                        onChange={(e) => onNestedChange('offerStack', 'tiers', idx, 'heading', e.target.value)}
                        placeholder="THE WORKSPACE"
                      />
                    </Field>
                  </div>
                  <div className="pt-6">
                    <Toggle
                      checked={!!tier.isDevenEdge}
                      onChange={(v) => onNestedChange('offerStack', 'tiers', idx, 'isDevenEdge', v)}
                      label="DEVEN EDGE badge"
                    />
                  </div>
                </div>
                <Field label="Items (one per line)">
                  <TextArea
                    value={(tier.items || []).join('\n')}
                    onChange={(e) => onTierItemsChange(idx, e.target.value)}
                    rows={6}
                    placeholder={"High-speed WiFi\nMeeting room access\nCoffee bar"}
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 06. VALUE STACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="06" title="Value Stack">
        <FieldGroup title="Section Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section headline">
              <TextInput
                value={cmsDraft.valueStack?.headline}
                onChange={(e) => onFieldChange('valueStack', 'headline', e.target.value)}
              />
            </Field>
            <Field label="Section body text">
              <TextArea
                value={cmsDraft.valueStack?.body}
                onChange={(e) => onFieldChange('valueStack', 'body', e.target.value)}
              />
            </Field>
            <Field label="Total value display (e.g. â‚¹25,000+/month)">
              <TextInput
                value={cmsDraft.valueStack?.totalValue}
                onChange={(e) => onFieldChange('valueStack', 'totalValue', e.target.value)}
                placeholder="â‚¹25,000+/month"
              />
            </Field>
            <Field label="Founding price display (e.g. From â‚¹5,999/month)">
              <TextInput
                value={cmsDraft.valueStack?.foundingPrice}
                onChange={(e) => onFieldChange('valueStack', 'foundingPrice', e.target.value)}
                placeholder="From â‚¹5,999/month"
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Value Items">
          <p className="text-xs text-[#A3A3A3]">
            Items are numbered automatically (01, 02â€¦). Toggle visibility to temporarily hide a row without deleting it.
            The Display Value field is what visitors see (e.g., "â‚¹10,000/mo"). The Value field is optional for future auto-totalling.
          </p>
          <RepeatableBlock
            items={cmsDraft.valueStack?.valueItems || []}
            {...nested('valueStack', 'valueItems', { title: '', value: 0, displayValue: '', visible: true })}
            itemLabel="Value Item"
            addLabel="Add Value Item"
            emptyLabel="No value items added yet. Click below to add the first row."
            renderItem={(item, idx) => (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Item name / description">
                    <TextInput
                      value={item.title}
                      onChange={(e) => onNestedChange('valueStack', 'valueItems', idx, 'title', e.target.value)}
                      placeholder="Dedicated Workspace"
                    />
                  </Field>
                  <Field label="Display value (shown to visitors)">
                    <TextInput
                      value={item.displayValue}
                      onChange={(e) => onNestedChange('valueStack', 'valueItems', idx, 'displayValue', e.target.value)}
                      placeholder="â‚¹10,000/mo"
                    />
                  </Field>
                  <Field label="Numeric value (optional, for totals)">
                    <TextInput
                      type="number"
                      value={item.value || ''}
                      onChange={(e) => onNestedChange('valueStack', 'valueItems', idx, 'value', Number(e.target.value))}
                      placeholder="10000"
                    />
                  </Field>
                <div className="flex items-end pb-2 gap-8">
                    <Toggle
                      checked={item.visible !== false}
                      onChange={(v) => onNestedChange('valueStack', 'valueItems', idx, 'visible', v)}
                      label="Visible on site"
                    />
                    <Toggle
                      checked={!!item.highlighted}
                      onChange={(v) => onNestedChange('valueStack', 'valueItems', idx, 'highlighted', v)}
                      label="Highlighted row (cyan accent)"
                    />
                  </div>
                </div>
                <Field label="Extended description (optional)">
                  <TextInput
                    value={item.description || ''}
                    onChange={(e) => onNestedChange('valueStack', 'valueItems', idx, 'description', e.target.value)}
                    placeholder="Optional short description..."
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 07. GUARANTEE / RISK REVERSAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="07" title="Guarantee / Risk Reversal">
        <FieldGroup title="Section Header">
          <Field label="Section headline (use \\n for line breaks)">
            <TextArea
              value={cmsDraft.riskReversal?.headline}
              onChange={(e) => onFieldChange('riskReversal', 'headline', e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Section body / subheadline">
            <TextArea
              value={cmsDraft.riskReversal?.subheadline}
              onChange={(e) => onFieldChange('riskReversal', 'subheadline', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Guarantee Blocks">
          <RepeatableBlock
            items={cmsDraft.riskReversal?.blocks || []}
            {...nested('riskReversal', 'blocks', { title: '', description: '' })}
            itemLabel="Block"
            addLabel="Add Guarantee Block"
            emptyLabel="No guarantee blocks added yet."
            renderItem={(block, idx) => (
              <div className="space-y-3">
                <Field label="Title">
                  <TextInput
                    value={block.title}
                    onChange={(e) => onNestedChange('riskReversal', 'blocks', idx, 'title', e.target.value)}
                  />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={block.description}
                    onChange={(e) => onNestedChange('riskReversal', 'blocks', idx, 'description', e.target.value)}
                    rows={3}
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>

        <FieldGroup title="Closing Text &amp; CTA">
          <Field label="Closing paragraph (shown below guarantee blocks)">
            <TextArea
              value={cmsDraft.riskReversal?.closingText}
              onChange={(e) => onFieldChange('riskReversal', 'closingText', e.target.value)}
              rows={3}
              placeholder="We can offer this guarantee because we've built something we're genuinely proud of."
            />
          </Field>
          <Field label="CTA button label">
            <TextInput
              value={cmsDraft.riskReversal?.ctaLabel}
              onChange={(e) => onFieldChange('riskReversal', 'ctaLabel', e.target.value)}
              placeholder="Book My Free 2-Day Trial"
            />
          </Field>
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 08. SOCIAL PROOF / TESTIMONIALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="08" title="Social Proof / Testimonials">
        <FieldGroup title="Section Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section headline">
              <TextInput
                value={cmsDraft.socialProof?.headline}
                onChange={(e) => onFieldChange('socialProof', 'headline', e.target.value)}
              />
            </Field>
            <Field label="Section subheadline">
              <TextArea
                value={cmsDraft.socialProof?.subheadline}
                onChange={(e) => onFieldChange('socialProof', 'subheadline', e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Google Reviews">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rating (e.g. 4.9)">
              <TextInput
                value={cmsDraft.socialProof?.googleRating}
                onChange={(e) => onFieldChange('socialProof', 'googleRating', parseFloat(e.target.value) || 0)}
                placeholder="4.9"
                type="number"
                step="0.1"
                min="0"
                max="5"
              />
            </Field>
            <Field label="Review count">
              <TextInput
                value={cmsDraft.socialProof?.googleReviewCount}
                onChange={(e) => onFieldChange('socialProof', 'googleReviewCount', parseInt(e.target.value) || 0)}
                placeholder="48"
                type="number"
              />
            </Field>
            <Field label="Google Reviews link">
              <TextInput
                value={cmsDraft.socialProof?.googleReviewUrl}
                onChange={(e) => onFieldChange('socialProof', 'googleReviewUrl', e.target.value)}
                placeholder="https://g.page/..."
              />
            </Field>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">Set Rating to 0 to hide the Google review bar on the frontend.</p>
        </FieldGroup>

        <FieldGroup title="Testimonials">
          <p className="text-xs text-[#A3A3A3]">Toggle &ldquo;Published&rdquo; off to hide a testimonial without deleting it. Use &ldquo;Order&rdquo; to control display sequence.</p>
          <RepeatableBlock
            items={cmsDraft.socialProof?.testimonials || []}
            {...nested('socialProof', 'testimonials', { photo: '', quote: '', author: '', company: '', role: '', order: 0, published: true })}
            itemLabel="Testimonial"
            addLabel="Add Testimonial"
            emptyLabel="No testimonials added yet."
            renderItem={(t, idx) => (
              <div className="space-y-3">
                <MediaField
                  label="Photo (headshot)"
                  value={t.photo}
                  onChange={(val) => onNestedChange('socialProof', 'testimonials', idx, 'photo', val)}
                  onUpload={(e) => onUpload('socialProof', 'testimonials', e, idx, 'photo')}
                  accept="image/*"
                />
                <Field label="Quote">
                  <TextArea
                    value={t.quote}
                    onChange={(e) => onNestedChange('socialProof', 'testimonials', idx, 'quote', e.target.value)}
                    placeholder="This space completely changed how I work..."
                    rows={3}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full Name">
                    <TextInput
                      value={t.author}
                      onChange={(e) => onNestedChange('socialProof', 'testimonials', idx, 'author', e.target.value)}
                      placeholder="Rahul Sharma"
                    />
                  </Field>
                  <Field label="Company / Business">
                    <TextInput
                      value={t.company}
                      onChange={(e) => onNestedChange('socialProof', 'testimonials', idx, 'company', e.target.value)}
                      placeholder="Founder, TechCo Raipur"
                    />
                  </Field>
                  <Field label="Role (optional)">
                    <TextInput
                      value={t.role}
                      onChange={(e) => onNestedChange('socialProof', 'testimonials', idx, 'role', e.target.value)}
                      placeholder="Freelance Designer"
                    />
                  </Field>
                  <Field label="Display order (lower = first)">
                    <TextInput
                      value={t.order}
                      onChange={(e) => onNestedChange('socialProof', 'testimonials', idx, 'order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      type="number"
                    />
                  </Field>
                </div>
                <Toggle
                  checked={t.published !== false}
                  onChange={(v) => onNestedChange('socialProof', 'testimonials', idx, 'published', v)}
                  label="Published (visible on site)"
                />
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 09. PRICING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="09" title="Pricing Section">
        <FieldGroup title="Section Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section headline">
              <TextInput
                value={cmsDraft.pricing?.headline}
                onChange={(e) => onFieldChange('pricing', 'headline', e.target.value)}
              />
            </Field>
            <Field label="Section subheadline">
              <TextArea
                value={cmsDraft.pricing?.subheadline}
                onChange={(e) => onFieldChange('pricing', 'subheadline', e.target.value)}
              />
            </Field>
            <Field label="Spots left display (e.g. 12 or [X])">
              <TextInput
                value={cmsDraft.pricing?.spotsLeft}
                onChange={(e) => onFieldChange('pricing', 'spotsLeft', e.target.value)}
                placeholder="[X]"
              />
            </Field>
            <Field label="Closes date display (e.g. 30 September 2026)">
              <TextInput
                value={cmsDraft.pricing?.closesDate}
                onChange={(e) => onFieldChange('pricing', 'closesDate', e.target.value)}
              />
            </Field>
            <Field label="Sticky scarcity note" className="sm:col-span-2">
              <TextInput
                value={cmsDraft.pricing?.stickyScarcityNote}
                onChange={(e) => onFieldChange('pricing', 'stickyScarcityNote', e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Pricing Plans">
          <p className="text-xs text-[#A3A3A3]">Each plan appears as a row in the pricing table. Add as many as needed.</p>
          <RepeatableBlock
            items={cmsDraft.pricing?.plans || []}
            {...nested('pricing', 'plans', { name: '', standard: '', founding: '', desc: '' })}
            itemLabel="Plan"
            addLabel="Add Pricing Plan"
            emptyLabel="No pricing plans added yet."
            renderItem={(plan, idx) => (
              <div className="space-y-3">
                <Field label="Plan name">
                  <TextInput
                    value={plan.name}
                    onChange={(e) => onNestedChange('pricing', 'plans', idx, 'name', e.target.value)}
                    placeholder="Hot Desk"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Standard (strikethrough) price">
                    <TextInput
                      value={plan.standard}
                      onChange={(e) => onNestedChange('pricing', 'plans', idx, 'standard', e.target.value)}
                      placeholder="â‚¹7,500/mo"
                    />
                  </Field>
                  <Field label="Founding member price">
                    <TextInput
                      value={plan.founding}
                      onChange={(e) => onNestedChange('pricing', 'plans', idx, 'founding', e.target.value)}
                      placeholder="â‚¹5,999/mo"
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <TextArea
                    value={plan.desc}
                    onChange={(e) => onNestedChange('pricing', 'plans', idx, 'desc', e.target.value)}
                    rows={2}
                  />
                </Field>
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 10. FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="10" title="FAQ Section">
        <FieldGroup title="Section Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section headline">
              <TextInput
                value={cmsDraft.faqSection?.headline}
                onChange={(e) => onFieldChange('faqSection', 'headline', e.target.value)}
                placeholder="Before You Come In"
              />
            </Field>
            <Field label="Section subheadline">
              <TextArea
                value={cmsDraft.faqSection?.subheadline}
                onChange={(e) => onFieldChange('faqSection', 'subheadline', e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="FAQ Items">
          <p className="text-xs text-[#A3A3A3]">Toggle "Published" off to temporarily hide an FAQ without deleting it.</p>
          <RepeatableBlock
            items={cmsDraft.faq || []}
            {...topLevel('faq', { question: '', answer: '', published: true })}
            itemLabel="FAQ"
            addLabel="Add FAQ"
            emptyLabel="No FAQ items added yet."
            renderItem={(item, idx) => (
              <div className="space-y-3">
                <Field label="Question">
                  <TextInput
                    value={item.question}
                    onChange={(e) => onTopLevelArrayChange('faq', idx, 'question', e.target.value)}
                    placeholder="Do I need to commit long-term?"
                  />
                </Field>
                <Field label="Answer">
                  <TextArea
                    value={item.answer}
                    onChange={(e) => onTopLevelArrayChange('faq', idx, 'answer', e.target.value)}
                    rows={3}
                    placeholder="No. Month-to-month is available..."
                  />
                </Field>
                <Toggle
                  checked={item.published !== false}
                  onChange={(v) => onTopLevelArrayChange('faq', idx, 'published', v)}
                  label="Published (visible on site)"
                />
              </div>
            )}
          />
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 11. RESERVATION / FINAL CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="11" title="Reservation / Final CTA">
        <FieldGroup title="Final CTA Text">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Headline (use \\n for line breaks)" className="sm:col-span-2">
              <TextArea
                value={cmsDraft.finalCTA?.headline}
                onChange={(e) => onFieldChange('finalCTA', 'headline', e.target.value)}
                rows={3}
              />
            </Field>
            <Field label="Body text" className="sm:col-span-2">
              <TextArea
                value={cmsDraft.finalCTA?.body}
                onChange={(e) => onFieldChange('finalCTA', 'body', e.target.value)}
              />
            </Field>
            <Field label="Primary CTA label">
              <TextInput
                value={cmsDraft.finalCTA?.primaryCtaLabel}
                onChange={(e) => onFieldChange('finalCTA', 'primaryCtaLabel', e.target.value)}
              />
            </Field>
            <Field label="Primary CTA URL">
              <TextInput
                value={cmsDraft.finalCTA?.primaryCtaUrl}
                onChange={(e) => onFieldChange('finalCTA', 'primaryCtaUrl', e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Reservation Form Texts">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section Heading">
              <TextInput
                value={cmsDraft.reservation?.reservationHeading}
                onChange={(e) => onFieldChange('reservation', 'reservationHeading', e.target.value)}
              />
            </Field>
            <Field label="Section Description">
              <TextArea
                value={cmsDraft.reservation?.reservationDescription}
                onChange={(e) => onFieldChange('reservation', 'reservationDescription', e.target.value)}
              />
            </Field>
            <Field label="Scarcity Text Line">
              <TextArea
                value={cmsDraft.reservation?.scarcityText}
                onChange={(e) => onFieldChange('reservation', 'scarcityText', e.target.value)}
              />
            </Field>
            <Field label="Scarcity Note (use {remaining} for live count)">
              <TextArea
                value={cmsDraft.reservation?.scarcityNote}
                onChange={(e) => onFieldChange('reservation', 'scarcityNote', e.target.value)}
              />
            </Field>
            <Field label="Total Founding Seats Capped">
              <TextInput
                type="number"
                value={cmsDraft.reservation?.totalFoundingSeats}
                onChange={(e) => onFieldChange('reservation', 'totalFoundingSeats', parseInt(e.target.value) || 50)}
              />
            </Field>

            <Field label="Custom Joining Date">
              <TextInput
                value={cmsDraft.reservation?.joiningDate}
                onChange={(e) => onFieldChange('reservation', 'joiningDate', e.target.value)}
              />
            </Field>
            <Field label="WhatsApp pre-filled message">
              <TextInput
                value={cmsDraft.reservation?.whatsappMessage}
                onChange={(e) => onFieldChange('reservation', 'whatsappMessage', e.target.value)}
              />
            </Field>
            <Field label="WhatsApp Contact Number">
              <TextInput
                value={cmsDraft.reservation?.whatsappNumber}
                onChange={(e) => onFieldChange('reservation', 'whatsappNumber', e.target.value)}
              />
            </Field>
            <Field label="Email Address Settings">
              <TextInput
                value={cmsDraft.reservation?.reservationEmailSettings}
                onChange={(e) => onFieldChange('reservation', 'reservationEmailSettings', e.target.value)}
              />
            </Field>
            <Field label="Free Trial Button Label">
              <TextInput
                value={cmsDraft.reservation?.trialButtonText}
                onChange={(e) => onFieldChange('reservation', 'trialButtonText', e.target.value)}
              />
            </Field>
            <Field label="WhatsApp Button Label">
              <TextInput
                value={cmsDraft.reservation?.whatsappButtonText}
                onChange={(e) => onFieldChange('reservation', 'whatsappButtonText', e.target.value)}
              />
            </Field>
            <Field label="Paid Reserve Button Label">
              <TextInput
                value={cmsDraft.reservation?.reserveButtonText}
                onChange={(e) => onFieldChange('reservation', 'reserveButtonText', e.target.value)}
              />
            </Field>
            <Field label="Deposit Note Label">
              <TextInput
                value={cmsDraft.reservation?.depositNote}
                onChange={(e) => onFieldChange('reservation', 'depositNote', e.target.value)}
              />
            </Field>
            <Field label="Trial Confirmation Title">
              <TextInput
                value={cmsDraft.reservation?.trialConfirmationTitle}
                onChange={(e) => onFieldChange('reservation', 'trialConfirmationTitle', e.target.value)}
              />
            </Field>
            <Field label="Trial Confirmation Message">
              <TextArea
                value={cmsDraft.reservation?.trialConfirmationMessage}
                onChange={(e) => onFieldChange('reservation', 'trialConfirmationMessage', e.target.value)}
              />
            </Field>
            <Field label="Payment Confirmation Title">
              <TextInput
                value={cmsDraft.reservation?.paymentConfirmationTitle}
                onChange={(e) => onFieldChange('reservation', 'paymentConfirmationTitle', e.target.value)}
              />
            </Field>
            <Field label="Payment Confirmation Message">
              <TextArea
                value={cmsDraft.reservation?.paymentConfirmationMessage}
                onChange={(e) => onFieldChange('reservation', 'paymentConfirmationMessage', e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>
      </SectionPanel>

      {/* â”€â”€ 12. FREE TRIAL SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionPanel number="12" title="Free Trial Settings">
        <FieldGroup title="Trial Configuration">
          <div className="space-y-4">
            <Toggle
              checked={cmsDraft.freeTrial?.enabled !== false}
              onChange={(v) => onFieldChange('freeTrial', 'enabled', v)}
              label="Enable Free Trial bookings"
            />
            
            <Field label="Allowed Days (comma separated)">
              <TextInput
                value={(cmsDraft.freeTrial?.days || []).join(', ')}
                onChange={(e) => {
                  const daysArray = e.target.value.split(',').map(d => d.trim()).filter(Boolean);
                  onFieldChange('freeTrial', 'days', daysArray);
                }}
                placeholder="Friday, Saturday"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Duration Label">
                <TextInput
                  value={cmsDraft.freeTrial?.duration}
                  onChange={(e) => onFieldChange('freeTrial', 'duration', e.target.value)}
                  placeholder="2 Days"
                />
              </Field>
              <Field label="Trial Description" className="sm:col-span-2">
                <TextArea
                  value={cmsDraft.freeTrial?.description}
                  onChange={(e) => onFieldChange('freeTrial', 'description', e.target.value)}
                  placeholder="Visit us Friday & Saturday..."
                  rows={2}
                />
              </Field>
              <Field label="Start Time">
                <TextInput
                  value={cmsDraft.freeTrial?.startTime}
                  onChange={(e) => onFieldChange('freeTrial', 'startTime', e.target.value)}
                  placeholder="09:00 AM"
                />
              </Field>
              <Field label="End Time">
                <TextInput
                  value={cmsDraft.freeTrial?.endTime}
                  onChange={(e) => onFieldChange('freeTrial', 'endTime', e.target.value)}
                  placeholder="09:00 PM"
                />
              </Field>
            </div>
          </div>
        </FieldGroup>
      </SectionPanel>

    </div>
  );
}


