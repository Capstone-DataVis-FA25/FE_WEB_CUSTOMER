import { ChartType } from '@/features/charts/chartTypes';
import type {
  AreaChartConfig,
  BarChartConfig,
  BaseChartConfig,
  FormatterConfig,
  LineChartConfig,
  MainChartConfig,
  SeriesConfig,
  SubAreaChartConfig,
  SubBarChartConfig,
  SubLineChartConfig,
} from '@/types/chart';

// Default Sub configs
const defaultBaseChartConfig: BaseChartConfig = {
  width: 800,
  height: 400,
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  xAxisKey: '',
  yAxisKeys: [],
  title: '',
  xAxisLabel: '',
  yAxisLabel: '',
  showLegend: true,
  showGrid: true,
  animationDuration: 400,
  xAxisStart: 'auto',
  yAxisStart: 'auto',
  gridOpacity: 0.2,
  legendPosition: 'top',
  xAxisRotation: 0,
  yAxisRotation: 0,
  showAxisLabels: true,
  showAxisTicks: true,
  enableZoom: false,
  enablePan: false,
  zoomExtent: 100,
  showTooltip: true,
  theme: 'light',
  backgroundColor: '#fff',
  titleFontSize: 18,
  labelFontSize: 12,
  legendFontSize: 12,
};

// Tạo config default cho line
const defaultSubLineConfig: SubLineChartConfig = {
  ...defaultBaseChartConfig,
  disabledLines: [],
  showPoints: false,
  showPointValues: false,
  curve: 'curveLinear',
  lineWidth: 2,
  pointRadius: 2,
};

// Tạo config default cho area
const defaultSubAreaConfig: SubAreaChartConfig = {
  ...defaultBaseChartConfig,
  showStroke: false,
  curve: 'curveLinear',
  lineWidth: 2,
};

// Tạo config default cho bar (KHÔNG kế thừa từ line)
const defaultSubBarConfig: SubBarChartConfig = {
  ...defaultBaseChartConfig,
  disabledBars: [],
  barType: 'grouped',
  barWidth: 24,
  barSpacing: 8,
  showPoints: false,
  showPointValues: false,
};

// Default formatter config
const defaultFormatterConfig: Partial<FormatterConfig> = {
  useYFormatter: false,
  useXFormatter: false,
  yFormatterType: 'number',
  xFormatterType: 'number',
  customYFormatter: '',
  customXFormatter: '',
};

// Default series configs (empty)
const defaultSeriesConfigs: SeriesConfig[] = [];

// Default config cho từng loại chart
export const defaultLineChartConfig: LineChartConfig = {
  config: defaultSubLineConfig,
  formatters: defaultFormatterConfig,
  seriesConfigs: defaultSeriesConfigs,
  chartType: 'line',
};

export const defaultAreaChartConfig: AreaChartConfig = {
  config: defaultSubAreaConfig,
  formatters: defaultFormatterConfig,
  seriesConfigs: defaultSeriesConfigs,
  chartType: 'area',
};

export const defaultBarChartConfig: BarChartConfig = {
  config: defaultSubBarConfig,
  formatters: defaultFormatterConfig,
  seriesConfigs: defaultSeriesConfigs,
  chartType: 'bar',
};

// Returns a consistent default StructuredChartConfig for given chart type and optional dataset name
export const getDefaultChartConfig = (chartType: ChartType): MainChartConfig => {
  const log = (cfg: MainChartConfig) => {
    console.log('[getDefaultChartConfig] type ->', chartType);
    console.log('[getDefaultChartConfig] result:', cfg);
    return cfg;
  };
  switch (chartType) {
    case ChartType.Line:
      return log(defaultLineChartConfig);
    case ChartType.Area:
      return log(defaultAreaChartConfig);
    case ChartType.Bar:
      return log(defaultBarChartConfig);
  }
};
