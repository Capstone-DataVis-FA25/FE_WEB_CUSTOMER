import React from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/pagination';
import ChartCard from './ChartCard';
import DatasetSelectionDialog from './DatasetSelectionDialog';
import type { Chart as BaseChart } from '@/features/charts/chartTypes';
import type { UsePaginationReturn } from '@/hooks/usePagination';

// Extended Chart type for UI with additional optional fields
type Chart = BaseChart & {
  category?: string;
  isPublic?: boolean;
  views?: number;
  datasetName?: string;
};

interface ChartTabProps {
  charts: Chart[];
  chartsLoading: boolean;
  chartDeleting: boolean;
  datasetSelectingModal: boolean;
  filteredCharts: Chart[];
  allFilteredCharts: Chart[];
  searchTerm: string;
  onCreateChart: (datasetId?: string) => void;
  onHandleOpenModalSelectedDataset: (open: boolean) => void;
  onDeleteChart: (chart: Chart) => void;
  onEditChart: (chartId: string) => void;
  deletingChartId: string | null;
  pagination: UsePaginationReturn;
}

const ChartTab: React.FC<ChartTabProps> = ({
  // charts,
  chartsLoading,
  chartDeleting,
  datasetSelectingModal,
  filteredCharts,
  allFilteredCharts,
  searchTerm,
  onCreateChart,
  onHandleOpenModalSelectedDataset,
  onDeleteChart,
  onEditChart,
  deletingChartId,
  pagination,
}) => {
  // const { t } = useTranslation();

  if (chartsLoading && allFilteredCharts.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSelectDataset = (datasetId: string) => {
    // Handle empty string as "skip dataset selection"
    onCreateChart(datasetId || ''); // Pass empty string if datasetId is falsy
  };

  if (allFilteredCharts.length === 0) {
    return (
      <>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No charts found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first chart to start visualizing your data!'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => onHandleOpenModalSelectedDataset(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Chart
              </Button>
            )}
          </CardContent>
        </Card>

        <DatasetSelectionDialog
          open={datasetSelectingModal}
          onOpenChange={onHandleOpenModalSelectedDataset}
          onSelectDataset={handleSelectDataset}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCharts.map(chart => (
          // Giao diện của 1 chart hiển thị
          <ChartCard
            key={chart.id}
            chart={chart}
            onEdit={onEditChart}
            onDelete={onDeleteChart}
            isDeleting={chartDeleting && deletingChartId === chart.id}
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

export default ChartTab;
