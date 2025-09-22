import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import {
  fetchCharts,
  fetchChartById,
  createChartThunk,
  updateChartThunk,
  deleteChartThunk,
} from './chartThunk';
import { clearError, clearCurrentChart } from './chartSlice';
import type { CreateChartRequest, UpdateChartRequest } from './chartAPI';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useChart = () => {
  const dispatch = useAppDispatch();
  const chartState = useAppSelector(state => state.chart);

  const fetchAllCharts = () => {
    dispatch(fetchCharts());
  };

  const fetchChart = (id: string) => {
    dispatch(fetchChartById(id));
  };

  const createChart = (data: CreateChartRequest) => {
    return dispatch(createChartThunk(data));
  };

  const updateChart = (id: string, data: UpdateChartRequest) => {
    return dispatch(updateChartThunk({ id, data }));
  };

  const deleteChart = (id: string) => {
    return dispatch(deleteChartThunk(id));
  };

  const clearChartError = () => {
    dispatch(clearError());
  };

  const clearCurrent = () => {
    dispatch(clearCurrentChart());
  };

  return {
    ...chartState,
    fetchAllCharts,
    fetchChart,
    createChart,
    updateChart,
    deleteChart,
    clearChartError,
    clearCurrent,
  };
};
