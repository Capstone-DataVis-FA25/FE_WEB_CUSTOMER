import React, { useState } from 'react';
import { Database, Trash2, Plus, Clock, Share, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Routers from '@/router/routers';

import type { Dataset } from '@/features/dataset/datasetAPI';
import Utils from '@/utils/Utils';

interface DatasetCardProps {
  dataset: Dataset;
  onDelete: (dataset: Dataset) => void;
  onView?: (dataset: Dataset) => void;
  onEdit?: (dataset: Dataset) => void;
  isDeleting?: boolean;
}

// Dataset color mapping
const getDatasetColor = () => {
  return 'from-blue-500 to-purple-600';
};

const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  onDelete,
  onView,
  isDeleting = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleView = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click
    }
    if (onView) {
      onView(dataset);
    }
    navigate(Routers.DATASET_DETAIL, {
      state: { datasetId: dataset.id, from: Routers.WORKSPACE_DATASETS },
    });
  };

  const handleCreateChart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Điều hướng sang trang chart gallery kèm dataset_id
    if (dataset.id) {
      navigate(Routers.CHART_GALLERY, {
        state: {
          datasetId: dataset.id,
          datasetName: dataset.name,
        },
      });
    } else {
      navigate(Routers.CHART_GALLERY);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Add share functionality here if needed
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onDelete(dataset);
  };

  return (
    <Card
      className="group relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getDatasetColor()} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${getDatasetColor()} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            <Database className="h-4 w-4" />
          </div>
          <div className="flex flex-col space-y-1 items-end">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Database className="w-3 h-3" />
              Dataset
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors group-hover:text-blue-600">
            {dataset.name}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem] text-gray-700 dark:text-gray-300">
            {dataset.description || 'No description available'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-muted-foreground font-medium">Rows</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">
              {dataset.rowCount?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs text-muted-foreground font-medium">Columns</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              {dataset.columnCount || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            <span className="font-medium">{t('chart_updated', 'Updated')}:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {Utils.getDate(dataset.updatedAt, 18)}
            </span>
          </div>
        </div>

        {/* Đây là button tạo biểu đồ */}
        <div className="flex space-x-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateChart}
            className="flex-1 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-200"
          >
            <Plus className="h-3 w-3" />
            Create Chart
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className={`px-2 transition-all duration-200 ${
              isHovered
                ? 'opacity-100 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'opacity-100 group-hover:opacity-100'
            }`}
          >
            <Edit3 className="h-3 w-3 mr-1" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className={`px-2 transition-all duration-200 ${
              isHovered
                ? 'opacity-100 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                : 'opacity-100 group-hover:opacity-100'
            }`}
          >
            <Share className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-2 transition-all duration-200 disabled:opacity-50 ${
              isHovered
                ? 'opacity-100 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'opacity-100 group-hover:opacity-100'
            }`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetCard;
