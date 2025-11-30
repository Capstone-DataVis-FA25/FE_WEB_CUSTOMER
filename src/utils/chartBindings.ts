import type { MainChartConfig } from '@/types/chart';

// Returns a minimal patch you can pass to handleConfigChange to clear data-bound fields
export const buildResetBindingsPatch = (chart: MainChartConfig): Partial<MainChartConfig> => {
  switch (chart.chartType) {
    case 'line':
    case 'bar':
    case 'area':
    case 'scatter': {
      const axisConfigs = {
        ...(chart.axisConfigs || {}),
        xAxisKey: undefined,
        seriesConfigs: [],
      } as any;
      return { axisConfigs } as Partial<MainChartConfig>;
    }
    case 'pie':
    case 'donut': {
      const config = {
        ...(chart.config as any),
        labelKey: '',
        valueKey: '',
      };
      return { config } as Partial<MainChartConfig>;
    }
    case 'heatmap': {
      const axisConfigs = {
        ...(chart.axisConfigs || {}),
        xAxisKey: undefined,
        yAxisKey: undefined,
        valueKey: undefined,
      } as any;
      return { axisConfigs } as Partial<MainChartConfig>;
    }
    default:
      return {};
  }
};

// Helper to fully apply reset (immutable): returns a new MainChartConfig object
export const resetBindings = (chart: MainChartConfig): MainChartConfig => {
  const patch = buildResetBindingsPatch(chart);
  return { ...chart, ...patch } as MainChartConfig;
};
