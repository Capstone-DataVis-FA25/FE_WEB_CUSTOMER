import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
import { Search, Star, Filter, Grid3X3, TrendingUp, Eye } from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';
import type { ChartCategory, ChartTemplate } from '@/types/chart-gallery-types';

export default function ChooseTemplateTab() {
  const { t } = useTranslation();
  const { showError } = useToastContext();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ChartCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ChartTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['All']);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(['All']);
  const [showFeatured, setShowFeatured] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const chartTypes = [
    'All',
    'line',
    'bar',
    'pie',
    'area',
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
  ];

  const purposes = [
    'All',
    'comparison',
    'distribution',
    'change-over-time',
    'correlation',
    'geographical',
  ];

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
            name: t('chart_gallery_category_all', 'All Categories'),
            templates: [],
          },
          {
            id: 'basic',
            name: t('chart_gallery_category_basic', 'Basic Charts'),
            templates: [
              {
                id: 'line-basic',
                name: t('chart_gallery_line_basic', 'Line Chart'),
                description: t('chart_gallery_line_basic_desc', 'Track changes over time'),
                type: 'line',
                category: 'basic',
                configuration: { type: 'line' },
              },
              {
                id: 'bar-basic',
                name: t('chart_gallery_bar_basic', 'Bar Chart'),
                description: t('chart_gallery_bar_basic_desc', 'Compare categories'),
                type: 'bar',
                category: 'basic',
                configuration: { type: 'bar' },
              },
              {
                id: 'pie-basic',
                name: t('chart_gallery_pie_basic', 'Pie Chart'),
                description: t('chart_gallery_pie_basic_desc', 'Show proportions'),
                type: 'pie',
                category: 'basic',
                configuration: { type: 'pie' },
              },
              {
                id: 'area-basic',
                name: t('chart_gallery_area_basic', 'Area Chart'),
                description: t('chart_gallery_area_basic_desc', 'Visualize cumulative data'),
                type: 'area',
                category: 'basic',
                configuration: { type: 'area' },
              },
              {
                id: 'donut-basic',
                name: t('chart_gallery_donut_basic', 'Donut Chart'),
                description: t('chart_gallery_donut_basic_desc', 'Modern pie chart alternative'),
                type: 'donut',
                category: 'basic',
                configuration: { type: 'donut' },
              },
              {
                id: 'column-basic',
                name: t('chart_gallery_column_basic', 'Column Chart'),
                description: t('chart_gallery_column_basic_desc', 'Vertical bar comparison'),
                type: 'column',
                category: 'basic',
                configuration: { type: 'column' },
              },
            ],
          },
          {
            id: 'advanced',
            name: t('chart_gallery_category_advanced', 'Advanced Charts'),
            templates: [
              {
                id: 'scatter-advanced',
                name: t('chart_gallery_scatter_advanced', 'Scatter Plot'),
                description: t('chart_gallery_scatter_advanced_desc', 'Show correlations'),
                type: 'scatter',
                category: 'advanced',
                configuration: { type: 'scatter' },
              },
              {
                id: 'heatmap-advanced',
                name: t('chart_gallery_heatmap_advanced', 'Heatmap'),
                description: t('chart_gallery_heatmap_advanced_desc', 'Density visualization'),
                type: 'heatmap',
                category: 'advanced',
                configuration: { type: 'heatmap' },
              },
              {
                id: 'radar-advanced',
                name: t('chart_gallery_radar_advanced', 'Radar Chart'),
                description: t('chart_gallery_radar_advanced_desc', 'Compare multiple metrics'),
                type: 'radar',
                category: 'advanced',
                configuration: { type: 'radar' },
              },
              {
                id: 'bubble-advanced',
                name: t('chart_gallery_bubble_advanced', 'Bubble Chart'),
                description: t(
                  'chart_gallery_bubble_advanced_desc',
                  'Three-dimensional data visualization'
                ),
                type: 'bubble',
                category: 'advanced',
                configuration: { type: 'bubble' },
              },
              {
                id: 'treemap-advanced',
                name: t('chart_gallery_treemap_advanced', 'Treemap'),
                description: t('chart_gallery_treemap_advanced_desc', 'Hierarchical data display'),
                type: 'treemap',
                category: 'advanced',
                configuration: { type: 'treemap' },
              },
            ],
          },
          {
            id: 'specialized',
            name: t('chart_gallery_category_specialized', 'Specialized Charts'),
            templates: [
              {
                id: 'map-specialized',
                name: t('chart_gallery_map_specialized', 'Geographic Map'),
                description: t('chart_gallery_map_specialized_desc', 'Location-based data'),
                type: 'map',
                category: 'specialized',
                configuration: { type: 'map' },
              },
              {
                id: 'sankey-specialized',
                name: t('chart_gallery_sankey_specialized', 'Sankey Diagram'),
                description: t('chart_gallery_sankey_specialized_desc', 'Flow visualization'),
                type: 'sankey',
                category: 'specialized',
                configuration: { type: 'sankey' },
              },
              {
                id: 'gauge-specialized',
                name: t('chart_gallery_gauge_specialized', 'Gauge Chart'),
                description: t('chart_gallery_gauge_specialized_desc', 'Progress indicators'),
                type: 'gauge',
                category: 'specialized',
                configuration: { type: 'gauge' },
              },
              {
                id: 'funnel-specialized',
                name: t('chart_gallery_funnel_specialized', 'Funnel Chart'),
                description: t('chart_gallery_funnel_specialized_desc', 'Process flow analysis'),
                type: 'funnel',
                category: 'specialized',
                configuration: { type: 'funnel' },
              },
              {
                id: 'waterfall-specialized',
                name: t('chart_gallery_waterfall_specialized', 'Waterfall Chart'),
                description: t('chart_gallery_waterfall_specialized_desc', 'Cumulative effects'),
                type: 'waterfall',
                category: 'specialized',
                configuration: { type: 'waterfall' },
              },
            ],
          },
        ];

        setCategories(mockCategories);
      } catch (error) {
        showError(t('chart_gallery_load_error', 'Failed to load chart templates'));
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
  }, [allTemplates]);

  const purposeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    purposes.forEach(purpose => {
      if (purpose === 'All') return;
      counts[purpose] = allTemplates.filter(
        template => template.configuration?.purpose === purpose
      ).length;
    });
    return counts;
  }, [allTemplates]);

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
              placeholder={t('chart_gallery_search', 'Search templates...')}
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
                  {t('chart_gallery_featured', 'Featured')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={showFeatured}
                  onCheckedChange={checked => setShowFeatured(checked as boolean)}
                />
                <label htmlFor="featured" className="text-sm text-gray-600 dark:text-gray-300">
                  {t('chart_gallery_show_featured', 'Show premium templates only')}
                </label>
              </div>
            </div>

            <Separator />

            {/* Category Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t('chart_gallery_category', 'Category')}
                </span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('chart_gallery_select_category', 'Select category')}
                  />
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
                  {t('chart_gallery_type', 'Chart Type')}
                </span>
              </div>
              <Select
                value={selectedTypes[0] || 'All'}
                onValueChange={value => setSelectedTypes([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('chart_gallery_select_type', 'Select type')} />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="capitalize truncate">
                          {type === 'All' ? t('chart_gallery_all_types', 'All Types') : type}
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
                  {t('chart_gallery_purpose', 'Purpose')}
                </span>
              </div>
              <Select
                value={selectedPurposes[0] || 'All'}
                onValueChange={value => setSelectedPurposes([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('chart_gallery_select_purpose', 'Select purpose')} />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map(purpose => (
                    <SelectItem key={purpose} value={purpose}>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="capitalize truncate">
                          {purpose === 'All'
                            ? t('chart_gallery_all_purposes', 'All Purposes')
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
                {t('chart_gallery_templates', 'Chart Templates')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTemplates.length} {t('chart_gallery_templates_found', 'templates found')}
              </p>
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
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
                          {isSelected
                            ? t('chart_gallery_selected', 'Selected')
                            : t('chart_gallery_use_template', 'Use Template')}
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

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('chart_gallery_no_templates', 'No templates found')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('chart_gallery_no_templates_desc', 'Try adjusting your search or filters.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
