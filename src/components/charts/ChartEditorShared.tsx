import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  TrendingUp,
  Maximize2,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Settings,
  Database,
  Edit3,
  Table,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sizePresets } from '@/types/chart';
import type { FormatterConfig, ChartDataPoint } from '@/types/chart';

// Size preset buttons component
interface SizePresetButtonsProps {
  onApplyPreset: (presetKey: keyof typeof sizePresets) => void;
}

export const SizePresetButtons: React.FC<SizePresetButtonsProps> = ({ onApplyPreset }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {Object.entries(sizePresets).map(([key, preset]) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className="text-xs h-9 flex items-center justify-center gap-1 px-2 min-w-0 truncate"
          onClick={() => onApplyPreset(key as keyof typeof sizePresets)}
          title={`${preset.width} × ${preset.height}`}
        >
          <Maximize2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {t(preset.labelKey, preset.label || key.charAt(0).toUpperCase() + key.slice(1))}
          </span>
        </Button>
      ))}
    </div>
  );
};

// Collapsible section header
interface CollapsibleSectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const CollapsibleSectionHeader: React.FC<CollapsibleSectionHeaderProps> = ({
  title,
  icon,
  isCollapsed,
  onToggle,
  children,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer select-none p-3 hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-sm">{title}</span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 transition-transform" />
          ) : (
            <ChevronUp className="w-4 h-4 transition-transform" />
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-0 pb-3 px-3">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </CardContent>
      )}
    </Card>
  );
};

// Formatter section component
interface FormatterSectionProps {
  formatters: FormatterConfig;
  onUpdateFormatters: (updates: Partial<FormatterConfig>) => void;
}

export const FormatterSection: React.FC<FormatterSectionProps> = ({
  formatters,
  onUpdateFormatters,
}) => {
  const { t } = useTranslation();

  const formatterTypeOptions = [
    { value: 'currency', label: t('chart_editor_formatter_currency') },
    { value: 'percentage', label: t('chart_editor_formatter_percentage') },
    { value: 'number', label: t('chart_editor_formatter_number') },
    { value: 'decimal', label: t('chart_editor_formatter_decimal') },
    { value: 'scientific', label: t('chart_editor_formatter_scientific') },
    { value: 'bytes', label: t('chart_editor_formatter_bytes') },
    { value: 'duration', label: t('chart_editor_formatter_duration') },
    { value: 'date', label: t('chart_editor_formatter_date') },
    { value: 'custom', label: t('chart_editor_formatter_custom') },
  ];

  return (
    <div className="space-y-4">
      {/* Y-Axis Formatter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formatters.useYFormatter}
            onCheckedChange={checked => onUpdateFormatters({ useYFormatter: checked as boolean })}
          />
          <Label className="text-sm font-medium">{t('chart_editor_use_y_formatter')}</Label>
        </div>

        {formatters.useYFormatter && (
          <div className="ml-6 space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t('chart_editor_y_formatter_type')}
            </Label>
            <select
              value={formatters.yFormatterType}
              onChange={e =>
                onUpdateFormatters({
                  yFormatterType: e.target.value as FormatterConfig['yFormatterType'],
                })
              }
              className="w-full p-2 text-sm border rounded-md bg-background"
            >
              {formatterTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {formatters.yFormatterType === 'custom' && (
              <Input
                placeholder={t('chart_editor_custom_formatter_placeholder')}
                value={formatters.customYFormatter}
                onChange={e => onUpdateFormatters({ customYFormatter: e.target.value })}
                className="text-sm"
              />
            )}
          </div>
        )}
      </div>

      {/* X-Axis Formatter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formatters.useXFormatter}
            onCheckedChange={checked => onUpdateFormatters({ useXFormatter: checked as boolean })}
          />
          <Label className="text-sm font-medium">{t('chart_editor_use_x_formatter')}</Label>
        </div>

        {formatters.useXFormatter && (
          <div className="ml-6 space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t('chart_editor_x_formatter_type')}
            </Label>
            <select
              value={formatters.xFormatterType}
              onChange={e =>
                onUpdateFormatters({
                  xFormatterType: e.target.value as FormatterConfig['xFormatterType'],
                })
              }
              className="w-full p-2 text-sm border rounded-md bg-background"
            >
              {formatterTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {formatters.xFormatterType === 'custom' && (
              <Input
                placeholder={t('chart_editor_custom_formatter_placeholder')}
                value={formatters.customXFormatter}
                onChange={e => onUpdateFormatters({ customXFormatter: e.target.value })}
                className="text-sm"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Color picker component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
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
};

// Series management component
interface SeriesManagementProps {
  series: Array<{
    id: string;
    name: string;
    dataColumn: string;
    color: string;
    visible: boolean;
  }>;
  onUpdateSeries: (
    seriesId: string,
    updates: Partial<{
      name: string;
      dataColumn: string;
      color: string;
      visible: boolean;
    }>
  ) => void;
  onAddSeries: () => void;
  onRemoveSeries: (seriesId: string) => void;
  onMoveSeriesUp: (seriesId: string) => void;
  onMoveSeriesDown: (seriesId: string) => void;
  availableColumns: string[];
  getAvailableColumnsForSeries?: (seriesId: string) => string[];
  validationErrors?: {
    seriesNames: Record<string, boolean>;
  };
}

export const SeriesManagement: React.FC<SeriesManagementProps> = ({
  series,
  onUpdateSeries,
  onAddSeries,
  onRemoveSeries,
  onMoveSeriesUp,
  onMoveSeriesDown,
  availableColumns,
  getAvailableColumnsForSeries,
}) => {
  // I18N setup
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {series.map((seriesItem, index) => (
        <motion.div
          key={seriesItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Content Container */}
          <div className="relative p-4 space-y-4">
            {/* Series Header with Enhanced Design */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Enhanced Color Indicator */}
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-lg transition-transform duration-200 hover:scale-110"
                    style={{
                      backgroundColor: seriesItem.color,
                      boxShadow: `0 0 0 2px ${seriesItem.color}40`,
                    }}
                  />
                  {/* Pulse effect for active series */}
                  {seriesItem.visible && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: seriesItem.color }}
                    />
                  )}
                </div>

                {/* Series Name with Typography */}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground/90 truncate">
                    {seriesItem.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('chart_editor_series')} #{index + 1}
                  </span>
                </div>
              </div>

              {/* Action Buttons with Modern Design */}
              <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSeries(seriesItem.id, { visible: !seriesItem.visible })}
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

                {/* Move Up Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveSeriesUp(seriesItem.id)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>

                {/* Move Down Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveSeriesDown(seriesItem.id)}
                  disabled={index === series.length - 1}
                  className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>

                {/* Remove Button with Confirmation */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSeries(seriesItem.id)}
                  disabled={series.length <= 1}
                  className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Form Fields with Enhanced Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Series Name Field - Read Only, synced with Data Column */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {/* {t('chart_editor_series_name')} */}
                  Chart Editor Series Name
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    value={seriesItem.dataColumn} // Use dataColumn as the display name
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

              {/* Data Column Field */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {/* {t('chart_editor_data_column')} */}
                  Chart Editor Data Column
                </Label>
                <select
                  value={seriesItem.dataColumn}
                  onChange={e => {
                    const newDataColumn = e.target.value;
                    // Auto update name to match data column
                    onUpdateSeries(seriesItem.id, {
                      dataColumn: newDataColumn,
                      name: newDataColumn, // Sync name with data column
                    });
                  }}
                  className="w-full p-2 text-sm border-0 rounded-lg bg-background/60 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-9"
                >
                  {/* Current column - always show the current selection */}
                  <option value={seriesItem.dataColumn}>{seriesItem.dataColumn}</option>
                  {/* Available columns - use specific function if provided, otherwise use general available columns */}
                  {(getAvailableColumnsForSeries
                    ? getAvailableColumnsForSeries(seriesItem.id).filter(
                        col => col !== seriesItem.dataColumn
                      )
                    : availableColumns
                  ).map(column => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Picker in Dedicated Section */}
            <div className="pt-2 border-t border-border/30">
              <ColorPicker
                label={t('chart_editor_series_color')}
                value={seriesItem.color}
                onChange={color => onUpdateSeries(seriesItem.id, { color })}
              />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Enhanced Add Series Button */}
      {availableColumns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: series.length * 0.1 + 0.2 }}
        >
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
              {/* <span className="text-primary">{t('chart_editor_add_series')}</span> */}
              <span className="text-primary">Chart Editor Series</span>
            </div>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Config management dropdown
interface ConfigManagementDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onExportConfig: () => void;
  onImportConfig: () => void;
  onResetConfig: () => void;
}

export const ConfigManagementDropdown: React.FC<ConfigManagementDropdownProps> = ({
  isOpen,
  onExportConfig,
  onImportConfig,
  onResetConfig,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50"
    >
      <div className="p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportConfig}
          className="w-full justify-start h-8 text-xs"
        >
          <Download className="w-3 h-3 mr-2" />
          {t('chart_editor_export_config')}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onImportConfig}
          className="w-full justify-start h-8 text-xs"
        >
          <Upload className="w-3 h-3 mr-2" />
          {t('chart_editor_import_config')}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onResetConfig}
          className="w-full justify-start h-8 text-xs text-destructive hover:text-destructive"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          {t('chart_editor_reset_config')}
        </Button>
      </div>
    </motion.div>
  );
};

// Basic Settings Section component
interface BasicSettingsSectionProps {
  config: {
    width: number;
    height: number;
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    title: string;
  };
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateConfig: (updates: Partial<BasicSettingsSectionProps['config']>) => void;
  onApplySizePreset: (presetKey: keyof typeof sizePresets) => void;
  validationErrors?: {
    title: boolean;
  };
}

export const BasicSettingsSection: React.FC<BasicSettingsSectionProps> = ({
  config,
  isCollapsed,
  onToggleCollapse,
  onUpdateConfig,
  onApplySizePreset,
  validationErrors,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('lineChart_editor_basicSettings')}
          </h3>
          <div className="flex items-center gap-2">
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Size Presets */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('lineChart_editor_sizePresets')}
            </Label>
            <SizePresetButtons onApplyPreset={onApplySizePreset} />
          </div>

          {/* Custom Width and Height */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('lineChart_editor_customSize')}
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  {t('lineChart_editor_width')}
                </Label>
                <Input
                  type="number"
                  value={config.width}
                  onChange={e => {
                    const newWidth = parseInt(e.target.value);
                    if (!isNaN(newWidth) && newWidth > 0) {
                      onUpdateConfig({ width: newWidth });
                    }
                  }}
                  className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="1"
                  step="10"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  {t('lineChart_editor_height')}
                </Label>
                <Input
                  type="number"
                  value={config.height}
                  onChange={e => {
                    const newHeight = parseInt(e.target.value);
                    if (!isNaN(newHeight) && newHeight > 0) {
                      onUpdateConfig({ height: newHeight });
                    }
                  }}
                  className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="1"
                  step="10"
                />
              </div>
            </div>
            <div className="text-center mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {t('lineChart_editor_currentSize')}: {config.width} × {config.height}px |{' '}
                {t('lineChart_editor_ratio')}: {(config.width / config.height).toFixed(2)}:1
              </p>
            </div>
          </div>

          {/* Padding Configuration */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('lineChart_editor_padding')}
            </Label>
            <div className="mt-2">
              {/* Visual Padding Editor */}
              <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {/* Top */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Input
                    type="number"
                    value={config.margin.top}
                    onChange={e => {
                      const newTop = parseInt(e.target.value) || 0;
                      onUpdateConfig({
                        margin: { ...config.margin, top: Math.max(0, newTop) },
                      });
                    }}
                    className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="0"
                  />
                </div>

                {/* Left */}
                <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Input
                    type="number"
                    value={config.margin.left}
                    onChange={e => {
                      const newLeft = parseInt(e.target.value) || 0;
                      onUpdateConfig({
                        margin: { ...config.margin, left: Math.max(0, newLeft) },
                      });
                    }}
                    className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="0"
                  />
                </div>

                {/* Right */}
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <Input
                    type="number"
                    value={config.margin.right}
                    onChange={e => {
                      const newRight = parseInt(e.target.value) || 0;
                      onUpdateConfig({
                        margin: { ...config.margin, right: Math.max(0, newRight) },
                      });
                    }}
                    className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="0"
                  />
                </div>

                {/* Bottom */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <Input
                    type="number"
                    value={config.margin.bottom}
                    onChange={e => {
                      const newBottom = parseInt(e.target.value) || 0;
                      onUpdateConfig({
                        margin: { ...config.margin, bottom: Math.max(0, newBottom) },
                      });
                    }}
                    className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="0"
                  />
                </div>

                {/* Center Chart Area Representation */}
                <div className="bg-white dark:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded h-20 flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('lineChart_editor_chartArea')}
                  </span>
                </div>
              </div>

              {/* Padding Values Display */}
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('lineChart_editor_top')}:
                    </span>
                    <div className="font-mono">{config.margin.top}px</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('lineChart_editor_right')}:
                    </span>
                    <div className="font-mono">{config.margin.right}px</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('lineChart_editor_bottom')}:
                    </span>
                    <div className="font-mono">{config.margin.bottom}px</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('lineChart_editor_left')}:
                    </span>
                    <div className="font-mono">{config.margin.left}px</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Title */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('lineChart_editor_title_chart')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                value={config.title}
                onChange={e => onUpdateConfig({ title: e.target.value })}
                placeholder={t('chart_title_required', 'Chart title is required')}
                className={`mt-1 ${
                  validationErrors?.title
                    ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500 ring-1 ring-red-500'
                    : ''
                }`}
              />
              {validationErrors?.title && (
                <span className="text-red-500 text-xs">
                  {t('field_required', 'This field is required')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Chart Settings Section Component
interface ChartSettingsConfig {
  xAxisLabel: string;
  yAxisLabel: string;
  animationDuration: number;
  showLegend: boolean;
  showGrid: boolean;
  gridOpacity: number;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  showTooltip: boolean;
  enableZoom: boolean;
  enablePan?: boolean;
  zoomExtent?: number;
  theme: 'light' | 'dark' | 'auto';
  backgroundColor: string;
  titleFontSize: number;
  labelFontSize: number;
  legendFontSize: number;
  showPointValues?: boolean; // Show values on data points (line chart specific)
}

interface ChartSettingsProps {
  config: ChartSettingsConfig;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateConfig: (updates: Partial<ChartSettingsConfig>) => void;
  onUpdateChartSpecific: (updates: Record<string, unknown>) => void;

  // Chart type specific props
  chartType: 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'trend' | 'map' | 'table';

  // Line chart specific
  curveType?: string;
  curveOptions?: Record<string, unknown>;
  showPoints?: boolean;
  lineWidth?: number;
  pointRadius?: number;

  // Bar chart specific
  barType?: 'grouped' | 'stacked';
  barWidth?: number;
  barSpacing?: number;

  // Validation props
  validationErrors?: {
    xAxisLabel?: boolean;
    yAxisLabel?: boolean;
  };
}

export const ChartSettingsSection: React.FC<ChartSettingsProps> = ({
  config,
  isCollapsed,
  onToggleCollapse,
  onUpdateConfig,
  onUpdateChartSpecific,
  chartType,
  curveType,
  curveOptions,
  showPoints,
  lineWidth,
  pointRadius,
  barType,
  barWidth,
  barSpacing,
  validationErrors,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('chart_editor_chart_settings')}
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
          {/* Axis Labels */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('chart_editor_x_axis_label')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  value={config.xAxisLabel}
                  onChange={e => onUpdateConfig({ xAxisLabel: e.target.value })}
                  placeholder={t('x_axis_label_required', 'X-axis label is required')}
                  className={`mt-1 ${
                    validationErrors?.xAxisLabel
                      ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500 ring-1 ring-red-500'
                      : ''
                  }`}
                />
                {validationErrors?.xAxisLabel && (
                  <span className="text-red-500 text-xs">
                    {t('field_required', 'This field is required')}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('chart_editor_y_axis_label')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  value={config.yAxisLabel}
                  onChange={e => onUpdateConfig({ yAxisLabel: e.target.value })}
                  placeholder={t('y_axis_label_required', 'Y-axis label is required')}
                  className={`mt-1 ${
                    validationErrors?.yAxisLabel
                      ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500 ring-1 ring-red-500'
                      : ''
                  }`}
                />
                {validationErrors?.yAxisLabel && (
                  <span className="text-red-500 text-xs">
                    {t('field_required', 'This field is required')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Animation Duration */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_animation_duration')}
            </Label>
            <Input
              type="number"
              value={config.animationDuration}
              onChange={e =>
                onUpdateConfig({ animationDuration: parseInt(e.target.value) || 1000 })
              }
              className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          {/* Curve type setting moved to CurveTypeSetting component */}

          {/* Bar Chart Specific: Bar Type */}
          {chartType === 'bar' && (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('chart_editor_bar_type')}
                </Label>
                <select
                  value={barType}
                  onChange={e =>
                    onUpdateChartSpecific({ barType: e.target.value as 'grouped' | 'stacked' })
                  }
                  className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="grouped">{t('chart_editor_grouped')}</option>
                  <option value="stacked">{t('chart_editor_stacked')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_bar_width')}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={barWidth}
                    onChange={e =>
                      onUpdateChartSpecific({ barWidth: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_bar_spacing')}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={barSpacing}
                    onChange={e =>
                      onUpdateChartSpecific({ barSpacing: parseInt(e.target.value) || 4 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Display Options */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_display_options')}
            </Label>
            <div className="flex items-center space-x-2 mt-1 mb-1">
              <Checkbox
                id="showLegend"
                checked={config.showLegend}
                onCheckedChange={checked => onUpdateConfig({ showLegend: !!checked })}
              />
              <Label
                htmlFor="showLegend"
                className="text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {t('chart_editor_show_legend')}
              </Label>
            </div>

            <div className="flex items-center space-x-2 mb-1">
              <Checkbox
                id="showGrid"
                checked={config.showGrid}
                onCheckedChange={checked => onUpdateConfig({ showGrid: !!checked })}
              />
              <Label
                htmlFor="showGrid"
                className="text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {t('chart_editor_show_grid')}
              </Label>
            </div>

            {/* Line Chart Specific: Show Points (Area chart no longer needs points toggle) */}
            {chartType === 'line' && (
              <>
                <div className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id="showPoints"
                    checked={showPoints}
                    onCheckedChange={checked => onUpdateChartSpecific({ showPoints: !!checked })}
                  />
                  <Label
                    htmlFor="showPoints"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {t('chart_editor_show_points')}
                  </Label>
                </div>

                {/* Show Point Values - only show if points are enabled */}
                {showPoints && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Checkbox
                      id="showPointValues"
                      checked={config.showPointValues}
                      onCheckedChange={checked =>
                        onUpdateChartSpecific({ showPointValues: !!checked })
                      }
                    />
                    <Label
                      htmlFor="showPointValues"
                      className="text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      {t('chart_editor_show_point_values')}
                    </Label>
                  </div>
                )}
              </>
            )}

            {/* Styling Configuration */}
            {chartType === 'line' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  {t('chart_editor_styling')}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('chart_editor_line_width')}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={lineWidth}
                      onChange={e =>
                        onUpdateChartSpecific({ lineWidth: parseInt(e.target.value) || 2 })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('chart_editor_point_radius')}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={pointRadius}
                      onChange={e =>
                        onUpdateChartSpecific({ pointRadius: parseInt(e.target.value) || 4 })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Chart Configuration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                {t('chart_editor_chart_settings')}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_grid_opacity')}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.gridOpacity}
                    onChange={e =>
                      onUpdateConfig({ gridOpacity: parseFloat(e.target.value) || 0.3 })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_legend_position')}
                  </Label>
                  <select
                    value={config.legendPosition}
                    onChange={e =>
                      onUpdateConfig({
                        legendPosition: e.target.value as 'top' | 'bottom' | 'left' | 'right',
                      })
                    }
                    className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="top">{t('chart_editor_top')}</option>
                    <option value="bottom">{t('chart_editor_bottom')}</option>
                    <option value="left">{t('chart_editor_left')}</option>
                    <option value="right">{t('chart_editor_right')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Configuration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                {t('chart_editor_interactive_options')}
              </h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showTooltip"
                    checked={config.showTooltip}
                    onCheckedChange={checked => onUpdateConfig({ showTooltip: !!checked })}
                  />
                  <Label
                    htmlFor="showTooltip"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {t('chart_editor_show_tooltip')}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableZoom"
                    checked={config.enableZoom}
                    onCheckedChange={checked => onUpdateConfig({ enableZoom: !!checked })}
                  />
                  <Label
                    htmlFor="enableZoom"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {t('chart_editor_enable_zoom')}
                  </Label>
                </div>

                {config.enablePan !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enablePan"
                      checked={config.enablePan}
                      onCheckedChange={checked => onUpdateConfig({ enablePan: !!checked })}
                    />
                    <Label
                      htmlFor="enablePan"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {t('chart_editor_enable_pan')}
                    </Label>
                  </div>
                )}

                {config.zoomExtent !== undefined && (
                  <div className="ml-4 space-y-2">
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400">
                        {t('chart_editor_zoom_extent')}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        step="0.5"
                        value={config.zoomExtent}
                        onChange={e =>
                          onUpdateConfig({ zoomExtent: parseFloat(e.target.value) || 8 })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Configuration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                {t('chart_editor_theme_colors')}
              </h4>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_theme')}
                  </Label>
                  <select
                    value={config.theme}
                    onChange={e =>
                      onUpdateConfig({ theme: e.target.value as 'light' | 'dark' | 'auto' })
                    }
                    className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="auto">{t('chart_editor_auto')}</option>
                    <option value="light">{t('chart_editor_light')}</option>
                    <option value="dark">{t('chart_editor_dark')}</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_background_color')}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={
                        config.backgroundColor === 'transparent'
                          ? '#ffffff'
                          : config.backgroundColor
                      }
                      onChange={e => onUpdateConfig({ backgroundColor: e.target.value })}
                      className="h-10 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateConfig({ backgroundColor: 'transparent' })}
                      className="px-3 h-10 text-xs"
                      title={t('chart_editor_reset_to_transparent')}
                    >
                      {t('chart_editor_transparent')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Font Size Configuration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                {t('chart_editor_font_sizes')}
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_title_size')}
                  </Label>
                  <Input
                    type="number"
                    min="8"
                    max="36"
                    value={config.titleFontSize}
                    onChange={e =>
                      onUpdateConfig({ titleFontSize: parseInt(e.target.value) || 16 })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_label_size')}
                  </Label>
                  <Input
                    type="number"
                    min="6"
                    max="24"
                    value={config.labelFontSize}
                    onChange={e =>
                      onUpdateConfig({ labelFontSize: parseInt(e.target.value) || 12 })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chart_editor_legend_size')}
                  </Label>
                  <Input
                    type="number"
                    min="6"
                    max="20"
                    value={config.legendFontSize}
                    onChange={e =>
                      onUpdateConfig({ legendFontSize: parseInt(e.target.value) || 11 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// ========== AXIS CONFIGURATION SECTION ==========

interface AxisConfigurationConfig {
  xAxisKey: string;
  xAxisStart: 'auto' | 'zero';
  yAxisStart: 'auto' | 'zero';
  showAxisLabels: boolean;
  showAxisTicks: boolean;
  xAxisRotation: number;
  yAxisRotation: number;
}

interface AxisConfigurationProps {
  config: AxisConfigurationConfig;
  data: Record<string, unknown>[];
  formatters: FormatterConfig;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateConfig: (updates: Partial<AxisConfigurationConfig>) => void;
  onUpdateFormatters: (updates: Partial<FormatterConfig>) => void;
  validationErrors?: {
    xAxisLabel: boolean;
    yAxisLabel: boolean;
  };
}

export const AxisConfigurationSection: React.FC<AxisConfigurationProps> = ({
  config,
  data,
  formatters,
  isCollapsed,
  onToggleCollapse,
  onUpdateConfig,
  onUpdateFormatters,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            {t('chart_editor_axis_configuration')}
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
          {/* X-Axis Column Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('lineChart_editor_xAxisColumn')}
            </Label>
            <select
              value={config.xAxisKey}
              onChange={e => onUpdateConfig({ xAxisKey: e.target.value })}
              className="mt-1 w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {Object.keys(data[0] || {}).map(column => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {/* X-Axis Start Configuration */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('x_axis_start')}
            </Label>
            <div className="space-y-2 mt-2">
              <select
                value={typeof config.xAxisStart === 'number' ? 'auto' : config.xAxisStart}
                onChange={e => {
                  onUpdateConfig({ xAxisStart: e.target.value as 'auto' | 'zero' });
                }}
                className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="auto">{t('lineChart_editor_axisAutoFromMin')}</option>
                <option value="zero">{t('lineChart_editor_axisZeroStart')}</option>
              </select>
            </div>
          </div>

          {/* Y-Axis Start Configuration */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('y_axis_start')}
            </Label>
            <div className="space-y-2 mt-2">
              <select
                value={typeof config.yAxisStart === 'number' ? 'auto' : config.yAxisStart}
                onChange={e => {
                  onUpdateConfig({ yAxisStart: e.target.value as 'auto' | 'zero' });
                }}
                className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="auto">{t('lineChart_editor_axisAutoFromMin')}</option>
                <option value="zero">{t('lineChart_editor_axisZeroStart')}</option>
              </select>
            </div>
          </div>

          {/* Preview of current axis settings */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{t('x_axis_start')}:</span>
                <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {config.xAxisStart === 'auto'
                    ? 'Auto (min data)'
                    : config.xAxisStart === 'zero'
                      ? 'From 0'
                      : `From ${config.xAxisStart}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('y_axis_start')}:</span>
                <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {config.yAxisStart === 'auto'
                    ? 'Auto (min data)'
                    : config.yAxisStart === 'zero'
                      ? 'From 0'
                      : `From ${config.yAxisStart}`}
                </span>
              </div>
              <div className="text-center mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
                <span className="text-blue-600 dark:text-blue-300 font-medium">
                  {t('lineChart_editor_chartWillUpdate')}
                </span>
              </div>
            </div>
          </div>

          {/* Axis Labels & Appearance */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              {t('lineChart_editor_axisLabelsAppearance')}
            </h4>

            <div className="space-y-4">
              {/* Show Axis Labels */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAxisLabels"
                  checked={config.showAxisLabels}
                  onCheckedChange={checked => onUpdateConfig({ showAxisLabels: !!checked })}
                />
                <Label
                  htmlFor="showAxisLabels"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {t('lineChart_editor_showAxisLabels')}
                </Label>
              </div>

              {/* Show Axis Ticks */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAxisTicks"
                  checked={config.showAxisTicks}
                  onCheckedChange={checked => onUpdateConfig({ showAxisTicks: !!checked })}
                />
                <Label
                  htmlFor="showAxisTicks"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {t('lineChart_editor_showAxisTicks')}
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* X-Axis Rotation */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('lineChart_editor_xAxisLabelRotation')}
                  </Label>
                  <Input
                    type="number"
                    min="-90"
                    max="90"
                    value={config.xAxisRotation}
                    onChange={e => onUpdateConfig({ xAxisRotation: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                {/* Y-Axis Rotation */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('lineChart_editor_xAxisLabelRotation')}
                  </Label>
                  <Input
                    type="number"
                    min="-90"
                    max="90"
                    value={config.yAxisRotation}
                    onChange={e => onUpdateConfig({ yAxisRotation: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formatters Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('lineChart_editor_formatters')}
            </h4>
            <div className="space-y-4">
              <FormatterSection formatters={formatters} onUpdateFormatters={onUpdateFormatters} />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
