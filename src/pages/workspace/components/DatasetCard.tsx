import React, { useState } from 'react';
import { Database, Calendar, Eye, Edit, Trash2, Plus } from 'lucide-react';
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
  isDeleting?: boolean;
}

// Get category color based on dataset category
const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'Sales':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Finance':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'Analytics':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Marketing':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
};

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'today';
  } else if (diffDays === 2) {
    return 'a day ago';
  } else if (diffDays <= 30) {
    return `${diffDays} days ago`;
  } else if (diffDays <= 60) {
    return 'a month ago';
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} months ago`;
  }
};

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onDelete, isDeleting = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleView = () => {
    navigate(Routers.DATASET_DETAIL, {
      state: { datasetId: dataset.id, from: Routers.WORKSPACE_DATASETS },
    });
  };

  const handleEdit = () => {
    navigate(Routers.EDIT_DATASET, {
      state: { datasetId: dataset.id, from: Routers.WORKSPACE_DATASETS },
    });
  };

  const handleCreateChart = () => {
    // Điều hướng sang trang chart gallery kèm dataset_id
    if (dataset.id) {
      navigate(Routers.CHART_GALLERY, {
        state: {
          datasetId: dataset.id,
        },
      });
    } else {
      navigate(Routers.CHART_GALLERY);
    }
  };

  return (
    <Card
      className="group relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1 hover:scale-[1.02] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col space-y-1 items-end">
            <Badge
              variant="outline"
              className="text-xs font-medium border-gray-200 dark:border-gray-700"
            >
              CSV
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 group-hover:text-blue-600">
            {dataset.name}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem]">
            {dataset.description || 'No description available'}
          </CardDescription>
        </div>

        {/* Action buttons - positioned in header for better UX */}
        <div
          className={`flex space-x-1 transition-all duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(dataset)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
            <Calendar className="h-3 w-3 text-blue-500" />
            <span className="font-medium">{t('chart_updated', 'Updated')}:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {Utils.getDate(dataset.updatedAt, 18)}
            </span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateChart}
            className="flex-1 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Create Chart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetCard;
