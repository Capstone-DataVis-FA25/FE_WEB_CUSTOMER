import type { ChartDataPoint } from "@/components/charts/D3LineChart";

// Line data
export const salesData: ChartDataPoint[] = [
  { month: 1, ecommerce: 125, retail: 980, wholesale: 750 },
  { month: 2, ecommerce: 135, retail: 1020, wholesale: 780 },
  { month: 3, ecommerce: 148, retail: 1150, wholesale: 820 },
  { month: 4, ecommerce: 162, retail: 1080, wholesale: 860 },
  { month: 5, ecommerce: 175, retail: 1200, wholesale: 900 },
  { month: 6, ecommerce: 189, retail: 1350, wholesale: 950},
  { month: 7, ecommerce: 210, retail: 1450, wholesale: 1000 },
  { month: 8, ecommerce: 225, retail: 1520, wholesale: 1080},
  { month: 9, ecommerce: 215, retail: 1480, wholesale: 1050},
  { month: 10, ecommerce: 238, retail: 1650, wholesale: 1120 },
  { month: 11, ecommerce: 265, retail: 1850, wholesale: 1200 },
  { month: 12, ecommerce: 295, retail: 2100, wholesale: 1350 },
];

export const exampleData = [
  ['city', 'month', 'sale'],
  ['New York', 1, 500],
  ['Los Angeles', 1, 600],
  ['Chicago', 1, 700],
  ['Houston', 1, 800],
  ['Phoenix', 1, 900],
];