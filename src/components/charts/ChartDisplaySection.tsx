import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { useDataset } from '@/features/dataset/useDataset';
import D3LineChart from '@/components/charts/D3LineChart';
import D3BarChart from '@/components/charts/D3BarChart';
import D3AreaChart from '@/components/charts/D3AreaChart';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { curveOptions } from '@/types/chart';

const ChartDisplaySection: React.FC = () => {
  const { t } = useTranslation();
  const { chartData, chartConfig, currentChartType: chartType } = useChartEditor();
  const { currentDataset } = useDataset();

  // Extract formatters, seriesConfigs, and colors from chartConfig
  const formatters = chartConfig?.formatters || {
    useYFormatter: false,
    useXFormatter: false,
    yFormatterType: 'number' as const,
    xFormatterType: 'number' as const,
  };

  const seriesConfigs = chartConfig?.seriesConfigs || [];

  // Helper: Map DataHeader ID to name
  const dataHeaders = currentDataset?.headers || [];
  const getHeaderName = (id: string) => {
    const header = dataHeaders.find(h => h.id === id);
    return header ? header.name : id;
  };

  // Build colors from seriesConfigs (using names, not IDs)
  const colors: any = {};
  seriesConfigs.forEach((series: any) => {
    if (series.dataColumn && series.color) {
      const columnName = getHeaderName(series.dataColumn);
      colors[columnName] = {
        light: series.color,
        dark: series.color,
      };
    }
  });

  const safeChartConfig = chartConfig?.config || null;

  const renderChart = () => {
    if (!safeChartConfig || !chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('chart_editor_no_data', 'No data available. Please upload or enter data.')}
            </p>
          </div>
        </div>
      );
    }

    // Check if no series are selected
    if (!seriesConfigs || seriesConfigs.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {t('chart_editor_no_series', 'No data series selected')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('chart_editor_add_series_hint', 'Add a data series to display the chart')}
            </p>
          </div>
        </div>
      );
    }

    // Convert IDs to names for chart keys
    const xAxisKeyName = Array.isArray(safeChartConfig.xAxisKey)
      ? getHeaderName(safeChartConfig.xAxisKey[0] || '')
      : getHeaderName(safeChartConfig.xAxisKey || '');

    // Build yAxisKeys from seriesConfigs (only visible series)
    const yAxisKeysNames = seriesConfigs
      .filter((series: any) => series.visible !== false) // Only include visible series
      .map((series: any) => getHeaderName(series.dataColumn));

    console.log('═══════════════════════════════════════════════════');
    console.log('� CHART DATA DEBUG - X & Y AXIS VALUES');
    console.log('═══════════════════════════════════════════════════');

    console.log('\n�🗺️ ID to Name Mapping:');
    console.log('  - xAxisKey (ID):', safeChartConfig.xAxisKey);
    console.log('  - xAxisKey (Name):', xAxisKeyName);
    console.log('  - Available keys in chartData:', Object.keys(chartData[0] || {}));

    console.log('\n📈 Series Configuration:');
    seriesConfigs.forEach((series: any, index: number) => {
      console.log(`  Series ${index + 1}:`);
      console.log(`    - ID: ${series.id}`);
      console.log(`    - Name: ${series.name}`);
      console.log(`    - DataColumn (ID): ${series.dataColumn}`);
      console.log(`    - DataColumn (Name): ${getHeaderName(series.dataColumn)}`);
      console.log(`    - Color: ${series.color}`);
      console.log(`    - Visible: ${series.visible}`);
    });

    console.log('\n🎯 Final Y-Axis Keys (Names):', yAxisKeysNames);

    console.log('\n📋 Sample Data Values (First 3 Rows):');
    chartData.slice(0, 3).forEach((row: any, rowIndex: number) => {
      console.log(`  Row ${rowIndex + 1}:`);
      console.log(`    - X-Axis [${xAxisKeyName}]:`, row[xAxisKeyName]);
      yAxisKeysNames.forEach((yKey: string) => {
        console.log(`    - Y-Axis [${yKey}]:`, row[yKey]);
      });
    });

    console.log('\n🔍 Data Type Check:');
    if (chartData[0]) {
      console.log(`  - X value type: ${typeof chartData[0][xAxisKeyName]}`);
      yAxisKeysNames.forEach((yKey: string) => {
        console.log(`  - Y value [${yKey}] type: ${typeof chartData[0][yKey]}`);
      });
    }

    console.log('\n⚠️ Missing/Undefined Values Check:');
    let hasIssues = false;
    chartData.forEach((row: any, rowIndex: number) => {
      if (row[xAxisKeyName] === undefined || row[xAxisKeyName] === null) {
        console.warn(`  ⚠️ Row ${rowIndex + 1}: X-Axis [${xAxisKeyName}] is ${row[xAxisKeyName]}`);
        hasIssues = true;
      }
      yAxisKeysNames.forEach((yKey: string) => {
        if (row[yKey] === undefined || row[yKey] === null) {
          console.warn(`  ⚠️ Row ${rowIndex + 1}: Y-Axis [${yKey}] is ${row[yKey]}`);
          hasIssues = true;
        }
      });
    });
    if (!hasIssues) {
      console.log('  ✅ No missing/undefined values found!');
    }

    console.log('═══════════════════════════════════════════════════\n');

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
                return [point[xAxisKeyName], ...yAxisKeysNames.map((name: string) => point[name])];
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
        seriesConfigs.map((series: any) => [getHeaderName(series.dataColumn), series.name])
      ),
      title: safeChartConfig.title,
      xAxisLabel: safeChartConfig.xAxisLabel,
      yAxisLabel: safeChartConfig.yAxisLabel,
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
            curve={curveOptions[lineConfig.curve as keyof typeof curveOptions]}
            lineWidth={lineConfig.lineWidth}
            pointRadius={lineConfig.pointRadius}
            xAxisStart={lineConfig.xAxisStart}
            yAxisStart={lineConfig.yAxisStart}
            gridOpacity={lineConfig.gridOpacity}
            legendPosition={lineConfig.legendPosition}
            xAxisRotation={lineConfig.xAxisRotation}
            yAxisRotation={lineConfig.yAxisRotation}
            showAxisLabels={lineConfig.showAxisLabels}
            showAxisTicks={lineConfig.showAxisTicks}
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
            xAxisRotation={barConfig.xAxisRotation}
            yAxisRotation={barConfig.yAxisRotation}
            showAxisLabels={barConfig.showAxisLabels}
            showAxisTicks={barConfig.showAxisTicks}
            yAxisStart={barConfig.yAxisStart}
            xAxisStart={barConfig.xAxisStart}
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
          xAxisLabel: safeChartConfig.xAxisLabel,
          yAxisLabel: safeChartConfig.yAxisLabel,
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
          xAxisRotation: areaConfig.xAxisRotation,
          yAxisRotation: areaConfig.yAxisRotation,
          showAxisLabels: areaConfig.showAxisLabels,
          showAxisTicks: areaConfig.showAxisTicks,
          titleFontSize: areaConfig.titleFontSize,
          labelFontSize: areaConfig.labelFontSize,
          legendFontSize: areaConfig.legendFontSize,
        };
        return <D3AreaChart {...areaProps} />;
      }

      default:
        return null;
    }
  };

  return (
    <div className="lg:col-span-6 space-y-6">
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

export default ChartDisplaySection;
