import React, { useState, useEffect } from 'react';
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
import {
  containerVariants,
  cardVariants,
  slideVariants,
  scaleVariants,
  repeatableVariants,
  viewportConfigs,
} from '@/theme/animation/animation.config';
import Lottie from 'lottie-react';
import ChartAnimationData from '../../assets/lottie/line-chart.json';
import BannerVideo from '../../assets/videos/video_demo.mp4';
import CreateDemoVideo from '../../assets/videos/create_demo.mp4';
import { useTranslation } from 'react-i18next';
import ChartPreview from '@/components/charts/gallery-chart-preview/ChartPreview';
import Routers from '@/router/routers';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { homeSteps } from '@/config/driver-steps/index';
import { useAuth } from '@/features/auth/useAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartDataPoint = any;

const HomePage: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState<string>('bar');
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const storageKey = `hasShownHomeTour_${user.id}`;
      const hasShownTour = localStorage.getItem(storageKey);

      if (hasShownTour !== 'true') {
        const driverObj = driver({
          showProgress: true,
          steps: homeSteps,
          popoverClass: 'driverjs-theme',
          overlayOpacity: 0,
        });

        setTimeout(() => {
          driverObj.drive();
          localStorage.setItem(storageKey, 'true');
        }, 1500);
      }
    }
  }, [isAuthenticated, user]);

  // Chart types data
  const chartTypes = [
    {
      id: 'bar',
      icon: BarChart3,
      title: t('home_barChart_title'),
      description: t('home_barChart_desc'),
      color: 'bg-blue-500',
    },
    {
      id: 'line',
      icon: LineChart,
      title: t('home_lineChart_title'),
      description: t('home_lineChart_desc'),
      color: 'bg-green-500',
    },
    {
      id: 'area',
      icon: AreaChart,
      title: t('home_areaChart_title'),
      description: t('home_areaChart_desc'),
      color: 'bg-teal-500',
    },
    {
      id: 'pie',
      icon: PieChart,
      title: t('home_pieChart_title'),
      description: t('home_pieChart_desc'),
      color: 'bg-purple-500',
    },
    {
      id: 'scatter',
      icon: ScatterChart,
      title: t('home_scatterChart_title'),
      description: t('home_scatterChart_desc'),
      color: 'bg-orange-500',
    },
    {
      id: 'map',
      icon: Map,
      title: t('home_mapChart_title'),
      description: t('home_mapChart_desc'),
      color: 'bg-red-500',
    },
    {
      id: 'table',
      icon: Table2,
      title: t('home_tableChart_title'),
      description: t('home_tableChart_desc'),
      color: 'bg-indigo-500',
    },
    {
      id: 'trend',
      icon: TrendingUp,
      title: t('home_trendChart_title'),
      description: t('home_trendChart_desc'),
      color: 'bg-pink-500',
    },
  ];

  // Function to render chart preview using SVG icons
  const renderChartPreview = (chartType: ChartDataPoint) => {
    const PREVIEW_W = 420;
    const PREVIEW_H = 420;

    return (
      <div
        className="flex items-center justify-center rounded-2xl border-2 border-gray-700/40 dark:border-gray-700/50 bg-white/5 dark:bg-gray-900/40 shadow-xl overflow-hidden"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        <ChartPreview type={chartType.id} className="w-full h-full p-8" />
      </div>
    );
  };

  // Get selected chart data
  const selectedChartData = chartTypes.find(chart => chart.id === selectedChart);

  // Features data
  const features = [
    {
      icon: Sparkles,
      title: t('home_feature_unlimited_title'),
      description: t('home_feature_unlimited_desc'),
    },
    {
      icon: Palette,
      title: t('home_feature_design_title'),
      description: t('home_feature_design_desc'),
    },
    {
      icon: Shield,
      title: t('home_feature_private_title'),
      description: t('home_feature_private_desc'),
    },
    {
      icon: Smartphone,
      title: t('home_feature_responsive_title'),
      description: t('home_feature_responsive_desc'),
    },
    {
      icon: Users,
      title: t('home_feature_team_title'),
      description: t('home_feature_team_desc'),
    },
    {
      icon: Zap,
      title: t('home_feature_automate_title'),
      description: t('home_feature_automate_desc'),
    },
    {
      icon: Target,
      title: t('home_feature_audience_title'),
      description: t('home_feature_audience_desc'),
    },
    {
      icon: Download,
      title: t('home_feature_export_title'),
      description: t('home_feature_export_desc'),
    },
  ];

  // Success stories
  const successStories = [
    {
      company: t('home_story_nyt_company'),
      description: t('home_story_nyt_desc'),
      logo: '/api/placeholder/120/60',
      case: t('home_story_nyt_case'),
    },
    {
      company: t('home_story_wired_company'),
      description: t('home_story_wired_desc'),
      logo: '/api/placeholder/120/60',
      case: t('home_story_wired_case'),
    },
    {
      company: t('home_story_brennan_company'),
      description: t('home_story_brennan_desc'),
      logo: '/api/placeholder/120/60',
      case: t('home_story_brennan_case'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="relative py-20 lg:py-32 z-10"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* LEFT CONTENT */}
            <motion.div
              variants={slideVariants.slideInLeft}
              className="max-w-4xl mx-auto text-center lg:text-left"
            >
              <motion.h1
                variants={slideVariants.slideInLeft}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
              >
                Create beautiful charts with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DataVis
                </span>
              </motion.h1>

              <motion.p
                variants={slideVariants.slideInLeft}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed"
              >
                Responsive & easy-to-use chart types for every need. No coding required.
              </motion.p>

              <motion.div
                variants={slideVariants.slideInLeft}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
              >
                <Button
                  id="hero-cta-build-chart"
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
            </motion.div>
            {/* RIGHT CONTENT: Animation */}
            <motion.div
              variants={slideVariants.slideInRight}
              className="flex items-center justify-center w-full h-full py-5"
            >
              <motion.div
                key={'video_section_1'}
                variants={scaleVariants}
                transition={{ delay: 0.8 }}
              >
                <Lottie animationData={ChartAnimationData} loop={true} className="w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
          {/* BACKGROUND ANIMATION */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
          </div>
        </div>
      </motion.section>

      {/* Chart Types Section */}
      <motion.section
        id="chart-types-section"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4  bg-gradient-to-br bg-[var(--gradient-main)]">
          <motion.div
            variants={repeatableVariants.slideRepeatBottom}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t('home_chartTypes_title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home_chartTypes_desc')}
            </p>
          </motion.div>

          {/* Two Column Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column: Chart Types Grid */}
              <motion.div
                variants={repeatableVariants.slideRepeatLeft}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfigs.repeat}
                className="space-y-8"
              >
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
                            ? Routers.BAR_CHART_EDITOR_DEMO
                            : selectedChart === 'line'
                              ? Routers.LINE_CHART_EDITOR_DEMO
                              : Routers.AREA_CHART_EDITOR_DEMO)
                      }
                    >
                      Learn more about our {selectedChartData?.title.toLowerCase()}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Right Column: Chart Preview */}
              <motion.div
                variants={repeatableVariants.slideRepeatRight}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfigs.repeat}
                className="lg:sticky lg:top-8"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedChart}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-full flex items-center justify-center py-4"
                  >
                    {renderChartPreview(selectedChartData)}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.div
        id="features-section"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4 bg-gradient-to-r ">
          <motion.div
            variants={repeatableVariants.slideRepeatBottom}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t('home_features_title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home_features_desc')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={repeatableVariants.slideRepeatBottom}
                  custom={index}
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-bg-primary/10 transform transition-transform duration-300 ease-in-out hover:scale-105 hover:delay-150">
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
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        key={'video_section_1'}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        transition={{ delay: 0.2 }}
      >
        <section className="py-20 lg:py-32 bg-gradient-to-l from-bg-blue-20 to-bg-blue-800 ">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <motion.div
                variants={slideVariants.slideInLeft}
                className="rounded-4xl flex items-center justify-center w-full h-full"
              >
                {/* Animation added next to video */}
                <video
                  src={CreateDemoVideo}
                  className="w-full h-full object-cover rounded-4xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </motion.div>
              <motion.div
                variants={slideVariants.slideInRight}
                className="flex items-center justify-center h-full"
              >
                <div className="rounded-2xl flex flex-col justify-center h-full">
                  <h2 className="text-3xl lg:text-5xl font-bold text-light mb-6">
                    {t('home_interactive_title')}
                  </h2>
                  <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                    {t('home_interactive_desc')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.div>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div
              variants={slideVariants.slideInLeft}
              className="rounded-2xl flex flex-col justify-center h-full"
            >
              <h2 className="text-3xl lg:text-5xl font-bold text-light mb-6">
                {t('home_share_title')}
              </h2>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                {t('home_share_desc')}
              </p>
            </motion.div>
            <motion.div
              variants={slideVariants.slideInRight}
              className="flex items-center justify-center h-full"
            >
              <div className="rounded-4xl  flex items-center justify-center w-full h-full">
                <video
                  src={BannerVideo}
                  className="w-full h-full object-cover rounded-4xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Success Stories */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="py-20 lg:py-32 "
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={slideVariants.slideInBottom}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t('home_stories_title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home_stories_desc')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
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
          </motion.div>
        </div>
      </motion.section>

      {/* Help Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="py-20 lg:py-32 bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={slideVariants.slideInBottom}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t('home_help_title')}
            </h2>
            <p className="text-xl text-muted-foreground">{t('home_help_desc')}</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.div variants={slideVariants.slideInLeft} whileHover="hover">
              <Card className="h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {t('home_help_academy_title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">{t('home_help_academy_desc')}</p>
                  <Button className="group">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t('home_help_academy_btn')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideVariants.slideInRight} whileHover="hover">
              <Card className="h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <HeadphonesIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {t('home_help_support_title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">{t('home_help_support_desc')}</p>
                  <Button variant="outline" className="group">
                    <HeadphonesIcon className="w-4 h-4 mr-2" />
                    {t('home_help_support_btn')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="py-20 lg:py-32"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            whileHover="hover"
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-12 text-center relative z-10">
                <motion.div
                  variants={slideVariants.slideInBottom}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                    {t('home_cta_title')}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8">{t('home_cta_desc')}</p>
                  <Button
                    size="lg"
                    className="text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                    {t('home_cta_btn')}
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

export default HomePage;
