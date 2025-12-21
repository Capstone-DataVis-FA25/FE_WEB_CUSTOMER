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
    { id: 'introduction', title: t('docs_introduction', 'Introduction'), icon: BookOpen },
    { id: 'quick-start', title: t('docs_quick_start', 'Quick Start'), icon: Rocket },
    { id: 'first-chart', title: t('docs_first_chart', 'Your First Chart'), icon: BarChart3 },
    { id: 'chart-editor', title: t('docs_chart_editor', 'Using the Chart Editor'), icon: Settings },
    {
      id: 'ai-chart-analysis',
      title: t('docs_ai_chart_analysis', 'Chart Analysis with AI'),
      icon: Brain,
    },
    {
      id: 'ai-chatbox-creation',
      title: t('docs_ai_chatbox_creation', 'Creating Charts with ChatBox'),
      icon: MessageSquare,
    },
    {
      id: 'ai-forecast',
      title: t('docs_ai_forecast', 'Forecast Charts'),
      icon: TrendingUp,
    },
    { id: 'chart-types', title: t('docs_chart_types', 'Chart Types'), icon: BarChart3 },
    { id: 'data-sources', title: t('docs_data_sources', 'Data Sources'), icon: Database },
    { id: 'upload-data', title: t('docs_upload_data', 'Upload Data'), icon: Database },
    { id: 'clean-data', title: t('docs_clean_data', 'Clean Data with AI'), icon: Sparkles },
    { id: 'themes', title: t('docs_themes', 'Themes'), icon: Palette },
    {
      id: 'data-viz-tips',
      title: t('docs_data_viz_tips', 'Data Visualization Tips'),
      icon: Lightbulb,
    },
    { id: 'performance', title: t('docs_performance', 'Performance'), icon: Rocket },
  ];

  const sections = [
    {
      id: 'getting-started',
      title: t('docs_getting_started', 'Getting Started'),
      items: [
        { id: 'introduction', title: t('docs_introduction', 'Introduction') },
        { id: 'quick-start', title: t('docs_quick_start', 'Quick Start') },
        { id: 'first-chart', title: t('docs_first_chart', 'Your First Chart') },
      ],
    },
    {
      id: 'core-concepts',
      title: t('docs_core_concepts', 'Core Concepts'),
      items: [
        { id: 'chart-editor', title: t('docs_chart_editor', 'Using the Chart Editor') },
        { id: 'chart-types', title: t('docs_chart_types', 'Chart Types') },
        { id: 'data-sources', title: t('docs_data_sources', 'Data Sources') },
      ],
    },
    {
      id: 'ai-features',
      title: t('docs_ai_features', 'AI-Powered Features'),
      items: [
        {
          id: 'ai-chart-analysis',
          title: t('docs_ai_chart_analysis', 'Chart Analysis with AI'),
        },
        {
          id: 'ai-chatbox-creation',
          title: t('docs_ai_chatbox_creation', 'Creating Charts with ChatBox'),
        },
        { id: 'ai-forecast', title: t('docs_ai_forecast', 'Forecast Charts') },
      ],
    },
    {
      id: 'data-management',
      title: t('docs_data_management', 'Data Management'),
      items: [
        { id: 'upload-data', title: t('docs_upload_data', 'Upload Data') },
        { id: 'clean-data', title: t('docs_clean_data', 'Clean Data with AI') },
      ],
    },
    {
      id: 'customization',
      title: t('docs_customization', 'Customization'),
      items: [{ id: 'themes', title: t('docs_themes', 'Themes') }],
    },
    {
      id: 'best-practices',
      title: t('docs_best_practices', 'Best Practices'),
      items: [
        { id: 'data-viz-tips', title: t('docs_data_viz_tips', 'Data Visualization Tips') },
        { id: 'performance', title: t('docs_performance', 'Performance') },
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
          <DocSection id="introduction" title={t('docs_introduction', 'Introduction')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t(
                'docs_intro_text',
                "DataVis is a powerful data visualization platform that helps you create stunning charts and graphs from your data. Whether you're a student, researcher, or professional, DataVis makes it easy to transform raw data into meaningful insights."
              )}
            </p>

            <DocsCard type="tip" title={t('docs_why_datavis', 'Why DataVis?')}>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {t('docs_benefit_1', 'Easy-to-use chart editor with drag-and-drop interface')}
                </li>
                <li>{t('docs_benefit_2', 'AI-powered data cleaning and transformation')}</li>
                <li>
                  {t(
                    'docs_benefit_3',
                    'Support for multiple chart types and customization options'
                  )}
                </li>
                <li>{t('docs_benefit_4', 'Export charts in various formats (PNG, SVG, PDF)')}</li>
                <li>{t('docs_benefit_5', 'Collaborative features for team projects')}</li>
              </ul>
            </DocsCard>
          </DocSection>
        );

      case 'quick-start':
        return (
          <DocSection id="quick-start" title={t('docs_quick_start', 'Quick Start')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('docs_quick_start_intro', 'Get started with DataVis in just a few minutes:')}
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('docs_step_1', 'Step 1: Create an Account')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('docs_step_1_desc', 'Sign up for a free account to start creating charts.')}
                </p>
                <DocsCard type="info">
                  {t(
                    'docs_free_tier',
                    'The free tier includes unlimited charts and 5GB of storage.'
                  )}
                </DocsCard>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('docs_step_2', 'Step 2: Upload Your Data')}
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
                  {t('docs_step_3', 'Step 3: Choose a Chart Type')}
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
          <DocSection
            id="first-chart"
            title={t('docs_first_chart', 'Your First Chart')}
            icon={Icon}
          >
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('docs_first_chart_intro', "Let's create your first chart step by step:")}
            </p>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  1. {t('docs_navigate_charts', 'Navigate to Charts')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('docs_navigate_charts_desc', 'Click on "Charts" in the navigation menu.')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2. {t('docs_click_new_chart', 'Click "New Chart"')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('docs_click_new_chart_desc', 'This will open the chart creation wizard.')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  3. {t('docs_select_dataset', 'Select Your Dataset')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('docs_select_dataset_desc', 'Choose an existing dataset or upload a new one.')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4. {t('docs_configure_chart', 'Configure Your Chart')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_configure_chart_desc',
                    'Select chart type, axes, and customize appearance.'
                  )}
                </p>
              </div>
            </div>

            <DocsCard type="tip" title={t('docs_tip_preview', 'Tip')} className="mt-6">
              {t(
                'docs_tip_preview_desc',
                'Use the preview panel to see your chart update in real-time as you make changes.'
              )}
            </DocsCard>
          </DocSection>
        );

      case 'chart-editor':
        return (
          <DocSection
            id="chart-editor"
            title={t('docs_chart_editor', 'Using the Chart Editor')}
            icon={Icon}
          >
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
                  {t('docs_interface_overview', 'Interface Overview')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {t('docs_settings_panel', 'Left Panel: Settings')}
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
                      {t('docs_preview_panel', 'Right Panel: Preview')}
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
                  {t('docs_selecting_chart_type', '1. Chart Type Selection')}
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
                  {t('docs_basic_settings', '2. Basic Settings')}
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>{t('docs_chart_title', 'Title')}:</strong>{' '}
                    {t('docs_chart_title_desc', 'The main heading of your chart.')}
                  </li>
                  <li>
                    <strong>{t('docs_chart_subtitle', 'Description')}:</strong>{' '}
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
                  {t('docs_data_config', '3. Data Configuration')}
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
                      {t('docs_x_axis_config', 'X-Axis (Category/Time)')}
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
                      {t('docs_y_axis_config', 'Y-Axis (Values/Series)')}
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
                  {t('docs_axis_config', '4. Axis Configuration')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t('docs_axis_config_intro', 'Fine-tune how your axes are displayed:')}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_axis_labels', 'Show/Hide Labels')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_axis_titles', 'Custom Axis Titles')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_grid_lines', 'Grid Lines (Horizontal/Vertical)')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{t('docs_axis_scale', 'Scale (Min/Max values)')}</span>
                  </li>
                </ul>
              </div>

              {/* Appearance */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_appearance', '5. Appearance & Formatting')}
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('docs_colors', 'Colors')}
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
                      {t('docs_legend', 'Legend')}
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
                      {t('docs_tooltips', 'Tooltips')}
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
                  {t('docs_dataset_ops', '6. Dataset Operations')}
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
                      {t('docs_filter_data', 'Filter Data')}
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
                      {t('docs_sort_data', 'Sort Data')}
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
                      {t('docs_group_by', 'Group By & Aggregation')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t(
                        'docs_group_by_desc',
                        'Summarize data by grouping rows and applying aggregation functions.'
                      )}
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>{t('docs_agg_sum', 'Sum: Total of values')}</li>
                      <li>{t('docs_agg_avg', 'Average: Mean value')}</li>
                      <li>{t('docs_agg_count', 'Count: Number of records')}</li>
                      <li>{t('docs_agg_min', 'Min: Minimum value')}</li>
                      <li>{t('docs_agg_max', 'Max: Maximum value')}</li>
                    </ul>
                  </div>

                  {/* Pivot Table */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-700 p-5">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2 text-lg">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      {t('docs_pivot_table', 'Pivot Table')}
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
                          {t('docs_pivot_rows', 'Rows')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t(
                            'docs_pivot_rows_desc',
                            'Drag columns here to create row headers. Data will be grouped by these dimensions.'
                          )}
                        </p>
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                          {t('docs_pivot_rows_example', 'Example: platform, content_category')}
                        </div>
                      </div>

                      {/* Columns */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                          {t('docs_pivot_columns', 'Columns')}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t(
                            'docs_pivot_columns_desc',
                            'Drag columns here to create column headers. Creates a cross-tabulation.'
                          )}
                        </p>
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                          {t('docs_pivot_columns_example', 'Example: post_type, sentiment')}
                        </div>
                      </div>

                      {/* Values */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                          {t('docs_pivot_values', 'Values')}
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
                          {t('docs_pivot_filters', 'Filters')}
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
                  {t('docs_series_management', '7. Series Management')}
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
                      {t('docs_add_series', 'Add/Remove Series')}
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
                      {t('docs_series_colors', 'Customize Colors')}
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
                      {t('docs_line_styles', 'Line Styles & Markers')}
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
                  {t('docs_chart_specific', '8. Chart-Specific Settings')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pie/Donut */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_pie_settings', 'Pie/Donut Charts')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_pie_label', 'Label position (inside/outside)')}</li>
                      <li>• {t('docs_pie_donut_size', 'Donut hole size')}</li>
                      <li>• {t('docs_pie_start_angle', 'Start angle rotation')}</li>
                    </ul>
                  </div>

                  {/* Heatmap */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_heatmap_settings', 'Heatmap')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>
                        • {t('docs_heatmap_color_scheme', 'Color scheme (sequential/diverging)')}
                      </li>
                      <li>• {t('docs_heatmap_cell_labels', 'Show cell values')}</li>
                      <li>• {t('docs_heatmap_interpolation', 'Color interpolation')}</li>
                    </ul>
                  </div>

                  {/* Histogram */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_histogram_settings', 'Histogram')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_histogram_bins', 'Number of bins')}</li>
                      <li>• {t('docs_histogram_bin_size', 'Bin size/width')}</li>
                      <li>• {t('docs_histogram_cumulative', 'Cumulative distribution')}</li>
                    </ul>
                  </div>

                  {/* Cycle Plot */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_cycle_settings', 'Cycle Plot')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_cycle_period', 'Cycle period (daily/monthly/yearly)')}</li>
                      <li>• {t('docs_cycle_baseline', 'Show baseline/average')}</li>
                      <li>• {t('docs_cycle_highlight', 'Highlight specific cycles')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chart Formatter */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('docs_formatter', '9. Number & Date Formatting')}
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
                      {t('docs_number_format', 'Number Formatting')}
                    </h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_format_decimal', 'Decimal places (e.g., 1,234.56)')}</li>
                      <li>• {t('docs_format_percentage', 'Percentage (e.g., 45.2%)')}</li>
                      <li>• {t('docs_format_currency', 'Currency (e.g., $1,234.56)')}</li>
                      <li>• {t('docs_format_compact', 'Compact notation (e.g., 1.2M, 3.4K)')}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('docs_date_format', 'Date Formatting')}
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
                  {t('docs_export', '10. Import & Export')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_export_chart', 'Export Chart')}
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('docs_export_png', 'PNG: For presentations and reports')}</li>
                      <li>• {t('docs_export_svg', 'SVG: For high-quality scalable graphics')}</li>
                      <li>• {t('docs_export_pdf', 'PDF: For documents')}</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('docs_import_config', 'Import Configuration')}
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
          <DocSection id="chart-types" title={t('docs_chart_types', 'Chart Types')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('docs_chart_types_intro', 'DataVis supports a wide variety of chart types:')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_line_chart', 'Line Chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_line_chart_desc', 'Perfect for showing trends over time')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_bar_chart', 'Bar Chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_bar_chart_desc', 'Compare values across categories')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_pie_chart', 'Pie Chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_pie_chart_desc', 'Show proportions of a whole')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_scatter_chart', 'Scatter Chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_scatter_chart_desc', 'Explore relationships between variables')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_area_chart', 'Area Chart')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_area_chart_desc', 'Visualize cumulative totals')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_heatmap', 'Heatmap')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('docs_heatmap_desc', 'Show data density and patterns')}
                </p>
              </div>
            </div>
          </DocSection>
        );

      case 'data-sources':
        return (
          <DocSection id="data-sources" title={t('docs_data_sources', 'Data Sources')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('docs_data_sources_intro', 'DataVis supports multiple ways to import your data:')}
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_file_upload', 'File Upload')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('docs_file_upload_desc', 'Upload files in the following formats:')}
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
                  {t('docs_paste_data', 'Paste Data')}
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
                  {t('docs_sample_data', 'Sample Data')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_sample_data_desc',
                    'Try our pre-loaded sample datasets to explore features.'
                  )}
                </p>
              </div>
            </div>

            <DocsCard
              type="warning"
              title={t('docs_file_size_limit', 'File Size Limit')}
              className="mt-6"
            >
              {t(
                'docs_file_size_limit_desc',
                'Maximum file size is 50MB. For larger datasets, consider splitting your data or using our API.'
              )}
            </DocsCard>
          </DocSection>
        );

      case 'upload-data':
        return (
          <DocSection id="upload-data" title={t('docs_upload_data', 'Upload Data')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('docs_data_sources_intro', 'DataVis supports multiple ways to import your data:')}
            </p>

            <div className="space-y-6">
              <DocsCard type="info" title={t('docs_file_upload', 'File Upload')}>
                <p className="mb-2">
                  {t('docs_file_upload_desc', 'Upload files in the following formats:')}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CSV (.csv)</li>
                  <li>Excel (.xlsx, .xls)</li>
                  <li>JSON (.json)</li>
                  <li>TSV (.tsv)</li>
                </ul>
              </DocsCard>

              <DocsCard type="tip" title={t('docs_paste_data', 'Paste Data')}>
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
          <DocSection
            id="clean-data"
            title={t('docs_clean_data', 'Clean Data with AI')}
            icon={Icon}
          >
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
                    {t('docs_clean_numbers', 'Standardize Number Formats')}
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
                    {t('docs_clean_duplicates', 'Remove Duplicates')}
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
                    {t('docs_clean_text', 'Clean Text Fields')}
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

            <DocsCard type="tip" title={t('docs_ai_tip', 'Pro Tip')}>
              {t(
                'docs_ai_tip_desc',
                'You can provide custom notes to guide the AI cleaning process for domain-specific data.'
              )}
            </DocsCard>
          </DocSection>
        );

      case 'themes':
        return (
          <DocSection id="themes" title={t('docs_themes', 'Themes')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('docs_themes_intro', 'Customize the appearance of your charts with themes:')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mb-3"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('docs_theme_default', 'Default')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('docs_theme_default_desc', 'Clean and professional')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-full h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('docs_theme_dark', 'Dark')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('docs_theme_dark_desc', 'Easy on the eyes')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-full h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mb-3"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('docs_theme_custom', 'Custom')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('docs_theme_custom_desc', 'Create your own')}
                </p>
              </div>
            </div>
          </DocSection>
        );

      case 'data-viz-tips':
        return (
          <DocSection
            id="data-viz-tips"
            title={t('docs_data_viz_tips', 'Data Visualization Tips')}
            icon={Icon}
          >
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t(
                'docs_best_practices_intro',
                'Follow these best practices to create effective visualizations:'
              )}
            </p>

            <div className="space-y-4">
              <DocsCard type="tip" title={t('docs_tip_1_title', 'Choose the Right Chart Type')}>
                {t(
                  'docs_tip_1_desc',
                  'Use line charts for trends, bar charts for comparisons, and pie charts for proportions. Match the chart type to your data and message.'
                )}
              </DocsCard>

              <DocsCard type="tip" title={t('docs_tip_2_title', 'Keep It Simple')}>
                {t(
                  'docs_tip_2_desc',
                  'Avoid cluttering your charts with too much information. Focus on the key message you want to convey.'
                )}
              </DocsCard>

              <DocsCard type="tip" title={t('docs_tip_3_title', 'Use Color Purposefully')}>
                {t(
                  'docs_tip_3_desc',
                  'Use color to highlight important data points or group related items. Ensure sufficient contrast for readability.'
                )}
              </DocsCard>

              <DocsCard type="tip" title={t('docs_tip_4_title', 'Label Clearly')}>
                {t(
                  'docs_tip_4_desc',
                  'Always include clear axis labels, titles, and legends. Your audience should understand the chart without additional explanation.'
                )}
              </DocsCard>

              <DocsCard
                type="warning"
                title={t('docs_warning_misleading', 'Avoid Misleading Visualizations')}
              >
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
          <DocSection id="performance" title={t('docs_performance', 'Performance')} icon={Icon}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t(
                'docs_performance_intro',
                'Tips for optimizing chart performance with large datasets:'
              )}
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('docs_perf_1_title', 'Limit Data Points')}
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
                  {t('docs_perf_2_title', 'Use Appropriate Chart Types')}
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
                  {t('docs_perf_3_title', 'Disable Animations')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(
                    'docs_perf_3_desc',
                    'For very large datasets, consider disabling animations to improve rendering performance.'
                  )}
                </p>
              </div>
            </div>

            <DocsCard type="info" title={t('docs_need_help', 'Need Help?')} className="mt-6">
              <p className="mb-2">
                {t('docs_need_help_desc', 'If you have questions or need assistance:')}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('docs_help_1', 'Check our FAQ section')}</li>
                <li>{t('docs_help_2', 'Contact support at support@datavis.com')}</li>
                <li>{t('docs_help_3', 'Join our community forum')}</li>
              </ul>
            </DocsCard>
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
                  {t('docs_title', 'DataVis Documentation')}
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
                <span className="hidden sm:inline">
                  {t('docs_download_pdf', 'Xem tài liệu qua file')}
                </span>
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
            {t('docs_keyboard_hint', 'Use ← → arrow keys to navigate')}
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
