import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (total: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  getOffset: () => number;
  getLimit: () => number;
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  totalItems: initialTotalItems = 0,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  // Pagination state
  const pagination = useMemo(
    (): PaginationState => ({
      currentPage,
      pageSize,
      totalItems,
      totalPages,
    }),
    [currentPage, pageSize, totalItems, totalPages]
  );

  // Set page with validation
  const setPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  // Set page size and reset to first page
  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // Navigation functions
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Can navigate flags
  const canGoNext = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);
  const canGoPrevious = useMemo(() => currentPage > 1, [currentPage]);

  // Get offset and limit for API calls
  const getOffset = useCallback(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const getLimit = useCallback(() => {
    return pageSize;
  }, [pageSize]);

  return {
    pagination,
    setPage,
    setPageSize: handleSetPageSize,
    setTotalItems,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    getOffset,
    getLimit,
  };
};

export default usePagination;
