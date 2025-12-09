import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';

const HistogramTypeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig || currentChartType !== ChartType.Histogram) return null;

  const cfg: any = chartConfig.config || {};

  const binMethod = cfg.binMethod || 'sturges';
  const binCount = cfg.binCount || 10;
  const binWidth = cfg.binWidth || 1;

  return (
    <div className="space-y-4">
      {/* Bin Method Selector */}
      <div className="space-y-2">
        <Label htmlFor="bin-method" className="text-sm text-gray-700 dark:text-gray-300">
          {t('bin_method', 'Binning Method')}
        </Label>
        <Select
          value={binMethod}
          onValueChange={value => handleConfigChange({ config: { binMethod: value } as any })}
        >
          <SelectTrigger id="bin-method">
            <SelectValue
              options={[
                { value: 'sturges', label: t('bin_method_sturges', "Sturges' Formula (Auto)") },
                { value: 'scott', label: t('bin_method_scott', "Scott's Rule") },
                { value: 'freedman-diaconis', label: t('bin_method_fd', 'Freedman-Diaconis') },
                { value: 'count', label: t('bin_method_count', 'Fixed Count') },
                { value: 'width', label: t('bin_method_width', 'Fixed Width') },
              ]}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sturges">
              {t('bin_method_sturges', "Sturges' Formula (Auto)")}
            </SelectItem>
            <SelectItem value="scott">{t('bin_method_scott', "Scott's Rule")}</SelectItem>
            <SelectItem value="freedman-diaconis">
              {t('bin_method_fd', 'Freedman-Diaconis')}
            </SelectItem>
            <SelectItem value="count">{t('bin_method_count', 'Fixed Count')}</SelectItem>
            <SelectItem value="width">{t('bin_method_width', 'Fixed Width')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {binMethod === 'sturges' &&
            t(
              'bin_method_sturges_desc',
              'Automatically calculates optimal bin count based on data size'
            )}
          {binMethod === 'scott' &&
            t('bin_method_scott_desc', 'Uses standard deviation to determine bin width')}
          {binMethod === 'freedman-diaconis' &&
            t('bin_method_fd_desc', 'Uses interquartile range for robust bin width calculation')}
          {binMethod === 'count' && t('bin_method_count_desc', 'Specify exact number of bins')}
          {binMethod === 'width' && t('bin_method_width_desc', 'Specify exact width of each bin')}
        </p>
      </div>

      {/* Bin Count (only for 'count' method) */}
      {binMethod === 'count' && (
        <div className="space-y-2">
          <Label htmlFor="bin-count" className="text-sm text-gray-700 dark:text-gray-300">
            {t('bin_count', 'Number of Bins')}
          </Label>
          <Input
            id="bin-count"
            type="number"
            min="1"
            max="100"
            value={binCount}
            onChange={e =>
              handleConfigChange({
                config: { binCount: parseInt(e.target.value) || 10 } as any,
              })
            }
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t(
              'bin_count_hint',
              'More bins = finer detail but noisier. Fewer bins = general trends but less detail (1-100)'
            )}
          </p>
        </div>
      )}

      {/* Bin Width (only for 'width' method) */}
      {binMethod === 'width' && (
        <div className="space-y-2">
          <Label htmlFor="bin-width" className="text-sm text-gray-700 dark:text-gray-300">
            {t('bin_width', 'Bin Width')}
          </Label>
          <Input
            id="bin-width"
            type="number"
            min="0.01"
            step="0.1"
            value={binWidth}
            onChange={e =>
              handleConfigChange({
                config: { binWidth: parseFloat(e.target.value) || 1 } as any,
              })
            }
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t(
              'bin_width_hint',
              'Smaller width = more bins with finer granularity. Larger width = fewer, broader bins'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default HistogramTypeSettings;
