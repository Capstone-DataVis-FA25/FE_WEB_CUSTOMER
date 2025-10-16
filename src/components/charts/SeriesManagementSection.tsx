import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { useDataset } from '@/features/dataset/useDataset';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

// ColorPicker from ChartEditorShared
const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-2">
    <Label className="text-xs text-muted-foreground min-w-0 flex-1">{label}</Label>
    <div className="flex items-center gap-1">
      <div
        className="w-6 h-6 rounded border border-border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = value;
          input.onchange = e => onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
      />
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-20 h-6 text-xs px-1"
        placeholder="#000000"
      />
    </div>
  </div>
);

const SeriesManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig, handleConfigChange } = useChartEditor();
  const { currentDataset } = useDataset();

  if (!chartConfig) return null;

  // Check if dataset is available
  const hasDataset = currentDataset && currentDataset.id;

  // Series array from config
  // Type for series items
  type SeriesItem = {
    id: string;
    name: string;
    dataColumn: string;
    color: string;
    visible: boolean;
  };

  // Safely get series array from config - should be at chartConfig.seriesConfigs (root level)
  const series: SeriesItem[] = Array.isArray(chartConfig.seriesConfigs)
    ? (chartConfig.seriesConfigs as SeriesItem[])
    : [];

  console.log('🔍 SeriesManagementSection - series:', series);
  console.log('🔍 SeriesManagementSection - chartConfig.seriesConfigs:', chartConfig.seriesConfigs);

  // DataHeaders from dataset (id, name)
  const dataHeaders = currentDataset?.headers || [];
  // Available columns: DataHeader IDs
  const availableColumns = dataHeaders.map(h => h.id);

  // Helper: get DataHeader name by ID
  const getHeaderName = (id: string) => dataHeaders.find(h => h.id === id)?.name || id;

  // Handlers
  const onUpdateSeries = (seriesId: string, updates: Partial<SeriesItem>) => {
    // Always send dataColumn as ID, but show name in UI
    const newSeries = series.map((s: SeriesItem) =>
      s.id === seriesId
        ? {
            ...s,
            ...updates,
            dataColumn: updates.dataColumn || s.dataColumn,
            name: getHeaderName(updates.dataColumn || s.dataColumn),
          }
        : s
    );
    // Update at root level: seriesConfigs
    handleConfigChange({
      seriesConfigs: newSeries,
    } as any);
  };

  const onAddSeries = () => {
    // Add new series with first available column
    const firstCol = availableColumns[0];
    const newSeries = [
      ...series,
      {
        id: `series_${Date.now()}`,
        name: getHeaderName(firstCol),
        dataColumn: firstCol,
        color: '#1976d2',
        visible: true,
      },
    ];
    // Update at root level: seriesConfigs
    handleConfigChange({
      seriesConfigs: newSeries,
    } as any);
  };

  const onRemoveSeries = (seriesId: string) => {
    const newSeries = series.filter((s: SeriesItem) => s.id !== seriesId);
    // Update at root level: seriesConfigs
    handleConfigChange({
      seriesConfigs: newSeries,
    } as any);
  };

  const onMoveSeriesUp = (seriesId: string) => {
    const idx = series.findIndex((s: SeriesItem) => s.id === seriesId);
    if (idx > 0) {
      const newSeries = [...series];
      [newSeries[idx - 1], newSeries[idx]] = [newSeries[idx], newSeries[idx - 1]];
      // Update at root level: seriesConfigs
      handleConfigChange({
        seriesConfigs: newSeries,
      } as any);
    }
  };

  const onMoveSeriesDown = (seriesId: string) => {
    const idx = series.findIndex((s: SeriesItem) => s.id === seriesId);
    if (idx < series.length - 1) {
      const newSeries = [...series];
      [newSeries[idx], newSeries[idx + 1]] = [newSeries[idx + 1], newSeries[idx]];
      // Update at root level: seriesConfigs
      handleConfigChange({
        seriesConfigs: newSeries,
      } as any);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl select-none">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('chart_editor_seriesManagement', 'Series Management')}
          </h3>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Show warning if no dataset */}
          {!hasDataset && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    {t('no_dataset_selected', 'No Dataset Selected')}
                  </h4>
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    {t(
                      'please_select_dataset_to_add_series',
                      'Please select a dataset first to add and manage series.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {series.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t('no_series', 'No series yet.')}
            </div>
          ) : (
            <div className="space-y-4">
              {series.map((seriesItem: SeriesItem, index: number) => (
                <div
                  key={seriesItem.id}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-lg transition-transform duration-200 hover:scale-110"
                            style={{
                              backgroundColor: seriesItem.color,
                              boxShadow: `0 0 0 2px ${seriesItem.color}40`,
                            }}
                          />
                          {seriesItem.visible && (
                            <div
                              className="absolute inset-0 rounded-full animate-ping opacity-20"
                              style={{ backgroundColor: seriesItem.color }}
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground/90 truncate">
                            {seriesItem.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t('chart_editor_series')} #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onUpdateSeries(seriesItem.id, { visible: !seriesItem.visible })
                          }
                          className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                            seriesItem.visible
                              ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {seriesItem.visible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMoveSeriesUp(seriesItem.id)}
                          disabled={index === 0}
                          className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMoveSeriesDown(seriesItem.id)}
                          disabled={index === series.length - 1}
                          className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveSeries(seriesItem.id)}
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('chart_editor_series_name', 'Series Name')}
                        </Label>
                        <div className="flex flex-col gap-1">
                          <Input
                            value={seriesItem.name}
                            readOnly
                            disabled
                            className="text-sm h-9 border-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                            placeholder={t(
                              'chart_editor_series_name_auto',
                              'Auto generated from data column'
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('chart_editor_data_column', 'Data Column')}
                        </Label>
                        <select
                          value={seriesItem.dataColumn}
                          onChange={e => {
                            const newDataColumn = e.target.value;
                            onUpdateSeries(seriesItem.id, {
                              dataColumn: newDataColumn,
                              name: getHeaderName(newDataColumn),
                            });
                          }}
                          className="w-full p-2 text-sm border-0 rounded-lg bg-background/60 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-9"
                        >
                          {/* Current column - always show the current selection */}
                          <option value={seriesItem.dataColumn}>
                            {getHeaderName(seriesItem.dataColumn)}
                          </option>
                          {/* Available columns - show all except current */}
                          {availableColumns
                            .filter(col => col !== seriesItem.dataColumn)
                            .map(column => (
                              <option key={column} value={column}>
                                {getHeaderName(column)}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/30">
                      <ColorPicker
                        label={t('chart_editor_series_color', 'Series Color')}
                        value={seriesItem.color}
                        onChange={color => onUpdateSeries(seriesItem.id, { color })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Only show Add Series button if dataset is available */}
          {hasDataset && availableColumns.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddSeries}
              className="w-full h-12 text-sm font-medium border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 rounded-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-200">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <span className="text-primary">{t('chart_editor_add_series', 'Add Series')}</span>
              </div>
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SeriesManagementSection;
