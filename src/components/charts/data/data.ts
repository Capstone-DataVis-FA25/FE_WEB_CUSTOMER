import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { ScatterPlotDataPoint } from '@/components/charts/page.example/home_chart_sample/D3ScatterPlot';
import type { AreaChartDataPoint } from '@/components/charts/page.example/home_chart_sample/D3AreaChart';
import type { TrendChartDataPoint } from '@/components/charts/page.example/home_chart_sample/D3TrendChart';
import type { MapDataPoint } from '@/components/charts/page.example/home_chart_sample/D3MapChart';
import type { TableDataPoint } from '@/components/charts/page.example/home_chart_sample/D3TableChart';
import { convertArrayToChartData } from '@/utils/dataConverter';

// Sales data
export const salesData: (string | number)[][] = [
  ['Month', 'Ecommerce', 'Retail', 'Wholesale'], // header
  [1, 125, 980, 750],
  [2, 135, 1020, 780],
  [3, 148, 1150, 820],
  [4, 162, 1080, 860],
  [5, 175, 1200, 900],
  [6, 189, 1350, 950],
  [7, 210, 1450, 1000],
  [8, 225, 1520, 1080],
  [9, 215, 1480, 1050],
  [10, 238, 1650, 1120],
  [11, 265, 1850, 1200],
  [12, 295, 2100, 1350],
];

export const exampleData = [
  ['city', 'month', 'sale'],
  ['New York', 1, 500],
  ['Los Angeles', 1, 600],
  ['Chicago', 1, 700],
  ['Houston', 1, 800],
  ['Phoenix', 1, 900],
];

// Revenue by quarter data
export const quarterlyRevenueArrayData: (string | number)[][] = [
  ['Quarter', 'Technology', 'Healthcare', 'Finance', 'Education'], // header
  ['Q1 2023', 2450, 1800, 3200, 950],
  ['Q2 2023', 2680, 2100, 3450, 1120],
  ['Q3 2023', 2890, 2350, 3680, 1250],
  ['Q4 2023', 3150, 2600, 3950, 1380],
  ['Q1 2024', 3420, 2850, 4200, 1520],
  ['Q2 2024', 3680, 3100, 4500, 1680],
];

export const quarterlyRevenueData: ChartDataPoint[] =
  convertArrayToChartData(quarterlyRevenueArrayData);

// Product performance data
export const productPerformanceArrayData: (string | number)[][] = [
  ['Product', 'Sales', 'Profit', 'Customers'], // header
  ['Product A', 850, 340, 120],
  ['Product B', 920, 380, 145],
  ['Product C', 750, 280, 98],
  ['Product D', 1100, 480, 165],
  ['Product E', 680, 220, 78],
  ['Product F', 950, 420, 135],
  ['Product G', 1200, 550, 180],
  ['Product H', 820, 310, 115],
];

export const productPerformanceData: ChartDataPoint[] = convertArrayToChartData(
  productPerformanceArrayData
);

// Pie chart data
export const categoryArrayData: (string | number)[][] = [
  ['Category', 'Value', 'Color'], // header
  ['Technology', 35, '#3b82f6'],
  ['Healthcare', 28, '#ef4444'],
  ['Finance', 22, '#10b981'],
  ['Education', 15, '#f59e0b'],
];

export const categoryData = convertArrayToChartData(categoryArrayData);

// Scatter plot data
export const scatterArrayData: (string | number)[][] = [
  ['Spending', 'Satisfaction', 'Size', 'Region'], // header
  [1000, 7.2, 150, 'North'],
  [1500, 8.1, 200, 'South'],
  [800, 6.5, 120, 'East'],
  [2000, 8.9, 300, 'West'],
  [1200, 7.8, 180, 'North'],
  [1800, 8.5, 250, 'South'],
  [900, 6.9, 140, 'East'],
  [2200, 9.1, 320, 'West'],
  [1100, 7.5, 160, 'North'],
  [1600, 8.3, 220, 'South'],
];

export const scatterData: ScatterPlotDataPoint[] = convertArrayToChartData(
  scatterArrayData
) as ScatterPlotDataPoint[];

// Area chart data
export const areaArrayData: (string | number)[][] = [
  ['Month', 'Mobile', 'Desktop', 'Tablet'], // header
  [1, 45, 78, 23],
  [2, 52, 82, 28],
  [3, 58, 85, 32],
  [4, 65, 88, 35],
  [5, 72, 92, 38],
  [6, 78, 95, 42],
  [7, 85, 98, 45],
  [8, 92, 102, 48],
  [9, 88, 99, 46],
  [10, 95, 105, 52],
  [11, 102, 108, 55],
  [12, 108, 112, 58],
];

export const areaData: AreaChartDataPoint[] = convertArrayToChartData(
  areaArrayData
) as AreaChartDataPoint[];

// Trend chart data
export const trendArrayData: (string | number)[][] = [
  ['Year', 'Revenue'], // header
  [2019, 120],
  [2020, 145],
  [2021, 165],
  [2022, 198],
  [2023, 225],
  [2024, 258],
];

export const trendData: TrendChartDataPoint[] = convertArrayToChartData(
  trendArrayData
) as TrendChartDataPoint[];

// Map data
export const mapArrayData: (string | number)[][] = [
  ['Region', 'Value'], // header
  ['North America', 4500],
  ['South America', 2800],
  ['Europe', 6200],
  ['Africa', 1900],
  ['Asia', 8500],
  ['Oceania', 1200],
];

export const mapData: MapDataPoint[] = convertArrayToChartData(mapArrayData) as MapDataPoint[];

// Table data
export const tableArrayData: (string | number | boolean)[][] = [
  ['ID', 'Name', 'Age', 'Department', 'Salary', 'Active'], // header
  [1, 'John Doe', 28, 'Engineering', 85000, true],
  [2, 'Jane Smith', 32, 'Marketing', 72000, true],
  [3, 'Mike Johnson', 29, 'Sales', 68000, false],
  [4, 'Sarah Wilson', 35, 'Engineering', 95000, true],
  [5, 'David Brown', 31, 'HR', 65000, true],
  [6, 'Emily Davis', 27, 'Marketing', 70000, true],
  [7, 'Chris Miller', 33, 'Sales', 75000, false],
  [8, 'Lisa Garcia', 30, 'Engineering', 88000, true],
  [9, 'Tom Anderson', 36, 'Finance', 82000, true],
  [10, 'Amy White', 26, 'Marketing', 69000, true],
];

export const tableData: TableDataPoint[] = convertArrayToChartData(
  tableArrayData as (string | number)[][]
) as TableDataPoint[];

// Datasets configuration
export const datasets = {
  sales: {
    name: 'Monthly Sales Data',
    description: 'Doanh số bán hàng theo tháng qua các kênh',
    arrayData: salesData,
    data: convertArrayToChartData(salesData),
    xKey: 'month',
    yKeys: ['ecommerce', 'retail', 'wholesale'],
    xLabel: 'Tháng',
    yLabel: 'Doanh số (triệu VND)',
    colors: {
      ecommerce: { light: '#16a34a', dark: '#22c55e' },
      retail: { light: '#9333ea', dark: '#a855f7' },
      wholesale: { light: '#c2410c', dark: '#ea580c' },
    },
  },
  quarterly: {
    name: 'Quarterly Revenue by Industry',
    description: 'Doanh thu theo quý phân chia theo ngành',
    arrayData: quarterlyRevenueArrayData,
    data: quarterlyRevenueData,
    xKey: 'quarter',
    yKeys: ['technology', 'healthcare', 'finance', 'education'],
    xLabel: 'Quý',
    yLabel: 'Doanh thu (tỷ VND)',
    colors: {
      technology: { light: '#3b82f6', dark: '#60a5fa' },
      healthcare: { light: '#ef4444', dark: '#f87171' },
      finance: { light: '#f59e0b', dark: '#fbbf24' },
      education: { light: '#8b5cf6', dark: '#a78bfa' },
    },
  },
  products: {
    name: 'Product Performance Metrics',
    description: 'Hiệu suất sản phẩm theo doanh số, lợi nhuận và khách hàng',
    arrayData: productPerformanceArrayData,
    data: productPerformanceData,
    xKey: 'product',
    yKeys: ['sales', 'profit', 'customers'],
    xLabel: 'Sản phẩm',
    yLabel: 'Giá trị',
    colors: {
      sales: { light: '#10b981', dark: '#34d399' },
      profit: { light: '#f97316', dark: '#fb923c' },
      customers: { light: '#6366f1', dark: '#818cf8' },
    },
  },
  pie: {
    name: 'Category Distribution',
    description: 'Phân phối theo danh mục',
    arrayData: categoryArrayData,
    data: categoryData,
    valueKey: 'value',
    categoryKey: 'category',
    title: 'Market Share by Category',
  },
  scatter: {
    name: 'Customer Analysis',
    description: 'Phân tích mối quan hệ giữa chi tiêu và sự hài lòng',
    arrayData: scatterArrayData,
    data: scatterData,
    xKey: 'spending',
    yKey: 'satisfaction',
    sizeKey: 'size',
    colorKey: 'region',
    xLabel: 'Customer Spending ($)',
    yLabel: 'Satisfaction Score',
    title: 'Customer Spending vs Satisfaction',
  },
  area: {
    name: 'Device Usage Over Time',
    description: 'Sử dụng thiết bị theo thời gian',
    arrayData: areaArrayData,
    data: areaData,
    xKey: 'month',
    yKey: 'mobile',
    groupKey: 'device',
    xLabel: 'Month',
    yLabel: 'Usage (%)',
    title: 'Device Usage Trends',
  },
  trend: {
    name: 'Revenue Trend Analysis',
    description: 'Phân tích xu hướng doanh thu',
    arrayData: trendArrayData,
    data: trendData,
    xKey: 'year',
    yKey: 'revenue',
    xLabel: 'Year',
    yLabel: 'Revenue (Million $)',
    title: 'Annual Revenue Trend',
  },
  map: {
    name: 'Global Sales Distribution',
    description: 'Phân phối doanh số toàn cầu',
    arrayData: mapArrayData,
    data: mapData,
    title: 'Sales by Region',
  },
  table: {
    name: 'Employee Data',
    description: 'Dữ liệu nhân viên',
    arrayData: tableArrayData,
    data: tableData,
    title: 'Employee Information',
  },
};

// Sample data for area chart
export const sampleData = [
  { month: 1, revenue: 120, expenses: 80, profit: 40 },
  { month: 2, revenue: 150, expenses: 95, profit: 55 },
  { month: 3, revenue: 180, expenses: 110, profit: 70 },
  { month: 4, revenue: 200, expenses: 125, profit: 75 },
  { month: 5, revenue: 165, expenses: 100, profit: 65 },
  { month: 6, revenue: 220, expenses: 140, profit: 80 },
  { month: 7, revenue: 250, expenses: 160, profit: 90 },
  { month: 8, revenue: 280, expenses: 180, profit: 100 },
  { month: 9, revenue: 310, expenses: 200, profit: 110 },
  { month: 10, revenue: 290, expenses: 185, profit: 105 },
  { month: 11, revenue: 320, expenses: 210, profit: 110 },
  { month: 12, revenue: 350, expenses: 230, profit: 120 },
];
