import React, { useState } from 'react';
import HistoricalChartPreview from '@/components/charts/HistoricalChartPreview';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GitCompare, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ComparisonResult } from '@/features/chartHistory/chartHistoryTypes';
import { useChartEditor } from '@/features/chartEditor';

interface VersionComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparisonResult: ComparisonResult | null;
  isLoading: boolean;
}

const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  open,
  onOpenChange,
  comparisonResult,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { chartData } = useChartEditor();

  // Helper to flatten nested differences object to dot notation keysf
  type DiffLeaf = { current: any; historical: any };
  type DiffObject = { [key: string]: DiffLeaf | DiffObject };
  type FlatDiffs = { [key: string]: DiffLeaf };

  const flattenDifferences = (obj: DiffObject, prefix = ''): FlatDiffs => {
    let result: FlatDiffs = {};
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object' && 'current' in value && 'historical' in value) {
        // This is a leaf diff node
        result[prefix ? `${prefix}.${key}` : key] = value as DiffLeaf;
      } else if (value && typeof value === 'object') {
        // Nested object, recurse
        const nested = flattenDifferences(value as DiffObject, prefix ? `${prefix}.${key}` : key);
        result = { ...result, ...nested };
      }
    }
    return result;
  };

  const [showChart, setShowChart] = useState(true);
  const [showCurrentHistory, setShowCurrentHistory] = useState(false);
  const [showDiffs, setShowDiffs] = useState(false);

  const SectionToggle: React.FC<{ open: boolean; onClick: () => void; label: string }> = ({
    open,
    onClick,
    label,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none mb-2"
      aria-expanded={open}
    >
      <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      {label}
    </button>
  );

  const renderJsonDiff = () => {
    if (!comparisonResult) return null;
    const { current, historical, differences } = comparisonResult;

    // Flatten differences to dot notation keys
    const flatDiffs: FlatDiffs = flattenDifferences((differences || {}) as DiffObject);
    const diffKeys = Object.keys(flatDiffs);
    if (diffKeys.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('chartHistory.comparison.noDifferences', 'No differences found')}</p>
        </div>
      );
    }

    // Group config.* keys
    const configDiffs = diffKeys.filter(k => k.startsWith('config.'));
    const otherDiffs = diffKeys.filter(k => !k.startsWith('config.'));

    // Helper to render a single diff item
    const renderDiffItem = (key: string) => (
      <li key={key} className="text-gray-700 dark:text-gray-300">
        <strong>{key.replace(/^config\./, '')}:</strong>
        <div className="ml-4 mt-1 grid grid-cols-2 gap-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Current:</div>
            <code className="text-xs">{JSON.stringify(flatDiffs[key].current, null, 2)}</code>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Historical:</div>
            <code className="text-xs">{JSON.stringify(flatDiffs[key].historical, null, 2)}</code>
          </div>
        </div>
      </li>
    );
    // Hiển thị chart historical phía trên, mapping config/headers/data đúng chuẩn ChartDisplaySection
    return (
      <div className="space-y-6">
        {/* Chart Preview Section */}
        <div>
          <SectionToggle
            open={showChart}
            onClick={() => setShowChart(v => !v)}
            label={t('chartHistory.comparison.historicalChart', 'Historical Chart Preview')}
          />
          {showChart && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex items-center justify-center min-h-[320px]">
              <HistoricalChartPreview
                chartType={historical?.type}
                chartConfig={historical?.config}
                chartData={chartData}
              />
            </div>
          )}
        </div>
        {/* Current & Historical JSON Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionToggle
              open={showCurrentHistory}
              onClick={() => setShowCurrentHistory(v => !v)}
              label={t('chartHistory.comparison.current', 'Current Version')}
            />
            {showCurrentHistory && (
              <pre className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 text-xs overflow-auto">
                {JSON.stringify(current, null, 2)}
              </pre>
            )}
          </div>
          <div>
            <SectionToggle
              open={showCurrentHistory}
              onClick={() => setShowCurrentHistory(v => !v)}
              label={t('chartHistory.comparison.historical', 'Historical Version')}
            />
            {showCurrentHistory && (
              <pre className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-xs overflow-auto">
                {JSON.stringify(historical, null, 2)}
              </pre>
            )}
          </div>
        </div>
        {/* Differences Section */}
        <div>
          <SectionToggle
            open={showDiffs}
            onClick={() => setShowDiffs(v => !v)}
            label={t('chartHistory.comparison.differences', 'Key Differences')}
          />
          {showDiffs && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 max-h-96 overflow-auto">
              <ul className="list-disc list-inside space-y-2 text-xs">
                {/* Other differences */}
                {otherDiffs.map(key => renderDiffItem(key))}
                {/* Config group */}
                {configDiffs.length > 0 && (
                  <li className="text-gray-700 dark:text-gray-300">
                    <strong>Config:</strong>
                    <ul className="list-disc list-inside ml-6 space-y-2">
                      {configDiffs.map(key => renderDiffItem(key))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-500" />
            {t('chartHistory.comparison.title', 'Version Comparison')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'chartHistory.comparison.description',
              'Compare the current chart configuration with the historical version.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('chartHistory.comparison.loading', 'Comparing versions...')}
                </p>
              </div>
            </div>
          ) : (
            renderJsonDiff()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionComparisonModal;
