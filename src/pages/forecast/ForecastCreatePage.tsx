import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlideInUp } from '@/theme/animation';
import { useToastContext } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { TrendingUp, Database, Settings, BarChart3, ArrowLeft } from 'lucide-react';
import { useDataset } from '@/features/dataset/useDataset';
import StepIndicator from './components/StepIndicator';
import Step1SelectDataset from './components/Step1SelectDataset';
import Step2ConfigureSettings from './components/Step2ConfigureSettings';
import Step3ViewResults from './components/Step3ViewResults';
import { axiosPrivate } from '@/services/axios';
import { useForecastCreationProgress } from '@/features/forecast/useForecastCreationProgress';
import { useAuth } from '@/features/auth/useAuth';
import Routers from '@/router/routers';

const ForecastCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToastContext();
  const { datasets, loadingList, error, getDatasets } = useDataset();
  const { user } = useAuth();
  const { activeJobs: creationJobs, addJob: addCreationJob } = useForecastCreationProgress(
    user?.id
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [datasetHeaders, setDatasetHeaders] = useState<string[]>([]);
  const [datasetHeadersWithTypes, setDatasetHeadersWithTypes] = useState<
    Array<{ name: string; type: string }>
  >([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [featureColumns, setFeatureColumns] = useState<string[]>([]);
  const [forecastName, setForecastName] = useState('');
  const [selectedDatasetName, setSelectedDatasetName] = useState('');
  const [modelType, setModelType] = useState<'SVR' | 'LSTM'>('LSTM');
  const [forecastWindow, setForecastWindow] = useState(30);
  const [runAnalysisAfterForecast, setRunAnalysisAfterForecast] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    predictions?: Array<{
      step: number;
      value: number;
      confidence: number;
      lowerBound: number;
      upperBound: number;
    }>;
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
    stdout: string[];
    stderr: string[];
    output: string;
  } | null>(null);

  // Filter datasets to only those with at least one numeric column (for forecasting)
  const numericDatasets = React.useMemo(
    () =>
      datasets.filter(d =>
        Array.isArray((d as any).headers)
          ? (d as any).headers.some((h: any) => h.type === 'number')
          : true
      ),
    [datasets]
  );

  // Prevent access if user already has a forecast in progress (only check when starting fresh, not when viewing existing job)
  useEffect(() => {
    // Only check when user is on Step 1 (starting fresh), not when they're already in the flow
    if (currentStep !== 1 || currentJobId) {
      return;
    }

    const activeJob = creationJobs.find(job => job.status === 'processing');
    if (activeJob) {
      // User has an active job and is trying to start a new one
      showError(
        'Forecast Already in Progress',
        'You already have a forecast being processed. Please wait for it to complete before creating a new one.'
      );
      navigate(Routers.FORECAST);
    }
  }, [creationJobs, currentStep, currentJobId, navigate, showError]);

  // Fetch datasets on mount
  useEffect(() => {
    getDatasets().catch((err: any) => {
      const errorMessage = err?.payload?.message || err?.message || 'Failed to load datasets';
      showError('Failed to Load Datasets', errorMessage);
    });
  }, [getDatasets, showError]);

  // Show error toast when dataset loading fails
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === 'string' ? error : (error as any)?.message || 'Failed to load datasets';
      showError('Dataset Error', errorMessage);
    }
  }, [error, showError]);

  // Auto-redirect when forecast creation completes (if user is still on Step 3)
  useEffect(() => {
    if (!currentJobId || currentStep !== 3) return;

    const completedJob = creationJobs.find(
      job => job.jobId === currentJobId && job.status === 'done' && job.forecastId
    );

    if (completedJob && completedJob.forecastId) {
      // Small delay to show completion state
      setTimeout(() => {
        navigate(`/forecast/${completedJob.forecastId}`);
      }, 1500);
    }
  }, [creationJobs, currentJobId, currentStep, navigate]);

  // Set headers from list when dataset is selected (optimization - headers are in list response)
  useEffect(() => {
    if (selectedDatasetId && datasets.length > 0) {
      const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
      if (selectedDataset && selectedDataset.headers && selectedDataset.headers.length > 0) {
        setSelectedDatasetName(selectedDataset.name || '');
        // Store all headers with types for feature columns
        const headersWithTypes = selectedDataset.headers.map(h => ({
          name: h.name,
          type: h.type,
        }));
        setDatasetHeadersWithTypes(headersWithTypes);

        // Filter to only numeric columns for target (forecast can only predict numbers)
        const numericHeaders = selectedDataset.headers
          .filter(h => h.type === 'number')
          .map(h => h.name);
        setDatasetHeaders(numericHeaders);

        // Reset selections when dataset changes
        setTargetColumn('');
        setFeatureColumns([]);
      }
    } else {
      // Reset when no dataset selected
      setDatasetHeaders([]);
      setDatasetHeadersWithTypes([]);
      setTargetColumn('');
      setFeatureColumns([]);
      setSelectedDatasetName('');
    }
  }, [selectedDatasetId, datasets]);

  // Handle refresh datasets
  const handleRefreshDatasets = () => {
    getDatasets().catch((err: any) => {
      const errorMessage = err?.payload?.message || err?.message || 'Failed to refresh datasets';
      showError('Failed to Refresh Datasets', errorMessage);
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!selectedDatasetId) {
        showError('Dataset Required', 'Please select a dataset');
        return;
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate step 2
      if (!targetColumn) {
        showError('Target Column Required', 'Please select the target column to forecast');
        return;
      }
      setCurrentStep(3);
      handleForecast();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on step 1, navigate back to forecast list
      navigate(Routers.FORECAST);
    }
  };

  const handleForecast = async () => {
    if (!selectedDatasetId) {
      showError('No Dataset Selected', 'Please select a dataset first');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Prepare forecast request - backend will fetch dataset from DB using datasetId
      const forecastPayload: any = {
        datasetId: selectedDatasetId, // Backend will fetch and convert dataset to CSV
        targetColumn,
        featureColumns: featureColumns.length > 0 ? featureColumns : undefined,
        modelType,
        forecastWindow,
        runAnalysisAfterForecast,
      };

      // Add forecast name if provided
      if (forecastName) {
        forecastPayload.forecastName = forecastName;
      }

      // Start async forecast job
      const response = await axiosPrivate.post('/ai/forecast', forecastPayload);
      const jobId = response.data?.data?.jobId || response.data?.jobId;

      if (jobId) {
        // Add job to progress tracking
        addCreationJob({ jobId, forecastName: forecastName || undefined });

        // Store current job ID and move to Step 3 to show processing state
        setCurrentJobId(jobId);
        setCurrentStep(3);
        setResult(null);
      } else {
        throw new Error('No jobId received from server');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to start forecast';
      showError('Forecast Error', errorMessage);
      setResult({
        success: false,
        stdout: [],
        stderr: [],
        output: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Select Dataset', icon: Database },
    { number: 2, title: 'Configure Settings', icon: Settings },
    { number: 3, title: 'View Results', icon: BarChart3 },
  ];

  const handleBackToHistory = () => {
    navigate(Routers.FORECAST);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-8 pb-16">
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBackToHistory} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>

        {/* Header */}
        <SlideInUp delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Forecast
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Generate AI-powered predictions for your time series data
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>
        </SlideInUp>

        {/* Wizard Steps */}
        <div>
          {/* Step 1: Select Dataset */}
          {currentStep === 1 && (
            <Step1SelectDataset
              selectedDatasetId={selectedDatasetId}
              setSelectedDatasetId={setSelectedDatasetId}
              datasets={numericDatasets}
              loadingList={loadingList}
              error={error}
              onRefresh={handleRefreshDatasets}
              onNext={handleNext}
            />
          )}

          {/* Step 2: Configure Settings */}
          {currentStep === 2 && (
            <Step2ConfigureSettings
              forecastName={forecastName}
              setForecastName={setForecastName}
              selectedDatasetName={selectedDatasetName}
              datasetHeaders={datasetHeaders}
              datasetHeadersWithTypes={datasetHeadersWithTypes}
              targetColumn={targetColumn}
              setTargetColumn={setTargetColumn}
              featureColumns={featureColumns}
              setFeatureColumns={setFeatureColumns}
              modelType={modelType}
              setModelType={setModelType}
              forecastWindow={forecastWindow}
              setForecastWindow={setForecastWindow}
              runAnalysisAfterForecast={runAnalysisAfterForecast}
              setRunAnalysisAfterForecast={setRunAnalysisAfterForecast}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {/* Step 3: View Results */}
          {currentStep === 3 && (
            <Step3ViewResults
              isLoading={
                isLoading ||
                (currentJobId !== null &&
                  creationJobs.some(j => j.jobId === currentJobId && j.status === 'processing'))
              }
              result={result}
              onBack={handleBack}
              onStartOver={handleBackToHistory}
              onRetry={handleForecast}
              currentJobId={currentJobId}
              creationJobs={creationJobs}
              forecastName={forecastName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastCreatePage;
