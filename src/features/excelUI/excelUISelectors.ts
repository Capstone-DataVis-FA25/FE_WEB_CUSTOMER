import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

// Base selectors
const selectExcelUI = (state: RootState) => state.excelUI;

// Individual property selectors for minimal re-renders
export const selectSelectedRow = createSelector([selectExcelUI], excelUI => excelUI.selectedRow);

export const selectSelectedColumn = createSelector(
  [selectExcelUI],
  excelUI => excelUI.selectedColumn
);

export const selectTempEdits = createSelector([selectExcelUI], excelUI => excelUI.tempEdits);

export const selectTouchedCells = createSelector(
  [selectExcelUI],
  excelUI => new Set(excelUI.touchedCells) // Convert back to Set for component usage
);

export const selectInfoMessage = createSelector([selectExcelUI], excelUI => excelUI.infoMessage);

export const selectSortConfig = createSelector([selectExcelUI], excelUI => excelUI.sortConfig);

// Combined selectors for components that need multiple properties
export const selectRowSelection = createSelector(
  [selectSelectedRow, selectSelectedColumn],
  (selectedRow, selectedColumn) => ({ selectedRow, selectedColumn })
);

export const selectExcelUIState = createSelector([selectExcelUI], excelUI => excelUI);

// Validation selectors
export const selectDuplicateColumns = createSelector(
  [selectExcelUI],
  excelUI => excelUI.duplicateColumns
);

export const selectEmptyColumns = createSelector([selectExcelUI], excelUI => excelUI.emptyColumns);

export const selectParseErrors = createSelector([selectExcelUI], excelUI => excelUI.parseErrors);

export const selectDateFormat = createSelector([selectExcelUI], excelUI => excelUI.dateFormat);

export const selectNumberFormat = createSelector([selectExcelUI], excelUI => excelUI.numberFormat);

// Memoized selectors for rows and columns to prevent recreation on every render
const rowParseErrorsSelectors = new Map<number, ReturnType<typeof createSelector>>();
const columnDuplicateSelectors = new Map<number, ReturnType<typeof createSelector>>();
const rowSelectionSelectors = new Map<number, ReturnType<typeof createSelector>>();

// Individual row validation selectors - only re-render when that specific row's validation changes
export const selectRowParseErrors = (rowIndex: number) => {
  if (!rowParseErrorsSelectors.has(rowIndex)) {
    const selector = createSelector(
      [selectParseErrors],
      parseErrors => parseErrors[rowIndex] || []
    );
    rowParseErrorsSelectors.set(rowIndex, selector);
  }
  return rowParseErrorsSelectors.get(rowIndex)!;
};

export const selectIsColumnDuplicate = (columnIndex: number) => {
  if (!columnDuplicateSelectors.has(columnIndex)) {
    const selector = createSelector(
      [selectDuplicateColumns],
      duplicateColumns => duplicateColumns?.duplicateColumnIndices.includes(columnIndex) || false
    );
    columnDuplicateSelectors.set(columnIndex, selector);
  }
  return columnDuplicateSelectors.get(columnIndex)!;
};

// Individual row selection selector - only re-renders when THIS specific row's selection changes
export const selectIsRowSelected = (rowIndex: number) => {
  if (!rowSelectionSelectors.has(rowIndex)) {
    const selector = createSelector([selectSelectedRow], selectedRow => selectedRow === rowIndex);
    rowSelectionSelectors.set(rowIndex, selector);
  }
  return rowSelectionSelectors.get(rowIndex)!;
};

// Memoized selectors for each cell to prevent recreation on every render
const cellValidationSelectors = new Map<string, ReturnType<typeof createSelector>>();

// Combined validation for a specific cell - only re-renders when that cell's validation changes
export const selectCellValidation = (rowIndex: number, columnIndex: number) => {
  const key = `${rowIndex}-${columnIndex}`;

  if (!cellValidationSelectors.has(key)) {
    const selector = createSelector([selectRowParseErrors(rowIndex)], parseErrors => ({
      hasParseError: parseErrors.includes(columnIndex),
    }));
    cellValidationSelectors.set(key, selector);
  }

  return cellValidationSelectors.get(key)!;
};

// Memoized selectors for each column to prevent recreation on every render
const columnValidationSelectors = new Map<number, ReturnType<typeof createSelector>>();

// Combined validation for a specific column - only re-renders when that column's validation changes
export const selectColumnValidation = (columnIndex: number) => {
  if (!columnValidationSelectors.has(columnIndex)) {
    const selector = createSelector(
      [selectIsColumnDuplicate(columnIndex), selectEmptyColumns],
      (isDuplicate, emptyColumns) => ({
        isDuplicate,
        isEmpty: emptyColumns.includes(columnIndex),
      })
    );
    columnValidationSelectors.set(columnIndex, selector);
  }

  return columnValidationSelectors.get(columnIndex)!;
};
