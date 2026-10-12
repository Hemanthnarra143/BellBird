import React, { useState } from 'react';
import {
  X,
  Globe,
  Sparkles,
  Check,
  Search,
  ArrowRight,
  RefreshCw,
  Zap,
  Languages,
} from 'lucide-react';
import {
  useTranslationStore,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../store/useTranslationStore';
import clsx from 'clsx';

export default function TranslationModal() {
  const {
    isModalOpen,
    closeModal,
    isRealtimeActive,
    toggleRealtime,
    targetLanguage,
    setTargetLanguage,
    translateText,
    clearCache,
  } = useTranslationStore();

  const [search, setSearch] = useState('');
  const [testInput, setTestInput] = useState(
    'Welcome to BellBird! Explore real-time chirps from around the world. #technology'
  );
  const [testOutput, setTestOutput] = useState('');
  const [isTranslatingTest, setIsTranslatingTest] = useState(false);

  if (!isModalOpen) return null;

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleTestTranslate = async () => {
    if (!testInput.trim()) return;
    setIsTranslatingTest(true);
    try {
      const res = await translateText(testInput, targetLanguage);
      setTestOutput(res);
    } catch (err) {
      console.warn('[TranslationModal] Test note:', err);
    } finally {
      setIsTranslatingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1769FF] flex items-center justify-center">
              <Languages size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
                <span>Real-Time Translation</span>
                <span className="text-[11px] font-bold uppercase tracking-wide bg-blue-100 text-[#1769FF] px-2 py-0.5 rounded-full">
                  AI Live
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Translate chirps, bios, and content across BellBird
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-black min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* Master Real-Time Toggle Banner */}
          <div
            className={clsx(
              'p-4 rounded-2xl border transition-all flex items-center justify-between gap-4',
              isRealtimeActive
                ? 'bg-blue-50/80 border-[#1769FF]/40 shadow-sm'
                : 'bg-gray-50 border-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                  isRealtimeActive
                    ? 'bg-[#1769FF] text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                <Zap size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0A192F]">
                    Live Real-Time Translation
                  </h3>
                  {isRealtimeActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automatically translates all incoming chirps and profile descriptions into{' '}
                  <span className="font-semibold text-gray-800">
                    {currentLangObj.name} ({currentLangObj.flag})
                  </span>
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isRealtimeActive}
              onClick={toggleRealtime}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative flex items-center flex-shrink-0 cursor-pointer p-0.5',
                isRealtimeActive ? 'bg-[#1769FF]' : 'bg-gray-300'
              )}
            >
              <span
                className={clsx(
                  'w-5 h-5 rounded-full bg-white shadow-md transform transition-transform',
                  isRealtimeActive ? 'translate-x-6' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Select Target Language */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <Globe size={14} className="text-[#1769FF]" />
                <span>Target Language</span>
              </label>
              <span className="text-xs text-gray-500">
                Selected: <span className="font-bold text-[#0A192F]">{currentLangObj.flag} {currentLangObj.name}</span>
              </span>
            </div>

            {/* Search Languages */}
            <div className="relative mb-3">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language (e.g. Spanish, 日本語, French)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-100 hover:bg-gray-100/80 focus:bg-white border border-transparent focus:border-[#1769FF] rounded-xl focus:outline-none transition-all"
              />
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredLanguages.map((lang) => {
                const isSelected = targetLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setTargetLanguage(lang.code);
                    }}
                    className={clsx(
                      'p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group',
                      isSelected
                        ? 'border-[#1769FF] bg-blue-50/70 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-lg">{lang.flag}</span>
                      <div className="truncate">
                        <p
                          className={clsx(
                            'text-xs font-bold truncate leading-tight',
                            isSelected ? 'text-[#1769FF]' : 'text-gray-900'
                          )}
                        >
                          {lang.nativeName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {lang.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[#1769FF] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Translation Sandbox / Preview */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#1769FF]" />
                <span>Live Translation Sandbox</span>
              </span>
              <button
                type="button"
                onClick={handleTestTranslate}
                disabled={isTranslatingTest}
                className="text-xs font-bold text-[#1769FF] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {isTranslatingTest ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <ArrowRight size={12} />
                )}
                <span>Test Translate</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type any message to test real-time translation..."
              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1769FF] resize-none mb-2"
            />

            {testOutput && (
              <div className="bg-white p-3 rounded-xl border border-blue-100 text-xs text-gray-800 animate-in fade-in">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#1769FF] uppercase tracking-wider mb-1">
                  <span>{currentLangObj.flag} Translated Result</span>
                </div>
                <p className="font-medium">{testOutput}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={clearCache}
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            Clear translation cache
          </button>

          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 bg-[#0A192F] hover:bg-[#1769FF] text-white text-xs font-bold rounded-full transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
