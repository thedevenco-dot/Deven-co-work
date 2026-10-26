import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  Sparkles,
  Tag,
  ChevronRight,
  Layers
} from 'lucide-react';
import {
  Header,
  Footer,
  WhatsAppFloat,
  defaultContent,
  mergeContent
} from '@/App';
import TourBookingModal from '@/components/TourBookingModal';
import { api } from '@/services/api';

function formatPostDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [content, setContent] = useState(defaultContent);
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  // Load CMS data & SEO metadata
  useEffect(() => {
    document.title = "The Deven Journal — Ideas & Insights for Founders in Raipur | Deven Co-Work";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Articles, founder stories, productivity playbooks, and business insights from Deven Co-Work, Raipur's premier founder community.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.devencowork.com/blog");
    }

    if (typeof window !== 'undefined' && window.__INITIAL_CMS_DATA__) {
      setContent(mergeContent(defaultContent, window.__INITIAL_CMS_DATA__));
    } else {
      api.fetchPublishedContent()
        .then((res) => {
          if (res?.success && res.data) {
            setContent(mergeContent(defaultContent, res.data));
          }
        })
        .catch((err) => console.error('Failed to load CMS content for blog page:', err));
    }
  }, []);

  // Fetch published categories and posts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.fetchBlogCategories().catch(() => ({ success: false, data: [] })),
      api.fetchBlogPosts({ limit: 50 }).catch(() => ({ success: false, data: [] })),
    ])
      .then(([catRes, postsRes]) => {
        if (catRes?.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (postsRes?.success) {
          setPosts(postsRes.data || []);
          setFeaturedPost(postsRes.featuredPost || null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter posts by category and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q) ||
        post.author?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="site-noise min-h-screen bg-[#0C0C0C] text-[#FCFAF9]">
      <div className="sticky top-0 z-40 w-full">
        <Header onReserve={() => setTourModalOpen(true)} content={content} cmsLoaded={true} cmsFailed={false} />
      </div>

      <main>
        {/* A. Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-[rgba(252,250,249,0.08)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#04B8BB]/10 via-transparent to-transparent pointer-events-none" />
          <div className="container-wide relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#04B8BB]/30 bg-[#04B8BB]/10 text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-6">
                <BookOpen className="w-3.5 h-3.5" />
                <span>THE DEVEN JOURNAL</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FCFAF9] leading-[1.1] mb-6">
                Ideas for People Building What's Next.
              </h1>
              <p className="text-base sm:text-lg text-[#FCFAF9]/75 leading-relaxed mb-8">
                Practical guides, startup playbooks, founder stories, and perspectives on the evolving business and coworking landscape of Raipur and Central India.
              </p>

              {/* Live Search Input */}
              <div className="relative max-w-lg">
                <Search className="w-4 h-4 text-[#FCFAF9]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, topic, or keyword..."
                  className="w-full pl-11 pr-4 py-3 bg-[#151517] border border-[rgba(252,250,249,0.15)] rounded-xl text-sm text-[#FCFAF9] placeholder-[#FCFAF9]/40 focus:outline-none focus:border-[#04B8BB] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#FCFAF9]/40 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* B. Featured Article Section (Shown if featured article exists and no search query active) */}
        {featuredPost && !searchQuery && selectedCategory === 'All' && (
          <section className="py-12 md:py-16 border-b border-[rgba(252,250,249,0.08)] bg-[#0F0F10]">
            <div className="container-wide">
              <div className="flex items-center gap-2 mb-6 text-[#04B8BB] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Journal Story</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#151516] border border-[#04B8BB]/30 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
                {featuredPost.coverImage && (
                  <div className="lg:col-span-6 rounded-xl overflow-hidden aspect-video bg-[#0A0A0A]">
                    <img
                      src={typeof featuredPost.coverImage === 'string' ? featuredPost.coverImage : featuredPost.coverImage.url}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className={featuredPost.coverImage ? 'lg:col-span-6' : 'lg:col-span-12'}>
                  <div className="inline-block px-3 py-1 rounded bg-[#04B8BB]/20 text-[#04B8BB] text-xs font-semibold uppercase tracking-wider mb-3">
                    {featuredPost.category}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FCFAF9] leading-tight mb-4">
                    <Link href={`/blog/${featuredPost.slug}`} className="hover:text-[#04B8BB] transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-sm sm:text-base text-[#FCFAF9]/70 leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#FCFAF9]/60 mb-6">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#04B8BB]" />
                      {featuredPost.author || 'Deven Co-Work'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#04B8BB]" />
                      {formatPostDate(featuredPost.publishedAt || featuredPost.createdAt)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#04B8BB]" />
                      {featuredPost.readingTime || 3} min read
                    </span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#04B8BB] text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* D. Categories Filter Bar */}
        <div className="py-6 border-b border-[rgba(252,250,249,0.08)] sticky top-[60px] z-20 bg-[#0C0C0C]/95 backdrop-blur-md">
          <div className="container-wide">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#04B8BB] text-black shadow'
                    : 'bg-[#18181A] text-[#FCFAF9]/70 hover:text-white border border-[rgba(252,250,249,0.08)]'
                }`}
              >
                All Categories ({posts.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#04B8BB] text-black shadow'
                      : 'bg-[#18181A] text-[#FCFAF9]/70 hover:text-white border border-[rgba(252,250,249,0.08)]'
                  }`}
                >
                  {cat.name} {cat.postCount !== undefined && `(${cat.postCount})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* C. Article Listing Section */}
        <section className="py-16 md:py-20">
          <div className="container-wide">
            {loading ? (
              <div className="py-20 text-center text-[#FCFAF9]/60">
                <div className="inline-block w-8 h-8 border-2 border-[#04B8BB] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading articles...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-16 px-6 text-center rounded-2xl border border-[rgba(252,250,249,0.1)] bg-[#121213] max-w-xl mx-auto">
                <BookOpen className="w-12 h-12 text-[#04B8BB] mx-auto mb-4 opacity-80" />
                <h3 className="font-display text-xl font-bold text-[#FCFAF9] mb-2">
                  No Articles Found
                </h3>
                <p className="text-sm text-[#FCFAF9]/65 mb-6">
                  {searchQuery
                    ? `No articles match "${searchQuery}". Try a different search term or category.`
                    : `No published articles in "${selectedCategory}" right now.`}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-5 py-2.5 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post._id || post.slug}
                    className="flex flex-col bg-[#141416] border border-[rgba(252,250,249,0.1)] rounded-xl overflow-hidden hover:border-[#04B8BB]/50 transition-all duration-200 group"
                  >
                    {/* Cover Thumbnail */}
                    <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] bg-[#0A0A0A] overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={typeof post.coverImage === 'string' ? post.coverImage : post.coverImage.url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C1C1E] to-[#0A0A0A] text-[#04B8BB]">
                          <BookOpen className="w-10 h-10 opacity-30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[#04B8BB] text-[11px] font-bold uppercase tracking-wider border border-white/10">
                        {post.category}
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs text-[#FCFAF9]/50 mb-3">
                          <span>{formatPostDate(post.publishedAt || post.createdAt)}</span>
                          <span>·</span>
                          <span>{post.readingTime || 3} min read</span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-[#FCFAF9] leading-snug mb-3 group-hover:text-[#04B8BB] transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-[#FCFAF9]/65 line-clamp-3 leading-relaxed mb-6">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Footer & Read CTA */}
                      <div className="pt-4 border-t border-[rgba(252,250,249,0.08)] flex items-center justify-between">
                        <span className="text-xs text-[#FCFAF9]/50 truncate max-w-[150px]">
                          By {post.author || 'Deven Co-Work'}
                        </span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#04B8BB] hover:underline uppercase tracking-wider"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* F. Conversion CTA Section */}
        <section className="py-16 md:py-24 border-t border-[rgba(252,250,249,0.08)] bg-gradient-to-b from-[#0F0F10] to-[#0C0C0C]">
          <div className="container-wide text-center max-w-3xl mx-auto">
            <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-3 block">
              WORK AMONG BUILDERS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FCFAF9] tracking-tight mb-4">
              Work From Raipur's Most Inspiring Community
            </h2>
            <p className="text-sm sm:text-base text-[#FCFAF9]/70 leading-relaxed mb-8 max-w-xl mx-auto">
              500 Mbps WiFi, private cabins, meeting room with digital board, and a community of active founders. Come for a free 2-day trial.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3.5 bg-[#04B8BB] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors shadow-lg shadow-[#04B8BB]/20"
              >
                View Plans & Pricing
              </Link>
              <button
                onClick={() => setTourModalOpen(true)}
                className="px-6 py-3.5 border border-[rgba(252,250,249,0.2)] bg-[#18181A] text-[#FCFAF9] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#202022] hover:border-[#04B8BB] transition-colors"
              >
                Book Guided Tour
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={content?.footer} globalSettings={content?.globalSettings} cmsLoaded={true} cmsFailed={false} />
      <WhatsAppFloat whatsapp={content?.footer?.whatsapp || content?.globalSettings?.whatsapp} message="Hi! I have a question regarding Deven Co-Work" cmsLoaded={true} cmsFailed={false} />
      <TourBookingModal isOpen={tourModalOpen} onClose={() => setTourModalOpen(false)} />
    </div>
  );
}
