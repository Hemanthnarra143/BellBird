import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  email?: string;
  provider?: string;
  coverImage?: string;
  bio: string;
  location?: string;
  website?: string;
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

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('bellbird_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('bellbird_token');
  } catch {
    return null;
  }
};

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
  user: getStoredUser(),
  token: getStoredToken(),
  isComposeOpen: false,
  newPostCount: 0,
  bookmarks: ['101', '103'], // Pre-seeded with favorites
  login: (user, token) => {
    try {
      localStorage.setItem('bellbird_user', JSON.stringify(user));
      localStorage.setItem('bellbird_token', token);
    } catch (e) {
      console.error(e);
    }
    set({ user, token });
  },
  logout: () => {
    try {
      localStorage.removeItem('bellbird_user');
      localStorage.removeItem('bellbird_token');
    } catch (e) {
      console.error(e);
    }
    set({ user: null, token: null, isComposeOpen: false });
  },
  updateUser: (fields) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...fields } : null;
      if (updated) {
        try {
          localStorage.setItem('bellbird_user', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return { user: updated };
    }),
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
