import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Search, Star, Filter, Grid3X3, TrendingUp, Eye, ArrowRight, Info } from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';
import Routers from '@/router/routers';
import type { ChartCategory, ChartTemplate } from '@/types/chart-gallery-types';
import { useCharts } from '@/features/charts';

export default function ChooseTemplateTab() {
  const { t } = useTranslation();
  const location = useLocation();
  const { showError, showSuccess } = useToastContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createChart } = useCharts();

  // Extract data from both location state AND query parameters
  const locationState = location.state as {
    datasetId?: string;
    datasetName?: string;
    chartType?: string;
  } | null;

  // Get datasetId from state first, then fallback to query params
  const datasetIdFromState = locationState?.datasetId;
  const datasetIdFromQuery = searchParams.get('datasetId');
  const datasetId = datasetIdFromState || datasetIdFromQuery;
  const datasetName = locationState?.datasetName;
  // const preselectedChartType = locationState?.chartType; // reserved for future use

  console.log('ChooseTemplateTab - datasetIdFromState:', datasetIdFromState);
  console.log('ChooseTemplateTab - datasetIdFromQuery:', datasetIdFromQuery);
  console.log('ChooseTemplateTab - Final datasetId:', datasetId);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChart, setIsCreatingChart] = useState(false);
  const [categories, setCategories] = useState<ChartCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ChartTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['All']);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(['All']);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false); // Function to get default chart configuration based on template
  const getDefaultChartConfig = (template: ChartTemplate) => {
    const baseConfig = {
      config: {
        title: `${template.name} - ${datasetName || 'Chart'}`,
        width: 800,
        height: 400,
        margin: {
          top: 20,
          left: 80,
          right: 40,
          bottom: 60,
        },

        // Axis configuration
        xAxisKey: '',
        yAxisKeys: [],
        yAxisLabels: [],
        disabledLines: [],
        xAxisLabel: 'xAxisLabel',
        yAxisLabel: 'yAxisLabel',

        // Animation settings
        animationDuration: 1000,

        // Display settings
        showLegend: true,
        showGrid: true,
        showPoints: true,
        showPointValues: true,
        showValues: false,
        showTooltip: true,
        enableZoom: false,
        enablePan: false,
        showAxisLabels: true,
        showAxisTicks: true,

        // Chart-type specific settings
        lineType: 'basic' as const,
        curveType: 'curveMonotoneX' as const,
        curve: 'curveMonotoneX',
        strokeWidth: 2,
        lineWidth: 2,
        pointRadius: 4,

        // Axis formatting
        xAxisRotation: 0,
        yAxisRotation: 0,
        xAxisFormatterType: 'auto' as const,
        yAxisFormatterType: 'number' as const,

        // Colors & Theme
        theme: 'dark',
        backgroundColor: '#18181b',
        gridColor: '#e0e0e0',
        gridOpacity: 0.3,
        textColor: '#f3f4f6',
        colorPalette: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'],

        // Text & Font settings
        titleFontSize: 18,
        titleFontFamily: 'Arial, sans-serif',
        axisLabelFontSize: 12,
        labelFontSize: 12,
        axisLabelFontFamily: 'Arial, sans-serif',
        legendFontSize: 12,
        legendFontFamily: 'Arial, sans-serif',

        // Legend positioning
        legendPosition: 'bottom' as const,
        legendAlignment: 'center' as const,
        legendSize: 150,

        // Border & Visual effects
        borderWidth: 0,
        borderColor: '#23232a',
        shadowEffect: false,

        // Axis range & scale settings
        xAxisMin: null,
        xAxisMax: null,
        yAxisMin: null,
        yAxisMax: null,
        xAxisStart: 'auto',
        yAxisStart: 'auto',
        xAxisTickInterval: undefined,
        yAxisTickInterval: undefined,
        xAxisScale: 'linear' as const,
        yAxisScale: 'linear' as const,

        // Padding & Spacing
        titlePadding: 20,
        legendPadding: 15,
        axisPadding: 10,

        // Zoom & pan
        zoomLevel: 1,
        zoomExtent: 8,
      },
      formatters: {
        useYFormatter: true,
        useXFormatter: true,
        yFormatterType: 'number',
        xFormatterType: 'number',
        customYFormatter: '',
        customXFormatter: '',
      },
      seriesConfigs: [],
    };

    // Type-specific configurations - merge into config object
    switch (template.type) {
      case 'line':
        return {
          ...baseConfig,
          config: {
            ...baseConfig.config,
            lineType: 'basic' as const,
            showPoints: true,
            showPointValues: false,
            curveType: 'curveMonotoneX' as const,
            strokeWidth: 2,
          },
        };
      case 'bar':
        return {
          ...baseConfig,
          config: {
            ...baseConfig.config,
            barType: 'grouped' as const,
            barWidth: 0.8,
            barGap: 0.2,
            showValues: true,
          },
        };
      case 'area':
        return {
          ...baseConfig,
          config: {
            ...baseConfig.config,
            areaType: 'basic' as const,
            showPoints: false,
            showPointValues: false,
            curveType: 'curveMonotoneX' as const,
            fillOpacity: 0.6,
            strokeWidth: 2,
          },
        };
      default:
        return baseConfig;
    }
  };

  // Navigation function for continuing with selected template - now creates chart first
  const handleContinueWithTemplate = async (template: ChartTemplate) => {
    if (!template || !datasetId) {
      showError(
        t('chart_create_error', 'Error'),
        t('chart_create_missing_data', 'Missing template or dataset')
      );
      return;
    }

    setIsCreatingChart(true);

    try {
      console.log('ChooseTemplateTab - Creating chart with template:', template);

      // Get default configuration for this template
      const defaultConfig = getDefaultChartConfig(template);
      // Only allow chart types supported by CreateChartRequest
      if (!['line', 'bar', 'area'].includes(template.type)) {
        showError(
          t('chart_create_error', 'Error'),
          t('chart_create_unsupported_type', 'This chart type is not supported for creation.')
        );
        setIsCreatingChart(false);
        return;
      }

      // Create chart with default settings - only include ChartConfig properties
      const chartData = {
        name: defaultConfig.config.title,
        description: `A ${template.name} chart created from template`,
        datasetId: datasetId,
        type: template.type as 'line' | 'bar' | 'area',
        config: defaultConfig,
      };
      const result = await createChart(chartData).unwrap();
      console.log('ChooseTemplateTab - Chart created successfully:', result);
      showSuccess(
        t('chart_create_success', 'Chart Created'),
        t('chart_create_success_message', 'Chart has been created successfully')
      );

      // Navigate to chart editor with the new chart ID
      navigate(`${Routers.CHART_EDITOR}?chartId=${result.id}&datasetId=${datasetId}`, {
        state: {
          chartId: result.id,
          datasetId: datasetId,
          type: result.type,
          chart: result,
        },
      });
    } catch (error: unknown) {
      console.error('ChooseTemplateTab - Failed to create chart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(
        t('chart_create_error', 'Create Chart Failed'),
        errorMessage || t('chart_create_error_message', 'Failed to create chart')
      );
    } finally {
      setIsCreatingChart(false);
    }
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
      'column',
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

  const purposes = useMemo(
    () => ['All', 'comparison', 'distribution', 'change-over-time', 'correlation', 'geographical'],
    []
  );

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const loadChartTemplates = async () => {
      try {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCategories: ChartCategory[] = [
          {
            id: 'All',
            name: t('chart_gallery_category_all'),
            templates: [],
          },
          {
            id: 'basic',
            name: t('chart_gallery_category_basic'),
            templates: [
              {
                id: 'line-basic',
                name: t('chart_gallery_line_basic'),
                description: t('chart_gallery_line_basic_desc'),
                type: 'line',
                category: 'basic',
                configuration: { type: 'line' },
              },
              {
                id: 'bar-basic',
                name: t('chart_gallery_bar_basic'),
                description: t('chart_gallery_bar_basic_desc'),
                type: 'bar',
                category: 'basic',
                configuration: { type: 'bar' },
              },
              {
                id: 'area-basic',
                name: t('chart_gallery_area_basic'),
                description: t('chart_gallery_area_basic_desc'),
                type: 'area',
                category: 'basic',
                configuration: { type: 'area' },
              },
              {
                id: 'pie-basic',
                name: t('chart_gallery_pie_basic'),
                description: t('chart_gallery_pie_basic_desc'),
                type: 'pie',
                category: 'basic',
                configuration: { type: 'pie' },
              },
              {
                id: 'donut-basic',
                name: t('chart_gallery_donut_basic'),
                description: t('chart_gallery_donut_basic_desc'),
                type: 'donut',
                category: 'basic',
                configuration: { type: 'donut' },
              },
              {
                id: 'column-basic',
                name: t('chart_gallery_column_basic'),
                description: t('chart_gallery_column_basic_desc'),
                type: 'column',
                category: 'basic',
                configuration: { type: 'column' },
              },
            ],
          },
          {
            id: 'advanced',
            name: t('chart_gallery_category_advanced'),
            templates: [
              {
                id: 'scatter-advanced',
                name: t('chart_gallery_scatter_advanced'),
                description: t('chart_gallery_scatter_advanced_desc'),
                type: 'scatter',
                category: 'advanced',
                configuration: { type: 'scatter' },
              },
              {
                id: 'heatmap-advanced',
                name: t('chart_gallery_heatmap_specialized'),
                description: t('chart_gallery_heatmap_specialized_desc'),
                type: 'heatmap',
                category: 'advanced',
                configuration: { type: 'heatmap' },
              },
              {
                id: 'radar-advanced',
                name: t('chart_gallery_radar_advanced'),
                description: t('chart_gallery_radar_advanced_desc'),
                type: 'radar',
                category: 'advanced',
                configuration: { type: 'radar' },
              },
              {
                id: 'bubble-advanced',
                name: t('chart_gallery_bubble_advanced'),
                description: t('chart_gallery_bubble_advanced_desc'),
                type: 'bubble',
                category: 'advanced',
                configuration: { type: 'bubble' },
              },
              {
                id: 'treemap-advanced',
                name: t('chart_gallery_treemap_advanced'),
                description: t('chart_gallery_treemap_advanced_desc'),
                type: 'treemap',
                category: 'advanced',
                configuration: { type: 'treemap' },
              },
            ],
          },
          {
            id: 'specialized',
            name: t('chart_gallery_category_specialized'),
            templates: [
              {
                id: 'map-specialized',
                name: t('chart_gallery_map_specialized'),
                description: t('chart_gallery_map_specialized_desc'),
                type: 'map',
                category: 'specialized',
                configuration: { type: 'map' },
              },
              {
                id: 'sankey-specialized',
                name: t('chart_gallery_sankey_advanced'),
                description: t('chart_gallery_sankey_advanced_desc'),
                type: 'sankey',
                category: 'specialized',
                configuration: { type: 'sankey' },
              },
              {
                id: 'gauge-specialized',
                name: t('chart_gallery_gauge_specialized'),
                description: t('chart_gallery_gauge_specialized_desc'),
                type: 'gauge',
                category: 'specialized',
                configuration: { type: 'gauge' },
              },
              {
                id: 'funnel-specialized',
                name: t('chart_gallery_funnel_specialized'),
                description: t('chart_gallery_funnel_specialized_desc'),
                type: 'funnel',
                category: 'specialized',
                configuration: { type: 'funnel' },
              },
              {
                id: 'waterfall-specialized',
                name: t('chart_gallery_waterfall_specialized'),
                description: t('chart_gallery_waterfall_specialized_desc'),
                type: 'waterfall',
                category: 'specialized',
                configuration: { type: 'waterfall' },
              },
            ],
          },
        ];

        setCategories(mockCategories);
      } catch {
        showError(t('chart_gallery_error_loading'));
      } finally {
        setIsLoading(false);
      }
    };

    loadChartTemplates();
  }, [t, showError]);

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

  const purposeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    purposes.forEach(purpose => {
      if (purpose === 'All') return;
      counts[purpose] = allTemplates.filter(
        template => template.configuration?.purpose === purpose
      ).length;
    });
    return counts;
  }, [allTemplates, purposes]);

  // Filter templates based on selected criteria
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesType = selectedTypes.includes('All') || selectedTypes.includes(template.type);
    const matchesPurpose =
      selectedPurposes.includes('All') ||
      selectedPurposes.some(purpose => template.configuration?.purpose === purpose);
    const matchesFeatured = !showFeatured || template.featured === true;

    return matchesSearch && matchesCategory && matchesType && matchesPurpose && matchesFeatured;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTypes, selectedPurposes, showFeatured]);

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
        {/* Search Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={t('chart_gallery_search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Filters Section */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Featured Filter */}
            <div className="space-y-3">
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-blue-500" />
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
            <div className="space-y-3">
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

            <Separator />

            {/* Purpose Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('chart_gallery_purpose')}
                </span>
              </div>
              <Select
                value={selectedPurposes[0] || 'All'}
                onValueChange={value => setSelectedPurposes([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('chart_gallery_select_purpose')} />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map(purpose => (
                    <SelectItem key={purpose} value={purpose}>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="capitalize truncate">
                          {purpose === 'All'
                            ? t('chart_gallery_category_all')
                            : purpose.replace('-', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {purpose === 'All' ? allTemplates.length : purposeCounts[purpose] || 0}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTemplates.length} {t('chart_gallery_templates_count')}
              </p>
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
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                      {selectedTemplate.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
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
                    <span className="text-xs">{t('chart_gallery_continue', 'Continue')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTemplate(null)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
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
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
                            {t('chart_gallery_features', 'Features')}
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {t('chart_gallery_responsive', 'Responsive design')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {t('chart_gallery_interactive', 'Interactive elements')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {t('chart_gallery_customizable', 'Customizable styling')}
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
                            <span>{t('chart_gallery_continue', 'Continue')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowTemplateModal(false)}
                          >
                            {t('chart_gallery_close', 'Close')}
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
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedTemplates.map(template => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card
                      className={`h-full overflow-hidden transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-gray-400 ring-2 ring-gray-400/20 shadow-lg bg-gray-50/50 dark:bg-gray-800/50'
                          : 'border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                        {/* Chart Preview Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl opacity-50">📊</div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 left-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className={`font-medium line-clamp-1 ${
                              isSelected
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {template.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs shrink-0 capitalize ${
                              isSelected
                                ? 'border-gray-400 text-gray-700 dark:border-gray-500 dark:text-gray-300'
                                : ''
                            }`}
                          >
                            {template.type}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {template.description}
                        </p>

                        <Button
                          onClick={() => setSelectedTemplate(template)}
                          className="w-full"
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                        >
                          {isSelected ? t('chart_gallery_selected') : t('chart_gallery_select')}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
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

            {/* Continue Button - Show when template is selected */}
            {selectedTemplate && datasetId && (
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('chart_gallery_template_selected', 'Template Selected')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {t('chart_gallery_template_selected_desc', 'Ready to create chart with')}{' '}
                    <strong>{selectedTemplate.name}</strong>
                    {datasetName && (
                      <>
                        {' '}
                        {t('chart_gallery_for_dataset', 'for dataset')}{' '}
                        <strong>{datasetName}</strong>
                      </>
                    )}
                  </p>
                  <Button
                    onClick={() => handleContinueWithTemplate(selectedTemplate)}
                    disabled={isCreatingChart}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                    size="lg"
                  >
                    {isCreatingChart ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('chart_gallery_creating', 'Creating Chart...')}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {t('chart_gallery_continue', 'Create Chart')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('chart_gallery_no_templates')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('chart_gallery_no_templates_desc')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
