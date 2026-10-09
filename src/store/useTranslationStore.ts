import { create } from 'zustand';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

interface TranslationState {
  isRealtimeActive: boolean;
  targetLanguage: string;
  isModalOpen: boolean;
  cache: Record<string, string>; // `${lang}:${text}` -> translatedText
  isLoading: boolean;
  
  // Actions
  toggleRealtime: () => void;
  setRealtime: (active: boolean) => void;
  setTargetLanguage: (code: string) => void;
  openModal: () => void;
  closeModal: () => void;
  translateText: (text: string, customTarget?: string) => Promise<string>;
  clearCache: () => void;
}

const STORAGE_KEY_ACTIVE = 'bellbird_translation_active';
const STORAGE_KEY_LANG = 'bellbird_translation_lang';

export const useTranslationStore = create<TranslationState>((set, get) => {
  const initialActive = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ACTIVE) === 'true' : false;
  const initialLang = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_LANG) || 'es' : 'es';

  return {
    isRealtimeActive: initialActive,
    targetLanguage: initialLang,
    isModalOpen: false,
    cache: {},
    isLoading: false,

    toggleRealtime: () => {
      const next = !get().isRealtimeActive;
      localStorage.setItem(STORAGE_KEY_ACTIVE, String(next));
      set({ isRealtimeActive: next });
    },

    setRealtime: (active: boolean) => {
      localStorage.setItem(STORAGE_KEY_ACTIVE, String(active));
      set({ isRealtimeActive: active });
    },

    setTargetLanguage: (code: string) => {
      localStorage.setItem(STORAGE_KEY_LANG, code);
      set({ targetLanguage: code });
    },

    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),

    clearCache: () => set({ cache: {} }),

    translateText: async (text: string, customTarget?: string) => {
      if (!text || !text.trim()) return text;
      const target = customTarget || get().targetLanguage;
      const cacheKey = `${target}:${text.trim()}`;

      // Check cache first
      if (get().cache[cacheKey]) {
        return get().cache[cacheKey];
      }

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            targetLanguage: target,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const translated = data.translatedText || text;
          set((state) => ({
            cache: { ...state.cache, [cacheKey]: translated },
          }));
          return translated;
        }
      } catch (err) {
        console.error('Translation error:', err);
      }

      return text;
    },
  };
});
