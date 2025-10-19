import React, { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ChartType } from '@/features/charts';
import { useAppDispatch } from '@/store/hooks';
import { initializeEditor } from '@/features/chartEditor';
import ChartEditorPage from './ChartEditorPage';

const ChartEditorWithProviders: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Get chart type from location state (passed from ChooseTemplateTab)
  const locationState = location.state as { type?: ChartType; datasetId?: string } | null;
  const typeFromState = locationState?.type;

  // Get chart ID and dataset ID from URL parameters
  const chartId = searchParams.get('chartId') || undefined;
  const datasetId = searchParams.get('datasetId') || locationState?.datasetId || undefined;

  // Determine mode based on URL parameters:
  // - If chartId exists: edit mode
  // - Otherwise: create mode
  const mode = chartId ? 'edit' : 'create';

  // Get initial chart type with stable default
  const initialChartType = typeFromState || ChartType.Line;

  // Initialize Redux state when component mounts or params change
  useEffect(() => {
    dispatch(
      initializeEditor({
        mode,
        chartId,
        datasetId,
        initialChartType,
      })
    );
  }, [dispatch, mode, chartId, datasetId, initialChartType]);

  return <ChartEditorPage />;
};

export default ChartEditorWithProviders;
