import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ArrowLeft, Save, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';
import SpreadsheetEditor from '@/components/excel/SpreadsheetEditor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SlideInUp, FadeIn } from '@/theme/animation';
import Routers from '@/router/routers';
import { Textarea } from '@/components/ui/textarea';

interface EditFormData {
  name: string;
  description: string;
  data: string[][];
}

const EditDatasetPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const {
    currentDataset,
    loading,
    error,
    updating,
    getDatasetById,
    updateDataset,
  } = useDataset();

  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    description: '',
    data: [],
  });

  const [dataChanged, setDataChanged] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Load dataset on mount
  useEffect(() => {
    if (id) {
      getDatasetById(id);
    }
  }, [id, getDatasetById]);

  // Update form data when dataset is loaded
  useEffect(() => {
    if (currentDataset) {
      setFormData({
        name: currentDataset.name || '',
        description: currentDataset.description || '',
        data: currentDataset.data || [],
      });
    }
  }, [currentDataset]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof Omit<EditFormData, 'data'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormChanged(true);
  }, []);

  // Handle data changes from spreadsheet editor
  const handleDataChange = useCallback((newData: string[][]) => {
    setFormData(prev => ({ ...prev, data: newData }));
    setDataChanged(true);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!id) return;

    if (!formData.name.trim()) {
      showError(
        t('dataset_validationError', 'Validation Error'),
        t('dataset_nameRequired', 'Dataset name is required')
      );
      return;
    }

    try {
      const updateData: any = {};
      
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
        updateData.data = formData.data;
      }

      // If nothing changed, show a message
      if (Object.keys(updateData).length === 0) {
        showError(
          t('dataset_noChanges', 'No Changes'),
          t('dataset_noChangesMessage', 'No changes were made to the dataset')
        );
        return;
      }

      await updateDataset(id, updateData).unwrap();

      showSuccess(
        t('dataset_updateSuccess', 'Dataset Updated'),
        t('dataset_updateSuccessMessage', 'Dataset has been updated successfully')
      );

      // Reset change flags
      setFormChanged(false);
      setDataChanged(false);

      // Navigate back to dataset detail page after a short delay
      setTimeout(() => {
        navigate(Routers.DATASET_DETAIL.replace(':id', id));
      }, 1500);

    } catch (error: any) {
      console.error('Update error:', error);
      
      if (error.status === 409) {
        showError(
          t('dataset_nameExists', 'Dataset Name Already Exists'),
          t('dataset_nameExistsMessage', `A dataset with the name "${formData.name.trim()}" already exists. Please choose a different name.`)
        );
      } else if (error.status === 404) {
        showError(
          t('dataset_notFound', 'Dataset Not Found'),
          t('dataset_notFoundMessage', 'The dataset you are trying to edit was not found')
        );
      } else if (error.status === 403) {
        showError(
          t('dataset_accessDenied', 'Access Denied'),
          t('dataset_accessDeniedMessage', 'You do not have permission to edit this dataset')
        );
      } else {
        showError(
          t('dataset_updateFailed', 'Update Failed'),
          error.message || t('dataset_updateFailedMessage', 'Failed to update dataset. Please try again.')
        );
      }
    }
  }, [id, formData, currentDataset, formChanged, dataChanged, updateDataset, showSuccess, showError, t, navigate]);

  // Handle cancel/back
  const handleBack = useCallback(() => {
    if (formChanged || dataChanged) {
      if (window.confirm(t('dataset_unsavedChanges', 'You have unsaved changes. Are you sure you want to leave?'))) {
        navigate(Routers.DATASET_DETAIL.replace(':id', id || ''));
      }
    } else {
      navigate(Routers.DATASET_DETAIL.replace(':id', id || ''));
    }
  }, [formChanged, dataChanged, navigate, id, t]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              {t('dataset_loadError', 'Error Loading Dataset')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || t('dataset_loadErrorMessage', 'Failed to load dataset information')}
            </p>
            <Button onClick={() => navigate(Routers.DATASET_DETAIL.replace(':id', id || ''))} className="w-full">
              {t('dataset_backToDetail', 'Back to Dataset Detail')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-gray-600 dark:text-gray-400">
              {t('dataset_notFound', 'Dataset Not Found')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('dataset_notFoundMessage', 'The dataset you are looking for was not found')}
            </p>
            <Button onClick={() => navigate(Routers.DATASET_DETAIL.replace(':id', id || ''))} className="w-full">
              {t('dataset_backToDetail', 'Back to Dataset Detail')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasChanges = formChanged || dataChanged;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common_back', 'Back')}
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  {t('dataset_editTitle', 'Edit Dataset')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dataset_editDescription', 'Modify dataset information and data')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updating}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {updating ? t('dataset_saving', 'Saving...') : t('dataset_save', 'Save Changes')}
            </Button>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {/* Dataset Information */}
          <SlideInUp delay={0.1}>
            <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t('dataset_information', 'Dataset Information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('dataset_name', 'Dataset Name')} *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('dataset_namePlaceholder', 'Enter dataset name')}
                      className="w-full"
                      disabled={updating}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('dataset_description', 'Description')}
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                      placeholder={t('dataset_descriptionPlaceholder', 'Enter dataset description')}
                      className="w-full resize-none"
                      rows={3}
                      disabled={updating}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideInUp>

          {/* Dataset Statistics */}
          <SlideInUp delay={0.2}>
            <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t('dataset_statistics', 'Dataset Statistics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formData.data.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dataset_rows', 'Rows')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formData.data[0]?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dataset_columns', 'Columns')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {currentDataset.createdAt ? new Date(currentDataset.createdAt).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dataset_created', 'Created')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {currentDataset.updatedAt ? new Date(currentDataset.updatedAt).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dataset_updated', 'Updated')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideInUp>

          {/* Data Editor */}
          <SlideInUp delay={0.3}>
            <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
                  <span>{t('dataset_dataEditor', 'Data Editor')}</span>
                  {hasChanges && (
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-normal">
                      {t('dataset_unsavedChangesIndicator', 'Unsaved changes')}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpreadsheetEditor
                  initialData={formData.data}
                  onDataChange={handleDataChange}
                  readOnly={updating}
                  title=""
                />
              </CardContent>
            </Card>
          </SlideInUp>
        </div>
      </div>
    </div>
  );
};

export default EditDatasetPage;
