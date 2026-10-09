import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Globe, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useTranslationStore, SUPPORTED_LANGUAGES } from '../store/useTranslationStore';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export interface Post {
  id: string;
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  createdAt: string;
  likedBy: string[];
  isBookmarked?: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onBookmark }: PostCardProps) {
  const user = useAuthStore((state) => state.user);
  const bookmarks = useAuthStore((state) => state.bookmarks);
  const toggleBookmark = useAuthStore((state) => state.toggleBookmark);

  // Translation store
  const { isRealtimeActive, targetLanguage, translateText } = useTranslationStore();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const isLiked = user && post.likedBy.includes(user.id);
  const isBookmarked = bookmarks.includes(post.id);

  const targetLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

  // Automatic real-time translation effect
  useEffect(() => {
    let isCancelled = false;

    if (isRealtimeActive && post.content) {
      setIsTranslating(true);
      translateText(post.content, targetLanguage)
        .then((result) => {
          if (!isCancelled) {
            setTranslatedContent(result);
            setShowOriginal(false);
          }
        })
        .finally(() => {
          if (!isCancelled) setIsTranslating(false);
        });
    } else {
      // If real-time turned off, revert back to null unless manually translated
      if (!showOriginal && !isRealtimeActive) {
        setTranslatedContent(null);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [isRealtimeActive, targetLanguage, post.content, translateText]);

  // Manual on-demand translate toggle
  const handleManualTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedContent) {
      setShowOriginal(!showOriginal);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateText(post.content, targetLanguage);
      setTranslatedContent(result);
      setShowOriginal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(post.id);
    onBookmark?.(post.id);
    try {
      await fetch(`/api/posts/${post.id}/bookmark`, { method: 'POST' });
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Render text with clickable #hashtags and @mentions
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Link
            key={index}
            to={`/search?q=${encodeURIComponent(part)}`}
            className="text-[#1769FF] font-medium hover:underline hover:text-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      if (part.startsWith('@')) {
        return (
          <Link
            key={index}
            to={`/search?q=${encodeURIComponent(part.slice(1))}&tab=people`}
            className="text-[#1769FF] font-medium hover:underline hover:text-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const displayText =
    translatedContent && !showOriginal ? translatedContent : post.content;
  const isCurrentlyTranslated = Boolean(translatedContent && !showOriginal);

  return (
    <article className="border-b border-gray-100 p-4 sm:p-5 hover:bg-gray-50/60 transition-colors">
      <div className="flex gap-3 sm:gap-4">
        <Link to={`/profile/${post.author.id}`} className="flex-shrink-0 group">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=1769FF&color=fff`;
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <Link to={`/profile/${post.author.id}`} className="font-bold text-[15px] sm:text-base text-[#0A192F] hover:underline truncate">
                {post.author.name}
              </Link>
              <span className="text-gray-500 text-sm truncate">@{post.author.username}</span>
              <span className="text-gray-400 text-sm">·</span>
              <span className="text-gray-500 text-sm flex-shrink-0">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
              </span>
            </div>
            <button
              aria-label="More options"
              className="text-gray-400 hover:bg-blue-50 hover:text-[#1769FF] rounded-full p-2 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
          
          <div className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-2">
            {renderFormattedContent(displayText)}
          </div>

          {/* Real-Time Translation Indicator / Toggle */}
          <div className="mb-3 flex items-center gap-2 text-xs">
            {isTranslating ? (
              <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span>Translating real-time...</span>
              </span>
            ) : isCurrentlyTranslated ? (
              <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100/80 hover:bg-gray-200/70 px-2.5 py-0.5 rounded-full transition-colors">
                <span className="text-xs">{targetLangObj.flag}</span>
                <span>Translated to {targetLangObj.name}</span>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setShowOriginal(true)}
                  className="font-semibold text-[#1769FF] hover:underline cursor-pointer"
                >
                  Show original
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleManualTranslate}
                className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#1769FF] transition-colors py-0.5 cursor-pointer group/tr"
              >
                <Globe size={12} className="text-gray-400 group-hover/tr:text-[#1769FF]" />
                <span>
                  {showOriginal && translatedContent
                    ? `Show ${targetLangObj.name} translation`
                    : `Translate chirp to ${targetLangObj.name}`}
                </span>
              </button>
            )}
          </div>
          
          {post.image && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img
                src={post.image}
                alt="Post attachment"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-gray-500 max-w-md pt-1">
            <button
              aria-label="Comments"
              className="flex items-center gap-2 group transition-colors hover:text-[#1769FF] min-h-[44px] min-w-[44px] -ml-2 px-2"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            
            <button
              aria-label={isLiked ? "Unlike post" : "Like post"}
              onClick={() => onLike?.(post.id)}
              className={clsx(
                "flex items-center gap-2 group transition-colors min-h-[44px] min-w-[44px] px-2",
                isLiked ? "text-red-500" : "hover:text-red-500"
              )}
            >
              <div className={clsx(
                "p-2 rounded-full transition-colors",
                isLiked ? "bg-red-50" : "group-hover:bg-red-50"
              )}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </div>
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            
            <button
              aria-label="Share post"
              className="flex items-center gap-2 group transition-colors hover:text-green-500 min-h-[44px] min-w-[44px] px-2"
            >
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Share size={18} />
              </div>
            </button>

            <button
              aria-label={isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}
              onClick={handleBookmarkClick}
              className={clsx(
                "flex items-center gap-1.5 group transition-colors min-h-[44px] min-w-[44px] px-2",
                isBookmarked ? "text-[#1769FF]" : "hover:text-[#1769FF]"
              )}
            >
              <div className={clsx(
                "p-2 rounded-full transition-colors",
                isBookmarked ? "bg-blue-50 text-[#1769FF]" : "group-hover:bg-blue-50"
              )}>
                <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
