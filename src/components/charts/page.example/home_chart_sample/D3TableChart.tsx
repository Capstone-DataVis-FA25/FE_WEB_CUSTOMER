import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export interface TableDataPoint {
  [key: string]: string | number | boolean;
}

export interface TableChartProps {
  data: TableDataPoint[];
  title?: string;
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  responsive?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

const D3TableChart: React.FC<TableChartProps> = ({
  data,
  title,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  striped = true,
  bordered = true,
  hoverable = true,
  compact = false,
  responsive = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get column names from the first data item
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      let comparison = 0;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, sortedData.length);

  const handleSort = (column: string) => {
    if (!sortable) return;
    
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatValue = (value: string | number | boolean): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const formatColumnName = (column: string): string => {
    return column
      .split(/(?=[A-Z])|_|-/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <div className="w-4 h-4" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-primary" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 text-primary" />;
    }
    
    return <div className="w-4 h-4" />;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full space-y-4">
        {title && (
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground text-center">
            {title}
          </h3>
        )}
        <div className="text-center text-muted-foreground py-8">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground text-center">
          {title}
        </h3>
      )}

      {/* Search */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Table Container */}
      <div className={`bg-background rounded-xl border-2 border-border shadow-lg overflow-hidden ${responsive ? 'overflow-x-auto' : ''}`}>
        <table className="w-full">
          {/* Header */}
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className={`
                    text-left font-semibold text-foreground
                    ${compact ? 'px-3 py-2' : 'px-4 py-3'}
                    ${sortable ? 'cursor-pointer hover:bg-muted/70 select-none' : ''}
                    ${bordered ? 'border-r border-border last:border-r-0' : ''}
                  `}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-between">
                    <span>{formatColumnName(column)}</span>
                    {sortable && getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`
                  ${striped && index % 2 === 1 ? 'bg-muted/30' : ''}
                  ${hoverable ? 'hover:bg-muted/50 transition-colors' : ''}
                  ${bordered ? 'border-b border-border last:border-b-0' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className={`
                      text-foreground
                      ${compact ? 'px-3 py-2' : 'px-4 py-3'}
                      ${bordered ? 'border-r border-border last:border-r-0' : ''}
                    `}
                  >
                    {formatValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {sortedData.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`
                      px-3 py-1 text-sm border border-border rounded-md
                      ${currentPage === pageNumber 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="p-3 bg-card rounded-lg border border-border text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Total Rows
          </div>
          <div className="text-lg font-bold text-foreground">
            {data.length}
          </div>
        </div>
        
        <div className="p-3 bg-card rounded-lg border border-border text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Filtered Rows
          </div>
          <div className="text-lg font-bold text-foreground">
            {sortedData.length}
          </div>
        </div>
        
        <div className="p-3 bg-card rounded-lg border border-border text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Columns
          </div>
          <div className="text-lg font-bold text-foreground">
            {columns.length}
          </div>
        </div>
        
        <div className="p-3 bg-card rounded-lg border border-border text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Current Page
          </div>
          <div className="text-lg font-bold text-foreground">
            {currentPage} / {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

export default D3TableChart;
