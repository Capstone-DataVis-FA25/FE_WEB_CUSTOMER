import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDatasets,
  fetchDatasetById,
  createDatasetThunk,
  updateDatasetThunk,
  deleteDatasetThunk,
} from './datasetThunk';
import { clearError, clearCurrentDataset } from './datasetSlice';
import type { CreateDatasetRequest, UpdateDatasetRequest } from './datasetAPI';

export const useDataset = () => {
  const dispatch = useAppDispatch();
  // Use separate selectors to prevent re-renders when only the list is being fetched
  const datasets = useAppSelector(state => state.dataset.datasets);
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);
  const loading = useAppSelector(state => state.dataset.loading);
  const loadingList = useAppSelector(state => state.dataset.loadingList);
  const creating = useAppSelector(state => state.dataset.creating);
  const updating = useAppSelector(state => state.dataset.updating);
  const deleting = useAppSelector(state => state.dataset.deleting);
  const error = useAppSelector(state => state.dataset.error);

  // Get all datasets
  const getDatasets = useCallback(() => {
    return dispatch(fetchDatasets());
  }, [dispatch]);

  // Get dataset by ID
  const getDatasetById = useCallback(
    (id: string) => {
      return dispatch(fetchDatasetById(id));
    },
    [dispatch]
  );

  // Create dataset
  const createDataset = useCallback(
    (data: CreateDatasetRequest) => {
      return dispatch(createDatasetThunk(data));
    },
    [dispatch]
  );

  // Update dataset
  const updateDataset = useCallback(
    (id: string, data: UpdateDatasetRequest) => {
      return dispatch(updateDatasetThunk({ id, data }));
    },
    [dispatch]
  );

  // Delete dataset
  const deleteDataset = useCallback(
    (id: string) => {
      return dispatch(deleteDatasetThunk(id));
    },
    [dispatch]
  );

  // Clear error
  const clearDatasetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current dataset
  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentDataset());
  }, [dispatch]);

  // Memoize the return value to prevent unnecessary re-renders
  // Only recreate the object when actual values change
  return useMemo(
    () => ({
      // State
      datasets,
      currentDataset,
      loading,
      loadingList,
      creating,
      updating,
      deleting,
      error,
      // Actions
      getDatasets,
      getDatasetById,
      createDataset,
      updateDataset,
      deleteDataset,
      clearDatasetError,
      clearCurrent,
    }),
    [
      datasets,
      currentDataset,
      loading,
      loadingList,
      creating,
      updating,
      deleting,
      error,
      getDatasets,
      getDatasetById,
      createDataset,
      updateDataset,
      deleteDataset,
      clearDatasetError,
      clearCurrent,
    ]
  );
};
