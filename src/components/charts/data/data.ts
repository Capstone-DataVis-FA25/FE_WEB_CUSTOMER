import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { ScatterPlotDataPoint } from '@/components/charts/page.example/home_chart_sample/D3ScatterPlot';
import type { AreaChartDataPoint } from '@/components/charts/page.example/home_chart_sample/D3AreaChart';
import type { TrendChartDataPoint } from '@/components/charts/page.example/home_chart_sample/D3TrendChart';
import type { MapDataPoint } from '@/components/charts/page.example/home_chart_sample/D3MapChart';
import type { TableDataPoint } from '@/components/charts/page.example/home_chart_sample/D3TableChart';

// Sales data
export const salesData: (string | number)[][] = [
  ["Month", "Ecommerce", "Retail", "Wholesale"], // header
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
export const quarterlyRevenueData: ChartDataPoint[] = [
  { quarter: 'Q1 2023', technology: 2450, healthcare: 1800, finance: 3200, education: 950 },
  { quarter: 'Q2 2023', technology: 2680, healthcare: 2100, finance: 3450, education: 1120 },
  { quarter: 'Q3 2023', technology: 2890, healthcare: 2350, finance: 3680, education: 1250 },
  { quarter: 'Q4 2023', technology: 3150, healthcare: 2600, finance: 3950, education: 1380 },
  { quarter: 'Q1 2024', technology: 3420, healthcare: 2850, finance: 4200, education: 1520 },
  { quarter: 'Q2 2024', technology: 3680, healthcare: 3100, finance: 4500, education: 1680 },
];

// Product performance data
export const productPerformanceData: ChartDataPoint[] = [
  { product: 'Product A', sales: 850, profit: 340, customers: 120 },
  { product: 'Product B', sales: 920, profit: 380, customers: 145 },
  { product: 'Product C', sales: 750, profit: 280, customers: 98 },
  { product: 'Product D', sales: 1100, profit: 480, customers: 165 },
  { product: 'Product E', sales: 680, profit: 220, customers: 78 },
  { product: 'Product F', sales: 950, profit: 420, customers: 135 },
  { product: 'Product G', sales: 1200, profit: 550, customers: 180 },
  { product: 'Product H', sales: 820, profit: 310, customers: 115 },
];

// Pie chart data
export const categoryData = [
  { category: 'Technology', value: 35, color: '#3b82f6' },
  { category: 'Healthcare', value: 28, color: '#ef4444' },
  { category: 'Finance', value: 22, color: '#10b981' },
  { category: 'Education', value: 15, color: '#f59e0b' },
];

// Scatter plot data
export const scatterData: ScatterPlotDataPoint[] = [
  { spending: 1000, satisfaction: 7.2, size: 150, region: 'North' },
  { spending: 1500, satisfaction: 8.1, size: 200, region: 'South' },
  { spending: 800, satisfaction: 6.5, size: 120, region: 'East' },
  { spending: 2000, satisfaction: 8.9, size: 300, region: 'West' },
  { spending: 1200, satisfaction: 7.8, size: 180, region: 'North' },
  { spending: 1800, satisfaction: 8.5, size: 250, region: 'South' },
  { spending: 900, satisfaction: 6.9, size: 140, region: 'East' },
  { spending: 2200, satisfaction: 9.1, size: 320, region: 'West' },
  { spending: 1100, satisfaction: 7.5, size: 160, region: 'North' },
  { spending: 1600, satisfaction: 8.3, size: 220, region: 'South' },
];

// Area chart data
export const areaData: AreaChartDataPoint[] = [
  { month: 1, mobile: 45, desktop: 78, tablet: 23 },
  { month: 2, mobile: 52, desktop: 82, tablet: 28 },
  { month: 3, mobile: 58, desktop: 85, tablet: 32 },
  { month: 4, mobile: 65, desktop: 88, tablet: 35 },
  { month: 5, mobile: 72, desktop: 92, tablet: 38 },
  { month: 6, mobile: 78, desktop: 95, tablet: 42 },
  { month: 7, mobile: 85, desktop: 98, tablet: 45 },
  { month: 8, mobile: 92, desktop: 102, tablet: 48 },
  { month: 9, mobile: 88, desktop: 99, tablet: 46 },
  { month: 10, mobile: 95, desktop: 105, tablet: 52 },
  { month: 11, mobile: 102, desktop: 108, tablet: 55 },
  { month: 12, mobile: 108, desktop: 112, tablet: 58 },
];

// Trend chart data
export const trendData: TrendChartDataPoint[] = [
  { year: 2019, revenue: 120 },
  { year: 2020, revenue: 145 },
  { year: 2021, revenue: 165 },
  { year: 2022, revenue: 198 },
  { year: 2023, revenue: 225 },
  { year: 2024, revenue: 258 },
];

// Map data
export const mapData: MapDataPoint[] = [
  { region: 'North America', value: 4500 },
  { region: 'South America', value: 2800 },
  { region: 'Europe', value: 6200 },
  { region: 'Africa', value: 1900 },
  { region: 'Asia', value: 8500 },
  { region: 'Oceania', value: 1200 },
];

// Table data
export const tableData: TableDataPoint[] = [
  { id: 1, name: 'John Doe', age: 28, department: 'Engineering', salary: 85000, active: true },
  { id: 2, name: 'Jane Smith', age: 32, department: 'Marketing', salary: 72000, active: true },
  { id: 3, name: 'Mike Johnson', age: 29, department: 'Sales', salary: 68000, active: false },
  { id: 4, name: 'Sarah Wilson', age: 35, department: 'Engineering', salary: 95000, active: true },
  { id: 5, name: 'David Brown', age: 31, department: 'HR', salary: 65000, active: true },
  { id: 6, name: 'Emily Davis', age: 27, department: 'Marketing', salary: 70000, active: true },
  { id: 7, name: 'Chris Miller', age: 33, department: 'Sales', salary: 75000, active: false },
  { id: 8, name: 'Lisa Garcia', age: 30, department: 'Engineering', salary: 88000, active: true },
  { id: 9, name: 'Tom Anderson', age: 36, department: 'Finance', salary: 82000, active: true },
  { id: 10, name: 'Amy White', age: 26, department: 'Marketing', salary: 69000, active: true },
];

// Datasets configuration
export const datasets = {
  sales: {
    name: 'Monthly Sales Data',
    description: 'Doanh số bán hàng theo tháng qua các kênh',
    data: salesData,
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
    data: categoryData,
    valueKey: 'value',
    categoryKey: 'category',
    title: 'Market Share by Category',
  },
  scatter: {
    name: 'Customer Analysis',
    description: 'Phân tích mối quan hệ giữa chi tiêu và sự hài lòng',
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
    data: mapData,
    title: 'Sales by Region',
  },
  table: {
    name: 'Employee Data',
    description: 'Dữ liệu nhân viên',
    data: tableData,
    title: 'Employee Information',
  },
};
