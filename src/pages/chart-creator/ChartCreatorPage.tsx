import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, LineChart, AreaChart, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Routers from '@/router/routers';

// Chart type definitions với UI được cải thiện
const chartTypes = [
  {
    type: 'line',
    name: 'Line Chart',
    description: 'Perfect for showing trends and changes over time',
    icon: <LineChart className="h-10 w-10" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    route: Routers.LINE_CHART_EDITOR_DEMO,
    features: ['Time series', 'Trends', 'Comparisons'],
    bestFor: 'Sales over time, temperature changes, stock prices',
  },
  {
    type: 'bar',
    name: 'Bar Chart',
    description: 'Ideal for comparing different categories or groups',
    icon: <BarChart3 className="h-10 w-10" />,
    color: 'from-emerald-500 to-teal-500',
    bgColor:
      'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-700',
    route: Routers.BAR_CHART_EDITOR_DEMO,
    features: ['Categories', 'Comparisons', 'Rankings'],
    bestFor: 'Revenue by region, product sales, survey results',
  },
  {
    type: 'area',
    name: 'Area Chart',
    description: 'Great for showing cumulative data and part-to-whole relationships',
    icon: <AreaChart className="h-10 w-10" />,
    color: 'from-purple-500 to-pink-500',
    bgColor:
      'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700',
    route: Routers.AREA_CHART_EDITOR_DEMO,
    features: ['Cumulative data', 'Stacked values', 'Volume'],
    bestFor: 'Website traffic, market share, cumulative revenue',
  },
];

// Dataset được cải thiện dựa trên data thực
const mockDatasets = [
  {
    id: 1,
    name: 'Monthly Sales Data',
    description:
      'Comprehensive sales data across e-commerce, retail, and wholesale channels for 2024',
    rows: 12,
    columns: 4,
    dataPoints: 48,
    columns_info: [
      { name: 'month', type: 'number', description: 'Month (1-12)' },
      { name: 'ecommerce', type: 'number', description: 'E-commerce sales in millions' },
      { name: 'retail', type: 'number', description: 'Retail store sales in millions' },
      { name: 'wholesale', type: 'number', description: 'Wholesale sales in millions' },
    ],
    category: 'Sales',
    lastUpdated: '2024-03-15',
    createdBy: 'Data Team',
    tags: ['sales', 'monthly', 'channels', 'revenue'],
  },
  {
    id: 2,
    name: 'Quarterly Revenue by Industry',
    description: 'Revenue breakdown across technology, healthcare, finance, and education sectors',
    rows: 6,
    columns: 5,
    dataPoints: 30,
    columns_info: [
      { name: 'quarter', type: 'text', description: 'Quarter (Q1-Q4 2023-2024)' },
      { name: 'technology', type: 'number', description: 'Technology sector revenue' },
      { name: 'healthcare', type: 'number', description: 'Healthcare sector revenue' },
      { name: 'finance', type: 'number', description: 'Finance sector revenue' },
      { name: 'education', type: 'number', description: 'Education sector revenue' },
    ],
    category: 'Finance',
    lastUpdated: '2024-03-10',
    createdBy: 'Finance Team',
    tags: ['quarterly', 'industry', 'sectors', 'revenue'],
  },
  {
    id: 3,
    name: 'Product Performance Metrics',
    description: 'Detailed analysis of product sales, profit margins, and customer acquisition',
    rows: 8,
    columns: 4,
    dataPoints: 32,
    columns_info: [
      { name: 'product', type: 'text', description: 'Product name' },
      { name: 'sales', type: 'number', description: 'Total sales volume' },
      { name: 'profit', type: 'number', description: 'Profit margin' },
      { name: 'customers', type: 'number', description: 'Number of customers' },
    ],
    category: 'Products',
    lastUpdated: '2024-03-12',
    createdBy: 'Product Team',
    tags: ['products', 'performance', 'metrics', 'kpi'],
  },
];

const ChartCreatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('datasetId');
  const [selectedChartType, setSelectedChartType] = useState<string>('');

  // Get dataset info
  const dataset = datasetId ? mockDatasets.find(d => d.id === parseInt(datasetId)) : null;

  const handleBack = () => {
    navigate(Routers.WORKSPACE_DATASETS);
  };

  const handleChartTypeSelect = (chartType: string) => {
    setSelectedChartType(chartType);
  };

  const handleCreateChart = () => {
    if (!selectedChartType) return;

    const chartConfig = chartTypes.find(ct => ct.type === selectedChartType);
    if (chartConfig) {
      // Navigate to chart editor with dataset info
      const params = new URLSearchParams({
        datasetId: datasetId || '',
        datasetName: dataset?.name || '',
        mode: 'create',
      });
      navigate(`${chartConfig.route}?${params.toString()}`);
    }
  };

  const handleSelectDataset = () => {
    navigate(Routers.WORKSPACE_DATASETS);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspace
          </Button>
          <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Chart
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Transform your data into beautiful, interactive visualizations
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Dataset Info Sidebar */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Dataset Information</CardTitle>
                    <CardDescription>Source data for your visualization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {dataset ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                        {dataset.name}
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {dataset.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{dataset.rows}</p>
                        <p className="text-xs text-muted-foreground">Rows</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-emerald-600">{dataset.columns}</p>
                        <p className="text-xs text-muted-foreground">Columns</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Column Structure
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {dataset.columns_info.map((col, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{col.name}</p>
                              {col.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {col.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {col.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="secondary">{dataset.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Points:</span>
                        <span className="font-medium">{dataset.dataPoints}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(dataset.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleSelectDataset}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Change Dataset
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">No Dataset Selected</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Choose a dataset to start creating your chart
                    </p>
                    <Button
                      onClick={handleSelectDataset}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Select Dataset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Type Selection */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Choose Chart Type</CardTitle>
                    <CardDescription>
                      Select the perfect visualization for your data story
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3">
                  {chartTypes.map(chartType => (
                    <div
                      key={chartType.type}
                      className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                        selectedChartType === chartType.type
                          ? `${chartType.borderColor} ${chartType.bgColor} shadow-lg scale-105`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => handleChartTypeSelect(chartType.type)}
                    >
                      <div className="text-center space-y-4">
                        <div
                          className={`mx-auto p-4 rounded-2xl bg-gradient-to-br ${chartType.color} text-white shadow-lg w-fit`}
                        >
                          {chartType.icon}
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-bold text-lg">{chartType.name}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {chartType.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Key Features
                          </h4>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {chartType.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Best for:</span> {chartType.bestFor}
                          </p>
                        </div>
                      </div>

                      {selectedChartType === chartType.type && (
                        <div className="absolute top-3 right-3">
                          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <div className="h-2 w-2 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedChartType && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                          Ready to create your{' '}
                          {chartTypes.find(ct => ct.type === selectedChartType)?.name}?
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          You'll be able to customize colors, labels, and all visual settings in the
                          editor
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          onClick={handleCreateChart}
                          disabled={!dataset}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        >
                          Create Chart
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCreatorPage;
