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
  onSelectDataset: (datasetId: string) => void;
}

const DatasetSelectionDialog: React.FC<DatasetSelectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectDataset,
}) => {
  const { datasets, loading, getDatasets } = useDataset();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  // Fetch datasets when dialog opens
  useEffect(() => {
    if (open) {
      getDatasets();
    }
  }, [open, getDatasets]);

  const handleConfirm = () => {
    if (selectedDatasetId) {
      onSelectDataset(selectedDatasetId);
      onOpenChange(false);
      setSelectedDatasetId('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedDatasetId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Database className="w-6 h-6 text-blue-600" />
            Select a Dataset
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a dataset to create your chart. You can only select one dataset at a time.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
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
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {datasets.map((dataset: Dataset) => (
                <div
                  key={dataset.id}
                  className={`relative flex items-start space-x-3 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    selectedDatasetId === dataset.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => setSelectedDatasetId(dataset.id)}
                >
                  <input
                    type="radio"
                    id={dataset.id}
                    name="dataset"
                    value={dataset.id}
                    checked={selectedDatasetId === dataset.id}
                    onChange={e => setSelectedDatasetId(e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 space-y-2">
                    <label
                      htmlFor={dataset.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {dataset.name}
                      </span>
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

        <DialogFooter className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDatasetId || loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Dataset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetSelectionDialog;
