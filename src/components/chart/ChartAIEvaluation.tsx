import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import chartEvaluationService, {
  type EvaluateChartRequest,
} from '@/services/chartEvaluation.service';
import useLanguage from '@/hooks/useLanguage';

interface ChartAIEvaluationProps {
  chartId: string;
  chartContainerId: string;
  chartConfig?: any; // Chart configuration to extract selected columns
  onClose?: () => void;
  language?: string;
}

export const ChartAIEvaluation: React.FC<ChartAIEvaluationProps> = ({
  chartId,
  chartContainerId,
  chartConfig,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartImagePreview, setChartImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isErrorImage, setIsErrorImage] = useState(false);
  const { currentLanguage } = useLanguage();

  // Capture preview when panel opens
  useEffect(() => {
    const loadPreview = async () => {
      setIsCapturing(true);
      try {
        const img = await chartEvaluationService.captureChartScreenshot(chartContainerId);
        setChartImagePreview(img);

        // Check if this is an error image by detecting marker or size
        // Method 1: Check for hidden marker text in base64
        const hasErrorMarker = img?.includes('__ERROR_IMAGE_MARKER__');
        // Method 2: Check size (error image is typically < 50KB)
        const isSuspiciouslySmall = img ? img.length < 50000 : false;

        const isError = hasErrorMarker || isSuspiciouslySmall;
        setIsErrorImage(isError);

        console.log(
          '[ChartAIEvaluation] Image size:',
          img?.length,
          'hasMarker:',
          hasErrorMarker,
          'isError:',
          isError
        );

        if (!isError) {
          setError(null); // Clear any previous errors if valid chart
        }
      } catch (err: any) {
        console.error('Preview capture error:', err);
        setChartImagePreview(null);
        setIsErrorImage(true);
        // Don't show error immediately, will show when user tries to evaluate
      } finally {
        setIsCapturing(false);
      }
    };

    if (isOpen) {
      loadPreview();
    } else {
      setChartImagePreview(null);
      setIsErrorImage(false);
      setError(null);
    }
  }, [isOpen, chartContainerId]);

  const handleEvaluate = async () => {
    // Block evaluation if error image is detected
    if (isErrorImage) {
      setError('No chart found to evaluate. Please create a chart before using the AI feature.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      // Use captured preview if available, otherwise capture now
      let chartImage = chartImagePreview;
      if (!chartImage) {
        chartImage = await chartEvaluationService.captureChartScreenshot(chartContainerId);
      }

      // Extract selected columns from chart config
      const selectedColumns: string[] = [];
      if (chartConfig) {
        const chartType = chartConfig.type?.toLowerCase();

        if (chartType === 'pie' || chartType === 'donut') {
          // For pie/donut: labelKey and valueKey
          if (chartConfig.config?.labelKey) selectedColumns.push(chartConfig.config.labelKey);
          if (chartConfig.config?.valueKey) selectedColumns.push(chartConfig.config.valueKey);
        } else if (chartConfig.axisConfigs) {
          // For other charts: extract from axisConfigs
          if (chartConfig.axisConfigs.xAxisKey)
            selectedColumns.push(chartConfig.axisConfigs.xAxisKey);
          if (
            chartConfig.axisConfigs.yAxisKeys &&
            Array.isArray(chartConfig.axisConfigs.yAxisKeys)
          ) {
            selectedColumns.push(...chartConfig.axisConfigs.yAxisKeys);
          }
          if (chartConfig.axisConfigs.cycleKey)
            selectedColumns.push(chartConfig.axisConfigs.cycleKey);
          if (chartConfig.axisConfigs.periodKey)
            selectedColumns.push(chartConfig.axisConfigs.periodKey);
          if (chartConfig.axisConfigs.valueKey)
            selectedColumns.push(chartConfig.axisConfigs.valueKey);
          if (chartConfig.axisConfigs.yAxisKey)
            selectedColumns.push(chartConfig.axisConfigs.yAxisKey);
        }
      }

      // Call API
      const request: EvaluateChartRequest = {
        chartId,
        chartImage,
        questions: [],
        language: currentLanguage,
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined,
      };

      const result: any = await chartEvaluationService.evaluateChart(request);

      // Backend always returns success: true with evaluation text
      if (result?.data?.evaluation) {
        setEvaluation(result.data.evaluation);
      } else {
        setError('No evaluation result received from AI. Please try again.');
      }
    } catch (err: any) {
      console.error('Evaluation error:', err);
      const errorMessage = err.message || 'An error occurred while evaluating the chart.';

      // Check if it's a backend error
      if (errorMessage.includes('not available') || errorMessage.includes('404')) {
        setError(
          'AI evaluation service is not ready. Please contact the administrator to activate it.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen && onClose) {
      onClose();
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Evaluate with AI</span>
        </button>
      )}

      {/* Evaluation Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">AI Chart Evaluation</h2>
              </div>
              <button
                onClick={handleToggle}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Custom Questions Input */}
              <div>
                {/* Chart image preview (shown before starting evaluation) */}
                <div className="space-y-2 mb-4">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 min-h-[300px] flex items-center justify-center">
                    {isCapturing && (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Capturing chart image...
                        </p>
                      </div>
                    )}
                    {!isCapturing && chartImagePreview && (
                      <img
                        src={chartImagePreview}
                        alt="Chart preview"
                        className="w-full h-auto rounded-md shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluate Button */}
              <button
                onClick={handleEvaluate}
                disabled={isLoading || isErrorImage || isCapturing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Start Evaluation</span>
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Evaluation Result */}
              {evaluation && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Evaluation Result</span>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: evaluation }}
                      style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Info Box */}
              {!evaluation && !error && !isLoading && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> AI will analyze your chart based on:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-6 list-disc">
                    <li>Chart image</li>
                    <li>Chart configuration</li>
                    <li>Best data visualization practices</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartAIEvaluation;
