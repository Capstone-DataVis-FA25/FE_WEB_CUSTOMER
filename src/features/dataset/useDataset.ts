import { useCallback } from 'react';
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
  const {
    datasets,
    currentDataset,
    loading,
    creating,
    updating,
    deleting,
    error,
  } = useAppSelector((state) => state.dataset);

  // Get all datasets
  const getDatasets = useCallback(() => {
    return dispatch(fetchDatasets());
  }, [dispatch]);

  // Get dataset by ID
  const getDatasetById = useCallback((id: string) => {
    return dispatch(fetchDatasetById(id));
  }, [dispatch]);

  // Create dataset
  const createDataset = useCallback((data: CreateDatasetRequest) => {
    return dispatch(createDatasetThunk(data));
  }, [dispatch]);

  // Update dataset
  const updateDataset = useCallback((id: string, data: UpdateDatasetRequest) => {
    return dispatch(updateDatasetThunk({ id, data }));
  }, [dispatch]);

  // Delete dataset
  const deleteDataset = useCallback((id: string) => {
    return dispatch(deleteDatasetThunk(id));
  }, [dispatch]);

  // Clear error
  const clearDatasetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current dataset
  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentDataset());
  }, [dispatch]);

  return {
    // State
    datasets,
    currentDataset,
    loading,
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
  };
};
