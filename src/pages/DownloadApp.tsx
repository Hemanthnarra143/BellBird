import React, { useState } from 'react';
import { Smartphone, Download, QrCode, Check, ExternalLink, ShieldCheck, Zap, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function DownloadApp() {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bellbird.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&color=0A192F&bgcolor=FFFFFF`;

  const handleInstallClick = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 p-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#0A192F]">Get BellBird for Android</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#1769FF] via-[#1255d4] to-[#0A192F] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="/icons/icon-192.png"
                alt="BellBird"
                className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg object-contain"
              />
              <div>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Direct Android Install
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">BellBird Social App</h2>
                <p className="text-blue-100 text-sm">Package: com.bellbird.myapp</p>
              </div>
            </div>

            <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
              Install BellBird directly onto your Android device without waiting for store approval. Enjoy full-screen native standalone mode, offline caching, and lightning-fast speed.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="bg-white text-[#1769FF] hover:bg-blue-50 active:scale-95 font-bold py-3 px-6 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer text-sm"
              >
                <Download size={18} />
                <span>{installing ? 'Installing...' : isInstalled ? 'App Installed ✓' : 'Install Direct on Android'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold py-3 px-5 rounded-2xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer text-sm"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <ExternalLink size={18} />}
                <span>{copied ? 'Link Copied!' : 'Copy Mobile Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scan to Install on Phone Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shrink-0 shadow-inner">
            <img 
              src={qrCodeUrl} 
              alt="Scan QR code on Android phone" 
              className="w-44 h-44 object-contain" 
            />
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1769FF] px-2.5 py-1 rounded-full text-xs font-bold">
              <QrCode size={14} />
              <span>Instant QR Code</span>
            </div>
            <h3 className="text-lg font-bold text-[#0A192F]">Scan with Android Camera</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Point your phone's camera at the QR code to open BellBird on your Android device. Google Chrome will automatically offer a 1-tap direct install banner.
            </p>
            <div className="text-xs font-mono bg-gray-50 px-3 py-2 rounded-xl text-gray-600 break-all select-all border border-gray-200/60">
              {currentUrl}
            </div>
          </div>
        </div>

        {/* 3-Step Guide */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#0A192F] flex items-center gap-2">
            <Smartphone size={18} className="text-[#1769FF]" />
            Direct Installation Steps (Chrome / Samsung Internet)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-gray-900">Open on Phone</h4>
              <p className="text-xs text-gray-600">
                Open this app URL in Chrome on your Android smartphone.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-gray-900">Tap Browser Menu</h4>
              <p className="text-xs text-gray-600">
                Tap the three dots (⋮) in the top-right corner of Google Chrome.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1769FF] font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-gray-900">Select "Install app"</h4>
              <p className="text-xs text-gray-600">
                Tap "Install app" or "Add to Home screen" to install the WebAPK immediately!
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
            <Zap size={22} className="mx-auto text-yellow-500" />
            <h5 className="font-bold text-xs text-gray-900">Fast Startup</h5>
            <p className="text-[10px] text-gray-500">Service Worker caching</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
            <ShieldCheck size={22} className="mx-auto text-emerald-500" />
            <h5 className="font-bold text-xs text-gray-900">Secure WebAPK</h5>
            <p className="text-[10px] text-gray-500">Google signed runtime</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
            <Smartphone size={22} className="mx-auto text-[#1769FF]" />
            <h5 className="font-bold text-xs text-gray-900">No Browser Bar</h5>
            <p className="text-[10px] text-gray-500">Full screen experience</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
            <Globe size={22} className="mx-auto text-purple-500" />
            <h5 className="font-bold text-xs text-gray-900">Auto Updates</h5>
            <p className="text-[10px] text-gray-500">Always latest version</p>
          </div>
        </div>
      </div>
    </div>
  );
}
