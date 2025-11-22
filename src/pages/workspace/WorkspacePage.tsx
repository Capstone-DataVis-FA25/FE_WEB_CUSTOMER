import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, BarChart3, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation, useSearchParams, Routes } from 'react-router-dom';
import Routers from '@/router/routers';
import { useDataset } from '@/features/dataset/useDataset';
import { useCharts } from '@/features/charts/useCharts';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import type { Dataset } from '@/features/dataset/datasetAPI';
// Minimal BaseChart type to avoid dependency on missing '@/features/charts/chartTypes'
type BaseChart = {
  id: string;
  name: string;
  description?: string;
  type: string;
  datasetId?: string;
  dataset?: { name?: string } | null;
  updatedAt: string;
};

// Extended Chart type for UI with additional optional fields
type Chart = BaseChart & {
  category?: string;
  isPublic?: boolean;
  views?: number;
  datasetName?: string;
};
import DatasetTab from './components/DatasetTab';
import ChartTab from './components/ChartTab';
import ToastContainer from '@/components/ui/toast-container';
import useToast from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const getTabFromPath = (pathname: string): 'datasets' | 'charts' => {
  if (pathname.startsWith(Routers.WORKSPACE_CHARTS)) return 'charts';
  return 'datasets';
};

const WorkspacePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null);
  const [selectingDatasetModal, setSelectingDatasetModal] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<'datasets' | 'charts'>(
    getTabFromPath(location.pathname)
  );
  // Get current page from URL, default to 1
  const getCurrentPageFromURL = () => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  };

  // Pagination for datasets - initialize with URL page
  const datasetPagination = usePagination({
    initialPage: getCurrentPageFromURL(),
    initialPageSize: 8,
    totalItems: 0, // Will be updated when datasets are loaded
  });

  // Pagination for charts - initialize with URL page
  const chartPagination = usePagination({
    initialPage: getCurrentPageFromURL(),
    initialPageSize: 8,
    totalItems: 0, // Will be updated when charts are loaded
  });

  // Determine current tab based on URL path
  useEffect(() => {
    const path = location.pathname;
    setCurrentTab(getTabFromPath(path));
  }, [location.pathname]);

  // Reset page về 1 khi đổi tab
  useEffect(() => {
    if (currentTab === 'datasets') {
      datasetPagination.setPage(1);
    } else if (currentTab === 'charts') {
      chartPagination.setPage(1);
    }
  }, [currentTab]);

  // Fetch datasets and charts on component mount
  useEffect(() => {
    getDatasets();
    getCharts();
  }, [getDatasets, getCharts]);

  // Removed full-page initial loading; each tab handles its own scoped loading state

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      console.error('Dataset API error:', error);
      const errorMessage =
        typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'An error occurred';

      // Don't show UUID validation errors as they're usually due to data corruption
      if (!errorMessage.includes('Invalid character') && !errorMessage.includes('findUnique')) {
        showError(t('dataset_error', 'Dataset Error'), errorMessage);
      }
      clearDatasetError();
    }
  }, [error, showError, t, clearDatasetError]);

  // Show error toast when charts error occurs
  useEffect(() => {
    if (chartsError) {
      console.error('Charts API error:', chartsError);
      const errorMessage =
        typeof chartsError === 'string'
          ? chartsError
          : chartsError && typeof chartsError === 'object' && 'message' in chartsError
            ? (chartsError as { message: string }).message
            : 'An error occurred';

      // Don't show UUID validation errors as they're usually due to data corruption
      if (!errorMessage.includes('Invalid character') && !errorMessage.includes('findUnique')) {
        showError(t('charts_error', 'Charts Error'), errorMessage);
      }
      clearChartError();
    }
  }, [chartsError, showError, t, clearChartError]);

  // No redirect; stay on /workspace and control tab via local state

  // Handle tab change by updating state (no route change)
  const handleTabChange = (value: string) => {
    if (value === 'datasets') {
      datasetPagination.setPage(1);
      setCurrentTab(value);
      navigate(Routers.WORKSPACE_DATASETS);
    } else if (value === 'charts') {
      chartPagination.setPage(1);
      setCurrentTab(value);
      navigate(Routers.WORKSPACE_CHARTS);
    }
  };

  // Filter datasets - using real API data
  const allFilteredDatasets = Array.isArray(datasets)
    ? datasets.filter(dataset => {
        const matchesSearch =
          dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(searchTerm.toLowerCase()));
        // Note: Real datasets don't have type field, so we'll show all for now
        return matchesSearch;
      })
    : [];

  // Update total items for pagination when filtered datasets change
  useEffect(() => {
    datasetPagination.setTotalItems(allFilteredDatasets.length);
  }, [allFilteredDatasets.length, datasetPagination.setTotalItems]);

  // Get paginated datasets
  const filteredDatasets = allFilteredDatasets.slice(
    datasetPagination.getOffset(),
    datasetPagination.getOffset() + datasetPagination.getLimit()
  );

  // Filter charts - using real API data
  const allFilteredCharts = Array.isArray(charts)
    ? charts.filter(chart => {
        const matchesSearch =
          chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (chart.description && chart.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = chartTypeFilter === 'all' || chart.type === chartTypeFilter;
        return matchesSearch && matchesType;
      })
    : [];

  // Update total items for charts pagination when filtered charts change
  useEffect(() => {
    chartPagination.setTotalItems(allFilteredCharts.length);
  }, [allFilteredCharts.length, chartPagination.setTotalItems]);

  // Get paginated charts
  const filteredCharts = allFilteredCharts.slice(
    chartPagination.getOffset(),
    chartPagination.getOffset() + chartPagination.getLimit()
  );

  // Handle delete dataset
  const handleDeleteDataset = async (dataset: Dataset) => {
    setDeletingId(dataset.id);
    modalConfirm.openConfirm(async () => {
      try {
        await deleteDataset(dataset.id).unwrap();

        // Calculate if current page will be empty after deletion
        const currentPage = datasetPagination.pagination.currentPage;
        const itemsOnCurrentPage = filteredDatasets.length;
        const totalItemsAfterDeletion = allFilteredDatasets.length - 1;

        // Check if we need to go back to previous page
        if (itemsOnCurrentPage === 1 && currentPage > 1) {
          // This was the last item on current page and we're not on page 1
          const newPage = Math.max(1, currentPage - 1);
          datasetPagination.setPage(newPage);
        } else if (totalItemsAfterDeletion === 0) {
          // No items left, go to page 1
          datasetPagination.setPage(1);
        }

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

        // Calculate if current page will be empty after deletion
        const currentPage = chartPagination.pagination.currentPage;
        const itemsOnCurrentPage = filteredCharts.length;
        const totalItemsAfterDeletion = allFilteredCharts.length - 1;

        // Check if we need to go back to previous page
        if (itemsOnCurrentPage === 1 && currentPage > 1) {
          // This was the last item on current page and we're not on page 1
          const newPage = Math.max(1, currentPage - 1);
          chartPagination.setPage(newPage);
        } else if (totalItemsAfterDeletion === 0) {
          // No items left, go to page 1
          chartPagination.setPage(1);
        }

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

  const handleOpenModalSelectDataset = (open: boolean) => {
    setSelectingDatasetModal(open);
  };

  const handleCreateChart = (datasetId?: string) => {
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
      navigate(`${Routers.CHART_EDITOR}?chartId=${chartId}`);
    }
  };

  // While initial fetch is in-flight and no items yet, show only header + a scoped spinner
  const isInitialLoading =
    (loading || chartsLoading) &&
    allFilteredDatasets.length === 0 &&
    allFilteredCharts.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Main workspace content */}
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
                <span>{allFilteredDatasets.length} datasets</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>{allFilteredCharts.length} charts</span>
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

        {isInitialLoading ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-220px)]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Search and Filters - Enhanced */}
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search datasets and charts..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-full sm:w-[160px] h-12 border-2 border-gray-600 hover:border-gray-500 rounded-xl backdrop-blur-sm px-3 text-left flex items-center justify-between shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span className="truncate">
                            {(() => {
                              const labels: Record<string, string> = {
                                all: 'All types',
                                line: 'Line',
                                bar: 'Bar',
                                area: 'Area',
                              };
                              return labels[chartTypeFilter] || 'Filter by type';
                            })()}
                          </span>
                          <svg
                            className="ml-2 h-4 w-4 opacity-60"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-[99999] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 w-[160px]">
                        <DropdownMenuItem
                          className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setChartTypeFilter('all')}
                        >
                          All types
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setChartTypeFilter('line')}
                        >
                          Line
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setChartTypeFilter('bar')}
                        >
                          Bar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setChartTypeFilter('area')}
                        >
                          Area
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    <span>Datasets ({allFilteredDatasets.length})</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="charts"
                    className="flex items-center space-x-2 h-12 rounded-lg text-sm font-medium"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Charts ({allFilteredCharts.length})</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Datasets Tab */}
              <TabsContent value="datasets" className="space-y-6">
                <DatasetTab
                  loading={loading}
                  deleting={deleting}
                  filteredDatasets={filteredDatasets}
                  allFilteredDatasets={allFilteredDatasets}
                  searchTerm={searchTerm}
                  onCreateDataset={handleCreateDataset}
                  onDeleteDataset={handleDeleteDataset}
                  deletingId={deletingId}
                  pagination={datasetPagination}
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
                  allFilteredCharts={allFilteredCharts}
                  searchTerm={searchTerm}
                  onHandleOpenModalSelectedDataset={handleOpenModalSelectDataset}
                  onCreateChart={handleCreateChart}
                  onDeleteChart={handleDeleteChart}
                  onEditChart={handleEditChart}
                  deletingChartId={deletingChartId}
                  pagination={chartPagination}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        loading={modalConfirm.isLoading}
        type="danger"
        title={t('deleteConfirmTitle', 'Do you want to delete this?')}
        message={t(
          'deleteConfirmMessage',
          'This action cannot be undone if you proceed. Are you sure you want to continue?'
        )}
        confirmText={t('deleteConfirm', 'Delete')}
        cancelText={t('common_cancel', 'Cancel')}
      />
    </div>
  );
};

export default WorkspacePage;
