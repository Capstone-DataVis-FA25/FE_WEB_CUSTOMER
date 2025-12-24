import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Database,
  BarChart3,
  ArrowLeft,
  Save,
  RotateCcw,
  Calendar,
  Clock,
  Pencil,
  History,
  HelpCircle,
} from 'lucide-react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { chartEditorSteps } from '@/config/driver-steps';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Utils from '@/utils/Utils';
import { useChartEditor } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { useCharts } from '@/features/charts/useCharts';

interface ChartInfo {
  name: string;
  icon: string;
  color: string; // tailwind class
}

interface ChartEditorHeaderProps {
  onReset: () => void;
  onSave: () => void;
  onBack: () => void;
  activeTab?: 'chart' | 'data';
  onTabChange?: (tab: 'chart' | 'data') => void;
  chartId?: string;
  onToggleHistorySidebar?: () => void;
  mode: 'create' | 'edit';
  dirty?: boolean;
  onOpenDatasetModal?: () => void;
  currentDatasetName?: string;
}

const ChartEditorHeader: React.FC<ChartEditorHeaderProps> = ({
  onReset,
  onSave,
  onBack,
  activeTab,
  onTabChange,
  chartId,
  onToggleHistorySidebar,
  mode,
  dirty,
  onOpenDatasetModal,
  currentDatasetName,
}) => {
  const { t } = useTranslation();
  const { currentChart, creating } = useCharts();
  const {
    isEditingName,
    setIsEditingName,
    editableName,
    setEditableName,
    originalName,
    isEditingDescription,
    setIsEditingDescription,
    editableDescription,
    setEditableDescription,
    originalDescription,
    validationErrors,
    validateField,
    clearValidationError,
    hasChanges,
    isFormValid,
    currentChartType,
  } = useChartEditor();

  const combinedHasChanges = typeof dirty === 'boolean' ? dirty : hasChanges;

  // Driver.js tour
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: chartEditorSteps,
      nextBtnText: t('driver_next', 'Next'),
      prevBtnText: t('driver_prev', 'Previous'),
      doneBtnText: t('driver_done', 'Done'),
      popoverClass: 'driverjs-theme',
      overlayOpacity: 0.6,
    });
    driverObj.drive();
  };

  const chartInfo: ChartInfo = useMemo(() => {
    switch (currentChartType) {
      case ChartType.Line:
        return {
          name: t('chart_type_line', 'Line Chart'),
          icon: '📈',
          color: 'bg-blue-500',
        };
      case ChartType.Bar:
        return {
          name: t('chart_type_bar', 'Bar Chart'),
          icon: '📊',
          color: 'bg-green-500',
        };
      case ChartType.Area:
        return {
          name: t('chart_type_area', 'Area Chart'),
          icon: '📉',
          color: 'bg-purple-500',
        };
      case ChartType.Scatter:
        return {
          name: t('chart_type_scatter', 'Scatter Chart'),
          icon: '⚪️',
          color: 'bg-indigo-500',
        };
      case ChartType.Pie:
        return {
          name: t('chart_type_pie', 'Pie Chart'),
          icon: '🥧',
          color: 'bg-pink-500',
        };
      case ChartType.Donut:
        return {
          name: t('chart_type_donut', 'Donut Chart'),
          icon: '🍩',
          color: 'bg-yellow-500',
        };
      case ChartType.CyclePlot:
        return {
          name: t('chart_type_cycle_plot', 'Cycle Plot'),
          icon: '🔄',
          color: 'bg-teal-500',
        };
      case ChartType.Heatmap:
        return {
          name: t('chart_type_heatmap', 'Heatmap'),
          icon: '🌡️',
          color: 'bg-red-500',
        };
      default:
        return {
          name: t('chart_type_default', 'Chart'),
          icon: '📊',
          color: 'bg-gray-500',
        };
    }
  }, [currentChartType, t]);

  const handleNameSave = () => {
    // Use field-save hook in page; here simply exit editing if valid
    if (editableName.trim()) {
      setIsEditingName(false);
    } else {
      validateField('name', editableName);
    }
  };

  const handleDescriptionSave = () => {
    if (editableDescription.trim()) {
      setIsEditingDescription(false);
    } else {
      validateField('description', editableDescription);
    }
  };

  const [internalTab, setInternalTab] = useState<'chart' | 'data'>('chart');
  const currentTab = activeTab ?? internalTab;
  const setTab = (tab: 'chart' | 'data') => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
    >
      {/* Chart History Button - Only show in edit mode when chartId exists */}

      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${chartInfo.color} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}
            >
              {chartInfo.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-2">
                  {currentChart || mode === 'create' ? (
                    <>
                      {isEditingName && (mode === 'edit' || mode === 'create') ? (
                        <div className="flex flex-col gap-1">
                          <Input
                            value={editableName}
                            onChange={e => {
                              setEditableName(e.target.value);
                              if (e.target.value.trim()) {
                                clearValidationError('name');
                              } else {
                                validateField('name', e.target.value);
                              }
                            }}
                            className={`w-100 text-xl font-bold bg-transparent border-dashed px-2 py-1 ${
                              validationErrors.name
                                ? '!border-red-500 focus:border-red-500 ring-1 ring-red-500'
                                : 'border-gray-300'
                            }`}
                            onBlur={handleNameSave}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleNameSave();
                              } else if (e.key === 'Escape') {
                                if (editableName.trim()) {
                                  setEditableName(originalName);
                                  clearValidationError('name');
                                  setIsEditingName(false);
                                }
                              }
                            }}
                            autoFocus
                            placeholder={t('chart_name_required', 'Chart name is required')}
                          />
                          {validationErrors.name && (
                            <span className="text-red-500 text-xs ml-2">
                              {t('field_required', 'This field is required')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <h1
                            className={`text-xl font-bold text-gray-900 dark:text-white ${
                              mode === 'edit' || mode === 'create'
                                ? 'cursor-pointer hover:text-blue-600 transition-colors'
                                : 'cursor-default'
                            }`}
                            onClick={() => {
                              if (mode === 'edit' || mode === 'create') {
                                setIsEditingName(true);
                                if (!editableName.trim()) {
                                  validateField('name', editableName);
                                }
                              }
                            }}
                          >
                            {editableName ||
                              currentChart?.name ||
                              t('chart_name_placeholder', 'Untitled Chart')}
                          </h1>
                          {(mode === 'edit' || mode === 'create') && (
                            <Pencil className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('chart_editor_title_main', 'Chart Editor')}
                    </h1>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    {chartInfo.name}
                  </Badge>
                  {currentDatasetName && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900/30"
                      title={currentDatasetName}
                    >
                      <Database className="w-3 h-3" />
                      <span className="max-w-[250px] truncate">{currentDatasetName}</span>
                    </Badge>
                  )}
                  {combinedHasChanges && mode === 'edit' && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs border-orange-300 text-orange-600 bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:bg-orange-900/20"
                    >
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      {t('dataset_unsavedChangesIndicator', 'Unsaved changes')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {(currentChart || mode === 'create') && (
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t('description', 'Description')}:
                    </span>
                    {isEditingDescription && (mode === 'edit' || mode === 'create') ? (
                      <div className="flex flex-col gap-1">
                        <Input
                          value={editableDescription}
                          onChange={e => {
                            setEditableDescription(e.target.value);
                            if (e.target.value.trim()) {
                              clearValidationError('description');
                            } else {
                              validateField('description', e.target.value);
                            }
                          }}
                          className={`w-200 text-xl font-bold bg-transparent border-dashed px-2 py-1 ${
                            validationErrors.description
                              ? '!border-red-500 focus:border-red-500 ring-1 ring-red-500'
                              : 'border-gray-300'
                          }`}
                          onBlur={handleDescriptionSave}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleDescriptionSave();
                            } else if (e.key === 'Escape') {
                              if (editableDescription.trim()) {
                                setEditableDescription(originalDescription);
                                clearValidationError('description');
                                setIsEditingDescription(false);
                              }
                            }
                          }}
                          placeholder={t('description_required', 'Description is required')}
                          autoFocus
                        />
                        {validationErrors.description && (
                          <span className="text-red-500 text-xs">
                            {t('field_required', 'This field is required')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <span
                          className={`text-xs text-gray-700 dark:text-gray-300 ${
                            mode === 'edit' || mode === 'create'
                              ? 'cursor-pointer hover:text-blue-600 transition-colors'
                              : 'cursor-default'
                          }`}
                          onClick={() => {
                            if (mode === 'edit' || mode === 'create') {
                              setIsEditingDescription(true);
                              if (!editableDescription.trim()) {
                                validateField('description', editableDescription);
                              }
                            }
                          }}
                          style={{ fontWeight: '500', fontSize: '14px' }}
                        >
                          {editableDescription ||
                            currentChart?.description ||
                            t('chart_description_placeholder', 'Click to add description...')}
                        </span>
                        {(mode === 'edit' || mode === 'create') && (
                          <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentChart && (
                  <div className="flex items-center gap-4">
                    {currentChart.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                        <span className="font-medium">{t('chart_created', 'Created')}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {Utils.getDate(currentChart.createdAt, 18)}
                        </span>
                      </div>
                    )}

                    {currentChart.updatedAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                        <span className="font-medium">{t('chart_updated', 'Updated')}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {Utils.getDate(currentChart.updatedAt, 18)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startTour}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              title={t('chart_editor_tour', 'Take a tour of the chart editor')}
            >
              <HelpCircle className="w-4 h-4" />
              {t('chart_editor_tour_btn', 'Tour')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common_back', 'Back')}
            </Button>
            {mode === 'edit' && chartId && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                type="button"
                onClick={onToggleHistorySidebar}
              >
                <History className="w-5 h-5" />
                <span>{t('chart_history', 'History')}</span>
              </Button>
            )}
            <div className="flex items-center gap-2">
              {mode === 'edit' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReset}
                  disabled={!combinedHasChanges}
                  className={cn(
                    'flex items-center gap-2 transition-all duration-200',
                    'border-orange-300 dark:border-orange-700',
                    'text-orange-600 dark:text-orange-400',
                    'hover:bg-orange-50 dark:hover:bg-orange-900/20',
                    'hover:border-orange-400 dark:hover:border-orange-600',
                    'hover:text-orange-700 dark:hover:text-orange-300',
                    'active:scale-95',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-orange-300',
                    combinedHasChanges && 'shadow-sm hover:shadow-md'
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('common_reset', 'Reset')}
                </Button>
              )}
              {onOpenDatasetModal && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenDatasetModal}
                  className="flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  {currentDatasetName
                    ? t('chart_change_dataset', 'Change Dataset')
                    : t('chart_select_dataset', 'Select Dataset')}
                </Button>
              )}
              <Button
                id="btn-save-chart"
                size="sm"
                onClick={onSave}
                disabled={mode === 'create' ? creating || !isFormValid : !combinedHasChanges}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('chart_create_creating', 'Creating...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === 'create'
                      ? t('chart_create_save', 'Create Chart')
                      : t('common_save', 'Save')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-6">
          <div className="flex justify-center">
            <div className="relative inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('chart')}
                className={`relative w-28 h-[42px] px-3 text-sm font-medium cursor-pointer transition-colors ${
                  currentTab === 'chart'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-selected={currentTab === 'chart'}
              >
                <span className="inline-flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('tab_chart', 'Chart')}
                </span>
                {currentTab === 'chart' && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab('data')}
                className={`relative w-28 h-[42px] px-3 text-sm font-medium cursor-pointer transition-colors ${
                  currentTab === 'data'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-selected={currentTab === 'data'}
              >
                <span className="inline-flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {t('tab_data', 'Data')}
                </span>
                {currentTab === 'data' && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                  />
                )}
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartEditorHeader;
