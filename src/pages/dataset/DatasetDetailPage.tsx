'use client';
import type React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlideInUp } from '@/theme/animation';
import { ArrowLeft, Database, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
// Input/Textarea moved to DatasetInfoPanel
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useDataset } from '@/features/dataset/useDataset';
import { useToastContext } from '@/components/providers/ToastProvider';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';

import Routers from '@/router/routers';
import DatasetViewerTable from '@/components/dataset/DatasetViewerTable';
import DatasetInfoPanel from './DatasetInfoPanel';
import DatasetActionsPanel from './DatasetActionsPanel';
import DatasetPreviewHeader from './DatasetPreviewHeader';

// Type for header with data
interface DatasetHeader {
  name: string;
  data?: (string | number)[];
}

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
          navigate('/workspace', { replace: true, state: { tab: 'datasets' } });
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

  // Handle description edit - validate before exiting edit mode
  const handleDescriptionSave = useCallback(() => {
    // Validate description is not empty
    if (!editableDescription.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        description: t('dataset_descriptionRequired', 'Dataset description is required'),
      }));
      return;
    }

    // Clear validation error and exit editing mode
    setValidationErrors(prev => ({ ...prev, description: '' }));
    setIsEditingDescription(false);
  }, [editableDescription, t]);

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

  // Handle description change - validate on every change
  const handleDescriptionChange = useCallback(
    (value: string) => {
      setEditableDescription(value);

      // Real-time validation: clear error if input is not empty
      if (value.trim()) {
        setValidationErrors(prev => ({ ...prev, description: '' }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          description: t('dataset_descriptionRequired', 'Dataset description is required'),
        }));
      }
    },
    [t]
  );

  // Handle save with confirmation
  const handleSave = useCallback(async () => {
    if (!currentDataset || !extractedId) return;

    // Validate fields
    if (!editableName.trim() || !editableDescription.trim()) {
      showError(
        t('dataset_validationError', 'Validation Error'),
        t('dataset_fieldsRequired', 'Name and description are required')
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
      navigate('/workspace', { replace: true, state: { tab: 'datasets' } });
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
                  onClick={() =>
                    navigate('/workspace', { replace: true, state: { tab: 'datasets' } })
                  }
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

  // Prepare flat header + body rows for lightweight viewer with custom formatting
  interface ColumnMetaView {
    name: string;
    type: 'text' | 'number' | 'date';
  }
  let headerRow: ColumnMetaView[] = [];
  let bodyRows: (string | number | null)[][] = [];
  if (currentDataset.headers && currentDataset.headers.length) {
    headerRow = currentDataset.headers.map((h: any) => ({
      name: h.name,
      type: h.type === 'number' || h.type === 'date' ? h.type : 'text',
    }));

    const rowCount = currentDataset.rowCount || 0;
    const rows: (string | number | null)[][] = Array.from({ length: rowCount }, () =>
      Array(headerRow.length).fill('')
    );
    currentDataset.headers.forEach((h: DatasetHeader, colIdx: number) => {
      h.data?.forEach((cell: string | number | null, rowIdx: number) => {
        if (rows[rowIdx]) rows[rowIdx][colIdx] = cell ?? '';
      });
    });

    const thousandsSep = currentDataset.thousandsSeparator || ',';
    const decimalSep = currentDataset.decimalSeparator || '.';
    const dateFmt = currentDataset.dateFormat || 'YYYY-MM-DD';

    const alreadyFormattedPattern = /[@#]/; // legacy custom markers from old datasets
    const formatNumberCustom = (val: number | string): string => {
      if (val === null || val === undefined || val === '') return '';
      const raw = String(val).trim();
      // If data already contains the user-chosen separators exactly, keep it
      if (
        raw.includes(thousandsSep) ||
        raw.includes(decimalSep) ||
        alreadyFormattedPattern.test(raw)
      ) {
        return raw;
      }
      const m = raw.replace(/,/g, '').match(/^(-?\d+)(?:[.,](\d+))?$/);
      if (!m) return raw; // not a plain number -> leave as is
      const neg = m[1].startsWith('-') ? '-' : '';
      const intPart = m[1].replace('-', '');
      const decPart = m[2] || '';
      // group every 3 digits from right
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
      return neg + grouped + (decPart ? decimalSep + decPart : '');
    };

    const formatDateCustom = (val: string): string => {
      if (!val) return '';
      // attempt to parse YYYY-MM-DD or ISO
      let y: string, m: string, d: string;
      const isoMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        y = isoMatch[1];
        m = isoMatch[2];
        d = isoMatch[3];
      } else {
        const dt = new Date(val);
        if (isNaN(dt.getTime())) return val;
        y = String(dt.getFullYear());
        m = String(dt.getMonth() + 1).padStart(2, '0');
        d = String(dt.getDate()).padStart(2, '0');
      }
      let out = dateFmt;
      // Replace tokens (order matters)
      out = out.replace(/YYYY/g, y).replace(/MM/g, m).replace(/DD/g, d);
      return out;
    };

    bodyRows = rows.map(r =>
      r.map((cell, ci) => {
        const colType = headerRow[ci]?.type;
        if (colType === 'number') return formatNumberCustom(cell as any);
        if (colType === 'date') return typeof cell === 'string' ? formatDateCustom(cell) : '';
        return cell;
      })
    );
  }

  // Export CSV function extracted from inline handler
  const exportCSV = useCallback(() => {
    try {
      if (!headerRow || headerRow.length === 0) return;
      const delimiter = ',';
      const escapeCell = (v: string | number | null) => {
        const s = v == null ? '' : String(v);
        return '"' + s.replace(/"/g, '""') + '"';
      };
      const headerLine = headerRow.map(h => escapeCell(h.name)).join(delimiter);
      const lines = bodyRows.map(r => r.map(c => escapeCell(c)).join(delimiter));
      const csv = [headerLine, ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (currentDataset?.name || 'dataset').replace(/[^a-z0-9-_\.]/gi, '_');
      a.download = `${safeName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export CSV failed', err);
    }
  }, [headerRow, bodyRows, currentDataset]);

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
                onClick={() =>
                  navigate('/workspace', { replace: true, state: { tab: 'datasets' } })
                }
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
                <DatasetInfoPanel
                  t={t}
                  currentDataset={currentDataset}
                  isEditingName={isEditingName}
                  setIsEditingName={setIsEditingName}
                  editableName={editableName}
                  handleNameChange={handleNameChange}
                  handleNameSave={handleNameSave}
                  validationErrors={validationErrors}
                  isEditingDescription={isEditingDescription}
                  setIsEditingDescription={setIsEditingDescription}
                  editableDescription={editableDescription}
                  handleDescriptionChange={handleDescriptionChange}
                  handleDescriptionSave={handleDescriptionSave}
                  formatDate={formatDate}
                />

                <DatasetActionsPanel
                  t={t}
                  hasChanges={hasChanges}
                  handleSave={handleSave}
                  handleReset={handleReset}
                  handleBack={handleBack}
                  handleDeleteDataset={handleDeleteDataset}
                  deleting={deleting}
                />
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
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Columns: {currentDataset.columnCount}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Rows: {currentDataset.rowCount?.toLocaleString()}
                                </span>
                              </div>
                              <div className="hidden md:flex items-center gap-4 pl-4 ml-2 border-l border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">Thousands Separator:</span>
                                  <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                                    {(currentDataset.thousandsSeparator || ',') === ' '
                                      ? '␠'
                                      : currentDataset.thousandsSeparator || ','}
                                  </code>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">Decimal Separator:</span>
                                  <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                                    {currentDataset.decimalSeparator || '.'}
                                  </code>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">Date:</span>
                                  <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                                    {currentDataset.dateFormat || 'YYYY-MM-DD'}
                                  </code>
                                </span>
                              </div>
                            </div>
                            {/* Export CSV button */}
                            <DatasetPreviewHeader
                              t={t}
                              currentDataset={currentDataset}
                              onExport={exportCSV}
                            />
                            {/* Mobile format info */}
                            <div className="md:hidden mt-2 grid grid-cols-1 gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Hàng nghìn:</span>
                                <code className="px-1 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 font-mono">
                                  {(currentDataset.thousandsSeparator || ',') === ' '
                                    ? '␠'
                                    : currentDataset.thousandsSeparator || ','}
                                </code>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Thập phân:</span>
                                <code className="px-1 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 font-mono">
                                  {currentDataset.decimalSeparator || '.'}
                                </code>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Ngày:</span>
                                <code className="px-1 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 font-mono">
                                  {currentDataset.dateFormat || 'YYYY-MM-DD'}
                                </code>
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
                            <DatasetViewerTable columns={headerRow} rows={bodyRows} height="60vh" />
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
