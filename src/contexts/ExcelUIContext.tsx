'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';

interface ExcelUIState {
  selectedRow: number | null;
  selectedColumn: number | null;
  tempEdits: Record<string, string>;
  touchedCells: Set<string>;
  infoMessage: string | null;
  sortConfig: {
    column: number;
    direction: 'asc' | 'desc';
  } | null;
}

interface ExcelUIContextType extends ExcelUIState {
  setSelectedRow: (row: number | null) => void;
  setSelectedColumn: (column: number | null) => void;
  setTempEdits: (edits: Record<string, string>) => void;
  updateTempEdit: (key: string, value: string) => void;
  clearTempEdit: (key: string) => void;
  setTouchedCells: (cells: Set<string>) => void;
  addTouchedCell: (key: string) => void;
  setInfoMessage: (message: string | null) => void;
  setSortConfig: (config: { column: number; direction: 'asc' | 'desc' } | null) => void;
  clearUIState: () => void;
}

const ExcelUIContext = createContext<ExcelUIContextType | undefined>(undefined);

const initialUIState: ExcelUIState = {
  selectedRow: null,
  selectedColumn: null,
  tempEdits: {},
  touchedCells: new Set(),
  infoMessage: null,
  sortConfig: null,
};

interface ExcelUIProviderProps {
  children: React.ReactNode;
}

export const ExcelUIProvider: React.FC<ExcelUIProviderProps> = ({ children }) => {
  const [state, setState] = useState<ExcelUIState>(initialUIState);

  const setSelectedRow = useCallback((row: number | null) => {
    setState(prev => ({ ...prev, selectedRow: row }));
  }, []);

  const setSelectedColumn = useCallback((column: number | null) => {
    setState(prev => ({ ...prev, selectedColumn: column }));
  }, []);

  const setTempEdits = useCallback((edits: Record<string, string>) => {
    setState(prev => ({ ...prev, tempEdits: edits }));
  }, []);

  const updateTempEdit = useCallback((key: string, value: string) => {
    setState(prev => ({
      ...prev,
      tempEdits: { ...prev.tempEdits, [key]: value },
    }));
  }, []);

  const clearTempEdit = useCallback((key: string) => {
    setState(prev => {
      const newEdits = { ...prev.tempEdits };
      delete newEdits[key];
      return { ...prev, tempEdits: newEdits };
    });
  }, []);

  const setTouchedCells = useCallback((cells: Set<string>) => {
    setState(prev => ({ ...prev, touchedCells: cells }));
  }, []);

  const addTouchedCell = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      touchedCells: new Set([...prev.touchedCells, key]),
    }));
  }, []);

  const setInfoMessage = useCallback((message: string | null) => {
    setState(prev => ({ ...prev, infoMessage: message }));
  }, []);

  const setSortConfig = useCallback(
    (config: { column: number; direction: 'asc' | 'desc' } | null) => {
      setState(prev => ({ ...prev, sortConfig: config }));
    },
    []
  );

  const clearUIState = useCallback(() => {
    setState(initialUIState);
  }, []);

  const contextValue: ExcelUIContextType = {
    ...state,
    setSelectedRow,
    setSelectedColumn,
    setTempEdits,
    updateTempEdit,
    clearTempEdit,
    setTouchedCells,
    addTouchedCell,
    setInfoMessage,
    setSortConfig,
    clearUIState,
  };

  return <ExcelUIContext.Provider value={contextValue}>{children}</ExcelUIContext.Provider>;
};

export const useExcelUI = (): ExcelUIContextType => {
  const context = useContext(ExcelUIContext);
  if (context === undefined) {
    throw new Error('useExcelUI must be used within an ExcelUIProvider');
  }
  return context;
};
