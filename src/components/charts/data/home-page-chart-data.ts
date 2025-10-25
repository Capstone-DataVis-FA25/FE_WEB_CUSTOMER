// Example datasets used by HomePage chart previews
// Each dataset is an array-of-arrays: first row = headers, following rows = data rows

export const datasets: Record<string, (string | number)[][]> = {
  // Bar chart: sales by product across quarters (multiple series -> grouped bars)
  sales: [
    ['product', 'Q1', 'Q2', 'Q3', 'Q4'],
    ['Product A', 12000, 15000, 13000, 17000],
    ['Product B', 9000, 10000, 9500, 12000],
    ['Product C', 7000, 8000, 7600, 9000],
    ['Product D', 4000, 6000, 5000, 6500],
  ],

  // Line chart: revenue over 12 months (single series)
  quarterly: [
    ['month', 'revenue'],
    ['2024-01', 12000],
    ['2024-02', 15000],
    ['2024-03', 18000],
    ['2024-04', 17000],
    ['2024-05', 19000],
    ['2024-06', 22000],
    ['2024-07', 21000],
    ['2024-08', 23000],
    ['2024-09', 25000],
    ['2024-10', 24000],
    ['2024-11', 26000],
    ['2024-12', 28000],
  ],

  // Area chart: two series over months (stacked/overlay)
  area: [
    ['month', 'Organic', 'Paid'],
    ['Jan', 300, 200],
    ['Feb', 400, 240],
    ['Mar', 450, 300],
    ['Apr', 500, 320],
    ['May', 620, 410],
    ['Jun', 700, 480],
    ['Jul', 680, 520],
    ['Aug', 720, 560],
    ['Sep', 800, 600],
    ['Oct', 820, 640],
    ['Nov', 900, 700],
    ['Dec', 950, 760],
  ],

  // Pie chart: market share by category
  pie: [
    ['segment', 'share'],
    ['Desktop', 45],
    ['Mobile', 40],
    ['Tablet', 8],
    ['Other', 7],
  ],

  // Scatter chart: random (x,y,group) points for demonstration
  scatter: [
    ['x', 'y', 'category'],
    [5.1, 3.5, 'A'],
    [4.9, 3.0, 'A'],
    [6.7, 3.1, 'B'],
    [5.6, 2.9, 'B'],
    [7.2, 3.6, 'C'],
    [6.5, 3.0, 'C'],
    [5.0, 3.4, 'A'],
    [6.0, 3.0, 'B'],
    [7.8, 3.8, 'C'],
    [5.4, 3.9, 'A'],
  ],
};

export default datasets;
