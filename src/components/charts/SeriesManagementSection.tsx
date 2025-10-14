import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';

const SeriesManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig } = useChartEditor();

  if (!chartConfig) return null;

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl select-none">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('chart_editor_seriesManagement', 'Series Management')}
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
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('coming_soon', 'Coming soon...')}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SeriesManagementSection;
