import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedRow } from '@/features/excelUI';

interface DeleteRowButtonProps {
  onDelete: (rowIndex: number) => void;
  dataLength: number;
}

const DeleteRowButton = memo(function DeleteRowButton({
  onDelete,
  dataLength,
}: DeleteRowButtonProps) {
  // Only this component re-renders when selectedRow changes
  const selectedRow = useAppSelector(selectSelectedRow);

  const handleDelete = () => {
    if (selectedRow !== null) {
      onDelete(selectedRow);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={selectedRow === null || dataLength <= 1}
      className="gap-1"
    >
      Delete Row {selectedRow !== null ? `#${selectedRow + 1}` : ''}
    </Button>
  );
});

export default DeleteRowButton;
