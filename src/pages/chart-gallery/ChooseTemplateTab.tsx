import chartTemplatesData from './chartTemplatesData';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/ui/pagination';
import {
  Search,
  Star,
  Grid3X3,
  TrendingUp,
  ArrowRight,
  Info,
  Database,
  HelpCircle,
} from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';
import Routers from '@/router/routers';
import { useDataset } from '@/features/dataset/useDataset';
import type { ChartCategory, ChartTemplate } from '@/types/chart-gallery-types';
import ChartTemplateCard from './ChartTemplateCard';
import { isSupportedChartType } from '@/constants/chart-types';
import DatasetSelectionDialog from '../chart/components/DatasetSelectionDialog';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { chartGallerySteps } from '@/config/driver-steps/index';
import { useAuth } from '@/features/auth/useAuth';

export default function ChooseTemplateTab() {
  const { t } = useTranslation();
  const location = useLocation();
  const { showError, showSuccess } = useToastContext();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Extract data from both location state AND query parameters
  const locationState = location.state as {
    datasetId?: string;
    datasetName?: string;
  } | null;

  // Get datasetId from state first, then fallback to query params
  const datasetIdFromState = locationState?.datasetId;
  const initialDatasetId = datasetIdFromState;
  const initialDatasetName = locationState?.datasetName;

  // Local state to manage current selected dataset
  const [currentDatasetId, setCurrentDatasetId] = useState(initialDatasetId || '');
  const [currentDatasetName, setCurrentDatasetName] = useState(initialDatasetName || '');
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);

  const datasetId = currentDatasetId;

  const { getDatasetById } = useDataset();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ChartCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ChartTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['All']);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  // Function to manually start tour
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: chartGallerySteps,
      popoverClass: 'driverjs-theme',
      overlayOpacity: 0.6,
    });
    driverObj.drive();
  };

  // Handle dataset selection from modal
  const handleSelectDataset = async (selectedDatasetId: string, selectedDatasetName: string) => {
    try {
      setIsLoadingDataset(true);

      // If empty datasetId, clear dataset and continue with sample data
      if (!selectedDatasetId) {
        setCurrentDatasetId('');
        setCurrentDatasetName('');
        if (selectedTemplate) {
          continueWithTemplate(selectedTemplate, '');
        }
        setShowDatasetModal(false);
        setIsLoadingDataset(false);
        return;
      }

      // Update current dataset state
      setCurrentDatasetId(selectedDatasetId);
      setCurrentDatasetName(selectedDatasetName);

      // Also populate global currentDataset so selection persists across pages
      if (selectedDatasetId) {
        try {
          await getDatasetById(selectedDatasetId);
        } catch (e) {}
      }

      if (selectedTemplate) {
        continueWithTemplate(selectedTemplate, selectedDatasetId);
      }

      setShowDatasetModal(false);
      showSuccess(t('dataset_selection_success'));
    } catch (error) {
      console.error('Failed to load dataset:', error);
      showError(t('dataset_selection_error'));
    } finally {
      setIsLoadingDataset(false);
    }
  };

  const continueWithTemplate = (template: ChartTemplate, datasetIdParam?: string) => {
    try {
      if (!isSupportedChartType(template.type)) {
        showError(t('chart_create_error'), t('chart_create_unsupported_type'));
        return;
      }

      const finalDatasetId = datasetIdParam !== undefined ? datasetIdParam : datasetId;

      const params = new URLSearchParams();
      if (finalDatasetId) {
        params.set('datasetId', finalDatasetId);
      }

      navigate(`${Routers.CHART_EDITOR}${finalDatasetId ? `?${params.toString()}` : ''}`, {
        state: {
          type: template.type,
        },
      });
    } catch (error: unknown) {
      console.error('ChooseTemplateTab - Failed to navigate:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(t('chart_create_error'), errorMessage || t('chart_create_error_message'));
    }
  };

  const handleContinueWithTemplate = (template: ChartTemplate) => {
    if (!template) {
      showError(t('chart_create_error'), t('chart_create_missing_data'));
      return;
    }

    continueWithTemplate(template);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const chartTypes = useMemo(
    () => [
      'All',
      'line',
      'bar',
      'area',
      'pie',
      'donut',
      'scatter',
      'map',
      'heatmap',
      'bubble',
      'radar',
      'treemap',
      'sankey',
      'gauge',
      'funnel',
      'waterfall',
    ],
    []
  );

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const loadChartTemplates = async () => {
      try {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setCategories(chartTemplatesData);
      } catch {
        showError(t('chart_gallery_error_loading'));
      } finally {
        setIsLoading(false);
      }
    };

    loadChartTemplates();
  }, [t, showError]);

  useEffect(() => {
    if (isAuthenticated && user?.id && categories.length > 0 && !isLoading) {
      const storageKey = `hasShownChartGalleryTour_${user.id}`;
      const hasShownTour = localStorage.getItem(storageKey);

      if (hasShownTour !== 'true') {
        const driverObj = driver({
          showProgress: true,
          steps: chartGallerySteps,
          popoverClass: 'driverjs-theme',
          overlayOpacity: 0.2,
        });

        setTimeout(() => {
          driverObj.drive();
          localStorage.setItem(storageKey, 'true');
        }, 1000);
      }
    }
  }, [isAuthenticated, user, categories.length, isLoading]);

  // Calculate chart counts for filters
  const allTemplates = useMemo(() => {
    return categories.reduce((acc, category) => {
      if (category.id === 'All') return acc;
      return [...acc, ...category.templates];
    }, [] as ChartTemplate[]);
  }, [categories]);

  const chartTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chartTypes.forEach(type => {
      if (type === 'All') return;
      counts[type] = allTemplates.filter(template => template.type === type).length;
    });
    return counts;
  }, [allTemplates, chartTypes]);

  // Filter templates based on selected criteria
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesType = selectedTypes.includes('All') || selectedTypes.includes(template.type);
    const matchesFeatured = !showFeatured || template.featured === true;

    return matchesSearch && matchesCategory && matchesType && matchesFeatured;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Fixed width, clean design */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Dataset Section */}
        <div id="dataset-section" className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t('chart_card_dataset')}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDatasetModal(true)}
              disabled={isLoadingDataset}
              className="text-xs"
            >
              {isLoadingDataset
                ? t('dataset_loading')
                : datasetId
                  ? t('dataset_changeData')
                  : t('chart_gallery_select')}
            </Button>
          </div>

          {datasetId ? (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-accent/10 dark:bg-accent/20 p-2 rounded mt-2">
              <div className="font-medium text-accent dark:text-accent-foreground">
                {t('dataset_name_label')} {currentDatasetName || t('dataset_selected')}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-600 dark:text-gray-300 bg-accent/10 dark:bg-accent/20 p-2 rounded mt-2">
              {t('chart_gallery_no_dataset_selected')}
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search-templates"
              type="text"
              placeholder={t('chart_gallery_search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Start Tour Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            onClick={startTour}
            variant="outline"
            className="w-full justify-start gap-2 border-accent/30 hover:border-accent hover:bg-accent/10 dark:hover:bg-accent/20 text-accent dark:text-accent-foreground"
          >
            <HelpCircle className="w-4 h-4" />
            {t('chart_list_start_tour')}
          </Button>
        </div>

        {/* Filters Section */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Featured Filter */}
            <div id="featured-filter" className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('chart_gallery_featured')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={showFeatured}
                  onCheckedChange={checked => setShowFeatured(checked as boolean)}
                />
                <label htmlFor="featured" className="text-sm text-gray-600 dark:text-gray-300">
                  {t('chart_gallery_show_featured_only')}
                </label>
              </div>
            </div>

            <Separator />

            {/* Category Filter */}
            <div id="category-filter" className="space-y-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('chart_gallery_category')}
                </span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('chart_gallery_select_category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate">{category.name}</span>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {category.id === 'All' ? allTemplates.length : category.templates.length}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Chart Type Filter */}
            <div id="type-filter" className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('chart_gallery_type')}
                </span>
              </div>
              <Select
                value={selectedTypes[0] || 'All'}
                onValueChange={value => setSelectedTypes([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('chart_gallery_select_type')} />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="capitalize truncate">
                          {type === 'All' ? t('chart_gallery_category_all') : type}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {type === 'All' ? allTemplates.length : chartTypeCounts[type] || 0}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Content - Templates Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('chart_gallery_chart_templates')}
              </h2>
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && (
              <div className="relative">
                <div
                  className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onMouseEnter={() => setShowTemplateModal(true)}
                  onMouseLeave={() => setShowTemplateModal(false)}
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-accent dark:text-accent-foreground truncate">
                      {selectedTemplate.name}
                    </p>
                    <p className="text-xs text-accent/80 dark:text-accent-foreground/80 capitalize">
                      {selectedTemplate.type} • {selectedTemplate.category}
                    </p>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      if (selectedTemplate) {
                        handleContinueWithTemplate(selectedTemplate);
                      }
                    }}
                  >
                    <span className="text-xs">{t('chart_gallery_continue')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTemplate(null)}
                    className="text-accent hover:text-accent/80 dark:text-accent-foreground dark:hover:text-accent-foreground/80 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Template Info Modal */}
                <AnimatePresence>
                  {showTemplateModal && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
                      onMouseEnter={() => setShowTemplateModal(true)}
                      onMouseLeave={() => setShowTemplateModal(false)}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {selectedTemplate.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {selectedTemplate.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {selectedTemplate.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {selectedTemplate.description}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {t('chart_gallery_features')}
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {t('chart_gallery_responsive')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {t('chart_gallery_interactive')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {t('chart_gallery_customizable')}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 flex items-center gap-2"
                            onClick={() => {
                              if (selectedTemplate) {
                                setShowTemplateModal(false);
                                handleContinueWithTemplate(selectedTemplate);
                              }
                            }}
                          >
                            <span>{t('chart_gallery_continue')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowTemplateModal(false)}
                          >
                            {t('chart_gallery_close')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto">
          <div id="templates-grid" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedTemplates.map(template => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <ChartTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={isSelected}
                    onClick={() => setSelectedTemplate(template)}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {filteredTemplates.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTemplates.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  showInfo={true}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Selection Modal */}
      <DatasetSelectionDialog
        open={showDatasetModal}
        onOpenChange={setShowDatasetModal}
        onSelectDataset={handleSelectDataset}
        currentDatasetId={currentDatasetId}
      />
    </div>
  );
}
