import React, { useState } from 'react';
import {
  X,
  User,
  BadgeDollarSign,
  Sparkles,
  Lock,
  Shield,
  Bell,
  Sliders,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Check,
  Search,
  KeyRound,
  Trash2,
  ExternalLink,
  Send,
  AlertCircle,
  Eye,
  Volume2,
  Smartphone,
  Layers,
  Palette,
  Heart,
  Users,
  Radio,
  EyeOff,
  MessageSquare,
  VolumeX,
  Compass,
  MapPin,
  Bot,
  Share2,
  Building2,
  Plus,
  Info,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useTranslationStore, SUPPORTED_LANGUAGES } from '../store/useTranslationStore';
import clsx from 'clsx';

export type SettingsOptionId =
  | 'account'
  | 'monetization'
  | 'premium'
  | 'security'
  | 'privacy'
  | 'notifications'
  | 'accessibility'
  | 'resources'
  | 'help';

export type SettingsTab = SettingsOptionId;

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  initialTab,
}: ProfileSettingsModalProps) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Translation store
  const {
    isRealtimeActive,
    toggleRealtime,
    targetLanguage,
    setTargetLanguage,
    openModal: openTranslationModal,
  } = useTranslationStore();

  // Search filter inside settings
  const [searchQuery, setSearchQuery] = useState('');

  // Keep track of which dropdowns are expanded
  const [expandedSections, setExpandedSections] = useState<Record<SettingsOptionId, boolean>>({
    account: true, // Open by default
    monetization: false,
    premium: false,
    security: false,
    privacy: false,
    notifications: false,
    accessibility: false,
    resources: false,
    help: false,
  });

  // --- Editable Account Fields ---
  const [displayName, setDisplayName] = useState(user?.name || 'BellBird User');
  const [username, setUsername] = useState(user?.username || 'bellbird_user');
  const [bio, setBio] = useState(user?.bio || '');
  const [accountSaved, setAccountSaved] = useState(false);

  // --- Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // --- Monetization State ---
  const [creatorSubsEnabled, setCreatorSubsEnabled] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(false);
  const [tipHandle, setTipHandle] = useState('$bellbirdcreator');

  // --- Premium State ---
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'premium_plus'>(
    user?.isPremium ? 'premium' : 'free'
  );
  const [hideBadge, setHideBadge] = useState(false);
  const [premiumFeedback, setPremiumFeedback] = useState<string | null>(null);

  // --- Security & Privacy State ---
  const [isPrivateAccount, setIsPrivateAccount] = useState(user?.isPrivate ?? false);
  const [twoFactor, setTwoFactor] = useState(user?.twoFactor ?? false);
  const [allowDMs, setAllowDMs] = useState(user?.allowDMs ?? true);
  const [filterLowQuality, setFilterLowQuality] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [photoTagging, setPhotoTagging] = useState<'anyone' | 'following' | 'off'>('following');

  // --- Granular Privacy and Safety Features State ---
  const [expandedPrivacySub, setExpandedPrivacySub] = useState<string | null>(null);

  // 1. Your BellBird activity
  const [markSensitiveMedia, setMarkSensitiveMedia] = useState(false);
  const [attachLocationToPosts, setAttachLocationToPosts] = useState(false);
  const [allowPostAnalyticsSharing, setAllowPostAnalyticsSharing] = useState(true);
  const [displaySensitiveMedia, setDisplaySensitiveMedia] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Technology',
    'Design',
    'AI & Machine Learning',
    'Science',
    'Gaming',
    'Startups',
  ]);
  const [personalizedTrends, setPersonalizedTrends] = useState(true);
  const [hideSearchSensitive, setHideSearchSensitive] = useState(true);
  const [mutedWords, setMutedWords] = useState<string[]>(['crypto-scam', 'airdrop', 'spoilers', 'clickbait']);
  const [newMutedWordInput, setNewMutedWordInput] = useState('');
  const [muteNoProfilePic, setMuteNoProfilePic] = useState(true);
  const [muteNotFollowedBy, setMuteNotFollowedBy] = useState(false);
  const [blockedAccounts, setBlockedAccounts] = useState<string[]>(['@spambot_302', '@crypto_shill99']);
  const [mutedAccounts, setMutedAccounts] = useState<string[]>(['@annoying_news']);
  const [dmPermission, setDmPermission] = useState<'everyone' | 'verified' | 'following'>('everyone');
  const [filterLowQualityDMs, setFilterLowQualityDMs] = useState(true);
  const [spacesListeningVisibility, setSpacesListeningVisibility] = useState(true);
  const [allowSpacesInvites, setAllowSpacesInvites] = useState(true);
  const [discoverByEmail, setDiscoverByEmail] = useState(true);
  const [discoverByPhone, setDiscoverByPhone] = useState(false);
  const [syncContacts, setSyncContacts] = useState(false);
  const [contactsToast, setContactsToast] = useState<string | null>(null);
  const [accountCountry, setAccountCountry] = useState('United States');
  const [showLocationOnProfile, setShowLocationOnProfile] = useState(true);

  // 2. Data sharing and personalization
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [adMeasurement, setAdMeasurement] = useState(true);
  const [inferredIdentityPersonalization, setInferredIdentityPersonalization] = useState(true);
  const [crossDeviceTracking, setCrossDeviceTracking] = useState(false);
  const [partnerDataSharing, setPartnerDataSharing] = useState(false);
  const [partnerAnalytics, setPartnerAnalytics] = useState(true);
  const [personalizeByPlaces, setPersonalizeByPlaces] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(false);
  const [grokTrainingConsent, setGrokTrainingConsent] = useState(true);
  const [grokCollaboratorResearch, setGrokCollaboratorResearch] = useState(false);
  const [grokFeedback, setGrokFeedback] = useState<string | null>(null);

  // 3. Learn more about privacy on BellBird
  const [activePrivacyModal, setActivePrivacyModal] = useState<'center' | 'policy' | 'contact' | null>(null);
  const [privacyContactType, setPrivacyContactType] = useState('data_access');
  const [privacyContactMessage, setPrivacyContactMessage] = useState('');
  const [privacyContactSent, setPrivacyContactSent] = useState(false);

  // --- Notifications State ---
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [qualityFilter, setQualityFilter] = useState(true);

  // --- Accessibility, Display & Languages State ---
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(user?.reducedMotion ?? false);
  const [altTextReminder, setAltTextReminder] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [accentColor, setAccentColor] = useState('#1769FF');
  const [dataSaver, setDataSaver] = useState(user?.dataSaver ?? false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // --- Help Center Support Message ---
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (id: SettingsOptionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      account: true,
      monetization: true,
      premium: true,
      security: true,
      privacy: true,
      notifications: true,
      accessibility: true,
      resources: true,
      help: true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      account: false,
      monetization: false,
      premium: false,
      security: false,
      privacy: false,
      notifications: false,
      accessibility: false,
      resources: false,
      help: false,
    });
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: displayName, username, bio });
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const handleUpgradePremium = (plan: 'premium' | 'premium_plus') => {
    setSelectedPlan(plan);
    updateUser({ isPremium: true });
    setPremiumFeedback('Subscribed! Verified blue badge activated on your profile.');
    setTimeout(() => setPremiumFeedback(null), 3000);
  };

  const handleCancelPremium = () => {
    setSelectedPlan('free');
    updateUser({ isPremium: false });
    setPremiumFeedback('Subscription canceled. Switched to Free tier.');
    setTimeout(() => setPremiumFeedback(null), 3000);
  };

  const handleTogglePrivate = () => {
    const val = !isPrivateAccount;
    setIsPrivateAccount(val);
    updateUser({ isPrivate: val });
  };

  const handleToggle2FA = () => {
    const val = !twoFactor;
    setTwoFactor(val);
    updateUser({ twoFactor: val });
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const handleSendHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim()) return;
    setHelpSubmitted(true);
    setHelpMessage('');
    setTimeout(() => setHelpSubmitted(false), 3000);
  };

  // --- Privacy Sub-features Handlers ---
  const handleTogglePrivacySub = (subId: string) => {
    setExpandedPrivacySub((prev) => (prev === subId ? null : subId));
  };

  const handleAddMutedWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMutedWordInput.trim()) return;
    const word = newMutedWordInput.trim().toLowerCase();
    if (!mutedWords.includes(word)) {
      setMutedWords([...mutedWords, word]);
    }
    setNewMutedWordInput('');
  };

  const handleRemoveMutedWord = (word: string) => {
    setMutedWords(mutedWords.filter((w) => w !== word));
  };

  const handleUnblock = (account: string) => {
    setBlockedAccounts(blockedAccounts.filter((a) => a !== account));
  };

  const handleUnmute = (account: string) => {
    setMutedAccounts(mutedAccounts.filter((a) => a !== account));
  };

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleClearContacts = () => {
    setSyncContacts(false);
    setContactsToast('All synced address book contacts have been permanently deleted.');
    setTimeout(() => setContactsToast(null), 3000);
  };

  const handleClearGrokHistory = () => {
    setGrokFeedback('Grok conversation logs and model training cache cleared.');
    setTimeout(() => setGrokFeedback(null), 3000);
  };

  const handleSendPrivacyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyContactMessage.trim()) return;
    setPrivacyContactSent(true);
    setPrivacyContactMessage('');
    setTimeout(() => {
      setPrivacyContactSent(false);
      setActivePrivacyModal(null);
    }, 2500);
  };

  // Define the 9 official Twitter settings options
  const settingsOptions: Array<{
    id: SettingsOptionId;
    title: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'account',
      title: 'Your account',
      description: 'See information about your account, download data, or deactivate options.',
      icon: User,
    },
    {
      id: 'monetization',
      title: 'Monetization',
      description: 'See how you can earn money on BellBird with subscriptions and creator tips.',
      icon: BadgeDollarSign,
      badge: 'Creator',
    },
    {
      id: 'premium',
      title: 'Premium',
      description: 'Manage your subscription, verified checkmark badge, and exclusive features.',
      icon: Sparkles,
      badge: user?.isPremium ? 'Active' : undefined,
    },
    {
      id: 'security',
      title: 'Security and account access',
      description: 'Manage Two-Factor Authentication, connected apps, and active sessions.',
      icon: Lock,
    },
    {
      id: 'privacy',
      title: 'Privacy and safety',
      description:
        'Audience, media and tagging, your posts, content you see, mute and block, chat, Spaces, discoverability, ads, inferred identity, and Grok.',
      icon: Shield,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Select the kinds of notifications you get about activities, likes, and mentions.',
      icon: Bell,
    },
    {
      id: 'accessibility',
      title: 'Accessibility, display, and languages',
      description: 'Manage display contrast, themes, font sizes, data saver, and cache.',
      icon: Sliders,
    },
    {
      id: 'resources',
      title: 'Additional resources',
      description: 'Check out release notes, open source credits, and terms of service.',
      icon: FileText,
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'Frequently asked questions, guides, and contact support.',
      icon: HelpCircle,
    },
  ];

  // Filter options if user typed a search query
  const filteredOptions = settingsOptions.filter((opt) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (opt.title.toLowerCase().includes(q) || opt.description.toLowerCase().includes(q)) {
      return true;
    }
    // Deep match keywords for privacy section
    if (
      opt.id === 'privacy' &&
      [
        'audience',
        'media',
        'tagging',
        'tag',
        'posts',
        'content',
        'mute',
        'block',
        'chat',
        'spaces',
        'discoverability',
        'contacts',
        'location',
        'ads',
        'inferred',
        'partners',
        'grok',
        'xai',
        'policy',
        'safe',
        'activity',
      ].some((term) => term.includes(q) || q.includes(term))
    ) {
      return true;
    }
    return false;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings and Privacy"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full h-full sm:h-[90vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#0A192F]">Settings</h2>
            <span className="text-xs text-gray-400 font-medium">· BellBird</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs text-[#1769FF] font-semibold hover:underline hidden sm:inline px-2 py-1"
            >
              Expand all
            </button>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs text-gray-500 font-semibold hover:underline hidden sm:inline px-2 py-1"
            >
              Collapse all
            </button>
            <button
              onClick={onClose}
              aria-label="Close Settings"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Settings Bar */}
        <div className="p-3.5 px-5 bg-gray-50/70 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Settings (e.g. password, 2FA, verified, privacy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 focus:border-[#1769FF] rounded-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Single Menu Dropdown List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 sm:p-4">
          {filteredOptions.map((option) => {
            const isExpanded = expandedSections[option.id] || searchQuery.trim().length > 0;
            const Icon = option.icon;

            return (
              <div key={option.id} className="py-1">
                {/* Single Menu Option Header / Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(option.id)}
                  aria-expanded={isExpanded}
                  className={clsx(
                    'w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all group min-h-[52px]',
                    isExpanded ? 'bg-blue-50/40 text-[#1769FF]' : 'hover:bg-gray-50 text-gray-900'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        isExpanded ? 'bg-blue-100 text-[#1769FF]' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#0A192F] group-hover:text-[#1769FF] transition-colors">
                          {option.title}
                        </span>
                        {option.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1769FF]">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{option.description}</p>
                    </div>
                  </div>

                  <div className="text-gray-400 group-hover:text-gray-600 transition-transform">
                    {isExpanded ? <ChevronDown size={19} className="text-[#1769FF]" /> : <ChevronRight size={19} />}
                  </div>
                </button>

                {/* Dropped Down Features Panel */}
                {isExpanded && (
                  <div className="mt-1 mb-3 ml-3 sm:ml-6 pl-4 border-l-2 border-blue-200/80 space-y-4 py-2 animate-in fade-in duration-150">
                    {/* 1. YOUR ACCOUNT DROPDOWN FEATURES */}
                    {option.id === 'account' && (
                      <div className="space-y-4 max-w-xl pr-2">
                        {/* Account Information Form */}
                        <form onSubmit={handleSaveAccount} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Account Information</h4>
                          {accountSaved && (
                            <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                              <Check size={14} className="text-emerald-600" /> Account details updated!
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Display Name</label>
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1769FF]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Username Handle</label>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1769FF]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Bio</label>
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1769FF]"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#1769FF] text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors shadow-xs"
                          >
                            Save Account Changes
                          </button>
                        </form>

                        {/* Password Management */}
                        <form onSubmit={handleSavePassword} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Change Password</h4>
                          {passwordSaved && (
                            <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                              <Check size={14} className="text-emerald-600" /> Password successfully changed!
                            </div>
                          )}
                          <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg"
                          />
                          <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg"
                          />
                          <button
                            type="submit"
                            disabled={!currentPassword || !newPassword}
                            className="px-4 py-1.5 bg-[#0A192F] text-white text-xs font-bold rounded-full hover:bg-black transition-colors disabled:opacity-40"
                          >
                            Update Password
                          </button>
                        </form>

                        {/* Data Download Archive & Deactivate */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-gray-800">Download Data Archive</p>
                            <p className="text-gray-500">Get a copy of your chirps, media, and profile data.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert('Data archive request received. An email with download link will be dispatched shortly.')}
                            className="px-3 py-1 bg-white border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            Request
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. MONETIZATION DROPDOWN FEATURES */}
                    {option.id === 'monetization' && (
                      <div className="space-y-4 max-w-xl pr-2">
                        {/* Creator Subscriptions */}
                        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-[#0A192F]">Creator Subscriptions</h4>
                              <p className="text-xs text-gray-500">Earn monthly recurring revenue by offering subscriber-only posts.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCreatorSubsEnabled(!creatorSubsEnabled)}
                              className={clsx(
                                'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                creatorSubsEnabled ? 'bg-[#1769FF]' : 'bg-gray-300'
                              )}
                            >
                              <span
                                className={clsx(
                                  'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                  creatorSubsEnabled ? 'translate-x-5' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                          <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                            <p className="font-semibold text-gray-800">Current Payout Balance: $0.00</p>
                            <p className="text-gray-400 mt-0.5">Eligibility requirement: 500 followers & verified BellBird account.</p>
                          </div>
                        </div>

                        {/* Tips & Tipping */}
                        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-[#0A192F]">Allow Tips on Your Profile</h4>
                              <p className="text-xs text-gray-500">Add a tip jar button to your profile so supporters can send funds.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setTipsEnabled(!tipsEnabled)}
                              className={clsx(
                                'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                tipsEnabled ? 'bg-[#1769FF]' : 'bg-gray-300'
                              )}
                            >
                              <span
                                className={clsx(
                                  'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                  tipsEnabled ? 'translate-x-5' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                          {tipsEnabled && (
                            <div className="space-y-2 pt-1 animate-in fade-in">
                              <label className="block text-xs font-semibold text-gray-700">Cash App / Payment Handle</label>
                              <input
                                type="text"
                                value={tipHandle}
                                onChange={(e) => setTipHandle(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. PREMIUM DROPDOWN FEATURES */}
                    {option.id === 'premium' && (
                      <div className="space-y-4 max-w-xl pr-2">
                        {/* Verified status header */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-300"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#0A192F] text-sm">{user?.name}</span>
                                {user?.isPremium && (
                                  <CheckCircle2 size={16} className="text-[#1769FF] fill-[#1769FF] text-white" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {user?.isPremium ? 'Verified Blue Status: Active' : 'Tier: Free'}
                              </p>
                            </div>
                          </div>
                          {user?.isPremium && (
                            <span className="px-2.5 py-0.5 bg-blue-100 text-[#1769FF] text-xs font-bold rounded-full">
                              Verified
                            </span>
                          )}
                        </div>

                        {premiumFeedback && (
                          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200">
                            <Check size={14} className="text-emerald-600" />
                            <span>{premiumFeedback}</span>
                          </div>
                        )}

                        {/* Plan cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 bg-white border-2 border-[#1769FF] rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <h5 className="font-bold text-[#0A192F] text-sm">Premium</h5>
                                <span className="text-xs font-bold text-[#1769FF]">$8 / mo</span>
                              </div>
                              <ul className="text-[11px] text-gray-600 space-y-1 mb-3">
                                <li>✓ Verified blue checkmark</li>
                                <li>✓ Edit chirps up to 1 hr</li>
                                <li>✓ 25,000 character posts</li>
                                <li>✓ 50% fewer ads</li>
                              </ul>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpgradePremium('premium')}
                              className="w-full py-1.5 bg-[#1769FF] hover:bg-blue-600 text-white rounded-full text-xs font-bold transition-colors"
                            >
                              {user?.isPremium ? 'Active' : 'Get Premium'}
                            </button>
                          </div>

                          <div className="p-3.5 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <h5 className="font-bold text-[#0A192F] text-sm">Premium+</h5>
                                <span className="text-xs font-bold text-gray-700">$16 / mo</span>
                              </div>
                              <ul className="text-[11px] text-gray-600 space-y-1 mb-3">
                                <li>✓ Zero ads in all feeds</li>
                                <li>✓ Largest boost in replies</li>
                                <li>✓ Creator monetization suite</li>
                              </ul>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpgradePremium('premium_plus')}
                              className="w-full py-1.5 bg-[#0A192F] hover:bg-black text-white rounded-full text-xs font-bold transition-colors"
                            >
                              Get Premium+
                            </button>
                          </div>
                        </div>

                        {user?.isPremium && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-gray-500">Want to cancel subscription?</span>
                            <button
                              type="button"
                              onClick={handleCancelPremium}
                              className="text-red-500 hover:underline font-semibold"
                            >
                              Switch back to Free
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. SECURITY AND ACCOUNT ACCESS DROPDOWN FEATURES */}
                    {option.id === 'security' && (
                      <div className="space-y-3 max-w-xl pr-2">
                        {/* 2FA Toggle */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[#0A192F]">Two-Factor Authentication (2FA)</p>
                              <KeyRound size={13} className="text-[#1769FF]" />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Require an SMS or authenticator code when signing into your account.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggle2FA}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              twoFactor ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                twoFactor ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        {/* Active Sessions */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
                          <p className="text-xs font-bold text-[#0A192F]">Active Logged-In Sessions</p>
                          <div className="text-[11px] text-gray-600 space-y-1">
                            <p>• Chrome on macOS · San Francisco, CA (Active now)</p>
                            <p>• BellBird iOS App / Mobile PWA (Active today)</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert('Successfully terminated all remote sessions.')}
                            className="text-xs text-red-500 font-semibold hover:underline pt-1 block"
                          >
                            Log out of all other sessions
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 5. PRIVACY AND SAFETY DROPDOWN FEATURES */}
                    {option.id === 'privacy' && (
                      <div className="space-y-6 max-w-xl pr-1 text-gray-800">
                        {/* Section 1: Your BellBird activity */}
                        <div>
                          <div className="mb-2.5 flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Your BellBird activity</h4>
                              <p className="text-[11px] text-gray-500">
                                Manage what information you allow other people on BellBird to see.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {/* 1.1 Audience, media and tagging */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('audience')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <Users size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0A192F]">Audience, media and tagging</p>
                                      {isPrivateAccount && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1769FF] border border-blue-200">
                                          Protected
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage what information you allow other people on BellBird to see.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'audience' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'audience' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  {/* Protect your posts */}
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Protect your posts</p>
                                      <p className="text-[11px] text-gray-500">
                                        When selected, your posts and other account information are only visible to people who follow you.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleTogglePrivate}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        isPrivateAccount ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          isPrivateAccount ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  {/* Photo tagging */}
                                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                    <p className="font-semibold text-gray-900">Photo tagging</p>
                                    <p className="text-[11px] text-gray-500">Allow people to tag you in photos and media.</p>
                                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                                      {(['anyone', 'following', 'off'] as const).map((opt) => (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => setPhotoTagging(opt)}
                                          className={clsx(
                                            'py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all text-center capitalize',
                                            photoTagging === opt
                                              ? 'border-[#1769FF] bg-blue-50 text-[#1769FF]'
                                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                          )}
                                        >
                                          {opt === 'following' ? 'Only followed' : opt}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Sensitive media flag */}
                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Mark media you post as sensitive</p>
                                      <p className="text-[11px] text-gray-500">
                                        Flag photos and videos that may contain sensitive or mature content.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setMarkSensitiveMedia(!markSensitiveMedia)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        markSensitiveMedia ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          markSensitiveMedia ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.2 Your posts */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('posts')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Your posts</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage the information associated with your posts.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'posts' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'posts' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Attach location information to your posts</p>
                                      <p className="text-[11px] text-gray-500">
                                        If selected, posts you publish can include your current city or neighborhood.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setAttachLocationToPosts(!attachLocationToPosts)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        attachLocationToPosts ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          attachLocationToPosts ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Post analytics & view counts</p>
                                      <p className="text-[11px] text-gray-500">
                                        Allow other people to see how many impressions your chirps receive.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setAllowPostAnalyticsSharing(!allowPostAnalyticsSharing)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        allowPostAnalyticsSharing ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          allowPostAnalyticsSharing ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.3 Content you see */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('content')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <Eye size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0A192F]">Content you see</p>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {selectedInterests.length} topics
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Decide what you see on BellBird based on your preferences, like interests.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'content' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'content' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Display media that may contain sensitive content</p>
                                      <p className="text-[11px] text-gray-500">Unmask media warnings automatically across all feeds.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setDisplaySensitiveMedia(!displaySensitiveMedia)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        displaySensitiveMedia ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          displaySensitiveMedia ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  {/* Interests */}
                                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <p className="font-semibold text-gray-900">Interests & Topics</p>
                                      <span className="text-[10px] text-gray-400">Tap to toggle topics</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">Topics you're interested in will shape your feed and search.</p>
                                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                                      {[
                                        'Technology',
                                        'Design',
                                        'AI & Machine Learning',
                                        'Science',
                                        'Gaming',
                                        'Startups',
                                        'News',
                                        'Sports',
                                        'Entertainment',
                                        'Finance',
                                        'Coding',
                                      ].map((topic) => {
                                        const isSel = selectedInterests.includes(topic);
                                        return (
                                          <button
                                            key={topic}
                                            type="button"
                                            onClick={() => handleToggleInterest(topic)}
                                            className={clsx(
                                              'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1',
                                              isSel
                                                ? 'bg-[#1769FF] text-white border-[#1769FF]'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                            )}
                                          >
                                            {isSel && <Check size={12} />}
                                            {topic}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Trends personalized */}
                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Trends for you</p>
                                      <p className="text-[11px] text-gray-500">Personalize explore trends based on your activity and location.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPersonalizedTrends(!personalizedTrends)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        personalizedTrends ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          personalizedTrends ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.4 Mute and block */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('mute_block')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <VolumeX size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0A192F]">Mute and block</p>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {mutedWords.length} muted words
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage the accounts, words, and notifications that you’ve muted or blocked.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'mute_block' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'mute_block' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  {/* Blocked Accounts list */}
                                  <div className="pt-2 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <p className="font-semibold text-gray-900">Blocked accounts</p>
                                      <span className="text-[11px] text-gray-400">{blockedAccounts.length} accounts</span>
                                    </div>
                                    {blockedAccounts.length > 0 ? (
                                      <div className="space-y-1">
                                        {blockedAccounts.map((acc) => (
                                          <div key={acc} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200/80">
                                            <span className="text-xs font-semibold text-gray-700">{acc}</span>
                                            <button
                                              type="button"
                                              onClick={() => handleUnblock(acc)}
                                              className="px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors"
                                            >
                                              Unblock
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-gray-400 italic">No blocked accounts.</p>
                                    )}
                                  </div>

                                  {/* Muted words */}
                                  <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <p className="font-semibold text-gray-900">Muted words & hashtags</p>
                                    <p className="text-[11px] text-gray-500">You won't see posts containing these words or phrases.</p>
                                    <form onSubmit={handleAddMutedWord} className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Add word, phrase or hashtag..."
                                        value={newMutedWordInput}
                                        onChange={(e) => setNewMutedWordInput(e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#1769FF]"
                                      />
                                      <button
                                        type="submit"
                                        disabled={!newMutedWordInput.trim()}
                                        className="px-3 py-1.5 bg-[#0A192F] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1"
                                      >
                                        <Plus size={14} /> Add
                                      </button>
                                    </form>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {mutedWords.map((word) => (
                                        <span
                                          key={word}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium"
                                        >
                                          {word}
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveMutedWord(word)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove"
                                          >
                                            <X size={12} />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Muted notifications */}
                                  <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <p className="font-semibold text-gray-900">Muted notifications</p>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[11px] text-gray-600">Accounts who don't have a profile photo</span>
                                      <button
                                        type="button"
                                        onClick={() => setMuteNoProfilePic(!muteNoProfilePic)}
                                        className={clsx(
                                          'w-9 h-5 rounded-full transition-colors relative shrink-0 p-0.5',
                                          muteNoProfilePic ? 'bg-[#1769FF]' : 'bg-gray-300'
                                        )}
                                      >
                                        <span
                                          className={clsx(
                                            'block w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                                            muteNoProfilePic ? 'translate-x-4' : 'translate-x-0'
                                          )}
                                        />
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[11px] text-gray-600">Accounts you don't follow</span>
                                      <button
                                        type="button"
                                        onClick={() => setMuteNotFollowedBy(!muteNotFollowedBy)}
                                        className={clsx(
                                          'w-9 h-5 rounded-full transition-colors relative shrink-0 p-0.5',
                                          muteNotFollowedBy ? 'bg-[#1769FF]' : 'bg-gray-300'
                                        )}
                                      >
                                        <span
                                          className={clsx(
                                            'block w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                                            muteNotFollowedBy ? 'translate-x-4' : 'translate-x-0'
                                          )}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.5 Chat */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('chat')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <MessageSquare size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0A192F]">Chat</p>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1769FF]">
                                        {dmPermission === 'everyone' ? 'Everyone' : dmPermission === 'verified' ? 'Verified only' : 'Following only'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage who can message you directly.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'chat' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'chat' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="pt-2 space-y-1.5">
                                    <p className="font-semibold text-gray-900">Allow message requests from</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                                      {[
                                        { id: 'everyone', label: 'Everyone' },
                                        { id: 'verified', label: 'Verified only' },
                                        { id: 'following', label: 'People you follow' },
                                      ].map((mode) => (
                                        <button
                                          key={mode.id}
                                          type="button"
                                          onClick={() => {
                                            setDmPermission(mode.id as any);
                                            setAllowDMs(mode.id === 'everyone');
                                          }}
                                          className={clsx(
                                            'py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all text-center',
                                            dmPermission === mode.id
                                              ? 'border-[#1769FF] bg-blue-50 text-[#1769FF]'
                                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                          )}
                                        >
                                          {mode.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Filter low-quality messages</p>
                                      <p className="text-[11px] text-gray-500">
                                        Hide message requests identified as spam or unsolicited bots.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setFilterLowQualityDMs(!filterLowQualityDMs)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        filterLowQualityDMs ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          filterLowQualityDMs ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Show read receipts</p>
                                      <p className="text-[11px] text-gray-500">
                                        Let people know when you’ve viewed their direct message.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setReadReceipts(!readReceipts)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        readReceipts ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          readReceipts ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.6 Spaces */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('spaces')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <Radio size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Spaces</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage who can see your Spaces listening activity.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'spaces' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'spaces' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Let followers see your Spaces listening activity</p>
                                      <p className="text-[11px] text-gray-500">
                                        When active, your followers can see which live audio Spaces you are currently tuned into.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSpacesListeningVisibility(!spacesListeningVisibility)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        spacesListeningVisibility ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          spacesListeningVisibility ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Allow speaker invitations from anyone</p>
                                      <p className="text-[11px] text-gray-500">Hosts can invite you to speak in ongoing Spaces.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setAllowSpacesInvites(!allowSpacesInvites)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        allowSpacesInvites ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          allowSpacesInvites ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.7 Discoverability and contacts */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('discoverability')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <Compass size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Discoverability and contacts</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Control your discoverability settings and manage contacts you’ve imported.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'discoverability' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'discoverability' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  {contactsToast && (
                                    <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200">
                                      <Check size={14} className="text-emerald-600" />
                                      <span>{contactsToast}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Find you by email address</p>
                                      <p className="text-[11px] text-gray-500">
                                        Let people who have your email address discover your account on BellBird.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setDiscoverByEmail(!discoverByEmail)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        discoverByEmail ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          discoverByEmail ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Find you by phone number</p>
                                      <p className="text-[11px] text-gray-500">
                                        Let people who have your phone number discover your account on BellBird.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setDiscoverByPhone(!discoverByPhone)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        discoverByPhone ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          discoverByPhone ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Sync address book contacts</p>
                                      <p className="text-[11px] text-gray-500">
                                        Periodically sync contacts to suggest friends and connections.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSyncContacts(!syncContacts)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        syncContacts ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          syncContacts ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleClearContacts}
                                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors border border-red-200"
                                    >
                                      Remove all imported contacts
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 1.8 About your account */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('about_account')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0A192F]">About your account</p>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {accountCountry}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage the location associated with your account.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'about_account' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'about_account' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="pt-2 space-y-1.5">
                                    <label className="font-semibold text-gray-900 block">Account country / region</label>
                                    <select
                                      value={accountCountry}
                                      onChange={(e) => setAccountCountry(e.target.value)}
                                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1769FF]"
                                    >
                                      <option value="United States">United States</option>
                                      <option value="United Kingdom">United Kingdom</option>
                                      <option value="Canada">Canada</option>
                                      <option value="Germany">Germany</option>
                                      <option value="Japan">Japan</option>
                                      <option value="India">India</option>
                                      <option value="Australia">Australia</option>
                                      <option value="France">France</option>
                                    </select>
                                    <p className="text-[11px] text-gray-500">
                                      The country helps BellBird tailor legal requirements, tax settings, and regional compliance.
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Display location on public profile</p>
                                      <p className="text-[11px] text-gray-500">Show country badge on your public bio page.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowLocationOnProfile(!showLocationOnProfile)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        showLocationOnProfile ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          showLocationOnProfile ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Data sharing and personalization */}
                        <div className="pt-2 border-t border-gray-200/80">
                          <div className="mb-2.5 flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Data sharing and personalization
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                Control how your data is shared, tailored, and used across models.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {/* 2.1 Ads preferences */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('ads')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <SlidersHorizontal size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Ads preferences</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage your ads experience on BellBird.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'ads' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'ads' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Personalized ads</p>
                                      <p className="text-[11px] text-gray-500">
                                        Allow ads based on your activity off BellBird and interests.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPersonalizedAds(!personalizedAds)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        personalizedAds ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          personalizedAds ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Ad measurement with partners</p>
                                      <p className="text-[11px] text-gray-500">
                                        Measure ad conversions and aggregate marketing effectiveness.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setAdMeasurement(!adMeasurement)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        adMeasurement ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          adMeasurement ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2.2 Inferred identity */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('inferred_id')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Smartphone size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Inferred identity</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Allow BellBird to personalize your experience with your inferred activity, e.g. activity on devices you haven’t used to log in to BellBird.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'inferred_id' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'inferred_id' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Personalize based on inferred activity</p>
                                      <p className="text-[11px] text-gray-500">
                                        Personalize your feed and recommendations using browsing patterns from other associated devices.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setInferredIdentityPersonalization(!inferredIdentityPersonalization)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        inferredIdentityPersonalization ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          inferredIdentityPersonalization ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Cross-device web tracking</p>
                                      <p className="text-[11px] text-gray-500">Link web activity across multiple browsers and mobile apps.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setCrossDeviceTracking(!crossDeviceTracking)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        crossDeviceTracking ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          crossDeviceTracking ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2.3 Data sharing with business partners */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('partners')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Building2 size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Data sharing with business partners</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Allow sharing of additional information with BellBird’s business partners.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'partners' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'partners' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Share additional information with partners</p>
                                      <p className="text-[11px] text-gray-500">
                                        Allow sharing of non-identifying partner metrics, device telemetry, and product research.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPartnerDataSharing(!partnerDataSharing)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        partnerDataSharing ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          partnerDataSharing ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Partner analytics & telemetry</p>
                                      <p className="text-[11px] text-gray-500">Share anonymous diagnostic insights with SDK providers.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPartnerAnalytics(!partnerAnalytics)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        partnerAnalytics ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          partnerAnalytics ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2.4 Location information */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('location_info')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#0A192F]">Location information</p>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Manage the location information BellBird uses to personalize your experience.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'location_info' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'location_info' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">Personalize based on places you’ve been</p>
                                      <p className="text-[11px] text-gray-500">
                                        Use your frequent check-ins and travel location history to tailor content and trends.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPersonalizeByPlaces(!personalizeByPlaces)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        personalizeByPlaces ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          personalizeByPlaces ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Precise location (GPS)</p>
                                      <p className="text-[11px] text-gray-500">
                                        Allow BellBird to collect, store, and utilize your device’s exact GPS coordinates.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPreciseLocation(!preciseLocation)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        preciseLocation ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          preciseLocation ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2.5 Grok & Third-party Collaborators */}
                            <div className="rounded-2xl border border-gray-200/90 bg-gray-50/60 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacySub('grok')}
                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0 pr-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0A192F]">Grok & Third-party Collaborators</p>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                        xAI
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                      Allow your public data as well as your interactions, inputs, and results with Grok and xAI to be used for training and fine-tuning.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-gray-400 shrink-0">
                                  {expandedPrivacySub === 'grok' ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                </div>
                              </button>

                              {expandedPrivacySub === 'grok' && (
                                <div className="p-3.5 pt-1 border-t border-gray-200/70 bg-white space-y-3.5 text-xs animate-in fade-in duration-100">
                                  {grokFeedback && (
                                    <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200">
                                      <Check size={14} className="text-emerald-600" />
                                      <span>{grokFeedback}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between gap-3 pt-2">
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        Allow your public data as well as interactions with Grok to train models
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        Allow your public posts, inputs, and conversations with Grok to be used to train and fine-tune xAI foundational models.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setGrokTrainingConsent(!grokTrainingConsent)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        grokTrainingConsent ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          grokTrainingConsent ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                                    <div>
                                      <p className="font-semibold text-gray-900">Third-party research collaborators</p>
                                      <p className="text-[11px] text-gray-500">
                                        Share de-identified model evaluations with external academic AI safety partners.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setGrokCollaboratorResearch(!grokCollaboratorResearch)}
                                      className={clsx(
                                        'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                                        grokCollaboratorResearch ? 'bg-[#1769FF]' : 'bg-gray-300'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                          grokCollaboratorResearch ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleClearGrokHistory}
                                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors border border-red-200"
                                    >
                                      Clear Grok conversation history
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Learn more about privacy on BellBird */}
                        <div className="pt-2 border-t border-gray-200/80">
                          <div className="mb-2.5">
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                              Learn more about privacy on BellBird
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              Review privacy resources, global disclosures, or contact our team.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            {/* Privacy center */}
                            <button
                              type="button"
                              onClick={() => setActivePrivacyModal('center')}
                              className="w-full p-3 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 flex items-center justify-between text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Shield size={15} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0A192F]">Privacy center</p>
                                  <p className="text-[11px] text-gray-500">Explore data rights, architecture, and safety principles.</p>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>

                            {/* Privacy policy */}
                            <button
                              type="button"
                              onClick={() => setActivePrivacyModal('policy')}
                              className="w-full p-3 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 flex items-center justify-between text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1769FF] flex items-center justify-center shrink-0">
                                  <FileText size={15} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0A192F]">Privacy policy</p>
                                  <p className="text-[11px] text-gray-500">Read our formal terms, GDPR disclosure, and data usage.</p>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>

                            {/* Contact us */}
                            <button
                              type="button"
                              onClick={() => setActivePrivacyModal('contact')}
                              className="w-full p-3 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 flex items-center justify-between text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                  <Mail size={15} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0A192F]">Contact us</p>
                                  <p className="text-[11px] text-gray-500">Submit requests to our Data Protection Officer.</p>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. NOTIFICATIONS DROPDOWN FEATURES */}
                    {option.id === 'notifications' && (
                      <div className="space-y-3 max-w-xl pr-2">
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">Push Notifications</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Receive alerts for likes, replies, follows, and mentions.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPushNotifs(!pushNotifs)}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              pushNotifs ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                pushNotifs ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">Quality Notification Filter</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Filter out lower-quality notifications from automated bots.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQualityFilter(!qualityFilter)}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              qualityFilter ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                qualityFilter ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">Audio and Sound Effects</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Play subtle chirping sounds when posting or liking.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSoundEffects(!soundEffects)}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              soundEffects ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                soundEffects ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 7. ACCESSIBILITY, DISPLAY, AND LANGUAGES DROPDOWN FEATURES */}
                    {option.id === 'accessibility' && (
                      <div className="space-y-3 max-w-xl pr-2">
                        {/* High contrast */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">High Contrast Mode</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Increase color contrast for easier reading.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setHighContrast(!highContrast)}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              highContrast ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                highContrast ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        {/* Reduce Motion */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">Reduce Motion</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Turn off decorative animations and smooth scrolling effects.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReducedMotion(!reducedMotion)}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              reducedMotion ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                reducedMotion ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        {/* Data Saver Mode */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">Data Saver</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Automatically reduces image resolution on mobile networks.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDataSaver(!dataSaver)}
                            className={clsx(
                              'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5',
                              dataSaver ? 'bg-[#1769FF]' : 'bg-gray-300'
                            )}
                          >
                            <span
                              className={clsx(
                                'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                dataSaver ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        {/* Real-Time Live Translation Option */}
                        <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-[#1769FF]" />
                              <div>
                                <p className="text-xs font-bold text-[#0A192F] flex items-center gap-1.5">
                                  <span>Real-Time Translation</span>
                                  <span className="text-[10px] bg-[#1769FF] text-white px-1.5 py-0.2 rounded-full font-bold">
                                    AI
                                  </span>
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Translate chirps and profile descriptions automatically across BellBird.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={toggleRealtime}
                              className={clsx(
                                'w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer',
                                isRealtimeActive ? 'bg-[#1769FF]' : 'bg-gray-300'
                              )}
                            >
                              <span
                                className={clsx(
                                  'block w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                                  isRealtimeActive ? 'translate-x-5' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-blue-100 text-xs">
                            <span className="text-gray-600 font-medium">Target Language</span>
                            <select
                              value={targetLanguage}
                              onChange={(e) => setTargetLanguage(e.target.value)}
                              className="px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#1769FF]"
                            >
                              {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                  {lang.flag} {lang.name} ({lang.nativeName})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={openTranslationModal}
                            className="w-full py-1.5 bg-white hover:bg-blue-50 text-[#1769FF] text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Sparkles size={13} />
                            <span>Open Translation Studio & Sandbox</span>
                          </button>
                        </div>

                        {/* Media Cache */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0A192F]">Media Cache</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">48.2 MB temporary image data.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleClearCache}
                            className={clsx(
                              'px-3 py-1 rounded-full text-xs font-bold transition-all',
                              cacheCleared ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-300 text-gray-700'
                            )}
                          >
                            {cacheCleared ? 'Cache Cleared' : 'Clear Cache'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 8. ADDITIONAL RESOURCES DROPDOWN FEATURES */}
                    {option.id === 'resources' && (
                      <div className="space-y-3 max-w-xl pr-2 text-xs text-gray-700">
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
                          <p className="font-bold text-[#0A192F]">Release Notes & Changelog</p>
                          <p className="text-gray-500 leading-relaxed">
                            BellBird v1.3 Production MVP: Full-stack responsive PWA, Twitter-style search, pull-to-refresh gestures, profile customization suite.
                          </p>
                        </div>
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
                          <p className="font-bold text-[#0A192F]">Open Source Software Notices</p>
                          <p className="text-gray-500 leading-relaxed">
                            Built with React 19, Vite, Tailwind CSS 4, Zustand, Lucide React, and Node.js.
                          </p>
                        </div>
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 flex justify-between items-center">
                          <span className="font-bold text-[#0A192F]">Terms of Service & Privacy Policy</span>
                          <span className="text-[#1769FF] font-semibold">Updated 2026</span>
                        </div>
                      </div>
                    )}

                    {/* 9. HELP CENTER DROPDOWN FEATURES */}
                    {option.id === 'help' && (
                      <div className="space-y-3 max-w-xl pr-2">
                        {/* FAQs */}
                        <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
                          <p className="font-bold text-[#0A192F]">Frequently Asked Questions</p>
                          <details className="cursor-pointer">
                            <summary className="font-semibold text-gray-700">How do I get the Verified Blue checkmark?</summary>
                            <p className="text-gray-500 mt-1 pl-2">
                              Open the Premium dropdown above and select the Premium plan. Your account instantly receives the blue verified badge!
                            </p>
                          </details>
                          <details className="cursor-pointer">
                            <summary className="font-semibold text-gray-700">How does search work?</summary>
                            <p className="text-gray-500 mt-1 pl-2">
                              Tap the Search button in the bottom navigation bar to search across chirps, hashtags, and user accounts.
                            </p>
                          </details>
                          <details className="cursor-pointer">
                            <summary className="font-semibold text-gray-700">How do I pull to refresh?</summary>
                            <p className="text-gray-500 mt-1 pl-2">
                              On the Home feed, scroll to the top and drag down with your finger or mouse to fetch the latest chirps.
                            </p>
                          </details>
                        </div>

                        {/* Contact Support Form */}
                        <form onSubmit={handleSendHelp} className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
                          <p className="text-xs font-bold text-[#0A192F]">Contact BellBird Support</p>
                          {helpSubmitted && (
                            <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                              <Check size={14} className="text-emerald-600" /> Support ticket submitted! We will respond within 24 hours.
                            </div>
                          )}
                          <textarea
                            placeholder="Describe your issue or feedback..."
                            value={helpMessage}
                            onChange={(e) => setHelpMessage(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1769FF]"
                          />
                          <button
                            type="submit"
                            disabled={!helpMessage.trim()}
                            className="px-4 py-1.5 bg-[#1769FF] text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                          >
                            <Send size={13} /> Submit Request
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Overlay for Privacy Center, Privacy Policy, and Contact Us */}
        {activePrivacyModal && (
          <div className="absolute inset-0 z-30 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePrivacyModal(null)}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors mr-1"
                >
                  <X size={18} />
                </button>
                <h3 className="font-bold text-sm sm:text-base text-[#0A192F] capitalize">
                  {activePrivacyModal === 'center'
                    ? 'Privacy Center'
                    : activePrivacyModal === 'policy'
                    ? 'Privacy Policy'
                    : 'Contact Data Protection Team'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePrivacyModal(null)}
                className="text-xs font-semibold text-[#1769FF] hover:underline"
              >
                Done
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-gray-700 space-y-4">
              {activePrivacyModal === 'center' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                    <Shield className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-bold text-emerald-900 text-sm">Privacy Principles on BellBird</h4>
                      <p className="text-emerald-800 text-xs mt-1">
                        We believe user privacy and security are foundational human rights. You control your posts, your audience, your discoverability, and whether your data is used for AI model training.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50">
                      <h5 className="font-bold text-[#0A192F] text-xs">1. Transparency & Control</h5>
                      <p className="text-gray-500 mt-1 leading-relaxed">
                        Every user retains granular switches for public visibility, DM access, and interest targeting. No hidden telemetry is collected without consent.
                      </p>
                    </div>

                    <div className="p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50">
                      <h5 className="font-bold text-[#0A192F] text-xs">2. Grok & AI Training Opt-Out</h5>
                      <p className="text-gray-500 mt-1 leading-relaxed">
                        You can disable Grok model training at any time with a single switch in your settings. Your private DMs are never used for AI model training.
                      </p>
                    </div>

                    <div className="p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50">
                      <h5 className="font-bold text-[#0A192F] text-xs">3. End-to-End Protections</h5>
                      <p className="text-gray-500 mt-1 leading-relaxed">
                        Industry-grade encryption across all network communication, certified TLS 1.3 endpoints, and immediate revocation for active remote sessions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePrivacyModal === 'policy' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <h4 className="font-bold text-[#0A192F] text-sm">Official Privacy Policy Summary</h4>
                    <p className="text-gray-600 text-xs mt-1">
                      Effective Date: October 2026 · Compliant with GDPR, CCPA, and global data privacy regulations.
                    </p>
                  </div>

                  <div className="space-y-3.5 leading-relaxed text-gray-600">
                    <div>
                      <h5 className="font-bold text-[#0A192F] text-xs">1. Information We Collect</h5>
                      <p className="mt-1">
                        We collect information you provide directly (such as your profile name, username, bio, and chirps you publish) as well as technical device identifiers to ensure feed security and spam prevention.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-[#0A192F] text-xs">2. How We Share Information</h5>
                      <p className="mt-1">
                        Public chirps are visible globally. If your account is set to Protected, only approved followers can view your chirps. We do not sell your personal identifying information to data brokers.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-[#0A192F] text-xs">3. Your Data Rights</h5>
                      <p className="mt-1">
                        Under European and California consumer laws, you have the right to request a complete copy of your data archive, request immediate deletion of your account, or restrict ad targeting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePrivacyModal === 'contact' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                    <h4 className="font-bold text-indigo-950 text-sm">Contact Data Protection Officer (DPO)</h4>
                    <p className="text-indigo-800 text-xs mt-1">
                      Our legal and privacy compliance team is available to assist you with data requests or inquiries.
                    </p>
                  </div>

                  {privacyContactSent ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2">
                      <Check className="text-emerald-600" size={18} />
                      <span className="font-semibold text-xs">
                        Your inquiry has been submitted! Our DPO will contact you within 48 hours.
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendPrivacyContact} className="space-y-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-xs mb-1">Inquiry Type</label>
                        <select
                          value={privacyContactType}
                          onChange={(e) => setPrivacyContactType(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1769FF]"
                        >
                          <option value="data_access">Data Export & Archive Request</option>
                          <option value="erasure">Account Erasure (Right to be Forgotten)</option>
                          <option value="correction">Correct Account Information</option>
                          <option value="grok">Grok & xAI Training Questions</option>
                          <option value="general">General Privacy Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 text-xs mb-1">Your Message or Request</label>
                        <textarea
                          rows={4}
                          value={privacyContactMessage}
                          onChange={(e) => setPrivacyContactMessage(e.target.value)}
                          placeholder="Describe your request or privacy inquiry in detail..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1769FF]"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActivePrivacyModal(null)}
                          className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!privacyContactMessage.trim()}
                          className="px-5 py-2 bg-[#1769FF] hover:bg-blue-600 disabled:opacity-40 text-white rounded-full font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Send size={13} /> Submit Inquiry
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
