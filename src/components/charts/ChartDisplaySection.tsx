import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { useChartEditorRead } from '@/features/chartEditor';
import { useAppSelector } from '@/store/hooks';
import D3LineChart from '@/components/charts/D3LineChart';
import D3BarChart from '@/components/charts/D3BarChart';
import D3AreaChart from '@/components/charts/D3AreaChart';
import D3ScatterChart from '@/components/charts/D3ScatterChart';
import D3CyclePlot from '@/components/charts/D3CyclePlot';
import D3HeatmapChart from '@/components/charts/D3HeatmapChart';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { curveOptions } from '@/types/chart';
import type { SubPieDonutChartConfig, PieDonutFormatterConfig } from '@/types/chart';
import { convertChartDataToArray } from '@/utils/dataConverter';
import { ChartType } from '@/features/charts/chartTypes';
import D3PieChart from './D3PieChart';
import { useFormatter } from '@/hooks/useFormatter';
import type { DataHeader } from '@/utils/dataProcessors';

interface ChartDisplaySectionProps {
  processedHeaders?: DataHeader[];
}

const ChartDisplaySection: React.FC<ChartDisplaySectionProps> = ({ processedHeaders }) => {
  const { t } = useTranslation();
  const { chartData, chartConfig, currentChartType: chartType } = useChartEditorRead();
  // Only subscribe to currentDataset to avoid re-renders when datasets list is refreshed
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);

  const hasDatasetSelected = Boolean(currentDataset);

  // Helper: Map DataHeader ID to name
  // Use processed headers (aggregated) if provided, otherwise use original dataset headers
  const dataHeaders = (processedHeaders as any[]) || currentDataset?.headers || [];
  const getHeaderName = (id: string) => {
    const header = dataHeaders.find(h => (h as any).id === id || (h as any).headerId === id);
    return header ? header.name : id;
  };

  // Helper: Get the actual key used in chartData (could be ID or name)
  const getChartDataKey = useCallback(
    (id: string) => {
      if (!chartData || chartData.length === 0) return getHeaderName(id);

      const name = getHeaderName(id);
      const firstDataPoint = chartData[0];

      // Check if name exists in chartData
      if (name in firstDataPoint) {
        return name;
      }

      // Fallback to ID if name not found
      if (id in firstDataPoint) {
        return id;
      }

      // Last resort: return name
      return name;
    },
    [chartData, getHeaderName]
  );

  // Memoize computed values to prevent recalculation on every render
  const { formatters, axisConfigs, colors, safeChartConfig } = useMemo(() => {
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
          const header = dataHeaders.find(h => h.id === series.dataColumn);
          const columnName = header ? header.name : series.dataColumn;
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

    return { formatters, axisConfigs, colors, safeChartConfig };
  }, [chartType, chartConfig, dataHeaders]);

  // Get formatter functions from config - MUST be called at top level, not inside renderChart
  const { yAxisFormatter: yAxisFormatterFn, xAxisFormatter: xAxisFormatterFn } =
    useFormatter(formatters);

  // Unified error panel for chart display - memoized to prevent recreation
  const ErrorPanel = useMemo(
    () =>
      ({
        title,
        subtitle,
        bordered = false,
      }: {
        title: string;
        subtitle?: string;
        bordered?: boolean;
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
      ),
    []
  );

  // Memoize renderChart to prevent recreation on every render
  const renderChart = useCallback(() => {
    if (!hasDatasetSelected) {
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

    if (!safeChartConfig) {
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

    // Check chart type and render appropriate component
    switch (chartType) {
      case ChartType.Line:
      case ChartType.Area:
      case ChartType.Bar:
      case ChartType.Scatter: {
        // Get X-axis key ID and convert to actual key used in chartData
        const xAxisKeyId = Array.isArray(axisConfigs.xAxisKey)
          ? axisConfigs.xAxisKey[0] || ''
          : axisConfigs.xAxisKey || '';

        // Get display name for labels
        const xAxisKeyName = getHeaderName(xAxisKeyId);

        // Get actual key used in chartData (might be name or ID)
        const xAxisDataKey = getChartDataKey(xAxisKeyId);

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

        // Get display names for labels
        const yAxisKeysNames = visibleSeries.map((series: any) => {
          const columnName = getHeaderName(series.dataColumn);
          return columnName;
        });

        // Get actual data keys used in chartData
        const yAxisDataKeys = visibleSeries.map((series: any) => {
          return getChartDataKey(series.dataColumn);
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

        if (!chartData || chartData.length === 0) {
          return <div className="h-96" />;
        }

        // Common props that are safe for all chart types
        const safeCommonProps = {
          data: chartData,
          arrayData:
            chartData.length > 0
              ? [
                  [
                    // Use display names for headers
                    xAxisKeyName,
                    ...yAxisKeysNames,
                  ],
                  ...chartData.map((point: any) => {
                    return [
                      // Use actual data keys to access values
                      point[xAxisDataKey],
                      ...yAxisDataKeys.map((dataKey: string) => point[dataKey]),
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
          xAxisLabel: axisConfigs.xAxisLabel || xAxisKeyName, // Use column name as default
          yAxisLabel:
            axisConfigs.yAxisLabel || (yAxisKeysNames.length === 1 ? yAxisKeysNames[0] : 'Value'), // Use column name for single series, or 'Value' for multiple
          showLegend: safeChartConfig.showLegend,
          showGrid: safeChartConfig.showGrid,
          animationDuration: safeChartConfig.animationDuration,
          fontSize: {
            axis: safeChartConfig.labelFontSize || 12,
            label: safeChartConfig.labelFontSize || 12,
            title: safeChartConfig.titleFontSize || 16,
          },
        };

        // Use formatter functions from top-level hook call
        // (already called at component top level to avoid Rules of Hooks violation)

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
                yAxisFormatter={formatters.useYFormatter ? yAxisFormatterFn : undefined}
                xAxisFormatter={formatters.useXFormatter ? xAxisFormatterFn : undefined}
                showAxisTicks={axisConfigs.showAxisTicks}
                showAllXAxisTicks={axisConfigs.showAllXAxisTicks}
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
              yAxisKeys: yAxisKeysNames as string[], // Pass all series for multi-series scatter

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
              xAxisLabel: axisConfigs.xAxisLabel || xAxisKeyName, // Use column name as default
              yAxisLabel:
                axisConfigs.yAxisLabel ||
                (yAxisKeysNames.length === 1 ? yAxisKeysNames[0] : 'Value'), // Use column name for single series, or 'Value' for multiple

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
              yAxisFormatter: formatters.useYFormatter ? yAxisFormatterFn : undefined,
              xAxisFormatter: formatters.useXFormatter ? xAxisFormatterFn : undefined,

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
                showAllXAxisTicks={axisConfigs.showAllXAxisTicks}
                yAxisFormatter={formatters.useYFormatter ? yAxisFormatterFn : undefined}
                xAxisFormatter={formatters.useXFormatter ? xAxisFormatterFn : undefined}
                yAxisStart={axisConfigs.yAxisStart}
                xAxisStart={axisConfigs.xAxisStart}
                theme={barConfig.theme}
                backgroundColor={barConfig.backgroundColor}
                showTooltip={barConfig.showTooltip}
                showPointValues={barConfig.showPointValues}
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
              xAxisLabel: axisConfigs.xAxisLabel || xAxisKeyName, // Use column name as default
              yAxisLabel:
                axisConfigs.yAxisLabel ||
                (yAxisKeysNames.length === 1 ? yAxisKeysNames[0] : 'Value'), // Use column name for single series, or 'Value' for multiple
              showLegend: safeChartConfig.showLegend,
              showGrid: safeChartConfig.showGrid,
              animationDuration: safeChartConfig.animationDuration,
              disabledLines: areaConfig.disabledLines,
              showPoints: areaConfig.showPoints,
              showPointValues: areaConfig.showPointValues,
              showStroke: areaConfig.showStroke,
              curve: curveOptions[areaConfig.curve as keyof typeof curveOptions],
              opacity: areaConfig.opacity, // Area transparency setting
              stackedMode: areaConfig.stackedMode, // Stacked vs overlapping mode
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
              yAxisFormatter: formatters.useYFormatter ? yAxisFormatterFn : undefined,
              xAxisFormatter: formatters.useXFormatter ? xAxisFormatterFn : undefined,
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

        if (!chartData || chartData.length === 0) {
          return <div className="h-96" />;
        }

        // Convert to array data format
        const arrayData = convertChartDataToArray(chartData);

        // Use cycleColors from axisConfigs if available, otherwise use default colors
        const cycleColors = axisConfigs.cycleColors || colors;

        // Use formatter functions from top-level hook call (already defined above)
        // No need to call useFormatter again here

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
          yAxisFormatter: formatters.useYFormatter ? yAxisFormatterFn : undefined,
          xAxisFormatter: formatters.useXFormatter ? xAxisFormatterFn : undefined,

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

        if (!chartData || chartData.length === 0) {
          return <div className="h-96" />;
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
      case ChartType.Heatmap: {
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

        // Check if required keys are selected
        if (!axisConfigs?.xAxisKey || !axisConfigs?.yAxisKey || !axisConfigs?.valueKey) {
          return (
            <ErrorPanel
              title={t('chart_editor_no_heatmap_keys', 'Missing required fields')}
              subtitle={t(
                'chart_editor_heatmap_keys_hint',
                'Please select X-Axis, Y-Axis, and Value columns for the heatmap.'
              )}
              bordered
            />
          );
        }

        if (!chartData || chartData.length === 0) {
          return <div className="h-96" />;
        }

        // Map keys to header names
        const xAxisKeyName = getHeaderName(axisConfigs.xAxisKey);
        const yAxisKeyName = getHeaderName(axisConfigs.yAxisKey);
        const valueKeyName = getHeaderName(axisConfigs.valueKey);

        const arrayData = convertChartDataToArray(chartData, [
          xAxisKeyName,
          yAxisKeyName,
          valueKeyName,
        ]);

        const heatmapProps = {
          arrayData,
          width: safeChartConfig.width || 800,
          height: safeChartConfig.height || 600,
          margin: safeChartConfig.margin || { top: 80, right: 150, bottom: 100, left: 100 },
          xAxisKey: xAxisKeyName,
          yAxisKey: yAxisKeyName,
          valueKey: valueKeyName,
          colorScheme: safeChartConfig.colorScheme || 'viridis',
          title: safeChartConfig.title || '',
          xAxisLabel: axisConfigs.xAxisLabel || '',
          yAxisLabel: axisConfigs.yAxisLabel || '',
          showLegend: safeChartConfig.showLegend ?? true,
          showValues: safeChartConfig.showValues ?? false,
          cellBorderWidth: safeChartConfig.cellBorderWidth ?? 1,
          cellBorderColor: safeChartConfig.cellBorderColor || '#ffffff',
          valuePosition: safeChartConfig.valuePosition || 'center',
          minValue: safeChartConfig.minValue ?? 'auto',
          maxValue: safeChartConfig.maxValue ?? 'auto',
          nullColor: safeChartConfig.nullColor || '#cccccc',
          legendSteps: safeChartConfig.legendSteps ?? 5,
          xAxisRotation: axisConfigs.xAxisRotation ?? -45,
          yAxisRotation: axisConfigs.yAxisRotation ?? 0,
          showAxisLabels: axisConfigs.showAxisLabels ?? true,
          theme: safeChartConfig.theme || 'auto',
          titleFontSize: safeChartConfig.titleFontSize || 20,
          labelFontSize: safeChartConfig.labelFontSize || 12,
          legendFontSize: safeChartConfig.legendFontSize || 11,
          animationDuration: safeChartConfig.animationDuration || 750,
          showTooltip: safeChartConfig.showTooltip ?? true,
          valueFormatter: yAxisFormatterFn,
        };

        return <D3HeatmapChart {...heatmapProps} />;
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
  }, [
    safeChartConfig,
    chartData,
    chartType,
    axisConfigs,
    colors,
    formatters,
    yAxisFormatterFn,
    xAxisFormatterFn,
    getHeaderName,
    getChartDataKey,
    ErrorPanel,
    t,
    hasDatasetSelected,
  ]);

  return (
    <div className="h-full space-y-6">
      {/* Chart Display Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="sticky top-4 z-10"
      >
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              {renderChart()}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default React.memo(ChartDisplaySection);
