import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useStore';
import PostCard, { Post } from '../components/PostCard';
import TranslationHeaderWidget from '../components/TranslationHeaderWidget';
import { Bookmark, Trash2, ArrowLeft, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Bookmarks() {
  const user = useAuthStore((state) => state.user);
  const bookmarks = useAuthStore((state) => state.bookmarks);
  const clearAllBookmarks = useAuthStore((state) => state.clearAllBookmarks);
  const navigate = useNavigate();

  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const postsRes = await fetch('/api/posts');
      if (postsRes.ok) {
        const allPosts: Post[] = await postsRes.json();
        setBookmarkedPosts(allPosts.filter((p) => bookmarks.includes(p.id)));
      } else {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const data = await res.json();
          setBookmarkedPosts(data.filter((p: Post) => bookmarks.includes(p.id)));
        }
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [bookmarks]);

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const updatedPost = await res.json();
      setBookmarkedPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = (postId: string) => {
    // If unbookmarked, remove from list
    setBookmarkedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleClearAll = async () => {
    clearAllBookmarks();
    setBookmarkedPosts([]);
    setShowClearConfirm(false);
    try {
      await fetch('/api/bookmarks', { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing bookmarks:', err);
    }
  };

  // Filter bookmarked posts by local search
  const filteredPosts = bookmarkedPosts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-white pb-24 min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-100 p-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A192F]">Bookmarks</h1>
            <p className="text-xs text-gray-500">@{user?.username || 'bellbird_user'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TranslationHeaderWidget />

          {bookmarkedPosts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold min-h-[36px] min-w-[36px] justify-center"
              aria-label="Clear all bookmarks"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Banner */}
      {showClearConfirm && (
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between animate-in fade-in">
          <p className="text-xs text-red-800 font-medium">
            Clear all saved bookmarks? This action cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search Inside Bookmarks Bar */}
      {bookmarkedPosts.length > 1 && (
        <div className="p-3 px-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search your saved bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1769FF]"
            />
          </div>
        </div>
      )}

      {/* Bookmarked Posts Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-8 h-8 border-3 border-[#1769FF] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-gray-400">Loading your saved chirps...</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onBookmark={handleBookmarkToggle}
            />
          ))}
        </div>
      ) : bookmarkedPosts.length === 0 ? (
        /* Empty State (Twitter Style) */
        <div className="p-12 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1769FF] flex items-center justify-center mb-4 ring-8 ring-blue-50/50">
            <Bookmark size={30} className="fill-[#1769FF]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A192F] mb-1.5">Save posts for later</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Don&apos;t let the good ones fly away! Tap the bookmark icon under any chirp to save it here for later viewing.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#1769FF] hover:bg-blue-600 text-white font-bold rounded-full text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            Explore Feed
          </Link>
        </div>
      ) : (
        /* No search results within bookmarks */
        <div className="p-10 text-center text-gray-500">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            No bookmarks matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-gray-400">Try searching with a different term.</p>
        </div>
      )}
    </div>
  );
}
