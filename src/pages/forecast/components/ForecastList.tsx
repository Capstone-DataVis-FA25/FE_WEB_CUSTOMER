import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  // Calendar,
  Target,
  Clock,
  Trash2,
  Database,
  Plus,
  Filter,
  X,
  Search,
  RefreshCw,
  Layers,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { axiosPrivate } from '@/services/axios';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Routers from '@/router/routers';
import { SlideInUp } from '@/theme/animation';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDataset } from '@/features/dataset/useDataset';
import Pagination from '@/components/ui/pagination';
import { getForecastWindowOptions } from '../utils/forecastWindowOptions';

interface ForecastListItem {
  id: string;
  name?: string | null;
  targetColumn: string;
  featureColumns?: string[] | null;
  forecastWindow: number;
  modelType: string;
  createdAt: string;
  updatedAt: string;
  dataset?: {
    id: string;
    name: string;
  } | null;
}

interface ForecastListProps {
  onCreateNew: () => void;
}

const ForecastList: React.FC<ForecastListProps> = ({ onCreateNew }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  const modalConfirm = useModalConfirm();
  const { datasets } = useDataset();
  const [forecasts, setForecasts] = useState<ForecastListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [selectedModelType, setSelectedModelType] = useState<string>('all');
  const [selectedForecastWindow, setSelectedForecastWindow] = useState<string>('all');
  const [isCustomForecastWindow, setIsCustomForecastWindow] = useState(false);
  const [customForecastWindow, setCustomForecastWindow] = useState<string>('5');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; right: number } | null>(
    null
  );
  const [showAllFeatures, setShowAllFeatures] = useState<string | null>(null); // forecastId for which to show modal

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchForecasts = async (showToast = false) => {
    try {
      if (showToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const response = await axiosPrivate.get('/forecasts');
      const forecastsData = response.data?.data || response.data || [];
      setForecasts(Array.isArray(forecastsData) ? forecastsData : []);
    } catch (error: any) {
      console.error('Failed to fetch forecasts:', error);
      const errorMessage =
        error.response?.data?.message || error.message || t('forecast_list_error_load');
      showError(t('forecast_list_error'), errorMessage);
      setForecasts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  // Calculate popover position when filters are shown
  useEffect(() => {
    if (showFilters && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showFilters]);

  // All available model types
  const allModelTypes = ['LSTM', 'SVR'];

  // Get forecast window options (no dependency on time scale anymore)
  const forecastWindowOptionsForTimeScale = useMemo(() => {
    const optionsMap = new Map<string, string>(); // value -> label
    const allOptions: Array<{ value: string; label: string }> = [];

    // Base options from utility (values only; build labels with t() for i18n)
    const baseOptions = getForecastWindowOptions('Daily');
    baseOptions.forEach(opt => {
      if (!optionsMap.has(opt.value)) {
        const label = `${opt.value} ${t('forecast_step2_forecast_window_steps')}`;
        optionsMap.set(opt.value, label);
        allOptions.push({ value: opt.value, label });
      }
    });

    // Also include any unique values from existing forecasts
    forecasts.forEach(f => {
      const valueStr = f.forecastWindow.toString();
      if (!optionsMap.has(valueStr)) {
        const label = `${f.forecastWindow} ${t('forecast_step2_forecast_window_steps')}`;
        allOptions.push({ value: valueStr, label });
        optionsMap.set(valueStr, label);
      }
    });

    return allOptions.sort((a, b) => parseInt(a.value) - parseInt(b.value));
  }, [forecasts, t]);

  // Get unique values from existing forecasts (for reference)

  // Prepare options for SelectValue components
  const datasetOptions = useMemo(() => {
    return [
      { value: 'all', label: t('forecast_list_all_datasets') },
      ...datasets.map(dataset => ({ value: dataset.id, label: dataset.name })),
    ];
  }, [datasets, t]);

  const modelTypeOptions = useMemo(() => {
    return [
      { value: 'all', label: t('forecast_list_all_models') },
      ...allModelTypes.map(m => ({ value: m, label: m })),
    ];
  }, [t]);

  const forecastWindowOptions = useMemo(() => {
    return [
      { value: 'all', label: t('forecast_list_all_steps') },
      ...forecastWindowOptionsForTimeScale,
    ];
  }, [forecastWindowOptionsForTimeScale, t]);

  // Reset forecast window when preset options change (if current selection is not valid)
  useEffect(() => {
    if (selectedForecastWindow !== 'all' && !isCustomForecastWindow) {
      const validValues = forecastWindowOptionsForTimeScale.map(opt => opt.value);
      if (!validValues.includes(selectedForecastWindow)) {
        setSelectedForecastWindow('all');
      }
    }
  }, [forecastWindowOptionsForTimeScale, selectedForecastWindow, isCustomForecastWindow]);

  // Filter forecasts
  const filteredForecasts = useMemo(() => {
    return forecasts.filter(forecast => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        (forecast.name || 'New Forecast').toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecast.targetColumn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecast.dataset?.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Dataset filter
      const matchesDataset = selectedDataset === 'all' || forecast.dataset?.id === selectedDataset;

      // Model type filter
      const matchesModelType =
        selectedModelType === 'all' || forecast.modelType === selectedModelType;

      // Forecast window filter
      const matchesForecastWindow =
        selectedForecastWindow === 'all' ||
        (isCustomForecastWindow
          ? forecast.forecastWindow.toString() === customForecastWindow
          : forecast.forecastWindow.toString() === selectedForecastWindow);

      // Date filter
      const matchesDate = (() => {
        if (!dateFrom && !dateTo) return true;
        const forecastDate = new Date(forecast.createdAt);
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // Include the entire end date
          return forecastDate >= fromDate && forecastDate <= toDate;
        }
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          return forecastDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          return forecastDate <= toDate;
        }
        return true;
      })();

      return (
        matchesSearch && matchesDataset && matchesModelType && matchesForecastWindow && matchesDate
      );
    });
  }, [
    forecasts,
    searchTerm,
    selectedDataset,
    selectedModelType,
    selectedForecastWindow,
    isCustomForecastWindow,
    customForecastWindow,
    dateFrom,
    dateTo,
  ]);

  // Paginate filtered forecasts
  const paginatedForecasts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredForecasts.slice(startIndex, endIndex);
  }, [filteredForecasts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredForecasts.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedDataset,
    selectedModelType,
    selectedForecastWindow,
    isCustomForecastWindow,
    dateFrom,
    dateTo,
  ]);

  const handleViewForecast = (forecastId: string) => {
    navigate(Routers.FORECAST_DETAIL.replace(':id', forecastId));
  };

  const handleDeleteForecast = (forecast: ForecastListItem) => {
    setDeletingId(forecast.id);
    modalConfirm.openConfirm(async () => {
      try {
        await axiosPrivate.delete(`/forecasts/${forecast.id}`);
        showSuccess(
          t('forecast_list_delete_title'),
          `${t('forecast_creation_default_name')} "${forecast.name || t('forecast_creation_default_name')}" ${t('forecast_list_delete_desc')}`
        );

        // Remove the forecast from the list locally instead of refetching
        setForecasts(prev => prev.filter(f => f.id !== forecast.id));

        // Check if we need to adjust pagination
        const currentFilteredCount = filteredForecasts.length;
        const newFilteredCount = currentFilteredCount - 1;
        const newTotalPages = Math.ceil(newFilteredCount / itemsPerPage);

        // If current page becomes empty and we're not on page 1, go to previous page
        if (newTotalPages > 0 && currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || t('forecast_detail_delete_error');
        showError(t('forecast_list_delete_failed'), errorMessage);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDataset('all');
    setSelectedModelType('all');
    setSelectedForecastWindow('all');
    setIsCustomForecastWindow(false);
    setCustomForecastWindow('5');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedDataset !== 'all' ||
    selectedModelType !== 'all' ||
    selectedForecastWindow !== 'all' ||
    isCustomForecastWindow ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <>
      <SlideInUp delay={0.1}>
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('forecast_list_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('forecast_list_subtitle')} ({filteredForecasts.length})
            </p>
          </div>
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('forecast_list_create_new')}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('forecast_list_search_placeholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Refresh Button */}
              <Button
                onClick={() => fetchForecasts(true)}
                variant="outline"
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('forecast_list_refresh')}
              </Button>

              {/* Filter Button and Popover */}
              <div className="relative" ref={filterButtonRef}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  {t('forecast_list_filters')}
                  {hasActiveFilters && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      {[
                        selectedDataset !== 'all' ? 1 : 0,
                        // selectedTimeScale !== 'all' ? 1 : 0,
                        selectedForecastWindow !== 'all' || isCustomForecastWindow ? 1 : 0,
                        dateFrom !== '' || dateTo !== '' ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </Button>
              </div>

              {/* Filter Popover - Rendered via Portal */}
              {showFilters &&
                popoverPosition &&
                ReactDOM.createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[9998] bg-black/20 dark:bg-black/40 animate-in fade-in-0 duration-200"
                      onClick={() => setShowFilters(false)}
                    />
                    <div
                      className="fixed w-80 z-[9999] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
                      style={{
                        top: `${popoverPosition.top}px`,
                        right: `${popoverPosition.right}px`,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {t('forecast_list_advanced_filters')}
                          </h3>
                          {hasActiveFilters && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={resetFilters}
                              className="h-7 text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              {t('forecast_list_clear')}
                            </Button>
                          )}
                        </div>

                        {/* Dataset Filter */}
                        <div>
                          <Label className="mb-2 block text-sm">
                            {t('forecast_list_table_dataset')}
                          </Label>
                          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('forecast_list_all_datasets')}
                                options={datasetOptions}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t('forecast_list_all_datasets')}</SelectItem>
                              {datasets.map(dataset => (
                                <SelectItem key={dataset.id} value={dataset.id}>
                                  {dataset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Model Type and Forecast Window in Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Model Type Filter */}
                          <div>
                            <Label className="mb-2 block text-sm">
                              {t('forecast_detail_model_type')}
                            </Label>
                            <Select value={selectedModelType} onValueChange={setSelectedModelType}>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('forecast_list_all_models')}
                                  options={modelTypeOptions}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('forecast_list_all_models')}</SelectItem>
                                {allModelTypes.map(m => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Forecast Window Filter */}
                          <div>
                            <Label className="mb-2 block text-sm">
                              {t('forecast_step2_forecast_window')}
                            </Label>
                            {isCustomForecastWindow ? (
                              <div className="space-y-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={customForecastWindow}
                                  onChange={e => {
                                    setCustomForecastWindow(e.target.value);
                                    setSelectedForecastWindow(e.target.value);
                                  }}
                                  className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-200 dark:focus:border-blue-800"
                                  placeholder={t('forecast_list_custom_placeholder')}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIsCustomForecastWindow(false);
                                    setSelectedForecastWindow('all');
                                  }}
                                  className="w-full text-xs"
                                >
                                  {t('forecast_list_use_preset')}
                                </Button>
                              </div>
                            ) : (
                              <Select
                                value={selectedForecastWindow}
                                onValueChange={value => {
                                  if (value === 'custom') {
                                    setIsCustomForecastWindow(true);
                                  } else {
                                    setSelectedForecastWindow(value);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t('forecast_list_all_steps')}
                                    options={[
                                      ...forecastWindowOptions,
                                      {
                                        value: 'custom',
                                        label: `${t('forecast_step2_forecast_window_custom')} (${customForecastWindow})`,
                                      },
                                    ]}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    {t('forecast_list_all_steps')}
                                  </SelectItem>
                                  {forecastWindowOptionsForTimeScale.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="custom">
                                    {t('forecast_list_custom')}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                          <Label className="mb-2 block text-sm">
                            {t('forecast_list_date_range')}
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                                {t('forecast_list_from')}
                              </Label>
                              <Input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                                {t('forecast_list_to')}
                              </Label>
                              <Input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full"
                                min={dateFrom || undefined}
                              />
                            </div>
                          </div>
                          {(dateFrom || dateTo) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDateFrom('');
                                setDateTo('');
                              }}
                              className="mt-2 h-7 text-xs text-gray-600 dark:text-gray-400"
                            >
                              {t('forecast_list_clear_dates')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
            </div>
          </CardContent>
        </Card>

        {/* Forecasts Table */}
        {isLoading || isRefreshing ? (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LoadingSpinner
                  title={isRefreshing ? t('forecast_list_refreshing') : t('forecast_list_loading')}
                  subtitle={t('forecast_list_please_wait')}
                />
              </div>
            </CardContent>
          </Card>
        ) : filteredForecasts.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {hasActiveFilters ? t('forecast_list_no_match') : t('forecast_list_no_forecasts')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  {hasActiveFilters
                    ? t('forecast_list_no_match_desc')
                    : t('forecast_list_no_forecasts_desc')}
                </p>
                {hasActiveFilters ? (
                  <Button onClick={resetFilters} variant="outline">
                    {t('forecast_list_clear_filters')}
                  </Button>
                ) : (
                  <Button onClick={onCreateNew} size="lg" className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t('forecast_list_create_first')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">
                      {t('forecast_list_table_name')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">
                      {t('forecast_list_table_dataset')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[16%]">
                      {t('forecast_list_table_target')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">
                      {t('forecast_list_table_features')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[7%]">
                      {t('forecast_list_table_time_scale')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[5%]">
                      {t('forecast_list_table_steps')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">
                      {t('forecast_list_table_created')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedForecasts.map(forecast => (
                    <tr
                      key={forecast.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewForecast(forecast.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {forecast.name || t('forecast_creation_default_name')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {forecast.dataset ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Database className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate" title={forecast.dataset.name}>
                              {forecast.dataset.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate" title={forecast.targetColumn}>
                            {forecast.targetColumn}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {forecast.featureColumns && forecast.featureColumns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {forecast.featureColumns.slice(0, 2).map((col, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 truncate max-w-[120px]"
                                  title={col}
                                >
                                  {col}
                                </span>
                              ))}
                              {forecast.featureColumns.length > 2 && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setShowAllFeatures(forecast.id);
                                  }}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                                  title={`${t('forecast_list_table_view_all')} ${forecast.featureColumns.length} ${t('forecast_list_table_feature_columns')}`}
                                >
                                  +{forecast.featureColumns.length - 2}{' '}
                                  {t('forecast_list_table_more')}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                          <Cpu className="w-3 h-3" />
                          {forecast.modelType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {forecast.forecastWindow}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(forecast.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteForecast(forecast);
                          }}
                          disabled={deletingId === forecast.id}
                          title="Delete forecast"
                        >
                          {deletingId === forecast.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredForecasts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </SlideInUp>

      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        title={t('forecast_detail_delete')}
        message={t('forecast_detail_delete_confirm')}
        confirmText={t('forecast_detail_delete')}
        cancelText={t('common_cancel')}
        type="danger"
        loading={modalConfirm.isLoading}
      />

      {/* View All Features Modal */}
      {showAllFeatures &&
        (() => {
          const forecast = forecasts.find(f => f.id === showAllFeatures);
          const featureColumns = forecast?.featureColumns || [];
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAllFeatures(null)}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    {t('forecast_detail_feature_columns')} ({featureColumns.length})
                  </h3>
                  <button
                    onClick={() => setShowAllFeatures(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <div className="space-y-2">
                    {featureColumns.map((col, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-900 dark:text-white break-words">
                          {col}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => setShowAllFeatures(null)}
                    variant="outline"
                    className="w-full cursor-pointer"
                  >
                    {t('common_close')}
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
};

export default ForecastList;
