import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCharts,
  fetchChartById,
  createChartThunk,
  updateChartThunk,
  deleteChartThunk,
} from './chartThunk';
import { clearError, clearCurrentChart } from './chartSlice';
import type { CreateChartRequest, UpdateChartRequest } from './chartTypes';

export const useCharts = () => {
  const dispatch = useAppDispatch();
  const { charts, currentChart, loading, creating, updating, deleting, error } = useAppSelector(
    state => state.charts
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

  // Create chart
  const createChart = useCallback(
    (data: CreateChartRequest) => {
      return dispatch(createChartThunk(data));
    },
    [dispatch]
  );

  // Update chart
  const updateChart = useCallback(
    (id: string, data: UpdateChartRequest) => {
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
