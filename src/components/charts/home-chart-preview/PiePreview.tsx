import React from 'react';
import D3PieChart from '@/components/charts/D3PieChart';

type Props = {
  arrayData?: (string | number)[][];
};

const PiePreview: React.FC<Props> = ({ arrayData }) => {
  // Pie chart expects arrayData with [label,value]
  return (
    <D3PieChart
      arrayData={arrayData}
      labelKey="segment"
      valueKey="share"
      width={420}
      height={420}
      animationDuration={800}
      showLegend={true}
      showLabels={true}
      variant="preview"
    />
  );
};

export default PiePreview;
