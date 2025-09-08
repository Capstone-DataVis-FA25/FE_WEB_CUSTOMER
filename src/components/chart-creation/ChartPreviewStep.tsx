import { useState } from 'react';
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

// Import chart components based on type
import D3LineChart from '@/components/charts/D3LineChart';

interface ChartPreviewStepProps {
  onPrevious: () => void;
  onSave: () => void;
}

function ChartPreviewStep({ onPrevious, onSave }: ChartPreviewStepProps) {
  const { showSuccess, showError } = useToastContext();
  const navigation = useNavigation();
  const { 
    selectedDataset, 
    selectedChartType, 
    chartConfiguration, 
    selectedSeries,
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

  // Get X-axis column (first available column that's not used in series)
  const getXAxisColumn = () => {
    if (!selectedDataset || !selectedDataset.data) return '';
    const headers = selectedDataset.headers || selectedDataset.data[0];
    return headers[0] || '';
  };

  // Get chart data
  const chartData = transformDataForChart();

  // Render chart based on type
  const renderChart = () => {
    if (!selectedChartType || !chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No data available for preview</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      xAxisKey: getXAxisColumn(),
      yAxisKeys: selectedSeries.filter(s => s.visible).map(s => s.dataColumn),
      title: chartConfiguration.title,
      xAxisLabel: chartConfiguration.xAxisTitle,
      yAxisLabel: chartConfiguration.yAxisTitle,
      showLegend: chartConfiguration.showLegend,
      showGrid: chartConfiguration.showGrid,
      colors: selectedSeries.reduce((acc, series) => {
        acc[series.dataColumn] = { 
          light: series.color || '#3B82F6', 
          dark: series.color || '#60A5FA' 
        };
        return acc;
      }, {} as Record<string, { light: string; dark: string }>),
      width: chartConfiguration.width,
      height: chartConfiguration.height,
      showPoints: true,
      animationDuration: chartConfiguration.animation ? 1000 : 0,
    };

    switch (selectedChartType.id) {
      case 'line':
        return <D3LineChart {...commonProps} />;
      case 'bar':
        // Return placeholder for now
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
        xAxisColumn: getXAxisColumn(),
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
          Preview & Save Chart
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your chart and save it to your collection
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Chart Preview
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
                Save Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chartName">Chart Name *</Label>
                <Input
                  id="chartName"
                  placeholder="Enter chart name"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  className={!chartName.trim() ? 'border-red-300' : ''}
                />
                {!chartName.trim() && (
                  <p className="text-sm text-red-600 mt-1">Name is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="chartDescription">Description</Label>
                <Input
                  id="chartDescription"
                  placeholder="Enter description (optional)"
                  value={chartDescription}
                  onChange={(e) => setChartDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSaveChart}
                disabled={!chartName.trim() || isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Save Chart
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
                Chart Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="secondary">{selectedChartType?.name}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dataset:</span>
                  <span className="font-medium">{selectedDataset?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-medium">{chartData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Series:</span>
                  <span className="font-medium">{selectedSeries.filter(s => s.visible).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">{chartConfiguration.width} × {chartConfiguration.height}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Label className="text-xs text-gray-600">Active Series:</Label>
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
                Export Data
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
          Back to Series
        </Button>
        <div className="text-sm text-gray-500">
          Ready to save your chart? Use the Save Chart button above.
        </div>
      </div>
    </div>
  );
}

export default ChartPreviewStep;
