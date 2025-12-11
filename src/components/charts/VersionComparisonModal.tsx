import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitCompare, AlertCircle, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Routers from '@/router/routers';
import type { ComparisonResult } from '@/features/chartHistory/chartHistoryTypes';
import type { ChartHistory } from '@/features/chartHistory/chartHistoryTypes';
import { useChartEditor } from '@/features/chartEditor';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';

interface VersionComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparisonResult: ComparisonResult | null;
  isLoading: boolean;
  datasetIdHistory?: string; // eslint-disable-line @typescript-eslint/no-unused-vars
  selectedHistory?: ChartHistory;
  chartId?: string; // For navigation to history view page
}

const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  open,
  onOpenChange,
  comparisonResult,
  isLoading,
  selectedHistory,
  chartId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasChanges, resetToOriginal, clearChartEditor } = useChartEditor();
  const modalConfirm = useModalConfirm();

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

  // Helper to convert technical key names to user-friendly labels
  const getFieldLabel = (key: string): string => {
    // Remove 'config.' prefix if present
    const cleanKey = key.replace(/^config\./, '');

    // Mapping for common technical terms to friendly labels
    const labelMap: Record<string, string> = {
      // Chart config
      disabledLines: 'Disabled Lines',
      showPoints: 'Show Points',
      showPointValues: 'Show Point Values',
      curve: 'Curve Style',
      lineWidth: 'Line Width',
      pointRadius: 'Point Radius',
      showGrid: 'Show Grid',
      showLegend: 'Show Legend',
      legendPosition: 'Legend Position',
      showTooltip: 'Show Tooltip',
      tooltipMode: 'Tooltip Mode',
      yAxisKeys: 'Y-Axis Keys',
      xAxisKey: 'X-Axis Key',
      xAxisLabel: 'X-Axis Label',
      yAxisLabel: 'Y-Axis Label',
      chartTitle: 'Chart Title',
      chartSubtitle: 'Chart Subtitle',
      strokeWidth: 'Stroke Width',
      fillOpacity: 'Fill Opacity',
      gradientFill: 'Gradient Fill',
      stackMode: 'Stack Mode',
      showDataLabels: 'Show Data Labels',
      dataLabelPosition: 'Data Label Position',
      barPadding: 'Bar Padding',
      categoryGap: 'Category Gap',
      cornerRadius: 'Corner Radius',
      innerRadius: 'Inner Radius',
      outerRadius: 'Outer Radius',
      startAngle: 'Start Angle',
      endAngle: 'End Angle',
      paddingAngle: 'Padding Angle',
      labelType: 'Label Type',
      showPercent: 'Show Percent',
      colorScheme: 'Color Scheme',
      customColors: 'Custom Colors',
      // Dataset config
      'datasetConfig.sort': 'Sort Configuration',
      'datasetConfig.filters': 'Filters',
      'datasetConfig.aggregation': 'Aggregation',
      'datasetConfig.pivot': 'Pivot Table',
    };

    // Check if there's a direct mapping
    if (labelMap[cleanKey]) {
      return labelMap[cleanKey];
    }

    // Otherwise, convert camelCase to Title Case
    // e.g., "showPoints" -> "Show Points"
    return cleanKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  const [showChart, setShowChart] = useState(true);
  const [showCurrentHistory, setShowCurrentHistory] = useState(false);
  const [showDiffs, setShowDiffs] = useState(false);

  // Handle navigation to history view page
  const handleViewHistoryChart = () => {
    if (!selectedHistory || !chartId) return;

    // Check if there are unsaved changes
    if (hasChanges) {
      modalConfirm.openConfirm(async () => {
        // User confirmed to leave despite unsaved changes
        // Reset to original and clear editor state before navigating
        resetToOriginal();
        clearChartEditor();

        navigate(
          `${Routers.CHART_HISTORY_VIEW}?historyId=${selectedHistory.id}&chartId=${chartId}`
        );
        onOpenChange(false); // Close modal
      });
    } else {
      // No unsaved changes, navigate directly
      // Clear editor state to ensure clean state for history view
      clearChartEditor();

      navigate(`${Routers.CHART_HISTORY_VIEW}?historyId=${selectedHistory.id}&chartId=${chartId}`);
      onOpenChange(false); // Close modal
    }
  };

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

  // Helper: render JSON with highlight for diff keys
  const renderHighlightedJson = (
    obj: any,
    diffKeys: string[],
    side: 'current' | 'historical',
    _flatDiffs: FlatDiffs,
    otherSideObj: any
  ) => {
    // Convert object to lines with dot notation path
    const lines: string[] = [];
    const highlights: boolean[] = [];

    // Helper: check if this exact path (not children) has a diff
    const hasExactDiff = (path: string) => diffKeys.includes(path);

    // Helper: check if any child path has a diff
    const hasChildDiff = (path: string) => diffKeys.some(k => k.startsWith(path + '.'));

    // Helper: get value from other side by path
    const getValueByPath = (obj: any, path: string): any => {
      if (!path) return obj;
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          return undefined;
        }
      }
      return value;
    };

    function walk(val: any, path: string, indent: number, parentHighlight = false) {
      if (typeof val !== 'object' || val === null) {
        // primitive - highlight if this exact path has a diff OR parent is highlighted
        const keyPath = path;
        const highlight = parentHighlight || hasExactDiff(keyPath);
        lines.push(`${'  '.repeat(indent)}${JSON.stringify(val)}`);
        highlights.push(highlight);
        return;
      }
      if (Array.isArray(val)) {
        const arrayHasExactDiff = hasExactDiff(path);
        const arrayHasChildDiff = hasChildDiff(path);
        const shouldHighlightArray = arrayHasExactDiff && !arrayHasChildDiff;

        // Get the corresponding array from the other side
        const otherSideArray = getValueByPath(otherSideObj, path);
        const otherArrayLength = Array.isArray(otherSideArray) ? otherSideArray.length : 0;

        lines.push(`${'  '.repeat(indent)}[`);
        // Highlight opening bracket if entire array is different (added/removed/replaced)
        highlights.push(shouldHighlightArray || parentHighlight);

        // Pass down highlight flag to children if entire array should be highlighted
        val.forEach((item, idx) => {
          // Check if this element index exists in the other side
          const isNewElement = idx >= otherArrayLength;
          const elementPath = path ? `${path}.${idx}` : `${idx}`;

          // Highlight if: parent highlighted OR element is newly added OR element has changes
          const shouldHighlightElement = shouldHighlightArray || parentHighlight || isNewElement;

          walk(item, elementPath, indent + 1, shouldHighlightElement);
        });

        lines.push(`${'  '.repeat(indent)}]`);
        // Highlight closing bracket if entire array is different
        highlights.push(shouldHighlightArray || parentHighlight);
        return;
      }

      const objectHasExactDiff = hasExactDiff(path);
      const objectHasChildDiff = hasChildDiff(path);
      const shouldHighlightObject = objectHasExactDiff && !objectHasChildDiff;

      lines.push(`${'  '.repeat(indent)}{`);
      // Highlight opening brace if entire object is different (added/removed/replaced)
      highlights.push(shouldHighlightObject || parentHighlight);

      for (const key of Object.keys(val)) {
        const keyPath = path ? path + '.' + key : key;
        const value = val[key];
        const isObject = typeof value === 'object' && value !== null;

        // Highlight property key if:
        // 1. Parent is highlighted, OR
        // 2. It's a primitive value AND has exact diff, OR
        // 3. It's an object/array AND has exact diff (entire object replaced) AND no child diffs
        const shouldHighlight =
          parentHighlight || (hasExactDiff(keyPath) && !hasChildDiff(keyPath));

        if (isObject) {
          lines.push(`${'  '.repeat(indent + 1)}"${key}": `);
          highlights.push(shouldHighlight);
          // Pass shouldHighlight down to children when this specific property should be highlighted
          walk(value, keyPath, indent + 2, shouldHighlight);
        } else {
          lines.push(`${'  '.repeat(indent + 1)}"${key}": ${JSON.stringify(value)}`);
          highlights.push(shouldHighlight);
        }
      }

      lines.push(`${'  '.repeat(indent)}}`);
      // Highlight closing brace if entire object is different
      highlights.push(shouldHighlightObject || parentHighlight);
    }
    walk(obj, '', 0, false);
    return (
      <pre
        className={
          side === 'current'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 text-xs overflow-auto'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-xs overflow-auto'
        }
      >
        {lines.map((line, i) => {
          // Detect dark mode by checking document.documentElement.classList
          let isDark = false;
          if (typeof window !== 'undefined' && window.document?.documentElement?.classList) {
            isDark = window.document.documentElement.classList.contains('dark');
          }

          // Determine highlight color based on side:
          // - current (green background) → green highlight for additions
          // - historical (blue background) → red highlight for removals
          let highlightStyle = {};
          if (highlights[i]) {
            if (side === 'current') {
              // Green highlight for current version (added/changed)
              highlightStyle = {
                background: isDark ? '#1a4d2e' : '#d4f4dd', // dark green for dark mode, light green for light mode
                borderColor: '#52c41a',
              };
            } else {
              // Red highlight for historical version (removed/old)
              highlightStyle = {
                background: isDark ? '#5c1a1a' : '#ffd4d4', // dark red for dark mode, light red for light mode
                borderColor: '#ff4d4f',
              };
            }
          }

          return (
            <div key={i} style={highlightStyle}>
              {line}
            </div>
          );
        })}
      </pre>
    );
  };

  const renderJsonDiff = () => {
    if (!comparisonResult) return null;
    const { current, historical, differences } = comparisonResult;

    // Remove unwanted properties before diff (for rendering only)
    const currentForRender =
      current && typeof current === 'object'
        ? (({ updatedAt, ...rest }) => rest)(current)
        : current;
    const historicalForRender =
      historical && typeof historical === 'object'
        ? (({ imageUrl, createdAt, ...rest }) => rest)(historical)
        : historical;

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
        <strong>{getFieldLabel(key)}:</strong>
        <div className="ml-4 mt-1 grid grid-cols-2 gap-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Current:</div>
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(flatDiffs[key].current, null, 2)}
            </pre>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Historical:</div>
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(flatDiffs[key].historical, null, 2)}
            </pre>
          </div>
        </div>
      </li>
    );

    // Ưu tiên lấy imageUrl từ selectedHistory nếu có
    const historicalImageUrl = selectedHistory?.imageUrl || comparisonResult?.historical?.imageUrl;
    return (
      <div className="space-y-6">
        {/* Chart Preview Section - Show historical chart image if available */}
        <div>
          <SectionToggle
            open={showChart}
            onClick={() => setShowChart(v => !v)}
            label={t('chartHistory.comparison.historicalChart', 'Historical Chart Preview')}
          />
          {showChart && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 min-h-[320px] flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                {historicalImageUrl ? (
                  <img
                    src={historicalImageUrl}
                    alt={t(
                      'chartHistory.comparison.historicalChartAlt',
                      'Historical chart snapshot'
                    )}
                    className="max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-700 mx-auto"
                    onError={e => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class=\"text-center text-gray-500 dark:text-gray-400 py-12\">\n                          <span class=\"icon\"><svg width=\"48\" height=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/></svg></span>\n                          <p>${t('chartHistory.comparison.imageNotAvailable', 'Chart image not available')}</p>\n                        </div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>
                      {t(
                        'chartHistory.comparison.noImageAvailable',
                        'No chart preview available for this version'
                      )}
                    </p>
                  </div>
                )}
              </div>
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
            {showCurrentHistory &&
              renderHighlightedJson(
                currentForRender,
                diffKeys,
                'current',
                flatDiffs,
                historicalForRender
              )}
          </div>
          <div>
            <SectionToggle
              open={showCurrentHistory}
              onClick={() => setShowCurrentHistory(v => !v)}
              label={t('chartHistory.comparison.historical', 'Historical Version')}
            />
            {showCurrentHistory &&
              renderHighlightedJson(
                historicalForRender,
                diffKeys,
                'historical',
                flatDiffs,
                currentForRender
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
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 overflow-auto">
              <ul className="list-disc list-inside space-y-2 text-xs">
                {/* Other differences */}
                {otherDiffs.map(key => renderDiffItem(key))}
                {/* Config group */}
                {configDiffs.length > 0 && (
                  <li className="text-gray-700 dark:text-gray-300">
                    <strong>Config:</strong>
                    <ul className="list-disc list-inside ml-6 space-y-2">
                      {configDiffs.map(key => {
                        // Pass the key without 'config.' prefix to avoid duplication
                        const keyWithoutPrefix = key.replace('config.', '');
                        return (
                          <li key={key} className="text-gray-700 dark:text-gray-300">
                            <strong>{getFieldLabel(keyWithoutPrefix)}:</strong>
                            <div className="ml-4 mt-1 grid grid-cols-2 gap-2">
                              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                <div className="text-gray-600 dark:text-gray-400 mb-1">
                                  Current:
                                </div>
                                <pre className="text-xs whitespace-pre-wrap break-words">
                                  {JSON.stringify(flatDiffs[key].current, null, 2)}
                                </pre>
                              </div>
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                                <div className="text-gray-600 dark:text-gray-400 mb-1">
                                  Historical:
                                </div>
                                <pre className="text-xs whitespace-pre-wrap break-words">
                                  {JSON.stringify(flatDiffs[key].historical, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </li>
                        );
                      })}
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

        {/* Footer with View Chart Button */}
        {selectedHistory && chartId && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-auto">
              {t('close', 'Close')}
            </Button>
            <Button
              onClick={handleViewHistoryChart}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('chartHistory.viewHistoricalChart', 'View Historical Chart')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      {/* Confirmation Modal for Unsaved Changes */}
      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        loading={modalConfirm.isLoading}
        type="warning"
        title={t('chart_unsaved_changes_title', 'Unsaved Changes')}
        message={t(
          'chart_unsaved_changes_message',
          'You have unsaved changes. If you leave now, your changes will be lost. Are you sure you want to continue?'
        )}
        confirmText={t('leave_anyway', 'Leave Anyway')}
        cancelText={t('common_cancel', 'Cancel')}
      />
    </Dialog>
  );
};

export default VersionComparisonModal;
