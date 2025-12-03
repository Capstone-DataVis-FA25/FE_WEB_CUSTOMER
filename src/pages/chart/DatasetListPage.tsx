import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { Plus, Database, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Routers from '@/router/routers';
import { useDataset } from '@/features/dataset/useDataset';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import type { Dataset } from '@/features/dataset/datasetAPI';
import ToastContainer from '@/components/ui/toast-container';
import useToast from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
// import { DatasetTab } from '../workspace';
import DatasetTab from '../dataset/components/DatasetTab';

const DatasetListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();
  const { datasets, loading, deleting, error, getDatasets, deleteDataset, clearDatasetError } =
    useDataset();

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // State for createdAt filter - initialized from URL
  const [createdAtFrom, setCreatedAtFrom] = useState<Date | null>(getInitialFromDate());
  const [createdAtTo, setCreatedAtTo] = useState<Date>(getInitialToDate());
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

      navigate(`?${newSearchParams.toString()}`, { replace: true });
    },
    [searchParams, navigate]
  );

  // Pagination for datasets - initialize with URL page
  const datasetPagination = usePagination({
    initialPage: getCurrentPageFromURL(),
    initialPageSize: 8,
    totalItems: 0, // Will be updated when datasets are loaded
  });

  // Fetch datasets on component mount
  useEffect(() => {
    getDatasets();
  }, [getDatasets]);

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

  // Filter datasets - using real API data
  let allFilteredDatasets = Array.isArray(datasets)
    ? datasets.filter(dataset => {
        // Search filter
        const matchesSearch =
          dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // CreatedAt filter
        let matchesDate = true;
        if (createdAtFrom) {
          matchesDate = matchesDate && new Date(dataset.createdAt) >= new Date(createdAtFrom);
        }
        if (createdAtTo) {
          // To date is inclusive
          const toDate = new Date(createdAtTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && new Date(dataset.createdAt) <= toDate;
        }

        return matchesSearch && matchesDate;
      })
    : [];

  // Sort by createdAt
  allFilteredDatasets = allFilteredDatasets.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Update total items for pagination when filtered datasets change
  useEffect(() => {
    datasetPagination.setTotalItems(allFilteredDatasets.length);
  }, [allFilteredDatasets.length, datasetPagination.setTotalItems]);

  // Sync pagination page changes to URL
  useEffect(() => {
    const currentPage = datasetPagination.pagination.currentPage;
    const urlPage = getCurrentPageFromURL();
    if (currentPage !== urlPage) {
      updateURL({
        page: currentPage,
        sort: sortOrder,
        fromDate: createdAtFrom,
        toDate: createdAtTo,
      });
    }
  }, [
    datasetPagination.pagination.currentPage,
    sortOrder,
    createdAtFrom,
    createdAtTo,
    updateURL,
    getCurrentPageFromURL,
  ]);

  // Get paginated datasets
  const filteredDatasets = allFilteredDatasets.slice(
    datasetPagination.getOffset(),
    datasetPagination.getOffset() + datasetPagination.getLimit()
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

  const handleCreateDataset = () => {
    navigate(Routers.CREATE_DATASET);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCreatedAtFrom(null);
    setCreatedAtTo(new Date());
    setSortOrder('newest');
    datasetPagination.setPage(1);

    // Reset URL to clean state
    navigate('?page=1', { replace: true });
  };

  // While initial fetch is in-flight and no items yet, show only header + a scoped spinner
  const isInitialLoading = loading && allFilteredDatasets.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Main content */}
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section - Enhanced */}
        <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Datasets
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage and organize your datasets for powerful data visualization
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4 text-blue-500" />
                <span>{allFilteredDatasets.length} datasets</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleCreateDataset}
              type="button"
              className="h-11 px-6 border-2 border-blue-300 hover:border-blue-500 rounded-2xl backdrop-blur-sm text-left flex items-center justify-center shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>New Dataset</span>
            </button>
          </div>
        </div>

        {isInitialLoading ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-220px)]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Search & Filter - Enhanced */}
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0">
                  {/* Search */}
                  <div className="flex-1">
                    <Label htmlFor="search-dataset" className="mb-1 block">
                      Search
                    </Label>
                    <div className="w-full relative">
                      <Input
                        id="search-dataset"
                        placeholder="Search datasets by name or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-11 px-4 pr-10 text-base font-semibold !border-blue-300 !border-2 focus:!border-blue-500 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:!border-blue-500 hover:bg-blue-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="16"
                            rx="4"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                          <path
                            d="M8 11h8M8 15h8"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                  {/* CreatedAt filter & Sort */}
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
                          <SelectTrigger className="w-full h-11 px-4 pr-10 text-base font-semibold !border-blue-300 !border-2 focus:!border-blue-500 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:!border-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-0">
                            <span className="flex items-center gap-2">
                              {sortOrder === 'newest' ? (
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                                  <path
                                    d="M12 6v6l4 2"
                                    stroke="#3b82f6"
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
                                    stroke="#a78bfa"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 12h8M8 16h8"
                                    stroke="#a78bfa"
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
                                  <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                                  <path
                                    d="M12 6v6l4 2"
                                    stroke="#3b82f6"
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
                                    stroke="#a78bfa"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 12h8M8 16h8"
                                    stroke="#a78bfa"
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
                      <Label htmlFor="createdAtFrom" className="mb-1 block">
                        From date
                      </Label>
                      <div className="relative">
                        <DatePicker
                          id="createdAtFrom"
                          selected={createdAtFrom}
                          onChange={date => {
                            setCreatedAtFrom(date);
                            datasetPagination.setPage(1);
                            if (date && createdAtTo && date > createdAtTo) {
                              // Nếu chọn ngày sau ToDate thì ToDate = ngày đó
                              setCreatedAtTo(date);
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
                          className="w-full h-11 px-4 pr-10 text-base font-semibold !border-blue-300 !border-2 focus:!border-blue-500 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:!border-blue-500 hover:bg-blue-100"
                          customInput={
                            <div className="w-full h-11 flex items-center px-4 pr-10 text-base font-semibold border border-blue-300 focus:border-blue-500 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:border-blue-500 hover:bg-blue-100 cursor-pointer">
                              <input
                                type="text"
                                value={
                                  createdAtFrom ? createdAtFrom.toLocaleDateString('en-GB') : ''
                                }
                                readOnly
                                className="bg-transparent outline-none w-full cursor-pointer"
                                placeholder="Select date"
                              />
                              <span className="absolute right-3 pointer-events-none text-blue-400">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="16"
                                    rx="4"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 11h8M8 15h8"
                                    stroke="#3b82f6"
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
                      <Label htmlFor="createdAtTo" className="mb-1 block">
                        To date
                      </Label>
                      <div className="relative">
                        <DatePicker
                          id="createdAtTo"
                          selected={createdAtTo}
                          onChange={date => {
                            setCreatedAtTo(date as Date);
                            datasetPagination.setPage(1);
                            updateURL({ toDate: date as Date, page: 1 });
                          }}
                          minDate={createdAtFrom || undefined}
                          maxDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select date"
                          withPortal
                          portalId="root-portal"
                          className="w-full h-11 px-4 pr-10 text-base font-semibold !border-blue-300 !border-2 focus:!border-blue-500 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:!border-blue-500 hover:bg-blue-100"
                          customInput={
                            <div className="w-full h-11 flex items-center px-4 pr-10 text-base font-semibold border border-purple-300 focus:border-purple-500 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md transition-all duration-150 hover:border-purple-500 hover:bg-purple-100 cursor-pointer">
                              <input
                                type="text"
                                value={createdAtTo ? createdAtTo.toLocaleDateString('en-GB') : ''}
                                readOnly
                                className="bg-transparent outline-none w-full cursor-pointer"
                                placeholder="Select date"
                              />
                              <span className="absolute right-3 pointer-events-none text-blue-400">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="16"
                                    rx="4"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M8 11h8M8 15h8"
                                    stroke="#3b82f6"
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
                    {/* Reset Button */}
                    <div className="flex items-end">
                      <button
                        onClick={handleResetFilters}
                        type="button"
                        className="h-11 px-4 border-2 border-blue-300 hover:border-blue-500 rounded-2xl backdrop-blur-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datasets List */}
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

export default DatasetListPage;
