import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, Table, TrendingUp } from 'lucide-react';
import DatasetViewerTable from '@/components/dataset/DatasetViewerTable';
import CorrelationAnalysis from '@/components/dataset/CorrelationAnalysis';
import { formatDateUsingDayjs } from '@/utils/dateFormat';

type TFunc = (key: string, fallback?: string) => string;

type Props = {
  t: TFunc;
  currentDataset: any;
};

// Lightweight CSV export for the preview table
const exportCsv = (
  columns: { name: string }[],
  rows: (string | number | null)[][],
  filename: string
) => {
  const header = columns.map(c => '"' + (c.name ?? '') + '"').join(',');
  const body = rows
    .map(r => r.map(cell => '"' + String(cell ?? '').replace(/"/g, '""') + '"').join(','))
    .join('\n');
  const csv = [header, body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
};

const DatasetPreviewCard: React.FC<Props> = ({ t, currentDataset }) => {
  const [activeTab, setActiveTab] = useState('data');

  // Build columns + rows with per-column formatting
  const { headerRow, bodyRows } = useMemo(() => {
    const headers = currentDataset.headers || [];
    const headerRow = headers.map((h: any) => ({
      name: h.name,
      type: h.type === 'number' || h.type === 'date' ? h.type : 'text',
      dateFormat: h.dateFormat as string | undefined,
    }));

    const rowCount: number = currentDataset.rowCount || 0;
    const rows: (string | number | null)[][] = Array.from({ length: rowCount }, () =>
      Array(headerRow.length).fill('')
    );

    headers.forEach((h: any, colIdx: number) => {
      h.data?.forEach((cell: string | number | null, rowIdx: number) => {
        if (rows[rowIdx]) rows[rowIdx][colIdx] = cell ?? '';
      });
    });

    const thousandsSep = currentDataset.thousandsSeparator || ',';
    const decimalSep = currentDataset.decimalSeparator || '.';

    const alreadyFormattedPattern = /[@#]/; // legacy markers guarding against double-formatting
    const formatNumberCustom = (val: number | string): string => {
      if (val === null || val === undefined || val === '') return '';
      const raw = String(val).trim();
      if (
        raw.includes(thousandsSep) ||
        raw.includes(decimalSep) ||
        alreadyFormattedPattern.test(raw)
      ) {
        return raw;
      }
      const m = raw.replace(/,/g, '').match(/^(-?\d+)(?:[.,](\d+))?$/);
      if (!m) return raw;
      const neg = m[1].startsWith('-') ? '-' : '';
      const intPart = m[1].replace('-', '');
      const decPart = m[2] || '';
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
      return neg + grouped + (decPart ? decimalSep + decPart : '');
    };

    const formatDatePerColumn = (val: string, pattern?: string): string => {
      if (!val) return '';
      const fmt = pattern || 'YYYY-MM-DD';
      return formatDateUsingDayjs(val, fmt);
    };

    const bodyRows = rows.map(r =>
      r.map((cell, ci) => {
        const col = headerRow[ci];
        if (col.type === 'number') return formatNumberCustom(cell as any);
        if (col.type === 'date')
          return typeof cell === 'string' ? formatDatePerColumn(cell, col.dateFormat) : '';
        return cell ?? '';
      })
    );

    return { headerRow, bodyRows };
  }, [currentDataset]);

  // Prepare data for correlation analysis
  const correlationData = useMemo(() => {
    const headers = currentDataset.headers || [];
    const rowCount: number = currentDataset.rowCount || 0;
    const rows: (string | number | null)[][] = Array.from({ length: rowCount }, () =>
      Array(headers.length).fill(null)
    );

    headers.forEach((h: any, colIdx: number) => {
      h.data?.forEach((cell: string | number | null, rowIdx: number) => {
        if (rows[rowIdx]) rows[rowIdx][colIdx] = cell;
      });
    });

    return { headers: headerRow, data: rows };
  }, [currentDataset, headerRow]);

  return (
    <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('dataset_dataPreview', 'Data Preview')}</h3>
            </div>
          </div>
        </CardTitle>
      </div>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Dữ liệu
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Phân tích tương quan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-0">
            <div className="relative">
              {/* Header info bar (removed global Date pill) */}
              <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Columns: {currentDataset.columnCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rows: {currentDataset.rowCount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 pl-4 ml-2 border-l border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Thousands Separator:</span>
                        <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                          {(currentDataset.thousandsSeparator || ',') === ' '
                            ? '␠'
                            : currentDataset.thousandsSeparator || ','}
                        </code>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Decimal Separator:</span>
                        <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                          {currentDataset.decimalSeparator || '.'}
                        </code>
                      </span>
                      {/* Date pill intentionally removed */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        exportCsv(
                          headerRow,
                          bodyRows,
                          `${(currentDataset?.name || 'dataset').replace(/[^a-z0-9-_\.]/gi, '_')}.csv`
                        )
                      }
                      className="ml-3"
                      aria-label={t('export_csv', 'Export CSV')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Mobile format info without Date pill */}
                <div className="md:hidden mt-2 grid grid-cols-1 gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Hàng nghìn:</span>
                    <code className="px-1 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 font-mono">
                      {(currentDataset.thousandsSeparator || ',') === ' '
                        ? '␠'
                        : currentDataset.thousandsSeparator || ','}
                    </code>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Thập phân:</span>
                    <code className="px-1 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 font-mono">
                      {currentDataset.decimalSeparator || '.'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Data table container with virtualization */}
              <div className="overflow-hidden border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700">
                <DatasetViewerTable columns={headerRow} rows={bodyRows} height="60vh" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="mt-0">
            <CorrelationAnalysis headers={correlationData.headers} data={correlationData.data} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DatasetPreviewCard;
