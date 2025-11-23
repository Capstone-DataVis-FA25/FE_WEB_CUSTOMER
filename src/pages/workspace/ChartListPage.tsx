import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Routers from '@/router/routers';
import { useCharts } from '@/features/charts/useCharts';
import { useDataset } from '@/features/dataset/useDataset';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import ChartTab from './components/ChartTab';
import ToastContainer from '@/components/ui/toast-container';
import useToast from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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

const ChartListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();

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

  // Datasets API integration - for dataset filter
  const { datasets, getDatasets } = useDataset();

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null);
  const [selectingDatasetModal, setSelectingDatasetModal] = useState<boolean>(false);

  // Get initial values from URL
  const getInitialFromDate = () => {
    const fromParam = searchParams.get('fromDate');
    return fromParam ? new Date(fromParam) : null;
  };

  const getInitialToDate = () => {
    const toParam = searchParams.get('toDate');
    return toParam ? new Date(toParam) : new Date();
  };

  const getInitialSortOrder = (): 'newest' | 'oldest' => {
    const sortParam = searchParams.get('sort');
    return sortParam === 'oldest' ? 'oldest' : 'newest';
  };

  const getInitialChartType = (): string => {
    const typeParam = searchParams.get('type');
    return typeParam || 'all';
  };

  const getInitialDatasetId = (): string => {
    const datasetParam = searchParams.get('dataset');
    return datasetParam || 'all';
  };

  // State for chart type filter - initialized from URL
  const [chartTypeFilter, setChartTypeFilter] = useState<string>(getInitialChartType());
  // State for dataset filter - initialized from URL
  const [datasetFilter, setDatasetFilter] = useState<string>(getInitialDatasetId());

  // State for updatedAt filter - initialized from URL
  const [updatedAtFrom, setUpdatedAtFrom] = useState<Date | null>(getInitialFromDate());
  const [updatedAtTo, setUpdatedAtTo] = useState<Date>(getInitialToDate());
  // State for sort order - initialized from URL
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>(getInitialSortOrder());

  // Get current page from URL, default to 1
  const getCurrentPageFromURL = () => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  };

  // Update URL with current filter state
  const updateURL = useCallback(
    (params: {
      page?: number;
      sort?: 'newest' | 'oldest';
      fromDate?: Date | null;
      toDate?: Date | null;
      type?: string;
      dataset?: string;
    }) => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (params.page !== undefined) {
        newSearchParams.set('page', params.page.toString());
      }

      if (params.sort !== undefined) {
        newSearchParams.set('sort', params.sort);
      }

      if (params.fromDate !== undefined) {
        if (params.fromDate) {
          newSearchParams.set('fromDate', params.fromDate.toISOString());
        } else {
          newSearchParams.delete('fromDate');
        }
      }

      if (params.toDate !== undefined) {
        if (params.toDate) {
          newSearchParams.set('toDate', params.toDate.toISOString());
        } else {
          newSearchParams.delete('toDate');
        }
      }

      if (params.type !== undefined) {
        if (params.type === 'all') {
          newSearchParams.delete('type');
        } else {
          newSearchParams.set('type', params.type);
        }
      }

      if (params.dataset !== undefined) {
        if (params.dataset === 'all') {
          newSearchParams.delete('dataset');
        } else {
          newSearchParams.set('dataset', params.dataset);
        }
      }

      navigate(`?${newSearchParams.toString()}`, { replace: true });
    },
    [searchParams, navigate]
  );

  // Pagination for charts - initialize with URL page
  const chartPagination = usePagination({
    initialPage: getCurrentPageFromURL(),
    initialPageSize: 8,
    totalItems: 0, // Will be updated when charts are loaded
  });

  // Fetch charts on component mount
  useEffect(() => {
    getCharts();
  }, [getCharts]);

  // Fetch datasets on component mount
  useEffect(() => {
    getDatasets();
  }, [getDatasets]);

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

  // Filter charts - using real API data
  let allFilteredCharts = Array.isArray(charts)
    ? charts.filter(chart => {
        const matchesSearch =
          chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (chart.description && chart.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = chartTypeFilter === 'all' || chart.type === chartTypeFilter;
        const matchesDataset = datasetFilter === 'all' || chart.datasetId === datasetFilter;

        // UpdatedAt filter
        let matchesDate = true;
        if (updatedAtFrom) {
          matchesDate = matchesDate && new Date(chart.updatedAt) >= new Date(updatedAtFrom);
        }
        if (updatedAtTo) {
          // To date is inclusive
          const toDate = new Date(updatedAtTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && new Date(chart.updatedAt) <= toDate;
        }

        return matchesSearch && matchesType && matchesDataset && matchesDate;
      })
    : [];

  // Sort by updatedAt
  allFilteredCharts = allFilteredCharts.sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Update total items for charts pagination when filtered charts change
  useEffect(() => {
    chartPagination.setTotalItems(allFilteredCharts.length);
  }, [allFilteredCharts.length, chartPagination.setTotalItems]);

  // Sync pagination page changes to URL
  useEffect(() => {
    const currentPage = chartPagination.pagination.currentPage;
    const urlPage = getCurrentPageFromURL();
    if (currentPage !== urlPage) {
      updateURL({
        page: currentPage,
        sort: sortOrder,
        fromDate: updatedAtFrom,
        toDate: updatedAtTo,
        type: chartTypeFilter,
        dataset: datasetFilter,
      });
    }
  }, [
    chartPagination.pagination.currentPage,
    sortOrder,
    updatedAtFrom,
    updatedAtTo,
    chartTypeFilter,
    datasetFilter,
    updateURL,
    getCurrentPageFromURL,
  ]);

  // Get paginated charts
  const filteredCharts = allFilteredCharts.slice(
    chartPagination.getOffset(),
    chartPagination.getOffset() + chartPagination.getLimit()
  );

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
  const isInitialLoading = chartsLoading && allFilteredCharts.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Main content */}
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section - Enhanced */}
        <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                My Charts
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create and manage your data visualizations with powerful chart tools
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>{allFilteredCharts.length} charts</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => handleCreateChart()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chart
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
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0">
                  {/* Search */}
                  <div className="flex-1">
                    <Label htmlFor="search-chart" className="mb-1 block">
                      Search
                    </Label>
                    <div className="w-full relative">
                      <Input
                        id="search-chart"
                        placeholder="Search charts by name or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-11 px-4 pr-10 text-base font-semibold !border-emerald-300 !border-2 focus:!border-emerald-500 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:!border-emerald-500 hover:bg-emerald-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="16"
                            rx="4"
                            stroke="#10b981"
                            strokeWidth="2"
                          />
                          <path
                            d="M8 11h8M8 15h8"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                  {/* UpdatedAt filter & Sort */}
                  <div className="flex flex-col md:flex-row md:items-end md:space-x-3">
                    <div>
                      <Label htmlFor="sortOrder" className="mb-1 block">
                        Sort by
                      </Label>
                      <div className="w-40">
                        <Select
                          value={sortOrder}
                          onValueChange={v => {
                            setSortOrder(v as 'newest' | 'oldest');
                            updateURL({ sort: v as 'newest' | 'oldest' });
                          }}
                        >
                          <SelectTrigger className="w-full h-11 px-4 pr-10 text-base font-semibold !border-emerald-300 !border-2 focus:!border-emerald-500 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:!border-emerald-500 hover:bg-emerald-100">
                            <span className="flex items-center gap-2">
                              {sortOrder === 'newest' ? (
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" />
                                  <path
                                    d="M12 6v6l4 2"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <rect
                                    x="4"
                                    y="4"
                                    width="16"
                                    height="16"
                                    rx="4"
                                    stroke="#14b8a6"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 12h8M8 16h8"
                                    stroke="#14b8a6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              )}
                              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">
                              <span className="flex items-center gap-2">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" />
                                  <path
                                    d="M12 6v6l4 2"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Newest
                              </span>
                            </SelectItem>
                            <SelectItem value="oldest">
                              <span className="flex items-center gap-2">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <rect
                                    x="4"
                                    y="4"
                                    width="16"
                                    height="16"
                                    rx="4"
                                    stroke="#14b8a6"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 12h8M8 16h8"
                                    stroke="#14b8a6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                Oldest
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="w-40">
                      <Label htmlFor="updatedAtFrom" className="mb-1 block">
                        From date
                      </Label>
                      <div className="relative">
                        <DatePicker
                          id="updatedAtFrom"
                          selected={updatedAtFrom}
                          onChange={date => {
                            setUpdatedAtFrom(date);
                            chartPagination.setPage(1);
                            if (date && updatedAtTo && date > updatedAtTo) {
                              setUpdatedAtTo(date);
                              updateURL({ fromDate: date, toDate: date, page: 1 });
                            } else {
                              updateURL({ fromDate: date, page: 1 });
                            }
                          }}
                          maxDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select date"
                          withPortal
                          portalId="root-portal"
                          className="w-full h-11 px-4 pr-10 text-base font-semibold border border-emerald-300 focus:border-emerald-500 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:border-emerald-500 hover:bg-emerald-100"
                          customInput={
                            <div className="w-full h-11 flex items-center px-4 pr-10 text-base font-semibold border border-emerald-300 focus:border-emerald-500 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:border-emerald-500 hover:bg-emerald-100 cursor-pointer">
                              <input
                                type="text"
                                value={
                                  updatedAtFrom ? updatedAtFrom.toLocaleDateString('en-GB') : ''
                                }
                                readOnly
                                className="bg-transparent outline-none w-full cursor-pointer"
                                placeholder="Select date"
                              />
                              <span className="absolute right-3 pointer-events-none text-emerald-400">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="16"
                                    rx="4"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 11h8M8 15h8"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          }
                        />
                      </div>
                    </div>
                    <div className="w-40">
                      <Label htmlFor="updatedAtTo" className="mb-1 block">
                        To date
                      </Label>
                      <div className="relative">
                        <DatePicker
                          id="updatedAtTo"
                          selected={updatedAtTo}
                          onChange={date => {
                            setUpdatedAtTo(date as Date);
                            chartPagination.setPage(1);
                            updateURL({ toDate: date as Date, page: 1 });
                          }}
                          minDate={updatedAtFrom || undefined}
                          maxDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select date"
                          withPortal
                          portalId="root-portal"
                          className="w-full h-11 px-4 pr-10 text-base font-semibold border border-teal-300 focus:border-teal-500 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:border-teal-500 hover:bg-teal-100"
                          customInput={
                            <div className="w-full h-11 flex items-center px-4 pr-10 text-base font-semibold border border-teal-300 focus:border-teal-500 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:border-teal-500 hover:bg-teal-100 cursor-pointer">
                              <input
                                type="text"
                                value={updatedAtTo ? updatedAtTo.toLocaleDateString('en-GB') : ''}
                                readOnly
                                className="bg-transparent outline-none w-full cursor-pointer"
                                placeholder="Select date"
                              />
                              <span className="absolute right-3 pointer-events-none text-teal-400">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="16"
                                    rx="4"
                                    stroke="#14b8a6"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 11h8M8 15h8"
                                    stroke="#14b8a6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="chartTypeFilter" className="mb-1 block">
                        Chart Type
                      </Label>
                      <div className="w-40">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="w-full h-11 border border-emerald-300 hover:border-emerald-500 rounded-2xl backdrop-blur-sm px-4 text-left flex items-center justify-between shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"
                            >
                              <span className="truncate font-semibold">
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
                              onClick={() => {
                                setChartTypeFilter('all');
                                chartPagination.setPage(1);
                                updateURL({ type: 'all', page: 1 });
                              }}
                            >
                              All types
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => {
                                setChartTypeFilter('line');
                                chartPagination.setPage(1);
                                updateURL({ type: 'line', page: 1 });
                              }}
                            >
                              Line
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => {
                                setChartTypeFilter('bar');
                                chartPagination.setPage(1);
                                updateURL({ type: 'bar', page: 1 });
                              }}
                            >
                              Bar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => {
                                setChartTypeFilter('area');
                                chartPagination.setPage(1);
                                updateURL({ type: 'area', page: 1 });
                              }}
                            >
                              Area
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="datasetFilter" className="mb-1 block">
                        Dataset
                      </Label>
                      <div className="w-48">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="w-full h-11 border border-emerald-300 hover:border-emerald-500 rounded-2xl backdrop-blur-sm px-4 text-left flex items-center justify-between shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"
                            >
                              <span className="truncate font-semibold">
                                {(() => {
                                  if (datasetFilter === 'all') return 'All datasets';
                                  const selectedDataset = datasets?.find(
                                    d => d.id === datasetFilter
                                  );
                                  return selectedDataset?.name || 'Select dataset';
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
                          <DropdownMenuContent className="z-[99999] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 w-[200px] max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem
                              className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => {
                                setDatasetFilter('all');
                                chartPagination.setPage(1);
                                updateURL({ dataset: 'all', page: 1 });
                              }}
                            >
                              All datasets
                            </DropdownMenuItem>
                            {Array.isArray(datasets) &&
                              datasets.map(dataset => (
                                <DropdownMenuItem
                                  key={dataset.id}
                                  className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                  onClick={() => {
                                    setDatasetFilter(dataset.id);
                                    chartPagination.setPage(1);
                                    updateURL({ dataset: dataset.id, page: 1 });
                                  }}
                                >
                                  {dataset.name}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts List */}
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

export default ChartListPage;
