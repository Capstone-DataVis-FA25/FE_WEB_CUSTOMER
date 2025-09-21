import { useContext } from 'react';
import { ChartCreationContext } from './ChartCreationContext';

// Hook to use the context
export function useChartCreation() {
  const context = useContext(ChartCreationContext);
  if (context === undefined) {
    throw new Error('useChartCreation must be used within a ChartCreationProvider');
  }
  return context;
}
