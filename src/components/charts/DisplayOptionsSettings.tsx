import React from 'react';
import { useChartEditorRead } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import DisplayCheckboxes from './DisplayCheckboxes';
import LineChartStyling from './LineChartStyling';
import ChartConfiguration from './ChartConfiguration';
import InteractiveOptions from './InteractiveOptions';
import ThemeConfiguration from './ThemeConfiguration';
import FontSizeConfiguration from './FontSizeConfiguration';

const DisplayOptionsSettings: React.FC = () => {
  const { currentChartType } = useChartEditorRead();

  return (
    <div>
      {/* Always visible */}
      <DisplayCheckboxes />

      {/* Line chart only */}
      {currentChartType === ChartType.Line && <LineChartStyling />}

      {/* Always visible */}
      <ChartConfiguration />

      {/* Always visible */}
      <InteractiveOptions />

      {/* Always visible */}
      <ThemeConfiguration />

      {/* Always visible */}
      <FontSizeConfiguration />
    </div>
  );
};

export default DisplayOptionsSettings;
