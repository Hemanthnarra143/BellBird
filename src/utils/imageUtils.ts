/**
 * Image processing & camera permission utilities for cross-device support
 * (Android, iOS, iPadOS, Desktop Chrome/Safari/Edge/Firefox)
 */

export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic format check
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from device storage'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(reader.result as string);
        }

        // Fill background white in case of transparency converting to jpeg
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Smooth image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Checks if camera device is available on current system
 */
export async function hasCameraDevice(): Promise<boolean> {
  if (!navigator?.mediaDevices?.enumerateDevices) {
    return false;
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Requests device camera stream with facingMode ('user' for front/selfie, 'environment' for rear/back)
 */
export async function getCameraStream(facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error('Camera capture is not supported by your browser or device.');
  }

  return await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });
}

/**
 * Stops all tracks on a MediaStream
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (e) {
      console.warn('Error stopping camera track:', e);
    }
  });
}

/**
 * Query current browser camera permission status
 */
export async function queryCameraPermission(): Promise<'granted' | 'prompt' | 'denied' | 'unsupported'> {
  if (!navigator?.permissions?.query) {
    return 'unsupported';
  }
  try {
    // @ts-ignore
    const result = await navigator.permissions.query({ name: 'camera' });
    return result.state as 'granted' | 'prompt' | 'denied';
  } catch {
    return 'unsupported';
  }
}
