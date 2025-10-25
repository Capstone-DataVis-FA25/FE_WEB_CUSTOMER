import React from 'react';
import D3BarChart from '@/components/charts/D3BarChart';

type Props = {
  arrayData?: (string | number)[][];
};

const BarPreview: React.FC<Props> = ({ arrayData }) => {
  return (
    <D3BarChart
      arrayData={arrayData}
      xAxisKey="product"
      yAxisKeys={['Q1', 'Q2', 'Q3', 'Q4']}
      width={420}
      height={420}
      showLegend={true}
      showGrid={true}
      animationDuration={800}
    />
  );
};

export default BarPreview;
