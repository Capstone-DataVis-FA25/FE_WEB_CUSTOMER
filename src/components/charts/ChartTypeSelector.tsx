import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, LineChart, BarChart3, AreaChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';

interface ChartTypeOption {
  value: ChartType;
  label: string;
  icon: LucideIcon;
}

interface ChartTypeSelectorProps {
  disabled?: boolean;
  className?: string;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { currentChartType, setCurrentChartType, chartConfig } = useChartEditor();

  const chartTypeOptions: ChartTypeOption[] = useMemo(
    () => [
      {
        value: ChartType.Line,
        label: t('chart_type_line', 'Line Chart'),
        icon: LineChart,
      },
      {
        value: ChartType.Bar,
        label: t('chart_type_bar', 'Bar Chart'),
        icon: BarChart3,
      },
      {
        value: ChartType.Area,
        label: t('chart_type_area', 'Area Chart'),
        icon: AreaChart,
      },
    ],
    [t]
  );

  const selectedOption = useMemo(
    () => chartTypeOptions.find(opt => opt.value === currentChartType),
    [chartTypeOptions, currentChartType]
  );

  const handleChartTypeChange = (value: string) => {
    setCurrentChartType(value as ChartType);
  };

  const renderSelectedValue = () => {
    if (!selectedOption) {
      return (
        <span className="text-gray-500">
          {t('chart_editor_select_type', 'Select chart type...')}
        </span>
      );
    }

    const IconComponent = selectedOption.icon;
    return (
      <>
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{selectedOption.label}</span>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`relative z-50 ${className}`}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-visible">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('chart_editor_chartType', 'Chart Type')}
          </h3>
        </CardHeader>

        <CardContent className="relative overflow-visible">
          <div className="relative z-50">
            <Select value={currentChartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-full" disabled={disabled}>
                <div className="flex items-center gap-2 min-h-[20px]">{renderSelectedValue()}</div>
              </SelectTrigger>

              <SelectContent>
                {chartTypeOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChartTypeSelector;
