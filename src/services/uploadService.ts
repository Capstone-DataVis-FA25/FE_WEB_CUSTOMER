import { axiosPrivate } from './axios';

export interface UploadImageResponse {
  url: string;
  public_id: string;
}

/**
 * Upload image file to server (Cloudinary or local)
 * @param file - Image file or Blob to upload
 * @returns Promise with uploaded image URL and public_id
 */
export const uploadImage = async (file: File | Blob): Promise<UploadImageResponse> => {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append('file', file, file.name);
  } else {
    // If it's a Blob, give it a default name
    formData.append('file', file, 'chart-snapshot.png');
  }

  const response = await axiosPrivate.post<{ data: UploadImageResponse }>(
    '/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
};

/**
 * Convert SVG element to PNG Blob for upload
 * @param svgElement - SVG DOM element
 * @returns Promise with PNG Blob
 */
export const svgToPngBlob = async (svgElement: SVGElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Clone SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;

      // Get dimensions
      const svgWidth = svgElement.clientWidth || 800;
      const svgHeight = svgElement.clientHeight || 600;
      const scaleFactor = 2; // For better quality

      // Set explicit dimensions
      svgClone.setAttribute('width', svgWidth.toString());
      svgClone.setAttribute('height', svgHeight.toString());
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Collect styles from stylesheets
      let styles = '';
      const styleSheets = document.styleSheets;
      Array.from(styleSheets).forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          Array.from(rules).forEach(rule => {
            styles += rule.cssText + '\n';
          });
        } catch {
          // Cross-origin stylesheets might cause errors
        }
      });

      if (styles) {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        svgClone.insertBefore(styleElement, svgClone.firstChild);
      }

      // Convert SVG to data URL
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create canvas and draw SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      canvas.width = svgWidth * scaleFactor;
      canvas.height = svgHeight * scaleFactor;
      ctx.scale(scaleFactor, scaleFactor);

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, svgWidth, svgHeight);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          },
          'image/png',
          1.0
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Capture chart snapshot and upload to server
 * @param chartContainerSelector - CSS selector for chart container (e.g., '.chart-container')
 * @returns Promise with uploaded image URL or null if failed
 */
export const captureAndUploadChartSnapshot = async (
  chartContainerSelector: string = '.chart-container'
): Promise<string | null> => {
  try {
    // Find the chart SVG element
    const chartContainer = document.querySelector(chartContainerSelector);
    const svgElement = chartContainer?.querySelector('svg') || document.querySelector('svg');

    if (!svgElement) {
      console.warn('No SVG element found for chart snapshot');
      return null;
    }

    // Convert SVG to PNG blob
    const pngBlob = await svgToPngBlob(svgElement);

    // Upload to server
    const uploadResult = await uploadImage(pngBlob);

    return uploadResult.url;
  } catch (error) {
    console.error('Failed to capture and upload chart snapshot:', error);
    return null;
  }
};
