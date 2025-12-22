import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SlideInUp } from '@/theme/animation';
import { BarChart3, Settings, ChevronLeft, Play, ChevronDown, X, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Step2ConfigureSettingsProps {
  forecastName: string;
  setForecastName: (value: string) => void;
  selectedDatasetName: string;
  datasetHeaders: string[];
  datasetHeadersWithTypes: Array<{ name: string; type: string }>;
  targetColumn: string;
  setTargetColumn: (value: string) => void;
  featureColumns: string[];
  setFeatureColumns: (value: string[]) => void;
  modelType: string;
  setModelType: (value: 'SVR' | 'LSTM') => void;
  forecastWindow: number;
  setForecastWindow: (value: number) => void;
  runAnalysisAfterForecast: boolean;
  setRunAnalysisAfterForecast: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

// Allow controlling `open` on the shadcn Select without TS friction
const SelectWithOpen = Select as any;

const Step2ConfigureSettings: React.FC<Step2ConfigureSettingsProps> = ({
  forecastName,
  setForecastName,
  selectedDatasetName,
  datasetHeaders,
  datasetHeadersWithTypes,
  targetColumn,
  setTargetColumn,
  featureColumns,
  setFeatureColumns,
  modelType,
  setModelType,
  forecastWindow,
  setForecastWindow,
  runAnalysisAfterForecast,
  setRunAnalysisAfterForecast,
  onBack,
  onNext,
}) => {
  const { t } = useTranslation();
  const [isCustomForecastWindow, setIsCustomForecastWindow] = useState(false);
  const [customForecastWindowValue, setCustomForecastWindowValue] = useState<string>('');

  // Initialize custom value if forecastWindow is not in preset options (only on mount)
  useEffect(() => {
    const presetOptions = [5, 10, 15, 20];
    if (!presetOptions.includes(forecastWindow)) {
      setIsCustomForecastWindow(true);
      setCustomForecastWindowValue(forecastWindow.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which controls are open
  const [isTargetOpen, setIsTargetOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const featureColumnsRef = useRef<HTMLDivElement>(null);

  // Close feature dropdown when clicking outside or when any Select elsewhere is toggled
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFeatureOpen &&
        featureColumnsRef.current &&
        !featureColumnsRef.current.contains(event.target as Node)
      ) {
        setIsFeatureOpen(false);
      }
    };

    const handleAnySelectToggle = () => {
      // Whenever a global Select is toggled, close the feature dropdown
      if (isFeatureOpen) {
        setIsFeatureOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('app:select-toggled', handleAnySelectToggle as EventListener);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('app:select-toggled', handleAnySelectToggle as EventListener);
    };
  }, [isFeatureOpen]);

  const handleTargetColumnChange = (value: string) => {
    // Allow deselecting by clicking the same value again
    if (targetColumn === value) {
      setTargetColumn('');
    } else {
      setTargetColumn(value);
      // Remove target column from feature columns if it was selected
      if (featureColumns.includes(value)) {
        setFeatureColumns(featureColumns.filter(col => col !== value));
      }
    }
  };

  const handleFeatureColumnToggle = (columnName: string) => {
    if (featureColumns.includes(columnName)) {
      setFeatureColumns(featureColumns.filter(col => col !== columnName));
    } else {
      setFeatureColumns([...featureColumns, columnName]);
    }
  };

  // Get available feature columns (exclude target column, numeric-only)
  const availableFeatureColumns = React.useMemo(() => {
    return datasetHeadersWithTypes.filter(
      header => header.name !== targetColumn && header.type === 'number'
    );
  }, [datasetHeadersWithTypes, targetColumn]);

  // Get badge text for column type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'number':
        return t('forecast_step2_target_column_type');
      case 'date':
        return '(date)';
      case 'string':
        return '(text)';
      default:
        return `(${type})`;
    }
  };

  // Prepare options for SelectValue to show badge in selected value
  // The label format "ColumnName (number)" will be parsed by SelectValue to show badge layout
  const targetColumnOptions = React.useMemo(() => {
    return datasetHeaders.map(header => ({
      value: header,
      label: `${header} ${t('forecast_step2_target_column_type')}`, // Format: "ColumnName (number)" for SelectValue to parse
    }));
  }, [datasetHeaders, t]);

  return (
    <SlideInUp delay={0.2}>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t('forecast_step2_title')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('forecast_step2_desc')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Selected Dataset Display */}
          {selectedDatasetName && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                  {t('forecast_step1_datasets')}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {selectedDatasetName}
                </p>
              </div>
            </div>
          )}
          <div>
            <Label
              htmlFor="forecastName"
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 block"
            >
              {t('forecast_step2_forecast_name')}
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('forecast_step2_forecast_name_desc')}
            </p>
            <Input
              id="forecastName"
              placeholder={t('forecast_step2_forecast_name_placeholder')}
              value={forecastName}
              onChange={e => {
                const value = e.target.value;
                if (value.length <= 70) {
                  setForecastName(value);
                }
              }}
              maxLength={70}
              className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {forecastName.length}/70 {t('forecast_step2_characters')}
            </p>
          </div>

          <div>
            <Label
              htmlFor="targetColumn"
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 block"
            >
              {t('forecast_step2_target_column')}
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('forecast_step2_target_column_desc')}
            </p>
            {datasetHeaders.length > 0 ? (
              <SelectWithOpen
                value={targetColumn}
                onValueChange={handleTargetColumnChange}
                open={isTargetOpen}
                onOpenChange={(open: boolean) => {
                  setIsTargetOpen(open);
                  if (open) {
                    setIsModelOpen(false);
                    setIsFeatureOpen(false);
                  }
                }}
              >
                <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800">
                  <SelectValue
                    placeholder={t('forecast_step2_target_column_placeholder')}
                    options={targetColumnOptions}
                  />
                </SelectTrigger>
                <SelectContent>
                  {targetColumn && (
                    <SelectItem value="">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('forecast_step2_target_column_clear')}
                      </span>
                    </SelectItem>
                  )}
                  {datasetHeaders.map(header => (
                    <SelectItem key={header} value={header}>
                      <div className="flex items-center justify-between w-full">
                        <span>{header}</span>
                        <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {t('forecast_step2_target_column_type')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectWithOpen>
            ) : (
              <Input
                id="targetColumn"
                placeholder={t('forecast_step2_target_column_example')}
                value={targetColumn}
                onChange={e => setTargetColumn(e.target.value)}
                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
              />
            )}
          </div>

          {/* Feature Columns (Multi-select) */}
          <div>
            <Label
              htmlFor="featureColumns"
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 block"
            >
              {t('forecast_step2_feature_columns')}
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('forecast_step2_feature_columns_desc')
                .split('numeric')
                .map((part, i, arr) =>
                  i === arr.length - 1 ? (
                    part
                  ) : (
                    <React.Fragment key={i}>
                      {part}
                      <span className="font-semibold">
                        {t('forecast_step2_feature_columns_numeric')}
                      </span>
                    </React.Fragment>
                  )
                )}
            </p>
            {availableFeatureColumns.length > 0 ? (
              <div className="relative" ref={featureColumnsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsFeatureOpen(prev => {
                      const next = !prev;
                      if (next) {
                        setIsTargetOpen(false);
                        setIsModelOpen(false);
                      }
                      return next;
                    });
                  }}
                  className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200',
                    isFeatureOpen && 'ring-2 ring-blue-500 border-blue-500'
                  )}
                >
                  <span
                    className={cn(
                      'truncate text-left',
                      featureColumns.length === 0 && 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {featureColumns.length === 0
                      ? t('forecast_step2_feature_columns_select')
                      : featureColumns.length === 1
                        ? featureColumns[0]
                        : `${featureColumns.length} ${t('forecast_step2_feature_columns_selected')}`}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 opacity-50 transition-transform duration-200',
                      isFeatureOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isFeatureOpen && (
                  <div className="absolute z-[9999] mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95">
                    <div className="p-1 space-y-1">
                      {availableFeatureColumns.map(header => {
                        const isChecked = featureColumns.includes(header.name);
                        return (
                          <div
                            key={header.name}
                            className={cn(
                              'relative flex cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-all duration-150',
                              isChecked
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 shadow-sm'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 hover:shadow-sm'
                            )}
                            onClick={e => {
                              e.stopPropagation();
                              handleFeatureColumnToggle(header.name);
                            }}
                            onMouseDown={e => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleFeatureColumnToggle(header.name)}
                              className="mr-3 cursor-pointer"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex items-center justify-between w-full min-w-0">
                              <span className="truncate">{header.name}</span>
                              <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {getTypeBadge(header.type)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Input
                id="featureColumns"
                placeholder={t('forecast_step2_feature_columns_no_available')}
                disabled
                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
              />
            )}
            {featureColumns.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {featureColumns.map(col => {
                  const header = datasetHeadersWithTypes.find(h => h.name === col);
                  return (
                    <div
                      key={col}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      <span className="truncate max-w-[120px]">{col}</span>
                      {header && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 opacity-80">
                          {getTypeBadge(header.type)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleFeatureColumnToggle(col)}
                        className="ml-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                        aria-label={`Remove ${col}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="modelType"
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t('forecast_step2_model')}</span>
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('forecast_step2_model_desc')}
              </p>
              <SelectWithOpen
                value={modelType}
                onValueChange={(v: string) => setModelType(v as 'SVR' | 'LSTM')}
                open={isModelOpen}
                onOpenChange={(open: boolean) => {
                  setIsModelOpen(open);
                  if (open) {
                    setIsTargetOpen(false);
                    setIsFeatureOpen(false);
                  }
                }}
              >
                <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800">
                  <SelectValue placeholder={t('forecast_step2_model_select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LSTM">{t('forecast_step2_model_lstm')}</SelectItem>
                  <SelectItem value="SVR">{t('forecast_step2_model_svr')}</SelectItem>
                </SelectContent>
              </SelectWithOpen>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {modelType === 'LSTM' ? (
                  <>
                    <p>• {t('forecast_step2_model_lstm_desc1')}</p>
                    <p>• {t('forecast_step2_model_lstm_desc2')}</p>
                  </>
                ) : (
                  <>
                    <p>• {t('forecast_step2_model_svr_desc1')}</p>
                    <p>• {t('forecast_step2_model_svr_desc2')}</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="forecastWindow"
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t('forecast_step2_forecast_window')}</span>
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('forecast_step2_forecast_window_desc')}
              </p>
              <div className="space-y-2">
                <Select
                  value={isCustomForecastWindow ? 'custom' : forecastWindow.toString()}
                  onValueChange={value => {
                    if (value === 'custom') {
                      setIsCustomForecastWindow(true);
                      setCustomForecastWindowValue(forecastWindow.toString());
                    } else {
                      setIsCustomForecastWindow(false);
                      setForecastWindow(parseInt(value, 10));
                    }
                  }}
                >
                  <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800">
                    <SelectValue placeholder={t('forecast_step2_forecast_window_select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {t('forecast_step2_forecast_window_steps')}</SelectItem>
                    <SelectItem value="10">
                      10 {t('forecast_step2_forecast_window_steps')}
                    </SelectItem>
                    <SelectItem value="15">
                      15 {t('forecast_step2_forecast_window_steps')}
                    </SelectItem>
                    <SelectItem value="20">
                      20 {t('forecast_step2_forecast_window_steps')}
                    </SelectItem>
                    <SelectItem value="custom">
                      {t('forecast_step2_forecast_window_custom')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isCustomForecastWindow && (
                  <Input
                    id="forecastWindowCustom"
                    type="number"
                    min="1"
                    max="50"
                    value={customForecastWindowValue}
                    onChange={e => {
                      const val = e.target.value;
                      setCustomForecastWindowValue(val);
                      const numVal = parseInt(val, 10);
                      if (!Number.isNaN(numVal) && numVal > 0) {
                        if (numVal <= 50) {
                          setForecastWindow(numVal);
                        } else {
                          // If exceeds max, set to max
                          setForecastWindow(50);
                          setCustomForecastWindowValue('50');
                        }
                      } else if (val === '') {
                        // Allow empty input while typing
                        setCustomForecastWindowValue('');
                      }
                    }}
                    onBlur={e => {
                      const val = parseInt(e.target.value, 10);
                      if (Number.isNaN(val) || val <= 0) {
                        setCustomForecastWindowValue('5');
                        setForecastWindow(5);
                      } else if (val > 50) {
                        setCustomForecastWindowValue('50');
                        setForecastWindow(50);
                      }
                    }}
                    className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
                    placeholder={t('forecast_step2_forecast_window_custom_placeholder')}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Analyze after forecast toggle (simple checkbox) */}
          <div className="mt-2 flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 px-4 py-3">
            <Checkbox
              id="runAnalysisAfterForecast"
              checked={runAnalysisAfterForecast}
              onCheckedChange={val => setRunAnalysisAfterForecast(!!val)}
              className="mt-0.5 cursor-pointer"
            />
            <div className="cursor-default">
              <Label
                htmlFor="runAnalysisAfterForecast"
                className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
              >
                {t('forecast_step2_analyze_after')}
              </Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('forecast_step2_analyze_after_desc')}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('forecast_step2_back')}
              </Button>
            </div>
            <Button
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {t('forecast_step2_generate')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </SlideInUp>
  );
};

export default Step2ConfigureSettings;
