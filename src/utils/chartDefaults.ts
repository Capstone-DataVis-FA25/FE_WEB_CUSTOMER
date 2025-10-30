// ...existing code...
import { ChartType } from '@/features/charts/chartTypes';
import type {
  AreaChartConfig,
  BarChartConfig,
  BaseChartConfig,
  FormatterConfig,
  LineChartConfig,
  MainChartConfig,
  AxisConfig,
  SubAreaChartConfig,
  SubBarChartConfig,
  SubLineChartConfig,
  SubScatterChartConfig,
  ScatterChartConfig,
  SubPieDonutChartConfig,
  PieChartConfig,
  PieDonutFormatterConfig,
  DonutChartConfig,
} from '@/types/chart';

// Default Sub configs
const defaultBaseChartConfig: BaseChartConfig = {
  width: 800,
  height: 400,
  margin: { top: 40, right: 40, bottom: 40, left: 80 },
  title: '',
  showLegend: true,
  showGrid: true,
  animationDuration: 400,
  gridOpacity: 0.2,
  legendPosition: 'top',
  enableZoom: false,
  enablePan: false,
  zoomExtent: 100,
  showTooltip: true,
  theme: 'dark',
  backgroundColor: '#000000',
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

// Scatter config block (after all dependencies)
const defaultSubScatterConfig: SubScatterChartConfig = {
  ...defaultBaseChartConfig,
  pointRadius: 5,
  showGrid: true,
  showLegend: false,
};

// Pie config block (after all dependencies)
const defaultSubPieConfig: SubPieDonutChartConfig = {
  ...defaultBaseChartConfig,
  labelKey: '',
  valueKey: '',
  showLabels: true,
  showPercentage: true,
  showSliceValues: true,
  enableAnimation: true,
  innerRadius: 0,
  cornerRadius: 0,
  padAngle: 0,
  startAngle: 0,
  endAngle: 360,
  sortSlices: 'descending',
  sliceOpacity: 1,
  legendMaxItems: 10,
  strokeWidth: 2,
  strokeColor: '#ffffff',
  hoverScale: 1.05,
  enableHoverEffect: true,
  titleColor: '',
  labelColor: '',
  showTitle: true,
};

// Pie config block (after all dependencies)
const defaultSubDonutConfig: SubPieDonutChartConfig = {
  ...defaultBaseChartConfig,
  labelKey: '',
  valueKey: '',
  showLabels: true,
  showPercentage: true,
  showSliceValues: true,
  enableAnimation: true,
  innerRadius: 0.45,
  cornerRadius: 0,
  padAngle: 0,
  startAngle: 0,
  endAngle: 360,
  sortSlices: 'descending',
  sliceOpacity: 1,
  legendMaxItems: 10,
  strokeWidth: 2,
  strokeColor: '#ffffff',
  hoverScale: 1.05,
  enableHoverEffect: true,
  titleColor: '',
  labelColor: '',
  showTitle: true,
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

const defaultPieDonutFormatterConfig: Partial<PieDonutFormatterConfig> = {
  useValueFormatter: true,
  valueFormatterType: 'number',
  customValueFormatter: '',
};

// Default axis configs - updated to match new type
const defaultAxisConfigs: AxisConfig = {
  xAxisKey: undefined,
  xAxisLabel: '',
  yAxisLabel: '',
  xAxisStart: 'auto',
  yAxisStart: 'auto',
  xAxisRotation: 0,
  yAxisRotation: 0,
  showAxisLabels: true,
  showAxisTicks: true,
  seriesConfigs: [],
};

// Default config cho từng loại chart
export const defaultLineChartConfig: LineChartConfig = {
  config: defaultSubLineConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  chartType: 'line',
};

export const defaultAreaChartConfig: AreaChartConfig = {
  config: defaultSubAreaConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  chartType: 'area',
};

export const defaultBarChartConfig: BarChartConfig = {
  config: defaultSubBarConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  chartType: 'bar',
};

export const defaultScatterChartConfig: ScatterChartConfig = {
  config: defaultSubScatterConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  chartType: 'scatter',
};

export const defaultPieChartConfig: PieChartConfig = {
  config: defaultSubPieConfig,
  formatters: defaultPieDonutFormatterConfig,
  chartType: 'pie',
};

export const defaultDonutChartConfig: DonutChartConfig = {
  config: defaultSubDonutConfig,
  formatters: defaultPieDonutFormatterConfig,
  chartType: 'donut',
};

// Returns a consistent default StructuredChartConfig for given chart type and optional dataset name
export const getDefaultChartConfig = (chartType: ChartType): MainChartConfig => {
  const log = (cfg: MainChartConfig) => {
    // console.log('[getDefaultChartConfig] type ->', chartType);
    // console.log('[getDefaultChartConfig] result:', cfg);
    return cfg;
  };
  switch (chartType) {
    case ChartType.Line:
      return log(defaultLineChartConfig);
    case ChartType.Area:
      return log(defaultAreaChartConfig);
    case ChartType.Bar:
      return log(defaultBarChartConfig);
    case ChartType.Scatter:
      return log(defaultScatterChartConfig);
    case ChartType.Pie:
      return log(defaultPieChartConfig);
    case ChartType.Donut:
      return log(defaultDonutChartConfig);
  }
};
