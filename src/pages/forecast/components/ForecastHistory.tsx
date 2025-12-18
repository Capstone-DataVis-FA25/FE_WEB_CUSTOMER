import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  History,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Eye,
  Trash2,
  MoreVertical,
  Database,
} from 'lucide-react';
import { axiosPrivate } from '@/services/axios';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Routers from '@/router/routers';
import { SlideInUp } from '@/theme/animation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';

interface ForecastHistoryItem {
  id: string;
  name?: string | null;
  targetColumn: string;
  forecastWindow: number;
  modelType: string;
  createdAt: string;
  updatedAt: string;
  dataset?: {
    id: string;
    name: string;
  } | null;
}

const ForecastHistory: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  const modalConfirm = useModalConfirm();
  const [forecasts, setForecasts] = useState<ForecastHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchForecasts = async () => {
    try {
      setIsLoading(true);
      const response = await axiosPrivate.get('/forecasts');
      const forecastsData = response.data?.data || response.data || [];
      setForecasts(Array.isArray(forecastsData) ? forecastsData : []);
    } catch (error: any) {
      console.error('Failed to fetch forecasts:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to load forecast history';
      showError('Forecast History Error', errorMessage);
      setForecasts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const handleViewForecast = (forecastId: string) => {
    navigate(Routers.FORECAST_DETAIL.replace(':id', forecastId));
  };

  const handleDeleteForecast = (forecast: ForecastHistoryItem) => {
    setDeletingId(forecast.id);
    modalConfirm.openConfirm(async () => {
      try {
        await axiosPrivate.delete(`/forecasts/${forecast.id}`);
        showSuccess(
          'Forecast Deleted',
          `Forecast "${forecast.name || 'New Forecast'}" has been deleted successfully`
        );
        // Refresh the list
        await fetchForecasts();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to delete forecast';
        showError('Delete Failed', errorMessage);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SlideInUp delay={0.2}>
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Recent Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          </CardContent>
        </Card>
      </SlideInUp>
    );
  }

  if (forecasts.length === 0) {
    return null; // Don't show empty state, just hide the section
  }

  return (
    <>
      <SlideInUp delay={0.2}>
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Recent Forecasts
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchForecasts}
                className="text-gray-600 dark:text-gray-400"
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {forecasts.slice(0, 5).map(forecast => (
                <div
                  key={forecast.id}
                  className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0" onClick={() => handleViewForecast(forecast.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {forecast.name || 'New Forecast'}
                        </h3>
                        {forecast.dataset && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            <Database className="w-3 h-3" />
                            {forecast.dataset.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {forecast.targetColumn}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {forecast.forecastWindow} steps
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(forecast.createdAt)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            handleViewForecast(forecast.id);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteForecast(forecast);
                          }}
                          className="text-red-600 dark:text-red-400"
                          disabled={deletingId === forecast.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === forecast.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            {forecasts.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/forecast')}
                  className="text-sm"
                >
                  View All ({forecasts.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </SlideInUp>
      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        title="Delete Forecast"
        description="Are you sure you want to delete this forecast? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default ForecastHistory;
