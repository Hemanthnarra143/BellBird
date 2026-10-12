import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { Home, Search, User, Bell, Mail, LogOut, Bird, Feather, Bookmark, Globe } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useTranslationStore, SUPPORTED_LANGUAGES } from '../store/useTranslationStore';
import ComposeModal from './ComposeModal';
import TranslationModal from './TranslationModal';
import clsx from 'clsx';

export default function Layout() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const openCompose = useAuthStore((state) => state.openCompose);
  const bookmarks = useAuthStore((state) => state.bookmarks);
  const navigate = useNavigate();
  const [desktopSearch, setDesktopSearch] = useState('');

  // Translation store
  const { isRealtimeActive, targetLanguage, openModal: openTranslationModal } = useTranslationStore();
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (desktopSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(desktopSearch.trim())}`);
      setDesktopSearch('');
    } else {
      navigate('/search');
    }
  };

  // Desktop sidebar navigation including Bookmarks (Twitter pattern)
  const desktopNavItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/messages', icon: Mail, label: 'Messages' },
    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
    { to: `/profile/${user?.id || '1'}`, icon: User, label: 'Profile' },
  ];

  // Mobile bottom navigation (5 primary Twitter tabs)
  const mobileNavItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/messages', icon: Mail, label: 'Messages' },
    { to: `/profile/${user?.id || '1'}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="max-w-7xl mx-auto flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white sticky top-0 h-screen">
        <Link to="/" className="p-6 flex items-center gap-3 text-[#1769FF] group">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Bird size={26} className="text-[#1769FF]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0A192F]">BellBird</span>
        </Link>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-semibold text-base',
                  isActive
                    ? 'bg-blue-50 text-[#1769FF]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} />
                <span>{item.label}</span>
              </div>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1769FF]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Twitter Desktop Post Button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={openCompose}
              className="w-full bg-[#1769FF] hover:bg-blue-600 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 text-base group cursor-pointer"
            >
              <Feather size={19} className="group-hover:rotate-12 transition-transform" />
              <span>Post</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1.5">
          {/* Quick Real-Time Translation Trigger */}
          <button
            type="button"
            onClick={openTranslationModal}
            className={clsx(
              'flex items-center justify-between px-3.5 py-2.5 w-full text-left rounded-xl transition-all font-semibold text-sm cursor-pointer border',
              isRealtimeActive
                ? 'bg-blue-50/80 border-blue-200 text-[#1769FF]'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent'
            )}
            title="Real-Time Translation Settings"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl leading-none">{currentLang.flag}</span>
              <div>
                <p className="leading-tight text-sm">Translate</p>
                <p className="text-[11px] text-gray-500 font-normal">
                  {isRealtimeActive ? `${currentLang.name} · Live` : currentLang.name}
                </p>
              </div>
            </div>
            {isRealtimeActive ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            ) : (
              <Globe size={16} className="text-gray-400" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-2.5 w-full text-left rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm cursor-pointer"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative bg-white sm:border-x sm:border-gray-200 shadow-sm max-w-2xl">
        <Outlet />
      </main>

      {/* Right Sidebar (Desktop Suggestions & Search) */}
      <aside className="hidden lg:block w-80 p-5 h-screen sticky top-0 overflow-y-auto space-y-4">
        {/* Desktop Search Bar */}
        <form onSubmit={handleDesktopSearch} className="sticky top-0 bg-gray-50 pt-1 pb-2 z-10">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search BellBird"
              value={desktopSearch}
              onChange={(e) => setDesktopSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-200/70 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-[#1769FF] rounded-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </form>

        {/* Trends Box */}
        <div className="bg-gray-100/70 rounded-2xl p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#0A192F] text-base">Trends for you</h3>
            <Link to="/search" className="text-xs text-[#1769FF] font-semibold hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { tag: '#bellbird', name: '#BellBird', cat: 'Technology · Trending', count: '15.4K chirps' },
              { tag: '#react19', name: '#React19', cat: 'Development', count: '28.9K chirps' },
              { tag: '#photography', name: '#Photography', cat: 'Visual Arts', count: '42.1K chirps' },
            ].map((trend) => (
              <Link
                key={trend.tag}
                to={`/search?q=${encodeURIComponent(trend.tag)}`}
                className="block hover:bg-gray-200/50 p-2 -mx-2 rounded-xl transition-colors group"
              >
                <p className="text-xs text-gray-500">{trend.cat}</p>
                <p className="text-sm font-bold text-[#0A192F] group-hover:text-[#1769FF] transition-colors">
                  {trend.name}
                </p>
                <p className="text-xs text-gray-400">{trend.count}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Who to follow */}
        <div className="bg-gray-100/70 rounded-2xl p-4 border border-gray-200/60">
          <h3 className="font-bold text-[#0A192F] mb-3 text-base">Who to follow</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link to="/profile/3" className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  className="w-10 h-10 rounded-full object-cover"
                  alt="Alex Rivera"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/profile/3" className="font-bold text-sm text-[#0A192F] hover:underline block truncate">
                  Alex Rivera
                </Link>
                <p className="text-xs text-gray-500 truncate">@alex_dev</p>
              </div>
              <Link
                to="/search?tab=people&q=Alex"
                className="text-xs font-bold text-[#1769FF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                View
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/profile/4" className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
                  className="w-10 h-10 rounded-full object-cover"
                  alt="Sarah Chen"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/profile/4" className="font-bold text-sm text-[#0A192F] hover:underline block truncate">
                  Sarah Chen
                </Link>
                <p className="text-xs text-gray-500 truncate">@sarah_design</p>
              </div>
              <Link
                to="/search?tab=people&q=Sarah"
                className="text-xs font-bold text-[#1769FF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Action Button (FAB) - Same like Twitter */}
      <button
        type="button"
        onClick={openCompose}
        aria-label="Create a post"
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#1769FF] hover:bg-blue-600 active:scale-90 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition-all duration-150 hover:shadow-2xl cursor-pointer"
      >
        <Feather size={24} />
      </button>

      {/* Mobile Bottom Tab Bar (Twitter Pattern: Home, Search, Alerts, Messages, Profile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200/80 grid grid-cols-5 items-center h-16 z-50 safe-area-bottom px-1"
      >
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            aria-label={item.label}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors relative',
                isActive ? 'text-[#1769FF]' : 'text-gray-500 hover:text-gray-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={23} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx('text-[10px] mt-0.5 tracking-tight', isActive ? 'font-bold' : 'font-medium')}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 bg-[#1769FF] rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Global Twitter-Style Compose Modal */}
      <ComposeModal />

      {/* Global Real-Time Translation Modal */}
      <TranslationModal />
    </div>
  );
}
