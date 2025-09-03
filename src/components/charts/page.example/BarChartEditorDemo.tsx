import BarChartEditor from '@/components/charts/BarChartEditor';

const BarChartDemo = () => {
  // Sample data for testing the bar chart
  const sampleData = [
    { x: 'Jan', sales: 1200, revenue: 3400, profit: 800 },
    { x: 'Feb', sales: 1900, revenue: 4200, profit: 1200 },
    { x: 'Mar', sales: 1500, revenue: 3800, profit: 1000 },
    { x: 'Apr', sales: 2200, revenue: 5100, profit: 1600 },
    { x: 'May', sales: 1800, revenue: 4300, profit: 1300 },
    { x: 'Jun', sales: 2600, revenue: 5800, profit: 2000 },
  ];

  const initialConfig = {
    title: 'Monthly Business Metrics',
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount',
  };

  const initialColors = {
    sales: { light: '#3b82f6', dark: '#60a5fa' },
    revenue: { light: '#f97316', dark: '#fb923c' },
    profit: { light: '#10b981', dark: '#34d399' },
  };

  return (
    <div className="w-full">
      <BarChartEditor
        initialData={sampleData}
        initialConfig={initialConfig}
        initialColors={initialColors}
        title="Bar Chart Editor Demo"
        description="Interactive bar chart creation and customization"
      />
    </div>
  );
};

export default BarChartDemo;
