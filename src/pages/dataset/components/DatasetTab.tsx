import React from 'react';
import { Plus, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/pagination';
import DatasetCard from './DatasetCard';
import type { Dataset } from '@/features/dataset/datasetAPI';
import type { UsePaginationReturn } from '@/hooks/usePagination';

interface DatasetTabProps {
  loading: boolean;
  deleting: boolean;
  filteredDatasets: Dataset[];
  allFilteredDatasets: Dataset[];
  searchTerm: string;
  onCreateDataset: () => void;
  onDeleteDataset: (dataset: Dataset) => void;
  deletingId: string | null;
  pagination: UsePaginationReturn;
}

const DatasetTab: React.FC<DatasetTabProps> = ({
  loading,
  deleting,
  filteredDatasets,
  allFilteredDatasets,
  searchTerm,
  onCreateDataset,
  onDeleteDataset,
  deletingId,
  pagination,
}) => {
  const { t } = useTranslation();

  if (loading && allFilteredDatasets.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  // Hiển thị giao diện rỗng nếu không có dataset sau filter
  if (filteredDatasets.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Database className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {searchTerm || allFilteredDatasets.length > 0
              ? t('dataset_not_found')
              : t('dataset_not_yet')}
          </h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {searchTerm || allFilteredDatasets.length > 0
              ? t('dataset_search')
              : t('dataset_create')}
          </p>
          {!searchTerm && allFilteredDatasets.length === 0 && (
            <Button
              onClick={onCreateDataset}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('tour_dataset_create_title')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDatasets.map((dataset, index) => (
          <DatasetCard
            key={dataset.id}
            index={index}
            dataset={dataset}
            onDelete={onDeleteDataset}
            isDeleting={deleting && deletingId === dataset.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.pagination.currentPage}
            totalPages={pagination.pagination.totalPages}
            totalItems={pagination.pagination.totalItems}
            itemsPerPage={pagination.pagination.pageSize}
            onPageChange={pagination.setPage}
            showInfo={true}
            size="md"
          />
        </div>
      )}
    </div>
  );
};

export default DatasetTab;
