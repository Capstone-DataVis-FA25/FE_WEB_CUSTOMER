import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SlideInUp } from '@/theme/animation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToastContext } from '@/components/providers/ToastProvider';
import { ChartCreationProvider, useChartCreation } from '@/contexts/ChartCreationContext';

// Import step components
import DatasetSelectionStep from '@/components/chart-creation/DatasetSelectionStep';
import ChartTypeSelectionStep from '@/components/chart-creation/ChartTypeSelectionStep';
import ChartConfigurationStep from '@/components/chart-creation/ChartConfigurationStep';
import SeriesSelectionStep from '@/components/chart-creation/SeriesSelectionStep';
import ChartPreviewStep from '@/components/chart-creation/ChartPreviewStep';

type CreationStep = 'dataset' | 'chartType' | 'configuration' | 'series' | 'preview';

// Inner component that uses the context
function CreateChartPageContent() {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();

  // Get states from context
  const {
    selectedDataset,
    selectedChartType,
    chartConfiguration,
    selectedSeries,
    isCreating,
  } = useChartCreation();

  // Local state management
  const [currentStep, setCurrentStep] = useState<CreationStep>('dataset');
  const [isProcessing, setIsProcessing] = useState(false);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    switch (currentStep) {
      case 'dataset':
        if (selectedDataset) {
          setCurrentStep('chartType');
        } else {
          showWarning(t('chart_creation_warning_dataset'), t('chart_creation_warning_dataset_message'));
        }
        break;
      case 'chartType':
        if (selectedChartType) {
          setCurrentStep('configuration');
        } else {
          showWarning(t('chart_creation_warning_chartType'), t('chart_creation_warning_chartType_message'));
        }
        break;
      case 'configuration':
        if (chartConfiguration.title) {
          setCurrentStep('series');
        } else {
          showWarning(t('chart_creation_warning_configuration'), t('chart_creation_warning_configuration_message'));
        }
        break;
      case 'series':
        if (selectedSeries.length > 0) {
          setCurrentStep('preview');
        } else {
          showWarning(t('chart_creation_warning_series'), t('chart_creation_warning_series_message'));
        }
        break;
      default:
        break;
    }
  }, [currentStep, selectedDataset, selectedChartType, chartConfiguration, selectedSeries, showWarning, t]);

  const goToPreviousStep = useCallback(() => {
    switch (currentStep) {
      case 'chartType':
        setCurrentStep('dataset');
        break;
      case 'configuration':
        setCurrentStep('chartType');
        break;
      case 'series':
        setCurrentStep('configuration');
        break;
      case 'preview':
        setCurrentStep('series');
        break;
      default:
        break;
    }
  }, [currentStep]);

  // Step indicator
  const steps = [
    { key: 'dataset', label: t('chart_creation_step_dataset'), completed: !!selectedDataset },
    { key: 'chartType', label: t('chart_creation_step_chartType'), completed: !!selectedChartType },
    { key: 'configuration', label: t('chart_creation_step_configuration'), completed: !!chartConfiguration.title },
    { key: 'series', label: t('chart_creation_step_series'), completed: selectedSeries.length > 0 },
    { key: 'preview', label: t('chart_creation_step_preview'), completed: false },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'dataset':
        return (
          <DatasetSelectionStep
            onNext={goToNextStep}
            onDatasetSelect={(dataset) => {
              // Handle dataset selection from context
            }}
          />
        );
      case 'chartType':
        return (
          <ChartTypeSelectionStep
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onChartTypeSelect={(chartType) => {
              // Handle chart type selection from context
            }}
          />
        );
      case 'configuration':
        return (
          <ChartConfigurationStep
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            chartType={selectedChartType}
          />
        );
      case 'series':
        return (
          <SeriesSelectionStep
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            dataset={selectedDataset}
            chartType={selectedChartType}
          />
        );
      case 'preview':
        return (
          <ChartPreviewStep
            onPrevious={goToPreviousStep}
            onSave={() => {
              // Handle chart saving
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {isProcessing ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          <div className="mb-8">
            <SlideInUp delay={0.1}>
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                      index < currentStepIndex || step.completed
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-100 border-blue-600 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {index < currentStepIndex || step.completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      index <= currentStepIndex ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </SlideInUp>
          </div>

          {/* Current Step Content */}
          <SlideInUp delay={0.2}>
            {renderCurrentStep()}
          </SlideInUp>
        </div>
      )}
    </div>
  );
}

// Main component with provider wrapper
function CreateChartPage() {
  return (
    <ChartCreationProvider>
      <CreateChartPageContent />
    </ChartCreationProvider>
  );
}

export default CreateChartPage;
