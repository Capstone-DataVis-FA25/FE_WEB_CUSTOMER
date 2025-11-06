import React from 'react';
import D3AreaChart from '@/components/charts/D3AreaChart';

type Props = {
  arrayData?: (string | number)[][];
};

const AreaPreview: React.FC<Props> = ({ arrayData }) => {
  const toData = (arr?: (string | number)[][]) => {
    if (!arr || arr.length < 2) return [] as any[];
    const headers = arr[0] as string[];
    const rows = arr.slice(1);
    return rows.map(r => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });
  };

  const data = toData(arrayData);

  return (
    <D3AreaChart
      data={data}
      xAxisKey="month"
      yAxisKeys={['Organic', 'Paid']}
      width={420}
      height={420}
      showLegend={true}
      animationDuration={800}
      showGrid={true}
      opacity={0.6}
      variant="preview"
    />
  );
};

export default AreaPreview;
