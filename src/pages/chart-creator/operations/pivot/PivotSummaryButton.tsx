'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Grid3x3, X } from 'lucide-react';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import type { DatasetColumnType, PivotDimension, PivotValue } from '@/types/chart';

interface PivotSummaryButtonProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  onPivotChange?: (
    rows: PivotDimension[],
    columns: PivotDimension[],
    values: PivotValue[],
    filters: PivotDimension[]
  ) => void;
  initialRows?: PivotDimension[];
  initialColumns?: PivotDimension[];
  initialValues?: PivotValue[];
  initialFilters?: PivotDimension[];
}

export const PivotSummaryButton: React.FC<PivotSummaryButtonProps> = ({
  // availableColumns,
  onPivotChange,
  initialRows = [],
  initialColumns = [],
  initialValues = [],
  initialFilters = [],
}) => {
  const { t } = useTranslation();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [rows, setRows] = useState<PivotDimension[]>(initialRows);
  const [columns, setColumns] = useState<PivotDimension[]>(initialColumns);
  const [values, setValues] = useState<PivotValue[]>(initialValues);
  const [filters, setFilters] = useState<PivotDimension[]>(initialFilters);

  // Keep local state in sync with external config changes
  useEffect(() => {
    setRows(initialRows);
    setColumns(initialColumns);
    setValues(initialValues);
    setFilters(initialFilters);
  }, [initialRows, initialColumns, initialValues, initialFilters]);

  const handleClearPivot = () => {
    setRows([]);
    setColumns([]);
    setValues([]);
    setFilters([]);
    onPivotChange?.([], [], [], []);
    setShowClearConfirm(false);
  };

  const hasPivot = rows.length > 0 || columns.length > 0 || values.length > 0 || filters.length > 0;
  const summaryText = hasPivot
    ? `${rows.length + columns.length + filters.length} dimension${rows.length + columns.length + filters.length !== 1 ? 's' : ''}, ${values.length} value${values.length !== 1 ? 's' : ''}`
    : 'Add Pivot Table';

  const handleOpenModal = () => {
    // TODO: Implement modal opening logic
    // For now, just a placeholder that does nothing
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handleOpenModal}
          variant="outline"
          className={`gap-2 flex-1 ${hasPivot ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200' : 'bg-transparent'}`}
        >
          <Grid3x3 className="w-4 h-4" />
          {summaryText}
        </Button>

        {hasPivot && (
          <Button
            onClick={() => setShowClearConfirm(true)}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ModalConfirm
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearPivot}
        title={t('operations.clearPivotTable', 'Clear Pivot Table')}
        message="Are you sure you want to clear all pivot table settings? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
};

export default PivotSummaryButton;
