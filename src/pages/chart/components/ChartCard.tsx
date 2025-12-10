import React, { useState } from 'react';
import {
  BarChart3,
  LineChart,
  AreaChart,
  Database,
  Eye,
  Trash2,
  Clock,
  RefreshCcw,
  Donut,
  Dot,
  ChartPie,
  Edit3,
} from 'lucide-react';
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
import { ChartType } from '@/features/charts';
import { useChartEditor } from '@/features/chartEditor';

// Extended Chart type for UI with additional optional fields
type Chart = BaseChart & {
  category?: string;
  isPublic?: boolean;
  views?: number;
  datasetName?: string;
};

interface ChartCardProps {
  id?: string;
  chart: Chart;
  onEdit: (chartId: string) => void;
  onDelete: (chart: Chart) => void;
  onView?: (chart: Chart) => void;
  onShare?: (chart: Chart) => void;
  isDeleting?: boolean;
}

const getChartIcon = (type: string) => {
  switch (type) {
    case ChartType.Line:
      return <LineChart className="h-4 w-4" />;
    case ChartType.Bar:
      return <BarChart3 className="h-4 w-4" />;
    case ChartType.Area:
      return <AreaChart className="h-4 w-4" />;
    case ChartType.Pie:
      return <ChartPie className="h-4 w-4" />;
    case ChartType.Scatter:
      return <Dot className="h-4 w-4" />;
    case ChartType.Donut:
      return <Donut className="h-4 w-4" />;
    case ChartType.CyclePlot:
      return <RefreshCcw className="h-4 w-4" />;
    default:
      return <BarChart3 className="h-4 w-4" />;
  }
};

const getChartTypeLabel = (type: string, t: any) => {
  switch (type) {
    case ChartType.Line:
      return t('chart_type_line');
    case ChartType.Bar:
      return t('chart_type_bar');
    case ChartType.Area:
      return t('chart_type_area');
    case ChartType.Pie:
      return t('chart_type_pie');
    case ChartType.Scatter:
      return t('chart_type_scatter');
    case ChartType.Donut:
      return t('chart_gallery_donut_basic');
    case ChartType.CyclePlot:
      return t('chart_type_cycleplot');
    case ChartType.Histogram:
      return t('chart_type_histogram');
    case ChartType.Heatmap:
      return t('chart_type_heatmap');
    default:
      return t('chart_type_unknown');
  }
};

// Chart color mapping based on type
const getChartColor = (type: string) => {
  switch (type) {
    case ChartType.Line:
      return 'from-blue-500 to-cyan-500';
    case ChartType.Bar:
      return 'from-emerald-500 to-teal-500';
    case ChartType.Area:
      return 'from-orange-500 to-red-500';
    case ChartType.Pie:
      return 'from-purple-500 to-pink-500';
    case ChartType.Scatter:
      return 'from-indigo-500 to-blue-500';
    case ChartType.Donut:
      return 'from-yellow-500 to-amber-500';
    case ChartType.CyclePlot:
      return 'from-green-500 to-lime-500';
    case ChartType.Heatmap:
      return 'from-red-500 to-yellow-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

// Removed unused formatDate helper

const ChartCard: React.FC<ChartCardProps> = ({
  id,
  chart,
  onEdit,
  onDelete,
  onView,
  onShare,
  isDeleting = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { clearChartEditor } = useChartEditor();
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    clearChartEditor();
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
      id={id}
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
              {getChartTypeLabel(chart.type, t)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight hover:text-emerald-600 transition-colors group-hover:text-emerald-600 truncate">
            {chart.name}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem] text-gray-700 dark:text-gray-300 truncate">
            {chart.description || t('chart_card_no_description')}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Database className="h-3 w-3" />
            <span className="font-medium">{t('chart_card_dataset')}:</span>
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[10rem]">
              {chart.dataset?.name || chart.datasetName || `Dataset ${chart.datasetId}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            <span className="font-medium">{t('chart_card_updated')}:</span>
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
            {t('chart_card_view')}
          </Button>
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
            <Edit3 className="h-3 w-3 mr-1" />
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
