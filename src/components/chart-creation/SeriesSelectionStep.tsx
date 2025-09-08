import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useChartCreation } from '@/contexts/ChartCreationContext';
import { 
  Plus,
  Trash2,
  BarChart,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import type { Dataset, ChartType, SeriesConfig } from '@/contexts/ChartCreationContext';

interface SeriesSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  dataset: Dataset | null;
  chartType: ChartType | null;
}

function SeriesSelectionStep({ onNext, onPrevious, dataset, chartType }: SeriesSelectionStepProps) {
  const { selectedSeries, addSeries, removeSeries, updateSeries, chartConfiguration } = useChartCreation();
  
  // Available columns from dataset
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [xAxisColumn, setXAxisColumn] = useState<string>('');
  
  // Get available columns from dataset
  useEffect(() => {
    if (dataset && dataset.data && dataset.data.length > 0) {
      // Use headers if available, otherwise use first row
      const headers = dataset.headers || dataset.data[0] || [];
      setAvailableColumns(headers);
      
      // Set default X-axis column (first column)
      if (headers.length > 0 && !xAxisColumn) {
        setXAxisColumn(headers[0]);
      }
    }
  }, [dataset, xAxisColumn]);

  // Add new series
  const handleAddSeries = () => {
    if (availableColumns.length <= selectedSeries.length + 1) return; // Keep at least one column for X-axis
    
    const usedColumns = new Set([xAxisColumn, ...selectedSeries.map(s => s.dataColumn)]);
    const availableColumn = availableColumns.find(col => !usedColumns.has(col));
    
    if (availableColumn) {
      const newSeries: SeriesConfig = {
        id: `series-${Date.now()}`,
        name: availableColumn,
        dataColumn: availableColumn,
        color: chartConfiguration.colors?.[selectedSeries.length % (chartConfiguration.colors?.length || 5)] || '#3B82F6',
        type: chartType?.id || 'line',
        visible: true
      };
      
      addSeries(newSeries);
    }
  };

  // Remove series
  const handleRemoveSeries = (seriesId: string) => {
    removeSeries(seriesId);
  };

  // Update series
  const handleUpdateSeries = (seriesId: string, field: keyof SeriesConfig, value: string | boolean) => {
    updateSeries(seriesId, { [field]: value });
  };

  // Toggle series visibility
  const handleToggleVisibility = (seriesId: string) => {
    const series = selectedSeries.find(s => s.id === seriesId);
    if (series) {
      handleUpdateSeries(seriesId, 'visible', !series.visible);
    }
  };

  // Get data preview
  const getDataPreview = () => {
    if (!dataset || !dataset.data || dataset.data.length === 0) return null;
    
    const previewRows = dataset.data.slice(dataset.headers ? 1 : 0, 6); // Skip header row if headers exist
    return previewRows;
  };

  // Check if form is valid
  const isFormValid = selectedSeries.length > 0 && xAxisColumn;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Data Series
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose which columns to include in your {chartType?.name || 'chart'}
        </p>
      </div>

      <div className="space-y-6">
        {/* X-Axis Configuration */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart className="w-5 h-5 text-blue-600" />
              X-Axis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="xAxis" className="text-sm font-medium text-gray-700 dark:text-gray-300">X-Axis Column</Label>
              <select
                id="xAxis"
                value={xAxisColumn}
                onChange={(e) => setXAxisColumn(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Select X-axis column</option>
                {availableColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-green-600" />
              Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getDataPreview() ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Column Legend:</div>
                  <div className="flex flex-wrap gap-2">
                    {availableColumns.map((column) => (
                      <Badge
                        key={column}
                        variant="secondary"
                        className={`text-xs ${
                          column === xAxisColumn
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                            : selectedSeries.some(s => s.dataColumn === column)
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {column}
                        {column === xAxisColumn && ' (X-Axis)'}
                        {selectedSeries.some(s => s.dataColumn === column) && ' (Series)'}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {availableColumns.map((column) => (
                          <th
                            key={column}
                            className={`text-left p-3 font-medium border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${
                              column === xAxisColumn
                                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-300'
                                : selectedSeries.some(s => s.dataColumn === column)
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <div className="truncate min-w-[120px]" title={column}>
                              {column}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getDataPreview()?.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-3 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 last:border-r-0">
                              <div className="truncate min-w-[120px]" title={cell}>
                                {cell}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span>Showing first 5 rows</span>
                    <span className="font-medium">{dataset?.data.length} total rows</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">Select a dataset to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Y-Axis Series */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg">
                <BarChart className="w-5 h-5 text-blue-600" />
                Data Series ({selectedSeries.length})
              </span>
              <Button
                onClick={handleAddSeries}
                size="sm"
                disabled={availableColumns.length <= selectedSeries.length + 1}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Series
              </Button>
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              {selectedSeries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BarChart className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No data series selected</p>
                  <p className="text-sm">Click "Add Series" to get started</p>
                </div>
              ) : (
                selectedSeries.map((series, index) => (
                  <Card key={series.id} className="border-l-4 shadow-md bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700" style={{ borderLeftColor: series.color }}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs px-3 py-1">
                            Series {index + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVisibility(series.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            >
                              {series.visible ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSeries(series.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Series Name</Label>
                            <Input
                              value={series.name}
                              onChange={(e) => handleUpdateSeries(series.id, 'name', e.target.value)}
                              placeholder="Series name"
                              className="mt-1 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Column</Label>
                            <select
                              value={series.dataColumn}
                              onChange={(e) => handleUpdateSeries(series.id, 'dataColumn', e.target.value)}
                              className="w-full mt-1 h-10 p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {availableColumns
                                .filter(col => col !== xAxisColumn)
                                .map((column) => (
                                <option key={column} value={column}>
                                  {column}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</Label>
                            <input
                              type="color"
                              value={series.color}
                              onChange={(e) => handleUpdateSeries(series.id, 'color', e.target.value)}
                              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={series.visible}
                              onCheckedChange={(checked) => handleUpdateSeries(series.id, 'visible', checked)}
                            />
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visible</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Configuration
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isFormValid}
          size="lg"
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Preview
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default SeriesSelectionStep;
