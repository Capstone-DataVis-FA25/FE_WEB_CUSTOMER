import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Database,
  Calendar,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';

import Routers from '@/router/routers';
import CustomExcel from '@/components/excel/CustomExcel';

// Type for header with data
interface DatasetHeader {
  name: string;
  data?: (string | number)[];
}

const DatasetDetailPage: React.FC = () => {
  const { id: legacyId, slug } = useParams<{ id?: string; slug?: string }>();
  const rawParam = slug || legacyId || '';
  const extractedId = rawParam.split('-').pop() || rawParam;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();
  const modalConfirm = useModalConfirm();

  const {
    currentDataset,
    loading,
    deleting,
    error,
    getDatasetById,
    deleteDataset,
    clearDatasetError,
    clearCurrent,
  } = useDataset();

  const [activeTab, setActiveTab] = useState<'data' | 'info'>('data');
  const [selectedChartType, setSelectedChartType] = useState('bar');

  // Fetch dataset on component mount
  useEffect(() => {
    if (extractedId) {
      getDatasetById(extractedId);
    }
    return () => {
      clearCurrent();
    };
  }, [extractedId, getDatasetById, clearCurrent]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError(t('dataset_error', 'Error'), error);
      clearDatasetError();
    }
  }, [error, showError, t, clearDatasetError]);

  // Handle delete dataset
  const handleDeleteDataset = async () => {
    if (!currentDataset) return;

    modalConfirm.openConfirm(async () => {
      try {
        await deleteDataset(currentDataset.id).unwrap();
        // build list route
        navigate(Routers.DATASETS);
        showSuccess(
          t('dataset_deleteSuccess', 'Dataset Deleted'),
          t(
            'dataset_deleteSuccessMessage',
            `Dataset "${currentDataset.name}" has been deleted successfully`
          )
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t('dataset_deleteErrorMessage', 'Failed to delete dataset');
        showError(t('dataset_deleteError', 'Delete Failed'), message);
      }
    });
  };

  // Handle export dataset
  const handleExportDataset = () => {
    if (!currentDataset) return;

    // Build tableData from headers (same logic as below)
    const headerNames = currentDataset.headers?.map(h => h.name) || [];
    const rowCount = currentDataset.rowCount || 0;
    const rows: string[][] = Array.from({ length: rowCount }, () =>
      Array(headerNames.length).fill('')
    );
    currentDataset.headers?.forEach((h, colIdx) => {
      (h as DatasetHeader).data?.forEach((cell: string | number, rowIdx: number) => {
        if (rows[rowIdx]) rows[rowIdx][colIdx] = String(cell ?? '');
      });
    });

    const csvContent = [headerNames, ...rows]
      .map((row: string[]) => row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDataset.name}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess(
      t('dataset_exportSuccess', 'Export Successful'),
      t('dataset_exportSuccessMessage', 'Dataset has been exported successfully')
    );
  };

  // Handle create chart
  const handleCreateChart = () => {
    if (!currentDataset) return;

    console.log('Navigating to chart gallery with dataset:', {
      id: currentDataset.id,
      name: currentDataset.name,
      chartType: selectedChartType,
    });

    // Navigate to chart gallery page with dataset ID and selected chart type
    navigate(Routers.CHART_GALLERY, {
      state: {
        datasetId: currentDataset.id,
        datasetName: currentDataset.name,
        chartType: selectedChartType,
        activeTab: 'template', // Start with template selection
      },
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentDataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl p-8 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('dataset_notFound', 'Dataset Not Found')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t(
              'dataset_notFoundMessage',
              'The dataset you are looking for does not exist or you do not have access to it.'
            )}
          </p>
          <Button
            onClick={() => navigate(Routers.WORKSPACE_DATASETS)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('dataset_backToList', 'Back to Datasets')}
          </Button>
        </Card>
      </div>
    );
  }

  // Build structured columns + rows for CustomExcel (first row is headers in edit page; here we send body & columns separately)
  let bodyRows: string[][] = [];
  let columnDefs: { name: string; type: 'string' }[] = [];
  if (currentDataset.headers && currentDataset.headers.length) {
    columnDefs = currentDataset.headers.map(h => ({ name: h.name, type: 'string' as const }));
    const rowCount = currentDataset.rowCount;
    bodyRows = Array.from({ length: rowCount }, () => Array(columnDefs.length).fill(''));
    currentDataset.headers.forEach((h, idx) => {
      (h as DatasetHeader).data?.forEach((cell: string | number, rowIdx: number) => {
        if (bodyRows[rowIdx]) bodyRows[rowIdx][idx] = String(cell ?? '');
      });
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(Routers.WORKSPACE_DATASETS)}
              className="flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('dataset_backToList', 'Back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                {currentDataset.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {currentDataset.description || t('dataset_noDescription', 'No description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportDataset}
              className="flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              {t('dataset_export', 'Export')}
            </Button>
            <div className="flex items-center gap-2">
              <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleCreateChart}
                className="flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                {t('dataset_create_chart', 'Create Chart')}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                navigate(Routers.EDIT_DATASET, {
                  state: { datasetId: currentDataset.id, from: window.location.pathname },
                })
              }
              className="flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              {t('dataset_edit', 'Edit')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDataset}
              disabled={deleting}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {t('dataset_delete', 'Delete')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            {t('dataset_tabData', 'Data')}
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            {t('dataset_tabInfo', 'Information')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'data' ? (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('dataset_dataPreview', 'Data Preview')}
                <span className="text-sm font-normal text-gray-500">
                  ({currentDataset.rowCount} rows × {currentDataset.columnCount} columns)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomExcel initialData={bodyRows} initialColumns={columnDefs} mode="view" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dataset Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('dataset_information', 'Dataset Information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dataset_name', 'Name')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{currentDataset.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dataset_description', 'Description')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {currentDataset.description || t('dataset_noDescription', 'No description')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dataset_dimensions', 'Dimensions')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {currentDataset.rowCount} rows × {currentDataset.columnCount} columns
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t('dataset_metadata', 'Metadata')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dataset_createdAt', 'Created')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(currentDataset.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dataset_updatedAt', 'Last Updated')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(currentDataset.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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

export default DatasetDetailPage;
