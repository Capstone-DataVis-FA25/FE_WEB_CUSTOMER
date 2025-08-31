import { useTranslation } from 'react-i18next';

interface DataTableProps {
  data: string[][];
}

function DataTable({ data }: DataTableProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 italic">{t('dataset_noContentToDisplay')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[700px]">
      <div className="overflow-x-auto max-h-[600px] min-h-[700px]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              {/* Row Number Header */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 w-20">
                #
              </th>
              {data[0].map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {/* Row Number Cell */}
                <td className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 w-20">
                  {rowIndex + 1}
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 1 && (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <span>
            {data.length - 1} rows × {data[0]?.length || 0} columns
          </span>
        </div>
      )}
    </div>
  );
}

export default DataTable;
