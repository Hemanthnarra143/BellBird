import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/useStore';
import PostCard, { Post } from '../components/PostCard';
import PromotedAdCard, { PromotedAd, PROMOTED_ADS_DATABASE } from '../components/PromotedAdCard';
import TranslationHeaderWidget from '../components/TranslationHeaderWidget';
import { Bird, ArrowDown, RotateCcw, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const PULL_THRESHOLD = 64; // Pixels needed to trigger refresh
const MAX_PULL = 96; // Maximum visual drag distance

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const newPostCount = useAuthStore((state) => state.newPostCount);
  const user = useAuthStore((state) => state.user);

  // --- Promoted Ads in Feed State ---
  const [dismissedAdIds, setDismissedAdIds] = useState<string[]>([]);
  const [randomSeed, setRandomSeed] = useState(0);

  // --- Pull-to-Refresh Gesture States ---
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const isDraggingMouse = useRef<boolean>(false);

  const getScrollContainer = useCallback(() => {
    if (feedRef.current) {
      return feedRef.current.closest('main') || document.documentElement;
    }
    return document.documentElement;
  }, []);

  const getScrollTop = useCallback(() => {
    const container = getScrollContainer();
    return container ? container.scrollTop : 0;
  }, [getScrollContainer]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [newPostCount]);

  // --- Pull to Refresh Execution ---
  const triggerRefresh = async () => {
    setIsRefreshing(true);
    setPullDistance(52); // Keep indicator visible during refresh
    setRandomSeed((s) => s + 1);

    try {
      await fetchPosts();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 2200);
      }, 500);
    }
  };

  // Build random interleaved feed of posts and sponsored ads
  const feedTimeline = useMemo(() => {
    if (posts.length === 0) return [];

    const availableAds = PROMOTED_ADS_DATABASE.filter((ad) => !dismissedAdIds.includes(ad.id));
    // Deterministic yet shuffled based on randomSeed
    const shuffledAds = [...availableAds].sort(() => 0.5 - Math.random());

    const items: Array<{ type: 'post'; post: Post } | { type: 'ad'; ad: PromotedAd }> = [];
    let adIdx = 0;

    posts.forEach((post, index) => {
      items.push({ type: 'post', post });

      // Insert ads randomly across the feed (e.g., after 2nd post, then after every 3 posts)
      const shouldInsertAd =
        (index === 1 || (index > 1 && (index + randomSeed) % 3 === 0)) &&
        adIdx < shuffledAds.length;

      if (shouldInsertAd) {
        items.push({ type: 'ad', ad: shuffledAds[adIdx++] });
      }
    });

    return items;
  }, [posts, dismissedAdIds, randomSeed]);

  // --- Touch Gesture Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (getScrollTop() <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    } else {
      touchStartY.current = 0;
      setIsPulling(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || touchStartY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (deltaY > 0 && getScrollTop() <= 0) {
      const damped = Math.min(MAX_PULL, deltaY * 0.42);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing) return;
    setIsPulling(false);
    touchStartY.current = 0;

    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // --- Mouse Drag Fallback (Desktop / Preview testability) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRefreshing || getScrollTop() > 0) return;
    isDraggingMouse.current = true;
    touchStartY.current = e.clientY;
    setIsPulling(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMouse.current || isRefreshing) return;
    const deltaY = e.clientY - touchStartY.current;
    if (deltaY > 0 && getScrollTop() <= 0) {
      const damped = Math.min(MAX_PULL, deltaY * 0.42);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingMouse.current) return;
    isDraggingMouse.current = false;
    setIsPulling(false);
    touchStartY.current = 0;

    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const isThresholdReached = pullDistance >= PULL_THRESHOLD;
  const progressRatio = Math.min(1, pullDistance / PULL_THRESHOLD);

  return (
    <div
      ref={feedRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-full bg-white pb-24 relative select-none"
    >
      {/* Sticky Top Header with Centered Logo (Twitter / X pattern) */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-100 p-2.5 px-4 flex items-center justify-between min-h-[53px] relative">
        {/* Left Side: Mobile User Avatar / Refresh Status */}
        <div className="flex items-center gap-2 z-10 min-w-[40px]">
          <Link
            to={`/profile/${user?.id || '1'}`}
            className="md:hidden flex items-center"
            aria-label="View Profile"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'Profile'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 hover:opacity-90 transition-opacity"
            />
          </Link>

          {justRefreshed && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-in fade-in duration-150">
              <Check size={12} /> Updated
            </span>
          )}
        </div>

        {/* Center: BellBird Logo (Dead Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
          <Link
            to="/"
            aria-label="BellBird Home"
            className="flex items-center justify-center text-[#1769FF] hover:scale-105 active:scale-95 transition-all p-1 rounded-full hover:bg-blue-50/70"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center ring-1 ring-blue-100 shadow-xs">
              <Bird size={20} className="text-[#1769FF]" />
            </div>
          </Link>
        </div>

        {/* Right Side: Translation Widget */}
        <div className="flex items-center justify-end gap-1.5 z-10 min-w-[36px]">
          <TranslationHeaderWidget />
        </div>
      </div>

      {/* Pull-To-Refresh Indicator Bubble */}
      <div
        className={clsx(
          'w-full flex items-center justify-center overflow-hidden pointer-events-none transition-all duration-200 z-20',
          isPulling ? 'transition-none' : 'transition-all duration-300'
        )}
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 8 ? 1 : 0,
        }}
        aria-hidden="true"
      >
        <div
          className={clsx(
            'w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center transition-transform',
            isThresholdReached && !isRefreshing && 'scale-110 bg-blue-50/50'
          )}
        >
          {isRefreshing ? (
            <RotateCcw size={18} className="text-[#1769FF] animate-spin" />
          ) : (
            <div
              style={{
                transform: `rotate(${progressRatio * 180}deg)`,
                transition: isPulling ? 'none' : 'transform 0.2s',
              }}
            >
              <ArrowDown
                size={18}
                className={clsx(
                  'transition-colors',
                  isThresholdReached ? 'text-[#1769FF]' : 'text-gray-400'
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Manual Refresh Strip on Desktop */}
      <div className="hidden sm:flex items-center justify-center border-b border-gray-50 bg-gray-50/40 py-1.5 px-4 text-xs text-gray-500">
        <button
          type="button"
          onClick={() => triggerRefresh()}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 hover:text-[#1769FF] font-semibold transition-colors disabled:opacity-50"
        >
          <RotateCcw size={12} className={isRefreshing ? 'animate-spin text-[#1769FF]' : ''} />
          <span>{isRefreshing ? 'Fetching latest chirps...' : 'Pull down or click to refresh feed'}</span>
        </button>
      </div>

      {/* Feed Content Posts and Random Promoted Ads */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-[#1769FF] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-gray-400">Loading your feed...</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {feedTimeline.map((item) =>
            item.type === 'post' ? (
              <PostCard key={item.post.id} post={item.post} onLike={handleLike} />
            ) : (
              <PromotedAdCard
                key={item.ad.id}
                ad={item.ad}
                onDismiss={(id) => setDismissedAdIds((prev) => [...prev, id])}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
