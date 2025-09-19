import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, BarChart3, Database, Search, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate, useLocation } from 'react-router-dom';
import Routers from '@/router/routers';
import { useDataset } from '@/features/dataset/useDataset';
import { useCharts } from '@/features/charts/useCharts';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import type { Dataset } from '@/features/dataset/datasetAPI';
import type { Chart } from '@/features/charts/chartTypes';
import ChartCard from './components/ChartCard';

const WorkspacePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToastContext();
  const modalConfirm = useModalConfirm();

  // Dataset API integration
  const { datasets, loading, deleting, error, getDatasets, deleteDataset, clearDatasetError } =
    useDataset();

  // Charts API integration - using real charts feature
  const {
    charts,
    loading: chartsLoading,
    deleting: chartDeleting,
    error: chartsError,
    getCharts,
    deleteChart,
    clearChartError,
  } = useCharts();

  const [searchTerm, setSearchTerm] = useState('');
  const [chartTypeFilter, setChartTypeFilter] = useState<string>('all');
  const [datasetTypeFilter, setDatasetTypeFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null);

  // Fetch datasets and charts on component mount
  useEffect(() => {
    getDatasets();
    getCharts();
  }, [getDatasets, getCharts]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError(t('dataset_error', 'Error'), error);
      clearDatasetError();
    }
  }, [error, showError, t, clearDatasetError]);

  // Show error toast when charts error occurs
  useEffect(() => {
    if (chartsError) {
      showError(t('charts_error', 'Charts Error'), chartsError);
      clearChartError();
    }
  }, [chartsError, showError, t, clearChartError]);

  // Determine current tab based on URL
  const getCurrentTab = () => {
    if (location.pathname === Routers.WORKSPACE_DATASETS) {
      return 'datasets';
    } else if (location.pathname === Routers.WORKSPACE_CHARTS) {
      return 'charts';
    }
    // Default to datasets for base workspace route
    return 'datasets';
  };

  const currentTab = getCurrentTab();

  // Redirect from base workspace URL to datasets
  useEffect(() => {
    if (location.pathname === Routers.WORKSPACE) {
      navigate(Routers.WORKSPACE_DATASETS, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Handle tab change by navigating to appropriate URL
  const handleTabChange = (value: string) => {
    if (value === 'datasets') {
      navigate(Routers.WORKSPACE_DATASETS);
    } else if (value === 'charts') {
      navigate(Routers.WORKSPACE_CHARTS);
    }
  };

  // Filter datasets - using real API data
  const filteredDatasets = Array.isArray(datasets)
    ? datasets.filter(dataset => {
        const matchesSearch =
          dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(searchTerm.toLowerCase()));
        // Note: Real datasets don't have type field, so we'll show all for now
        return matchesSearch;
      })
    : [];

  // Filter charts - using real API data
  const filteredCharts = Array.isArray(charts)
    ? charts.filter(chart => {
        const matchesSearch =
          chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (chart.description && chart.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = chartTypeFilter === 'all' || chart.type === chartTypeFilter;
        return matchesSearch && matchesType;
      })
    : [];

  // Format date helper (same as DatasetListPage)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return t('dataset_dateToday', 'today');
    } else if (diffDays === 2) {
      return t('dataset_dateYesterday', 'a day ago');
    } else if (diffDays <= 30) {
      return t('dataset_daysAgo', `${diffDays} days ago`);
    } else if (diffDays <= 60) {
      return t('dataset_monthAgo', 'a month ago');
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return t('dataset_monthsAgo', `${diffMonths} months ago`);
    }
  };

  // Handle delete dataset
  const handleDeleteDataset = async (dataset: Dataset) => {
    setDeletingId(dataset.id);
    modalConfirm.openConfirm(async () => {
      try {
        await deleteDataset(dataset.id).unwrap();
        showSuccess(
          t('dataset_deleteSuccess', 'Dataset Deleted'),
          t(
            'dataset_deleteSuccessMessage',
            `Dataset "${dataset.name}" has been deleted successfully`
          )
        );
      } catch (error: unknown) {
        const err = error as { message?: string };
        showError(
          t('dataset_deleteError', 'Delete Failed'),
          err.message || t('dataset_deleteErrorMessage', 'Failed to delete dataset')
        );
      } finally {
        setDeletingId(null);
      }
    });
  };

  // Handle delete chart
  const handleDeleteChart = async (chart: Chart) => {
    setDeletingChartId(chart.id);
    modalConfirm.openConfirm(async () => {
      try {
        await deleteChart(chart.id).unwrap();
        showSuccess(
          t('chart_deleteSuccess', 'Chart Deleted'),
          t('chart_deleteSuccessMessage', `Chart "${chart.name}" has been deleted successfully`)
        );
      } catch (error: unknown) {
        const err = error as { message?: string };
        showError(
          t('chart_deleteError', 'Delete Failed'),
          err.message || t('chart_deleteErrorMessage', 'Failed to delete chart')
        );
      } finally {
        setDeletingChartId(null);
      }
    });
  };

  const handleCreateDataset = () => {
    navigate(Routers.CREATE_DATASET);
  };

  const handleCreateChart = () => {
    // Navigate to chart creation page
    navigate(Routers.CHART_GALLERY);
  };

  const handleEditChart = (chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (chart) {
      switch (chart.type) {
        case 'line':
          navigate(`/chart-editor/line/${chartId}`);
          break;
        case 'bar':
          navigate(`/chart-editor/bar/${chartId}`);
          break;
        case 'area':
          navigate(`/chart-editor/area/${chartId}`);
          break;
        default:
          // Fallback to generic chart editor or show error
          console.warn(`Unknown chart type: ${chart.type}`);
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section - Enhanced */}
        <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Workspace
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create, manage, and visualize your data with powerful charts and analytics
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4 text-blue-500" />
                <span>{Array.isArray(datasets) ? datasets.length : 0} datasets</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>{filteredCharts.length} charts</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={() => handleCreateChart()}
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-200"
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

        {/* Search and Filters - Enhanced */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search datasets and charts..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
                />
              </div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <Select value={datasetTypeFilter} onValueChange={setDatasetTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm">
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
                  <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm">
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

        {/* Main Content - Enhanced Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-14 p-1 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <TabsTrigger
                value="datasets"
                className="flex items-center space-x-2 h-12 rounded-lg text-sm font-medium"
              >
                <Database className="h-4 w-4" />
                <span>Datasets ({filteredDatasets.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="flex items-center space-x-2 h-12 rounded-lg text-sm font-medium"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Charts ({filteredCharts.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-6">
            {loading && filteredDatasets.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner />
              </div>
            ) : filteredDatasets.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <Database className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">
                    {searchTerm ? 'No datasets found' : 'No datasets yet'}
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Create your first dataset to get started with data visualization'}
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDatasets.map(dataset => (
                  <Card
                    key={dataset.id}
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Database className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/datasets/${dataset.id}`)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(Routers.EDIT_DATASET, {
                                state: { datasetId: dataset.id, from: Routers.WORKSPACE_DATASETS },
                              })
                            }
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-50 hover:text-purple-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDataset(dataset)}
                            disabled={deleting && deletingId === dataset.id}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                          {dataset.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem]">
                          {dataset.description || 'No description available'}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                          <p className="text-xs text-muted-foreground font-medium">Rows</p>
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {dataset.rowCount || 0}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                          <p className="text-xs text-muted-foreground font-medium">Columns</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {dataset.columnCount || 0}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        <span className="font-medium">Updated {formatDate(dataset.updatedAt)}</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(Routers.CHART_GALLERY)}
                          className="flex-1 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-200"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Chart
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
            {chartsLoading && filteredCharts.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner />
              </div>
            ) : filteredCharts.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No charts found</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Create your first chart to start visualizing your data!'}
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
                  <ChartCard
                    key={chart.id}
                    chart={chart}
                    onEdit={handleEditChart}
                    onDelete={handleDeleteChart}
                    isDeleting={chartDeleting && deletingChartId === chart.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        loading={modalConfirm.isLoading}
        type="danger"
        title={t('dataset_deleteConfirmTitle', 'Delete Dataset')}
        message={t(
          'dataset_deleteConfirmMessage',
          'Are you sure you want to delete this dataset? This action cannot be undone.'
        )}
        confirmText={t('dataset_delete', 'Delete')}
        cancelText={t('common_cancel', 'Cancel')}
      />
    </div>
  );
};

export default WorkspacePage;
