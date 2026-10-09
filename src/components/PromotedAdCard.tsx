import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Bookmark,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
  Info,
  Flag,
  EyeOff,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/useStore';

export interface PromotedAd {
  id: string;
  advertiser: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
  content: string;
  headline: string;
  domain: string;
  ctaText: string;
  image?: string;
  likes: number;
  comments: number;
  category: string;
}

export const PROMOTED_ADS_DATABASE: PromotedAd[] = [
  {
    id: 'ad-linear',
    advertiser: 'Linear',
    handle: 'linear',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'The purpose-built tool for modern software teams. Streamline issues, projects, and roadmaps with instantaneous keyboard shortcuts and real-time multiplayer sync.',
    headline: 'Linear 2.0 — Meet the new standard for product teams.',
    domain: 'linear.app',
    ctaText: 'Try Free',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    likes: 428,
    comments: 34,
    category: 'Developer Tools',
  },
  {
    id: 'ad-supabase',
    advertiser: 'Supabase',
    handle: 'supabase',
    avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'Build in a weekend. Scale to millions. Supabase gives you a dedicated Postgres database, Authentication, Instant APIs, and Edge Functions in seconds.',
    headline: 'The Open Source Firebase Alternative with Postgres.',
    domain: 'supabase.com',
    ctaText: 'Start Project',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    likes: 612,
    comments: 52,
    category: 'Cloud & Database',
  },
  {
    id: 'ad-vercel',
    advertiser: 'Vercel',
    handle: 'vercel',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'Develop. Preview. Ship. Experience zero-configuration deployments, global edge network acceleration, and instant preview environments for every pull request.',
    headline: 'Deploy web applications at the speed of thought.',
    domain: 'vercel.com',
    ctaText: 'Deploy Now',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    likes: 894,
    comments: 79,
    category: 'Web Hosting',
  },
  {
    id: 'ad-raycast',
    advertiser: 'Raycast',
    handle: 'raycastapp',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'Supercharge your everyday workflow. Raycast lets you control tools in a few keystrokes with native AI commands, window tiling, clipboard history, and 1,000+ extensions.',
    headline: 'An extendable launcher made for engineers and creators.',
    domain: 'raycast.com',
    ctaText: 'Download App',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    likes: 541,
    comments: 41,
    category: 'Productivity',
  },
  {
    id: 'ad-notion',
    advertiser: 'Notion',
    handle: 'notionhq',
    avatar: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'The connected workspace where better, faster work happens. Bring docs, tasks, and notes together with conversational AI that understands all your project specs.',
    headline: 'Think it. Plan it. Build it. All in Notion.',
    domain: 'notion.so',
    ctaText: 'Get Started Free',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    likes: 730,
    comments: 63,
    category: 'Workspace',
  },
  {
    id: 'ad-anthropic',
    advertiser: 'Anthropic',
    handle: 'anthropicai',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'Claude 3.5 Sonnet raises the industry standard for reasoning, math, and code generation. Build safety-first AI agents with enterprise-grade reliability.',
    headline: 'Next-generation frontier AI models for developers.',
    domain: 'anthropic.com',
    ctaText: 'Learn More',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    likes: 982,
    comments: 114,
    category: 'Artificial Intelligence',
  },
  {
    id: 'ad-figma',
    advertiser: 'Figma',
    handle: 'figma',
    avatar: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'Bridge the gap between design and development. Figma Dev Mode translates design tokens into ready-to-use CSS, iOS, and Android component code.',
    headline: 'Figma Dev Mode — Inspect, copy code, ship faster.',
    domain: 'figma.com',
    ctaText: 'Explore Dev Mode',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    likes: 476,
    comments: 29,
    category: 'Design & Code',
  },
  {
    id: 'ad-bose',
    advertiser: 'Bose',
    handle: 'bose',
    avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    isVerified: true,
    content:
      'World-class noise cancellation meets breakthrough spatialized audio. QuietComfort Ultra headphones keep you in the zone with 24-hour battery and plush comfort.',
    headline: 'Bose QuietComfort Ultra — Pure focus, zero distraction.',
    domain: 'bose.com',
    ctaText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    likes: 312,
    comments: 18,
    category: 'Tech & Hardware',
  },
];

interface PromotedAdCardProps {
  ad: PromotedAd;
  onDismiss?: (adId: string) => void;
}

export default function PromotedAdCard({ ad, onDismiss }: PromotedAdCardProps) {
  const bookmarks = useAuthStore((state) => state.bookmarks);
  const toggleBookmark = useAuthStore((state) => state.toggleBookmark);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(ad.likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const isBookmarked = bookmarks.includes(ad.id);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(ad.id);
    showToast(isBookmarked ? 'Removed ad from Bookmarks' : 'Saved ad to Bookmarks');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(`https://${ad.domain}`);
    showToast('Ad destination link copied to clipboard!');
  };

  const handleDismiss = () => {
    setIsMenuOpen(false);
    setIsDismissed(true);
    onDismiss?.(ad.id);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (isDismissed) {
    return (
      <div className="border-b border-gray-100 p-4 bg-gray-50/70 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EyeOff size={15} className="text-gray-400" />
          <span>Thanks for the feedback. You will see fewer ads like this.</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-[#1769FF] font-semibold hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <article className="border-b border-gray-100 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors relative group">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-2 right-4 z-20 px-3 py-1.5 bg-[#0A192F] text-white text-xs font-semibold rounded-full shadow-lg animate-in fade-in slide-in-from-top-1">
          {toastMessage}
        </div>
      )}

      {/* Promoted Super-Label on Top */}
      <div className="flex items-center gap-2 pl-12 sm:pl-14 mb-1 text-[11px] font-semibold text-gray-400">
        <Sparkles size={12} className="text-amber-500 fill-amber-500" />
        <span className="uppercase tracking-wide">Promoted</span>
        <span>·</span>
        <span className="text-gray-400 font-normal">{ad.category}</span>
      </div>

      <div className="flex gap-3 sm:gap-4">
        {/* Advertiser Logo / Avatar */}
        <div className="flex-shrink-0">
          <img
            src={ad.avatar}
            alt={ad.advertiser}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ad.advertiser)}&background=1769FF&color=fff`;
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-gray-100"
          />
        </div>

        {/* Ad Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-[15px] sm:text-base text-[#0A192F] truncate">
                {ad.advertiser}
              </span>
              {ad.isVerified && (
                <CheckCircle2 size={16} className="text-[#1769FF] fill-[#1769FF] text-white shrink-0" />
              )}
              <span className="text-gray-500 text-sm truncate">@{ad.handle}</span>
              <span className="text-gray-400 text-sm">·</span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                Ad
              </span>
            </div>

            {/* Ad Options Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Ad options"
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full p-2 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <MoreHorizontal size={18} />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-9 z-30 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowWhyModal(true);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center gap-2 font-medium"
                  >
                    <Info size={14} className="text-gray-500" />
                    <span>Why this ad?</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center gap-2 font-medium text-gray-700"
                  >
                    <EyeOff size={14} className="text-gray-500" />
                    <span>Not interested in this ad</span>
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      showToast('Thanks for reporting. We will review this ad.');
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center gap-2 font-medium text-red-600"
                  >
                    <Flag size={14} className="text-red-500" />
                    <span>Report ad</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ad Copy Text */}
          <div className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3">
            {ad.content}
          </div>

          {/* Sponsored Media Card with CTA Button */}
          <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200/90 bg-white hover:border-gray-300 transition-all shadow-xs group/card">
            {ad.image && (
              <div className="relative aspect-16/9 w-full bg-gray-100 overflow-hidden">
                <img
                  src={ad.image}
                  alt={ad.headline}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover/card:scale-101 transition-transform duration-300"
                />
              </div>
            )}

            <div className="p-3.5 flex items-center justify-between gap-3 bg-gray-50/70 border-t border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1">
                  <span>{ad.domain}</span>
                  <ExternalLink size={11} />
                </p>
                <h4 className="text-sm font-bold text-[#0A192F] line-clamp-1 mt-0.5 group-hover/card:text-[#1769FF] transition-colors">
                  {ad.headline}
                </h4>
              </div>

              <a
                href={`https://${ad.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  showToast(`Visiting ${ad.domain}...`);
                }}
                className="shrink-0 px-4 py-2 bg-[#0A192F] hover:bg-[#1769FF] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>{ad.ctaText}</span>
              </a>
            </div>
          </div>

          {/* Interactive Engagement Actions */}
          <div className="flex items-center justify-between text-gray-500 max-w-md pt-1">
            {/* Reply */}
            <button
              type="button"
              onClick={() => showToast('Replying to sponsored ad')}
              aria-label="Comments"
              className="flex items-center gap-2 group/btn transition-colors hover:text-[#1769FF] min-h-[44px] min-w-[44px] -ml-2 px-2"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-blue-50 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm font-medium">{ad.comments}</span>
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              aria-label={isLiked ? 'Unlike ad' : 'Like ad'}
              className={clsx(
                'flex items-center gap-2 group/btn transition-colors min-h-[44px] min-w-[44px] px-2',
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              )}
            >
              <div
                className={clsx(
                  'p-2 rounded-full transition-colors',
                  isLiked ? 'bg-red-50' : 'group-hover/btn:bg-red-50'
                )}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share ad"
              className="flex items-center gap-2 group/btn transition-colors hover:text-green-500 min-h-[44px] min-w-[44px] px-2"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-green-50 transition-colors">
                <Share size={18} />
              </div>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark ad'}
              className={clsx(
                'flex items-center gap-1.5 group/btn transition-colors min-h-[44px] min-w-[44px] px-2',
                isBookmarked ? 'text-[#1769FF]' : 'hover:text-[#1769FF]'
              )}
            >
              <div
                className={clsx(
                  'p-2 rounded-full transition-colors',
                  isBookmarked ? 'bg-blue-50 text-[#1769FF]' : 'group-hover/btn:bg-blue-50'
                )}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Why This Ad Modal */}
      {showWhyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setShowWhyModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl space-y-3.5 border border-gray-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#1769FF]" />
                <h3 className="font-bold text-[#0A192F] text-sm">About BellBird Advertisements</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWhyModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              You are seeing this ad from <strong className="text-gray-900">{ad.advertiser}</strong> because of inferred preferences related to{' '}
              <strong className="text-[#1769FF]">{ad.category}</strong>, your approximate location, and recent activity on BellBird.
            </p>

            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 space-y-1">
              <p>• Advertiser: {ad.advertiser} (@{ad.handle})</p>
              <p>• Targeting: Technology & Developer Ecosystem</p>
              <p>• Premium Benefit: Premium members enjoy 50% fewer ads, and Premium+ has zero ads.</p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWhyModal(false)}
                className="px-4 py-1.5 bg-[#0A192F] hover:bg-black text-white text-xs font-bold rounded-full transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
