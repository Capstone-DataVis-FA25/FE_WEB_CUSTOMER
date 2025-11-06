import React from 'react';
import D3ScatterChart from '@/components/charts/D3ScatterChart';

type Props = {
  arrayData?: (string | number)[][];
};

const ScatterPreview: React.FC<Props> = ({ arrayData }) => {
  return (
    <D3ScatterChart
      arrayData={arrayData}
      width={420}
      height={420}
      xAxisKey="x"
      yAxisKey="y"
      showLegend={true}
      animationDuration={800}
      showTooltip={true}
      showAxisLabels={true}
    />
  );
};

export default ScatterPreview;
