import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isPremium?: boolean;
  isPrivate?: boolean;
  allowDMs?: boolean;
  twoFactor?: boolean;
  dataSaver?: boolean;
  reducedMotion?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isComposeOpen: boolean;
  newPostCount: number;
  bookmarks: string[];
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
  openCompose: () => void;
  closeCompose: () => void;
  triggerFeedRefresh: () => void;
  toggleBookmark: (postId: string) => void;
  clearAllBookmarks: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Will start as null, requires login
  token: null,
  isComposeOpen: false,
  newPostCount: 0,
  bookmarks: ['101', '103'], // Pre-seeded with favorites
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null, isComposeOpen: false }),
  updateUser: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),
  openCompose: () => set({ isComposeOpen: true }),
  closeCompose: () => set({ isComposeOpen: false }),
  triggerFeedRefresh: () => set((state) => ({ newPostCount: state.newPostCount + 1 })),
  toggleBookmark: (postId) =>
    set((state) => {
      const exists = state.bookmarks.includes(postId);
      return {
        bookmarks: exists
          ? state.bookmarks.filter((id) => id !== postId)
          : [...state.bookmarks, postId],
      };
    }),
  clearAllBookmarks: () => set({ bookmarks: [] }),
}));
