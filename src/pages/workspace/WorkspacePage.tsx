import React, { useState } from 'react';
import {
  Plus,
  BarChart3,
  LineChart,
  AreaChart,
  Database,
  Search,
  TrendingUp,
  Calendar,
  Users,
  Eye,
  Edit3,
  Share,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import Routers from '@/router/routers';

// Mock data được cải thiện dựa trên data.ts
const mockDatasets = [
  {
    id: 1,
    name: 'Monthly Sales Data',
    description: 'Comprehensive sales data across e-commerce, retail, and wholesale channels',
    rows: 12,
    columns: 5,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10',
    size: '2.4 KB',
    type: 'CSV',
    category: 'Sales',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    preview: [
      { month: 'Jan', ecommerce: 125, retail: 980, wholesale: 750 },
      { month: 'Feb', ecommerce: 135, retail: 1020, wholesale: 780 },
      { month: 'Mar', ecommerce: 148, retail: 1150, wholesale: 820 },
    ],
  },
  {
    id: 2,
    name: 'Quarterly Revenue by Industry',
    description: 'Revenue breakdown across technology, healthcare, finance, and education sectors',
    rows: 6,
    columns: 5,
    createdAt: '2024-02-01',
    updatedAt: '2024-03-05',
    size: '1.8 KB',
    type: 'JSON',
    category: 'Finance',
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    preview: [
      { quarter: 'Q1 2024', technology: 3420, healthcare: 2850, finance: 4200 },
      { quarter: 'Q2 2024', technology: 3680, healthcare: 3100, finance: 4500 },
    ],
  },
  {
    id: 3,
    name: 'Product Performance Metrics',
    description: 'Detailed analysis of product sales, profit margins, and customer acquisition',
    rows: 8,
    columns: 4,
    createdAt: '2024-02-15',
    updatedAt: '2024-03-12',
    size: '3.2 KB',
    type: 'Excel',
    category: 'Analytics',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    preview: [
      { product: 'Product A', sales: 850, profit: 340, customers: 120 },
      { product: 'Product B', sales: 920, profit: 380, customers: 145 },
    ],
  },
  {
    id: 4,
    name: 'Device Usage Trends',
    description: 'Mobile, desktop, and tablet usage patterns across different time periods',
    rows: 12,
    columns: 4,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15',
    size: '1.9 KB',
    type: 'CSV',
    category: 'Analytics',
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    preview: [
      { month: 1, mobile: 45, desktop: 78, tablet: 23 },
      { month: 2, mobile: 52, desktop: 82, tablet: 28 },
    ],
  },
];

const mockCharts = [
  {
    id: 1,
    name: 'Sales Performance Trend',
    description: 'Monthly sales analysis showing growth patterns across all channels',
    type: 'line',
    datasetId: 1,
    datasetName: 'Monthly Sales Data',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-10',
    category: 'Performance',
    isPublic: true,
    views: 245,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    name: 'Revenue by Industry',
    description: 'Quarterly revenue comparison highlighting top-performing sectors',
    type: 'bar',
    datasetId: 2,
    datasetName: 'Quarterly Revenue by Industry',
    createdAt: '2024-02-05',
    updatedAt: '2024-03-08',
    category: 'Finance',
    isPublic: false,
    views: 156,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 3,
    name: 'Device Usage Distribution',
    description: 'Area chart showing cumulative device usage over time periods',
    type: 'area',
    datasetId: 4,
    datasetName: 'Device Usage Trends',
    createdAt: '2024-02-15',
    updatedAt: '2024-03-01',
    category: 'Analytics',
    isPublic: true,
    views: 189,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 4,
    name: 'Product Performance Matrix',
    description: 'Comprehensive view of product sales, profits, and customer metrics',
    type: 'bar',
    datasetId: 3,
    datasetName: 'Product Performance Metrics',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-12',
    category: 'Performance',
    isPublic: false,
    views: 98,
    color: 'from-purple-500 to-pink-500',
  },
];

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

const getCategoryColor = (category: string) => {
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

const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [chartTypeFilter, setChartTypeFilter] = useState<string>('all');
  const [datasetTypeFilter, setDatasetTypeFilter] = useState<string>('all');

  // Filter datasets
  const filteredDatasets = mockDatasets.filter(dataset => {
    const matchesSearch =
      dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      datasetTypeFilter === 'all' || dataset.type.toLowerCase() === datasetTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filter charts
  const filteredCharts = mockCharts.filter(chart => {
    const matchesSearch =
      chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = chartTypeFilter === 'all' || chart.type === chartTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateDataset = () => {
    navigate(Routers.CREATE_DATASET);
  };

  const handleCreateChart = (datasetId?: number) => {
    // Navigate to chart creation page
    if (datasetId) {
      navigate(`${Routers.CHART_CREATOR}?datasetId=${datasetId}`);
    } else {
      navigate(Routers.CHART_CREATOR);
    }
  };

  const handleEditChart = (chartId: number) => {
    // Navigate to chart editor based on chart type
    const chart = mockCharts.find(c => c.id === chartId);
    if (chart) {
      switch (chart.type) {
        case 'line':
          navigate(Routers.LINE_CHART_EDITOR_DEMO);
          break;
        case 'bar':
          navigate(Routers.BAR_CHART_EDITOR_DEMO);
          break;
        case 'area':
          navigate(Routers.AREA_CHART_EDITOR_DEMO);
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Workspace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create, manage, and visualize your data with powerful charts and analytics
            </p>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={() => handleCreateChart()}
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chart
            </Button>
            <Button
              onClick={handleCreateDataset}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>New Dataset</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-gray-800/60">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search datasets and charts..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <Select value={datasetTypeFilter} onValueChange={setDatasetTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Dataset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Datasets</SelectItem>
                    <SelectItem value="csv">CSV Files</SelectItem>
                    <SelectItem value="excel">Excel Files</SelectItem>
                    <SelectItem value="json">JSON Files</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chartTypeFilter} onValueChange={setChartTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Charts</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="datasets" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-white/60 backdrop-blur-sm dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700">
              <TabsTrigger value="datasets" className="flex items-center space-x-2 h-10 rounded-lg">
                <Database className="h-4 w-4" />
                <span className="font-medium">Datasets ({filteredDatasets.length})</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center space-x-2 h-10 rounded-lg">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Charts ({filteredCharts.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-6">
            {filteredDatasets.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <Database className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No datasets found</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Get started by creating your first dataset to begin visualizing your data'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleCreateDataset}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Dataset
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDatasets.map(dataset => (
                  <Card
                    key={dataset.id}
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-1">
                          <Badge variant="secondary" className="text-xs font-medium">
                            {dataset.type}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(dataset.category)}>
                            {dataset.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                          {dataset.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {dataset.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Rows</p>
                          <p className="font-semibold">{dataset.rows}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Columns</p>
                          <p className="font-semibold">{dataset.columns}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="font-semibold">{dataset.size}</p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {new Date(dataset.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateChart(dataset.id)}
                          className="flex-1 group-hover:border-blue-500 group-hover:text-blue-600"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Chart
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-blue-50 group-hover:text-blue-600"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {filteredCharts.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No charts found</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Transform your data into beautiful visualizations'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => handleCreateChart()}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Chart
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCharts.map(chart => (
                  <Card
                    key={chart.id}
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${chart.color} text-white shadow-lg`}
                        >
                          {getChartIcon(chart.type)}
                        </div>
                        <div className="flex flex-col space-y-1 items-end">
                          <Badge variant="outline" className="text-xs font-medium">
                            {getChartTypeLabel(chart.type)}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(chart.category)}>
                            {chart.category}
                          </Badge>
                          {chart.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg leading-tight hover:text-emerald-600 transition-colors cursor-pointer">
                          {chart.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {chart.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Database className="h-3 w-3" />
                          <span className="truncate">{chart.datasetName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{chart.views}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {new Date(chart.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChart(chart.id)}
                          className="flex-1 group-hover:border-emerald-500 group-hover:text-emerald-600"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-emerald-50 group-hover:text-emerald-600"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-blue-50 group-hover:text-blue-600"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspacePage;
