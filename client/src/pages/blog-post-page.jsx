import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  ChevronRight,
  Sparkles,
  BookOpen,
  MapPin,
  AlertCircle
} from 'lucide-react';
import {
  Header,
  Footer,
  WhatsAppFloat,
  defaultContent,
  mergeContent
} from '@/App';
import TourBookingModal from '@/components/TourBookingModal';
import NotFound from '@/pages/not-found';
import { api } from '@/services/api';

function formatPostDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogPostPage({ params }) {
  const slug = params?.slug;
  const [, setLocation] = useLocation();

  const [content, setContent] = useState(defaultContent);
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  // Load global CMS content
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_CMS_DATA__) {
      setContent(mergeContent(defaultContent, window.__INITIAL_CMS_DATA__));
    } else {
      api.fetchPublishedContent()
        .then((res) => {
          if (res?.success && res.data) {
            setContent(mergeContent(defaultContent, res.data));
          }
        })
        .catch((err) => console.error('Failed to load CMS content for blog post:', err));
    }
  }, []);

  // Fetch article by slug
  useEffect(() => {
    if (!slug) return;

    // Check if initial blog post data was already injected into SSR / HTML
    if (typeof window !== 'undefined' && window.__INITIAL_BLOG_POST__ && window.__INITIAL_BLOG_POST__.slug === slug) {
      setPost(window.__INITIAL_BLOG_POST__);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    api.fetchBlogPostBySlug(slug)
      .then((res) => {
        if (res?.redirect) {
          // Automatic redirect if slug was renamed
          setLocation(res.redirect, { replace: true });
          return;
        }
        if (res?.success && res.data) {
          setPost(res.data);
          setRelatedPosts(res.relatedPosts || []);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load article:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug, setLocation]);

  // Update head metadata for article
  useEffect(() => {
    if (post) {
      const pageTitle = `${post.seoTitle || post.title} | Deven Co-Work`;
      document.title = pageTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && (post.seoDescription || post.excerpt)) {
        metaDesc.setAttribute('content', post.seoDescription || post.excerpt);
      }
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://www.devencowork.com/blog/${post.slug}`);
      }
    }
  }, [post]);

  // Copy article link to clipboard
  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (notFound) {
    return <NotFound />;
  }

  return (
    <div className="site-noise min-h-screen bg-[#0C0C0C] text-[#FCFAF9]">
      <div className="sticky top-0 z-40 w-full">
        <Header onReserve={() => setTourModalOpen(true)} content={content} cmsLoaded={true} cmsFailed={false} />
      </div>

      <main>
        {loading ? (
          <div className="py-32 text-center text-[#FCFAF9]/60">
            <div className="inline-block w-8 h-8 border-2 border-[#04B8BB] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading article...</p>
          </div>
        ) : !post ? (
          <NotFound />
        ) : (
          <article className="pt-10 pb-20 md:pt-16 md:pb-28">
            <div className="container-wide">
              {/* Breadcrumb Navigation */}
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center gap-2 text-xs text-[#FCFAF9]/50">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <li>
                    <Link href="/blog" className="hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <li className="text-[#04B8BB] truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                    {post.title}
                  </li>
                </ol>
              </nav>

              {/* Article Header */}
              <header className="max-w-4xl mx-auto mb-10 text-center">
                <div className="inline-block px-3 py-1 rounded bg-[#04B8BB]/15 text-[#04B8BB] text-xs font-semibold uppercase tracking-wider mb-5">
                  {post.category}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#FCFAF9] leading-[1.15] tracking-tight mb-6">
                  {post.title}
                </h1>
                <p className="text-base sm:text-lg text-[#FCFAF9]/75 leading-relaxed max-w-2xl mx-auto mb-8">
                  {post.excerpt}
                </p>

                {/* Author & Meta bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#FCFAF9]/60 pt-6 border-t border-[rgba(252,250,249,0.08)]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#04B8BB]" />
                    <span className="text-[#FCFAF9] font-medium">{post.author || 'Deven Co-Work Team'}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#04B8BB]" />
                    <span>Published {formatPostDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  {post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86400000 && (
                    <>
                      <span>·</span>
                      <span className="text-[#FCFAF9]/40">
                        Updated {formatPostDate(post.updatedAt)}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#04B8BB]" />
                    <span>{post.readingTime || 3} min read</span>
                  </div>
                  <span>·</span>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 text-xs text-[#04B8BB] hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied' : 'Share'}</span>
                  </button>
                </div>
              </header>

              {/* Cover Image */}
              {post.coverImage && (
                <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden border border-[rgba(252,250,249,0.12)] bg-[#121213] aspect-video">
                  <img
                    src={typeof post.coverImage === 'string' ? post.coverImage : post.coverImage.url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Main Article Content */}
              <div className="max-w-3xl mx-auto">
                <div
                  className="prose prose-invert prose-emerald max-w-none 
                    text-[#FCFAF9]/85 text-base sm:text-lg leading-relaxed
                    prose-headings:font-display prose-headings:text-[#FCFAF9] prose-headings:tracking-tight
                    prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[rgba(252,250,249,0.1)] prose-h2:pb-3
                    prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                    prose-p:mb-6 prose-p:leading-relaxed
                    prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2
                    prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-[#04B8BB] prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-[#FCFAF9]/90 prose-blockquote:my-6
                    prose-a:text-[#04B8BB] prose-a:underline hover:prose-a:text-[#039e9f]
                    prose-img:rounded-xl prose-img:border prose-img:border-[rgba(252,250,249,0.1)] prose-img:my-8"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-6 border-t border-[rgba(252,250,249,0.08)] flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#FCFAF9]/40 mr-2">
                      Tags:
                    </span>
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-[#18181A] border border-[rgba(252,250,249,0.08)] text-xs text-[#FCFAF9]/70"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contextual Service Callout */}
                <div className="mt-12 p-8 rounded-2xl border border-[#04B8BB]/30 bg-gradient-to-r from-[#141416] to-[#121213] relative overflow-hidden">
                  <div className="max-w-xl">
                    <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-2 block">
                      BUILD WITH DEVEN CO-WORK
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FCFAF9] mb-3">
                      Experience Raipur's Most Active Founder Space
                    </h3>
                    <p className="text-xs sm:text-sm text-[#FCFAF9]/70 leading-relaxed mb-6">
                      Join a growing community of builders and teams. Enjoy 500 Mbps WiFi, private cabins, interactive meeting rooms, and a sound-treated podcast studio.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href="/pricing"
                        className="px-5 py-2.5 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                      >
                        Explore Memberships
                      </Link>
                      <button
                        onClick={() => setTourModalOpen(true)}
                        className="px-5 py-2.5 border border-[rgba(252,250,249,0.2)] bg-[#18181A] text-[#FCFAF9] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#202022] transition-colors"
                      >
                        Book a Free Tour
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back to Blog Link */}
                <div className="mt-10">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#04B8BB] hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all articles</span>
                  </Link>
                </div>
              </div>

              {/* Related Articles Section */}
              {relatedPosts.length > 0 && (
                <section className="mt-20 pt-16 border-t border-[rgba(252,250,249,0.08)]">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-2xl font-bold text-[#FCFAF9] mb-8">
                      Related Articles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedPosts.map((rel) => (
                        <article
                          key={rel._id || rel.slug}
                          className="bg-[#141416] border border-[rgba(252,250,249,0.08)] rounded-xl overflow-hidden flex flex-col justify-between p-5 hover:border-[#04B8BB]/40 transition-colors group"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-[#04B8BB] uppercase tracking-wider mb-2">
                              {rel.category}
                            </div>
                            <h3 className="font-display text-base font-bold text-[#FCFAF9] leading-snug mb-2 group-hover:text-[#04B8BB] transition-colors">
                              <Link href={`/blog/${rel.slug}`}>
                                {rel.title}
                              </Link>
                            </h3>
                            <p className="text-xs text-[#FCFAF9]/60 line-clamp-2 leading-relaxed mb-4">
                              {rel.excerpt}
                            </p>
                          </div>
                          <Link
                            href={`/blog/${rel.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#04B8BB] hover:underline uppercase tracking-wider mt-auto"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </article>
        )}
      </main>

      <Footer footer={content?.footer} globalSettings={content?.globalSettings} cmsLoaded={true} cmsFailed={false} />
      <WhatsAppFloat whatsapp={content?.footer?.whatsapp || content?.globalSettings?.whatsapp} message={`Hi! I read your article "${post?.title || 'on the journal'}" and would like to learn more.`} cmsLoaded={true} cmsFailed={false} />
      <TourBookingModal isOpen={tourModalOpen} onClose={() => setTourModalOpen(false)} />
    </div>
  );
}
