import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  FolderOpen,
  HelpCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { compressImage, getCameraStream, stopCameraStream, hasCameraDevice } from '../utils/imageUtils';
import { useAuthStore } from '../store/useStore';
import clsx from 'clsx';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated?: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  { label: 'Minimalist Clean', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  { label: 'Executive Modern', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { label: 'Creative Designer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { label: 'Product Strategist', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400' },
  { label: 'Developer Cyan', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' },
  { label: 'Studio Warmth', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
  { label: 'Architect Bold', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400' },
];

export default function ChangeAvatarModal({
  isOpen,
  onClose,
  onAvatarUpdated,
}: ChangeAvatarModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [activeTab, setActiveTab] = useState<'device' | 'live-camera' | 'presets' | 'url'>('device');
  const [selectedPreview, setSelectedPreview] = useState<string>(currentUser?.avatar || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'prompt' | 'denied'>('unknown');

  // Camera capture state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [supportsCamera, setSupportsCamera] = useState(true);

  // Refs for local device apps
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const fileStorageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks cleanly
  const handleStopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      stopCameraStream(cameraStreamRef.current);
      cameraStreamRef.current = null;
    }
    setCameraStream(null);
    setIsCameraActive(false);
  }, []);

  // Check hardware camera capability and permissions on mount
  useEffect(() => {
    hasCameraDevice().then((hasCam) => setSupportsCamera(hasCam));

    if (navigator?.permissions?.query) {
      try {
        navigator.permissions
          // @ts-ignore
          .query({ name: 'camera' })
          .then((res) => {
            setPermissionStatus(res.state as any);
            res.onchange = () => setPermissionStatus(res.state as any);
          })
          .catch(() => {
            setPermissionStatus('unknown');
          });
      } catch {
        setPermissionStatus('unknown');
      }
    }
  }, []);

  // Sync initial avatar when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setSelectedPreview(currentUser.avatar || PRESET_AVATARS[0].url);
      setErrorMessage('');
      setCameraError('');
      setActiveTab('device');
    } else {
      handleStopCamera();
    }
  }, [isOpen, currentUser, handleStopCamera]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, [handleStopCamera]);

  // Explicitly prompt/test camera permission
  const handleRequestCameraPermission = async () => {
    setCameraError('');
    try {
      const stream = await getCameraStream();
      setPermissionStatus('granted');
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setIsCameraActive(true);
      setActiveTab('live-camera');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera permission request error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setCameraError(
          'Camera access was denied by your browser or device. To grant permission, tap the lock/tune icon near your browser URL address bar and allow Camera.'
        );
      } else {
        setCameraError(err.message || 'Unable to start camera.');
      }
    }
  };

  // Launch in-browser live webcam capture
  const handleStartCamera = async () => {
    setCameraError('');
    setIsCameraActive(false);
    try {
      const stream = await getCameraStream();
      setPermissionStatus('granted');
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setCameraError(
          'Camera permission was denied. You can still use "Choose from Photos" or "Browse Storage" below, or allow Camera in device settings.'
        );
      } else {
        setCameraError(
          err.message || 'Unable to access device camera. Please use your device Photo app.'
        );
      }
    }
  };

  // Capture snapshot from live video element
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Center crop square
      const startX = ((video.videoWidth || size) - size) / 2;
      const startY = ((video.videoHeight || size) - size) / 2;

      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

      setSelectedPreview(dataUrl);
      handleStopCamera();
      setActiveTab('device');
    } catch (err) {
      console.error('Error capturing snapshot:', err);
      setErrorMessage('Could not capture photo. Try choosing from your photo gallery.');
    }
  };

  // Handle file chosen from local device apps (Gallery, Photos, Files)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      // Compress and optimize for web & mobile
      const compressedDataUrl = await compressImage(file, 800, 800, 0.88);
      setSelectedPreview(compressedDataUrl);
      setActiveTab('device');
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setErrorMessage(err.message || 'Failed to process selected image file.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Persist avatar change to backend & local store
  const handleSaveAvatar = async () => {
    if (!selectedPreview) return;
    setIsSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/users/${currentUser?.id || '1'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: selectedPreview }),
      });

      if (res.ok) {
        const updated = await res.json();
        updateUser(updated);
        onAvatarUpdated?.(selectedPreview);
        setSuccessToast(true);
        setTimeout(() => {
          setSuccessToast(false);
          handleStopCamera();
          onClose();
        }, 600);
      } else {
        setErrorMessage('Failed to save avatar to server. Please try again.');
      }
    } catch (err) {
      console.error('Save avatar network error:', err);
      updateUser({ avatar: selectedPreview });
      onAvatarUpdated?.(selectedPreview);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden inputs to trigger local device apps */}
        {/* 1. Native Photos / Gallery App */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* 2. Native Camera App (Mobile direct camera launch) */}
        <input
          ref={mobileCameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* 3. Device Storage / File Manager */}
        <input
          ref={fileStorageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#1769FF] rounded-2xl shadow-xs">
              <Camera size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A192F]">Change Profile Picture</h2>
              <p className="text-xs text-gray-500">Pick from device apps, camera, or gallery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2">
            <Check size={16} className="text-emerald-600" />
            Profile photo updated successfully!
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-2 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 flex-1 space-y-5">
          {/* Main Avatar Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-[#1769FF]/20 bg-gray-100 flex items-center justify-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-[#1769FF]">
                    <Loader2 size={28} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <img
                    src={selectedPreview}
                    alt="Selected Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        currentUser?.name || 'User'
                      )}&background=1769FF&color=fff`;
                    }}
                  />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Selected photo">
                <Check size={14} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">Selected profile picture preview</p>
          </div>

          {/* Source Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                handleStopCamera();
                setActiveTab('device');
              }}
              className={clsx(
                'flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
                activeTab === 'device'
                  ? 'bg-white text-[#1769FF] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Smartphone size={14} />
              <span>Local Device Apps</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('live-camera');
                handleStartCamera();
              }}
              className={clsx(
                'flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
                activeTab === 'live-camera'
                  ? 'bg-white text-[#1769FF] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Camera size={14} />
              <span>Live Camera</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleStopCamera();
                setActiveTab('presets');
              }}
              className={clsx(
                'flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
                activeTab === 'presets'
                  ? 'bg-white text-[#1769FF] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Sparkles size={14} />
              <span>Presets</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleStopCamera();
                setActiveTab('url');
              }}
              className={clsx(
                'flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
                activeTab === 'url'
                  ? 'bg-white text-[#1769FF] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <ImageIcon size={14} />
              <span>URL</span>
            </button>
          </div>

          {/* TAB 1: LOCAL DEVICE APPS (Photos, Camera, Storage) */}
          {activeTab === 'device' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Camera App Option */}
                <button
                  type="button"
                  onClick={() => mobileCameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1769FF] text-white flex items-center justify-center shadow-md mb-2.5 group-hover:scale-110 transition-transform">
                    <Camera size={22} />
                  </div>
                  <span className="text-sm font-bold text-[#0A192F] mb-1">Take Photo</span>
                  <span className="text-[11px] text-gray-500 line-clamp-2">
                    Opens your device camera app
                  </span>
                </button>

                {/* 2. Photo Gallery App Option */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-2.5 group-hover:scale-110 transition-transform">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-sm font-bold text-[#0A192F] mb-1">Photos / Gallery</span>
                  <span className="text-[11px] text-gray-500 line-clamp-2">
                    Google Photos, Apple Photos & Gallery
                  </span>
                </button>

                {/* 3. Device Storage / File Manager Option */}
                <button
                  type="button"
                  onClick={() => fileStorageInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/80 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md mb-2.5 group-hover:scale-110 transition-transform">
                    <FolderOpen size={22} />
                  </div>
                  <span className="text-sm font-bold text-[#0A192F] mb-1">Browse Files</span>
                  <span className="text-[11px] text-gray-500 line-clamp-2">
                    Internal storage, Downloads, or SD Card
                  </span>
                </button>
              </div>

              {/* Local Device Permissions Status Card */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#1769FF]" />
                    <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wide">
                      Device App Permissions
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Camera size={14} className="text-[#1769FF]" />
                      <span>Camera Access:</span>
                    </span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {permissionStatus === 'denied' ? 'Denied' : 'Enabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-emerald-600" />
                      <span>Photo Gallery:</span>
                    </span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Allowed
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                  <HelpCircle size={14} className="shrink-0 text-gray-400 mt-0.5" />
                  <span>
                    When you tap <strong>Take Photo</strong> or <strong>Photos / Gallery</strong>, your device will display its native permission prompt. Grant permission to access your local photos or camera.
                  </span>
                </div>

                {permissionStatus === 'denied' && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between">
                    <span>Camera is currently blocked in browser settings.</span>
                    <button
                      type="button"
                      onClick={handleRequestCameraPermission}
                      className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px]"
                    >
                      Request Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE IN-BROWSER CAMERA */}
          {activeTab === 'live-camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={16} className="text-amber-600" />
                    <span>Camera Permission Required</span>
                  </div>
                  <p>{cameraError}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRequestCameraPermission}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs hover:bg-amber-700 transition-colors"
                    >
                      <RefreshCw size={13} />
                      Grant Permission & Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => mobileCameraInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl font-bold text-xs"
                    >
                      Open Phone Camera App
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover mirror"
                  />
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none" />

                  {/* Circular guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/60 shadow-2xl" />
                  </div>

                  {/* Camera control overlay */}
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="w-14 h-14 rounded-full bg-white hover:bg-gray-100 p-1 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="Snap photo"
                    >
                      <div className="w-11 h-11 rounded-full border-2 border-[#0A192F] bg-white flex items-center justify-center">
                        <Camera size={22} className="text-[#1769FF]" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-500 text-center">
                Look into your camera and tap the shutter button to take your profile picture.
              </p>
            </div>
          )}

          {/* TAB 3: PRESET AVATARS */}
          {activeTab === 'presets' && (
            <div>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                Choose a verified avatar from our modern collection:
              </p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPreview(preset.url)}
                    className={clsx(
                      'group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 cursor-pointer',
                      selectedPreview === preset.url
                        ? 'border-[#1769FF] ring-4 ring-[#1769FF]/20 shadow-md'
                        : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                    {selectedPreview === preset.url && (
                      <div className="absolute top-1 right-1 bg-[#1769FF] text-white p-0.5 rounded-full shadow-sm">
                        <Check size={10} />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 px-1 truncate text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXTERNAL URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">
                Link any external public image URL:
              </p>
              <div className="flex gap-2">
                <input
                  ref={urlInputRef}
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  defaultValue={selectedPreview.startsWith('http') ? selectedPreview : ''}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#1769FF]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = urlInputRef.current?.value.trim();
                    if (val) setSelectedPreview(val);
                  }}
                  className="px-4 py-2 bg-[#1769FF] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedPreview(
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser?.name || 'BellBird'
                )}&background=1769FF&color=fff`
              );
            }}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Reset to initials</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleStopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSaving || isProcessing}
              className={clsx(
                'px-6 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer',
                isSaving || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1769FF] hover:bg-blue-600 text-white active:scale-95'
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Profile Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
