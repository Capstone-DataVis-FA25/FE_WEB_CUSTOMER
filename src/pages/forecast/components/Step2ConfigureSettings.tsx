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
import { Calendar, BarChart3, Settings, ChevronLeft, Play, ChevronDown, X } from 'lucide-react';
import { getForecastWindowOptions } from '../utils/forecastWindowOptions';
import { cn } from '@/lib/utils';

interface Step2ConfigureSettingsProps {
  forecastName: string;
  setForecastName: (value: string) => void;
  datasetHeaders: string[];
  datasetHeadersWithTypes: Array<{ name: string; type: string }>;
  targetColumn: string;
  setTargetColumn: (value: string) => void;
  featureColumns: string[];
  setFeatureColumns: (value: string[]) => void;
  timeScale: string;
  setTimeScale: (value: string) => void;
  forecastWindow: number;
  setForecastWindow: (value: number) => void;
  isCustomForecastWindow: boolean;
  setIsCustomForecastWindow: (value: boolean) => void;
  customForecastWindow: string;
  setCustomForecastWindow: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const Step2ConfigureSettings: React.FC<Step2ConfigureSettingsProps> = ({
  forecastName,
  setForecastName,
  datasetHeaders,
  datasetHeadersWithTypes,
  targetColumn,
  setTargetColumn,
  featureColumns,
  setFeatureColumns,
  timeScale,
  setTimeScale,
  forecastWindow,
  setForecastWindow,
  isCustomForecastWindow,
  setIsCustomForecastWindow,
  customForecastWindow,
  setCustomForecastWindow,
  onBack,
  onNext,
}) => {
  const [isFeatureColumnsOpen, setIsFeatureColumnsOpen] = useState(false);
  const featureColumnsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featureColumnsRef.current && !featureColumnsRef.current.contains(event.target as Node)) {
        setIsFeatureColumnsOpen(false);
      }
    };

    if (isFeatureColumnsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFeatureColumnsOpen]);

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

  // Get available feature columns (exclude target column)
  const availableFeatureColumns = React.useMemo(() => {
    return datasetHeadersWithTypes.filter(header => header.name !== targetColumn);
  }, [datasetHeadersWithTypes, targetColumn]);

  // Get badge text for column type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'number':
        return '(number)';
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
      label: `${header} (number)`, // Format: "ColumnName (number)" for SelectValue to parse
    }));
  }, [datasetHeaders]);

  const handleForecastWindowChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomForecastWindow(true);
    } else {
      setIsCustomForecastWindow(false);
      setForecastWindow(parseInt(value));
      setCustomForecastWindow(value);
    }
  };

  return (
    <SlideInUp delay={0.2}>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Configure Settings
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Set up time scale and forecast parameters
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label
              htmlFor="forecastName"
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 block"
            >
              Forecast Name (Optional)
            </Label>
            <Input
              id="forecastName"
              placeholder="e.g., Q4 Sales Forecast"
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
              {forecastName.length}/70 characters
            </p>
          </div>

          <div>
            <Label
              htmlFor="targetColumn"
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 block"
            >
              Target Column
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              The target variable to be the focus of the forecast.
            </p>
            {datasetHeaders.length > 0 ? (
              <Select value={targetColumn} onValueChange={handleTargetColumnChange}>
                <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800">
                  <SelectValue placeholder="Select target column" options={targetColumnOptions} />
                </SelectTrigger>
                <SelectContent>
                  {targetColumn && (
                    <SelectItem value="">
                      <span className="text-gray-500 dark:text-gray-400">Clear selection</span>
                    </SelectItem>
                  )}
                  {datasetHeaders.map(header => (
                    <SelectItem key={header} value={header}>
                      <div className="flex items-center justify-between w-full">
                        <span>{header}</span>
                        <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                          (number)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="targetColumn"
                placeholder="e.g., Value, Sales, Temperature"
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
              Feature Columns (Optional)
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Select additional columns to use as features for the forecast.
            </p>
            {availableFeatureColumns.length > 0 ? (
              <div className="relative" ref={featureColumnsRef}>
                <button
                  type="button"
                  onClick={() => setIsFeatureColumnsOpen(!isFeatureColumnsOpen)}
                  className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200',
                    isFeatureColumnsOpen && 'ring-2 ring-blue-500 border-blue-500'
                  )}
                >
                  <span
                    className={cn(
                      'truncate text-left',
                      featureColumns.length === 0 && 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {featureColumns.length === 0
                      ? 'Select feature columns'
                      : featureColumns.length === 1
                        ? featureColumns[0]
                        : `${featureColumns.length} columns selected`}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 opacity-50 transition-transform duration-200',
                      isFeatureColumnsOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isFeatureColumnsOpen && (
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
                placeholder="No additional columns available"
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
                htmlFor="timeScale"
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Time Scale</span>
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                The time frequency between rows.
              </p>
              <Select value={timeScale} onValueChange={setTimeScale}>
                <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="forecastWindow"
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Forecast Window</span>
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Number of data points to forecast into the future.
              </p>
              {isCustomForecastWindow ? (
                <div className="space-y-2">
                  <Input
                    id="forecastWindow"
                    type="number"
                    min="1"
                    value={customForecastWindow}
                    onChange={e => {
                      setCustomForecastWindow(e.target.value);
                      setForecastWindow(parseInt(e.target.value) || 30);
                    }}
                    className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
                    placeholder="Enter custom value"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCustomForecastWindow(false);
                      const options = getForecastWindowOptions(timeScale);
                      if (options.length > 0) {
                        setForecastWindow(parseInt(options[0].value));
                        setCustomForecastWindow(options[0].value);
                      }
                    }}
                    className="w-full text-xs"
                  >
                    Use Preset Options
                  </Button>
                </div>
              ) : (
                <Select
                  value={isCustomForecastWindow ? 'custom' : forecastWindow.toString()}
                  onValueChange={handleForecastWindowChange}
                >
                  <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800">
                    <SelectValue
                      placeholder="Select forecast window"
                      options={[
                        ...getForecastWindowOptions(timeScale),
                        { value: 'custom', label: `Custom (${customForecastWindow})` },
                      ]}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getForecastWindowOptions(timeScale).map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
            >
              Generate Forecast
              <Play className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </SlideInUp>
  );
};

export default Step2ConfigureSettings;
