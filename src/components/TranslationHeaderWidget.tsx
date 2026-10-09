import React from 'react';
import { Globe, Languages, Zap } from 'lucide-react';
import { useTranslationStore, SUPPORTED_LANGUAGES } from '../store/useTranslationStore';
import clsx from 'clsx';

interface TranslationHeaderWidgetProps {
  compact?: boolean;
}

export default function TranslationHeaderWidget({ compact = false }: TranslationHeaderWidgetProps) {
  const { isRealtimeActive, targetLanguage, openModal, toggleRealtime } = useTranslationStore();

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={openModal}
        aria-label="Real-time translation settings"
        title={`Real-Time Translation (${isRealtimeActive ? 'Active: ' : 'Target: '} ${currentLang.name})`}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer',
          isRealtimeActive
            ? 'bg-blue-50 border-blue-200 text-[#1769FF] hover:bg-blue-100 shadow-xs'
            : 'bg-gray-100/80 border-gray-200/60 text-gray-700 hover:bg-gray-200/70 hover:text-gray-900'
        )}
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        {!compact && (
          <span className="hidden sm:inline-block font-medium">
            {isRealtimeActive ? currentLang.nativeName : 'Translate'}
          </span>
        )}
        {isRealtimeActive ? (
          <span className="flex h-2 w-2 relative" title="Real-time translation active">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        ) : (
          <Globe size={13} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}
