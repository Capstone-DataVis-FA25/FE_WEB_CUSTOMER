'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlideInUp } from '@/theme/animation';
import { ArrowLeft, Edit, Trash2, Download, Database, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';

import Routers from '@/router/routers';
import CustomExcel from '@/components/excel/CustomExcel';

// Define types for dataset header and cell
interface DatasetHeader {
  name: string;
  data?: (string | number | null)[];
}

const DatasetDetailPage: React.FC = () => {
  const { id: legacyId, slug } = useParams<{ id?: string; slug?: string }>();
  const location = useLocation() as any;
  const stateDatasetId = location?.state?.datasetId as string | undefined;
  const rawParam = slug || legacyId || stateDatasetId || '';
  // Extract UUID (with hyphens) or fallback to legacy id
  let extractedId = rawParam;
  const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = rawParam.match(uuidRegex);
  if (match) {
    extractedId = match[0];
  }
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
        let errorMessage = t('dataset_deleteErrorMessage', 'Failed to delete dataset');
        if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
        ) {
          errorMessage = (error as { message: string }).message;
        }
        showError(t('dataset_deleteError', 'Delete Failed'), errorMessage);
      }
    });
  };

  // Handle export dataset
  const handleExportDataset = () => {
    if (!currentDataset) return;

    // Build tableData from headers (same logic as below)
    const headerNames = currentDataset.headers?.map((h: DatasetHeader) => h.name) || [];
    const rowCount = currentDataset.rowCount || 0;
    const rows: string[][] = Array.from({ length: rowCount }, () =>
      Array(headerNames.length).fill('')
    );
    currentDataset.headers?.forEach((h: DatasetHeader, colIdx: number) => {
      h.data?.forEach((cell: string | number | null, rowIdx: number) => {
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
      <div className="flex items-center justify-center min-h-screen">
        <SlideInUp delay={0.2}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl p-8 text-center max-w-md">
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
        </SlideInUp>
      </div>
    );
  }

  // Build structured columns + rows for CustomExcel (first row is headers in edit page; here we send body & columns separately)
  let bodyRows: string[][] = [];
  let columnDefs: { name: string; type: 'string' }[] = [];
  let headerRow: string[] = [];
  if (currentDataset.headers && currentDataset.headers.length) {
    headerRow = currentDataset.headers.map((h: DatasetHeader) => h.name);
    columnDefs = headerRow.map(name => ({ name, type: 'string' as const }));
    const rowCount = currentDataset.rowCount;
    const rows: string[][] = Array.from({ length: rowCount }, () =>
      Array(headerRow.length).fill('')
    );
    currentDataset.headers.forEach((h: DatasetHeader, idx: number) => {
      h.data?.forEach((cell: string | number | null, rowIdx: number) => {
        if (rows[rowIdx]) rows[rowIdx][idx] = String(cell ?? '');
      });
    });
    bodyRows = rows;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !currentDataset ? (
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <SlideInUp delay={0.2}>
            <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 shadow-2xl p-8 text-center max-w-md rounded-2xl">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-2xl mx-auto flex items-center justify-center">
                  <Database className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('dataset_notFound', 'Dataset Not Found')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t(
                  'dataset_notFoundMessage',
                  'The dataset you are looking for does not exist or you do not have access to it.'
                )}
              </p>
              <Button
                onClick={() => navigate(Routers.WORKSPACE_DATASETS)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('dataset_backToList', 'Back to Datasets')}
              </Button>
            </Card>
          </SlideInUp>
        </div>
      ) : (
        <div className="py-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3 items-start">
              {/* Left Sidebar - Dataset Information */}
              <div className="w-80 shrink-0 space-y-6">
                <SlideInUp delay={0.15}>
                  <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">
                          {t('dataset_information', 'Dataset Information')}
                        </span>
                      </CardTitle>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {t('dataset_name', 'Name')}
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium mt-1">
                            {currentDataset.name}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {t('dataset_description', 'Description')}
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium mt-1 leading-relaxed">
                            {currentDataset.description ||
                              t('dataset_noDescription', 'No description')}
                          </p>
                        </div>
                        {/* Created & Last Updated info */}
                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-800/30">
                            <label className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {t('dataset_createdAt', 'Created')}
                            </label>
                            <p className="text-gray-900 dark:text-white font-medium mt-2">
                              {formatDate(currentDataset.createdAt)}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                            <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {t('dataset_updatedAt', 'Last Updated')}
                            </label>
                            <p className="text-gray-900 dark:text-white font-medium mt-2">
                              {formatDate(currentDataset.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SlideInUp>

                <SlideInUp delay={0.2}>
                  <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Edit className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{t('dataset_metadata', 'Metadata')}</span>
                      </CardTitle>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-800/30">
                          <label className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {t('dataset_createdAt', 'Created')}
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium mt-2">
                            {formatDate(currentDataset.createdAt)}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                          <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {t('dataset_updatedAt', 'Last Updated')}
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium mt-2">
                            {formatDate(currentDataset.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SlideInUp>

                <SlideInUp delay={0.25}>
                  <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Actions</span>
                      </CardTitle>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(Routers.EDIT_DATASET, {
                            state: { datasetId: currentDataset.id, from: window.location.pathname },
                          })
                        }
                        className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4 group"
                      >
                        <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex-shrink-0" />
                        <span className="text-blue-700 dark:text-blue-300 font-medium text-left">
                          {t('dataset_edit', 'Edit')}
                        </span>
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={handleDeleteDataset}
                        disabled={deleting}
                        className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-800/50 hover:from-red-500 hover:to-pink-600 hover:text-white dark:hover:from-red-600 dark:hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-white group-hover:text-white transition-colors flex-shrink-0" />
                        <span className="text-red-700 dark:text-white font-medium group-hover:text-white text-left">
                          {deleting ? 'Deleting...' : t('dataset_delete', 'Delete')}
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </SlideInUp>
              </div>

              {/* Main Content Area with Enhanced Layout */}
              <div className="max-w-5xl flex-1 space-y-6">
                <SlideInUp delay={0.3}>
                  <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {t('dataset_dataPreview', 'Data Preview')}
                            </h3>
                            <p className="text-violet-100 text-sm mt-1">
                              Interactive data table with{' '}
                              {currentDataset.rowCount?.toLocaleString()} rows ×{' '}
                              {currentDataset.columnCount} columns
                            </p>
                          </div>
                        </div>
                      </CardTitle>
                    </div>
                    <CardContent className="p-6">
                      {/* Enhanced responsive container with better styling */}
                      <div className="relative">
                        {/* Header info bar */}
                        <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Columns: {currentDataset.columnCount}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Rows: {currentDataset.rowCount?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border">
                              Read-only mode
                            </div>
                          </div>
                        </div>

                        {/* Data table container with enhanced styling */}
                        <div
                          className="overflow-hidden border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700"
                          style={{ minHeight: '400px', maxHeight: '1000px' }}
                        >
                          <div className="overflow-auto h-full">
                            <CustomExcel
                              initialData={bodyRows}
                              initialColumns={columnDefs}
                              mode="view"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SlideInUp>
              </div>
            </div>
          </div>
        </div>
      )}

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
