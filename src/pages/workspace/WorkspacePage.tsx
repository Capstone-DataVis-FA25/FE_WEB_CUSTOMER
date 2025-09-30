import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, BarChart3, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import type { Dataset } from '@/features/dataset/datasetAPI';
import type { Chart as BaseChart } from '@/features/charts/chartTypes';

// const mockCharts = [
//   {
//     id: 1,
//     name: 'Sales Performance Trend',
//     description: 'Monthly sales analysis showing growth patterns across all channels',
//     type: 'line',
//     datasetId: 1,
//     datasetName: 'Monthly Sales Data',
//     createdAt: '2024-01-20',
//     updatedAt: '2024-03-10',
//     category: 'Performance',
//     isPublic: true,
//     views: 245,
//     color: 'from-blue-500 to-cyan-500',
//   },
//   {
//     id: 2,
//     name: 'Revenue by Industry',
//     description: 'Quarterly revenue comparison highlighting top-performing sectors',
//     type: 'bar',
//     datasetId: 2,
//     datasetName: 'Quarterly Revenue by Industry',
//     createdAt: '2024-02-05',
//     updatedAt: '2024-03-08',
//     category: 'Finance',
//     isPublic: false,
//     views: 156,
//     color: 'from-emerald-500 to-teal-500',
//   },
//   {
//     id: 3,
//     name: 'Device Usage Distribution',
//     description: 'Area chart showing cumulative device usage over time periods',
//     type: 'area',
//     datasetId: 4,
//     datasetName: 'Device Usage Trends',
//     createdAt: '2024-02-15',
//     updatedAt: '2024-03-01',
//     category: 'Analytics',
//     isPublic: true,
//     views: 189,
//     color: 'from-orange-500 to-red-500',
//   },
//   {
//     id: 4,
//     name: 'Product Performance Matrix',
//     description: 'Comprehensive view of product sales, profits, and customer metrics',
//     type: 'bar',
//     datasetId: 3,
//     datasetName: 'Product Performance Metrics',
//     createdAt: '2024-03-01',
//     updatedAt: '2024-03-12',
//     category: 'Performance',
//     isPublic: false,
//     views: 98,
//     color: 'from-purple-500 to-pink-500',
//   },
// ];

// Chart icon
// const getChartIcon = (type: string) => {
//   switch (type) {
//     case 'line':
//       return <LineChart className="h-4 w-4" />;
//     case 'bar':
//       return <BarChart3 className="h-4 w-4" />;
//     case 'area':
//       return <AreaChart className="h-4 w-4" />;
//     default:
//       return <BarChart3 className="h-4 w-4" />;
//   }
// };

// Thêm chart label ở đây
// const getChartTypeLabel = (type: string) => {
//   switch (type) {
//     case 'line':
//       return 'Line Chart';
//     case 'bar':
//       return 'Bar Chart';
//     case 'area':
//       return 'Area Chart';
//     default:
//       return 'Chart';
//   }
// };
// const getCategoryColor = (category: string) => {
//   switch (category) {
//     case 'Sales':
//       return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
//     case 'Finance':
//       return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
//     case 'Analytics':
//       return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
//     case 'Performance':
//       return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
//     default:
//       return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
//   }
// };

// Extended Chart type for UI with additional optional fields
type Chart = BaseChart & {
  category?: string;
  isPublic?: boolean;
  views?: number;
  datasetName?: string;
};
import DatasetTab from './components/DatasetTab';
import ChartTab from './components/ChartTab';

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
  const [selectingDatasetModal, setSelectingDatasetModal] = useState<boolean>(false);

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
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = Math.abs(now.getTime() - date.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //   if (diffDays === 1) {
  //     return t('dataset_dateToday', 'today');
  //   } else if (diffDays === 2) {
  //     return t('dataset_dateYesterday', 'a day ago');
  //   } else if (diffDays <= 30) {
  //     return t('dataset_daysAgo', `${diffDays} days ago`);
  //   } else if (diffDays <= 60) {
  //     return t('dataset_monthAgo', 'a month ago');
  //   } else {
  //     const diffMonths = Math.floor(diffDays / 30);
  //     return t('dataset_monthsAgo', `${diffMonths} months ago`);
  //   }
  // };

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

  const handleOpenModalSelectDataset = () => {};

  const handleCreateChart = (datasetId?: string) => {
    // Thường thì rơi vào trường hợp không có dataset -> hiện button create chart
    // 1. Hiện modal chọn dataset
    // 2. Sau khi chọn dataset -> 'Continue (trong modal)' -> create chart
    // Điều hướng sang trang chart gallery kèm dataset_id
    if (datasetId) {
      navigate(Routers.CHART_GALLERY, {
        state: { datasetId },
      });
    } else {
      navigate(Routers.CHART_GALLERY);
    }
  };

  const handleEditChart = (chartId: string) => {
    const chart = charts.find((c: Chart) => c.id === chartId);
    if (chart) {
      // Navigate to chart editor with chart ID and type as query parameters
      const params = new URLSearchParams({
        chartId: chartId,
        typeChart: chart.type,
        mode: 'edit',
      });
      navigate(`/chart-editor?${params.toString()}`);
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
            <DatasetTab
              datasets={datasets}
              loading={loading}
              deleting={deleting}
              filteredDatasets={filteredDatasets}
              searchTerm={searchTerm}
              onCreateDataset={handleCreateDataset}
              onDeleteDataset={handleDeleteDataset}
              deletingId={deletingId}
            />
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <ChartTab
              charts={charts}
              chartsLoading={chartsLoading}
              chartDeleting={chartDeleting}
              datasetSelectingModal={selectingDatasetModal}
              filteredCharts={filteredCharts}
              searchTerm={searchTerm}
              onHandleOpenModalSelectedDataset={handleOpenModalSelectDataset}
              onCreateChart={handleCreateChart}
              onDeleteChart={handleDeleteChart}
              onEditChart={handleEditChart}
              deletingChartId={deletingChartId}
            />
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
