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
        { id: 'chart-types', title: t('docs_chart_types', 'Chart Types') },
        { id: 'data-sources', title: t('docs_data_sources', 'Data Sources') },
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
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
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
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
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
