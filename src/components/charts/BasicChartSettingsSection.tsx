import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Label } from '../ui/label';
import AnimationDurationSetting from './AnimationDurationSetting';
import AxisLabelsSettings from './AxisLabelsSettings';
import CurveTypeSetting from './CurveTypeSetting';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';
import BarTypeSettings from './BarTypeSettings';
import DisplayOptionsSettings from './DisplayOptionsSettings';

const BasicChartSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const { currentChartType } = useChartEditor();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl select-none">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('chart_editor_chart_settings', 'Chart Settings')}
          </h3>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Axis Labels */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="sr-only">Axis Labels</Label>
              {/* Split component */}
              <AxisLabelsSettings />
            </div>
          </div>

          {/* Animation Duration */}
          <AnimationDurationSetting />

          {/* Curve Type */}
          {(currentChartType === ChartType.Line || currentChartType === ChartType.Area) && (
            <CurveTypeSetting />
          )}

          {/* Bar Type */}
          {currentChartType === ChartType.Bar && <BarTypeSettings />}

          {/* Display Options */}
          <DisplayOptionsSettings />
        </CardContent>
      )}
    </Card>
  );
};

export default BasicChartSettingsSection;
