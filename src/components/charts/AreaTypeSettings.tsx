import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import AreaAdvancedOptions from './AreaAdvancedOptions';

/**
 * AreaTypeSettings Component
 *
 * Settings specific to Area charts including:
 * - Stacked vs Overlapping mode
 * - Area opacity
 * - Advanced display options for non-tech users
 */
const AreaTypeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig) return null;
  if (currentChartType !== ChartType.Area) return null;

  const cfg: any = chartConfig.config || {};

  const [localStackedMode, setLocalStackedMode] = useState<boolean>(cfg.stackedMode ?? false);
  const [localOpacity, setLocalOpacity] = useState<number>(cfg.opacity ?? 0.7);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalStackedMode(cfg.stackedMode ?? false);
    setLocalOpacity(cfg.opacity ?? 0.7);
  }, [cfg?.stackedMode, cfg?.opacity]);

  return (
    <div className="space-y-4">
      {/* Area Mode Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('area_mode', 'Area display mode')}
        </Label>
        <select
          value={localStackedMode ? 'stacked' : 'overlapping'}
          onChange={e => {
            const v = e.target.value === 'stacked';
            setLocalStackedMode(v);
            handleConfigChange({ config: { stackedMode: v } as any });
          }}
          className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="overlapping">
            {t('area_overlapping', 'Overlapping - Compare trends separately')}
          </option>
          <option value="stacked">{t('area_stacked', 'Stacked - Show cumulative total')}</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {!localStackedMode
            ? t(
                'area_overlapping_hint',
                'Overlapping mode shows each area independently, making it easy to compare individual trends'
              )
            : t(
                'area_stacked_hint',
                'Stacked mode accumulates values on top of each other, showing how different parts contribute to the whole'
              )}
        </p>
      </div>

      {/* Area Opacity Slider */}
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('area_opacity', 'Area transparency')}
        </Label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={localOpacity}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setLocalOpacity(v);
              handleConfigChange({ config: { opacity: v } as any });
            }}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
            {Math.round(localOpacity * 100)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t(
            'area_opacity_hint',
            'Lower transparency makes areas more see-through, useful when comparing overlapping areas'
          )}
        </p>
      </div>

      {/* Visual Guide for Beginners */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1.5 flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {t('quick_guide', 'Quick Guide')}
        </h4>
        <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-none">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
            <span>
              {t(
                'guide_overlapping',
                'Use Overlapping when you want to see how different categories trend independently'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
            <span>
              {t(
                'guide_stacked',
                'Use Stacked when you want to see the total combined value and how each part contributes'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
            <span>
              {t(
                'guide_transparency',
                'Adjust transparency to 40-60% for overlapping areas so you can see through them'
              )}
            </span>
          </li>
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

      {/* Advanced Display Options - Separate component for non-tech users */}
      <AreaAdvancedOptions />
    </div>
  );
};

export default AreaTypeSettings;
