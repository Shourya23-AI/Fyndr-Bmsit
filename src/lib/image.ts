/** Shrinks a picture in the browser and returns a small JPEG data URL (the server stores photos as small data URLs). */
export function shrinkImage(file: File, maxSide: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('This browser cannot resize pictures.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as a picture. Use a JPG, PNG or WebP.'));
    };
    img.src = url;
  });
}

/** PDF file -> base64 body (without the data: prefix). Resumes are PDFs up to 2 MB. */
export function readPdf(file: File): Promise<{ name: string; data: string }> {
  return new Promise((resolve, reject) => {
    if (file.type !== 'application/pdf' || file.size > 2 * 1024 * 1024) {
      reject(new Error('Resume must be a PDF under 2 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, data: String(reader.result).split(',')[1] ?? '' });
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(file);
  });
}
