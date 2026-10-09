import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, X, TrendingUp, Sparkles, UserPlus, Check, Image as ImageIcon, Flame } from 'lucide-react';
import PostCard, { Post } from '../components/PostCard';
import TranslationHeaderWidget from '../components/TranslationHeaderWidget';
import clsx from 'clsx';

interface UserItem {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
}

interface TrendItem {
  id: string;
  tag: string;
  name: string;
  category: string;
  chirpsCount: number;
}

type TabType = 'top' | 'latest' | 'people' | 'media';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as TabType) || 'top';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bellbird_recent_searches');
      return saved ? JSON.parse(saved) : ['#bellbird', 'photography', 'React'];
    } catch {
      return ['#bellbird', 'photography'];
    }
  });

  const [, startTransition] = useTransition();

  // Sync with URL query params when they change externally (e.g. clicking a hashtag)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tab = (searchParams.get('tab') as TabType) || 'top';
    setQuery(q);
    setActiveTab(tab);
    executeSearch(q, tab);
  }, [searchParams]);

  // Initial load of trends and users
  useEffect(() => {
    fetch('/api/trends')
      .then((res) => res.json())
      .then((data) => setTrends(data))
      .catch(() => {});
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('bellbird_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      try {
        localStorage.setItem('bellbird_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('bellbird_recent_searches');
    } catch {}
  };

  const executeSearch = async (searchTerm: string, tab: TabType) => {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(searchTerm.trim());
      const res = await fetch(`/api/search?q=${encoded}&tab=${tab}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setUsers(data.users || []);
      if (data.trends) setTrends(data.trends);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    saveRecentSearch(trimmed);
    startTransition(() => {
      setSearchParams({ q: trimmed, tab: activeTab });
    });
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    startTransition(() => {
      setSearchParams({ q: query.trim(), tab: newTab });
    });
  };

  const handleTrendClick = (tag: string) => {
    setQuery(tag);
    saveRecentSearch(tag);
    startTransition(() => {
      setSearchParams({ q: tag, tab: 'top' });
    });
  };

  const handleClearQuery = () => {
    setQuery('');
    startTransition(() => {
      setSearchParams({});
    });
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleFollowToggle = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
      const updatedUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u)));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="w-full bg-white pb-24 min-h-screen">
      {/* Search Header Bar (Sticky Top) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search BellBird (posts, #hashtags, @people)..."
              aria-label="Search all content"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 hover:bg-gray-100/80 focus:bg-white border border-transparent focus:border-[#1769FF] rounded-full text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={handleClearQuery}
                aria-label="Clear search input"
                className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </form>

          <TranslationHeaderWidget />
        </div>

        {/* Tabbed Navigation Filters (Twitter-style: Top, Latest, People, Media) */}
        {hasQuery && (
          <div className="flex border-t border-gray-100 mt-2.5 pt-1">
            {(
              [
                { id: 'top', label: 'Top' },
                { id: 'latest', label: 'Latest' },
                { id: 'people', label: 'People' },
                { id: 'media', label: 'Media' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  'flex-1 py-2.5 text-center text-sm font-semibold relative transition-colors',
                  activeTab === tab.id
                    ? 'text-[#0A192F] font-bold'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/80 rounded-lg'
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1769FF] rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-9 h-9 border-3 border-[#1769FF] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Searching all content across BellBird...</p>
        </div>
      ) : hasQuery ? (
        /* Search Results View */
        <div>
          {/* People Tab or Top Tab Account Matches */}
          {(activeTab === 'people' || (activeTab === 'top' && users.length > 0)) && (
            <div className="border-b border-gray-100 divide-y divide-gray-100">
              {activeTab === 'top' && (
                <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  People
                </div>
              )}
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0 flex-1 pr-3 group">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1769FF&color=fff`;
                      }}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[#0A192F] group-hover:underline text-[15px] truncate">
                          {u.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{u.bio}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        <span className="font-semibold text-gray-700">{u.followers}</span> followers
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleFollowToggle(u.id)}
                    className={clsx(
                      'px-4 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] min-w-[80px] flex items-center justify-center gap-1 shrink-0',
                      u.isFollowing
                        ? 'border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                        : 'bg-[#0A192F] hover:bg-[#1769FF] text-white shadow-sm'
                    )}
                  >
                    {u.isFollowing ? (
                      <>
                        <Check size={14} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Follow
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Posts View (Top, Latest, Media) */}
          {activeTab !== 'people' && (
            <div>
              {activeTab === 'top' && users.length > 0 && posts.length > 0 && (
                <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Chirps & Posts
                </div>
              )}
              {posts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onLike={handleLike} />
                  ))}
                </div>
              ) : (
                /* No posts found in active tab */
                users.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <SearchIcon size={26} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A192F] mb-1">
                      No results for &ldquo;{query}&rdquo;
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                      Try searching for something else, checking for spelling errors, or browsing the trending topics below.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearQuery}
                      className="px-5 py-2 rounded-full bg-[#1769FF] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      Clear Search & Explore
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* If People tab had zero matches */}
          {activeTab === 'people' && users.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <SearchIcon size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] mb-1">
                No accounts match &ldquo;{query}&rdquo;
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Try searching by full display name, username handle, or keywords from their bio.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Explore Default State (Twitter Explore Mode) */
        <div className="divide-y divide-gray-100">
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#0A192F] flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#1769FF]" /> Recent searches
                </h2>
                <button
                  type="button"
                  onClick={clearAllRecent}
                  className="text-xs text-[#1769FF] hover:underline font-semibold"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200/80 rounded-full text-xs font-medium text-gray-800 transition-colors cursor-pointer group"
                  >
                    <button
                      type="button"
                      onClick={() => handleTrendClick(term)}
                      className="text-left hover:text-[#1769FF]"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      aria-label={`Remove ${term} from recent searches`}
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends for you (Twitter Explore Hero) */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={18} className="text-[#1769FF]" />
              <h2 className="text-base font-bold text-[#0A192F]">Trends for you</h2>
            </div>

            <div className="space-y-1">
              {trends.map((trend) => (
                <button
                  key={trend.id}
                  type="button"
                  onClick={() => handleTrendClick(trend.tag)}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{trend.category}</p>
                    <p className="text-sm font-bold text-[#0A192F] group-hover:text-[#1769FF] transition-colors">
                      {trend.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {trend.chirpsCount.toLocaleString()} chirps
                    </p>
                  </div>
                  <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <TrendingUp size={16} className="text-[#1769FF]" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Discover Categories */}
          <div className="p-4 bg-gray-50/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Popular Topics on BellBird
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { title: 'Tech & AI', tag: '#technology', count: '18.2K chirps' },
                { title: 'Photography', tag: '#photography', count: '42.1K chirps' },
                { title: 'Web Development', tag: '#webdev', count: '19.3K chirps' },
                { title: 'Design Systems', tag: '#designsystems', count: '9.8K chirps' },
              ].map((cat) => (
                <button
                  key={cat.tag}
                  type="button"
                  onClick={() => handleTrendClick(cat.tag)}
                  className="p-3 bg-white border border-gray-200/80 rounded-xl text-left hover:border-[#1769FF] hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-bold text-[#0A192F]">{cat.title}</p>
                  <p className="text-xs text-[#1769FF] mt-0.5 font-medium">{cat.tag}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{cat.count}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
