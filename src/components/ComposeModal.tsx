import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Globe, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const SAMPLE_IMAGES = [
  { label: 'Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' },
  { label: 'Architecture', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800' },
  { label: 'Abstract Blue', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
  { label: 'City Dusk', url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800' },
];

const MAX_CHARS = 280;

export default function ComposeModal() {
  const isComposeOpen = useAuthStore((state) => state.isComposeOpen);
  const closeCompose = useAuthStore((state) => state.closeCompose);
  const triggerFeedRefresh = useAuthStore((state) => state.triggerFeedRefresh);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isComposeOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    } else {
      setContent('');
      setImageUrl('');
      setShowImagePicker(false);
      setCustomUrlInput('');
      setError(null);
    }
  }, [isComposeOpen]);

  if (!isComposeOpen) return null;

  const charCount = content.length;
  const charsRemaining = MAX_CHARS - charCount;
  const isOverLimit = charsRemaining < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  // Calculate circular progress metrics for Twitter-style meter
  const progressRatio = Math.min(1, charCount / MAX_CHARS);
  const circumference = 2 * Math.PI * 9; // radius = 9
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canPost) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          image: imageUrl.trim() || null,
          authorId: user?.id || '1',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to publish post');
      }

      triggerFeedRefresh();
      closeCompose();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not post chirp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsertTag = (tag: string) => {
    setContent((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag} ` : `${tag} `;
    });
    textareaRef.current?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new post"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      onClick={closeCompose}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <button
            type="button"
            onClick={closeCompose}
            aria-label="Close compose modal"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">
              New Chirp
            </span>

            {/* Mobile Post Button in Header */}
            <button
              type="button"
              disabled={!canPost}
              onClick={() => handleSubmit()}
              className="sm:hidden px-5 py-1.5 bg-[#1769FF] hover:bg-blue-600 disabled:opacity-40 text-white rounded-full font-bold text-sm shadow-sm transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-5 flex gap-3 overflow-y-auto">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name || 'User avatar'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1769FF&color=fff`;
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0 mt-1 ring-1 ring-gray-100"
          />

          <div className="flex-1 min-w-0 flex flex-col">
            {/* Audience Badge (Twitter style) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 text-[#1769FF] text-xs font-semibold w-fit mb-3 bg-blue-50/50">
              <Globe size={13} />
              <span>Everyone can reply</span>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows={4}
              maxLength={320}
              className="w-full text-base sm:text-lg text-gray-900 placeholder:text-gray-400 bg-transparent resize-none border-none focus:outline-none focus:ring-0 leading-relaxed"
            />

            {/* Error notice */}
            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl mb-3">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Attached Image Preview */}
            {imageUrl && (
              <div className="relative mt-2 mb-3 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 max-h-60">
                <img
                  src={imageUrl}
                  alt="Post attachment preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover max-h-60"
                  onError={() => {
                    setError('The image URL could not be loaded. Try a different image.');
                    setImageUrl('');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  aria-label="Remove attached image"
                  className="absolute top-2.5 right-2.5 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors shadow-md"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Quick Hashtag Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap my-2">
              <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
                <Sparkles size={12} className="text-[#1769FF]" /> Tags:
              </span>
              {['#BellBird', '#Tech', '#Photography', '#WebDev', '#Design'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-[#1769FF] rounded-lg text-xs font-medium text-gray-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Image Picker Panel */}
            {showImagePicker && (
              <div className="mt-3 p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl animate-in fade-in duration-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-gray-700">Add an image</span>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>

                {/* Sample Images */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(sample.url);
                        setShowImagePicker(false);
                      }}
                      className="group relative rounded-xl overflow-hidden aspect-video border border-gray-200 hover:ring-2 hover:ring-[#1769FF] transition-all"
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-white" />
                      </div>
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white py-0.5 text-center truncate px-1">
                        {sample.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Image URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste an image URL..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1769FF]"
                  />
                  <button
                    type="button"
                    disabled={!customUrlInput.trim()}
                    onClick={() => {
                      setImageUrl(customUrlInput.trim());
                      setCustomUrlInput('');
                      setShowImagePicker(false);
                    }}
                    className="px-3 py-1.5 bg-[#0A192F] hover:bg-[#1769FF] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Attach
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
          {/* Left Media Actions */}
          <div className="flex items-center gap-1 text-[#1769FF]">
            <button
              type="button"
              onClick={() => setShowImagePicker((prev) => !prev)}
              aria-label="Add image attachment"
              className={clsx(
                'p-2.5 rounded-full transition-colors flex items-center justify-center min-h-[40px] min-w-[40px]',
                showImagePicker || imageUrl ? 'bg-blue-50 text-[#1769FF]' : 'hover:bg-blue-50 text-gray-600 hover:text-[#1769FF]'
              )}
            >
              <ImageIcon size={20} />
            </button>
          </div>

          {/* Right Metrics & Post Button */}
          <div className="flex items-center gap-3">
            {/* Twitter Radial Character Count Indicator */}
            {charCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6 transform -rotate-90">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#E5E7EB"
                      strokeWidth="2.5"
                      fill="transparent"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke={
                        isOverLimit
                          ? '#EF4444'
                          : charsRemaining <= 20
                          ? '#F59E0B'
                          : '#1769FF'
                      }
                      strokeWidth="2.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-150"
                    />
                  </svg>
                </div>

                {charsRemaining <= 20 && (
                  <span
                    className={clsx(
                      'text-xs font-mono font-bold',
                      isOverLimit ? 'text-red-500' : 'text-amber-500'
                    )}
                  >
                    {charsRemaining}
                  </span>
                )}
              </div>
            )}

            {/* Desktop Post Button */}
            <button
              type="button"
              disabled={!canPost}
              onClick={() => handleSubmit()}
              className="hidden sm:flex items-center justify-center px-6 py-2 bg-[#1769FF] hover:bg-blue-600 disabled:opacity-40 text-white rounded-full font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all min-h-[40px]"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
