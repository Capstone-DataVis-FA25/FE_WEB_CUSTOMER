import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Upload, Save } from 'lucide-react';
import Spreadsheet from 'x-data-spreadsheet';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
      return { name: 'Sheet1', freeze: 'A1', styles: [], merges: [], rows: {}, cols: {} };
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

    return { name: 'Sheet1', freeze: 'A1', styles: [], merges: [], rows, cols: {} };
  };

  // Convert x-spreadsheet data back to array format using direct data access
  const convertFromSpreadsheetData = (): string[][] => {
    if (!spreadsheetRef.current || !spreadsheetRef.current.data) {
      console.warn('Spreadsheet reference or internal data not available.');
      return [];
    }

    try {
      // Directly access the data of the first sheet from the instance's internal state
      const sheetData = spreadsheetRef.current.data[0];
      if (!sheetData || !sheetData.rows) {
        console.error('Direct Access: No sheet data or rows found in the instance.');
        // Fallback to getData() if direct access fails
        const allSheetsData = spreadsheetRef.current.getData();
        if (!allSheetsData || !Array.isArray(allSheetsData) || allSheetsData.length === 0) {
          console.error('Fallback getData() also failed or returned no sheets.');
          return [];
        }
        return parseSheetData(allSheetsData[0]);
      }
      
      return parseSheetData(sheetData);

    } catch (error) {
      console.error('Error converting spreadsheet data via direct access:', error);
      return [];
    }
  };

  const parseSheetData = (sheet: any): string[][] => {
    if (!sheet || !sheet.rows) {
      console.log('Sheet contains no rows.');
      return [];
    }

    const rows = sheet.rows;
    const result: string[][] = [];
    const rowKeys = Object.keys(rows);

    if (rowKeys.length === 0) {
      return [];
    }

    let maxRow = 0;
    let maxCol = 0;
    rowKeys.forEach(r => {
      const rowIndex = parseInt(r);
      if (!isNaN(rowIndex)) {
        maxRow = Math.max(maxRow, rowIndex);
        const row = rows[rowIndex];
        if (row && row.cells) {
          Object.keys(row.cells).forEach(c => {
            const colIndex = parseInt(c);
            if (!isNaN(colIndex)) {
              maxCol = Math.max(maxCol, colIndex);
            }
          });
        }
      }
    });

    for (let i = 0; i <= maxRow; i++) {
      const rowData: string[] = [];
      for (let j = 0; j <= maxCol; j++) {
        const cell = rows[i]?.cells?.[j];
        rowData.push(cell?.text || '');
      }
      result.push(rowData);
    }
    
    while (result.length > 0 && result[result.length - 1].every(cell => !cell)) {
      result.pop();
    }

    console.log('Successfully parsed sheet data:', result.length, 'rows');
    return result;
  }

  // Initialize x-spreadsheet
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const options = {
        mode: (readOnly ? 'read' : 'edit') as 'read' | 'edit',
        showToolbar: !readOnly,
        showGrid: true,
        showContextmenu: !readOnly,
        view: {
          height: () => 600,
          width: () => containerRef.current?.offsetWidth || 800,
        },
        row: { len: Math.max(100, initialData.length + 20), height: 25 },
        col: { len: Math.max(26, (initialData[0]?.length || 0) + 10), width: 100, indexWidth: 60, minWidth: 60 }
      };

      try {
        const xs = new Spreadsheet(containerRef.current, options);
        
        if (initialData && initialData.length > 0) {
          xs.loadData([convertToSpreadsheetData(initialData)]);
        }
        
        if (onDataChange && !readOnly) {
          xs.change(() => {
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
      if (spreadsheetRef.current && typeof spreadsheetRef.current.destroy === 'function') {
        spreadsheetRef.current.destroy();
        spreadsheetRef.current = null;
      }
    };
  }, [initialData, readOnly]);

  // Handle save
  const handleSave = () => {
    if (onSave && spreadsheetRef.current) {
      const data = convertFromSpreadsheetData();
      onSave(data);
    }
  };

  // Handle export to XLSX
  const handleExport = () => {
    try {
      const data = convertFromSpreadsheetData();
      console.log('Exporting data:', data);
      
      if (!data || data.length === 0 || data.every(row => row.every(cell => !cell))) {
        alert('No data to export. Please add some data to the spreadsheet first.');
        return;
      }
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_') || 'spreadsheet'}_export.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please check the console for more details.');
    }
  };

  // Handle import from Excel/CSV files
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && spreadsheetRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let rows: string[][] = [];
          
          if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as string[][];
          } else {
            const text = data as string;
            rows = text.split(/\\r\\n|\\n/).map(row => row.split(',').map(cell => cell.trim()));
          }
          
          if (rows.length > 0) {
            spreadsheetRef.current.loadData([convertToSpreadsheetData(rows)]);
            if (onDataChange) onDataChange(rows);
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('Failed to import file. See console for details.');
        }
      };
      
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
    event.target.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm w-full max-w-full mx-auto">
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              {title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            {onSave && !readOnly && (
              <Button variant="default" size="sm" onClick={handleSave} className="flex items-center gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4" /> Save
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2 h-9 border-gray-300 hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export XLSX
            </Button>
            {!readOnly && (
              <>
                <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleImport} className="hidden" id="spreadsheet-import" />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('spreadsheet-import')?.click()} className="flex items-center gap-2 h-9 border-gray-300 hover:bg-gray-50">
                  <Upload className="w-4 h-4" /> Import
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
            <div ref={containerRef} className="w-full" style={{ height: '600px', position: 'relative' }} />
            
            <style dangerouslySetInnerHTML={{ __html: `
              /* Aggressive CSS to fix "2 cells in 1" issue */
              .x-spreadsheet-table td {
                position: relative !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: hidden !important;
              }
              /* Hide all direct children of a cell by default */
              .x-spreadsheet-table td > * {
                display: none !important;
              }
              /* ONLY show the direct .x-spreadsheet-cell child. This is the key rule. */
              .x-spreadsheet-table td > .x-spreadsheet-cell {
                display: flex !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                align-items: center !important;
                padding: 2px 6px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                font-size: 13px !important;
                line-height: 1.2 !important;
              }
              /* Prevent nested cells from ever appearing */
              .x-spreadsheet-cell .x-spreadsheet-cell {
                display: none !important;
              }
              
              /* General UI improvements */
              .x-spreadsheet { border: none !important; }
              .x-spreadsheet-toolbar { background: #f8fafc !important; border-bottom: 1px solid #e2e8f0 !important; padding: 8px !important; }
              .x-spreadsheet-table th { background: #f9fafb !important; color: #374151 !important; border: 1px solid #d1d5db !important; font-weight: 600 !important; text-align: center !important; }
              .x-spreadsheet-table td { border: 1px solid #e5e7eb !important; background: white !important; }
              .x-spreadsheet-cell-selected {
                border: 2px solid #3b82f6 !important;
                background: rgba(59, 130, 246, 0.05) !important;
              }
            `}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpreadsheetEditor;
