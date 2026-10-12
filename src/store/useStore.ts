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

const DEFAULT_USER: User = {
  id: '1',
  username: 'bellbird_user',
  name: 'BellBird User',
  email: 'demo@bellbird.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
  bio: 'Product designer & creative thinker. Exploring new interfaces.',
  location: 'San Francisco, CA',
  website: 'https://bellbird.app',
  followers: 1240,
  following: 382,
  isPremium: true,
  isPrivate: false,
  allowDMs: true,
  twoFactor: false,
  fontSize: 'medium',
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('bellbird_user');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_USER;
};

const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem('bellbird_token');
    if (raw) return raw;
  } catch {
    // ignore
  }
  return 'demo-jwt-token';
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
