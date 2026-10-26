import { useState } from 'react';
import {
  FileText,
  Target,
  Compass,
  Users,
  MapPin,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Building
} from 'lucide-react';

export default function AdminAboutCMS({ cmsDraft, onChange, onOpenMediaLibrary }) {
  const about = cmsDraft?.about || {};
  const hero = about.hero || {};
  const story = about.story || {};
  const mission = about.mission || {};
  const vision = about.vision || {};
  const audiences = about.audiences || { items: [] };
  const location = about.location || {};
  const seo = about.seo || {};

  const handleHeroChange = (field, val) => {
    onChange('about', 'hero', { ...hero, [field]: val });
  };

  const handleStoryChange = (field, val) => {
    onChange('about', 'story', { ...story, [field]: val });
  };

  const handleStoryParagraphChange = (index, val) => {
    const nextParas = [...(story.paragraphs || [])];
    nextParas[index] = val;
    onChange('about', 'story', { ...story, paragraphs: nextParas });
  };

  const handleAddStoryParagraph = () => {
    const nextParas = [...(story.paragraphs || []), ''];
    onChange('about', 'story', { ...story, paragraphs: nextParas });
  };

  const handleRemoveStoryParagraph = (index) => {
    const nextParas = (story.paragraphs || []).filter((_, i) => i !== index);
    onChange('about', 'story', { ...story, paragraphs: nextParas });
  };

  const handleMissionChange = (field, val) => {
    onChange('about', 'mission', { ...mission, [field]: val });
  };

  const handleVisionChange = (field, val) => {
    onChange('about', 'vision', { ...vision, [field]: val });
  };

  const handleAudienceItemChange = (index, field, val) => {
    const nextItems = [...(audiences.items || [])];
    nextItems[index] = { ...nextItems[index], [field]: val };
    onChange('about', 'audiences', { ...audiences, items: nextItems });
  };

  const handleAddAudienceItem = () => {
    const nextItems = [...(audiences.items || []), { title: '', description: '' }];
    onChange('about', 'audiences', { ...audiences, items: nextItems });
  };

  const handleRemoveAudienceItem = (index) => {
    const nextItems = (audiences.items || []).filter((_, i) => i !== index);
    onChange('about', 'audiences', { ...audiences, items: nextItems });
  };

  const handleSeoChange = (field, val) => {
    onChange('about', 'seo', { ...seo, [field]: val });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#04B8BB]">
          <span className="w-2 h-2 rounded-full bg-[#04B8BB]" />
          PAGE MANAGEMENT
        </div>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#F1F1F1]">
          About Page CMS
        </h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
          Customize the brand narrative, founder story, mission, vision, and audience sections displayed on /about.
        </p>
      </div>

      {/* 1. Hero Section */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-4">
        <h3 className="font-display text-sm font-bold text-[#04B8BB] uppercase tracking-wider border-b border-[#242424] pb-2">
          Hero Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={hero.eyebrow ?? 'ABOUT DEVEN'}
              onChange={(e) => handleHeroChange('eyebrow', e.target.value)}
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
              Main Headline (H1)
            </label>
            <input
              type="text"
              value={hero.headline ?? 'A Space for People Building What\'s Next.'}
              onChange={(e) => handleHeroChange('headline', e.target.value)}
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
            />
          </div>
        </div>
        <div className="text-xs">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
            Supporting Subheadline
          </label>
          <textarea
            rows={2}
            value={hero.subheadline ?? ''}
            onChange={(e) => handleHeroChange('subheadline', e.target.value)}
            className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
          />
        </div>
      </div>

      {/* 2. Our Story Section */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#242424] pb-2">
          <h3 className="font-display text-sm font-bold text-[#04B8BB] uppercase tracking-wider">
            Our Story & Problem Solved
          </h3>
          <button
            type="button"
            onClick={handleAddStoryParagraph}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#04B8BB] hover:underline"
          >
            <Plus size={13} /> Add Paragraph
          </button>
        </div>

        <div className="text-xs">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
            Story Heading
          </label>
          <input
            type="text"
            value={story.heading ?? 'Why We Built Deven Co-Work in Raipur'}
            onChange={(e) => handleStoryChange('heading', e.target.value)}
            className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
          />
        </div>

        <div className="space-y-3">
          {(story.paragraphs || []).map((para, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="text-[10px] font-bold text-[#555] mt-2">P{idx + 1}</span>
              <textarea
                rows={3}
                value={para}
                onChange={(e) => handleStoryParagraphChange(idx, e.target.value)}
                placeholder={`Paragraph ${idx + 1}...`}
                className="flex-1 px-3 py-2 bg-[#121212] border border-[#242424] rounded text-xs text-white focus:outline-none focus:border-[#04B8BB]"
              />
              <button
                type="button"
                onClick={() => handleRemoveStoryParagraph(idx)}
                className="text-red-400 hover:text-red-300 p-1.5 mt-1"
                title="Remove paragraph"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Story Workspace Image */}
        <div className="text-xs pt-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
            Story Workspace Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={typeof story.image === 'string' ? story.image : story.image?.url || ''}
              onChange={(e) => handleStoryChange('image', e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="flex-1 px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
            />
            {onOpenMediaLibrary && (
              <button
                type="button"
                onClick={() => onOpenMediaLibrary((url) => handleStoryChange('image', url))}
                className="px-3 py-2 bg-[#1A1A1A] border border-[#333] hover:border-[#04B8BB] rounded text-[#AAA] hover:text-white"
              >
                Media Library
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-4">
          <h3 className="font-display text-sm font-bold text-[#04B8BB] uppercase tracking-wider border-b border-[#242424] pb-2">
            Our Mission
          </h3>
          <div className="text-xs space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                Mission Heading
              </label>
              <input
                type="text"
                value={mission.heading ?? 'Our Mission'}
                onChange={(e) => handleMissionChange('heading', e.target.value)}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                Mission Statement
              </label>
              <textarea
                rows={4}
                value={mission.text ?? ''}
                onChange={(e) => handleMissionChange('text', e.target.value)}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
              />
            </div>
          </div>
        </div>

        <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-4">
          <h3 className="font-display text-sm font-bold text-[#04B8BB] uppercase tracking-wider border-b border-[#242424] pb-2">
            Our Vision
          </h3>
          <div className="text-xs space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                Vision Heading
              </label>
              <input
                type="text"
                value={vision.heading ?? 'Our Vision'}
                onChange={(e) => handleVisionChange('heading', e.target.value)}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                Vision Statement
              </label>
              <textarea
                rows={4}
                value={vision.text ?? ''}
                onChange={(e) => handleVisionChange('text', e.target.value)}
                className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Target Audiences (Who It's For) */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#242424] pb-2">
          <h3 className="font-display text-sm font-bold text-[#04B8BB] uppercase tracking-wider">
            Who Deven Co-Work Is For
          </h3>
          <button
            type="button"
            onClick={handleAddAudienceItem}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#04B8BB] hover:underline"
          >
            <Plus size={13} /> Add Audience Segment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(audiences.items || []).map((aud, idx) => (
            <div key={idx} className="p-4 bg-[#121212] border border-[#242424] rounded-lg space-y-2 relative">
              <button
                type="button"
                onClick={() => handleRemoveAudienceItem(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"
                title="Remove audience"
              >
                <Trash2 size={13} />
              </button>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#888] mb-1">
                  Audience Title
                </label>
                <input
                  type="text"
                  value={aud.title || ''}
                  onChange={(e) => handleAudienceItemChange(idx, 'title', e.target.value)}
                  placeholder="e.g. Startup Founders"
                  className="w-full px-2.5 py-1.5 bg-[#0A0A0A] border border-[#242424] rounded text-xs text-white focus:outline-none focus:border-[#04B8BB]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#888] mb-1">
                  Audience Description
                </label>
                <textarea
                  rows={2}
                  value={aud.description || ''}
                  onChange={(e) => handleAudienceItemChange(idx, 'description', e.target.value)}
                  placeholder="Who they are and how Deven serves them..."
                  className="w-full px-2.5 py-1.5 bg-[#0A0A0A] border border-[#242424] rounded text-xs text-white focus:outline-none focus:border-[#04B8BB]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SEO Settings */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-4">
        <h3 className="font-display text-sm font-bold text-[#04B8BB] uppercase tracking-wider border-b border-[#242424] pb-2">
          About Page SEO Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={seo.title ?? ''}
              onChange={(e) => handleSeoChange('title', e.target.value)}
              placeholder="About Deven Co-Work — Raipur's Premier Coworking & Founder Space"
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
              Meta Description
            </label>
            <input
              type="text"
              value={seo.description ?? ''}
              onChange={(e) => handleSeoChange('description', e.target.value)}
              placeholder="Discover the story, mission, and founder community behind Deven Co-Work..."
              className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
