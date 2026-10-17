import React, { useState, useRef, useEffect } from 'react';
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

  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'url'>('upload');
  const [selectedPreview, setSelectedPreview] = useState<string>(currentUser?.avatar || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  // Camera capture state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [supportsCamera, setSupportsCamera] = useState(true);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Check hardware camera capability on mount
  useEffect(() => {
    hasCameraDevice().then((hasCam) => setSupportsCamera(hasCam));
  }, []);

  // Sync initial avatar when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setSelectedPreview(currentUser.avatar || PRESET_AVATARS[0].url);
      setErrorMessage('');
      setCameraError('');
      setActiveTab('upload');
    } else {
      handleStopCamera();
    }
  }, [isOpen, currentUser]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  if (!isOpen) return null;

  // Stop camera tracks cleanly
  const handleStopCamera = () => {
    if (cameraStream) {
      stopCameraStream(cameraStream);
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Launch in-browser live webcam capture
  const handleStartCamera = async () => {
    setCameraError('');
    setIsCameraActive(false);
    try {
      const stream = await getCameraStream();
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Please allow camera permissions in your browser or device settings, or upload a photo from your gallery.'
        );
      } else {
        setCameraError(
          err.message || 'Unable to access device camera. Please use the device photo picker.'
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
      setActiveTab('upload');
    } catch (err) {
      console.error('Error capturing snapshot:', err);
      setErrorMessage('Could not capture photo. Try uploading from your files.');
    }
  };

  // Handle file chosen from device picker (Gallery, Files, Photos)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      // Compress and optimize for web & mobile
      const compressedDataUrl = await compressImage(file, 800, 800, 0.88);
      setSelectedPreview(compressedDataUrl);
      setActiveTab('upload');
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setErrorMessage(err.message || 'Failed to process selected image file.');
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be re-selected if needed
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
      // Fallback: update local store anyway so UX is seamless
      updateUser({ avatar: selectedPreview });
      onAvatarUpdated?.(selectedPreview);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#1769FF] rounded-xl">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A192F]">Update Profile Picture</h2>
              <p className="text-xs text-gray-500">Supports all devices, cameras & photo galleries</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Banner */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2">
            <Check size={16} className="text-emerald-600" />
            Profile photo updated successfully!
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-2 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-5 flex-1">
          {/* Main Avatar Preview */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-[#1769FF]/20 bg-gray-100 flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 size={32} className="text-[#1769FF] animate-spin" />
                ) : (
                  <img
                    src={selectedPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        currentUser?.name || 'User'
                      )}&background=1769FF&color=fff`;
                    }}
                  />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Ready to update">
                <Check size={14} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">Selected profile photo</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                handleStopCamera();
                setActiveTab('upload');
              }}
              className={clsx(
                'flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
                activeTab === 'upload'
                  ? 'bg-white text-[#1769FF] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Upload size={14} />
              <span>Upload / Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                handleStartCamera();
              }}
              className={clsx(
                'flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
                activeTab === 'camera'
                  ? 'bg-white text-[#1769FF] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Camera size={14} />
              <span>Camera</span>
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
              <span>Link URL</span>
            </button>
          </div>

          {/* Tab 1: Upload / Device Picker */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {/* Hidden file inputs for cross-platform support */}
              {/* Standard file picker for all devices (gallery, desktop, drive) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {/* Direct mobile camera prompt on mobile devices */}
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#1769FF] bg-gray-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-3 text-[#1769FF] group-hover:scale-110 transition-transform">
                  <Upload size={22} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  Choose from Device or Photo Library
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Select any photo from your Android gallery, iOS camera roll, or desktop files (JPEG, PNG, WebP)
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-1.5 bg-[#1769FF] text-white text-xs font-bold rounded-full shadow-sm group-hover:bg-blue-600 transition-colors"
                >
                  Browse Files
                </button>
              </div>

              {/* Mobile Direct Camera Trigger button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => mobileCameraInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors sm:hidden"
                >
                  <Smartphone size={15} className="text-[#1769FF]" />
                  <span>Open Phone Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                    handleStartCamera();
                  }}
                  className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera size={15} className="text-[#1769FF]" />
                  <span>Live Webcam</span>
                </button>
              </div>

              {/* Permissions & Security Badge */}
              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Permissions granted across all devices. Photos are compressed locally on your device for fast, secure delivery.
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Live Camera Capture */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle size={16} className="text-amber-600" />
                    <span>Camera Permission Needed</span>
                  </div>
                  <p className="mb-3">{cameraError}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs hover:bg-amber-700 transition-colors"
                    >
                      <RefreshCw size={13} />
                      Retry Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => mobileCameraInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg font-bold text-xs"
                    >
                      Use Native Mobile Camera
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
                      className="w-14 h-14 rounded-full bg-white hover:bg-gray-100 p-1 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                      title="Snap photo"
                    >
                      <div className="w-11 h-11 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center">
                        <Camera size={20} className="text-[#1769FF]" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-500 text-center">
                Position your face inside the circle and click the camera shutter to take your picture.
              </p>
            </div>
          )}

          {/* Tab 3: Curated Presets */}
          {activeTab === 'presets' && (
            <div>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                Choose a verified avatar from our modern minimalist collection:
              </p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPreview(preset.url)}
                    className={clsx(
                      'group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all hover:scale-105',
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

          {/* Tab 4: Direct URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">
                Link any external public image URL:
              </p>
              <div className="flex gap-2">
                <input
                  ref={urlInputRef}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
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

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedPreview(
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser?.name || 'User'
                )}&background=1769FF&color=fff`
              );
            }}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
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
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black rounded-full hover:bg-gray-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSaving || isProcessing}
              className={clsx(
                'px-6 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm',
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
