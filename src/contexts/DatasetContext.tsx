import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DataHeader, ParsedDataResult } from '@/utils/dataProcessors';

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
  | 'YYYY-MM-DDTHH:mm:ss';

// Define all supported date formats and their parsers
const dateParsers: Record<DateFormat, { regex: RegExp; parse: (m: RegExpMatchArray) => string }> = {
  'YYYY-MM-DD': {
    regex: /^(\d{4})-(\d{2})-(\d{2})$/,
    parse: m => `${m[1]}-${m[2]}-${m[3]}`,
  },
  'DD/MM/YYYY': {
    regex: /^(\d{2})\/(\d{2})\/(\d{4})$/,
    parse: m => `${m[3]}-${m[2]}-${m[1]}`,
  },
  'MM/DD/YYYY': {
    regex: /^(\d{2})\/(\d{2})\/(\d{4})$/,
    parse: m => `${m[3]}-${m[1]}-${m[2]}`,
  },
  'YYYY/MM/DD': {
    regex: /^(\d{4})\/(\d{2})\/(\d{2})$/,
    parse: m => `${m[1]}-${m[2]}-${m[3]}`,
  },
  'DD-MM-YYYY': {
    regex: /^(\d{2})-(\d{2})-(\d{4})$/,
    parse: m => `${m[3]}-${m[2]}-${m[1]}`,
  },
  'MM-DD-YYYY': {
    regex: /^(\d{2})-(\d{2})-(\d{4})$/,
    parse: m => `${m[3]}-${m[1]}-${m[2]}`,
  },
  'YYYY-MM': {
    regex: /^(\d{4})-(\d{2})$/,
    parse: m => `${m[1]}-${m[2]}-01`,
  },
  'YY-MM': {
    regex: /^(\d{2})-(\d{2})$/,
    parse: m => `20${m[1]}-${m[2]}-01`,
  },
  'MM/YY': {
    regex: /^(\d{2})\/(\d{2})$/,
    parse: m => `20${m[2]}-${m[1]}-01`,
  },
  'MM/YYYY': {
    regex: /^(\d{2})\/(\d{4})$/,
    parse: m => `${m[2]}-${m[1]}-01`,
  },
  'DD Month YYYY': {
    regex: /^(\d{2}) ([A-Za-z]+) (\d{4})$/,
    parse: m => `${m[3]}-${m[2]}-${m[1]}`,
  },
  YYYY: {
    regex: /^(\d{4})$/,
    parse: m => `${m[1]}-01-01`,
  },
  'YYYY-MM-DD HH:mm:ss': {
    regex: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
    parse: m => `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`,
  },
  'YYYY-MM-DDTHH:mm:ss': {
    regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
    parse: m => `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`,
  },
};

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

  // Duplicate column validation
  validateDuplicateColumns: (columns: DataHeader[]) => void;

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
    console.log('🔧 DatasetContext: setOriginalParsedData called', {
      dataLength: data?.data?.length,
    });
    setState(prev => ({ ...prev, originalParsedData: data }));
  }, []);

  const setCurrentParsedData = useCallback((data: ParsedDataResult | null) => {
    console.log('🔧 DatasetContext: setCurrentParsedData called', {
      dataLength: data?.data?.length,
    });
    setState(prev => ({ ...prev, currentParsedData: data }));
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

  // Duplicate column validation
  const validateDuplicateColumns = useCallback((columns: DataHeader[]) => {
    const nameCount: Record<string, number[]> = {};
    const duplicateNames: string[] = [];
    const duplicateColumnIndices: number[] = [];

    // Count occurrences of each column name
    columns.forEach((col, index) => {
      const name = col.name.trim();
      if (name) {
        if (!nameCount[name]) {
          nameCount[name] = [];
        }
        nameCount[name].push(index);
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

        // Build regex dynamically
        const escThousand = thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escDecimal = decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Pattern: optional sign, digits in groups of 1–3 separated by thousand sep, optional decimal part
        const pattern = new RegExp(
          `^[-+]?\\d{1,3}(?:${escThousand}\\d{3})*(?:${escDecimal}\\d+)?$`
        );

        if (!pattern.test(v)) {
          // Store undefined for invalid number
          updateParsedValue(colIndex, rowIndex, undefined);
          return { ok: false, value: original, changed: false };
        }

        // Convert: remove thousands, replace decimal with dot
        let cleaned = v.replace(new RegExp(escThousand, 'g'), '');
        cleaned = cleaned.replace(new RegExp(escDecimal, 'g'), '.');

        const parsedNumber = parseFloat(cleaned);
        if (isNaN(parsedNumber)) {
          // Store undefined for invalid number
          updateParsedValue(colIndex, rowIndex, undefined);
          return { ok: false, value: original, changed: false };
        }

        // Store parsed number
        updateParsedValue(colIndex, rowIndex, parsedNumber);

        return {
          ok: true,
          value: String(parsedNumber),
          changed: cleaned !== original,
        };
      }

      if (type === 'date') {
        const fmt = dateFormat || 'YYYY-MM-DD';
        const parser = dateParsers[fmt];
        if (parser) {
          const match = v.match(parser.regex); // <- use match instead of exec
          if (match) {
            const iso = parser.parse(match);
            // Store parsed date as string
            updateParsedValue(colIndex, rowIndex, iso);
            return { ok: true, value: iso, changed: iso !== original };
          }
        }
        // Store undefined for invalid date
        updateParsedValue(colIndex, rowIndex, undefined);
        return { ok: false, value: original, changed: false };
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
      const currentDateFormat = dateFormat || state.dateFormat;

      // Clear parsed values if changing to text type
      if (targetType === 'text') {
        clearParsedValuesForColumn(colIndex);
      }

      // if (targetType === 'number') {
      //   console.log(
      //     'tryConvertColumn run with colIndex',
      //     colIndex,
      //     'and targetType',
      //     targetType,
      //     'and thousandsSeparator',
      //     currentNumberFormat.thousandsSeparator,
      //     'and decimalSeparator',
      //     currentNumberFormat.decimalSeparator
      //   );
      // } else if (targetType === 'date') {
      //   console.log(
      //     'tryConvertColumn run with colIndex',
      //     colIndex,
      //     'and targetType',
      //     targetType,
      //     'and format',
      //     currentDateFormat
      //   );
      // }
      const data = state.currentParsedData?.data || [];
      const columns = state.currentParsedData?.headers || [];

      const invalidRows: number[] = [];

      // Just validation – don’t replace values
      for (let ri = 0; ri < data.length; ri++) {
        const raw = data[ri][colIndex] ?? '';
        let result: ConvertResult = { ok: true, value: '', changed: false };
        if (targetType === 'number') {
          result = tryConvert(targetType, colIndex, ri, raw, currentNumberFormat, undefined);
        } else if (targetType === 'date') {
          result = tryConvert(targetType, colIndex, ri, raw, undefined, currentDateFormat);
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

      // Only update column type
      const nextColumns = columns.map((col, i) =>
        i === colIndex ? { ...col, type: targetType } : col
      );

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
      } else if (targetType === 'date' && !format) {
        formatToUse = state.dateFormat;
      }

      for (let i = 0; i < (state.currentParsedData.headers?.length || 0); i++) {
        const colType = state.currentParsedData.headers[i]?.type;
        if (colType !== targetType) continue;

        if (targetType === 'number') {
          tryConvertColumn(i, 'number', formatToUse as NumberFormat);
        } else if (targetType === 'date') {
          tryConvertColumn(i, 'date', undefined, formatToUse as DateFormat);
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
