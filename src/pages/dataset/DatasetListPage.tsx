import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Database, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import type { Dataset } from '@/features/dataset/datasetAPI';
import Routers from '@/router/routers';

const DatasetListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const modalConfirm = useModalConfirm();

  const { datasets, loading, deleting, error, getDatasets, deleteDataset, clearDatasetError } =
    useDataset();

  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch datasets on component mount
  useEffect(() => {
    getDatasets();
  }, [getDatasets]);

  // DEBUG DATASET
  console.log(`Dataset ID: ${datasets.length}`);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError(t('dataset_error', 'Error'), error);
      clearDatasetError();
    }
  }, [error, showError, t, clearDatasetError]);

  // Filter datasets based on search query
  const filteredDatasets = Array.isArray(datasets)
    ? datasets.filter(
        dataset =>
          dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

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
        const message =
          error instanceof Error
            ? error.message
            : t('dataset_deleteErrorMessage', 'Failed to delete dataset');
        showError(t('dataset_deleteError', 'Delete Failed'), message);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleCreateChart = (dataset: Dataset) => {
    console.log('DatasetListPage - handleCreateChart called with dataset:', dataset);
    console.log('DatasetListPage - Navigating to:', Routers.CHART_GALLERY);
    console.log('DatasetListPage - State data:', {
      datasetId: dataset.id,
      datasetName: dataset.name,
      activeTab: 'data',
    });

    navigate(Routers.CHART_GALLERY, {
      state: {
        datasetId: dataset.id,
        datasetName: dataset.name,
        activeTab: 'template', // Start with template selection
      },
    });
  };

  // Format date
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

  if (loading && (datasets || []).length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              {t('dataset_title', 'Datasets')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('dataset_subtitle', 'Manage your data collections')}
            </p>
          </div>
          <Button
            onClick={() => navigate('/datasets/create')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            {t('dataset_newDataset', 'New data set')}
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('dataset_searchPlaceholder', 'Search datasets...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Datasets Table */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t('dataset_yourDatasets', 'Your Datasets')}
              <span className="text-sm font-normal text-gray-500">({filteredDatasets.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDatasets.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery
                    ? t('dataset_noSearchResults', 'No datasets found')
                    : t('dataset_noDatasets', 'No datasets yet')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchQuery
                    ? t('dataset_noSearchResultsDesc', 'Try adjusting your search criteria')
                    : t('dataset_noDatasetsDesc', 'Create your first dataset to get started')}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/datasets/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('dataset_createFirst', 'Create your first dataset')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t('dataset_columnName', 'Name')} ▼
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t('dataset_columnDescription', 'Description')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t('dataset_columnSize', 'Size')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t('dataset_columnLastUpdated', 'Last updated')} ▼
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t('dataset_columnActions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDatasets.map(dataset => (
                      <tr
                        key={dataset.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {dataset.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600 dark:text-gray-300 max-w-xs truncate">
                            {dataset.description || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {dataset.rowCount} × {dataset.columnCount}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-3 h-3" />
                            {formatDate(dataset.updatedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/datasets/${buildSlug(dataset)}`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title={t('dataset_view', 'View')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCreateChart(dataset)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                              title={t('dataset_createChart', 'Create Chart')}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(Routers.EDIT_DATASET, {
                                  state: { datasetId: dataset.id, from: Routers.DATASETS },
                                })
                              }
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                              title={t('dataset_edit', 'Edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDataset(dataset)}
                              disabled={deleting && deletingId === dataset.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                              title={t('dataset_delete', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
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

export default DatasetListPage;

// helper to build slug from dataset (duplicated also in detail page; consider centralizing later)
function buildSlug(ds: { id: string; name?: string }) {
  const namePart = (ds.name || 'dataset')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
  return `${namePart}-${ds.id}`;
}
