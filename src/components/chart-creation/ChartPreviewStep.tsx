import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useChartCreation } from '@/contexts/ChartCreationContext';
import { useNavigation } from '@/hooks/useNavigation';
import { 
  Save,
  Eye,
  Download,
  Settings,
  ChevronLeft,
  CheckCircle 
} from 'lucide-react';
import { axiosPrivate } from '@/services/axios';
import { convertArrayToChartData } from '@/utils/dataConverter';

// Import D3LineChart instead of LineChartEditor
import D3LineChart from '@/components/charts/D3LineChart';

interface ChartPreviewStepProps {
  onPrevious: () => void;
  onSave: () => void;
}

function ChartPreviewStep({ onPrevious, onSave }: ChartPreviewStepProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();
  const navigation = useNavigation();
  const { 
    selectedDataset, 
    selectedChartType, 
    chartConfiguration, 
    selectedSeries,
    xAxisColumn,
    setIsCreating 
  } = useChartCreation();

  // Local state for saving
  const [isSaving, setIsSaving] = useState(false);
  const [chartName, setChartName] = useState(chartConfiguration.title || '');
  const [chartDescription, setChartDescription] = useState(chartConfiguration.description || '');

  // Transform data for chart display
  const transformDataForChart = () => {
    if (!selectedDataset || !selectedDataset.data || selectedSeries.length === 0) {
      return [];
    }

    // Use convertArrayToChartData utility function
    return convertArrayToChartData(selectedDataset.data);
  };

  // Get X-axis column from context
  const currentXAxisColumn = xAxisColumn || (selectedDataset?.headers?.[0] || selectedDataset?.data?.[0]?.[0] || '');

  // Get chart data
  const chartData = transformDataForChart();
  const arrayData = selectedDataset?.data;
  console.log("arrayData: ", arrayData)
  // Render chart based on type
  const renderChart = () => {
    if (!selectedChartType || !chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No data available for preview</p>
        </div>
      );
    }

    // For line chart, use D3LineChart
    if (selectedChartType.id === 'line') {
      // Prepare colors object from selected series
      const colors = selectedSeries.reduce((acc, series) => {
        acc[series.dataColumn] = { 
          light: series.color || '#3B82F6', 
          dark: series.color || '#60A5FA' 
        };
        return acc;
      }, {} as Record<string, { light: string; dark: string }>);
      
      // Prepare series names mapping
      const seriesNames = selectedSeries.reduce((acc, series) => {
        acc[series.dataColumn] = series.name;
        return acc;
      }, {} as Record<string, string>);

      console.log("arrayData: ", arrayData)
      return (
        <D3LineChart
          arrayData={arrayData}
          width={chartConfiguration.width || 800}
          height={chartConfiguration.height || 400}
          margin={{ top: 20, right: 40, bottom: 60, left: 80 }}
          xAxisKey={currentXAxisColumn}
          yAxisKeys={selectedSeries.filter(s => s.visible).map(s => s.dataColumn)}
          colors={colors}
          seriesNames={seriesNames}
          title={chartConfiguration.title || ''}
          xAxisLabel={chartConfiguration.xAxisTitle || 'X Axis'}
          yAxisLabel={chartConfiguration.yAxisTitle || 'Y Axis'}
          showLegend={chartConfiguration.showLegend}
          showGrid={chartConfiguration.showGrid}
          showPoints={true}
          animationDuration={chartConfiguration.animation ? 1000 : 0}
          curve={undefined} // Use default curve
          xAxisStart={chartConfiguration.xAxisStart || "auto"}
          yAxisStart={chartConfiguration.yAxisStart || "auto"}
        />
      );
    }

    // For other chart types, show placeholder
    switch (selectedChartType.id) {
      case 'bar':
        return (
          <div className="flex items-center justify-center h-64 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-600">Bar Chart Preview (Component not implemented yet)</p>
          </div>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-64 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-600">Pie Chart Preview (Component not implemented yet)</p>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">Chart type not supported yet</p>
          </div>
        );
    }
  };

  // Handle save chart
  const handleSaveChart = async () => {
    if (!chartName.trim()) {
      showError('Chart Name Required', 'Please enter a name for your chart');
      return;
    }

    setIsSaving(true);
    setIsCreating(true);

    try {
      const chartPayload = {
        name: chartName.trim(),
        description: chartDescription.trim() || undefined,
        type: selectedChartType?.id,
        datasetId: selectedDataset?.id.startsWith('temp-') ? null : selectedDataset?.id,
        datasetData: selectedDataset?.id.startsWith('temp-') ? selectedDataset?.data : null,
        configuration: {
          ...chartConfiguration,
          title: chartName.trim(),
          description: chartDescription.trim() || undefined,
        },
        series: selectedSeries,
        xAxisColumn: currentXAxisColumn,
      };

      await axiosPrivate.post('/charts', chartPayload);

      showSuccess('Chart Created Successfully', 'Your chart has been saved and is ready to use');
      
      // Navigate to home page instead since we don't have charts page yet
      navigation.goToHome();
      
      onSave();
    } catch (error: any) {
      if (error.response?.status === 409) {
        showError(
          'Chart Name Already Exists',
          `A chart with the name "${chartName.trim()}" already exists. Please choose a different name.`
        );
      } else {
        showError(
          'Save Failed',
          error.response?.data?.message || error.message || 'Failed to save chart'
        );
      }
    } finally {
      setIsSaving(false);
      setIsCreating(false);
    }
  };

  // Export chart data
  const handleExportData = () => {
    if (!chartData.length) return;
    
    const csvContent = [
      // Header
      ['X-Axis', ...selectedSeries.filter(s => s.visible).map(s => s.name)].join(','),
      // Data rows
      ...chartData.map(row => [
        row.x,
        ...selectedSeries.filter(s => s.visible).map(s => row[s.dataColumn] || 0)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartName || 'chart'}-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('chart_creation_preview_title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('chart_creation_preview_subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('chart_preview_chart')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>
        </div>

        {/* Chart Details & Actions */}
        <div className="space-y-6">
          {/* Save Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                {t('chart_preview_save_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="sp  ace-y-4">
              <div>
                <Label htmlFor="chartName">{t('chart_preview_chart_name')} *</Label>
                <Input
                  id="chartName"
                  placeholder={t('chart_preview_chart_name_placeholder')}
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  className={!chartName.trim() ? 'border-red-300 mt-2' : 'mt-2'}
                />
                {!chartName.trim() && (
                  <p className="text-sm text-red-600 mt-1">{t('chart_preview_chart_name_required')}</p>
                )}
              </div>

              <div className='mt-4'>
                <Label htmlFor="chartDescription">{t('chart_preview_description')}</Label>
                <Input
                  id="chartDescription"
                  placeholder={t('chart_preview_description_placeholder')}
                  value={chartDescription}
                  className="mt-2"
                  onChange={(e) => setChartDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSaveChart}
                disabled={!chartName.trim() || isSaving}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('chart_preview_saving')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t('chart_preview_save_button')}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Chart Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('chart_preview_chart_summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 text-sm">
                {/* Basic Info */}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('chart_preview_config_title')}</span>
                  <span className="font-medium">{chartConfiguration.title || chartName || 'Untitled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('chart_preview_config_type')}</span>
                  <Badge variant="secondary">{selectedChartType?.name}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('chart_preview_config_dataset')}</span>
                  <span className="font-medium">{selectedDataset?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('chart_preview_config_data_points')}</span>
                  <span className="font-medium">{chartData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('chart_preview_config_series')}</span>
                  <span className="font-medium">{selectedSeries.filter(s => s.visible).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('chart_preview_config_dimensions')}</span>
                  <span className="font-medium">{chartConfiguration.width || 800} × {chartConfiguration.height || 400}px</span>
                </div>

                {/* Axis Configuration */}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_x_axis')}</span>
                    <span className="font-medium">{chartConfiguration.xAxisTitle || currentXAxisColumn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_y_axis')}</span>
                    <span className="font-medium">{chartConfiguration.yAxisTitle || 'Y Axis'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_x_axis_start')}</span>
                    <span className="font-medium">
                      {chartConfiguration.xAxisStart === 'auto' ? t('chart_preview_config_auto') :
                       chartConfiguration.xAxisStart === 'zero' ? t('chart_preview_config_zero') :
                       chartConfiguration.xAxisStart || t('chart_preview_config_auto')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_y_axis_start')}</span>
                    <span className="font-medium">
                      {chartConfiguration.yAxisStart === 'auto' ? t('chart_preview_config_auto') :
                       chartConfiguration.yAxisStart === 'zero' ? t('chart_preview_config_zero') :
                       chartConfiguration.yAxisStart || t('chart_preview_config_auto')}
                    </span>
                  </div>
                </div>

                {/* Display Options */}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_show_legend')}</span>
                    <Badge variant={chartConfiguration.showLegend ? "default" : "secondary"}>
                      {chartConfiguration.showLegend ? t('chart_preview_config_yes') : t('chart_preview_config_no')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_show_grid')}</span>
                    <Badge variant={chartConfiguration.showGrid ? "default" : "secondary"}>
                      {chartConfiguration.showGrid ? t('chart_preview_config_yes') : t('chart_preview_config_no')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('chart_preview_config_animation')}</span>
                    <Badge variant={chartConfiguration.animation ? "default" : "secondary"}>
                      {chartConfiguration.animation ? t('chart_preview_config_yes') : t('chart_preview_config_no')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Label className="text-xs text-gray-600">{t('chart_preview_config_active_series')}</Label>
                <div className="space-y-1 mt-1">
                  {selectedSeries.filter(s => s.visible).map((series) => (
                    <div key={series.id} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: series.color }}
                      />
                      <span className="text-sm">{series.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={!chartData.length}
                className="w-full"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('chart_preview_export_data')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('chart_preview_back_to_series')}
        </Button>
        <div className="text-sm text-gray-500">
          {t('chart_preview_ready_hint')}
        </div>
      </div>
    </div>
  );
}

export default ChartPreviewStep;
