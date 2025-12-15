import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SlideInUp } from '@/theme/animation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BarChart3, AlertCircle, CheckCircle2, ChevronLeft, TrendingUp } from 'lucide-react';
import type { ForecastCreationJob } from '@/features/forecast/useForecastCreationProgress';
import { motion } from 'framer-motion';

interface ForecastPrediction {
  step: number;
  value: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

interface ForecastResult {
  success: boolean;
  predictions?: ForecastPrediction[];
  metrics?: {
    trainMAE: number;
    trainRMSE: number;
    trainMAPE: number;
    trainR2: number;
    testMAE: number;
    testRMSE: number;
    testMAPE: number;
    testR2: number;
  } | null;
  modelType?: string | null;
  forecastWindow?: number | null;
  timeScale?: string | null;
  stdout: string[];
  stderr: string[];
  output: string;
}

interface Step3ViewResultsProps {
  isLoading: boolean;
  result: ForecastResult | null;
  onBack: () => void;
  onStartOver: () => void;
  onRetry: () => void;
  currentJobId?: string | null;
  creationJobs?: ForecastCreationJob[];
  forecastName?: string;
}

const Step3ViewResults: React.FC<Step3ViewResultsProps> = ({
  isLoading,
  result,
  onBack,
  onStartOver,
  onRetry,
  currentJobId,
  creationJobs = [],
  forecastName,
}) => {
  // Find current job if processing
  const currentJob = currentJobId ? creationJobs.find(j => j.jobId === currentJobId) : null;

  const isProcessing = currentJob?.status === 'processing';
  const isCompleted = currentJob?.status === 'done';
  const hasError = currentJob?.status === 'error';
  return (
    <SlideInUp delay={0.3}>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            {forecastName || 'Forecast Results'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isProcessing
              ? 'Creating your forecast...'
              : 'View the generated forecast predictions and model output'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {(isLoading || isProcessing) && !isCompleted && !hasError ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="text-center space-y-4 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Creating Your Forecast
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI is training the model and generating predictions. This may take a few
                  minutes depending on your data size.
                </p>

                {/* Progress Bar - Same style as bottom progress bar */}
                <div className="w-full mt-6">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    {/* Indeterminate sliding animation like forecast jobs in UnifiedProgressBar */}
                    <motion.div
                      className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      animate={{
                        x: ['-100%', '300%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Processing... This may take a few minutes
                  </p>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                  You can navigate away from this page. You'll be notified when it's ready!
                </p>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
              </motion.div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Forecast Completed Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Redirecting you to view your forecast results...
                </p>
              </div>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <AlertCircle className="w-20 h-20 text-red-600 dark:text-red-400" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Forecast Creation Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There was an error creating your forecast. Please try again.
                </p>
                <Button onClick={onRetry} className="mt-4">
                  Retry
                </Button>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Status Badge */}
              {result.success ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    Forecast Completed Successfully
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    Forecast Encountered Issues
                  </span>
                </div>
              )}

              {/* Forecast Summary Info */}
              {(result.modelType || result.forecastWindow || result.timeScale) && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                    Forecast Summary
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {result.modelType && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Model Type</div>
                        <div className="font-semibold text-gray-900 dark:text-white mt-1">
                          {result.modelType}
                        </div>
                      </div>
                    )}
                    {result.timeScale && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Time Scale</div>
                        <div className="font-semibold text-gray-900 dark:text-white mt-1">
                          {result.timeScale}
                        </div>
                      </div>
                    )}
                    {result.forecastWindow && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Forecast Window</div>
                        <div className="font-semibold text-gray-900 dark:text-white mt-1">
                          {result.forecastWindow} {result.timeScale?.toLowerCase() || 'steps'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Model Performance Metrics */}
              {result.metrics && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                    Model Performance
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Test R²</div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-1">
                        {result.metrics.testR2.toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {result.metrics.testR2 > 0.7
                          ? 'Excellent'
                          : result.metrics.testR2 > 0.5
                            ? 'Good'
                            : 'Fair'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Test RMSE</div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-1">
                        {result.metrics.testRMSE.toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Test MAE</div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-1">
                        {result.metrics.testMAE.toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Test MAPE</div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-1">
                        {result.metrics.testMAPE.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Forecast Predictions */}
              {result.predictions && result.predictions.length > 0 && (
                <div>
                  <Label className="mb-3 block text-lg font-semibold text-gray-900 dark:text-white">
                    Forecast Predictions ({result.predictions.length} steps)
                  </Label>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {result.predictions.map(pred => (
                        <div
                          key={pred.step}
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Step {pred.step}
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                            {pred.value.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Range: {pred.lowerBound.toFixed(2)} - {pred.upperBound.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Output Section - Only show if there's actual output (not just error messages) */}
              {result.output &&
                result.output.trim() &&
                !result.output.toLowerCase().includes('network error') &&
                !result.output.toLowerCase().includes('failed') && (
                  <div>
                    <Label className="mb-2 block text-lg font-semibold text-gray-900 dark:text-white">
                      Model Output
                    </Label>
                    <div className="bg-gray-900 dark:bg-gray-950 text-green-400 p-4 rounded-xl font-mono text-sm overflow-auto max-h-96 border border-gray-700 dark:border-gray-600">
                      <pre className="whitespace-pre-wrap">{result.output}</pre>
                    </div>
                  </div>
                )}

              {/* Error Messages - Only show if there are actual unique errors */}
              {result.stderr &&
                result.stderr.length > 0 &&
                result.stderr.some(err => err.trim()) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <Label className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        Error Details
                      </Label>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 p-4 rounded-xl font-mono text-sm overflow-auto max-h-48 border border-orange-200 dark:border-orange-800">
                      <pre className="whitespace-pre-wrap">
                        {[...new Set(result.stderr.filter(err => err.trim()))].join('\n')}
                      </pre>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Enter your data and click "Generate Forecast" to see results here
              </p>
            </div>
          )}

          {/* Navigation */}
          {!isLoading && (
            <div className="flex justify-between flex-wrap gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {result && !result.success && (
                  <Button onClick={onRetry} variant="default" className="px-6 py-3">
                    Retry
                  </Button>
                )}
              </div>
              <Button
                onClick={onStartOver}
                variant="outline"
                className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600"
              >
                Start Over
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </SlideInUp>
  );
};

export default Step3ViewResults;
