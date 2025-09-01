import type { ChartDataPoint } from '@/components/charts/D3LineChart';

// Sales data
export const salesData: ChartDataPoint[] = [
  { month: 1, ecommerce: 125, retail: 980, wholesale: 750 },
  { month: 2, ecommerce: 135, retail: 1020, wholesale: 780 },
  { month: 3, ecommerce: 148, retail: 1150, wholesale: 820 },
  { month: 4, ecommerce: 162, retail: 1080, wholesale: 860 },
  { month: 5, ecommerce: 175, retail: 1200, wholesale: 900 },
  { month: 6, ecommerce: 189, retail: 1350, wholesale: 950 },
  { month: 7, ecommerce: 210, retail: 1450, wholesale: 1000 },
  { month: 8, ecommerce: 225, retail: 1520, wholesale: 1080 },
  { month: 9, ecommerce: 215, retail: 1480, wholesale: 1050 },
  { month: 10, ecommerce: 238, retail: 1650, wholesale: 1120 },
  { month: 11, ecommerce: 265, retail: 1850, wholesale: 1200 },
  { month: 12, ecommerce: 295, retail: 2100, wholesale: 1350 },
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
};
