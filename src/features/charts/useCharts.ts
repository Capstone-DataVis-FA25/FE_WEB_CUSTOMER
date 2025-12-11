import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createChartThunk,
  deleteChartThunk,
  fetchChartById,
  fetchCharts,
  updateChartThunk,
} from './chartThunk';
import { clearCurrentChart, clearError } from './chartSlice';
import type { ChartRequest } from './chartTypes';

export const useCharts = () => {
  const dispatch = useAppDispatch();
  const { charts, currentChart, loading, creating, updating, deleting, error } = useAppSelector(
    state => state.chart
  );

  // Get all charts
  const getCharts = useCallback(() => {
    return dispatch(fetchCharts());
  }, [dispatch]);

  // Get chart by ID
  const getChartById = useCallback(
    (id: string) => {
      return dispatch(fetchChartById(id));
    },
    [dispatch]
  );

  const createChart = (data: ChartRequest) => {
    return dispatch(createChartThunk(data));
  };

  // Update chart
  const updateChart = useCallback(
    (id: string, data: Partial<ChartRequest>) => {
      return dispatch(updateChartThunk({ id, data }));
    },
    [dispatch]
  );

  // Delete chart
  const deleteChart = useCallback(
    (id: string) => {
      return dispatch(deleteChartThunk(id));
    },
    [dispatch]
  );

  // Clear error
  const clearChartError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current chart
  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentChart());
  }, [dispatch]);

  return {
    // State
    charts,
    currentChart,
    loading,
    creating,
    updating,
    deleting,
    error,
    // Actions
    getCharts,
    getChartById,
    createChart,
    updateChart,
    deleteChart,
    clearChartError,
    clearCurrent,
  };
};
