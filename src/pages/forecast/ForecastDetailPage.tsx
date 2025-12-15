import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SlideInUp } from '@/theme/animation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  BarChart3,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Target,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  Layers,
  Cpu,
  ChevronRight,
  X,
} from 'lucide-react';
import { axiosPrivate } from '@/services/axios';
import { useToastContext } from '@/components/providers/ToastProvider';
import getApiBackendUrl from '@/utils/apiConfig';
import useLanguage from '@/hooks/useLanguage';
import i18n from '@/i18n/i18n';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import { useForecastAnalysisProgress } from '@/features/forecast/useForecastAnalysisProgress';
import { useAuth } from '@/features/auth/useAuth';

interface ForecastPrediction {
  step: number;
  value: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

interface ForecastMetrics {
  trainMAE?: number;
  trainRMSE?: number;
  trainMAPE?: number;
  trainR2?: number;
  testMAE?: number;
  testRMSE?: number;
  testMAPE?: number;
  testR2?: number;
}

interface ForecastData {
  id: string;
  name?: string;
  targetColumn: string;
  featureColumns?: string[] | null;
  timeScale: string;
  forecastWindow: number;
  modelType: string;
  predictions: ForecastPrediction[];
  metrics?: ForecastMetrics | null;
  analyze?: string | null;
  chartImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  datasetId?: string;
}

const ForecastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const modalConfirm = useModalConfirm();
  const { currentLanguage } = useLanguage(); // Reactive language hook
  const { user } = useAuth();
  const { activeJobs } = useForecastAnalysisProgress(user?.id);

  const MAX_VISIBLE_FEATURES = 3;
  const featureColumns = forecast?.featureColumns || [];
  const visibleFeatures = featureColumns.slice(0, MAX_VISIBLE_FEATURES);
  const remainingCount = featureColumns.length - MAX_VISIBLE_FEATURES;

  // Get user's language preference (reactive to language changes)
  const getUserLanguage = (): 'en' | 'vi' => {
    // currentLanguage from useLanguage hook is reactive and updates when language changes
    // It returns 'en' or 'vi' directly
    return currentLanguage === 'vi' ? 'vi' : 'en';
  };

  // Parse analysis into sections
  const parseAnalysisSections = (
    analysisText: string | null | undefined
  ): Array<{ title: string; content: string }> => {
    if (!analysisText) {
      return [];
    }

    const language = getUserLanguage();
    const englishMarker = '---ENGLISH---';
    const vietnameseMarker = '---VIETNAMESE---';

    // Extract the correct language section
    let textToParse = '';
    if (analysisText.includes(englishMarker) && analysisText.includes(vietnameseMarker)) {
      if (language === 'vi') {
        const viStart = analysisText.indexOf(vietnameseMarker) + vietnameseMarker.length;
        textToParse = analysisText.substring(viStart).trim();
      } else {
        const enStart = analysisText.indexOf(englishMarker) + englishMarker.length;
        const enEnd = analysisText.indexOf(vietnameseMarker);
        textToParse =
          enEnd === -1
            ? analysisText.substring(enStart).trim()
            : analysisText.substring(enStart, enEnd).trim();
      }
    } else {
      textToParse = analysisText;
    }

    // Parse sections (format: "1. Section Title\n\nContent...")
    const sections: Array<{ title: string; content: string }> = [];
    const sectionRegex = /^(\d+)\.\s+(.+?)$/gm;
    const lines = textToParse.split('\n');
    let currentSection: { title: string; content: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^(\d+)\.\s+(.+)$/);

      if (match) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          title: match[2],
          content: '',
        };
      } else if (currentSection && line) {
        // Clean asterisks and markdown formatting
        let cleanedLine = line
          .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold markdown **text**
          .replace(/\*(.+?)\*/g, '$1') // Remove italic markdown *text*
          .replace(/^\*\s*/, '') // Remove leading asterisk from bullet points
          .trim();

        // Add content to current section
        if (currentSection.content) {
          currentSection.content += '\n' + cleanedLine;
        } else {
          currentSection.content = cleanedLine;
        }
      }
    }

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  // Parse bilingual analysis text (legacy function for backward compatibility)
  const parseAnalysis = (analysisText: string | null | undefined): string => {
    if (!analysisText) {
      console.log('[parseAnalysis] ❌ No analysis text provided');
      return '';
    }

    const language = getUserLanguage();
    const englishMarker = '---ENGLISH---';
    const vietnameseMarker = '---VIETNAMESE---';

    // Comprehensive debug logging
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[parseAnalysis] 🔍 Starting analysis parsing...');
    console.log('[parseAnalysis] 📊 Raw text length:', analysisText.length);
    console.log('[parseAnalysis] 🌐 User language preference:', language);
    console.log('[parseAnalysis] 🔄 Current i18n language (from hook):', currentLanguage);
    console.log('[parseAnalysis] 🔄 i18n.language value (direct):', i18n.language);
    console.log('[parseAnalysis] 🔎 Looking for markers:', {
      englishMarker,
      vietnameseMarker,
    });
    console.log('[parseAnalysis] ✅ Has English marker:', analysisText.includes(englishMarker));
    console.log(
      '[parseAnalysis] ✅ Has Vietnamese marker:',
      analysisText.includes(vietnameseMarker)
    );

    // Show first 500 chars of raw text for debugging
    console.log('[parseAnalysis] 📝 Raw text preview (first 500 chars):');
    console.log(analysisText.substring(0, 500));
    console.log('...');

    // Check if the text contains language markers
    if (analysisText.includes(englishMarker) && analysisText.includes(vietnameseMarker)) {
      console.log('[parseAnalysis] ✂️ Both markers found, splitting text...');

      const enMarkerIndex = analysisText.indexOf(englishMarker);
      const viMarkerIndex = analysisText.indexOf(vietnameseMarker);

      console.log('[parseAnalysis] 📍 Marker positions:', {
        englishMarkerIndex: enMarkerIndex,
        vietnameseMarkerIndex: viMarkerIndex,
      });

      if (language === 'vi') {
        // Extract Vietnamese section
        const viStart = viMarkerIndex + vietnameseMarker.length;
        const viText = analysisText.substring(viStart).trim();
        console.log('[parseAnalysis] 🇻🇳 Extracting Vietnamese section...');
        console.log('[parseAnalysis] 📏 Vietnamese text length:', viText.length);
        console.log('[parseAnalysis] 📝 Vietnamese text preview (first 300 chars):');
        console.log(viText.substring(0, 300));
        console.log('[parseAnalysis] ✅ Returning Vietnamese text');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return viText;
      } else {
        // Extract English section
        const enStart = enMarkerIndex + englishMarker.length;
        const enEnd = viMarkerIndex;
        if (enEnd === -1) {
          // If Vietnamese marker not found, take everything after English marker
          const enText = analysisText.substring(enStart).trim();
          console.log('[parseAnalysis] 🇺🇸 Extracting English section (no VI marker found)...');
          console.log('[parseAnalysis] 📏 English text length:', enText.length);
          console.log('[parseAnalysis] 📝 English text preview (first 300 chars):');
          console.log(enText.substring(0, 300));
          console.log('[parseAnalysis] ✅ Returning English text');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return enText;
        }
        const enText = analysisText.substring(enStart, enEnd).trim();
        console.log('[parseAnalysis] 🇺🇸 Extracting English section...');
        console.log('[parseAnalysis] 📏 English text length:', enText.length);
        console.log('[parseAnalysis] 📝 English text preview (first 300 chars):');
        console.log(enText.substring(0, 300));
        console.log('[parseAnalysis] ✅ Returning English text');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return enText;
      }
    }

    // If no markers, return as-is (backward compatibility)
    console.log('[parseAnalysis] ⚠️ No markers found, returning full text as-is');
    console.log('[parseAnalysis] 📏 Full text length:', analysisText.length);
    console.log('[parseAnalysis] 📝 Full text preview (first 300 chars):');
    console.log(analysisText.substring(0, 300));
    console.log('[parseAnalysis] ✅ Returning full text (backward compatibility)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return analysisText;
  };

  const fetchForecast = async () => {
    if (!id) {
      showError('Invalid Forecast ID', 'The forecast ID is missing');
      navigate('/forecast');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosPrivate.get(`/forecasts/${id}`);
      const forecastData = response.data?.data || response.data;
      setForecast(forecastData);
    } catch (error: any) {
      console.error('Failed to fetch forecast:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to load forecast';
      showError('Forecast Error', errorMessage);
      navigate('/forecast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!id || !forecast) return;

    try {
      setIsAnalyzing(true);
      const response = await axiosPrivate.post(`/forecasts/${id}/analyze`);
      const jobId = response.data?.data?.jobId || response.data?.jobId;

      if (jobId) {
        // Add job to progress tracking
        // The job will be tracked via WebSocket notifications
        showSuccess(
          'Analysis Started',
          'AI analysis has been started. You will be notified when it completes. You can navigate away from this page.'
        );
      } else {
        throw new Error('No jobId received from server');
      }
    } catch (error: any) {
      console.error('Failed to start analysis:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to start analysis';
      showError('Analysis Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteForecast = () => {
    if (!forecast) return;

    modalConfirm.openConfirm(async () => {
      try {
        setIsDeleting(true);
        await axiosPrivate.delete(`/forecasts/${forecast.id}`);
        showSuccess(
          'Forecast Deleted',
          `Forecast "${forecast.name || 'New Forecast'}" has been deleted successfully`
        );
        // Navigate back to forecast list
        navigate('/forecast');
      } catch (error: any) {
        console.error('Failed to delete forecast:', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to delete forecast';
        showError('Delete Failed', errorMessage);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  useEffect(() => {
    fetchForecast();
  }, [id, navigate, showError]);

  // Listen for analysis completion and refresh forecast
  useEffect(() => {
    if (!id || !forecast) return;

    // Check if there's a completed job for this forecast
    const completedJob = activeJobs.find(job => job.forecastId === id && job.status === 'done');

    if (completedJob) {
      // Refresh forecast to get updated analysis
      fetchForecast();
    }
  }, [activeJobs, id, forecast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">Forecast not found</p>
                <Button
                  onClick={() => navigate('/forecast')}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Forecast
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <SlideInUp delay={0.1}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              onClick={() => navigate('/forecast')}
              variant="outline"
              className="mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forecast
            </Button>
          </div>

          {/* Main Forecast Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    {forecast.name || 'Forecast Details'}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Generated on {new Date(forecast.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleDeleteForecast}
                  disabled={isDeleting}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Forecast Summary Info */}
                <div>
                  <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                    Forecast Summary
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Target className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Target Column
                        </div>
                        <div
                          className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 truncate"
                          title={forecast.targetColumn}
                        >
                          {forecast.targetColumn}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Feature Columns
                          </div>
                          {featureColumns.length > MAX_VISIBLE_FEATURES && (
                            <button
                              onClick={() => setShowAllFeatures(true)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer font-medium"
                            >
                              View All ({featureColumns.length})
                            </button>
                          )}
                        </div>
                        <div className="text-sm">
                          {featureColumns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {visibleFeatures.map((col, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  title={col}
                                >
                                  {col}
                                </span>
                              ))}
                              {remainingCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                  +{remainingCount} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Time Scale</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                          {forecast.timeScale}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Forecast Window
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                          {forecast.forecastWindow} {forecast.timeScale.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-4">
                      <Cpu className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Model Type</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                          {forecast.modelType}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Model Performance Metrics */}
                {forecast.metrics && (
                  <div>
                    <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                      Model Performance Metrics
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Test R²</div>
                          <div className="group relative">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                              <div className="font-semibold mb-1 text-purple-400">
                                R² (R-squared)
                              </div>
                              <div className="text-gray-300 leading-relaxed">
                                Measures how well the model explains the variance in the data.
                                Values closer to 1.0 indicate better fit.
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                            </div>
                          </div>
                          {forecast.metrics.testR2 && (
                            <span
                              className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                forecast.metrics.testR2 > 0.7
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : forecast.metrics.testR2 > 0.5
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {forecast.metrics.testR2 > 0.7
                                ? 'Excellent'
                                : forecast.metrics.testR2 > 0.5
                                  ? 'Good'
                                  : 'Fair'}
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {forecast.metrics.testR2?.toFixed(3) || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Test RMSE</div>
                          <div className="group relative">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                              <div className="font-semibold mb-1 text-purple-400">
                                RMSE (Root Mean Squared Error)
                              </div>
                              <div className="text-gray-300 leading-relaxed">
                                Measures the average magnitude of prediction errors. Lower values
                                indicate better accuracy.
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {forecast.metrics.testRMSE?.toFixed(3) || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Test MAE</div>
                          <div className="group relative">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                              <div className="font-semibold mb-1 text-purple-400">
                                MAE (Mean Absolute Error)
                              </div>
                              <div className="text-gray-300 leading-relaxed">
                                Measures the average absolute difference between predicted and
                                actual values. Lower values indicate better accuracy.
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {forecast.metrics.testMAE?.toFixed(3) || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Test MAPE</div>
                          <div className="group relative">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                              <div className="font-semibold mb-1 text-purple-400">
                                MAPE (Mean Absolute Percentage Error)
                              </div>
                              <div className="text-gray-300 leading-relaxed">
                                Measures the average percentage difference between predicted and
                                actual values. Lower percentages indicate better accuracy.
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {forecast.metrics.testMAPE?.toFixed(2) || 'N/A'}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparison Chart */}
                <div>
                  <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                    Historical Data vs Forecast Comparison
                  </Label>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {forecast.chartImageUrl ? (
                      <div className="p-4">
                        <img
                          src={`${getApiBackendUrl()}${forecast.chartImageUrl}`}
                          alt="Forecast Comparison Chart"
                          className="w-full h-auto rounded"
                          onError={e => {
                            console.error('Failed to load chart image:', forecast.chartImageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chart visualization will be available here once generated
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post-Prediction Analysis */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Analysis
                    </Label>
                    {(!forecast.analyze || forecast.analyze.trim() === '') && (
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        size="sm"
                        className="flex items-center gap-2 cursor-pointer"
                        variant="outline"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Analysis
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    {forecast.analyze ? (
                      <div className="space-y-6">
                        {parseAnalysisSections(forecast.analyze).map((section, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold">
                                {index + 1}
                              </span>
                              {section.title}
                            </h3>
                            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {section.content.split('\n').map((line, lineIndex) => {
                                const trimmedLine = line.trim();
                                // Check if line is a bullet point (starts with - or *)
                                if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                                  const bulletText = trimmedLine.substring(1).trim();
                                  // Remove any remaining asterisks
                                  const cleanText = bulletText.replace(/\*/g, '');
                                  return (
                                    <div
                                      key={lineIndex}
                                      className="ml-4 mb-2 flex items-start gap-2"
                                    >
                                      <span className="text-purple-600 dark:text-purple-400 mt-1.5 flex-shrink-0">
                                        •
                                      </span>
                                      <span>{cleanText}</span>
                                    </div>
                                  );
                                }
                                // Check if line starts with bold text (format: **Bold Text**: description)
                                const boldMatch = trimmedLine.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
                                if (boldMatch) {
                                  return (
                                    <div key={lineIndex} className="mb-3 last:mb-0">
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {boldMatch[1]}:
                                      </span>
                                      <span className="ml-1">{boldMatch[2]}</span>
                                    </div>
                                  );
                                }
                                // Regular paragraph - clean any remaining asterisks
                                if (trimmedLine) {
                                  const cleanText = trimmedLine.replace(/\*/g, '');
                                  return (
                                    <p key={lineIndex} className="mb-3 last:mb-0">
                                      {cleanText}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        ))}
                        {parseAnalysisSections(forecast.analyze).length === 0 && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {parseAnalysis(forecast.analyze)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Analysis will be available here once generated
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Forecast Predictions */}
                {forecast.predictions && forecast.predictions.length > 0 && (
                  <div>
                    <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                      Forecast Predictions ({forecast.predictions.length} steps)
                    </Label>
                    <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Step
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Predicted Value
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Range
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Uncertainty
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {forecast.predictions.map(pred => (
                              <tr
                                key={pred.step}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                  {pred.step}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                  {pred.value.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {pred.lowerBound.toFixed(2)} - {pred.upperBound.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="inline-flex items-center">
                                    <span className="mr-0.5">±</span>
                                    <span>{pred.confidence.toFixed(2)}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideInUp>
      </div>

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        title="Delete Forecast"
        message="Are you sure you want to delete this forecast? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={modalConfirm.isLoading}
      />

      {/* View All Features Modal */}
      {showAllFeatures && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAllFeatures(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                All Feature Columns ({featureColumns.length})
              </h3>
              <button
                onClick={() => setShowAllFeatures(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {featureColumns.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white">{col}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setShowAllFeatures(false)}
                variant="outline"
                className="w-full cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastDetailPage;
