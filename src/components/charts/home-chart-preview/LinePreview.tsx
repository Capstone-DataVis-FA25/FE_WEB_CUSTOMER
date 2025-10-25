import React from 'react';
import D3LineChart from '@/components/charts/D3LineChart';

type Props = {
  arrayData?: (string | number)[][];
};

const LinePreview: React.FC<Props> = ({ arrayData }) => {
  return (
    <D3LineChart
      arrayData={arrayData}
      xAxisKey="month"
      yAxisKeys={['revenue']}
      width={420}
      height={420}
      showLegend={false}
      showGrid={true}
      showPoints={true}
    />
  );
};

export default LinePreview;
