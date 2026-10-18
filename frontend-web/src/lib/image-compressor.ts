/**
 * Client-Side Image Compressor using HTML5 Canvas
 * Resizes oversized camera images down to high-definition WebP format (< 300KB)
 * prior to uploading to server.
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.8
): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;

  // Don't compress non-images or SVGs
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return { file, originalSize, compressedSize: originalSize };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, originalSize, compressedSize: originalSize });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, originalSize, compressedSize: originalSize });
              return;
            }
            const outputName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], outputName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: blob.size,
            });
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve({ file, originalSize, compressedSize: originalSize });
    };
    reader.onerror = () => resolve({ file, originalSize, compressedSize: originalSize });
  });
}

export async function compressMultipleImages(
  files: File[],
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.8
): Promise<{ file: File; originalSize: number; compressedSize: number }[]> {
  return Promise.all(
    files.map((file) => compressImage(file, maxWidth, maxHeight, quality))
  );
}
