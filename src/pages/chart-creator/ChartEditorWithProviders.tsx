import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ChartEditorProvider } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';
import ChartEditorPage from './ChartEditorPage';

const ChartEditorWithProviders: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get chart type from location state (passed from ChooseTemplateTab)
  const locationState = location.state as { type?: ChartType } | null;
  const typeFromState = locationState?.type;

  // Get chart ID and dataset ID from URL parameters
  const chartId = searchParams.get('chartId') || undefined;
  const datasetId = searchParams.get('datasetId') || undefined;

  // Determine mode based on URL parameters:
  // - If chartId exists: edit mode
  // - Otherwise: create mode
  const mode = chartId ? 'edit' : 'create';

  // Get initial chart type with stable default
  const initialChartType = typeFromState || ChartType.Line;

  return (
    <ChartEditorProvider
      initialChartType={initialChartType}
      mode={mode}
      chartId={chartId}
      datasetId={datasetId}
    >
      <ChartEditorPage />
    </ChartEditorProvider>
  );
};

export default ChartEditorWithProviders;
