import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChartCreation } from '@/contexts/ChartCreationContext';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Zap,
  Activity,
  Target,
  Layers,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import type { ChartType } from '@/contexts/ChartCreationContext';
import LineChartPage from '../charts/page.example/LineChartPage';
import BarChartPage from '../charts/page.example/BarChartPage';
import AreaChartPage from '../charts/page.example/AreaChartPage';

interface ChartTypeSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onChartTypeSelect?: (chartType: ChartType) => void;
}

// Available chart types
const chartTypes: ChartType[] = [
  {
    id: 'line',
    name: 'Line Chart',
    icon: 'LineChart',
    description: 'Perfect for showing trends and changes over time',
    category: 'basic'
  },
  {
    id: 'bar',
    name: 'Bar Chart',
    icon: 'BarChart3',
    description: 'Great for comparing different categories or values',
    category: 'basic'
  },
  {
    id: 'area',
    name: 'Area Chart',
    icon: 'TrendingUp',
    description: 'Shows cumulative data and filled areas under lines',
    category: 'basic'
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: 'PieChart',
    description: 'Ideal for showing proportions and percentages',
    category: 'basic'
  },
  {
    id: 'scatter',
    name: 'Scatter Plot',
    icon: 'Zap',
    description: 'Displays relationships between two variables',
    category: 'advanced'
  },
  {
    id: 'radar',
    name: 'Radar Chart',
    icon: 'Target',
    description: 'Compares multiple variables in a circular format',
    category: 'advanced'
  },
  {
    id: 'histogram',
    name: 'Histogram',
    icon: 'Activity',
    description: 'Shows distribution of numerical data',
    category: 'statistical'
  },
  {
    id: 'stacked',
    name: 'Stacked Chart',
    icon: 'Layers',
    description: 'Shows parts of a whole across categories',
    category: 'advanced'
  }
];

// Icon mapping
const iconMap = {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  Zap,
  Activity,
  Target,
  Layers
};

function ChartTypeSelectionStep({ onNext, onPrevious, onChartTypeSelect }: ChartTypeSelectionStepProps) {
  const { t } = useTranslation();
  const { selectedChartType, setSelectedChartType } = useChartCreation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter chart types by category
  const filteredChartTypes = selectedCategory === 'all' 
    ? chartTypes 
    : chartTypes.filter(chart => chart.category === selectedCategory);

  // Handle chart type selection
  const handleChartTypeSelect = (chartType: ChartType) => {
    setSelectedChartType(chartType);
    onChartTypeSelect?.(chartType);
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || LineChart;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('chart_creation_chartType_title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('chart_creation_chartType_subtitle')}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          {t('chart_type_all_charts')}
        </Button>
        <Button
          variant={selectedCategory === 'basic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('basic')}
        >
          {t('chart_type_basic')}
        </Button>
        <Button
          variant={selectedCategory === 'advanced' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('advanced')}
        >
          {t('chart_type_advanced')}
        </Button>
        <Button
          variant={selectedCategory === 'statistical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('statistical')}
        >
          {t('chart_type_statistical')}
        </Button>
      </div>

      {/* Chart Type Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredChartTypes.map((chartType) => {
          const IconComponent = getIconComponent(chartType.icon);
          const isSelected = selectedChartType?.id === chartType.id;
          
          return (
            <Card
              key={chartType.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                isSelected
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => handleChartTypeSelect(chartType)}
            >
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg flex flex-col items-center gap-2">
                  <span>{chartType.name}</span>
                  <Badge 
                    variant={isSelected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {chartType.category}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {chartType.description}
                </p>
                {isSelected && (
                  <div className="mt-3">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      {t('chart_type_selected')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Chart Info */}
      {selectedChartType && (
        <div>
          {selectedChartType.id === 'line' && (<LineChartPage />)}
          {selectedChartType.id === 'bar' && (<BarChartPage />)}
          {selectedChartType.id === 'area' && (<AreaChartPage />)}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('chart_type_back_dataset')}
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedChartType}
          size="lg"
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('chart_type_continue_config')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default ChartTypeSelectionStep;
