import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { sizePresets } from '@/types/chart';
import { useDebouncedUpdater } from '@/hooks/useDebounce';

interface BasicSettingsSectionProps {
  className?: string;
}

const BasicSettingsSection: React.FC<BasicSettingsSectionProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { chartConfig, handleConfigChange } = useChartEditor();

  // ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURNS (Rules of Hooks)
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Extract config with safe defaults using optional chaining
  const config = chartConfig?.config;

  // Local state for smooth typing - use safe defaults for when config is null
  const [localWidth, setLocalWidth] = useState(config?.width ?? 800);
  const [localHeight, setLocalHeight] = useState(config?.height ?? 600);
  const [localTitle, setLocalTitle] = useState(config?.title ?? '');
  const [localMargin, setLocalMargin] = useState(
    config?.margin ?? { top: 20, right: 20, bottom: 20, left: 40 }
  );

  const debouncedUpdateWidth = useDebouncedUpdater<number>(width =>
    handleConfigChange({ config: { width } })
  );
  const debouncedUpdateHeight = useDebouncedUpdater<number>(height =>
    handleConfigChange({ config: { height } })
  );
  const debouncedUpdateTitle = useDebouncedUpdater<string>(title =>
    handleConfigChange({ config: { title } })
  );
  const debouncedUpdateMargin = useDebouncedUpdater<typeof localMargin>(margin =>
    handleConfigChange({ config: { margin } })
  );

  // Phải đặt phía sau các hook
  // Nếu chartConfig null -> dừng lại và không chạy các hook
  if (!chartConfig || !config) return null;

  const handleApplySizePreset = (presetKey: keyof typeof sizePresets) => {
    const preset = sizePresets[presetKey];
    if (preset && chartConfig) {
      // Update local state immediately for instant UI feedback
      setLocalWidth(preset.width);
      setLocalHeight(preset.height);

      // Update config directly
      handleConfigChange({
        config: {
          width: preset.width,
          height: preset.height,
        },
      });
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={`select-none ${className}`}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={toggleCollapse}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('lineChart_editor_basicSettings', 'Basic Settings')}
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
                {t('lineChart_editor_sizePresets', 'Size Presets')}
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(sizePresets).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 flex items-center justify-center gap-1 px-2 min-w-0 truncate"
                    onClick={() => handleApplySizePreset(key as keyof typeof sizePresets)}
                    title={`${preset.width} × ${preset.height}`}
                  >
                    <span className="truncate">
                      {t(
                        preset.labelKey,
                        preset.label || key.charAt(0).toUpperCase() + key.slice(1)
                      )}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Width and Height */}
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('lineChart_editor_customSize', 'Custom Size')}
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    {t('lineChart_editor_width', 'Width')}
                  </Label>
                  <Input
                    type="number"
                    value={localWidth}
                    onChange={e => {
                      const newWidth = parseInt(e.target.value);
                      if (!isNaN(newWidth) && newWidth > 0) {
                        setLocalWidth(newWidth);
                        debouncedUpdateWidth(newWidth);
                      }
                    }}
                    className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="1"
                    step="10"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    {t('lineChart_editor_height', 'Height')}
                  </Label>
                  <Input
                    type="number"
                    value={localHeight}
                    onChange={e => {
                      const newHeight = parseInt(e.target.value);
                      if (!isNaN(newHeight) && newHeight > 0) {
                        setLocalHeight(newHeight);
                        debouncedUpdateHeight(newHeight);
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
                  {t('lineChart_editor_currentSize', 'Current Size')}: {localWidth} × {localHeight}
                  px | {t('lineChart_editor_ratio', 'Ratio')}:{' '}
                  {(localWidth / localHeight).toFixed(2)}:1
                </p>
              </div>
            </div>

            {/* Padding Configuration */}
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('lineChart_editor_padding', 'Padding')}
              </Label>
              <div className="mt-2">
                {/* Visual Padding Editor */}
                <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {/* Top */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Input
                      type="number"
                      value={localMargin!.top}
                      onChange={e => {
                        const newTop = parseInt(e.target.value) || 0;
                        const newMargin = { ...localMargin!, top: Math.max(0, newTop) };
                        setLocalMargin(newMargin);
                        debouncedUpdateMargin(newMargin);
                      }}
                      className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="0"
                    />
                  </div>

                  {/* Left */}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Input
                      type="number"
                      value={localMargin!.left}
                      onChange={e => {
                        const newLeft = parseInt(e.target.value) || 0;
                        const newMargin = { ...localMargin!, left: Math.max(0, newLeft) };
                        setLocalMargin(newMargin);
                        debouncedUpdateMargin(newMargin);
                      }}
                      className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="0"
                    />
                  </div>

                  {/* Right */}
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                    <Input
                      type="number"
                      value={localMargin!.right}
                      onChange={e => {
                        const newRight = parseInt(e.target.value) || 0;
                        const newMargin = { ...localMargin!, right: Math.max(0, newRight) };
                        setLocalMargin(newMargin);
                        debouncedUpdateMargin(newMargin);
                      }}
                      className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="0"
                    />
                  </div>

                  {/* Bottom */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <Input
                      type="number"
                      value={localMargin!.bottom}
                      onChange={e => {
                        const newBottom = parseInt(e.target.value) || 0;
                        const newMargin = { ...localMargin!, bottom: Math.max(0, newBottom) };
                        setLocalMargin(newMargin);
                        debouncedUpdateMargin(newMargin);
                      }}
                      className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="0"
                    />
                  </div>

                  {/* Center Chart Area Representation */}
                  <div className="bg-white dark:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded h-20 flex items-center justify-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('lineChart_editor_chartArea', 'Chart Area')}
                    </span>
                  </div>
                </div>

                {/* Padding Values Display */}
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('lineChart_editor_top', 'Top')}:
                      </span>
                      <div className="font-mono">{localMargin!.top}px</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('lineChart_editor_right', 'Right')}:
                      </span>
                      <div className="font-mono">{localMargin!.right}px</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('lineChart_editor_bottom', 'Bottom')}:
                      </span>
                      <div className="font-mono">{localMargin!.bottom}px</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('lineChart_editor_left', 'Left')}:
                      </span>
                      <div className="font-mono">{localMargin!.left}px</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Title */}
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('lineChart_editor_title_chart', 'Chart Title')}
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  value={localTitle}
                  onChange={e => {
                    setLocalTitle(e.target.value);
                    debouncedUpdateTitle(e.target.value);
                  }}
                  placeholder={t('chart_title_placeholder', 'Enter chart title (optional)')}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default BasicSettingsSection;
