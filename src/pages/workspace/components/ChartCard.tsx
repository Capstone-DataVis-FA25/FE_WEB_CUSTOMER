import React, { useState } from 'react';
import { BarChart3, LineChart, AreaChart, Database, Eye, Share, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Minimal BaseChart type to decouple from missing chartAPI module
type BaseChart = {
  id: string;
  name: string;
  description?: string;
  type: string;
  datasetId?: string;
  dataset?: { name?: string } | null;
  updatedAt: string;
};
import Utils from '@/utils/Utils';
import { useTranslation } from 'react-i18next';

// Extended Chart type for UI with additional optional fields
type Chart = BaseChart & {
  category?: string;
  isPublic?: boolean;
  views?: number;
  datasetName?: string;
};

interface ChartCardProps {
  chart: Chart;
  onEdit: (chartId: string) => void;
  onDelete: (chart: Chart) => void;
  onView?: (chart: Chart) => void;
  onShare?: (chart: Chart) => void;
  isDeleting?: boolean;
}

const getChartIcon = (type: string) => {
  switch (type) {
    case 'line':
      return <LineChart className="h-4 w-4" />;
    case 'bar':
      return <BarChart3 className="h-4 w-4" />;
    case 'area':
      return <AreaChart className="h-4 w-4" />;
    default:
      return <BarChart3 className="h-4 w-4" />;
  }
};

const getChartTypeLabel = (type: string) => {
  switch (type) {
    case 'line':
      return 'Line Chart';
    case 'bar':
      return 'Bar Chart';
    case 'area':
      return 'Area Chart';
    default:
      return 'Chart';
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'Sales':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Finance':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'Analytics':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Performance':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Chart color mapping based on type
const getChartColor = (type: string) => {
  switch (type) {
    case 'line':
      return 'from-blue-500 to-cyan-500';
    case 'bar':
      return 'from-emerald-500 to-teal-500';
    case 'area':
      return 'from-orange-500 to-red-500';
    case 'pie':
      return 'from-purple-500 to-pink-500';
    case 'scatter':
      return 'from-indigo-500 to-blue-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

// Removed unused formatDate helper

const ChartCard: React.FC<ChartCardProps> = ({
  chart,
  onEdit,
  onDelete,
  onView,
  onShare,
  isDeleting = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onView) {
      onView(chart);
    }
    onEdit(chart.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onShare) {
      onShare(chart);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onDelete(chart);
  };

  const { t } = useTranslation();

  return (
    <Card
      className="group relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(chart.id)}
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getChartColor(chart.type)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${getChartColor(chart.type)} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            {getChartIcon(chart.type)}
          </div>
          <div className="flex flex-col space-y-1 items-end">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3 h-3" />
              {getChartTypeLabel(chart.type)}
            </Badge>
            {chart.category && (
              <Badge variant="outline" className={getCategoryColor(chart.category)}>
                {chart.category}
              </Badge>
            )}
            {chart.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight hover:text-emerald-600 transition-colors group-hover:text-emerald-600">
            {chart.name}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem] text-gray-700 dark:text-gray-300">
            {chart.description || 'No description available'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Database className="h-3 w-3" />
            <span className="font-medium">{t('chart_dataset', 'Dataset')}:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {chart.dataset?.name || chart.datasetName || `Dataset ${chart.datasetId}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            <span className="font-medium">{t('chart_updated', 'Updated')}:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {Utils.getDate(chart.updatedAt, 18)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1 group-hover:border-emerald-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all duration-200"
          >
            <Eye className="h-3 w-3" />
            View Chart
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className={`px-2 transition-all duration-200 ${
              isHovered
                ? 'opacity-100 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'opacity-100 group-hover:opacity-100'
            }`}
          >
            <Edit3 className="h-3 w-3 mr-1" />{' '}
          </Button> */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className={`px-2 transition-all duration-200 ${
              isHovered
                ? 'opacity-100 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                : 'opacity-100 group-hover:opacity-100'
            }`}
          >
            <Share className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-2 transition-all duration-200 disabled:opacity-50 ${
              isHovered
                ? 'opacity-100 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'opacity-100 group-hover:opacity-100'
            }`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
