import React, { useMemo } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { suggestDataPairs, type DataPairRecommendation } from '@/utils/dataPairAnalyzer';
import type { DataHeader } from '@/utils/dataProcessors';

interface DataPairSuggestionPanelProps {
  headers: DataHeader[];
  chartType: 'area' | 'scatter';
  currentXAxisId?: string;
  currentYAxisIds?: string[];
  onApplyRecommendation: (xColumnId: string, yColumnId: string, isRemoving?: boolean) => void;
}

const DataPairSuggestionPanel: React.FC<DataPairSuggestionPanelProps> = ({
  headers,
  chartType,
  currentXAxisId,
  currentYAxisIds = [],
  onApplyRecommendation,
}) => {
  const { t } = useTranslation();

  // Generate recommendations (memoized to avoid recalculation)
  const recommendations = useMemo(() => {
    if (!headers || headers.length < 2) return [];
    return suggestDataPairs(headers, chartType, 5);
  }, [headers, chartType]);

  // Check if a recommendation is currently applied
  const isCurrentPair = (rec: DataPairRecommendation) => {
    return rec.xColumnId === currentXAxisId && currentYAxisIds.includes(rec.yColumnId);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (score >= 40)
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  if (recommendations.length === 0) {
    return (
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('no_suggestions', 'No Suggestions Available')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(
                'suggestions_hint',
                'Not enough suitable columns found. Please ensure your dataset has appropriate column types.'
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          {t('smart_suggestions', '💡 Smart Data Pair Suggestions')}
        </h4>
      </div>

      <div className="space-y-2">
        {recommendations.map(rec => {
          const isCurrent = isCurrentPair(rec);

          return (
            <button
              key={`${rec.xColumnId}-${rec.yColumnId}`}
              onClick={() => onApplyRecommendation(rec.xColumnId, rec.yColumnId, isCurrent)}
              className={`
                w-full text-left p-2.5 rounded-lg border transition-all
                ${
                  isCurrent
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer'
                    : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Column pair */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">X:</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {rec.xColumnName}
                    </span>
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Y:
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {rec.yColumnName}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-gray-600 dark:text-gray-400">{rec.reason}</p>

                  {/* Current indicator */}
                  {isCurrent && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 rounded text-xs font-medium text-green-700 dark:text-green-300">
                      ✓ Currently applied
                    </div>
                  )}
                </div>

                {/* Score badge */}
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`
                      px-2 py-1 rounded-md text-xs font-bold
                      ${getScoreBadge(rec.score)}
                    `}
                  >
                    {Math.round(rec.score)}%
                  </div>
                  <span className="text-xs text-gray-400">match</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
        {t(
          'suggestion_helper',
          'Click on a suggestion to apply it to your chart. Click again to remove it.'
        )}
      </p>
    </div>
  );
};

export default DataPairSuggestionPanel;
