import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Upload, Save } from 'lucide-react';
import Spreadsheet from 'x-data-spreadsheet';
import 'x-data-spreadsheet/dist/xspreadsheet.css';

interface SpreadsheetEditorProps {
  initialData?: string[][];
  onDataChange?: (data: string[][]) => void;
  onSave?: (data: string[][]) => void;
  readOnly?: boolean;
  title?: string;
  className?: string;
}

const SpreadsheetEditor: React.FC<SpreadsheetEditorProps> = ({
  initialData = [],
  onDataChange,
  onSave,
  readOnly = false,
  title = 'Spreadsheet Editor',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spreadsheetRef = useRef<any>(null);

  // Convert array data to x-spreadsheet format
  const convertToSpreadsheetData = (data: string[][]) => {
    if (!data || data.length === 0) {
      return {
        name: 'Sheet1',
        freeze: 'A1',
        styles: [],
        merges: [],
        rows: {
          0: {
            cells: {
              0: { text: 'A1' },
              1: { text: 'B1' },
              2: { text: 'C1' }
            }
          }
        },
        cols: {}
      };
    }

    const rows: any = {};
    data.forEach((row, rowIndex) => {
      const cells: any = {};
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== undefined && cellValue !== null) {
          cells[colIndex] = { text: String(cellValue) };
        }
      });
      if (Object.keys(cells).length > 0) {
        rows[rowIndex] = { cells };
      }
    });

    return {
      name: 'Sheet1',
      freeze: 'A1',
      styles: [],
      merges: [],
      rows,
      cols: {}
    };
  };

  // Convert x-spreadsheet data back to array format
  const convertFromSpreadsheetData = (): string[][] => {
    if (!spreadsheetRef.current) return [];

    try {
      const data = spreadsheetRef.current.getData();
      const result: string[][] = [];
      
      if (data && data.rows) {
        // Find max row and column
        let maxRow = 0;
        let maxCol = 0;
        
        Object.keys(data.rows).forEach(rowKey => {
          const rowIndex = parseInt(rowKey);
          maxRow = Math.max(maxRow, rowIndex);
          
          if (data.rows[rowIndex] && data.rows[rowIndex].cells) {
            Object.keys(data.rows[rowIndex].cells).forEach(colKey => {
              const colIndex = parseInt(colKey);
              maxCol = Math.max(maxCol, colIndex);
            });
          }
        });

        // Convert to 2D array
        for (let r = 0; r <= maxRow; r++) {
          const row: string[] = [];
          for (let c = 0; c <= maxCol; c++) {
            const cellData = data.rows[r]?.cells?.[c];
            row[c] = cellData?.text || '';
          }
          result[r] = row;
        }
      }

      // Remove empty trailing rows and columns
      while (result.length > 0 && result[result.length - 1].every(cell => !cell)) {
        result.pop();
      }

      return result;
    } catch (error) {
      console.error('Error converting spreadsheet data:', error);
      return [];
    }
  };

  // Initialize x-spreadsheet
  useEffect(() => {
    if (containerRef.current) {
      // Clear container
      containerRef.current.innerHTML = '';

      const spreadsheetData = convertToSpreadsheetData(initialData);
      
      const options = {
        mode: (readOnly ? 'read' : 'edit') as 'read' | 'edit',
        showToolbar: !readOnly,
        showGrid: true,
        showContextmenu: !readOnly,
        view: {
          height: () => 600,
          width: () => containerRef.current?.offsetWidth || 800,
        },
        row: {
          len: Math.max(50, initialData.length + 10),
          height: 25,
        },
        col: {
          len: Math.max(26, (initialData[0]?.length || 0) + 5),
          width: 100,
          indexWidth: 60,
          minWidth: 60,
        }
      };

      try {
        const xs = new Spreadsheet(containerRef.current, options);
        
        // Load data directly into first sheet
        if (initialData && initialData.length > 0) {
          xs.loadData([convertToSpreadsheetData(initialData)]);
        } else {
          // Create default data structure
          xs.loadData([{
            name: 'Sheet1',
            freeze: 'A1',
            styles: [],
            merges: [],
            rows: {},
            cols: {}
          }]);
        }
        
        // Handle data changes
        if (onDataChange && !readOnly) {
          xs.change((_json: Record<string, any>) => {
            const newData = convertFromSpreadsheetData();
            onDataChange(newData);
          });
        }

        spreadsheetRef.current = xs;
      } catch (error) {
        console.error('Error initializing spreadsheet:', error);
      }
    }

    return () => {
      if (spreadsheetRef.current) {
        try {
          spreadsheetRef.current.destroy();
        } catch (error) {
          console.error('Error destroying spreadsheet:', error);
        }
      }
    };
  }, [initialData, readOnly, onDataChange]);

  // Handle save
  const handleSave = () => {
    if (onSave && spreadsheetRef.current) {
      const data = convertFromSpreadsheetData();
      onSave(data);
    }
  };

  // Handle export
  const handleExport = () => {
    if (spreadsheetRef.current) {
      try {
        const data = convertFromSpreadsheetData();
        const csvContent = data.map(row => 
          row.map(cell => 
            cell.includes(',') ? `"${cell}"` : cell
          ).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'spreadsheet-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Export error:', error);
      }
    }
  };

  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && spreadsheetRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n').map(row => 
            row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
          ).filter(row => row.some(cell => cell.length > 0)); // Remove completely empty rows
          
          if (rows.length > 0) {
            const spreadsheetData = convertToSpreadsheetData(rows);
            spreadsheetRef.current.loadData([spreadsheetData]);
            
            if (onDataChange) {
              onDataChange(rows);
            }
          }
        } catch (error) {
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
    // Clear input
    event.target.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm w-full max-w-full mx-auto">
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              {title}
            </CardTitle>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            {onSave && !readOnly && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                title="Save data"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2 h-9 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            {!readOnly && (
              <>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleImport}
                  className="hidden"
                  id="spreadsheet-import"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('spreadsheet-import')?.click()}
                  className="flex items-center gap-2 h-9 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  title="Import CSV file"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </>
            )}
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Excel-like Features:</span>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">Formulas</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">Formatting</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">Sorting</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
            {/* Spreadsheet Container */}
            <div
              ref={containerRef}
              className="w-full min-h-[400px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden 
                         [&_.x-spreadsheet]:font-inherit [&_.x-spreadsheet]:bg-white dark:[&_.x-spreadsheet]:bg-gray-800
                         [&_.x-spreadsheet-table]:border-gray-200 dark:[&_.x-spreadsheet-table]:border-gray-600
                         [&_.x-spreadsheet-table_td]:border-gray-200 dark:[&_.x-spreadsheet-table_td]:border-gray-600
                         [&_.x-spreadsheet-table_td]:bg-white dark:[&_.x-spreadsheet-table_td]:bg-gray-800
                         [&_.x-spreadsheet-table_td]:text-gray-900 dark:[&_.x-spreadsheet-table_td]:text-gray-100
                         [&_.x-spreadsheet-table_th]:bg-gray-50 dark:[&_.x-spreadsheet-table_th]:bg-gray-700
                         [&_.x-spreadsheet-table_th]:text-gray-700 dark:[&_.x-spreadsheet-table_th]:text-gray-200
                         [&_.x-spreadsheet-toolbar]:bg-gray-50 dark:[&_.x-spreadsheet-toolbar]:bg-gray-700
                         [&_.x-spreadsheet-toolbar_.x-spreadsheet-toolbar-btn]:text-gray-700 dark:[&_.x-spreadsheet-toolbar_.x-spreadsheet-toolbar-btn]:text-gray-200
                         [&_.x-spreadsheet-formula-input]:bg-white dark:[&_.x-spreadsheet-formula-input]:bg-gray-800
                         [&_.x-spreadsheet-formula-input]:text-gray-900 dark:[&_.x-spreadsheet-formula-input]:text-gray-100
                         [&_.x-spreadsheet-formula-input]:border-gray-200 dark:[&_.x-spreadsheet-formula-input]:border-gray-600"
              style={{ height: '600px' }}
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center mt-4 rounded-lg">
            <span className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Powered by x-spreadsheet - Fast & Lightweight Excel experience</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400 hidden lg:block">
              <span className="text-lg">⚡</span>
              No dependencies, pure JavaScript implementation
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpreadsheetEditor;
