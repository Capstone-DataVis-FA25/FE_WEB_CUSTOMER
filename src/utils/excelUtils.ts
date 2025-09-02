// Excel utility functions
export const numberToExcelColumn = (num: number): string => {
  let result = '';
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
};

export const excelColumnToNumber = (column: string): number => {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1;
};

export const getCellReference = (row: number, col: number): string => {
  return `${numberToExcelColumn(col)}${row + 1}`;
};

export const parseCellReference = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  
  const col = excelColumnToNumber(match[1]);
  const row = parseInt(match[2]) - 1;
  
  return { row, col };
};

export const getCellRange = (startRef: string, endRef: string): string[][] => {
  const start = parseCellReference(startRef);
  const end = parseCellReference(endRef);
  
  if (!start || !end) return [];
  
  const result: string[][] = [];
  for (let row = start.row; row <= end.row; row++) {
    const rowData: string[] = [];
    for (let col = start.col; col <= end.col; col++) {
      rowData.push(getCellReference(row, col));
    }
    result.push(rowData);
  }
  
  return result;
};

// Formula evaluation helpers
export const evaluateFormula = (formula: string, data: string[][]): string => {
  if (!formula.startsWith('=')) return formula;
  
  try {
    let expression = formula.substring(1);
    
    // Replace cell references (A1, B2, etc.) with actual values
    expression = expression.replace(/[A-Z]+\d+/g, (match) => {
      const cellRef = parseCellReference(match);
      if (cellRef && data[cellRef.row + 1] && data[cellRef.row + 1][cellRef.col]) {
        const value = data[cellRef.row + 1][cellRef.col];
        return isNaN(Number(value)) ? `"${value}"` : value;
      }
      return '0';
    });
    
    // Handle Excel functions
    if (expression.includes('SUM(')) {
      expression = expression.replace(/SUM\(([^)]+)\)/g, (_, range) => {
        const numbers = extractNumbers(range, data);
        return numbers.reduce((acc, num) => acc + num, 0).toString();
      });
    }
    
    if (expression.includes('AVERAGE(')) {
      expression = expression.replace(/AVERAGE\(([^)]+)\)/g, (_, range) => {
        const numbers = extractNumbers(range, data);
        const avg = numbers.length > 0 ? numbers.reduce((acc, num) => acc + num, 0) / numbers.length : 0;
        return avg.toString();
      });
    }
    
    if (expression.includes('COUNT(')) {
      expression = expression.replace(/COUNT\(([^)]+)\)/g, (_, range) => {
        const numbers = extractNumbers(range, data);
        return numbers.length.toString();
      });
    }
    
    if (expression.includes('MAX(')) {
      expression = expression.replace(/MAX\(([^)]+)\)/g, (_, range) => {
        const numbers = extractNumbers(range, data);
        return numbers.length > 0 ? Math.max(...numbers).toString() : '0';
      });
    }
    
    if (expression.includes('MIN(')) {
      expression = expression.replace(/MIN\(([^)]+)\)/g, (_, range) => {
        const numbers = extractNumbers(range, data);
        return numbers.length > 0 ? Math.min(...numbers).toString() : '0';
      });
    }
    
    // Evaluate basic math expressions
    if (/^[\d+\-*/().\s]+$/.test(expression)) {
      const result = Function(`"use strict"; return (${expression})`)();
      return result.toString();
    }
    
    return expression;
  } catch (error) {
    return '#ERROR';
  }
};

const extractNumbers = (range: string, data: string[][]): number[] => {
  const numbers: number[] = [];
  
  // Handle cell range (A1:B3)
  if (range.includes(':')) {
    const [start, end] = range.split(':');
    const cellRange = getCellRange(start.trim(), end.trim());
    cellRange.flat().forEach(cellRef => {
      const cell = parseCellReference(cellRef);
      if (cell && data[cell.row + 1] && data[cell.row + 1][cell.col]) {
        const value = parseFloat(data[cell.row + 1][cell.col]);
        if (!isNaN(value)) numbers.push(value);
      }
    });
  } else {
    // Handle comma-separated values or single cells
    range.split(',').forEach(item => {
      const trimmed = item.trim();
      if (/^[A-Z]+\d+$/.test(trimmed)) {
        // It's a cell reference
        const cell = parseCellReference(trimmed);
        if (cell && data[cell.row + 1] && data[cell.row + 1][cell.col]) {
          const value = parseFloat(data[cell.row + 1][cell.col]);
          if (!isNaN(value)) numbers.push(value);
        }
      } else {
        // It's a direct number
        const value = parseFloat(trimmed);
        if (!isNaN(value)) numbers.push(value);
      }
    });
  }
  
  return numbers;
};
