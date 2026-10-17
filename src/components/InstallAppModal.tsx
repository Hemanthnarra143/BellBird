import React, { useState } from 'react';
import { X, Smartphone, Download, Check, ExternalLink, QrCode, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bellbird.app';
  // SVG-based dynamic QR Code generation using public service for phone scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=0A192F&bgcolor=FFFFFF`;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#1769FF] via-[#1255d4] to-[#0A192F] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md p-1">
              <img src="/icons/icon-192.png" alt="BellBird" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight">BellBird for Android</h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Direct
                </span>
              </div>
              <p className="text-xs text-blue-100">Official Native WebAPK & Direct Install</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-blue-100">
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-yellow-300" />
              <span>Instant Launch</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>Full Screen Mode</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone size={14} className="text-blue-200" />
              <span>Zero Play Store Wait</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-800">
          {/* Main Action if browser gave install prompt */}
          {isInstallable && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs text-blue-900 font-medium mb-3">
                Your Android browser is ready for 1-tap direct installation:
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full bg-[#1769FF] hover:bg-blue-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Download size={18} />
                <span>{installing ? 'Installing...' : 'Install Directly to Android Home Screen'}</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold">Already Installed!</p>
                <p className="text-xs text-emerald-700">BellBird is installed on your device.</p>
              </div>
            </div>
          )}

          {/* Direct Install on Phone Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#0A192F] flex items-center gap-2">
              <Smartphone size={16} className="text-[#1769FF]" />
              How to Install Directly on Your Android Phone:
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#1769FF] text-white flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                <div>
                  <span className="font-semibold text-gray-900">Open on Android: </span>
                  Open this link in <strong className="text-gray-900">Google Chrome</strong> or <strong className="text-gray-900">Samsung Internet</strong> on your phone.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#1769FF] text-white flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                <div>
                  <span className="font-semibold text-gray-900">Tap Browser Menu: </span>
                  Tap the three dots icon (<strong className="text-gray-900">⋮</strong>) in the top-right corner.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#1769FF] text-white flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                <div>
                  <span className="font-semibold text-gray-900">Tap "Install app": </span>
                  Select <strong className="text-gray-900">"Install app"</strong> or <strong className="text-gray-900">"Add to Home screen"</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Direct Link */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 shrink-0">
              <img 
                src={qrCodeUrl} 
                alt="Scan to open on Android" 
                className="w-24 h-24 object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1">
                  <QrCode size={14} className="text-[#1769FF]" />
                  Scan with your Android Camera
                </p>
                <p className="text-[11px] text-gray-500">Opens BellBird directly on your mobile device for 1-tap install.</p>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1769FF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <ExternalLink size={14} />}
                <span>{copied ? 'Link Copied!' : 'Copy Mobile Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Version 1.0.0 (WebAPK)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
