import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writePNG(width, height, isMaskable) {
  // Generate RGBA buffer
  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);

  const bgR = 0x17, bgG = 0x69, bgB = 0xff; // #1769FF
  const fgR = 0xff, fgG = 0xff, fgB = 0xff; // #FFFFFF

  const cornerRadius = isMaskable ? 0 : Math.round(width * 0.22);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Check rounded corner mask
      let inBounds = true;
      if (!isMaskable && cornerRadius > 0) {
        let dx = 0, dy = 0;
        if (x < cornerRadius) dx = cornerRadius - x;
        else if (x >= width - cornerRadius) dx = x - (width - cornerRadius);

        if (y < cornerRadius) dy = cornerRadius - y;
        else if (y >= height - cornerRadius) dy = y - (height - cornerRadius);

        if (dx > 0 && dy > 0 && (dx * dx + dy * dy > cornerRadius * cornerRadius)) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Draw brand background
      rawData[pixelOffset] = bgR;
      rawData[pixelOffset + 1] = bgG;
      rawData[pixelOffset + 2] = bgB;
      rawData[pixelOffset + 3] = 255;

      // Draw stylized bird / wings center glyph
      const cx = width / 2;
      const cy = height / 2;
      const scale = isMaskable ? width * 0.28 : width * 0.35;

      const nx = (x - cx) / scale;
      const ny = (y - cy) / scale;

      // Symmetric bird wings + head silhouette equation
      // Wing curve: ny ~ -0.4 * nx^2 + 0.3
      const isWing = Math.abs(ny - (-0.35 * nx * nx + 0.2)) < 0.22 && Math.abs(nx) < 1.1;
      const isHead = (nx * nx + (ny + 0.5) * (ny + 0.5)) < 0.16;
      const isBeak = (nx > 0.15 && nx < 0.5 && Math.abs(ny + 0.5 - 0.2 * nx) < 0.1);
      const isBody = (nx * nx * 0.7 + (ny - 0.2) * (ny - 0.2)) < 0.25;

      if (isWing || isHead || isBeak || isBody) {
        rawData[pixelOffset] = fgR;
        rawData[pixelOffset + 1] = fgG;
        rawData[pixelOffset + 2] = fgB;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  // Compress with zlib
  const compressedData = zlib.deflateSync(rawData);

  // Build PNG chunks
  const chunks = [];

  // Signature
  chunks.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: deflate
  ihdrData[11] = 0; // Filter: standard
  ihdrData[12] = 0; // Interlace: none

  function makeChunk(type, data) {
    const chunk = Buffer.alloc(8 + data.length + 4);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crcVal = crc32(chunk.subarray(4, 8 + data.length));
    chunk.writeUInt32BE(crcVal, 8 + data.length);
    return chunk;
  }

  chunks.push(makeChunk('IHDR', ihdrData));
  chunks.push(makeChunk('IDAT', compressedData));
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

const iconsDir = path.resolve(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate all standard PWA & Android Google Play icons
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), writePNG(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), writePNG(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), writePNG(512, 512, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), writePNG(192, 192, true));
fs.writeFileSync(path.resolve(process.cwd(), 'public', 'apple-touch-icon.png'), writePNG(180, 180, false));

console.log('Successfully generated all Google Play & PWA PNG icons!');
