import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const AnimationDurationSetting: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const [localAnimationDuration, setLocalAnimationDuration] = useState(
    chartConfig.animationDuration
  );

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalAnimationDuration(chartConfig.animationDuration);
  }, [chartConfig?.animationDuration]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedApply = useCallback((apply: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(apply, 500);
  }, []);

  return (
    <div>
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {t('chart_editor_animation_duration', 'Animation Duration (ms)')}
      </Label>
      <Input
        type="number"
        value={localAnimationDuration}
        onChange={e => {
          const v = parseInt(e.target.value) || 0;
          setLocalAnimationDuration(v);
          debouncedApply(() => handleConfigChange({ config: { animationDuration: v } }));
        }}
        className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
        min={0}
      />
    </div>
  );
};

export default AnimationDurationSetting;
