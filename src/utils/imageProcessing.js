/**
 * Resizes an image file and converts it to WebP format.
 * @param {File} file - The original image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Quality of the WebP image (0.0 to 1.0)
 * @returns {Promise<Blob>} A promise that resolves to the processed WebP Blob.
 */
const resizeAndConvertToWebP = (file, maxWidth, maxHeight, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fill with white background in case of transparency and converting to a format that doesn't support it,
        // though WebP supports transparency. Still good practice for consistent output.
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed.'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Processes an image file into both full and thumbnail WebP blobs.
 * @param {File} file - The original uploaded file.
 * @returns {Promise<{ fullBlob: Blob, thumbBlob: Blob, originalName: string }>}
 */
export const processImageForUpload = async (file) => {
  try {
    const fullBlob = await resizeAndConvertToWebP(file, 1000, 1000, 0.85);
    const thumbBlob = await resizeAndConvertToWebP(file, 400, 400, 0.8);
    
    // Remove original extension, replace with .webp
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    return {
      fullBlob,
      thumbBlob,
      originalName: nameWithoutExt
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};
