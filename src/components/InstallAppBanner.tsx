import React, { useState } from 'react';
import { Smartphone, X, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppBannerProps {
  onOpenModal: () => void;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // Do not show if already installed in standalone mode or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleQuickInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        onOpenModal();
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <div className="md:hidden bg-gradient-to-r from-[#0A192F] via-[#1769FF] to-[#1255d4] text-white px-3.5 py-2 flex items-center justify-between shadow-md relative z-20">
      <div 
        onClick={onOpenModal}
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
          <Smartphone size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight truncate">Install Android App</p>
          <p className="text-[10px] text-blue-100 truncate">1-tap direct install · WebAPK</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleQuickInstall}
          className="bg-white text-[#1769FF] hover:bg-blue-50 active:scale-95 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <Download size={13} />
          <span>Install</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-white/70 hover:text-white rounded-full transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
