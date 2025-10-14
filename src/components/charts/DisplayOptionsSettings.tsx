import React from 'react';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';
import DisplayCheckboxes from './DisplayCheckboxes';
import LineChartStyling from './LineChartStyling';
import ChartConfiguration from './ChartConfiguration';
import InteractiveOptions from './InteractiveOptions';
import ThemeConfiguration from './ThemeConfiguration';
import FontSizeConfiguration from './FontSizeConfiguration';

const DisplayOptionsSettings: React.FC = () => {
  const { currentChartType } = useChartEditor();

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
