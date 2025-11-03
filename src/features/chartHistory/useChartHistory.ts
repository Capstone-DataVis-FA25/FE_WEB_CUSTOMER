import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import {
  fetchChartHistory,
  fetchHistoryCount,
  fetchHistoryById,
  restoreFromHistoryThunk,
  compareVersionsThunk,
  deleteHistoryThunk,
} from './chartHistoryThunk';
import {
  clearError,
  clearComparison,
  setSelectedHistory,
  clearCurrentChartHistories,
} from './chartHistorySlice';
import type { RestoreChartRequest } from './chartHistoryTypes';

export const useChartHistory = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const histories = useSelector((state: RootState) => state.chartHistory.histories);
  const currentChartHistories = useSelector(
    (state: RootState) => state.chartHistory.currentChartHistories
  );
  const selectedHistory = useSelector((state: RootState) => state.chartHistory.selectedHistory);
  const historyCount = useSelector((state: RootState) => state.chartHistory.historyCount);
  const loading = useSelector((state: RootState) => state.chartHistory.loading);
  const restoring = useSelector((state: RootState) => state.chartHistory.restoring);
  const deleting = useSelector((state: RootState) => state.chartHistory.deleting);
  const comparing = useSelector((state: RootState) => state.chartHistory.comparing);
  const error = useSelector((state: RootState) => state.chartHistory.error);
  const comparisonResult = useSelector((state: RootState) => state.chartHistory.comparisonResult);

  // Actions
  const getChartHistory = (chartId: string) => {
    return dispatch(fetchChartHistory(chartId));
  };

  const getHistoryCount = (chartId: string) => {
    return dispatch(fetchHistoryCount(chartId));
  };

  const getHistoryById = (historyId: string) => {
    return dispatch(fetchHistoryById(historyId));
  };

  const restoreFromHistory = (chartId: string, restoreData: RestoreChartRequest) => {
    return dispatch(restoreFromHistoryThunk({ chartId, restoreData }));
  };

  const compareVersions = (chartId: string, historyId: string) => {
    return dispatch(compareVersionsThunk({ chartId, historyId }));
  };

  const deleteHistory = (chartId: string, historyId: string) => {
    return dispatch(deleteHistoryThunk({ chartId, historyId }));
  };

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  const clearComparisonResult = () => {
    dispatch(clearComparison());
  };

  const selectHistory = (history: typeof selectedHistory) => {
    dispatch(setSelectedHistory(history));
  };

  const clearHistories = () => {
    dispatch(clearCurrentChartHistories());
  };

  return {
    // State
    histories,
    currentChartHistories,
    selectedHistory,
    historyCount,
    loading,
    restoring,
    deleting,
    comparing,
    error,
    comparisonResult,

    // Actions
    getChartHistory,
    getHistoryCount,
    getHistoryById,
    restoreFromHistory,
    compareVersions,
    deleteHistory,
    clearErrorMessage,
    clearComparisonResult,
    selectHistory,
    clearHistories,
  };
};
