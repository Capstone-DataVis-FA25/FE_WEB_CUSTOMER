import { axiosPrivate } from './axios';
import { API_ENDPOINTS } from '@/constants/endpoints';

export interface EvaluateChartRequest {
  chartId: string;
  chartImage: string; // base64 encoded image
  questions?: string[];
  language?: string;
  selectedColumns?: string[];
}

export interface EvaluateChartResponse {
  success: boolean;
  evaluation: string;
  chartInfo: {
    id: string;
    name: string;
    type: string;
  };
  datasetInfo: {
    name: string;
    rows: number;
    columns: number;
  };
  processingTime: number;
}

class ChartEvaluationService {
  /**
   * Evaluate a chart using AI
   * @param data Chart evaluation request data
   * @returns AI evaluation result
   */
  async evaluateChart(data: EvaluateChartRequest): Promise<EvaluateChartResponse> {
    try {
      const response = await axiosPrivate.post<EvaluateChartResponse>(
        API_ENDPOINTS.AI.EVALUATE_CHART,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('[ChartEvaluationService] evaluateChart error:', error);

      // Check if it's a 404 (endpoint not found)
      if (error.response?.status === 404) {
        throw new Error('AI evaluation service is not available. Please contact administrator.');
      }

      throw new Error(
        error.response?.data?.message || 'Failed to evaluate chart. Please try again later.'
      );
    }
  }

  /**
   * Convert canvas/SVG element to base64 image
   * @param element Canvas or SVG element
   * @returns Base64 encoded image string
   */
  async elementToBase64(element: HTMLCanvasElement | SVGSVGElement): Promise<string> {
    try {
      if (element instanceof HTMLCanvasElement) {
        return element.toDataURL('image/png');
      }

      // For SVG elements
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(element);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };
        img.src = url;
      });
    } catch (error) {
      console.error('[ChartEvaluationService] elementToBase64 error:', error);
      throw new Error('Failed to convert chart to image');
    }
  }

  /**
   * Capture chart screenshot from a container element
   * @param containerId ID of the chart container element
   * @returns Base64 encoded image string
   */
  async captureChartScreenshot(containerId: string): Promise<string> {
    // Find the chart container
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Chart container with ID "${containerId}" not found`);
    }

    // Try to find SVG element first
    const svgElement = container.querySelector('svg');
    let isIconSVG = false;
    if (svgElement) {
      // Check by class name or size
      const className = svgElement.getAttribute('class') || '';
      const width = Number(svgElement.getAttribute('width')) || svgElement.clientWidth || 0;
      const height = Number(svgElement.getAttribute('height')) || svgElement.clientHeight || 0;
      if (
        className.includes('lucide-chevron-down') ||
        className.includes('lucide') ||
        (width <= 32 && height <= 32)
      ) {
        isIconSVG = true;
      }
    }

    if (!svgElement || isIconSVG) {
      // Fallback: create error image (base64) with marker text
      const width = 800;
      const height = 400;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#fff';
        const mainText = 'Not Found Chart Image';
        const subText = 'Please create a chart before using AI features.';
        const mainFontSize = 32;
        const subFontSize = 18;
        const totalTextHeight = mainFontSize + subFontSize + 16;
        const startY = height / 2 - totalTextHeight / 2 + mainFontSize;
        ctx.fillText(mainText, width / 2, startY);
        ctx.font = '18px Arial';
        ctx.fillText(subText, width / 2, startY + subFontSize + 16);

        // Add hidden marker at bottom to identify error image
        ctx.font = '1px Arial';
        ctx.fillStyle = '#222'; // Same as background so it's invisible
        ctx.fillText('__ERROR_IMAGE_MARKER__', width / 2, height - 1);

        return canvas.toDataURL('image/png');
      } else {
        throw new Error('No SVG element found for chart snapshot and cannot create error image');
      }
    } else {
      // Convert SVG to base64 PNG
      // Clone SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      const svgWidth = svgElement.clientWidth || 800;
      const svgHeight = svgElement.clientHeight || 600;
      const scaleFactor = 2;
      svgClone.setAttribute('width', svgWidth.toString());
      svgClone.setAttribute('height', svgHeight.toString());
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Collect styles from stylesheets
      let styles = '';
      const styleSheets = document.styleSheets;
      Array.from(styleSheets).forEach(sheet => {
        try {
          const rules = sheet.cssRules || (sheet as any).rules;
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
        throw new Error('Cannot create canvas context');
      }
      canvas.width = svgWidth * scaleFactor;
      canvas.height = svgHeight * scaleFactor;
      ctx.scale(scaleFactor, scaleFactor);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, svgWidth, svgHeight);

      return await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };
        img.src = url;
      });
    }
  }
}

export const chartEvaluationService = new ChartEvaluationService();
export default chartEvaluationService;
