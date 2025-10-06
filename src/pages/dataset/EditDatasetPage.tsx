'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Save, Loader2, Edit, RotateCcw } from 'lucide-react';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SlideInUp } from '@/theme/animation';
import Routers from '@/router/routers';
import { Textarea } from '@/components/ui/textarea';
import CustomExcel from '@/components/excel/CustomExcel';

interface EditFormData {
  name: string;
  description: string;
  data: string[][];
}

interface DatasetHeaderMinimal {
  name: string;
  data?: (string | number | null | undefined)[];
}

const EditDatasetPage: React.FC = () => {
  const { t } = useTranslation();
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
  const { showSuccess, showError } = useToastContext();

  const { currentDataset, loading, error, updating, getDatasetById, updateDataset } = useDataset();

  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    description: '',
    data: [],
  });

  const [originalFormData, setOriginalFormData] = useState<EditFormData>({
    name: '',
    description: '',
    data: [],
  });

  const [dataChanged, setDataChanged] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Load dataset on mount
  useEffect(() => {
    if (extractedId) {
      getDatasetById(extractedId);
    }
  }, [extractedId, getDatasetById]);

  // Update form data when dataset is loaded
  useEffect(() => {
    if (currentDataset) {
      // Convert headers + column data into 2D array (first row header names)
      let twoD: string[][] = [];
      if ((currentDataset as unknown as { data?: string[][] })?.data) {
        twoD = (currentDataset as unknown as { data?: string[][] }).data || [];
      } else if (currentDataset.headers && currentDataset.headers.length) {
        const headerNames = currentDataset.headers.map(h => h.name);
        const rowCount = currentDataset.rowCount;
        const rows: string[][] = Array.from({ length: rowCount }, () =>
          Array(headerNames.length).fill('')
        );
        currentDataset.headers.forEach((h: DatasetHeaderMinimal, idx: number) => {
          h.data?.forEach((cell: string | number | null | undefined, rowIdx: number) => {
            if (rows[rowIdx]) rows[rowIdx][idx] = String(cell ?? '');
          });
        });
        twoD = [headerNames, ...rows];
      }
      const newFormData = {
        name: currentDataset.name || '',
        description: currentDataset.description || '',
        data: twoD,
      };
      setFormData(newFormData);
      setOriginalFormData(newFormData);
    }
  }, [currentDataset]);

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof Omit<EditFormData, 'data'>, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setFormChanged(true);
    },
    []
  );

  // Handle data changes from spreadsheet editor
  const handleDataChange = useCallback((newData: string[][]) => {
    setFormData(prev => ({ ...prev, data: newData }));
    setDataChanged(true);
  }, []);

  // Handle reset to original data
  const handleReset = useCallback(() => {
    setFormData(originalFormData);
    setFormChanged(false);
    setDataChanged(false);
  }, [originalFormData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!extractedId) return;

    if (!formData.name.trim()) {
      showError(
        t('dataset_validationError', 'Validation Error'),
        t('dataset_nameRequired', 'Dataset name is required')
      );
      return;
    }

    try {
      const updateData: Record<string, unknown> = {};

      // Only include changed fields
      if (formChanged) {
        if (formData.name !== currentDataset?.name) {
          updateData.name = formData.name.trim();
        }
        if (formData.description !== currentDataset?.description) {
          updateData.description = formData.description || null;
        }
      }

      if (dataChanged) {
        // Convert 2D data back to headers format expected by API
        if (formData.data.length > 0) {
          const headerRow = formData.data[0];
          const bodyRows = formData.data.slice(1);
          updateData.headers = headerRow.map((name, idx) => ({
            name: name || `Column ${idx + 1}`,
            type: 'text',
            index: idx,
            data: bodyRows.map(r => r[idx] ?? ''),
          }));
        }
      }

      // If nothing changed, show a message
      if (Object.keys(updateData).length === 0) {
        showError(
          t('dataset_noChanges', 'No Changes'),
          t('dataset_noChangesMessage', 'No changes were made to the dataset')
        );
        return;
      }

      await updateDataset(extractedId, updateData).unwrap();

      showSuccess(
        t('dataset_updateSuccess', 'Dataset Updated'),
        t('dataset_updateSuccessMessage', 'Dataset has been updated successfully')
      );

      // Reset change flags and update original data
      setFormChanged(false);
      setDataChanged(false);
      setOriginalFormData(formData);

      // Navigate back to dataset detail page after a short delay
      setTimeout(() => {
        navigate(
          Routers.DATASET_DETAIL.replace(
            ':slug',
            slug ||
              `${formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 60)}-${extractedId}`
          ),
          { replace: true }
        );
      }, 800);
    } catch (err: unknown) {
      console.error('Update error:', err);

      const error = err as { status?: number; message?: string } | undefined;

      if (error?.status === 409) {
        showError(
          t('dataset_nameExists', 'Dataset Name Already Exists'),
          t(
            'dataset_nameExistsMessage',
            `A dataset with the name "${formData.name.trim()}" already exists. Please choose a different name.`
          )
        );
      } else if (error?.status === 404) {
        showError(
          t('dataset_notFound', 'Dataset Not Found'),
          t('dataset_notFoundMessage', 'The dataset you are trying to edit was not found')
        );
      } else if (error?.status === 403) {
        showError(
          t('dataset_accessDenied', 'Access Denied'),
          t('dataset_accessDeniedMessage', 'You do not have permission to edit this dataset')
        );
      } else {
        showError(
          t('dataset_updateFailed', 'Update Failed'),
          error?.message ||
            t('dataset_updateFailedMessage', 'Failed to update dataset. Please try again.')
        );
      }
    }
  }, [
    extractedId,
    formData,
    currentDataset,
    formChanged,
    dataChanged,
    updateDataset,
    showSuccess,
    showError,
    t,
    navigate,
    slug,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // Handle cancel/back
  const handleBack = useCallback(() => {
    const backTarget = location?.state?.from || Routers.WORKSPACE_DATASETS;
    if (formChanged || dataChanged) {
      if (
        window.confirm(
          t('dataset_unsavedChanges', 'You have unsaved changes. Are you sure you want to leave?')
        )
      ) {
        navigate(backTarget);
      }
    } else {
      navigate(backTarget);
    }
  }, [formChanged, dataChanged, navigate, t, location?.state?.from]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SlideInUp delay={0.2}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl p-8 text-center max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                {t('dataset_loadError', 'Error Loading Dataset')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || t('dataset_loadErrorMessage', 'Failed to load dataset information')}
              </p>
              <Button
                onClick={() => navigate(Routers.DATASETS)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
              >
                {t('dataset_backToDetail', 'Back to Dataset Detail')}
              </Button>
            </CardContent>
          </Card>
        </SlideInUp>
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SlideInUp delay={0.2}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl p-8 text-center max-w-md">
            <CardHeader>
              <CardTitle className="text-gray-600 dark:text-gray-400">
                {t('dataset_notFound', 'Dataset Not Found')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('dataset_notFoundMessage', 'The dataset you are looking for was not found')}
              </p>
              <Button
                onClick={() => navigate(Routers.DATASETS)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
              >
                {t('dataset_backToDetail', 'Back to Dataset Detail')}
              </Button>
            </CardContent>
          </Card>
        </SlideInUp>
      </div>
    );
  }

  const hasChanges = formChanged || dataChanged;

  // Derive header/body rows for editor & stats (first row is headers)
  const headerRow = formData.data[0] || [];
  const bodyRows = formData.data.length > 1 ? formData.data.slice(1) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="py-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 items-start">
              {/* Left Sidebar: Info & Stats */}
              <div className="w-80 shrink-0 space-y-6">
                <SlideInUp delay={0.15}>
                  <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Edit className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">
                            {t('dataset_information', 'Dataset Information')}
                          </span>
                        </div>
                        {hasChanges && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-orange-200 font-medium">
                              {t('dataset_unsavedChangesIndicator', 'Unsaved')}
                            </span>
                          </div>
                        )}
                      </CardTitle>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
                          <label
                            htmlFor="name"
                            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block"
                          >
                            {t('dataset_name', 'Dataset Name')} *
                          </label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            placeholder={t('dataset_namePlaceholder', 'Enter dataset name')}
                            className="w-full border-0 bg-background/60 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            disabled={updating}
                          />
                        </div>
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
                          <label
                            htmlFor="description"
                            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block"
                          >
                            {t('dataset_description', 'Description')}
                          </label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              handleInputChange('description', e.target.value)
                            }
                            placeholder={t(
                              'dataset_descriptionPlaceholder',
                              'Enter dataset description'
                            )}
                            className="w-full resize-none border-0 bg-background/60 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            rows={3}
                            disabled={updating}
                          />
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

                <SlideInUp delay={0.25}>
                  <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Save className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Actions</span>
                      </CardTitle>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Button
                          onClick={handleSave}
                          disabled={!hasChanges || updating}
                          className={`w-full h-12 flex items-center gap-3 justify-start rounded-full px-4 transition-shadow duration-200 shadow-md hover:shadow-lg text-white ${
                            !hasChanges || updating ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{ background: 'linear-gradient(90deg,#059669 0%,#10b981 100%)' }}
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10">
                            {updating ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="ml-2 font-medium">
                            {updating
                              ? t('dataset_saving', 'Saving...')
                              : t('dataset_save', 'Save Changes')}
                          </span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleReset}
                          disabled={!hasChanges || updating}
                          className={`w-full h-12 flex items-center gap-3 justify-start rounded-full px-4 border border-orange-300 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 ${
                            !hasChanges || updating ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-800/30">
                            <RotateCcw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="ml-2 font-medium">
                            {t('dataset_reset', 'Reset Changes')}
                          </span>
                        </Button>
                      </div>
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
                            <Edit className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {t('dataset_dataEditor', 'Data Editor')}
                            </h3>
                            <p className="text-violet-100 text-sm mt-1">
                              Interactive editor with {bodyRows.length?.toLocaleString()} rows ×{' '}
                              {headerRow.length} columns
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
                                  Columns: {headerRow.length}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Rows: {bodyRows.length?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'}`}
                                ></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Status: {hasChanges ? 'Modified' : 'Unchanged'}
                                </span>
                              </div>
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
                              // Đã sửa ở đây theo đúng TYPE - hungpt
                              initialColumns={headerRow.map((name, idx) => ({
                                name,
                                type: 'text' as const,
                                index: idx,
                              }))}
                              onDataChange={(rows, cols) => {
                                const newHeader = cols.map(c => c.name);
                                const new2D = [newHeader, ...rows];
                                handleDataChange(new2D);
                              }}
                              mode={updating ? 'view' : 'edit'}
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
    </div>
  );
};

export default EditDatasetPage;
