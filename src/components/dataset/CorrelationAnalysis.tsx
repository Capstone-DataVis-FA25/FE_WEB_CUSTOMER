import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Info,
  Download,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  calculateCorrelationMatrix,
  extractNumericColumns,
  getCorrelationColor,
  getCorrelationTextColor,
  interpretCorrelation,
  analyzeCorrelationInsights,
  getTopCorrelations,
  type CorrelationMatrix,
  type CorrelationInsight,
} from '@/utils/correlationUtils';

interface CorrelationAnalysisProps {
  headers: { name: string }[];
  data: (string | number | null)[][];
  className?: string;
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  headers,
  data,
  className = '',
}) => {
  const [correlationType, setCorrelationType] = useState<'pearson' | 'spearman' | 'kendall'>(
    'pearson'
  );
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
    value: number;
  } | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  // Extract numeric columns and calculate correlation matrix
  const correlationMatrix = useMemo<CorrelationMatrix | null>(() => {
    try {
      const numericData = extractNumericColumns(headers, data);
      const numericFields = Object.keys(numericData);

      if (numericFields.length < 2) {
        return null; // Need at least 2 numeric columns
      }

      return calculateCorrelationMatrix(numericData, correlationType);
    } catch (error) {
      console.error('Error calculating correlation matrix:', error);
      return null;
    }
  }, [headers, data, correlationType]);

  // Analyze insights from correlation matrix
  const insights = useMemo<CorrelationInsight[]>(() => {
    if (!correlationMatrix) return [];
    return analyzeCorrelationInsights(correlationMatrix);
  }, [correlationMatrix]);

  // Get top correlations
  const topCorrelations = useMemo(() => {
    if (!correlationMatrix) return [];
    return getTopCorrelations(correlationMatrix, 5);
  }, [correlationMatrix]);

  // Export correlation matrix as CSV
  const handleExport = () => {
    if (!correlationMatrix) return;

    const { fields, matrix } = correlationMatrix;

    // Create CSV content
    const headerRow = ['', ...fields].join(',');
    const dataRows = fields.map((field, i) => {
      const row = [field, ...matrix[i].map(val => val.toFixed(4))];
      return row.join(',');
    });

    const csv = [headerRow, ...dataRows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `correlation_matrix_${correlationType}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!correlationMatrix) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Phân tích tương quan</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Không đủ dữ liệu số để phân tích tương quan. Cần ít nhất 2 cột chứa dữ liệu số.
        </p>
      </Card>
    );
  }

  const { fields, matrix } = correlationMatrix;

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Ma trận tương quan</h3>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={correlationType}
            onValueChange={value => {
              if (value === 'pearson' || value === 'spearman' || value === 'kendall') {
                setCorrelationType(value);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pearson">Pearson</SelectItem>
              <SelectItem value="spearman">Spearman</SelectItem>
              <SelectItem value="kendall">Kendall Tau</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Correlation Type Description */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {correlationType === 'pearson' && (
            <>
              <strong>Pearson:</strong> Phù hợp với dữ liệu liên tục, quan hệ tuyến tính, ít outlier
            </>
          )}
          {correlationType === 'spearman' && (
            <>
              <strong>Spearman:</strong> Phù hợp với quan hệ không tuyến tính, dữ liệu thứ hạng
            </>
          )}
          {correlationType === 'kendall' && (
            <>
              <strong>Kendall Tau:</strong> Phù hợp với dataset nhỏ, nhiều giá trị trùng lặp
            </>
          )}
        </p>
      </div>

      {/* Key Insights Section */}
      {insights.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-base">Phát hiện quan trọng</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
              className="text-sm"
            >
              {showInsights ? 'Ẩn' : 'Hiện'} ({insights.length})
            </Button>
          </div>

          {showInsights && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {insights.map(insight => {
                const getSeverityIcon = () => {
                  switch (insight.severity) {
                    case 'critical':
                      return <AlertTriangle className="w-5 h-5 text-red-500" />;
                    case 'high':
                      return <TrendingUp className="w-5 h-5 text-orange-500" />;
                    case 'medium':
                      return <TrendingDown className="w-5 h-5 text-yellow-500" />;
                    default:
                      return <Lightbulb className="w-5 h-5 text-blue-500" />;
                  }
                };

                const getSeverityBg = () => {
                  switch (insight.severity) {
                    case 'critical':
                      return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
                    case 'high':
                      return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
                    case 'medium':
                      return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
                    default:
                      return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
                  }
                };

                return (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getSeverityBg()} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getSeverityIcon()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm">{insight.title}</h5>
                          <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                            r = {insight.coefficient.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {insight.description}
                        </p>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs mb-2">
                          <p className="font-medium mb-1">💡 Giải thích:</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {insight.interpretation}
                          </p>
                        </div>
                        {insight.recommendation && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs">
                            <p className="font-medium mb-1">📌 Khuyến nghị:</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {insight.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Correlation Matrix Heatmap */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left font-semibold text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600"></th>
              {fields.map(field => (
                <th
                  key={field}
                  className="p-2 text-center font-semibold text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 min-w-[100px]"
                >
                  <div className="truncate" title={field}>
                    {field}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((rowField, rowIndex) => (
              <tr key={rowField}>
                <td className="p-2 font-semibold text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                  <div className="truncate" title={rowField}>
                    {rowField}
                  </div>
                </td>
                {fields.map((colField, colIndex) => {
                  const value = matrix[rowIndex][colIndex];
                  const bgColor = getCorrelationColor(value);
                  const textColor = getCorrelationTextColor(value);
                  const isSelected =
                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

                  return (
                    <td
                      key={`${rowField}-${colField}`}
                      className={`p-2 text-center text-sm font-medium border border-slate-300 dark:border-slate-600 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
                        isSelected ? 'ring-2 ring-blue-600' : ''
                      }`}
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                      }}
                      onClick={() => setSelectedCell({ row: rowIndex, col: colIndex, value })}
                      title={`${rowField} ↔ ${colField}: ${value.toFixed(4)}`}
                    >
                      {value.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold mb-2 text-sm">Chi tiết tương quan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Biến 1:</span>{' '}
              <span className="font-medium">{fields[selectedCell.row]}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Biến 2:</span>{' '}
              <span className="font-medium">{fields[selectedCell.col]}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hệ số tương quan:</span>{' '}
              <span className="font-mono font-bold">{selectedCell.value.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mức độ:</span>{' '}
              <span className="font-medium">
                {interpretCorrelation(selectedCell.value).description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="font-semibold mb-3 text-sm">Chú giải</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: 'Mạnh dương (+0.7 → +1)', color: '#0ea5e9' },
            { label: 'TB dương (+0.3 → +0.7)', color: '#7dd3fc' },
            { label: 'Yếu/Không (0 → ±0.3)', color: '#f1f5f9' },
            { label: 'TB âm (-0.3 → -0.7)', color: '#f87171' },
            { label: 'Mạnh âm (-0.7 → -1)', color: '#ef4444' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Correlations Summary */}
      {topCorrelations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Top 5 tương quan mạnh nhất
          </h4>
          <div className="space-y-2">
            {topCorrelations.map((item, index) => {
              const isPositive = item.coefficient > 0;
              const absCoef = Math.abs(item.coefficient);
              return (
                <div
                  key={`top-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-bold text-slate-400 w-6">#{index + 1}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-medium text-sm truncate">{item.field1}</span>
                      <span className="text-slate-400">{isPositive ? '↔' : '⇄'}</span>
                      <span className="font-medium text-sm truncate">{item.field2}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-16 h-2 rounded-full"
                      style={{
                        backgroundColor: getCorrelationColor(item.coefficient),
                      }}
                    />
                    <span
                      className="font-mono text-sm font-bold min-w-[60px] text-right"
                      style={{
                        color: absCoef >= 0.7 ? (isPositive ? '#0ea5e9' : '#ef4444') : '#64748b',
                      }}
                    >
                      {item.coefficient.toFixed(3)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>⚠️ Lưu ý quan trọng:</strong> Tương quan KHÔNG đồng nghĩa với quan hệ nhân quả. Hệ
          số tương quan chỉ thể hiện mức độ liên quan giữa các biến, không chứng minh biến này gây
          ra biến kia.
        </p>
      </div>
    </Card>
  );
};

export default CorrelationAnalysis;
