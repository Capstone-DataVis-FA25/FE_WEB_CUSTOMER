import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Rocket,
  BarChart3,
  Database,
  Palette,
  Sparkles,
  Lightbulb,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Brain,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { DocsSidebar, DocsCard, CodeBlock, DocSection } from '@/components/docs';
import { Button } from '@/components/ui/button';

export const AcademicUsingChart = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Flatten all sections into a single array for pagination
  const allSections = [
    { id: 'introduction', title: t('docs_introduction'), icon: BookOpen },
    { id: 'quick-start', title: t('docs_quick_start'), icon: Rocket },
    { id: 'first-chart', title: t('docs_first_chart'), icon: BarChart3 },
    { id: 'chart-editor', title: t('docs_chart_editor'), icon: Settings },
    {
      id: 'ai-chart-analysis',
      title: t('docs_ai_chart_analysis'),
      icon: Brain,
    },
    {
      id: 'ai-chatbox-creation',
      title: t('docs_ai_chatbox_creation'),
      icon: MessageSquare,
    },
    {
      id: 'ai-forecast',
      title: t('docs_ai_forecast'),
      icon: TrendingUp,
    },
    { id: 'chart-types', title: t('docs_chart_types'), icon: BarChart3 },
    { id: 'data-sources', title: t('docs_data_sources'), icon: Database },
    { id: 'upload-data', title: t('docs_upload_data'), icon: Database },
    { id: 'clean-data', title: t('docs_clean_data'), icon: Sparkles },
    { id: 'themes', title: t('docs_themes'), icon: Palette },
    {
      id: 'data-viz-tips',
      title: t('docs_data_viz_tips'),
      icon: Lightbulb,
    },
    { id: 'performance', title: t('docs_performance'), icon: Rocket },
  ];

  const sections = [
    {
      id: 'getting-started',
      title: t('docs_getting_started'),
      items: [
        { id: 'introduction', title: t('docs_introduction') },
        { id: 'quick-start', title: t('docs_quick_start') },
        { id: 'first-chart', title: t('docs_first_chart') },
      ],
    },
    {
      id: 'core-concepts',
      title: t('docs_core_concepts'),
      items: [
        { id: 'chart-editor', title: t('docs_chart_editor') },
        { id: 'chart-types', title: t('docs_chart_types') },
        { id: 'data-sources', title: t('docs_data_sources') },
      ],
    },
    {
      id: 'ai-features',
      title: t('docs_ai_features'),
      items: [
        {
          id: 'ai-chart-analysis',
          title: t('docs_ai_chart_analysis'),
        },
        {
          id: 'ai-chatbox-creation',
          title: t('docs_ai_chatbox_creation'),
        },
        { id: 'ai-forecast', title: t('docs_ai_forecast') },
      ],
    },
    {
      id: 'data-management',
      title: t('docs_data_management'),
      items: [
        { id: 'upload-data', title: t('docs_upload_data') },
        { id: 'clean-data', title: t('docs_clean_data') },
      ],
    },
    {
      id: 'customization',
      title: t('docs_customization'),
      items: [{ id: 'themes', title: t('docs_themes') }],
    },
    {
      id: 'best-practices',
      title: t('docs_best_practices'),
      items: [
        { id: 'data-viz-tips', title: t('docs_data_viz_tips') },
        { id: 'performance', title: t('docs_performance') },
      ],
    },
  ];

  const currentIndex = allSections.findIndex(s => s.id === activeSection);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allSections.length - 1;

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setActiveSection(allSections[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveSection(allSections[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, hasPrevious, hasNext]);

  const renderContent = () => {
    const Icon = allSections[currentIndex]?.icon || BookOpen;

    switch (activeSection) {
      case 'introduction':
        return (
          <DocSection id="introduction" title={t('docs_introduction')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t(
                'docs_intro_text',
                "DataVis is a powerful data visualization platform that helps you create stunning charts and graphs from your data. Whether you're a student, researcher, or professional, DataVis makes it easy to transform raw data into meaningful insights."
              )}
            </p>

            <DocsCard type="tip" title={t('docs_why_datavis')}>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('docs_benefit_1')}</li>
                <li>{t('docs_benefit_2')}</li>
                <li>
                  {t(
                    'docs_benefit_3',
                    'Support for multiple chart types and customization options'
                  )}
                </li>
                <li>{t('docs_benefit_4')}</li>
                <li>{t('docs_benefit_5')}</li>
              </ul>
            </DocsCard>
          </DocSection>
        );

      case 'quick-start':
        return (
          <DocSection id="quick-start" title={t('docs_quick_start')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('docs_quick_start_intro')}</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('docs_step_1')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{t('docs_step_1_desc')}</p>
                <DocsCard type="info">
                  {t(
                    'docs_free_tier',
                    'The free tier includes unlimited charts and 5GB of storage.'
                  )}
                </DocsCard>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('docs_step_2')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t(
                    'docs_step_2_desc',
                    'Upload your data in CSV, Excel, or JSON format. You can also paste data directly.'
                  )}
                </p>
                <CodeBlock
                  language="csv"
                  code={`Month,Sales,Expenses
January,12000,8000
February,15000,9000
March,18000,10000`}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('docs_step_3')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_step_3_desc',
                    'Select from our library of chart types including line, bar, pie, scatter, and more.'
                  )}
                </p>
              </div>
            </div>
          </DocSection>
        );

      case 'first-chart':
        return (
          <DocSection id="first-chart" title={t('docs_first_chart')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('docs_first_chart_intro', "Let's create your first chart step by step:")}
            </p>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  1. {t('docs_navigate_charts')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{t('docs_navigate_charts_desc')}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2. {t('docs_click_new_chart')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{t('docs_click_new_chart_desc')}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  3. {t('docs_select_dataset')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{t('docs_select_dataset_desc')}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4. {t('docs_configure_chart')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_configure_chart_desc',
                    'Select chart type, axes, and customize appearance.'
                  )}
                </p>
              </div>
            </div>

            <DocsCard type="tip" title={t('docs_tip_preview')} className="mt-6">
              {t(
                'docs_tip_preview_desc',
                'Use the preview panel to see your chart update in real-time as you make changes.'
              )}
            </DocsCard>
          </DocSection>
        );

      case 'chart-editor':
        return (
          <DocSection id="chart-editor" title={t('docs_chart_editor')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t(
                'docs_chart_editor_intro',
                'The Chart Editor is the central workspace where you create and customize your visualizations. It is divided into two main areas: the Settings Panel on the left and the Chart Preview on the right.'
              )}
            </p>

            <div className="space-y-8">
              {/* Interface Overview */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_interface_overview')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {t('docs_settings_panel')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_settings_panel_desc',
                        'Contains all configuration options: Chart Type, Data Selection, Axes, Appearance, and Export settings.'
                      )}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      {t('docs_preview_panel')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_preview_panel_desc',
                        'Shows real-time updates of your chart. You can interact with the chart here (zoom, pan, hover).'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Types */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_selecting_chart_type')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t(
                    'docs_selecting_chart_type_desc',
                    'The first step is choosing the right visualization for your data. You can switch chart types at any time to see how your data looks in different formats.'
                  )}
                </p>
                <DocsCard type="info">
                  {t(
                    'docs_chart_type_tip',
                    'Available types: Line, Bar, Pie, Doughnut, Scatter, Area, Heatmap, Cycle Plot (for seasonal data), and Histogram.'
                  )}
                </DocsCard>
              </div>

              {/* Basic Settings */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_basic_settings')}
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>{t('docs_chart_title')}:</strong> {t('docs_chart_title_desc')}
                  </li>
                  <li>
                    <strong>{t('docs_chart_subtitle')}:</strong>{' '}
                    {t(
                      'docs_chart_subtitle_desc',
                      'A subtitle or brief explanation of the data context.'
                    )}
                  </li>
                </ul>
              </div>

              {/* Data Configuration */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_data_config')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t(
                    'docs_data_config_intro',
                    'Map your dataset columns to the chart axes. This is the most critical step.'
                  )}
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_x_axis_config')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_x_axis_config_desc',
                        'Select the column for the horizontal axis. For time-series data, ensure you select a Date column.'
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_y_axis_config')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_y_axis_config_desc',
                        'Select one or more numerical columns to plot. You can add multiple series to compare different metrics.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Axis Configuration */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_axis_config')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t('docs_axis_config_intro')}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_axis_labels')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_axis_titles')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_grid_lines')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_axis_scale')}</span>
                  </li>
                </ul>
              </div>

              {/* Appearance */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_appearance')}
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_colors')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_colors_desc',
                        'Customize the color of each data series. You can use predefined themes or pick specific colors.'
                      )}
                    </p>
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_legend')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_legend_desc',
                        'Control the position (Top, Bottom, Left, Right) and visibility of the chart legend.'
                      )}
                    </p>
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_tooltips')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_tooltips_desc',
                        'Enable tooltips to show precise values when hovering over data points.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dataset Operations */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_dataset_ops')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t(
                    'docs_dataset_ops_intro',
                    'Transform and refine your data before visualization using powerful operations:'
                  )}
                </p>

                <div className="space-y-4">
                  {/* Filter */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      {t('docs_filter_data')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t(
                        'docs_filter_data_desc',
                        'Remove unwanted rows based on conditions. Drag columns to the filter area and set criteria.'
                      )}
                    </p>
                    <DocsCard type="tip">
                      <span className="text-sm">
                        {t(
                          'docs_filter_example',
                          'Example: Show only posts with engagement_rate > 10'
                        )}
                      </span>
                    </DocsCard>
                  </div>

                  {/* Sort */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {t('docs_sort_data')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_sort_data_desc',
                        'Order your data by one or more columns in ascending or descending order.'
                      )}
                    </p>
                  </div>

                  {/* Group By / Aggregation */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      {t('docs_group_by')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t(
                        'docs_group_by_desc',
                        'Summarize data by grouping rows and applying aggregation functions.'
                      )}
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>{t('docs_agg_sum')}</li>
                      <li>{t('docs_agg_avg')}</li>
                      <li>{t('docs_agg_count')}</li>
                      <li>{t('docs_agg_min')}</li>
                      <li>{t('docs_agg_max')}</li>
                    </ul>
                  </div>

                  {/* Pivot Table */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-700 p-5">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2 text-lg">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      {t('docs_pivot_table')}
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                      {t(
                        'docs_pivot_intro',
                        'Create powerful cross-tabulations to analyze data from multiple dimensions. Perfect for summarizing large datasets.'
                      )}
                    </p>

                    <div className="space-y-3">
                      {/* Rows */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                          {t('docs_pivot_rows')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t(
                            'docs_pivot_rows_desc',
                            'Drag columns here to create row headers. Data will be grouped by these dimensions.'
                          )}
                        </p>
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                          {t('docs_pivot_rows_example')}
                        </div>
                      </div>

                      {/* Columns */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                          {t('docs_pivot_columns')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t(
                            'docs_pivot_columns_desc',
                            'Drag columns here to create column headers. Creates a cross-tabulation.'
                          )}
                        </p>
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                          {t('docs_pivot_columns_example')}
                        </div>
                      </div>

                      {/* Values */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                          {t('docs_pivot_values')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {t(
                            'docs_pivot_values_desc',
                            'Drag numerical columns here and choose aggregation type (Sum, Average, Count, Min, Max).'
                          )}
                        </p>
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                          {t(
                            'docs_pivot_values_example',
                            'Example: Sum of likes, Average of engagement_rate'
                          )}
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                          {t('docs_pivot_filters')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t(
                            'docs_pivot_filters_desc',
                            'Apply filters to limit which data appears in the pivot table.'
                          )}
                        </p>
                      </div>
                    </div>

                    <DocsCard type="info" className="mt-4">
                      <p className="text-sm">
                        {t(
                          'docs_pivot_use_case',
                          'Use Case: Analyze total engagement by platform and post type, or compare average likes across different content categories.'
                        )}
                      </p>
                    </DocsCard>
                  </div>
                </div>
              </div>

              {/* Series Management */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_series_management')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t(
                    'docs_series_intro',
                    'For Line, Bar, Area, and Scatter charts, you can add multiple data series to compare different metrics:'
                  )}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_add_series')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_add_series_desc',
                        'Click the + button to add more Y-axis columns. Each series can represent a different metric.'
                      )}
                    </p>
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_series_colors')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_series_colors_desc',
                        'Each series can have its own color. Click the color picker to customize.'
                      )}
                    </p>
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_line_styles')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_line_styles_desc',
                        'For line charts, customize line style (solid, dashed) and show/hide data point markers.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart-Specific Settings */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_chart_specific')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pie/Donut */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_pie_settings')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_pie_label')}</li>
                      <li>• {t('docs_pie_donut_size')}</li>
                      <li>• {t('docs_pie_start_angle')}</li>
                    </ul>
                  </div>

                  {/* Heatmap */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_heatmap_settings')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_heatmap_color_scheme')}</li>
                      <li>• {t('docs_heatmap_cell_labels')}</li>
                      <li>• {t('docs_heatmap_interpolation')}</li>
                    </ul>
                  </div>

                  {/* Histogram */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_histogram_settings')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_histogram_bins')}</li>
                      <li>• {t('docs_histogram_bin_size')}</li>
                      <li>• {t('docs_histogram_cumulative')}</li>
                    </ul>
                  </div>

                  {/* Cycle Plot */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_cycle_settings')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_cycle_period')}</li>
                      <li>• {t('docs_cycle_baseline')}</li>
                      <li>• {t('docs_cycle_highlight')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chart Formatter */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_formatter')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t(
                    'docs_formatter_intro',
                    'Control how numbers and dates are displayed on your chart:'
                  )}
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('docs_number_format')}
                    </h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_format_decimal')}</li>
                      <li>• {t('docs_format_percentage')}</li>
                      <li>• {t('docs_format_currency')}</li>
                      <li>• {t('docs_format_compact')}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('docs_date_format')}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_date_format_desc',
                        'Choose from various date formats: YYYY-MM-DD, MM/DD/YYYY, DD MMM YYYY, etc.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Export */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_export')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_export_chart')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_export_png')}</li>
                      <li>• {t('docs_export_svg')}</li>
                      <li>• {t('docs_export_pdf')}</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_import_config')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_import_config_desc',
                        'Save and load chart configurations to reuse settings across different datasets.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DocSection>
        );

      case 'chart-types':
        return (
          <DocSection id="chart-types" title={t('docs_chart_types')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('docs_chart_types_intro')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_line_chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_line_chart_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_bar_chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_bar_chart_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_pie_chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_pie_chart_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_scatter_chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_scatter_chart_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_area_chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_area_chart_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_heatmap')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('docs_heatmap_desc')}</p>
              </div>
            </div>
          </DocSection>
        );

      case 'data-sources':
        return (
          <DocSection id="data-sources" title={t('docs_data_sources')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('docs_data_sources_intro')}</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_file_upload')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('docs_file_upload_desc')}
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-4">
                  <li>CSV (.csv)</li>
                  <li>Excel (.xlsx, .xls)</li>
                  <li>JSON (.json)</li>
                  <li>TSV (.tsv)</li>
                  <li>Text (.txt)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_paste_data')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_paste_data_desc',
                    'Copy and paste data directly from spreadsheets or other sources.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_sample_data')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_sample_data_desc',
                    'Try our pre-loaded sample datasets to explore features.'
                  )}
                </p>
              </div>
            </div>

            <DocsCard type="warning" title={t('docs_file_size_limit')} className="mt-6">
              {t(
                'docs_file_size_limit_desc',
                'Maximum file size is 50MB. For larger datasets, consider splitting your data or using our API.'
              )}
            </DocsCard>
          </DocSection>
        );

      case 'upload-data':
        return (
          <DocSection id="upload-data" title={t('docs_upload_data')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('docs_data_sources_intro')}</p>

            <div className="space-y-6">
              <DocsCard type="info" title={t('docs_file_upload')}>
                <p className="mb-2">{t('docs_file_upload_desc')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CSV (.csv)</li>
                  <li>Excel (.xlsx, .xls)</li>
                  <li>JSON (.json)</li>
                  <li>TSV (.tsv)</li>
                </ul>
              </DocsCard>

              <DocsCard type="tip" title={t('docs_paste_data')}>
                {t(
                  'docs_paste_data_desc',
                  'Copy and paste data directly from spreadsheets or other sources.'
                )}
              </DocsCard>
            </div>
          </DocSection>
        );

      case 'clean-data':
        return (
          <DocSection id="clean-data" title={t('docs_clean_data')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t(
                'docs_clean_data_intro',
                'Our AI-powered data cleaning feature automatically standardizes and cleans your data:'
              )}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('docs_clean_numbers')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'docs_clean_numbers_desc',
                      'Automatically detect and normalize thousands separators and decimal points'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {/* Icon replaced emoji */}
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('docs_clean_duplicates')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'docs_clean_duplicates_desc',
                      'Identify and remove duplicate rows automatically'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {/* Icon replaced emoji */}
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('docs_clean_text')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'docs_clean_text_desc',
                      'Trim whitespace, fix encoding issues, and standardize text'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <DocsCard type="tip" title={t('docs_ai_tip')}>
              {t(
                'docs_ai_tip_desc',
                'You can provide custom notes to guide the AI cleaning process for domain-specific data.'
              )}
            </DocsCard>
          </DocSection>
        );

      case 'themes':
        return (
          <DocSection id="themes" title={t('docs_themes')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('docs_themes_intro')}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mb-3"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('docs_theme_default')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('docs_theme_default_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-full h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('docs_theme_dark')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('docs_theme_dark_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-full h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mb-3"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('docs_theme_custom')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('docs_theme_custom_desc')}
                </p>
              </div>
            </div>
          </DocSection>
        );

      case 'data-viz-tips':
        return (
          <DocSection id="data-viz-tips" title={t('docs_data_viz_tips')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t(
                'docs_best_practices_intro',
                'Follow these best practices to create effective visualizations:'
              )}
            </p>

            <div className="space-y-4">
              <DocsCard type="tip" title={t('docs_tip_1_title')}>
                {t(
                  'docs_tip_1_desc',
                  'Use line charts for trends, bar charts for comparisons, and pie charts for proportions. Match the chart type to your data and message.'
                )}
              </DocsCard>

              <DocsCard type="tip" title={t('docs_tip_2_title')}>
                {t(
                  'docs_tip_2_desc',
                  'Avoid cluttering your charts with too much information. Focus on the key message you want to convey.'
                )}
              </DocsCard>

              <DocsCard type="tip" title={t('docs_tip_3_title')}>
                {t(
                  'docs_tip_3_desc',
                  'Use color to highlight important data points or group related items. Ensure sufficient contrast for readability.'
                )}
              </DocsCard>

              <DocsCard type="tip" title={t('docs_tip_4_title')}>
                {t(
                  'docs_tip_4_desc',
                  'Always include clear axis labels, titles, and legends. Your audience should understand the chart without additional explanation.'
                )}
              </DocsCard>

              <DocsCard type="warning" title={t('docs_warning_misleading')}>
                {t(
                  'docs_warning_misleading_desc',
                  "Don't manipulate axis scales or use 3D effects that distort data. Always represent data accurately and honestly."
                )}
              </DocsCard>
            </div>
          </DocSection>
        );

      case 'performance':
        return (
          <DocSection id="performance" title={t('docs_performance')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t(
                'docs_performance_intro',
                'Tips for optimizing chart performance with large datasets:'
              )}
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_perf_1_title')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_perf_1_desc',
                    'For line and scatter charts, consider aggregating or sampling data if you have more than 10,000 points.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_perf_2_title')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_perf_2_desc',
                    'Some chart types handle large datasets better than others. Heatmaps and aggregated bar charts work well with large data.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_perf_3_title')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_perf_3_desc',
                    'For very large datasets, consider disabling animations to improve rendering performance.'
                  )}
                </p>
              </div>
            </div>

            <DocsCard type="info" title={t('docs_need_help')} className="mt-6">
              <p className="mb-2">{t('docs_need_help_desc')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('docs_help_1')}</li>
                <li>{t('docs_help_2')}</li>
                <li>{t('docs_help_3')}</li>
              </ul>
            </DocsCard>
          </DocSection>
        );

      case 'ai-chart-analysis':
        return (
          <DocSection id="ai-chart-analysis" title={t('docs_ai_chart_analysis')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('docs_ai_analysis_intro')}</p>

            <div className="space-y-8">
              {/* What is AI Chart Analysis */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_ai_what_is')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{t('docs_ai_what_is_desc')}</p>
                <DocsCard type="info">
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('docs_ai_feature_1')}</li>
                    <li>{t('docs_ai_feature_2')}</li>
                    <li>{t('docs_ai_feature_3')}</li>
                    <li>{t('docs_ai_feature_4')}</li>
                    <li>{t('docs_ai_feature_5')}</li>
                  </ul>
                </DocsCard>
              </div>

              {/* How to Use */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_ai_how_to_use')}
                </h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      {t('docs_ai_step_1')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_ai_step_1_desc',
                        'Navigate to the chart you want to analyze in the Chart Editor.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      {t('docs_ai_step_2')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_ai_step_2_desc',
                        'Look for the AI analysis button in the chart toolbar (usually marked with a brain or sparkle icon).'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      {t('docs_ai_step_3')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_ai_step_3_desc',
                        'The AI will analyze your chart and present findings in an easy-to-understand format with visualizations and explanations.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      {t('docs_ai_step_4')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_ai_step_4_desc',
                        'Use the suggested improvements to enhance your chart or gain deeper understanding of your data.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* What AI Can Detect */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_ai_can_detect')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      📈 {t('docs_ai_trends')}
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {t(
                        'docs_ai_trends_desc',
                        'Upward, downward, or cyclical patterns in your data over time.'
                      )}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      ⚠️ {t('docs_ai_anomalies')}
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      {t(
                        'docs_ai_anomalies_desc',
                        'Outliers and unusual data points that deviate from expected patterns.'
                      )}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      🔗 {t('docs_ai_correlations')}
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {t(
                        'docs_ai_correlations_desc',
                        'Relationships between different data series or variables.'
                      )}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      📊 {t('docs_ai_distributions')}
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      {t(
                        'docs_ai_distributions_desc',
                        'How your data is spread and whether it follows normal or skewed patterns.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Example Use Cases */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_ai_use_cases')}
                </h3>
                <div className="space-y-3">
                  <DocsCard type="tip" title={t('docs_ai_use_case_1')}>
                    <p className="text-sm">
                      {t(
                        'docs_ai_use_case_1_desc',
                        'Identify seasonal trends in sales data, detect unusual spikes or drops, and get recommendations for forecasting.'
                      )}
                    </p>
                  </DocsCard>

                  <DocsCard type="tip" title={t('docs_ai_use_case_2')}>
                    <p className="text-sm">
                      {t(
                        'docs_ai_use_case_2_desc',
                        'Discover peak traffic hours, identify anomalies that might indicate issues, and understand user behavior patterns.'
                      )}
                    </p>
                  </DocsCard>

                  <DocsCard type="tip" title={t('docs_ai_use_case_3')}>
                    <p className="text-sm">
                      {t(
                        'docs_ai_use_case_3_desc',
                        'Detect unusual transactions, analyze spending patterns, and identify correlations between different expense categories.'
                      )}
                    </p>
                  </DocsCard>
                </div>
              </div>

              {/* Tips */}
              <DocsCard type="warning" title={t('docs_ai_tips')}>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    {t(
                      'docs_ai_tip_1',
                      'Ensure your data is clean and properly formatted before analysis'
                    )}
                  </li>
                  <li>
                    {t(
                      'docs_ai_tip_2',
                      'Provide context about your data to get more relevant insights'
                    )}
                  </li>
                  <li>
                    {t(
                      'docs_ai_tip_3',
                      'Use AI analysis as a starting point, not a replacement for domain expertise'
                    )}
                  </li>
                  <li>
                    {t(
                      'docs_ai_tip_4',
                      'Larger datasets (100+ data points) generally produce more reliable insights'
                    )}
                  </li>
                </ul>
              </DocsCard>
            </div>
          </DocSection>
        );

      case 'ai-chatbox-creation':
        return (
          <DocSection id="ai-chatbox-creation" title={t('docs_ai_chatbox_creation')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t(
                'docs_chatbox_intro',
                'Create charts using natural language! Simply describe what you want to visualize, and our AI ChatBox will generate the chart for you. No technical knowledge required.'
              )}
            </p>

            <div className="space-y-8">
              {/* What is ChatBox */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_chatbox_what_is')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t(
                    'docs_chatbox_what_is_desc',
                    'ChatBox is an AI-powered conversational interface that understands your data visualization needs in plain language. Instead of manually configuring charts, you can simply chat with the AI to create, modify, and refine your visualizations.'
                  )}
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {t('docs_chatbox_example')}
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                        You:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        "Show me a line chart of monthly sales for 2024"
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                        AI:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        "I've created a line chart showing your monthly sales data for 2024. Would
                        you like me to add a trend line or change the colors?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Use ChatBox */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_chatbox_how_to')}
                </h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      {t('docs_chatbox_step_1')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_chatbox_step_1_desc',
                        'Click the ChatBox icon in the Chart Editor or navigate to the ChatBox page from the main menu.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      {t('docs_chatbox_step_2')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_chatbox_step_2_desc',
                        'Choose the dataset you want to visualize, or upload a new one.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      {t('docs_chatbox_step_3')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mb-2">
                      {t(
                        'docs_chatbox_step_3_desc',
                        'Type what you want to see in natural language. Be specific about:'
                      )}
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 ml-12 list-disc list-inside space-y-1">
                      <li>{t('docs_chatbox_specify_1')}</li>
                      <li>{t('docs_chatbox_specify_2')}</li>
                      <li>{t('docs_chatbox_specify_3')}</li>
                      <li>{t('docs_chatbox_specify_4')}</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      {t('docs_chatbox_step_4')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_chatbox_step_4_desc',
                        'Continue chatting to make adjustments. Ask the AI to change colors, add labels, modify axes, or try different chart types.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Example Prompts */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_chatbox_examples')}
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      💡 {t('docs_chatbox_prompt_1')}
                    </p>
                    <CodeBlock
                      language="text"
                      code={`"Create a bar chart showing revenue by product category"
"Make a pie chart of market share by region"
"Show me a line chart of user growth over the last 12 months"`}
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      🎨 {t('docs_chatbox_prompt_2')}
                    </p>
                    <CodeBlock
                      language="text"
                      code={`"Create a blue and green line chart of temperature and humidity"
"Make a dark-themed bar chart of expenses by category"
"Show sales data as a gradient area chart"`}
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      🔍 {t('docs_chatbox_prompt_3')}
                    </p>
                    <CodeBlock
                      language="text"
                      code={`"Show only data from Q1 2024"
"Filter out values below 100"
"Display top 10 products by revenue"`}
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      ✏️ {t('docs_chatbox_prompt_4')}
                    </p>
                    <CodeBlock
                      language="text"
                      code={`"Change this to a stacked bar chart"
"Add a trend line"
"Make the legend appear at the bottom"
"Increase the font size of axis labels"`}
                    />
                  </div>
                </div>
              </div>

              {/* Tips for Better Results */}
              <DocsCard type="tip" title={t('docs_chatbox_tips')}>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>{t('docs_chatbox_tip_1_title')}:</strong>{' '}
                    {t(
                      'docs_chatbox_tip_1_desc',
                      'The more details you provide, the better the AI can understand your needs.'
                    )}
                  </li>
                  <li>
                    <strong>{t('docs_chatbox_tip_2_title')}:</strong>{' '}
                    {t(
                      'docs_chatbox_tip_2_desc',
                      'Reference exact column names from your dataset for accuracy.'
                    )}
                  </li>
                  <li>
                    <strong>{t('docs_chatbox_tip_3_title')}:</strong>{' '}
                    {t(
                      'docs_chatbox_tip_3_desc',
                      'Make one change at a time for better control over the final result.'
                    )}
                  </li>
                  <li>
                    <strong>{t('docs_chatbox_tip_4_title')}:</strong>{' '}
                    {t(
                      'docs_chatbox_tip_4_desc',
                      'If unsure, ask the AI for suggestions or recommendations.'
                    )}
                  </li>
                </ul>
              </DocsCard>
            </div>
          </DocSection>
        );

      case 'ai-forecast':
        return (
          <DocSection id="ai-forecast" title={t('docs_ai_forecast')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t(
                'docs_forecast_intro',
                'Predict future trends using AI-powered forecasting. DataVis uses advanced machine learning models to analyze historical data and generate accurate predictions with confidence intervals.'
              )}
            </p>

            <div className="space-y-8">
              {/* What is Forecasting */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_forecast_what_is')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t(
                    'docs_forecast_what_is_desc',
                    'AI Forecasting analyzes patterns in your historical data to predict future values. It automatically detects seasonality, trends, and other patterns to generate reliable predictions.'
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {t('docs_forecast_feature_1')}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_feature_1_desc',
                        'Identifies long-term upward or downward movements'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {t('docs_forecast_feature_2')}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_feature_2_desc',
                        'Detects recurring patterns (daily, weekly, yearly)'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {t('docs_forecast_feature_3')}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_feature_3_desc',
                        'Shows prediction uncertainty with upper/lower bounds'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Create Forecast */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_forecast_how_to')}
                </h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      {t('docs_forecast_step_1')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mb-2">
                      {t(
                        'docs_forecast_step_1_desc',
                        'Your dataset must have a date/time column and at least one numerical column to forecast.'
                      )}
                    </p>
                    <DocsCard type="info" className="ml-8">
                      <p className="text-xs">
                        {t(
                          'docs_forecast_requirement',
                          'Minimum: 30 data points for reliable forecasts. More data = better accuracy.'
                        )}
                      </p>
                    </DocsCard>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      {t('docs_forecast_step_2')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_forecast_step_2_desc',
                        'Start by creating a line chart with your time-series data. Select the date column for X-axis and the metric to forecast for Y-axis.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      {t('docs_forecast_step_3')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_forecast_step_3_desc',
                        'In the Chart Editor, look for the "Forecast" or "AI Prediction" option in the settings panel. Toggle it on.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      {t('docs_forecast_step_4')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mb-2">
                      {t('docs_forecast_step_4_desc')}
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 ml-12 list-disc list-inside space-y-1">
                      <li>
                        <strong>{t('docs_forecast_param_1')}:</strong>{' '}
                        {t('docs_forecast_param_1_desc')}
                      </li>
                      <li>
                        <strong>{t('docs_forecast_param_2')}:</strong>{' '}
                        {t('docs_forecast_param_2_desc')}
                      </li>
                      <li>
                        <strong>{t('docs_forecast_param_3')}:</strong>{' '}
                        {t('docs_forecast_param_3_desc')}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        5
                      </div>
                      {t('docs_forecast_step_5')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t(
                        'docs_forecast_step_5_desc',
                        'The AI will generate predictions shown as a continuation of your line chart with shaded confidence intervals. Review the forecast and adjust settings if needed.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Understanding Forecast Results */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_forecast_understanding')}
                </h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border-2 border-indigo-200 dark:border-indigo-700">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                        📈 {t('docs_forecast_line')}
                      </h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        {t(
                          'docs_forecast_line_desc',
                          'The predicted values extending beyond your historical data. This is the most likely outcome based on past patterns.'
                        )}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                        📊 {t('docs_forecast_interval')}
                      </h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        {t(
                          'docs_forecast_interval_desc',
                          "The range where actual values are likely to fall. A wider interval means more uncertainty. For example, a 95% confidence interval means there's a 95% chance the actual value will be within this range."
                        )}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                        🎯 {t('docs_forecast_accuracy')}
                      </h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        {t(
                          'docs_forecast_accuracy_desc',
                          'DataVis provides metrics like MAPE (Mean Absolute Percentage Error) to help you understand forecast reliability. Lower values indicate better accuracy.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_forecast_best_practices')}
                </h3>
                <div className="space-y-3">
                  <DocsCard type="tip" title={t('docs_forecast_practice_1')}>
                    <p className="text-sm">
                      {t(
                        'docs_forecast_practice_1_desc',
                        'For daily data, have at least 3-6 months. For monthly data, have at least 2-3 years. More historical data improves accuracy.'
                      )}
                    </p>
                  </DocsCard>

                  <DocsCard type="tip" title={t('docs_forecast_practice_2')}>
                    <p className="text-sm">
                      {t(
                        'docs_forecast_practice_2_desc',
                        'Remove outliers and fill missing values before forecasting. Use the AI Data Cleaning feature to prepare your data.'
                      )}
                    </p>
                  </DocsCard>

                  <DocsCard type="tip" title={t('docs_forecast_practice_3')}>
                    <p className="text-sm">
                      {t(
                        'docs_forecast_practice_3_desc',
                        'AI forecasts are based on historical patterns. Major events (holidays, promotions, market changes) may affect accuracy. Use forecasts as guidance, not absolute truth.'
                      )}
                    </p>
                  </DocsCard>

                  <DocsCard type="warning" title={t('docs_forecast_practice_4')}>
                    <p className="text-sm">
                      {t(
                        'docs_forecast_practice_4_desc',
                        'Forecasts become less reliable the further into the future you go. For best results, forecast no more than 20-30% beyond your historical data period.'
                      )}
                    </p>
                  </DocsCard>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_forecast_use_cases')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      💰 {t('docs_forecast_case_1')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_case_1_desc',
                        'Predict future revenue, plan inventory, and set realistic targets.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      👥 {t('docs_forecast_case_2')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_case_2_desc',
                        'Estimate future user base, plan infrastructure, and allocate resources.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      📦 {t('docs_forecast_case_3')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_case_3_desc',
                        'Anticipate product demand, optimize stock levels, and reduce waste.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      💵 {t('docs_forecast_case_4')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(
                        'docs_forecast_case_4_desc',
                        'Project expenses, allocate budgets, and plan financial resources.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DocSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <DocsSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            className="h-full"
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {t('docs_title')}
                </h1>
              </div>

              {/* View Documentation as PDF Button */}
              <button
                onClick={() => setShowPdfViewer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="hidden sm:inline">{t('docs_download_pdf')}</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t(
                'docs_subtitle',
                'Learn how to create beautiful, interactive data visualizations with DataVis'
              )}
            </p>
          </div>

          {/* Content */}
          <div className="mb-12">{renderContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {hasPrevious && (
                <span className="hidden sm:inline">{allSections[currentIndex - 1]?.title}</span>
              )}
              <span className="sm:hidden">Previous</span>
            </Button>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} / {allSections.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!hasNext}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <span className="hidden sm:inline">
                {hasNext && allSections[currentIndex + 1]?.title}
              </span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Keyboard Hint */}
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            {t('docs_keyboard_hint')}
          </div>
        </main>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
            {/* Close Button */}
            <button
              onClick={() => setShowPdfViewer(false)}
              className="absolute top-6 right-6 z-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* PDF Viewer */}
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
              <iframe
                src="/docs/DataVis_Document.pdf"
                className="w-full h-full"
                title="DataVis Documentation"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
