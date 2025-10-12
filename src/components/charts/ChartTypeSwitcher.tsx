import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart3, LineChart, AreaChart, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export interface ChartTypeOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

export interface ChartTypeSwitcherProps {
  currentType: string;
  onTypeChange: (type: string) => void;
  variant?: 'select' | 'buttons' | 'cards';
  disabled?: boolean;
  className?: string;
}

const ChartTypeSwitcher: React.FC<ChartTypeSwitcherProps> = ({
  currentType,
  onTypeChange,
  variant = 'select',
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();

  const chartTypeOptions: ChartTypeOption[] = [
    {
      value: 'line',
      label: t('chart_type_line', 'Line Chart'),
      icon: LineChart,
      description: t('chart_type_line_desc', 'Perfect for showing trends over time'),
      color: 'bg-blue-500',
    },
    {
      value: 'bar',
      label: t('chart_type_bar', 'Bar Chart'),
      icon: BarChart3,
      description: t('chart_type_bar_desc', 'Great for comparing values across categories'),
      color: 'bg-green-500',
    },
    {
      value: 'area',
      label: t('chart_type_area', 'Area Chart'),
      icon: AreaChart,
      description: t('chart_type_area_desc', 'Ideal for showing data volume over time'),
      color: 'bg-purple-500',
    },
  ];

  const currentOption = chartTypeOptions.find(option => option.value === currentType);

  if (variant === 'select') {
    return (
      <div className={`w-full ${className}`}>
        <Select value={currentType} onValueChange={value => onTypeChange(value)}>
          <SelectTrigger
            className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
          >
            <SelectValue placeholder={currentOption?.label || 'Select chart type'} />
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
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {chartTypeOptions.map(option => {
          const IconComponent = option.icon;
          const isActive = option.value === currentType;

          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange(option.value)}
              disabled={disabled}
              className={`flex items-center gap-2 ${isActive ? option.color : ''}`}
            >
              <IconComponent className="w-4 h-4" />
              {option.label}
            </Button>
          );
        })}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {chartTypeOptions.map(option => {
          const IconComponent = option.icon;
          const isActive = option.value === currentType;

          return (
            <motion.div key={option.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && onTypeChange(option.value)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center text-white`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('chart_type_click_to_select', 'Click to select')}
                      </span>
                    </div>
                    {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return null;
};

export default ChartTypeSwitcher;
