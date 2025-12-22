import React, { useState } from 'react';
import { Database, CheckCircle2, Search, Rows, Columns, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Dataset } from '@/features/dataset/datasetAPI';
import Utils from '@/utils/Utils';
import { useTranslation } from 'react-i18next';

interface DatasetSelectorProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelect: (datasetId: string) => void;
  loading?: boolean;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  selectedDatasetId,
  onSelect,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          {t('forecast_step1_no_datasets')}
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          {t('forecast_step1_no_datasets_desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={t('forecast_step1_search_placeholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
        />
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto overflow-x-hidden pr-3 pb-4 px-1 pt-2">
        {filteredDatasets.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast_step1_no_match')}</p>
          </div>
        ) : (
          filteredDatasets.map(dataset => {
            const isSelected = selectedDatasetId === dataset.id;
            return (
              <button
                key={dataset.id}
                type="button"
                onClick={() => onSelect(dataset.id)}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 text-left w-full overflow-visible cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-[1.02] z-10 -mt-1 mb-1'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-600 rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Dataset Icon */}
                <div
                  className={`mb-3 inline-flex p-2 rounded-lg ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>

                {/* Dataset Name */}
                <h3
                  className={`font-semibold text-lg mb-2 truncate ${
                    isSelected
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {dataset.name}
                </h3>

                {/* Dataset Description */}
                {dataset.description && (
                  <p
                    className={`text-sm mb-3 line-clamp-2 ${
                      isSelected
                        ? 'text-blue-700 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {dataset.description}
                  </p>
                )}

                {/* Dataset Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Rows className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t('common_rows')}
                      </span>
                    </div>
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                      {dataset.rowCount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-purple-50 dark:bg-purple-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Columns className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t('common_columns')}
                      </span>
                    </div>
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      {dataset.columnCount || 0}
                    </p>
                  </div>
                </div>

                {/* Updated Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {t('common_updated')} {Utils.getDate(dataset.updatedAt, 18)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Results Count */}
      {searchTerm && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('forecast_step1_found')} {filteredDatasets.length} {t('forecast_step1_datasets_found')}
          {filteredDatasets.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default DatasetSelector;
