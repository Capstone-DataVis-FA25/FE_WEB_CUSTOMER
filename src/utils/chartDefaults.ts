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
  CyclePlotConfig,
  SubCyclePlotChartConfig,
  CyclePlotAxisConfig,
  HeatmapChartConfig,
  SubHeatmapChartConfig,
  HeatmapAxisConfig,
  HistogramChartConfig,
  SubHistogramChartConfig,
} from '@/types/chart';

// Default Sub configs
export const defaultSubHistogramConfig: SubHistogramChartConfig = {
  width: 1000,
  height: 700,
  margin: { top: 40, right: 40, bottom: 60, left: 80 },
  title: '',
  showGrid: true,
  gridOpacity: 0.5,
  animationDuration: 1000,
  theme: 'auto',
  backgroundColor: 'transparent',
  titleFontSize: 20,
  labelFontSize: 14,
  legendFontSize: 12,
  legendPosition: 'bottom',
  binCount: 10,
  binMethod: 'sturges',
  showDensity: false,
  showCumulativeFrequency: false,
  showMean: false,
  showMedian: false,
  showPointValues: false,
  normalize: false,
  barColor: '#3b82f6',
  showTooltip: true,
};
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
  yFormatterType: 'none',
  xFormatterType: 'none',
  customYFormatter: '{value}',
  customXFormatter: '{value}',
  yCurrencySymbol: '$',
  xCurrencySymbol: '$',
  yDecimalPlaces: 2,
  xDecimalPlaces: 2,
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
  datasetConfig: {},
  chartType: 'line',
};

export const defaultAreaChartConfig: AreaChartConfig = {
  config: defaultSubAreaConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  datasetConfig: {},
  chartType: 'area',
};

export const defaultBarChartConfig: BarChartConfig = {
  config: defaultSubBarConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  datasetConfig: {},
  chartType: 'bar',
};

export const defaultScatterChartConfig: ScatterChartConfig = {
  config: defaultSubScatterConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  datasetConfig: {},
  chartType: 'scatter',
};

export const defaultPieChartConfig: PieChartConfig = {
  config: defaultSubPieConfig,
  formatters: defaultPieDonutFormatterConfig,
  datasetConfig: {},
  chartType: 'pie',
};

export const defaultDonutChartConfig: DonutChartConfig = {
  config: defaultSubDonutConfig,
  formatters: defaultPieDonutFormatterConfig,
  datasetConfig: {},
  chartType: 'donut',
};

// Tạo config default cho cycle plot
const defaultSubCyclePlotConfig: SubCyclePlotChartConfig = {
  ...defaultBaseChartConfig,
  showPoints: true,
  curve: 'curveMonotoneX',
  lineWidth: 2,
  pointRadius: 4,
};

// Default axis configs for cycle plot
const defaultCyclePlotAxisConfigs: CyclePlotAxisConfig = {
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
  cycleKey: undefined,
  periodKey: undefined,
  valueKey: undefined,
  cycleColors: {},
  showAverageLine: false,
  emphasizeLatestCycle: false,
  showRangeBand: false,
  periodOrdering: 'auto',
  showTooltipDelta: false,
};

export const defaultCyclePlotConfig: CyclePlotConfig = {
  config: defaultSubCyclePlotConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultCyclePlotAxisConfigs,
  chartType: 'cycleplot',
};

// Default Heatmap Config
const defaultSubHeatmapConfig: SubHeatmapChartConfig = {
  ...defaultBaseChartConfig,
  width: 1024,
  height: 768,
  margin: { top: 80, right: 150, bottom: 100, left: 100 },
  colorScheme: 'viridis',
  showValues: false,
  cellBorderWidth: 1,
  cellBorderColor: '#ffffff',
  valuePosition: 'center',
  minValue: 'auto',
  maxValue: 'auto',
  nullColor: '#cccccc',
  legendSteps: 5,
};

const defaultHeatmapAxisConfigs: HeatmapAxisConfig = {
  xAxisKey: undefined,
  yAxisKey: undefined,
  valueKey: undefined,
  xAxisLabel: '',
  yAxisLabel: '',
  xAxisRotation: -45,
  yAxisRotation: 0,
  showAxisLabels: true,
};

export const defaultHeatmapConfig: HeatmapChartConfig = {
  config: defaultSubHeatmapConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultHeatmapAxisConfigs,
  chartType: 'heatmap',
};

export const defaultHistogramConfig: HistogramChartConfig = {
  config: defaultSubHistogramConfig,
  formatters: defaultFormatterConfig,
  axisConfigs: defaultAxisConfigs,
  chartType: 'histogram',
};

// Returns a consistent default StructuredChartConfig for given chart type and optional dataset name
export const getDefaultChartConfig = (chartType: ChartType): MainChartConfig => {
  const log = (cfg: MainChartConfig) => {
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
    case ChartType.CyclePlot:
      return log(defaultCyclePlotConfig);
    case ChartType.Heatmap:
      return log(defaultHeatmapConfig);
    case ChartType.Histogram:
      return log(defaultHistogramConfig);
  }
};
