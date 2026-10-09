import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useTranslationStore, SUPPORTED_LANGUAGES } from '../store/useTranslationStore';
import {
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Settings,
  CheckCircle2,
  Sparkles,
  User,
  BadgeDollarSign,
  Lock,
  Shield,
  Bell,
  Sliders,
  FileText,
  HelpCircle,
  Bookmark,
  Pencil,
  Camera,
  Globe,
  Loader2,
} from 'lucide-react';
import PostCard, { Post } from '../components/PostCard';
import PromotedAdCard, { PromotedAd, PROMOTED_ADS_DATABASE } from '../components/PromotedAdCard';
import ProfileSettingsModal, { SettingsTab } from '../components/ProfileSettingsModal';
import EditProfileModal from '../components/EditProfileModal';
import TranslationHeaderWidget from '../components/TranslationHeaderWidget';
import clsx from 'clsx';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const profileId = id || currentUser?.id;

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAdIds, setDismissedAdIds] = useState<string[]>([]);

  // Settings & Edit Profile Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Bio Translation
  const { isRealtimeActive, targetLanguage, translateText } = useTranslationStore();
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [showOriginalBio, setShowOriginalBio] = useState(false);
  const [isTranslatingBio, setIsTranslatingBio] = useState(false);

  const targetLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    let cancelled = false;
    if (profile?.bio && isRealtimeActive) {
      setIsTranslatingBio(true);
      translateText(profile.bio, targetLanguage)
        .then((res) => {
          if (!cancelled) {
            setTranslatedBio(res);
            setShowOriginalBio(false);
          }
        })
        .finally(() => {
          if (!cancelled) setIsTranslatingBio(false);
        });
    } else if (!isRealtimeActive && !showOriginalBio) {
      setTranslatedBio(null);
    }
    return () => {
      cancelled = true;
    };
  }, [profile?.bio, isRealtimeActive, targetLanguage, translateText]);

  const handleManualTranslateBio = async () => {
    if (translatedBio) {
      setShowOriginalBio(!showOriginalBio);
      return;
    }
    if (!profile?.bio) return;
    setIsTranslatingBio(true);
    try {
      const res = await translateText(profile.bio, targetLanguage);
      setTranslatedBio(res);
      setShowOriginalBio(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslatingBio(false);
    }
  };

  // Interleave person profile posts with random sponsored ads
  const profileTimeline = useMemo(() => {
    if (posts.length === 0) return [];

    const availableAds = PROMOTED_ADS_DATABASE.filter((ad) => !dismissedAdIds.includes(ad.id));
    // Deterministic shuffle based on profileId
    const shuffledAds = [...availableAds].sort(() => 0.5 - Math.random());
    const items: Array<{ type: 'post'; post: Post } | { type: 'ad'; ad: PromotedAd }> = [];
    let adIdx = 0;

    posts.forEach((post, index) => {
      items.push({ type: 'post', post });

      // Insert ads randomly across person's posts:
      // If user has 1-2 posts, insert after first post
      // If user has more posts, insert after post 1 and every 2 posts
      const shouldInsertAd =
        (index === 0 && posts.length <= 2) ||
        (index === 1 && posts.length > 2) ||
        (index > 1 && index % 2 === 0);

      if (shouldInsertAd && adIdx < shuffledAds.length) {
        items.push({ type: 'ad', ad: shuffledAds[adIdx++] });
      }
    });

    return items;
  }, [posts, dismissedAdIds, profileId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, postsRes] = await Promise.all([
          fetch(`/api/users/${profileId}`),
          fetch('/api/posts'),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
        }

        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          setPosts(allPosts.filter((p: Post) => p.author.id === profileId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchData();
    }
  }, [profileId]);

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileId) return;
    try {
      const res = await fetch(`/api/users/${profileId}/follow`, { method: 'POST' });
      const updatedUser = await res.json();
      setProfile((prev: any) => ({ ...prev, ...updatedUser }));
    } catch (err) {
      console.error(err);
    }
  };

  const openSettings = (tab: SettingsTab = 'privacy') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#1769FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-500">User not found</div>;
  }

  const isVerified = Boolean(
    profile.isPremium ||
    (currentUser?.id === profile.id && currentUser?.isPremium)
  );

  return (
    <div className="w-full bg-white pb-24 min-h-screen">
      {/* Header with Title and Settings Icon */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-2.5 px-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-[#0A192F]">{profile.name}</h1>
              {isVerified && (
                <CheckCircle2 size={18} className="text-[#1769FF] fill-[#1769FF] text-white" />
              )}
            </div>
            <p className="text-xs text-gray-500">{posts.length} posts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time Translation Control */}
          <TranslationHeaderWidget />

          {/* Top Header Settings Button */}
          <button
            onClick={() => openSettings('privacy')}
            aria-label="Open Settings and Privacy"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 hover:text-[#1769FF] flex items-center justify-center min-h-[40px] min-w-[40px]"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Cover and Avatar */}
      <div>
        <div
          className="h-32 sm:h-48 w-full bg-cover bg-center relative group"
          style={{
            backgroundImage: profile.coverImage
              ? `url(${profile.coverImage})`
              : 'linear-gradient(to right, #dbeafe, #bfdbfe, #1769FF)',
            backgroundColor: '#1769FF',
          }}
        >
          {currentUser?.id === profile.id && (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs px-3 backdrop-blur-sm"
              title="Change banner"
            >
              <Camera size={14} />
              <span className="hidden sm:inline">Edit header</span>
            </button>
          )}
        </div>

        <div className="px-4 sm:px-6 relative">
          <div className="flex justify-between items-start">
            <div className="relative group">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1769FF&color=fff`;
                }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white -mt-12 sm:-mt-16 bg-white object-cover shadow-sm"
              />
              {currentUser?.id === profile.id && (
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  aria-label="Edit avatar"
                  className="absolute bottom-1 right-1 bg-[#1769FF] hover:bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 cursor-pointer"
                  title="Change avatar photo"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              {currentUser?.id !== profile.id ? (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className={clsx(
                    'px-6 py-2 rounded-full font-bold text-sm transition-all',
                    profile.isFollowing
                      ? 'border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                      : 'bg-[#0A192F] hover:bg-[#1769FF] text-white shadow-sm'
                  )}
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-2 rounded-full font-bold border border-gray-300 text-[#0A192F] hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all text-sm flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Pencil size={15} />
                  <span>Edit profile</span>
                </button>
              )}

              {/* Dedicated Settings Button */}
              <button
                type="button"
                onClick={() => openSettings('privacy')}
                className="px-4 py-2 rounded-full font-bold border border-gray-200 text-[#0A192F] hover:border-[#1769FF] hover:text-[#1769FF] hover:bg-blue-50/50 transition-colors text-sm flex items-center gap-1.5"
                aria-label="Settings button"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-2xl font-bold text-[#0A192F] leading-tight">{profile.name}</h2>
              {isVerified && (
                <CheckCircle2 size={20} className="text-[#1769FF] fill-[#1769FF] text-white" />
              )}
            </div>
            <p className="text-gray-500 text-sm">@{profile.username}</p>
          </div>

          {/* Profile Bio with Real-Time Translation */}
          <div className="mt-3">
            <p className="text-gray-900 leading-normal whitespace-pre-wrap">
              {translatedBio && !showOriginalBio ? translatedBio : profile.bio}
            </p>

            {/* Bio Translation Toggle */}
            {profile.bio && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                {isTranslatingBio ? (
                  <span className="inline-flex items-center gap-1 text-blue-600 animate-pulse text-[11px]">
                    <Loader2 size={11} className="animate-spin" />
                    <span>Translating bio...</span>
                  </span>
                ) : translatedBio && !showOriginalBio ? (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100/90 px-2 py-0.5 rounded-full">
                    <span>{targetLangObj.flag} Translated to {targetLangObj.name}</span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setShowOriginalBio(true)}
                      className="text-[#1769FF] font-semibold hover:underline"
                    >
                      Show original
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualTranslateBio}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#1769FF] transition-colors py-0.5 cursor-pointer"
                  >
                    <Globe size={12} className="text-gray-400" />
                    <span>
                      {showOriginalBio && translatedBio
                        ? `Show ${targetLangObj.name} bio`
                        : `Translate bio to ${targetLangObj.name}`}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={16} /> {profile.location || 'San Francisco, CA'}
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon size={16} />{' '}
              <a
                href={profile.website?.startsWith('http') ? profile.website : `https://${profile.website || 'bellbird.app'}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#1769FF] hover:underline"
              >
                {profile.website ? profile.website.replace(/^https?:\/\//, '') : 'bellbird.app'}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} /> Joined October 2026
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            <div className="cursor-pointer hover:underline">
              <span className="font-bold text-[#0A192F]">{profile.following}</span>{' '}
              <span className="text-gray-500">Following</span>
            </div>
            <div className="cursor-pointer hover:underline">
              <span className="font-bold text-[#0A192F]">{profile.followers}</span>{' '}
              <span className="text-gray-500">Followers</span>
            </div>
          </div>

          {/* Quick Settings Access Strips (Twitter Menu Options) */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 overflow-x-auto pb-1 scrollbar-none">
            <Link
              to="/bookmarks"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border hover:shadow-xs transition-all shrink-0 text-[#1769FF] bg-blue-50 border-blue-200"
            >
              <Bookmark size={13} className="fill-[#1769FF]" />
              <span>Bookmarks</span>
            </Link>
            {[
              { id: 'account', label: 'Your account', icon: User, color: 'text-gray-800 bg-gray-100 border-gray-200' },
              { id: 'monetization', label: 'Monetization', icon: BadgeDollarSign, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { id: 'premium', label: 'Premium', icon: Sparkles, color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { id: 'security', label: 'Security & access', icon: Lock, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
              { id: 'privacy', label: 'Privacy & safety', icon: Shield, color: 'text-slate-700 bg-slate-50 border-slate-200' },
              { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { id: 'accessibility', label: 'Accessibility & display', icon: Sliders, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
              { id: 'resources', label: 'Additional resources', icon: FileText, color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { id: 'help', label: 'Help Center', icon: HelpCircle, color: 'text-rose-700 bg-rose-50 border-rose-200' },
            ].map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => openSettings(feature.id as SettingsTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border hover:shadow-xs transition-all shrink-0 ${feature.color}`}
              >
                <feature.icon size={13} />
                <span>{feature.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Feed Tabs */}
      <div className="mt-4 border-b border-gray-200 flex">
        <button className="flex-1 py-4 text-center font-bold text-[#0A192F] relative">
          Posts
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1769FF] rounded-t-full"></div>
        </button>
        <button className="flex-1 py-4 text-center font-bold text-gray-500 hover:bg-gray-50 transition-colors">
          Replies
        </button>
        <button className="flex-1 py-4 text-center font-bold text-gray-500 hover:bg-gray-50 transition-colors">
          Media
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {posts.length === 0 ? (
          <div className="space-y-4">
            <div className="p-8 text-center text-gray-500">No posts yet</div>
            {PROMOTED_ADS_DATABASE.length > 0 && !dismissedAdIds.includes(PROMOTED_ADS_DATABASE[0].id) && (
              <PromotedAdCard
                ad={PROMOTED_ADS_DATABASE[0]}
                onDismiss={(id) => setDismissedAdIds((prev) => [...prev, id])}
              />
            )}
          </div>
        ) : (
          profileTimeline.map((item) =>
            item.type === 'post' ? (
              <PostCard key={item.post.id} post={item.post} onLike={handleLike} />
            ) : (
              <PromotedAdCard
                key={item.ad.id}
                ad={item.ad}
                onDismiss={(id) => setDismissedAdIds((prev) => [...prev, id])}
              />
            )
          )
        )}
      </div>

      {/* Comprehensive Profile Settings & Features Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />

      {/* Dedicated Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaved={(updated) => {
          setProfile((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </div>
  );
}
