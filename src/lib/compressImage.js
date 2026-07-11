'use client';
// Downscale + recompress prescription photos before upload.
// HD phone photos (4–8MB) blow past Vercel's ~4.5MB body limit once base64-encoded;
// 1600px JPEG q0.85 keeps text perfectly readable at ~200–500KB.
export function compressImage(file, maxDim = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality)); // dataURL, mime image/jpeg
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
