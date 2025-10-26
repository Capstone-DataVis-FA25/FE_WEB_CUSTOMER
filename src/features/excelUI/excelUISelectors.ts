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
const sortDirSelectors = new Map<number, ReturnType<typeof createSelector>>();
export const selectSortDirectionForColumn = (index: number) => {
  if (!sortDirSelectors.has(index)) {
    const selector = createSelector([selectSortConfig], sortConfig => {
      if (!sortConfig) return null as 'asc' | 'desc' | null;
      if (sortConfig.column !== index) return null as 'asc' | 'desc' | null;
      return sortConfig.direction;
    });
    sortDirSelectors.set(index, selector);
  }
  return sortDirSelectors.get(index)!;
};

// Columns selectors
export const selectColumns = createSelector([selectExcelUI], excelUI => excelUI.columns);
export const selectFilters = createSelector([selectExcelUI], excelUI => excelUI.filters);
const filterSelectors = new Map<number, ReturnType<typeof createSelector>>();
export const selectFilterByIndex = (index: number) => {
  if (!filterSelectors.has(index)) {
    const selector = createSelector([selectFilters, selectColumns], (filters, columns) => {
      // Ensure length consistency without allocating new arrays frequently
      const len = columns.length;
      if (!filters || filters.length < len) {
        return '';
      }
      return filters[index] || '';
    });
    filterSelectors.set(index, selector);
  }
  return filterSelectors.get(index)!;
};

const columnSelectors = new Map<number, ReturnType<typeof createSelector>>();
export const selectColumnByIndex = (index: number) => {
  if (!columnSelectors.has(index)) {
    const selector = createSelector([selectColumns], columns => columns[index]);
    columnSelectors.set(index, selector);
  }
  return columnSelectors.get(index)!;
};

// Individual column selection selector - only re-renders when THIS specific column's selection changes
export const selectIsColumnSelected = (columnIndex: number): ((state: RootState) => boolean) => {
  if (!columnSelectionSelectors.has(columnIndex)) {
    const selector = createSelector(
      [(state: RootState) => selectSelectedColumn(state)],
      selectedColumn => selectedColumn === columnIndex
    );
    columnSelectionSelectors.set(columnIndex, selector);
  }
  return columnSelectionSelectors.get(columnIndex)!;
};

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
const rowSelectionSelectors = new Map<number, (state: RootState) => boolean>();
const columnSelectionSelectors = new Map<number, (state: RootState) => boolean>();

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
export const selectIsRowSelected = (rowIndex: number): ((state: RootState) => boolean) => {
  if (!rowSelectionSelectors.has(rowIndex)) {
    const selector = createSelector(
      [(state: RootState) => selectSelectedRow(state)],
      selectedRow => selectedRow === rowIndex
    );
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
// Primitive boolean selector for emptiness by column to avoid array reference churn
const columnEmptySelectors = new Map<number, ReturnType<typeof createSelector>>();
export const selectIsColumnEmpty = (columnIndex: number) => {
  if (!columnEmptySelectors.has(columnIndex)) {
    const selector = createSelector([selectEmptyColumns], emptyColumns =>
      emptyColumns.includes(columnIndex)
    );
    columnEmptySelectors.set(columnIndex, selector);
  }
  return columnEmptySelectors.get(columnIndex)!;
};

const columnValidationSelectors = new Map<number, ReturnType<typeof createSelector>>();

// Combined validation for a specific column - only re-renders when the two booleans change
export const selectColumnValidation = (columnIndex: number) => {
  if (!columnValidationSelectors.has(columnIndex)) {
    const selector = createSelector(
      [selectIsColumnDuplicate(columnIndex), selectIsColumnEmpty(columnIndex)],
      (isDuplicate: boolean, isEmpty: boolean) => ({ isDuplicate, isEmpty })
    );
    columnValidationSelectors.set(columnIndex, selector);
  }
  return columnValidationSelectors.get(columnIndex)!;
};
