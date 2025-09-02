import { useState, useCallback, useMemo, useEffect } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Undo2, 
  Redo2,
  Copy,
  Scissors,
  ClipboardPaste,
  Calculator,
  Filter,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import 'react-data-grid/lib/styles.css';
import { numberToExcelColumn, evaluateFormula } from '@/utils/excelUtils';

// CSS cho full size cells với padding hợp lý
const excelHeaderStyles = `
  .rdg .rdg-header-row {
    height: 30px !important;
  }
  .rdg .rdg-header-cell {
    padding: 0 !important;
    margin: 0 !important;
    border: 1px solid var(--rdg-border-color) !important;
  }
  .rdg .rdg-header-cell > div {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
`;

interface ExcelEditorProps {
  initialData?: string[][];
  onDataChange?: (data: string[][]) => void;
  onSave?: (data: string[][]) => void;
  readOnly?: boolean;
  title?: string;
  className?: string;
}

export type { ExcelEditorProps };

interface RowData {
  [key: string]: string | number;
  rowNumber: number;
}

interface HistoryState {
  data: RowData[];
  headers: string[];
  timestamp: number;
}

function ExcelEditor({ 
  initialData = [['Column 1', 'Column 2', 'Column 3']], 
  onDataChange,
  onSave,
  readOnly = false,
  title = 'Excel Editor',
  className = ''
}: ExcelEditorProps) {
  
  // Convert array data to object format for react-data-grid
  const [data, setData] = useState<RowData[]>(() => {
    if (!initialData || initialData.length === 0) {
      // Default data with column names in first row
      return [
        { rowNumber: 1, col_0: 'Product ID', col_1: 'Product Name', col_2: 'Category', col_3: 'Price' }
      ];
    }
    
    // Include headers as first row
    const allRows = initialData;
    
    return allRows.map((row, index) => {
      const rowData: RowData = { rowNumber: index + 1 };
      row.forEach((cellValue, colIndex) => {
        rowData[`col_${colIndex}`] = cellValue || '';
      });
      return rowData;
    });
  });

  const [headers, setHeaders] = useState<string[]>(() => {
    // Headers are now just column letters A, B, C...
    const numCols = initialData && initialData.length > 0 ? initialData[0].length : 4;
    return Array.from({ length: numCols }, (_, i) => numberToExcelColumn(i));
  });

  // History management for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [copiedData, setCopiedData] = useState<string[][] | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'row' | 'column' | 'cell'; index?: number } | null>(null);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState: HistoryState = {
      data: [...data],
      headers: [...headers],
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [data, headers, history, historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setData(previousState.data);
      setHeaders(previousState.headers);
      setHistoryIndex(historyIndex - 1);
      
      // Notify parent
      if (onDataChange) {
        const arrayData = [
          previousState.headers,
          ...previousState.data.map(row => 
            previousState.headers.map((_, index) => String(row[`col_${index}`] || ''))
          )
        ];
        onDataChange(arrayData);
      }
    }
  }, [history, historyIndex, onDataChange]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setData(nextState.data);
      setHeaders(nextState.headers);
      setHistoryIndex(historyIndex + 1);
      
      // Notify parent
      if (onDataChange) {
        const arrayData = [
          nextState.headers,
          ...nextState.data.map(row => 
            nextState.headers.map((_, index) => String(row[`col_${index}`] || ''))
          )
        ];
        onDataChange(arrayData);
      }
    }
  }, [history, historyIndex, onDataChange]);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];
    
    // Apply filter
    if (filterValue) {
      result = result.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key] || '');
        const bVal = String(b[sortConfig.key] || '');
        
        if (sortConfig.direction === 'asc') {
          return aVal.localeCompare(bVal, undefined, { numeric: true });
        } else {
          return bVal.localeCompare(aVal, undefined, { numeric: true });
        }
      });
    }
    
    return result;
  }, [data, filterValue, sortConfig]);

  // Sort column function
  const sortColumn = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  // Convert data to array format for formula evaluation
  const getDataAsArray = (): string[][] => {
    const arrayData: string[][] = [headers];
    data.forEach(row => {
      const rowArray: string[] = [];
      headers.forEach((_, colIndex) => {
        rowArray.push(String(row[`col_${colIndex}`] || ''));
      });
      arrayData.push(rowArray);
    });
    return arrayData;
  };

  // Evaluate Excel-like formulas using the utility function
  const evaluateFormulaLocal = (value: string): string => {
    if (!value.startsWith('=')) return value;
    
    const arrayData = getDataAsArray();
    return evaluateFormula(value, arrayData);
  };

  // Create columns for the data grid
  const columns = useMemo<Column<RowData>[]>(() => {
    const cols: Column<RowData>[] = [
      {
        key: 'rowNumber',
        name: '#',
        width: 50,
        minWidth: 40,
        maxWidth: 60,
        frozen: true,
        resizable: false,
        cellClass: 'bg-gray-100 dark:bg-gray-700 font-semibold text-center',
        renderCell: ({ row }) => (
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-2"
            onDoubleClick={() => {
              // Có thể thêm edit functionality ở đây nếu cần
              console.log('Double click row:', row.rowNumber);
            }}
          >
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {row.rowNumber}
            </span>
          </div>
        )
      }
    ];

    headers.forEach((header, index) => {
      console.log('Creating column:', index, 'Header:', header, 'Key:', `col_${index}`);
      const excelColumnName = numberToExcelColumn(index);
      cols.push({
        key: `col_${index}`,
        name: excelColumnName, // Chỉ hiển thị Excel column name
        width: 120,
        minWidth: 80,
        resizable: true,
        sortable: true,
        editable: !readOnly,
        headerCellClass: 'border-0 p-0 m-0',
        renderHeaderCell: () => (
          // Chỉ hiển thị A, B, C... không có column name
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className={`
                w-full h-full flex items-center justify-center text-sm font-bold cursor-pointer
                ${selectedColumns.has(index) 
                  ? 'bg-blue-200 dark:bg-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${document.documentElement.classList.contains('dark')
                  ? 'text-gray-200' 
                  : 'text-gray-700'
                }
              `}
              onClick={(e) => {
                e.stopPropagation();
                console.log('Click column:', index);
                setSelectedColumns(new Set([index]));
              }}
            >
              {numberToExcelColumn(index)}
              {sortConfig?.key === `col_${index}` && (
                <span className={`ml-1 ${sortConfig.direction === 'asc' ? 'text-green-600' : 'text-red-600'}`}>
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
        ),
        renderCell: ({ row, column }) => (
          <div 
            className={`w-full h-full flex items-center px-2 py-1 ${
              row.rowNumber === 1 
                ? 'bg-gray-50 dark:bg-gray-700 font-semibold' 
                : ''
            }`}
          >
            <span 
              className="w-full text-sm text-gray-900 dark:text-gray-100 truncate"
              title={String(row[column.key] || '')}
            >
              {String(row[column.key] || '')}
            </span>
          </div>
        ),
        renderEditCell: ({ row, column, onRowChange }) => (
          <Input
            className={`w-full h-8 px-2 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 ${
              row.rowNumber === 1 ? 'font-semibold' : ''
            }`}
            defaultValue={String(row[column.key])}
            onChange={(e) => {
              const newValue = row.rowNumber === 1 
                ? e.target.value // Don't evaluate formulas for column names
                : evaluateFormulaLocal(e.target.value);
              onRowChange({ ...row, [column.key]: newValue });
            }}
            onBlur={() => saveToHistory()}
            autoFocus
          />
        )
      });
    });

    return cols;
  }, [headers, readOnly]);

  // Handle row changes with history
  const handleRowsChange = useCallback((newRows: RowData[]) => {
    setData(newRows);
    
    // Convert back to array format and notify parent
    if (onDataChange) {
      const arrayData = newRows.map(row => 
        headers.map((_, index) => String(row[`col_${index}`] || ''))
      );
      onDataChange(arrayData);
    }
  }, [headers, onDataChange]);

  // Add new row
  const addRow = () => {
    saveToHistory();
    const newRow: RowData = { rowNumber: data.length + 1 };
    headers.forEach((_, index) => {
      newRow[`col_${index}`] = '';
    });
    
    const newData = [...data, newRow];
    setData(newData);
    handleRowsChange(newData);
  };

  // Delete selected rows or columns
  const deleteSelected = () => {
    if (selectedColumns.size > 0) {
      // Delete columns
      saveToHistory();
      const columnsToDelete = Array.from(selectedColumns).sort((a, b) => b - a);
      let newHeaders = [...headers];
      
      columnsToDelete.forEach(columnIndex => {
        if (newHeaders.length > 1) { // Keep at least one column
          newHeaders = newHeaders.filter((_, index) => index !== columnIndex);
        }
      });
      
      // Rebuild data without deleted columns
      const newData = data.map(row => {
        const newRow: RowData = { rowNumber: row.rowNumber };
        newHeaders.forEach((_, newIndex) => {
          let originalIndex = newIndex;
          // Calculate original index considering deleted columns
          columnsToDelete.forEach(deletedIndex => {
            if (deletedIndex <= originalIndex) {
              originalIndex++;
            }
          });
          newRow[`col_${newIndex}`] = row[`col_${originalIndex}`] || '';
        });
        return newRow;
      });

      setHeaders(newHeaders);
      setData(newData);
      setSelectedColumns(new Set());
      
      if (onDataChange) {
        const arrayData = [
          newHeaders,
          ...newData.map(row => 
            newHeaders.map((_, index) => String(row[`col_${index}`] || ''))
          )
        ];
        onDataChange(arrayData);
      }
    } else if (selectedRows.size > 0) {
      // Delete rows
      deleteRows();
    }
  };

  // Delete selected rows or last row
  const deleteRows = () => {
    saveToHistory();
    if (selectedRows.size > 0) {
      const rowIndexes = Array.from(selectedRows).sort((a, b) => b - a);
      let newData = [...data];
      
      rowIndexes.forEach(index => {
        newData = newData.filter((_, i) => i !== index);
      });
      
      // Re-number rows
      const renumberedData = newData.map((row, index) => ({
        ...row,
        rowNumber: index + 1
      }));
      
      setData(renumberedData);
      handleRowsChange(renumberedData);
      setSelectedRows(new Set());
    } else if (data.length > 0) {
      const newData = data.slice(0, -1);
      setData(newData);
      handleRowsChange(newData);
    }
  };

  // Add new column
  const addColumn = () => {
    saveToHistory();
    const newColumnIndex = headers.length;
    const newColumnLetter = numberToExcelColumn(newColumnIndex);
    const newHeaders = [...headers, newColumnLetter];
    
    const newData = data.map((row, rowIndex) => ({
      ...row,
      [`col_${newColumnIndex}`]: rowIndex === 0 ? `Column ${newColumnIndex + 1}` : '' // Set column name for first row
    }));

    setHeaders(newHeaders);
    setData(newData);
    
    if (onDataChange) {
      const arrayData = newData.map(row => 
        newHeaders.map((_, index) => String(row[`col_${index}`] || ''))
      );
      onDataChange(arrayData);
    }
  };

  // Delete column
  const deleteColumn = (columnIndex: number) => {
    if (headers.length <= 1) return; // Keep at least one column
    
    saveToHistory();
    const newHeaders = headers.filter((_, index) => index !== columnIndex);
    const newData = data.map(row => {
      const newRow: RowData = { rowNumber: row.rowNumber };
      newHeaders.forEach((_, index) => {
        const originalIndex = index >= columnIndex ? index + 1 : index;
        newRow[`col_${index}`] = row[`col_${originalIndex}`] || '';
      });
      return newRow;
    });

    setHeaders(newHeaders);
    setData(newData);
    
    if (onDataChange) {
      const arrayData = [
        newHeaders,
        ...newData.map(row => 
          newHeaders.map((_, index) => String(row[`col_${index}`] || ''))
        )
      ];
      onDataChange(arrayData);
    }
  };

  // Update column header name
  // Copy selected data
  const copyData = () => {
    if (selectedRows.size > 0) {
      const selectedData = Array.from(selectedRows).map(rowIndex => {
        const row = data[rowIndex];
        return headers.map((_, colIndex) => String(row[`col_${colIndex}`] || ''));
      });
      setCopiedData(selectedData);
      
      // Copy to system clipboard
      const textData = selectedData.map(row => row.join('\t')).join('\n');
      navigator.clipboard.writeText(textData);
    }
  };

  // Cut selected data
  const cutData = () => {
    copyData();
    deleteRows();
  };

  // Paste data
  const pasteData = async () => {
    try {
      // Try to get data from system clipboard first
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        saveToHistory();
        const rows = clipboardText.split('\n').filter(row => row.trim());
        const newRowsData = rows.map(row => row.split('\t'));
        
        const startIndex = data.length;
        const newRows = newRowsData.map((row, index) => {
          const rowData: RowData = { rowNumber: startIndex + index + 1 };
          headers.forEach((_, colIndex) => {
            rowData[`col_${colIndex}`] = row[colIndex] || '';
          });
          return rowData;
        });
        
        const newData = [...data, ...newRows];
        setData(newData);
        handleRowsChange(newData);
        return;
      }
    } catch (error) {
      // Fallback to internal copied data
      console.log('Using internal clipboard data');
    }
    
    // Use internal copied data
    if (copiedData && copiedData.length > 0) {
      saveToHistory();
      const startIndex = data.length;
      const newRows = copiedData.map((row, index) => {
        const rowData: RowData = { rowNumber: startIndex + index + 1 };
        headers.forEach((_, colIndex) => {
          rowData[`col_${colIndex}`] = row[colIndex] || '';
        });
        return rowData;
      });
      
      const newData = [...data, ...newRows];
      setData(newData);
      handleRowsChange(newData);
    }
  };

  // Calculate sum of selected cells
  const calculateSum = () => {
    if (selectedRows.size === 0) {
      alert('Please select some rows first!');
      return;
    }
    
    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;
    
    Array.from(selectedRows).forEach(rowIndex => {
      const row = data[rowIndex];
      headers.forEach((_, colIndex) => {
        const value = parseFloat(String(row[`col_${colIndex}`] || '0'));
        if (!isNaN(value)) {
          sum += value;
          count++;
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    const avg = count > 0 ? (sum / count).toFixed(2) : 0;
    const minVal = min === Infinity ? 'N/A' : min;
    const maxVal = max === -Infinity ? 'N/A' : max;
    
    alert(`📊 Selection Statistics:\n\n` +
          `Sum: ${sum}\n` +
          `Count: ${count}\n` +
          `Average: ${avg}\n` +
          `Min: ${minVal}\n` +
          `Max: ${maxVal}`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const arrayData = [
      headers,
      ...data.map(row => 
        headers.map((_, index) => String(row[`col_${index}`] || ''))
      )
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(arrayData);
    
    // Add some styling
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        
        // Style header row
        if (R === 0) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "F3F4F6" } },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" }
            }
          };
        }
      }
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // Import from Excel
  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        saveToHistory();
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        if (jsonData.length > 0) {
          const newHeaders = jsonData[0] || ['Column 1'];
          const newData = jsonData.slice(1).map((row, index) => {
            const rowData: RowData = { rowNumber: index + 1 };
            newHeaders.forEach((_, colIndex) => {
              rowData[`col_${colIndex}`] = row[colIndex] || '';
            });
            return rowData;
          });

          setHeaders(newHeaders);
          setData(newData);
          
          if (onDataChange) {
            onDataChange(jsonData);
          }
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('❌ Error reading Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Save data
  const handleSave = () => {
    if (onSave) {
      const arrayData = [
        headers,
        ...data.map(row => 
          headers.map((_, index) => String(row[`col_${index}`] || ''))
        )
      ];
      onSave(arrayData);
    }
  };

  // Context Menu Component
  const ContextMenu = () => {
    if (!contextMenu) return null;

    const menuItems = [];
    
    if (contextMenu.type === 'column') {
      menuItems.push(
        { label: '↗️ Sort Ascending', action: () => sortColumn(`col_${contextMenu.index}`, 'asc') },
        { label: '↙️ Sort Descending', action: () => sortColumn(`col_${contextMenu.index}`, 'desc') },
        { label: '📋 Copy Column', action: () => copyColumn(contextMenu.index || 0) },
        { label: '🗑️ Delete Column', action: () => deleteColumn(contextMenu.index || 0), danger: true }
      );
    } else if (contextMenu.type === 'row') {
      menuItems.push(
        { label: '📋 Copy Row', action: () => copyData() },
        { label: '✂️ Cut Row', action: () => cutData() },
        { label: '📄 Paste Row', action: () => pasteData() },
        { label: '➕ Insert Row Above', action: () => insertRowAt(contextMenu.index || 0) },
        { label: '➕ Insert Row Below', action: () => insertRowAt((contextMenu.index || 0) + 1) },
        { label: '🗑️ Delete Row', action: () => deleteRows(), danger: true }
      );
    }

    return (
      <div 
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-48"
        style={{ 
          left: contextMenu.x, 
          top: contextMenu.y,
          transform: 'translate(-50%, 0)'
        }}
        onMouseLeave={() => setContextMenu(null)}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              item.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => {
              item.action();
              setContextMenu(null);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  // Copy column data
  const copyColumn = (columnIndex: number) => {
    const columnData = [
      [headers[columnIndex]],
      ...data.map(row => [String(row[`col_${columnIndex}`] || '')])
    ];
    setCopiedData(columnData);
    
    const textData = columnData.map(row => row[0]).join('\n');
    navigator.clipboard.writeText(textData);
  };

  // Insert row at specific position
  const insertRowAt = (position: number) => {
    saveToHistory();
    const newRow: RowData = { rowNumber: position + 1 };
    headers.forEach((_, index) => {
      newRow[`col_${index}`] = '';
    });
    
    const newData = [...data];
    newData.splice(position, 0, newRow);
    
    // Re-number rows
    const renumberedData = newData.map((row, index) => ({
      ...row,
      rowNumber: index + 1
    }));
    
    setData(renumberedData);
    handleRowsChange(renumberedData);
  };

  // Clear all data
  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      saveToHistory();
      setData([]);
      setFilterValue('');
      setSortConfig(null);
      setSelectedRows(new Set());
      if (onDataChange) {
        onDataChange([headers]);
      }
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not editing a cell
      if ((event.target as HTMLElement)?.tagName === 'INPUT') {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      
      if (readOnly) return; // Skip shortcuts in read-only mode
      
      switch (true) {
        case isCtrl && event.key === 'z' && !event.shiftKey:
          event.preventDefault();
          undo();
          break;
          
        case isCtrl && (event.key === 'y' || (event.key === 'z' && event.shiftKey)):
          event.preventDefault();
          redo();
          break;
          
        case isCtrl && event.key === 'c':
          event.preventDefault();
          copyData();
          break;
          
        case isCtrl && event.key === 'x':
          event.preventDefault();
          cutData();
          break;
          
        case isCtrl && event.key === 'v':
          event.preventDefault();
          pasteData();
          break;
          
        case isCtrl && event.key === 's':
          event.preventDefault();
          if (onSave) handleSave();
          break;
          
        case event.key === 'Delete':
          event.preventDefault();
          deleteSelected();
          break;
          
        case event.key === 'Escape':
          event.preventDefault();
          setSelectedRows(new Set()); // Clear selection
          setSelectedColumns(new Set());
          setContextMenu(null);
          break;
      }
    };

    const handleClickOutside = () => {
      setContextMenu(null);
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [readOnly, undo, redo, copyData, cutData, pasteData, handleSave, onSave, deleteSelected]);

  return (
    <div 
      tabIndex={0}
      className="outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg w-full max-w-full"
      onKeyDown={(e) => {
        // Allow DataGrid to handle its own keyboard events
        if (e.currentTarget === e.target) {
          // Only handle when focus is on the wrapper, not on inputs
          return;
        }
      }}
    >
      {/* CSS cho full size cells */}
      <style>
        {excelHeaderStyles}
      </style>
      
      <Card className={`border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm w-full max-w-7xl mx-auto ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            {title}
          </CardTitle>
        </div>
        
        {/* Main Toolbar - Responsive and Compact */}
        <div className="flex items-center gap-2 flex-wrap mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-full overflow-x-auto">
          {/* Undo/Redo */}
          {!readOnly && (
            <>
              <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex items-center gap-1 h-8"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex items-center gap-1 h-8"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                  Redo
                </Button>
              </div>

              {/* Clipboard operations */}
              <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyData}
                  disabled={selectedRows.size === 0}
                  className="flex items-center gap-1 h-8"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cutData}
                  disabled={selectedRows.size === 0}
                  className="flex items-center gap-1 h-8"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="w-4 h-4" />
                  Cut
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pasteData}
                  disabled={!copiedData}
                  className="flex items-center gap-1 h-8"
                  title="Paste (Ctrl+V)"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste
                </Button>
              </div>

              {/* Row/Column operations */}
              <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  className="flex items-center gap-1 h-8"
                  title="Add Row"
                >
                  <Plus className="w-4 h-4" />
                  Row
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addColumn}
                  className="flex items-center gap-1 h-8"
                  title="Add Column"
                >
                  <Plus className="w-4 h-4" />
                  Column
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelected}
                  disabled={data.length === 0 && selectedColumns.size === 0}
                  className="flex items-center gap-1 h-8 text-red-600 hover:text-red-700"
                  title={selectedColumns.size > 0 ? `Delete ${selectedColumns.size} selected column(s)` : 
                         selectedRows.size > 0 ? `Delete ${selectedRows.size} selected row(s)` : 
                         'Delete selected rows/columns'}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedColumns.size > 0 ? 'Columns' : selectedRows.size > 0 ? 'Rows' : ''}
                </Button>
              </div>

              {/* Functions */}
              <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={calculateSum}
                  disabled={selectedRows.size === 0}
                  className="flex items-center gap-1 h-8"
                  title="Calculate statistics for selected rows"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllData}
                  className="flex items-center gap-1 h-8 text-red-600 hover:text-red-700"
                  title="Clear all data"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </div>
            </>
          )}

          {/* Filter */}
          <div className="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Filter data..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-36 h-8"
            />
            {filterValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterValue('')}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* File operations */}
          <div className="flex items-center gap-1">
            {onSave && !readOnly && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-1 h-8 bg-blue-600 hover:bg-blue-700"
                title="Save data"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center gap-1 h-8"
              title="Export to Excel file"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            {!readOnly && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={importFromExcel}
                  className="hidden"
                  id="excel-import"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('excel-import')?.click()}
                  className="flex items-center gap-1 h-8"
                  title="Import Excel file"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-full">
          {/* Scrollable container with width constraints */}
          <div 
            className="overflow-auto w-full" 
            style={{ 
              height: '600px',
              maxHeight: '80vh',
              minHeight: '400px',
              maxWidth: '100%',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(156 163 175) rgb(229 231 235)'
            }}
            onScroll={(e) => {
              // Visual feedback when scrolling
              const target = e.currentTarget;
              if (target.scrollLeft > 0 || target.scrollTop > 0) {
                target.style.boxShadow = 'inset 0 0 10px rgba(59, 130, 246, 0.1)';
              } else {
                target.style.boxShadow = '';
              }
            }}
          >
            <DataGrid
              columns={columns}
              rows={processedData}
              onRowsChange={handleRowsChange}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              className="rdg-light dark:rdg-dark"
              style={{ 
                height: Math.max(400, Math.min(processedData.length * 40 + 85, 600)),
                width: '100%',
                minWidth: '100%',
                '--rdg-header-row-height': '30px'
              } as React.CSSProperties}
              headerRowHeight={30}
              rowHeight={40}
              defaultColumnOptions={{
                sortable: true,
                resizable: true,
                minWidth: 80,
                maxWidth: 250,
                width: 120
              }}
              rowKeyGetter={(row) => row.rowNumber}
              enableVirtualization={true}
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
            <span>
              {processedData.length} rows × {headers.length} columns
              {selectedRows.size > 0 && ` | ${selectedRows.size} row(s) selected`}
              {selectedColumns.size > 0 && ` | ${selectedColumns.size} column(s) selected`}
              {filterValue && ` | Filtered by: "${filterValue}"`}
              {sortConfig && ` | Sorted by: ${headers[parseInt(sortConfig.key.replace('col_', ''))]} (${sortConfig.direction})`}
            </span>
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <span className="text-gray-500">
                💡 Formulas: =SUM(1,2,3), =AVERAGE(1,2,3), =COUNT(1,2,3), =MAX(1,2,3), =MIN(1,2,3) or =1+2*3
              </span>
              {!readOnly && (
                <span className="text-gray-500 hidden xl:block">
                  ⌨️ Shortcuts: Ctrl+Z/Y (Undo/Redo), Ctrl+C/X/V (Copy/Cut/Paste), Del (Delete), Esc (Clear) | 🖱️ Right-click for context menu | 📝 Double-click column header to rename
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Context Menu */}
    <ContextMenu />
    </div>
  );
}

export default ExcelEditor;
