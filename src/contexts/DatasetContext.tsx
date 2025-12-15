import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DataHeader, ParsedDataResult } from '@/utils/dataProcessors';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Types
export interface NumberFormat {
  thousandsSeparator: string;
  decimalSeparator: string;
}

export type DateFormat =
  | 'YYYY-MM-DD'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY/MM/DD'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY'
  | 'YYYY-MM'
  | 'YY-MM'
  | 'MM/YY'
  | 'MM/YYYY'
  | 'DD Month YYYY'
  | 'YYYY'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'YYYY-MM-DDTHH:mm:ss'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-[Q]Q'
  | 'MMMM'
  | 'MMM'
  | 'MMMM YYYY'
  | 'MMM YYYY'
  | 'MMMM DD'
  | 'MMM DD';

export const DATE_FORMATS: DateFormat[] = [
  'YYYY-MM-DD',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
  'DD-MM-YYYY',
  'MM-DD-YYYY',
  'YYYY-MM',
  'YY-MM',
  'MM/YY',
  'MM/YYYY',
  'DD Month YYYY',
  'YYYY',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-[Q]Q',
  'YYYY-MM-DDTHH:mm:ss',
  'MMMM',
  'MMM',
  'MMMM YYYY',
  'MMM YYYY',
  'MMMM DD',
  'MMM DD',
];

interface ValidationErrors {
  numberFormat?: {
    separatorsEqual?: boolean;
    missingDecimalSeparator?: boolean;
  };
  excelErrors?: { parseErrors: ExcelErrorMap };
  duplicateColumns?: {
    duplicateNames: string[];
    duplicateColumnIndices: number[];
  };
}

interface ConvertResult {
  ok: boolean;
  value: string;
  changed: boolean;
}

export type ExcelErrorMap = Record<number, number[]>; // rowIndex (1-based) -> array of column indices (0-based)
export type ParsedValueMap = Record<number, (string | number | undefined)[]>; // columnIndex (0-based) -> array of parsed values

interface DatasetState {
  // Layer 1: Raw file content
  originalTextContent: string;
  isJsonFormat: boolean;

  // Layer 2: Parsed original data (immutable reference)
  originalParsedData: ParsedDataResult | null;

  // Layer 3: Current working data (user modifications)
  currentParsedData: ParsedDataResult | null;

  // Configuration states (affects Layer 2 regeneration)
  selectedDelimiter: string;
  numberFormat: NumberFormat;
  dateFormat: DateFormat;

  // Form states removed - now handled by FormContext

  // Error states
  validationErrors: ValidationErrors;

  // Parsed values for columns with number and string types
  parsedValues: ParsedValueMap;
}

interface DatasetContextType extends DatasetState {
  // Data actions
  setOriginalTextContent: (content: string) => void;
  setOriginalParsedData: (data: ParsedDataResult | null) => void;
  setCurrentParsedData: (data: ParsedDataResult | null) => void;
  setIsJsonFormat: (isJson: boolean) => void;

  // Configuration actions
  setSelectedDelimiter: (delimiter: string) => void;
  setNumberFormat: (format: NumberFormat) => void;
  setDateFormat: (format: DateFormat) => void;

  // Form actions removed - now handled by FormContext

  // Error actions
  setValidationError: (category: keyof ValidationErrors, field: string, value: boolean) => void;
  clearValidationErrors: (category?: keyof ValidationErrors) => void;
  hasValidationErrors: () => boolean;

  // Excel error cells (row -> [cols])
  setExcelErrors: (errors: { parseErrors: ExcelErrorMap }) => void;
  clearExcelErrors: () => void;

  // Column validation (duplicates and empty names)
  validateDuplicateColumns: (columns: DataHeader[]) => {
    duplicateNames: string[];
    duplicateColumnIndices: number[];
    emptyColumnIndices: number[];
  };

  // Parsed values helper
  updateParsedValue: (
    colIndex: number,
    rowIndex: number,
    value: string | number | undefined
  ) => void;
  clearParsedValuesForColumn: (colIndex: number) => void;

  // Utility actions
  resetState: () => void;

  // Convert actions
  tryConvert: (
    type: DataHeader['type'],
    colIndex: number,
    rowIndex: number,
    raw: string,
    numberFormat?: NumberFormat,
    dateFormat?: DateFormat
  ) => ConvertResult;

  tryConvertColumn: (
    colIndex: number,
    targetType: DataHeader['type'],
    numberFormat?: NumberFormat,
    dateFormat?: DateFormat
  ) => { nextData: string[][]; nextColumns: DataHeader[] };
  revalidateColumnsOfType: (
    targetType: DataHeader['type'],
    format: NumberFormat | DateFormat
  ) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

// Initial state
const initialState: DatasetState = {
  originalTextContent: '',
  isJsonFormat: false,
  originalParsedData: null,
  currentParsedData: null,
  selectedDelimiter: ',',
  numberFormat: {
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  dateFormat: 'DD/MM/YYYY',
  validationErrors: { excelErrors: { parseErrors: {} } },
  parsedValues: {},
};

// Provider component
interface DatasetProviderProps {
  children: React.ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({ children }) => {
  const [state, setState] = useState<DatasetState>(initialState);

  // Data actions - Memoized with useCallback to prevent re-renders
  const setOriginalTextContent = useCallback((content: string) => {
    setState(prev => ({ ...prev, originalTextContent: content }));
  }, []);

  const setOriginalParsedData = useCallback((data: ParsedDataResult | null) => {
    // if (data && typeof data.data?.length !== 'undefined') {
    //   console.log('🔧 DatasetContext: setOriginalParsedData called', {
    //     dataLength: data.data.length,
    //   });
    // }
    setState(prev => ({ ...prev, originalParsedData: data }));
  }, []);

  const setCurrentParsedData = useCallback((data: ParsedDataResult | null) => {
    setState(prev => {
      if (prev.currentParsedData === data) return prev; // no-op if same reference
      // if (data && typeof data.data?.length !== 'undefined') {
      //   console.log('🔧 DatasetContext: setCurrentParsedData called', {
      //     dataLength: data.data.length,
      //   });
      // }
      return { ...prev, currentParsedData: data };
    });
  }, []);

  const setIsJsonFormat = useCallback((isJson: boolean) => {
    setState(prev => ({ ...prev, isJsonFormat: isJson }));
  }, []);

  // Configuration actions - Memoized with useCallback
  const setSelectedDelimiter = useCallback((delimiter: string) => {
    setState(prev => ({ ...prev, selectedDelimiter: delimiter }));
  }, []);

  const setNumberFormat = useCallback((format: NumberFormat) => {
    setState(prev => ({ ...prev, numberFormat: format }));
  }, []);

  const setDateFormat = useCallback((format: DateFormat) => {
    setState(prev => ({ ...prev, dateFormat: format }));
  }, []);

  // Form actions removed - now handled by FormContext

  // Error actions
  const setValidationError = useCallback(
    (category: keyof ValidationErrors, field: string, value: boolean) => {
      setState(prev => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          [category]: {
            ...prev.validationErrors[category],
            [field]: value,
          },
        },
      }));
    },
    []
  );

  const clearValidationErrors = useCallback((category?: keyof ValidationErrors) => {
    if (category) {
      setState(prev => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          [category]: {},
        },
      }));
    } else {
      setState(prev => ({
        ...prev,
        validationErrors: {},
      }));
    }
  }, []);

  const hasValidationErrors = useCallback((): boolean => {
    const errors = state.validationErrors;
    // boolean flags
    const hasBooleanFlags = Object.entries(errors).some(([key, categoryErrors]) => {
      if (!categoryErrors) return false;
      if (key === 'excelErrors') return false;
      return Object.values(categoryErrors as Record<string, unknown>).some(v => v === true);
    });
    if (hasBooleanFlags) return true;
    // excelErrors map non-empty
    const excelMap = errors.excelErrors?.parseErrors || {};
    if (Object.keys(excelMap).length > 0) return true;
    // duplicate columns exist
    const duplicateColumns = errors.duplicateColumns;
    if (duplicateColumns && duplicateColumns.duplicateNames.length > 0) return true;
    return false;
  }, [state.validationErrors]);

  // Excel error helpers
  const setExcelErrors = useCallback((errors: { parseErrors: ExcelErrorMap }) => {
    setState(prev => ({
      ...prev,
      validationErrors: {
        ...prev.validationErrors,
        excelErrors: errors,
      },
    }));
  }, []);

  const clearExcelErrors = useCallback(() => {
    setExcelErrors({ parseErrors: {} });
  }, [setExcelErrors]);

  // Helper function to update parsed values
  const updateParsedValue = useCallback(
    (colIndex: number, rowIndex: number, value: string | number | undefined) => {
      setState(prev => {
        const currentColumn = prev.parsedValues[colIndex] || [];
        const newColumn = [...currentColumn];
        newColumn[rowIndex] = value;

        return {
          ...prev,
          parsedValues: {
            ...prev.parsedValues,
            [colIndex]: newColumn,
          },
        };
      });
    },
    []
  );

  // Helper function to clear parsed values for a specific column
  const clearParsedValuesForColumn = useCallback((colIndex: number) => {
    setState(prev => {
      const newParsedValues = { ...prev.parsedValues };
      delete newParsedValues[colIndex];
      return {
        ...prev,
        parsedValues: newParsedValues,
      };
    });
  }, []);

  // Column validation (duplicates and empty names)
  const validateDuplicateColumns = useCallback((columns: DataHeader[]) => {
    const nameCount: Record<string, number[]> = {};
    const duplicateNames: string[] = [];
    const duplicateColumnIndices: number[] = [];
    const emptyColumnIndices: number[] = [];

    // Count occurrences of each column name and check for empty names
    columns.forEach((col, index) => {
      const name = col.name.trim();
      if (name) {
        if (!nameCount[name]) {
          nameCount[name] = [];
        }
        nameCount[name].push(index);
      } else {
        emptyColumnIndices.push(index);
      }
    });

    // Find duplicates
    Object.entries(nameCount).forEach(([name, indices]) => {
      if (indices.length > 1) {
        duplicateNames.push(name);
        duplicateColumnIndices.push(...indices);
      }
    });

    // Update validation errors
    setState(prev => ({
      ...prev,
      validationErrors: {
        ...prev.validationErrors,
        duplicateColumns: {
          duplicateNames,
          duplicateColumnIndices,
        },
      },
    }));

    // Return the result for external use
    return {
      duplicateNames,
      duplicateColumnIndices,
      emptyColumnIndices,
    };
  }, []);

  // Utility actions
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  //Try converting data
  // Updated tryConvert function with NumberFormat support - Memoized with useCallback
  const tryConvert = useCallback(
    (
      type: DataHeader['type'],
      colIndex: number,
      rowIndex: number,
      raw: string,
      numberFormat?: NumberFormat,
      dateFormat?: DateFormat
    ): ConvertResult => {
      const original = raw;
      const v = raw.trim();

      if (v === '') return { ok: true, value: '', changed: false };
      if (type === 'text') return { ok: true, value: original, changed: false };

      if (type === 'number') {
        const { thousandsSeparator, decimalSeparator } = numberFormat || state.numberFormat;
        const escThousand = thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escDecimal = decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(
          `^[-+]?\\d{1,3}(?:${escThousand}\\d{3})*(?:${escDecimal}\\d+)?$`
        );
        if (!pattern.test(v)) {
          updateParsedValue(colIndex, rowIndex, undefined);
          return { ok: false, value: original, changed: false };
        }
        let cleaned = v.replace(new RegExp(escThousand, 'g'), '');
        cleaned = cleaned.replace(new RegExp(escDecimal, 'g'), '.');
        const parsedNumber = parseFloat(cleaned);
        if (isNaN(parsedNumber)) {
          updateParsedValue(colIndex, rowIndex, undefined);
          return { ok: false, value: original, changed: false };
        }
        updateParsedValue(colIndex, rowIndex, parsedNumber);
        return { ok: true, value: String(parsedNumber), changed: cleaned !== original };
      }

      if (type === 'date') {
        const headerFmt = state.currentParsedData?.headers?.[colIndex]?.dateFormat as
          | DateFormat
          | undefined;
        const fmt = (dateFormat || headerFmt || 'YYYY-MM-DD') as DateFormat;
        const formatMap: Record<string, string> = {
          'YYYY-MM-DD': 'YYYY-MM-DD',
          'DD/MM/YYYY': 'DD/MM/YYYY',
          'MM/DD/YYYY': 'MM/DD/YYYY',
          'YYYY/MM/DD': 'YYYY/MM/DD',
          'DD-MM-YYYY': 'DD-MM-YYYY',
          'MM-DD-YYYY': 'MM-DD-YYYY',
          'YYYY-MM': 'YYYY-MM',
          'YY-MM': 'YY-MM',
          'MM/YY': 'MM/YY',
          'MM/YYYY': 'MM/YYYY',
          'DD Month YYYY': 'DD MMMM YYYY',
          YYYY: 'YYYY',
          'YYYY-MM-DD HH:mm:ss': 'YYYY-MM-DD HH:mm:ss',
          'YYYY-MM-DDTHH:mm:ss': 'YYYY-MM-DDTHH:mm:ss',
          'YYYY-MM-DD HH:mm': 'YYYY-MM-DD HH:mm',
          'YYYY-[Q]Q': 'YYYY-[Q]Q', // For quarter format like 2024-Q1
          MMMM: 'MMMM', // Full month name like "February"
          MMM: 'MMM', // Short month name like "Feb"
          'MMMM YYYY': 'MMMM YYYY', // Full month with year like "February 2024"
          'MMM YYYY': 'MMM YYYY', // Short month with year like "Feb 2024"
          'MMMM DD': 'MMMM DD', // Full month with day like "February 25"
          'MMM DD': 'MMM DD', // Short month with day like "Feb 25"
        };
        const djFormat = formatMap[fmt] || 'YYYY-MM-DD';

        // Special handling for quarter format (2024-Q1)
        let d;
        if (fmt === 'YYYY-[Q]Q') {
          // Parse quarter format: 2024-Q1
          const match = v.match(/^(\d{4})-Q(\d)$/);
          if (match) {
            const year = parseInt(match[1], 10);
            const quarter = parseInt(match[2], 10);
            // Convert quarter to month (Q1=Jan, Q2=Apr, Q3=Jul, Q4=Oct)
            const month = (quarter - 1) * 3 + 1;
            d = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
          } else {
            d = dayjs(v, djFormat, true);
          }
        } else if (fmt === 'MMMM') {
          // Full month name only: parse with current year, first day of month
          const currentYear = new Date().getFullYear();
          d = dayjs(`${v} ${currentYear}`, 'MMMM YYYY', true);
          if (!d.isValid()) {
            d = dayjs(`${currentYear}-${v}`, 'YYYY-MMMM', true);
          }
          if (d.isValid()) {
            d = d.date(1); // Set to first day of month
          }
        } else if (fmt === 'MMM') {
          // Short month name only: parse with current year, first day of month
          const currentYear = new Date().getFullYear();
          d = dayjs(`${v} ${currentYear}`, 'MMM YYYY', true);
          if (!d.isValid()) {
            d = dayjs(`${currentYear}-${v}`, 'YYYY-MMM', true);
          }
          if (d.isValid()) {
            d = d.date(1); // Set to first day of month
          }
        } else if (fmt === 'MMMM DD') {
          // Full month with day: parse with current year
          const currentYear = new Date().getFullYear();
          d = dayjs(`${v} ${currentYear}`, 'MMMM DD YYYY', true);
        } else if (fmt === 'MMM DD') {
          // Short month with day: parse with current year
          const currentYear = new Date().getFullYear();
          d = dayjs(`${v} ${currentYear}`, 'MMM DD YYYY', true);
        } else {
          d = dayjs(v, djFormat, true);
        }
        if (!d.isValid()) {
          updateParsedValue(colIndex, rowIndex, undefined);
          return { ok: false, value: original, changed: false };
        }
        let iso: string;
        if (fmt === 'YYYY-MM-DD HH:mm:ss' || fmt === 'YYYY-MM-DDTHH:mm:ss') {
          iso = d.format('YYYY-MM-DD[T]HH:mm:ss');
        } else if (fmt === 'YYYY-MM-DD HH:mm') {
          // For hour/minute format, set seconds to 00
          iso = d.format('YYYY-MM-DD[T]HH:mm:00');
        } else if (fmt === 'YYYY-[Q]Q') {
          // For quarter, use the first day of the quarter (already set in d)
          iso = d.format('YYYY-MM-DD[T]00:00:00');
        } else if (fmt === 'MMMM' || fmt === 'MMM') {
          // Month-only: use first day of the month, current year
          iso = d.format('YYYY-MM-DD[T]00:00:00');
        } else if (fmt === 'MMMM DD' || fmt === 'MMM DD') {
          // Month with day: use current year
          iso = d.format('YYYY-MM-DD[T]00:00:00');
        } else {
          const datePart = d.format('YYYY-MM-DD');
          iso = `${datePart}T00:00:00`;
        }
        updateParsedValue(colIndex, rowIndex, iso);
        return { ok: true, value: iso, changed: iso !== original };
      }

      return { ok: true, value: original, changed: false };
    },
    [state.numberFormat, state.dateFormat, updateParsedValue]
  );

  const tryConvertColumn = useCallback(
    (
      colIndex: number,
      targetType: DataHeader['type'],
      numberFormat?: NumberFormat,
      dateFormat?: DateFormat
    ): { nextData: string[][]; nextColumns: DataHeader[] } => {
      const currentNumberFormat = numberFormat || state.numberFormat;
      const headerFmt = state.currentParsedData?.headers?.[colIndex]?.dateFormat as
        | DateFormat
        | undefined;
      const currentDateFormat = (dateFormat || headerFmt || state.dateFormat) as DateFormat;

      // Clear parsed values if changing to text type
      if (targetType === 'text') {
        clearParsedValuesForColumn(colIndex);
      }

      const data = state.currentParsedData?.data || [];
      const columns = state.currentParsedData?.headers || [];

      const invalidRows: number[] = [];

      // Just validation – don’t replace values
      for (let ri = 0; ri < data.length; ri++) {
        const raw = data[ri][colIndex] ?? '';
        let result: ConvertResult = { ok: true, value: '', changed: false };
        if (targetType === 'number') {
          result = tryConvert('number', colIndex, ri, raw, currentNumberFormat, undefined);
        } else if (targetType === 'date') {
          result = tryConvert('date', colIndex, ri, raw, undefined, currentDateFormat);
        }

        if (!result.ok) {
          invalidRows.push(ri + 1); // 1-based row number
        }
      }

      // --- Update Excel error map ---
      const existing = state.validationErrors.excelErrors?.parseErrors || {};
      const next: Record<number, number[]> = { ...existing };

      // Clear old errors for this column
      Object.keys(next).forEach(rowKey => {
        const rowNum = Number(rowKey);
        next[rowNum] = (next[rowNum] || []).filter(colIdx => colIdx !== colIndex);
        if (next[rowNum].length === 0) delete next[rowNum];
      });

      // Add new errors
      if (invalidRows.length) {
        invalidRows.forEach(r => {
          const currentCols = next[r] ? [...next[r]] : [];
          if (!currentCols.includes(colIndex)) currentCols.push(colIndex);
          next[r] = currentCols;
        });
      }

      setExcelErrors({ parseErrors: next });

      // Data is unchanged
      const nextData = data;

      // Update column type and dateFormat if applicable
      const nextColumns = columns.map((col, i) => {
        if (i !== colIndex) return col;
        if (targetType === 'date') {
          return { ...col, type: 'date', dateFormat: currentDateFormat } as DataHeader;
        }
        return { ...col, type: targetType } as DataHeader;
      });

      // Persist header changes into currentParsedData so downstream reads pick up the new format/type
      setState(prev => {
        const cp = prev.currentParsedData;
        if (!cp) return prev;
        if (cp.headers === nextColumns) return prev;
        return {
          ...prev,
          currentParsedData: {
            ...cp,
            headers: nextColumns,
          },
        };
      });

      return { nextData, nextColumns };
    },
    [
      state.currentParsedData,
      state.numberFormat,
      state.dateFormat,
      tryConvert,
      setExcelErrors,
      clearParsedValuesForColumn,
    ]
  );

  const revalidateColumnsOfType = useCallback(
    (targetType: DataHeader['type'], format: NumberFormat | DateFormat) => {
      if (!state.currentParsedData) return;
      let formatToUse = format;
      if (targetType === 'number' && !format) {
        formatToUse = state.numberFormat;
      }

      for (let i = 0; i < (state.currentParsedData.headers?.length || 0); i++) {
        const colType = state.currentParsedData.headers[i]?.type;
        if (colType !== targetType) continue;

        if (targetType === 'number') {
          tryConvertColumn(i, 'number', formatToUse as NumberFormat);
        } else if (targetType === 'date') {
          const df = (state.currentParsedData.headers[i]?.dateFormat ||
            state.dateFormat) as DateFormat;
          tryConvertColumn(i, 'date', undefined, df);
        }
      }
    },
    [state.currentParsedData, state.numberFormat, state.dateFormat, tryConvertColumn]
  );

  const contextValue: DatasetContextType = {
    ...state,
    setOriginalTextContent,
    setOriginalParsedData,
    setCurrentParsedData,
    setIsJsonFormat,
    setSelectedDelimiter,
    setNumberFormat,
    setDateFormat,
    setValidationError,
    clearValidationErrors,
    hasValidationErrors,
    setExcelErrors,
    clearExcelErrors,
    validateDuplicateColumns,
    updateParsedValue,
    clearParsedValuesForColumn,
    resetState,
    tryConvert,
    tryConvertColumn,
    revalidateColumnsOfType,
  };

  return <DatasetContext.Provider value={contextValue}>{children}</DatasetContext.Provider>;
};

// Custom hook
export const useDataset = (): DatasetContextType => {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};

export default DatasetContext;
