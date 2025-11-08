import React, { useState, useEffect } from 'react';
import { Database, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDataset } from '@/features/dataset/useDataset';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Dataset } from '@/features/dataset/datasetAPI';

interface DatasetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDataset: (datasetId: string, datasetName: string) => void;
  currentDatasetId?: string; // ID của dataset hiện tại đang được sử dụng
}

const DatasetSelectionDialog: React.FC<DatasetSelectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectDataset,
  currentDatasetId,
  // onSelectSameDataset removed
}) => {
  const { datasets, loading, getDatasets } = useDataset();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // ✅ OPTIMIZATION: Only fetch if not loaded yet OR datasets is empty
  // This prevents unnecessary API calls on every modal open
  useEffect(() => {
    if (open) {
      // Always sync selectedDatasetId to currentDatasetId when dialog opens
      setSelectedDatasetId(currentDatasetId || '');

      // Only fetch if:
      // 1. Never loaded before AND datasets is empty
      // Check both conditions together to prevent re-fetch on datasets.length change
      if (!hasLoadedOnce && datasets.length === 0) {
        getDatasets();
        setHasLoadedOnce(true);
      }
    } else {
      // When dialog closes, clear selection to prevent stale state
      setSelectedDatasetId('');
    }
  }, [open, currentDatasetId, datasets.length, getDatasets, hasLoadedOnce]);

  // Auto-scroll to the current/selected dataset item when dialog opens
  useEffect(() => {
    if (!open) return;
    const targetId = selectedDatasetId || currentDatasetId;
    if (!targetId) return;
    // Allow content to render first
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [open, selectedDatasetId, currentDatasetId, datasets.length]);

  const handleConfirm = () => {
    if (!selectedDatasetId) return;
    // If user picked the current dataset, do no-op and just close
    if (currentDatasetId && selectedDatasetId === currentDatasetId) {
      onOpenChange(false);
      setSelectedDatasetId('');
      return;
    }
    const selectedDataset = datasets.find(ds => ds.id === selectedDatasetId);
    onSelectDataset(selectedDatasetId, selectedDataset?.name || '');
    onOpenChange(false);
    setSelectedDatasetId('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedDatasetId(currentDatasetId || '');
  };

  const handleRefresh = () => {
    getDatasets();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-gray-800 z-50 pointer-events-auto"
        aria-describedby="dataset-selection-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Database className="w-6 h-6 text-blue-600" />
              Select a Dataset
            </DialogTitle>
            {/* ✅ OPTIMIZATION 2: Manual refresh button */}
            {!loading && datasets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Refresh datasets list"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Refresh
              </Button>
            )}
          </div>
          <DialogDescription id="dataset-selection-description" className="text-muted-foreground">
            {currentDatasetId ? (
              <>
                Choose a dataset for your chart. Your current dataset is marked with a "Current"
                badge.
                <br />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Warning: Changing dataset will replace your current chart data.
                </span>
              </>
            ) : (
              'Choose a dataset to create your chart. You can only select one dataset at a time.'
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <LoadingSpinner />
          </div>
        ) : datasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No datasets available
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You need to create a dataset first before creating a chart. Click "New Dataset" to get
              started.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4 pointer-events-auto">
            <div className="space-y-3 pointer-events-auto">
              {datasets.map((dataset: Dataset) => (
                <div
                  key={dataset.id}
                  className={`relative flex items-start space-x-3 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-md pointer-events-auto ${
                    selectedDatasetId === dataset.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => {
                    setSelectedDatasetId(dataset.id);
                  }}
                >
                  <input
                    type="radio"
                    id={dataset.id}
                    name="dataset"
                    value={dataset.id}
                    checked={(selectedDatasetId || currentDatasetId) === dataset.id}
                    onChange={e => setSelectedDatasetId(e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 space-y-2">
                    <label
                      htmlFor={dataset.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {dataset.name}
                        </span>
                        {/* Hiển thị badge khi đây là dataset hiện tại */}
                        {currentDatasetId === dataset.id && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {selectedDatasetId === dataset.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </label>
                    {dataset.description && (
                      <p className="text-sm text-muted-foreground">{dataset.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <span className="font-medium">Rows:</span>
                        <span className="ml-1">{dataset.rowCount}</span>
                      </span>
                      <span className="flex items-center">
                        <span className="font-medium">Columns:</span>
                        <span className="ml-1">{dataset.columnCount}</span>
                      </span>
                      <span className="flex items-center">
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">
                          {new Date(dataset.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex gap-3 pt-4 pointer-events-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="rounded-lg pointer-events-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDatasetId || loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
          >
            Switch to Dataset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetSelectionDialog;
