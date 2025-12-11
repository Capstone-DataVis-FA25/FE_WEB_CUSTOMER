import type React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlideInUp } from '@/theme/animation';
import { ArrowLeft, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// removed inline inputs/badge; now inside modular components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';

import Routers from '@/router/routers';
import DatasetPreviewCard from '@/components/dataset/DatasetPreviewCard';
import DatasetInfoCard from '@/components/dataset/DatasetInfoCard';
import DatasetActionsCard from '@/components/dataset/DatasetActionsCard';

// Type for header with data
// interface DatasetHeader {
//   name: string;
//   data?: (string | number)[];
// }

const DatasetDetailPage: React.FC = () => {
  const { id: legacyId, slug } = useParams<{ id?: string; slug?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stateDatasetId = (location?.state as { datasetId?: string })?.datasetId;
  const urlDatasetId = searchParams.get('datasetId');

  // Priority: state > URL search params > URL params > slug > legacy id
  const rawParam = stateDatasetId || urlDatasetId || slug || legacyId || '';

  // Extract UUID (with hyphens) or fallback to legacy id
  let extractedId = rawParam;
  const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = rawParam.match(uuidRegex);
  if (match) {
    extractedId = match[0];
  }

  // Debug information (can be removed in production)
  console.log('Dataset Detail Debug:', {
    stateDatasetId,
    urlDatasetId,
    slug,
    legacyId,
    rawParam,
    extractedId,
    hasState: !!location.state,
    searchParams: Object.fromEntries(searchParams.entries()),
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();
  const modalConfirm = useModalConfirm();

  const {
    currentDataset,
    loading,
    deleting,
    getDatasetById,
    deleteDataset,
    updateDataset,
    clearCurrent: clearCurrentDataset,
  } = useDataset();

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  // Original values for change tracking
  const [originalName, setOriginalName] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    description: '',
  });

  // Unsaved changes modal state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    if (!currentDataset) return false;

    const nameChanged = editableName !== originalName;
    const descriptionChanged = editableDescription !== originalDescription;

    return nameChanged || descriptionChanged;
  }, [editableName, originalName, editableDescription, originalDescription, currentDataset]);

  // const exportCsv = (
  //   headerRow: { name: string }[],
  //   bodyRows: (string | number | null)[][],
  //   filename: string
  // ) => {
  //   try {
  //     if (!headerRow || headerRow.length === 0) return;

  //     const delimiter = ',';
  //     const escapeCell = (v: string | number | null) => {
  //       const s = v == null ? '' : String(v);
  //       return '"' + s.replace(/"/g, '""') + '"';
  //     };

  //     const headerLine = headerRow.map(h => escapeCell(h.name)).join(delimiter);
  //     const lines = bodyRows.map(r => r.map(c => escapeCell(c)).join(delimiter));
  //     const csv = [headerLine, ...lines].join('\n');

  //     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  //     const url = URL.createObjectURL(blob);

  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error('Export CSV failed', err);
  //   }
  // };

  // Fetch dataset on component mount
  useEffect(() => {
    if (extractedId) {
      getDatasetById(extractedId);
    }
    return () => {
      clearCurrentDataset();
    };
  }, [extractedId, getDatasetById, clearCurrentDataset]);

  // Initialize editable fields when dataset is loaded
  useEffect(() => {
    if (currentDataset) {
      setEditableName(currentDataset.name || '');
      setEditableDescription(currentDataset.description || '');
      setOriginalName(currentDataset.name || '');
      setOriginalDescription(currentDataset.description || '');
    }
  }, [currentDataset]);

  // Enable beforeunload warning when there are unsaved changes
  useBeforeUnload({
    hasUnsavedChanges: hasChanges,
    message: t(
      'dataset_unsaved_changes_warning',
      'You have unsaved changes to your dataset. Are you sure you want to leave?'
    ),
  });

  // Handle browser back button with unsaved changes
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasChanges) {
        // Prevent the navigation
        event.preventDefault();
        window.history.pushState(null, '', window.location.href);

        // Show unsaved changes modal
        setPendingNavigation(() => () => {
          // Navigate to workspace datasets when confirmed
          navigate(Routers.WORKSPACE_DATASETS, { replace: true });
        });
        setShowUnsavedModal(true);
      }
    };

    // Add popstate listener for browser back button
    window.addEventListener('popstate', handlePopState);

    // Push a dummy state to prevent immediate back navigation
    if (hasChanges) {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges, navigate, t]);

  // Handle name edit - validate before exiting edit mode
  const handleNameSave = useCallback(() => {
    // Validate name is not empty
    if (!editableName.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        name: t('dataset_nameRequired', 'Dataset name is required'),
      }));
      return;
    }

    // Clear validation error and exit editing mode
    setValidationErrors(prev => ({ ...prev, name: '' }));
    setIsEditingName(false);
  }, [editableName, t]);

  // Handle description edit - optional field (no required validation)
  const handleDescriptionSave = useCallback(() => {
    // Always clear validation error and exit editing mode
    setValidationErrors(prev => ({ ...prev, description: '' }));
    setIsEditingDescription(false);
  }, []);

  // Handle name change - validate on every change
  const handleNameChange = useCallback(
    (value: string) => {
      setEditableName(value);

      // Real-time validation: clear error if input is not empty
      if (value.trim()) {
        setValidationErrors(prev => ({ ...prev, name: '' }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          name: t('dataset_nameRequired', 'Dataset name is required'),
        }));
      }
    },
    [t]
  );

  // Key handling for name input moved out of JSX to keep markup simple
  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleNameSave();
      } else if (e.key === 'Escape') {
        setEditableName(originalName);
        setIsEditingName(false);
        setValidationErrors(prev => ({ ...prev, name: '' }));
      }
    },
    [handleNameSave, originalName]
  );

  const nameInputClass = useMemo(
    () => `font-medium ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`,
    [validationErrors.name]
  );

  // Handle description change - optional (no required validation)
  const handleDescriptionChange = useCallback((value: string) => {
    setEditableDescription(value);
    // Clear any prior error regardless of content
    setValidationErrors(prev => ({ ...prev, description: '' }));
  }, []);

  // Handle save with confirmation
  const handleSave = useCallback(async () => {
    if (!currentDataset || !extractedId) return;

    // Validate fields: only name is required
    if (!editableName.trim()) {
      showError(
        t('dataset_validationError', 'Validation Error'),
        t('dataset_nameRequired', 'Dataset name is required')
      );
      return;
    }

    setCurrentModalAction('save');
    modalConfirm.openConfirm(async () => {
      try {
        const updateData: Record<string, unknown> = {};

        if (editableName !== currentDataset.name) {
          updateData.name = editableName.trim();
        }
        if (editableDescription !== currentDataset.description) {
          updateData.description = editableDescription.trim();
        }

        if (Object.keys(updateData).length === 0) {
          showError(
            t('dataset_noChanges', 'No Changes'),
            t('dataset_noChangesMessage', 'No changes were made to the dataset')
          );
          setCurrentModalAction(null);
          return;
        }

        const response = await updateDataset(extractedId, updateData).unwrap();

        if (response) {
          console.log('Update response:', response);

          // Update original values after successful save
          setOriginalName(editableName.trim());
          setOriginalDescription(editableDescription.trim());

          showSuccess(
            t('dataset_updateSuccess', 'Dataset Updated'),
            t('dataset_updateSuccessMessage', 'Dataset has been updated successfully')
          );
        }

        // Close the modal after successful save
        setCurrentModalAction(null);
      } catch (err: unknown) {
        console.error('Update error:', err);
        console.log('Full error object:', JSON.stringify(err, null, 2));

        // Parse error safely - API can return multiple structures
        let errorStatus: number | undefined;
        let errorMessage: string | undefined;

        if (err && typeof err === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorObj = err as any;

          // Try to extract status from multiple possible locations
          errorStatus =
            errorObj.statusCode ||
            errorObj.status ||
            errorObj.data?.statusCode ||
            errorObj.data?.status ||
            errorObj.response?.status;

          // Try to extract message from multiple possible locations
          errorMessage =
            errorObj.message ||
            errorObj.data?.message ||
            errorObj.response?.data?.message ||
            errorObj.error?.message;

          console.log('Parsed error:', { errorStatus, errorMessage });
        }

        // Always show error toast
        if (errorStatus === 409) {
          showError(
            t('dataset_nameExists', 'Dataset Name Already Exists'),
            errorMessage ||
              t(
                'dataset_nameExistsMessage',
                `A dataset with the name "${editableName.trim()}" already exists. Please choose a different name.`
              )
          );
        } else {
          showError(
            t('dataset_updateFailed', 'Update Failed'),
            errorMessage ||
              t('dataset_updateFailedMessage', 'Failed to update dataset. Please try again.')
          );
        }

        // Close the modal - don't throw error to prevent crash
        setCurrentModalAction(null);
      }
    });
  }, [
    currentDataset,
    extractedId,
    editableName,
    editableDescription,
    updateDataset,
    showSuccess,
    showError,
    t,
    modalConfirm,
  ]);

  // Handle reset to original values
  const handleReset = useCallback(() => {
    if (hasChanges) {
      setCurrentModalAction('reset');
      modalConfirm.openConfirm(async () => {
        try {
          setEditableName(originalName);
          setEditableDescription(originalDescription);
          setIsEditingName(false);
          setIsEditingDescription(false);
          setValidationErrors({ name: '', description: '' });
          showSuccess(t('dataset_reset', 'Dataset reset to original values'));
        } catch (error) {
          console.error('Error resetting dataset:', error);
          showError(t('dataset_reset_error', 'Failed to reset dataset'));
        }
      });
    }
  }, [hasChanges, originalName, originalDescription, showSuccess, showError, t, modalConfirm]);

  // Handle back navigation with unsaved changes check
  const handleBack = useCallback(() => {
    if (hasChanges) {
      setPendingNavigation(() => () => {
        // Navigate to workspace datasets to prevent invalid state
        navigate(Routers.WORKSPACE_DATASETS, { replace: true });
      });
      setShowUnsavedModal(true);
    } else {
      // Navigate to workspace datasets to prevent invalid state
      navigate(Routers.WORKSPACE_DATASETS, { replace: true });
    }
  }, [hasChanges, navigate]);

  // Handle unsaved changes modal actions
  const handleSaveAndLeave = useCallback(async () => {
    if (!currentDataset || !extractedId) return;

    setIsSavingBeforeLeave(true);
    try {
      const updateData: Record<string, unknown> = {};

      if (editableName !== currentDataset.name) {
        updateData.name = editableName.trim();
      }
      if (editableDescription !== currentDataset.description) {
        updateData.description = editableDescription.trim();
      }

      if (Object.keys(updateData).length > 0) {
        await updateDataset(extractedId, updateData).unwrap();
        showSuccess(
          t('dataset_updateSuccess', 'Dataset Updated'),
          t('dataset_updateSuccessMessage', 'Dataset has been updated successfully')
        );
      }

      // Execute pending navigation
      if (pendingNavigation) {
        pendingNavigation();
      }
    } catch (error) {
      console.error('Error saving dataset before leave:', error);
      showError(t('dataset_update_error', 'Failed to update dataset'));
      throw error;
    } finally {
      setIsSavingBeforeLeave(false);
    }
  }, [
    currentDataset,
    extractedId,
    editableName,
    editableDescription,
    updateDataset,
    showSuccess,
    showError,
    t,
    pendingNavigation,
  ]);

  const handleLeaveAnyway = useCallback(() => {
    if (pendingNavigation) {
      pendingNavigation();
    }
  }, [pendingNavigation]);

  const handleStay = useCallback(() => {
    setPendingNavigation(null);
    setShowUnsavedModal(false);
  }, []);

  // Handle modal close with action cleanup
  const handleModalClose = useCallback(() => {
    setCurrentModalAction(null);
    modalConfirm.close();
  }, [modalConfirm]);

  // Handle delete dataset
  const handleDeleteDataset = async () => {
    if (!currentDataset) return;

    modalConfirm.openConfirm(async () => {
      try {
        await deleteDataset(currentDataset.id).unwrap();
        // build list route
        navigate(Routers.WORKSPACE_DATASETS);
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
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <SlideInUp delay={0.2}>
            <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-2xl p-8 text-center max-w-md rounded-2xl">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('dataset_notFound', 'Dataset Not Found')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {extractedId
                  ? t(
                      'dataset_notFoundMessage',
                      'The dataset you are looking for does not exist or you do not have access to it.'
                    )
                  : t(
                      'dataset_noIdMessage',
                      'No dataset ID was provided. Please access this page through the workspace or provide a valid dataset ID.'
                    )}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(Routers.WORKSPACE_DATASETS, { replace: true })}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('dataset_backToList', 'Back to Datasets')}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {extractedId
                    ? t(
                        'dataset_notFoundHint',
                        'Try checking the URL or contact your administrator if you believe this is an error.'
                      )
                    : t(
                        'dataset_noIdHint',
                        'Access datasets through the workspace to view their details.'
                      )}
                </p>
              </div>
            </Card>
          </SlideInUp>
        </div>
      </div>
    );
  }

  // Main preview now handled by DatasetPreviewCard

  // Note: unmount cleanup handled in initial data fetch effect above
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
                onClick={() => navigate(Routers.WORKSPACE_DATASETS, { replace: true })}
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
              {/* Left Sidebar - Modularized */}
              <div className="w-80 shrink-0 space-y-6">
                <SlideInUp delay={0.15}>
                  <DatasetInfoCard
                    t={(key: string, fallback?: string) =>
                      t(key, { defaultValue: fallback ?? key })
                    }
                    editableName={editableName}
                    isEditingName={isEditingName}
                    setIsEditingName={setIsEditingName}
                    validationErrors={validationErrors}
                    handleNameChange={handleNameChange}
                    handleNameSave={handleNameSave}
                    handleNameKeyDown={handleNameKeyDown}
                    nameInputClass={nameInputClass}
                    editableDescription={editableDescription}
                    setEditableDescription={setEditableDescription}
                    isEditingDescription={isEditingDescription}
                    setIsEditingDescription={setIsEditingDescription}
                    handleDescriptionChange={handleDescriptionChange}
                    handleDescriptionSave={handleDescriptionSave}
                    originalDescription={originalDescription}
                    setValidationErrors={setValidationErrors}
                    createdAt={currentDataset.createdAt}
                    updatedAt={currentDataset.updatedAt}
                    formatDate={formatDate}
                  />
                </SlideInUp>

                <SlideInUp delay={0.25}>
                  <DatasetActionsCard
                    t={(key: string, fallback?: string) =>
                      t(key, { defaultValue: fallback ?? key })
                    }
                    hasChanges={hasChanges}
                    deleting={deleting}
                    onSave={handleSave}
                    onReset={handleReset}
                    onBack={handleBack}
                    onDelete={handleDeleteDataset}
                  />
                </SlideInUp>
              </div>

              {/* Main Content Area - Modularized Preview */}
              <div className="max-w-5xl flex-1 space-y-6">
                <SlideInUp delay={0.3}>
                  <DatasetPreviewCard
                    t={(key: string, fallback?: string) =>
                      t(key, { defaultValue: fallback ?? key })
                    }
                    currentDataset={currentDataset}
                  />
                </SlideInUp>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={modalConfirm.isOpen && currentModalAction === null}
        onClose={handleModalClose}
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

      {/* Save Confirmation Modal */}
      <ModalConfirm
        isOpen={currentModalAction === 'save'}
        onClose={handleModalClose}
        onConfirm={async () => {
          await modalConfirm.confirm();
          handleModalClose();
        }}
        loading={modalConfirm.isLoading}
        type="success"
        title={t('dataset_saveConfirmTitle', 'Save Changes')}
        message={t(
          'dataset_saveConfirmMessage',
          'Are you sure you want to save the changes to this dataset?'
        )}
        confirmText={t('save', 'Save')}
        cancelText={t('common_cancel', 'Cancel')}
      />

      {/* Reset Confirmation Modal */}
      <ModalConfirm
        isOpen={currentModalAction === 'reset'}
        onClose={handleModalClose}
        onConfirm={() => {
          setEditableName(originalName);
          setEditableDescription(originalDescription);
          setIsEditingName(false);
          setIsEditingDescription(false);
          setValidationErrors({ name: '', description: '' });
          handleModalClose();
        }}
        type="warning"
        title={t('dataset_resetConfirmTitle', 'Reset Changes')}
        message={t(
          'dataset_resetConfirmMessage',
          'Are you sure you want to reset all changes? This will discard all unsaved modifications.'
        )}
        confirmText={t('reset', 'Reset')}
        cancelText={t('common_cancel', 'Cancel')}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={handleStay}
        onSaveAndLeave={handleSaveAndLeave}
        onLeaveAnyway={handleLeaveAnyway}
        onStay={handleStay}
        loading={isSavingBeforeLeave}
      />
    </div>
  );
};

export default DatasetDetailPage;
