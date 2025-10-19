import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Database, BarChart3, ArrowLeft, Save, RotateCcw, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Utils from '@/utils/Utils';
import { useChartEditor } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { useCharts } from '@/features/charts/useCharts';

interface ChartInfo {
  name: string;
  icon: string;
  color: string; // tailwind class
}

interface CurrentChartLike {
  name?: string;
  description?: string;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
}

interface ChartEditorHeaderProps {
  // External actions
  onReset: () => void;
  onSave: () => void;
  onBack: () => void;
  onOpenDatasetModal: () => void;
}

const ChartEditorHeader: React.FC<ChartEditorHeaderProps> = ({
  onReset,
  onSave,
  onBack,
  onOpenDatasetModal,
}) => {
  const { t } = useTranslation();
  const { currentChart, creating } = useCharts();
  const {
    mode,
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

  const chartInfo: ChartInfo = useMemo(() => {
    switch (currentChartType) {
      case ChartType.Line:
      case 'line':
        return {
          name: t('chart_type_line', 'Line Chart'),
          icon: '📈',
          color: 'bg-blue-500',
        };
      case ChartType.Bar:
      case 'bar':
        return {
          name: t('chart_type_bar', 'Bar Chart'),
          icon: '📊',
          color: 'bg-green-500',
        };
      case ChartType.Area:
      case 'area':
        return {
          name: t('chart_type_area', 'Area Chart'),
          icon: '📉',
          color: 'bg-purple-500',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
    >
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
                  {hasChanges && mode === 'edit' && (
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
                            if (e.key === 'Enter' && e.ctrlKey) {
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
            {mode === 'create' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenDatasetModal}
                  className="flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Select Dataset
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common_back', 'Back')}
            </Button>
            <div className="flex items-center gap-2">
              {mode === 'edit' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReset}
                  disabled={!hasChanges}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('common_reset', 'Reset')}
                </Button>
              )}
              <Button
                size="sm"
                onClick={onSave}
                disabled={mode === 'create' ? creating || !isFormValid : !hasChanges}
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
    </motion.div>
  );
};

export default ChartEditorHeader;
