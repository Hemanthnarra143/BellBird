import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Check,
  Sparkles,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  Palette,
} from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import clsx from 'clsx';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedUser: any) => void;
}

const PRESET_AVATARS = [
  { label: 'Current / Default', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
  { label: 'Alex', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
  { label: 'Jane', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
  { label: 'Sarah', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300' },
  { label: 'Marcus', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' },
  { label: 'Elena', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
  { label: 'David', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300' },
  { label: 'Tech Minimalist', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300' },
];

const PRESET_COVERS = [
  { label: 'Bell Navy & Cyan', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200' },
  { label: 'Midnight Gradient', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200' },
  { label: 'Golden Cityscape', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200' },
  { label: 'Cyber Tech Grid', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200' },
  { label: 'Modern Abstract Art', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200' },
  { label: 'Minimal Architectural Glass', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200' },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showCustomAvatarUrl, setShowCustomAvatarUrl] = useState(false);
  const [showCustomCoverUrl, setShowCustomCoverUrl] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [customCoverInput, setCustomCoverInput] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state with current user whenever modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || 'San Francisco, CA');
      setWebsite(user.website || 'https://bellbird.app');
      setAvatar(user.avatar || PRESET_AVATARS[0].url);
      setCoverImage(
        user.coverImage ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'
      );
      setErrorMsg('');
      setShowAvatarPicker(false);
      setShowCoverPicker(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar: avatar.trim(),
        coverImage: coverImage.trim(),
      };

      const res = await fetch(`/api/users/${user?.id || '1'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        updateUser(updated);
        onSaved?.(updated);
        setSuccessToast(true);
        setTimeout(() => {
          setSuccessToast(false);
          onClose();
        }, 800);
      } else {
        setErrorMsg('Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg('Network error while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 hover:text-black min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#0A192F]">Edit profile</h2>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className={clsx(
              'px-5 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm min-h-[38px]',
              isSaving || !name.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0A192F] hover:bg-[#1769FF] text-white active:scale-95'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 text-sm flex items-center justify-center gap-2 font-medium">
            <Check size={16} className="text-emerald-600" />
            Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-2 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-0 pb-8">
          {/* Cover Header Banner */}
          <div className="relative group">
            <div
              className="h-36 sm:h-44 w-full bg-cover bg-center bg-no-repeat transition-all"
              style={{
                backgroundImage: `url(${coverImage})`,
                backgroundColor: '#1769FF',
              }}
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            </div>

            {/* Change Cover Action Buttons */}
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-transform hover:scale-110 active:scale-95 flex items-center gap-1.5 text-xs font-semibold px-4"
                title="Change Cover Banner"
              >
                <Camera size={18} />
                <span>Change Banner</span>
              </button>
            </div>
          </div>

          {/* Cover Picker Dropdown / Gallery */}
          {showCoverPicker && (
            <div className="bg-gray-50 border-b border-gray-200 p-4 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Banner Style
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomCoverUrl(!showCustomCoverUrl)}
                  className="text-xs text-[#1769FF] font-semibold hover:underline flex items-center gap-1"
                >
                  <ImageIcon size={13} />
                  {showCustomCoverUrl ? 'Choose Presets' : 'Custom URL'}
                </button>
              </div>

              {showCustomCoverUrl ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste banner image URL..."
                    value={customCoverInput}
                    onChange={(e) => setCustomCoverInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#1769FF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCoverInput.trim()) {
                        setCoverImage(customCoverInput.trim());
                        setShowCoverPicker(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-[#1769FF] text-white text-xs font-bold rounded-xl"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCoverImage(preset.url);
                        setShowCoverPicker(false);
                      }}
                      className={clsx(
                        'relative rounded-xl overflow-hidden h-16 border-2 transition-all hover:scale-105',
                        coverImage === preset.url
                          ? 'border-[#1769FF] ring-2 ring-[#1769FF]/30'
                          : 'border-transparent'
                      )}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 px-1 truncate text-center font-medium">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Avatar and Info Section */}
          <div className="px-5 sm:px-6">
            <div className="flex justify-between items-end relative -mt-12 sm:-mt-14 mb-4">
              <div className="relative group">
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'BellBird')}&background=1769FF&color=fff`;
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                  title="Change Avatar Photo"
                >
                  <Camera size={20} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="text-xs font-bold text-[#1769FF] hover:underline flex items-center gap-1 pb-2"
              >
                <Palette size={14} />
                <span>Choose avatar</span>
              </button>
            </div>

            {/* Avatar Picker Gallery */}
            {showAvatarPicker && (
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Choose from Gallery
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomAvatarUrl(!showCustomAvatarUrl)}
                    className="text-xs text-[#1769FF] font-semibold hover:underline"
                  >
                    {showCustomAvatarUrl ? 'Select Presets' : 'Custom Image URL'}
                  </button>
                </div>

                {showCustomAvatarUrl ? (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste avatar image URL..."
                      value={customAvatarInput}
                      onChange={(e) => setCustomAvatarInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#1769FF]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarInput.trim()) {
                          setAvatar(customAvatarInput.trim());
                          setShowAvatarPicker(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#1769FF] text-white text-xs font-bold rounded-xl"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(preset.url);
                          setShowAvatarPicker(false);
                        }}
                        className={clsx(
                          'relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 mx-auto',
                          avatar === preset.url
                            ? 'border-[#1769FF] ring-2 ring-[#1769FF]/40'
                            : 'border-transparent'
                        )}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Editable Profile Inputs */}
            <div className="space-y-4">
              {/* Name */}
              <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-[#1769FF] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all bg-gray-50/50 focus-within:bg-white">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <label htmlFor="edit-name" className="font-semibold text-gray-600">
                    Name
                  </label>
                  <span>{name.length} / 50</span>
                </div>
                <input
                  id="edit-name"
                  type="text"
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full text-base font-medium text-gray-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-[#1769FF] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all bg-gray-50/50 focus-within:bg-white">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <label htmlFor="edit-bio" className="font-semibold text-gray-600">
                    Bio
                  </label>
                  <span>{bio.length} / 160</span>
                </div>
                <textarea
                  id="edit-bio"
                  rows={3}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the flock about yourself, your passions or projects..."
                  className="w-full text-sm text-gray-900 bg-transparent focus:outline-none resize-none"
                />
              </div>

              {/* Location */}
              <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-[#1769FF] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all bg-gray-50/50 focus-within:bg-white">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 font-semibold text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <label htmlFor="edit-location">Location</label>
                </div>
                <input
                  id="edit-location"
                  type="text"
                  maxLength={60}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Website */}
              <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-[#1769FF] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all bg-gray-50/50 focus-within:bg-white">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 font-semibold text-gray-600">
                  <Globe size={14} className="text-gray-400" />
                  <label htmlFor="edit-website">Website</label>
                </div>
                <input
                  id="edit-website"
                  type="text"
                  maxLength={100}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://bellbird.app"
                  className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
