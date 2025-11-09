import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChartType } from '@/features/charts/chartTypes';
import { curveOptions } from '@/types/chart';
import type {
  SubPieDonutChartConfig,
  PieDonutFormatterConfig,
  MainChartConfig,
} from '@/types/chart';
import { convertChartDataToArray } from '@/utils/dataConverter';
import D3LineChart from '@/components/charts/D3LineChart';
import D3BarChart from '@/components/charts/D3BarChart';
import D3AreaChart from '@/components/charts/D3AreaChart';
import D3ScatterChart from '@/components/charts/D3ScatterChart';
import D3CyclePlot from '@/components/charts/D3CyclePlot';
import D3PieChart from '@/components/charts/D3PieChart';
import { TrendingUp } from 'lucide-react';

interface ChartRendererProps {
  chartType: string;
  chartConfig: any;
  chartData: any;
  getHeaderName: (id: string) => string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartType,
  chartConfig,
  chartData,
  getHeaderName,
}) => {
  const { t } = useTranslation();

  // Tách logic Pie chart và các chart khác
  let formatters: any = undefined;
  let axisConfigs: any = undefined;
  let colors: any = {};
  let safeChartConfig: any = null;
  if (
    chartType !== ChartType.Pie &&
    chartType !== ChartType.Donut &&
    chartConfig &&
    'axisConfigs' in chartConfig
  ) {
    formatters = chartConfig.formatters || {
      useYFormatter: false,
      useXFormatter: false,
      yFormatterType: 'number' as const,
      xFormatterType: 'number' as const,
    };
    axisConfigs = chartConfig.axisConfigs || {};
    (axisConfigs.seriesConfigs || []).forEach((series: any) => {
      if (series.dataColumn && series.color) {
        const columnName = getHeaderName(series.dataColumn);
        colors[columnName] = {
          light: series.color,
          dark: series.color,
        };
      }
    });
    safeChartConfig = chartConfig.config || null;
  } else if ((chartType === ChartType.Pie || chartType === ChartType.Donut) && chartConfig) {
    // Pie chart chỉ lấy config và colors nếu có
    safeChartConfig = chartConfig.config || null;
    colors = {};
  }

  // Unified error panel for chart display
  const ErrorPanel: React.FC<{ title: string; subtitle?: string; bordered?: boolean }> = ({
    title,
    subtitle,
    bordered = false,
  }) => (
    <div
      className={`flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg ${
        bordered ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''
      }`}
    >
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">{title}</p>
        {subtitle && <p className="text-sm text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  if (!safeChartConfig || !chartData || chartData.length === 0) {
    return (
      <ErrorPanel
        title={t('chart_editor_no_data', 'No data available')}
        subtitle={t(
          'chart_editor_no_data_hint',
          'Please upload data or select a dataset to display the chart.'
        )}
      />
    );
  }
  // Check chart type and render appropriate component
  switch (chartType) {
    case ChartType.Line:
    case ChartType.Area:
    case ChartType.Bar:
    case ChartType.Scatter: {
      // Convert IDs to names for chart keys
      const xAxisKeyName = Array.isArray(axisConfigs.xAxisKey)
        ? getHeaderName(axisConfigs.xAxisKey[0] || '')
        : getHeaderName(axisConfigs.xAxisKey || '');

      // Validate xAxisKey first
      if (!xAxisKeyName || xAxisKeyName === '') {
        return (
          <ErrorPanel
            title={t('chart_editor_no_xaxis', 'No X-Axis column selected')}
            subtitle={t(
              'chart_editor_select_xaxis_hint',
              'Please select an X-Axis column in Axis Configuration'
            )}
            bordered
          />
        );
      }

      // Build yAxisKeys from axisConfigs (only visible series)
      const visibleSeries = (axisConfigs.seriesConfigs || []).filter(
        (series: any) => series.visible !== false
      );

      const yAxisKeysNames = visibleSeries.map((series: any) => {
        const columnName = getHeaderName(series.dataColumn);
        return columnName;
      });

      // Then check if no series are selected OR no visible series
      if (
        !axisConfigs ||
        !axisConfigs.seriesConfigs ||
        axisConfigs.seriesConfigs.length === 0 ||
        yAxisKeysNames.length === 0
      ) {
        return (
          <ErrorPanel
            title={t('chart_editor_no_series', 'No data series selected')}
            subtitle={
              yAxisKeysNames.length === 0 &&
              axisConfigs.seriesConfigs &&
              axisConfigs.seriesConfigs.length > 0
                ? t(
                    'chart_editor_no_visible_series',
                    'All series are hidden. Please make at least one series visible.'
                  )
                : t('chart_editor_add_series_hint', 'Add a data series to display the chart')
            }
            bordered
          />
        );
      }

      // Common props that are safe for all chart types
      const safeCommonProps = {
        data: chartData,
        arrayData:
          chartData.length > 0
            ? [
                [
                  // Use converted names instead of IDs
                  xAxisKeyName,
                  ...yAxisKeysNames,
                ],
                ...chartData.map((point: any) => {
                  return [
                    point[xAxisKeyName],
                    ...yAxisKeysNames.map((name: string) => point[name]),
                  ];
                }),
              ]
            : undefined,
        width: safeChartConfig.width,
        height: safeChartConfig.height,
        margin: safeChartConfig.margin,
        xAxisKey: xAxisKeyName,
        yAxisKeys: yAxisKeysNames as string[],
        colors: colors,
        seriesNames: Object.fromEntries(
          (axisConfigs.seriesConfigs || []).map((series: any) => [
            getHeaderName(series.dataColumn),
            series.name,
          ])
        ),
        title: safeChartConfig.title,
        xAxisLabel: axisConfigs.xAxisLabel,
        yAxisLabel: axisConfigs.yAxisLabel,
        showLegend: safeChartConfig.showLegend,
        showGrid: safeChartConfig.showGrid,
        animationDuration: safeChartConfig.animationDuration,
        yAxisFormatter: formatters.useYFormatter
          ? (value: number) => {
              switch (formatters.yFormatterType) {
                case 'currency':
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value);
                case 'percentage':
                  return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
                case 'number':
                  return new Intl.NumberFormat('en-US').format(value);
                case 'decimal':
                  return value.toFixed(2);
                case 'scientific':
                  return value.toExponential(2);
                case 'bytes':
                  return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'byte' }).format(
                    value
                  );
                case 'duration':
                  return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'second' }).format(
                    value
                  );
                case 'custom':
                  return (formatters as any).customYFormatter
                    ? (formatters as any).customYFormatter.replace('{value}', value.toString())
                    : value.toString();
                default:
                  return value.toString();
              }
            }
          : undefined,
        xAxisFormatter: formatters.useXFormatter
          ? (value: number) => {
              switch (formatters.xFormatterType) {
                case 'currency':
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value);
                case 'percentage':
                  return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
                case 'number':
                  return new Intl.NumberFormat('en-US').format(value);
                case 'decimal':
                  return value.toFixed(2);
                case 'scientific':
                  return value.toExponential(2);
                case 'bytes':
                  return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'byte' }).format(
                    value
                  );
                case 'duration':
                  return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'second' }).format(
                    value
                  );
                case 'custom':
                  return (formatters as any).customXFormatter
                    ? (formatters as any).customXFormatter.replace('{value}', value.toString())
                    : value.toString();
                default:
                  return value.toString();
              }
            }
          : undefined,
        fontSize: {
          axis: safeChartConfig.labelFontSize || 12,
          label: safeChartConfig.labelFontSize || 12,
          title: safeChartConfig.titleFontSize || 16,
        },
      };

      switch (chartType) {
        case 'line': {
          const lineConfig = safeChartConfig as any; // Using 'any' for SubLineChartConfig compatibility
          return (
            <D3LineChart
              {...safeCommonProps}
              disabledLines={lineConfig.disabledLines}
              showPoints={lineConfig.showPoints}
              showPointValues={lineConfig.showPointValues}
              curve={curveOptions[lineConfig.curve as keyof typeof curveOptions] ?? undefined}
              lineWidth={lineConfig.lineWidth}
              pointRadius={lineConfig.pointRadius}
              xAxisStart={axisConfigs.xAxisStart}
              yAxisStart={axisConfigs.yAxisStart}
              gridOpacity={lineConfig.gridOpacity}
              legendPosition={lineConfig.legendPosition}
              xAxisRotation={axisConfigs.xAxisRotation}
              yAxisRotation={axisConfigs.yAxisRotation}
              showAxisLabels={axisConfigs.showAxisLabels}
              showAxisTicks={axisConfigs.showAxisTicks}
              enableZoom={lineConfig.enableZoom}
              enablePan={lineConfig.enablePan}
              zoomExtent={lineConfig.zoomExtent}
              showTooltip={lineConfig.showTooltip}
              theme={lineConfig.theme}
              backgroundColor={lineConfig.backgroundColor}
              titleFontSize={lineConfig.titleFontSize}
              labelFontSize={lineConfig.labelFontSize}
              legendFontSize={lineConfig.legendFontSize}
              yFormatterType={
                formatters.useYFormatter ? (formatters.yFormatterType as any) : undefined
              }
              xFormatterType={
                formatters.useXFormatter ? (formatters.xFormatterType as any) : undefined
              }
            />
          );
        }

        case 'scatter': {
          const scatterConfig = safeChartConfig as any;

          // For scatter, use the first visible series as Y key
          const yKey = (yAxisKeysNames as string[])[0];

          // Convert chartData to array format with ALL columns (including potential colorKey/sizeKey)
          const arrayData = convertChartDataToArray(chartData);

          // Scatter-specific configuration
          const scatterProps = {
            arrayData,
            width: safeChartConfig.width,
            height: safeChartConfig.height,
            margin: safeChartConfig.margin,
            xAxisKey: xAxisKeyName,
            // Support multiple series: pass all visible series as yAxisKeys
            yAxisKey: yKey,
            yAxisKeys: yAxisKeysNames as string[],

            // Optional: colorKey for grouping by category
            colorKey: scatterConfig.colorKey, // Should be a column name from dataset

            // Optional: sizeKey for bubble chart effect
            sizeKey: scatterConfig.sizeKey, // Should be a column name from dataset

            // Colors
            colors: colors,
            // Explicit series colors mapping keyed by header/display name
            seriesColors: Object.fromEntries(
              (axisConfigs.seriesConfigs || []).map((series: any) => [
                getHeaderName(series.dataColumn),
                series.color || '#3b82f6',
              ])
            ),
            // Series display names mapping
            seriesNames: Object.fromEntries(
              (axisConfigs.seriesConfigs || []).map((series: any) => [
                getHeaderName(series.dataColumn),
                series.name,
              ])
            ),

            // Title and labels
            title: safeChartConfig.title,
            xAxisLabel: axisConfigs.xAxisLabel,
            yAxisLabel: axisConfigs.yAxisLabel,

            // Display options
            showGrid: safeChartConfig.showGrid,
            showLegend: safeChartConfig.showLegend,
            showTooltip: scatterConfig.showTooltip,
            showAxisLabels: axisConfigs.showAxisLabels,
            showAxisTicks: axisConfigs.showAxisTicks,

            // Styling
            pointRadius: scatterConfig.pointRadius || 5,
            minPointRadius: scatterConfig.minPointRadius || 3,
            maxPointRadius: scatterConfig.maxPointRadius || 15,
            pointOpacity: scatterConfig.pointOpacity || 0.7,

            // Grid and legend
            gridOpacity: scatterConfig.gridOpacity,
            legendFontSize: scatterConfig.legendFontSize,

            // Axis configuration
            xAxisStart: axisConfigs.xAxisStart,
            yAxisStart: axisConfigs.yAxisStart,
            xAxisRotation: axisConfigs.xAxisRotation,

            // Formatters
            yAxisFormatter: safeCommonProps.yAxisFormatter,
            xAxisFormatter: safeCommonProps.xAxisFormatter,

            // Font sizes
            fontSize: safeCommonProps.fontSize,
            titleFontSize: scatterConfig.titleFontSize,
            labelFontSize: scatterConfig.labelFontSize,

            // Theme
            theme: scatterConfig.theme,
            backgroundColor: safeChartConfig.backgroundColor,

            // Animation
            animationDuration: safeChartConfig.animationDuration,

            // Regression line
            showRegressionLine: scatterConfig.showRegressionLine,
            regressionLineColor: scatterConfig.regressionLineColor,
            regressionLineWidth: scatterConfig.regressionLineWidth,

            // Zoom and Pan
            enableZoom: scatterConfig.enableZoom,
            enablePan: scatterConfig.enablePan,
            zoomExtent: scatterConfig.zoomExtent,
          };

          return <D3ScatterChart {...scatterProps} />;
        }

        case 'bar': {
          const barConfig = safeChartConfig as any; // Using 'any' for SubBarChartConfig compatibility
          return (
            <D3BarChart
              {...safeCommonProps}
              yAxisKeys={yAxisKeysNames as string[]}
              disabledBars={barConfig.disabledBars || []}
              barType={barConfig.barType}
              barWidth={barConfig.barWidth}
              barSpacing={barConfig.barSpacing}
              showLegend={safeChartConfig.showLegend}
              showGrid={safeChartConfig.showGrid}
              gridOpacity={barConfig.gridOpacity}
              legendPosition={barConfig.legendPosition}
              xAxisRotation={axisConfigs.xAxisRotation}
              yAxisRotation={axisConfigs.yAxisRotation}
              showAxisLabels={axisConfigs.showAxisLabels}
              showAxisTicks={axisConfigs.showAxisTicks}
              yAxisStart={axisConfigs.yAxisStart}
              xAxisStart={axisConfigs.xAxisStart}
              theme={barConfig.theme}
              backgroundColor={barConfig.backgroundColor}
              showTooltip={barConfig.showTooltip}
              titleFontSize={barConfig.titleFontSize}
              labelFontSize={barConfig.labelFontSize}
              legendFontSize={barConfig.legendFontSize}
              enableZoom={barConfig.enableZoom}
              enablePan={barConfig.enablePan}
              zoomExtent={barConfig.zoomExtent}
              yFormatterType={
                formatters.useYFormatter ? (formatters.yFormatterType as any) : undefined
              }
              xFormatterType={
                formatters.useXFormatter ? (formatters.xFormatterType as any) : undefined
              }
            />
          );
        }

        case 'area': {
          const areaConfig = safeChartConfig as any; // Using 'any' for SubAreaChartConfig compatibility
          const areaProps = {
            data: chartData,
            width: safeChartConfig.width,
            height: safeChartConfig.height,
            margin: safeChartConfig.margin,
            xAxisKey: xAxisKeyName,
            yAxisKeys: yAxisKeysNames as string[],
            colors: colors,
            title: safeChartConfig.title,
            xAxisLabel: axisConfigs.xAxisLabel,
            yAxisLabel: axisConfigs.yAxisLabel,
            showLegend: safeChartConfig.showLegend,
            showGrid: safeChartConfig.showGrid,
            animationDuration: safeChartConfig.animationDuration,
            disabledLines: areaConfig.disabledLines,
            showPoints: areaConfig.showPoints,
            showStroke: areaConfig.showStroke,
            curve: curveOptions[areaConfig.curve as keyof typeof curveOptions],
            enableZoom: areaConfig.enableZoom,
            enablePan: areaConfig.enablePan,
            zoomExtent: areaConfig.zoomExtent,
            showTooltip: areaConfig.showTooltip,
            theme: areaConfig.theme,
            backgroundColor: areaConfig.backgroundColor,
            gridOpacity: areaConfig.gridOpacity,
            legendPosition: areaConfig.legendPosition,
            xAxisRotation: axisConfigs.xAxisRotation,
            yAxisRotation: axisConfigs.yAxisRotation,
            showAxisLabels: axisConfigs.showAxisLabels,
            showAxisTicks: axisConfigs.showAxisTicks,
            titleFontSize: areaConfig.titleFontSize,
            labelFontSize: areaConfig.labelFontSize,
            legendFontSize: areaConfig.legendFontSize,
          };
          return <D3AreaChart {...areaProps} />;
        }

        default:
          return null;
      }
    }
    case ChartType.CyclePlot: {
      const cyclePlotConfig = safeChartConfig as any;
      if (!axisConfigs.cycleKey || !axisConfigs.periodKey || !axisConfigs.valueKey) {
        return (
          <ErrorPanel
            title={t('chart_editor_no_cycle_keys', 'Missing required fields for Cycle Plot')}
            subtitle={t(
              'chart_editor_cycle_keys_hint',
              'Please select Cycle, Period, and Value columns for the cycle plot.'
            )}
            bordered
          />
        );
      }

      // Convert to array data format
      const arrayData = convertChartDataToArray(chartData);

      // Use cycleColors from axisConfigs if available, otherwise use default colors
      const cycleColors = axisConfigs.cycleColors || colors;

      console.log('✅ CyclePlot rendering with:', {
        cycleKey: getHeaderName(axisConfigs.cycleKey),
        periodKey: getHeaderName(axisConfigs.periodKey),
        valueKey: getHeaderName(axisConfigs.valueKey),
        arrayDataLength: arrayData?.length || 0,
        cycleColors,
      });

      // Get column names for axis labels (fallback to column name if no custom label)
      const periodColumnName = getHeaderName(axisConfigs.periodKey);
      const valueColumnName = getHeaderName(axisConfigs.valueKey);

      const cyclePlotProps = {
        width: cyclePlotConfig?.width,
        height: cyclePlotConfig?.height,
        margin: cyclePlotConfig?.margin,
        arrayData,
        cycleKey: getHeaderName(axisConfigs.cycleKey),
        periodKey: periodColumnName,
        valueKey: valueColumnName,

        // Styling
        colors: cycleColors,
        lineWidth: cyclePlotConfig?.lineWidth || 2,
        pointRadius: cyclePlotConfig?.pointRadius || 4,
        opacity: cyclePlotConfig?.opacity || 0.8,

        // Display options
        title: cyclePlotConfig?.title || '',
        xAxisLabel: axisConfigs.xAxisLabel || periodColumnName, // Use column name as default
        yAxisLabel: axisConfigs.yAxisLabel || valueColumnName, // Use column name as default
        showLegend: cyclePlotConfig?.showLegend !== false,
        showGrid: cyclePlotConfig?.showGrid !== false,
        showPoints: cyclePlotConfig?.showPoints !== false,
        showTooltip: cyclePlotConfig?.showTooltip !== false,

        // Grid
        gridOpacity: cyclePlotConfig?.gridOpacity || 0.3,

        // Legend
        legendFontSize: cyclePlotConfig?.legendFontSize || 12,
        legendPosition: cyclePlotConfig?.legendPosition || 'top',

        // Axis configuration
        yAxisStart: axisConfigs.yAxisStart,
        xAxisRotation: axisConfigs.xAxisRotation,
        showAxisLabels: axisConfigs.showAxisLabels,
        showAxisTicks: axisConfigs.showAxisTicks,

        // Cycle-specific UX options
        showAverageLine: axisConfigs.showAverageLine,
        emphasizeLatestCycle: axisConfigs.emphasizeLatestCycle,
        showRangeBand: axisConfigs.showRangeBand,
        periodOrdering: axisConfigs.periodOrdering || 'auto',
        showTooltipDelta: axisConfigs.showTooltipDelta,

        // Zoom and Pan
        enableZoom: cyclePlotConfig?.enableZoom,
        enablePan: cyclePlotConfig?.enablePan,
        zoomExtent: cyclePlotConfig?.zoomExtent,

        // Formatters
        yAxisFormatter: formatters?.useYFormatter
          ? (value: number) => {
              switch (formatters.yFormatterType) {
                case 'currency':
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value);
                case 'percentage':
                  return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
                case 'decimal':
                  return value.toFixed(2);
                case 'scientific':
                  return value.toExponential(2);
                default:
                  return value.toString();
              }
            }
          : undefined,
        xAxisFormatter: formatters?.useXFormatter
          ? (value: string | number) => {
              return String(value);
            }
          : undefined,

        // Font sizes
        fontSize: cyclePlotConfig?.fontSize || { axis: 12, label: 14, title: 16 },
        titleFontSize: cyclePlotConfig?.titleFontSize || 18,
        labelFontSize: cyclePlotConfig?.labelFontSize || 14,

        // Theme
        theme: cyclePlotConfig?.theme || 'auto',
        backgroundColor: cyclePlotConfig?.backgroundColor || 'transparent',

        // Animation
        animationDuration: cyclePlotConfig?.animationDuration || 1000,
        curveType: cyclePlotConfig?.curveType || 'monotone',
      };

      return <D3CyclePlot {...cyclePlotProps} />;
    }
    case ChartType.Pie:
    case ChartType.Donut: {
      if (!chartData || chartData.length === 0) {
        return (
          <ErrorPanel
            title={t('chart_editor_no_data', 'No data available')}
            subtitle={t(
              'chart_editor_no_data_hint',
              'Please upload data or select a dataset to display the chart.'
            )}
          />
        );
      }

      if (!safeChartConfig || !chartConfig) {
        return (
          <ErrorPanel
            title={t('chart_editor_invalid_config', 'Invalid chart configuration')}
            subtitle={t(
              'chart_editor_invalid_config_hint',
              'The chart configuration is invalid or missing.'
            )}
            bordered
          />
        );
      }

      const pieConfig = safeChartConfig as SubPieDonutChartConfig;

      // Kiểm tra xem đã chọn labelKey và valueKey chưa
      if (!pieConfig.labelKey || !pieConfig.valueKey) {
        return (
          <ErrorPanel
            title={t('chart_editor_no_pie_keys', 'Missing required fields')}
            subtitle={t(
              'chart_editor_pie_keys_hint',
              'Please select Label and Value columns for the pie chart.'
            )}
            bordered
          />
        );
      }

      // Map labelKey and valueKey (id) to header name for Pie Chart, like other chart types
      const labelKeyName = getHeaderName(pieConfig.labelKey);
      const valueKeyName = getHeaderName(pieConfig.valueKey);

      // Format values if needed
      const formatter = (chartConfig.formatters as Partial<PieDonutFormatterConfig>) || {};

      const pieProps = {
        // Data props
        data: chartData,
        width: pieConfig.width,
        height: pieConfig.height,
        margin: pieConfig.margin,
        labelKey: labelKeyName,
        valueKey: valueKeyName,

        // Display options
        title: pieConfig.title,
        showTitle: pieConfig.showTitle,
        showLegend: pieConfig.showLegend,
        showLabels: pieConfig.showLabels,
        showPercentage: pieConfig.showPercentage,
        showSliceValues: pieConfig.showSliceValues,
        showTooltip: pieConfig.showTooltip,

        // Pie-specific settings
        innerRadius: pieConfig.innerRadius,
        cornerRadius: pieConfig.cornerRadius,
        padAngle: pieConfig.padAngle,
        startAngle: pieConfig.startAngle,
        endAngle: pieConfig.endAngle,
        sortSlices: pieConfig.sortSlices,
        sliceOpacity: pieConfig.sliceOpacity,

        // Visual settings
        theme: pieConfig.theme,
        backgroundColor: pieConfig.backgroundColor,
        titleColor: pieConfig.titleColor,
        labelColor: pieConfig.labelColor,
        strokeWidth: pieConfig.strokeWidth,
        strokeColor: pieConfig.strokeColor,

        // Font sizes
        titleFontSize: pieConfig.titleFontSize,
        labelFontSize: pieConfig.labelFontSize,
        legendFontSize: pieConfig.legendFontSize,

        // Legend settings
        legendPosition: pieConfig.legendPosition,
        legendMaxItems: pieConfig.legendMaxItems,

        // Animation
        animationDuration: pieConfig.animationDuration,
        enableAnimation: pieConfig.enableAnimation,
        hoverScale: pieConfig.hoverScale,
        enableHoverEffect: pieConfig.enableHoverEffect,

        // Colors
        colors: colors,

        // Value formatter
        valueFormatter: formatter.useValueFormatter
          ? (value: number) => {
              switch (formatter.valueFormatterType) {
                case 'currency':
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value);
                case 'percentage':
                  return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
                case 'decimal':
                  return value.toFixed(2);
                case 'scientific':
                  return value.toExponential(2);
                case 'bytes':
                  return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'byte' }).format(
                    value
                  );
                case 'custom':
                  return formatter.customValueFormatter
                    ? formatter.customValueFormatter.replace('{value}', value.toString())
                    : value.toString();
                default:
                  return value.toString();
              }
            }
          : undefined,
      };

      return <D3PieChart {...pieProps} />;
    }
    default:
      return (
        <ErrorPanel
          title={t('chart_editor_invalid_type', 'Invalid chart type')}
          subtitle={t('chart_editor_select_type_hint', 'Please select a valid chart type.')}
          bordered
        />
      );
  }
};
export default React.memo(ChartRenderer);
