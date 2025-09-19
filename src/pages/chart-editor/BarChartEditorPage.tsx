import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import BarChartEditor from '@/components/charts/BarChartEditor';
import { getChartById, updateChart } from '@/features/charts/chartAPI';
import { getDatasetById } from '@/features/dataset/datasetAPI';
import {
  transformDatasetToArray,
  extractChartConfig,
  extractColorConfig,
  extractFormatterConfig,
} from '@/utils/chartDataTransform';
import type { Chart } from '@/features/charts/chartTypes';
import type { Dataset } from '@/features/dataset/datasetAPI';
import type { BarChartConfig as ChartConfig, ColorConfig, FormatterConfig } from '@/types/chart';
import { salesData } from '@/components/charts/data/data'; // Import sample data

const BarChartEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // State for loading and data
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [chart, setChart] = useState<Chart | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chart editor state
  const [chartData, setChartData] = useState<(string | number)[][]>(salesData); // Initialize with sample data
  const [chartConfig, setChartConfig] = useState<Partial<ChartConfig>>({});
  const [chartColors, setChartColors] = useState<ColorConfig>({});
  const [chartFormatters, setChartFormatters] = useState<Partial<FormatterConfig>>({});

  // Fetch chart and dataset data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Chart ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch chart details
        const chartData = await getChartById(id);
        setChart(chartData);

        // Fetch associated dataset
        if (chartData.datasetId) {
          const datasetData = await getDatasetById(chartData.datasetId);
          setDataset(datasetData);

          // Transform dataset to array format for chart editor
          const arrayData = transformDatasetToArray(datasetData);
          if (arrayData && arrayData.length > 1) {
            // Check if we have actual data
            setChartData(arrayData as (string | number)[][]);
          }
          // If no data from API, keep sample data as fallback

          // Extract chart configuration from API response (saved config)
          const config = extractChartConfig(chartData, datasetData);
          setChartConfig(config as Partial<ChartConfig>);

          // Extract color configuration from API response
          const yAxisKeys = Array.isArray(config.yAxisKeys) ? config.yAxisKeys : [];
          const colors = extractColorConfig(chartData, yAxisKeys);
          setChartColors(colors);

          // Extract formatter configuration from API response
          const formatters = extractFormatterConfig(chartData);
          setChartFormatters(formatters);
        } else {
          // No associated dataset - use sample data and default config
          console.warn('Chart does not have an associated dataset, using sample data');

          // Create default configuration for sample data
          const defaultConfig = {
            title: chart?.name || 'Sample Bar Chart',
            xAxisLabel: 'Month',
            yAxisLabel: 'Sales (Million)',
            xAxisKey: 'month',
            yAxisKeys: ['ecommerce', 'retail', 'wholesale'],
            width: 800,
            height: 400,
            showLegend: true,
            showGrid: true,
            animationDuration: 1000,
            barType: 'grouped' as const,
            margin: { top: 20, right: 40, bottom: 60, left: 80 },
          };

          setChartConfig(defaultConfig);

          // Set default colors for sample data
          const defaultColors = {
            ecommerce: { light: '#16a34a', dark: '#22c55e' },
            retail: { light: '#9333ea', dark: '#a855f7' },
            wholesale: { light: '#c2410c', dark: '#ea580c' },
          };
          setChartColors(defaultColors);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Data Synchronization Pattern: Sync tempData when chartData changes externally
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      console.log('Chart data updated:', chartData.length, 'rows');
    }
  }, [chartData]);

  // Handle saving chart changes
  const handleSave = async () => {
    if (!chart || !id) return;

    try {
      setSaving(true);

      // Prepare update data
      const updateData = {
        name: chartConfig.title || chart.name,
        description: chart.description,
        config: {
          ...chartConfig,
          colors: chartColors,
          formatters: chartFormatters,
        },
      };

      // Update chart via API
      await updateChart(id, updateData);

      showSuccess('Chart saved successfully!');
    } catch (err) {
      console.error('Error saving chart:', err);
      showError('Failed to save chart. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle navigation back to workspace
  const handleBack = () => {
    navigate('/workspace');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg">Loading chart...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Error</h2>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workspace
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workspace
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chart?.name || 'Bar Chart Editor'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dataset?.name || 'Unknown Dataset'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Chart'}
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BarChartEditor
          initialArrayData={chartData}
          initialConfig={chartConfig}
          initialColors={chartColors}
          initialFormatters={chartFormatters}
          onConfigChange={setChartConfig}
          onDataChange={() => {}} // Read-only for now, data changes go through dataset editor
          onColorsChange={setChartColors}
          onFormattersChange={setChartFormatters}
          title={chart?.name}
          description={chart?.description}
        />
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default BarChartEditorPage;
