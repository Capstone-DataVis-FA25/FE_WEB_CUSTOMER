import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
  Map,
  Table2,
  TrendingUp,
  Users,
  Shield,
  Smartphone,
  Download,
  Palette,
  BookOpen,
  HeadphonesIcon,
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import { containerVariants, cardVariants, fadeVariants } from '@/theme/animation/animation.config';
import D3BarChart from '@/components/charts/D3BarChart';
import D3LineChart from '@/components/charts/D3LineChart';
import D3PieChart from '@/components/charts/page.example/home_chart_sample/D3PieChart';
import D3ScatterPlot from '@/components/charts/page.example/home_chart_sample/D3ScatterPlot';
import D3AreaChart from '@/components/charts/page.example/home_chart_sample/D3AreaChart';
import D3TrendChart from '@/components/charts/page.example/home_chart_sample/D3TrendChart';
import D3MapChart from '@/components/charts/page.example/home_chart_sample/D3MapChart';
import D3TableChart from '@/components/charts/page.example/home_chart_sample/D3TableChart';
import { datasets } from '@/components/charts/data/data';
import Lottie from 'lottie-react';
import ChartAnimationData from '../../assets/lottie/line-chart.json';

const NewHomePage: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState<string>('bar');

  // Chart types data
  const chartTypes = [
    {
      id: 'bar',
      icon: BarChart3,
      title: 'Bar Chart',
      description:
        'The classic bar chart — unbeaten in simplicity, and more readable than a column chart on mobile screens.',
      color: 'bg-blue-500',
      dataKey: 'sales',
      component: D3BarChart,
      chartConfig: {
        barType: 'grouped' as const,
        showLegend: true,
        showGrid: true,
      },
    },
    {
      id: 'line',
      icon: LineChart,
      title: 'Line Chart',
      description:
        'Perfect for showing trends over time. Connect data points to show how values change.',
      color: 'bg-green-500',
      dataKey: 'quarterly',
      component: D3LineChart,
      chartConfig: {
        showGrid: true,
        showLegend: true,
        lineType: 'curved' as const,
      },
    },
    {
      id: 'pie',
      icon: PieChart,
      title: 'Pie Chart',
      description:
        'Show parts of a whole with this classic circular chart. Best for simple proportions.',
      color: 'bg-purple-500',
      dataKey: 'pie',
      component: D3PieChart,
      chartConfig: {
        showLegend: true,
        showLabels: true,
      },
    },
    {
      id: 'scatter',
      icon: ScatterChart,
      title: 'Scatter Plot',
      description: 'Explore relationships between two variables. Great for correlation analysis.',
      color: 'bg-orange-500',
      dataKey: 'scatter',
      component: D3ScatterPlot,
      chartConfig: {
        showGrid: true,
      },
    },
    {
      id: 'area',
      icon: AreaChart,
      title: 'Area Chart',
      description:
        'Like line charts, but with filled areas. Perfect for showing quantities over time.',
      color: 'bg-teal-500',
      dataKey: 'area',
      component: D3AreaChart,
      chartConfig: {
        showGrid: true,
        showLegend: true,
        isStacked: false,
      },
    },
    {
      id: 'map',
      icon: Map,
      title: 'Maps',
      description:
        'Visualize geographic data with interactive maps. Show regional differences clearly.',
      color: 'bg-red-500',
      dataKey: 'map',
      component: D3MapChart,
      chartConfig: {
        showLegend: true,
      },
    },
    {
      id: 'table',
      icon: Table2,
      title: 'Tables',
      description:
        'Sometimes the best visualization is a well-designed table. Sort and search enabled.',
      color: 'bg-indigo-500',
      dataKey: 'table',
      component: D3TableChart,
      chartConfig: {
        searchable: true,
        sortable: true,
        pagination: true,
      },
    },
    {
      id: 'trend',
      icon: TrendingUp,
      title: 'Trend Chart',
      description: 'Highlight trends and patterns in your data with advanced trend analysis.',
      color: 'bg-pink-500',
      dataKey: 'trend',
      component: D3TrendChart,
      chartConfig: {
        showGrid: true,
        showTrendLine: true,
        showDataPoints: true,
      },
    },
  ];

  // Function to render chart preview
  const renderChartPreview = (chartType: any) => {
    const dataset = datasets[chartType.dataKey as keyof typeof datasets];

    if (!chartType.component || !dataset) {
      return (
        <div
          className="bg-gradient-to-br from-muted to-muted/50 rounded-lg p-12 shadow-lg flex items-center justify-center"
          style={{ width: '800px', height: '500px' }}
        >
          <div className="text-center">
            <div
              className={`w-16 h-16 ${chartType.color} rounded-lg flex items-center justify-center mx-auto mb-4`}
            >
              <chartType.icon className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Preview coming soon</p>
          </div>
        </div>
      );
    }

    const ChartComponent = chartType.component;

    if (chartType.id === 'bar') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            xAxisKey={(dataset as any).xKey}
            yAxisKeys={(dataset as any).yKeys}
            colors={(dataset as any).colors}
            title={dataset.name}
            xAxisLabel={(dataset as any).xLabel}
            yAxisLabel={(dataset as any).yLabel}
            showLegend={chartType.chartConfig.showLegend}
            showGrid={chartType.chartConfig.showGrid}
            animationDuration={800}
            barType={chartType.chartConfig.barType}
          />
        </div>
      );
    }

    if (chartType.id === 'line') {
      return (
        <div className="w-full h-full bg-background rounded-lg p-4">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            xAxisKey={(dataset as any).xKey}
            yAxisKeys={(dataset as any).yKeys}
            colors={(dataset as any).colors}
            title={dataset.name}
            xAxisLabel={(dataset as any).xLabel}
            yAxisLabel={(dataset as any).yLabel}
            showLegend={chartType.chartConfig.showLegend}
            showGrid={chartType.chartConfig.showGrid}
            animationDuration={800}
            lineType={chartType.chartConfig.lineType}
          />
        </div>
      );
    }

    if (chartType.id === 'pie') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            valueKey={(dataset as any).valueKey}
            categoryKey={(dataset as any).categoryKey}
            title={(dataset as any).title}
            showLegend={chartType.chartConfig.showLegend}
            showLabels={chartType.chartConfig.showLabels}
            animationDuration={800}
          />
        </div>
      );
    }

    if (chartType.id === 'scatter') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            xAxisKey={(dataset as any).xKey}
            yAxisKey={(dataset as any).yKey}
            sizeKey={(dataset as any).sizeKey}
            colorKey={(dataset as any).colorKey}
            title={(dataset as any).title}
            xAxisLabel={(dataset as any).xLabel}
            yAxisLabel={(dataset as any).yLabel}
            showGrid={chartType.chartConfig.showGrid}
            animationDuration={800}
          />
        </div>
      );
    }

    if (chartType.id === 'area') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            xAxisKey={(dataset as any).xKey}
            yAxisKey={(dataset as any).yKey}
            groupKey={(dataset as any).groupKey}
            title={(dataset as any).title}
            xAxisLabel={(dataset as any).xLabel}
            yAxisLabel={(dataset as any).yLabel}
            showGrid={chartType.chartConfig.showGrid}
            showLegend={chartType.chartConfig.showLegend}
            isStacked={chartType.chartConfig.isStacked}
            animationDuration={800}
          />
        </div>
      );
    }

    if (chartType.id === 'trend') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            xAxisKey={(dataset as any).xKey}
            yAxisKey={(dataset as any).yKey}
            title={(dataset as any).title}
            xAxisLabel={(dataset as any).xLabel}
            yAxisLabel={(dataset as any).yLabel}
            showGrid={chartType.chartConfig.showGrid}
            showTrendLine={chartType.chartConfig.showTrendLine}
            showDataPoints={chartType.chartConfig.showDataPoints}
            animationDuration={800}
          />
        </div>
      );
    }

    if (chartType.id === 'map') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            width={750}
            height={450}
            margin={{ top: 30, right: 40, bottom: 60, left: 70 }}
            title={(dataset as any).title}
            showLegend={chartType.chartConfig.showLegend}
            animationDuration={800}
          />
        </div>
      );
    }

    if (chartType.id === 'table') {
      return (
        <div className="bg-background rounded-lg p-6 shadow-lg">
          <ChartComponent
            data={dataset.data}
            title={(dataset as any).title}
            searchable={chartType.chartConfig.searchable}
            sortable={chartType.chartConfig.sortable}
            pagination={chartType.chartConfig.pagination}
            pageSize={5}
            striped={true}
            bordered={true}
            hoverable={true}
            compact={true}
          />
        </div>
      );
    }

    return null;
  };

  // Get selected chart data
  const selectedChartData = chartTypes.find(chart => chart.id === selectedChart);

  // Features data
  const features = [
    {
      icon: Sparkles,
      title: 'Unlimited Visualizations',
      description:
        "Even with the free plan, there's no limit to the number of charts, maps, and tables you can create.",
    },
    {
      icon: Palette,
      title: 'Comes in Your Design',
      description:
        "Send us your style guide and we'll create a custom design theme for your brand, 100% white-labeled.",
    },
    {
      icon: Shield,
      title: 'Private by Default',
      description:
        'No matter which plan you choose, all your visualizations and data are private until you hit the "Publish" button.',
    },
    {
      icon: Smartphone,
      title: 'Responsive',
      description:
        'On desktop devices, tablets, or smartphones — visualizations are beautiful and readable everywhere.',
    },
    {
      icon: Users,
      title: 'Collaborate in Teams',
      description:
        'Make use of shared folders, integrations, and admin permissions to see what your team is creating.',
    },
    {
      icon: Zap,
      title: 'Automate Chart Creation',
      description:
        'Create, update, and export visualizations without a single click, using our state-of-the-art API.',
    },
    {
      icon: Target,
      title: 'Works for Big Audiences',
      description:
        'Visualizations scale to the largest audiences and support even millions of viewers.',
    },
    {
      icon: Download,
      title: 'PNG, SVG, PDF Export',
      description:
        'Export every visualization as PNG, SVG, or PDF and continue working with tools like Adobe Illustrator.',
    },
  ];

  // Success stories
  const successStories = [
    {
      company: 'The New York Times',
      description:
        'Leading publication using our platform for daily data journalism and breaking news visualization.',
      logo: '/api/placeholder/120/60',
      case: 'Election Coverage 2024',
    },
    {
      company: 'WIRED Magazine',
      description:
        'Tech magazine explaining complex topics with custom dark themes and interactive charts.',
      logo: '/api/placeholder/120/60',
      case: 'Tech Stock Analysis',
    },
    {
      company: 'Brennan Center',
      description:
        'Nonpartisan law institute presenting policy facts with clear, accessible visualizations.',
      logo: '/api/placeholder/120/60',
      case: 'Policy Impact Studies',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div className="max-w-4xl mx-auto text-center lg:text-left">
              {/* <motion.div variants={fadeVariants} className="mb-6">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Beautiful Charts
                </Badge>
              </motion.div> */}

              <motion.h1
                variants={fadeVariants}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
              >
                Create beautiful charts with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DataVis
                </span>
              </motion.h1>

              <motion.p
                variants={fadeVariants}
                className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed"
              >
                Responsive & easy-to-use chart types for every need. No coding required.
              </motion.p>

              <motion.div
                variants={fadeVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Build Your Own Chart
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Examples
                </Button>
              </motion.div>

              <motion.p variants={fadeVariants} className="text-sm text-muted-foreground mt-4">
                It's free & no sign-up is required
              </motion.p>
            </div>
            {/* Right: Lottie animation placeholder */}
            <div className="flex items-center justify-center w-full h-full py-5">
              {/* Lottie animation sẽ đặt ở đây */}
              <Lottie animationData={ChartAnimationData} loop={true} className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </motion.section>

      {/* Chart Types Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeVariants} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Responsive & easy-to-use chart types for every need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select a chart type to see what it can do
            </p>
          </motion.div>

          {/* Two Column Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column: Chart Types Grid */}
              <div className="space-y-8">
                <motion.div variants={containerVariants} className="grid grid-cols-5 gap-4">
                  {chartTypes.map((chart, index) => {
                    const IconComponent = chart.icon;
                    return (
                      <motion.div
                        key={chart.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer"
                        onClick={() => setSelectedChart(chart.id)}
                        custom={index}
                      >
                        <div
                          className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 border-2 ${
                            selectedChart === chart.id
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Selected Chart Info */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedChart}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {selectedChartData?.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {selectedChartData?.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="group"
                      onClick={() =>
                        (window.location.href =
                          selectedChart === 'bar'
                            ? '/demo/bar-chart-editor'
                            : '/demo/line-chart-editor')
                      }
                    >
                      Learn more about our {selectedChartData?.title.toLowerCase()}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Column: Chart Preview */}
              <div className="lg:sticky lg:top-8">
                <Card className="overflow-hidden border-0">
                  <CardContent className="p-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedChart}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="w-full min-h-[600px] bg-[#18181b] flex items-center justify-center"
                      >
                        <div className="w-fit h-fit">{renderChartPreview(selectedChartData)}</div>
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 lg:py-32 bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeVariants} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              More than static charts: responsive, customizable and live-updating
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Here's what will make your life easier
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div key={index} variants={cardVariants} custom={index} whileHover="hover">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Success Stories */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeVariants} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              You're in good company
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leading publications like The New York Times and WIRED build charts with DataVis.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div key={index} variants={cardVariants} custom={index} whileHover="hover">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-30 h-8 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{story.company}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-3">{story.case}</h3>
                    <p className="text-muted-foreground mb-4">{story.description}</p>
                    <Button variant="outline" size="sm" className="group">
                      View Case Study
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Help Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 lg:py-32 bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeVariants} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Need help creating DataVis charts?
            </h2>
            <p className="text-xl text-muted-foreground">We're here for you.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Visit our Academy</h3>
                  <p className="text-muted-foreground mb-6">
                    Over 250+ Academy articles explain how to create each chart type, step by step.
                    Plus: how to upload data, embed charts, and more.
                  </p>
                  <Button className="group">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Academy
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <HeadphonesIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Contact Support</h3>
                  <p className="text-muted-foreground mb-6">
                    If you still have questions after consulting our Academy, do write us! Our
                    customer happiness team will be back in touch as quickly as possible.
                  </p>
                  <Button variant="outline" className="group">
                    <HeadphonesIcon className="w-4 h-4 mr-2" />
                    Get Support
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="relative overflow-hidden">
              <CardContent className="p-12 text-center relative z-10">
                <motion.div variants={fadeVariants}>
                  <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                    Try it for yourself, without signing up
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8">
                    No data? You can use our sample data.
                  </p>
                  <Button
                    size="lg"
                    className="text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                    Create a Chart
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </CardContent>

              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
            </Card>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default NewHomePage;
