import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AboutUsAnimation from '../../assets/lottie/data-about-us.json';
import {
  BarChart3,
  Users,
  Target,
  Lightbulb,
  Database,
  Shield,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Eye,
  Heart,
  Award,
  Globe,
  Clock,
  Play,
  Youtube,
} from 'lucide-react';
import {
  containerVariants,
  scaleVariants,
  buttonVariants,
  repeatableVariants,
  viewportConfigs,
} from '@/theme/animation/animation.config';
import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';

const features = [
  {
    icon: Database,
    titleKey: 'about_feature_processing_title',
    descriptionKey: 'about_feature_processing_description',
  },
  {
    icon: BarChart3,
    titleKey: 'about_feature_dashboards_title',
    descriptionKey: 'about_feature_dashboards_description',
  },
  {
    icon: TrendingUp,
    titleKey: 'about_feature_analytics_title',
    descriptionKey: 'about_feature_analytics_description',
  },
  {
    icon: Users,
    titleKey: 'about_feature_collaboration_title',
    descriptionKey: 'about_feature_collaboration_description',
  },
  {
    icon: Shield,
    titleKey: 'about_feature_security_title',
    descriptionKey: 'about_feature_security_description',
  },
  {
    icon: Globe,
    titleKey: 'about_feature_scale_title',
    descriptionKey: 'about_feature_scale_description',
  },
];

const achievements = [
  { number: '500K+', labelKey: 'about_stats_daily_points' },
  { number: '1,200+', labelKey: 'about_stats_clients' },
  { number: '99.9%', labelKey: 'about_stats_uptime' },
  { number: '50+', labelKey: 'about_stats_countries' },
];

const showcaseImages = [
  {
    titleKey: 'about_showcase_realtime_title',
    descriptionKey: 'about_showcase_realtime_description',
    image: new URL('../../assets/images/showcase_dashboard.png', import.meta.url).href,
    categoryKey: 'about_showcase_realtime_category',
  },
  {
    titleKey: 'about_showcase_exploration_title',
    descriptionKey: 'about_showcase_exploration_description',
    image: new URL('../../assets/images/showcase_exploration.png', import.meta.url).href,
    categoryKey: 'about_showcase_exploration_category',
  },
  {
    titleKey: 'about_showcase_reporting_title',
    descriptionKey: 'about_showcase_reporting_description',
    image: new URL('../../assets/images/showcase_reporting.png', import.meta.url).href,
    categoryKey: 'about_showcase_reporting_category',
  },
  {
    titleKey: 'about_showcase_mobile_title',
    descriptionKey: 'about_showcase_mobile_description',
    image: new URL('../../assets/images/showcase_mobile.png', import.meta.url).href,
    categoryKey: 'about_showcase_mobile_category',
  },
  {
    titleKey: 'about_showcase_ai_title',
    descriptionKey: 'about_showcase_ai_description',
    image: new URL('../../assets/images/showcase_ai.png', import.meta.url).href,
    categoryKey: 'about_showcase_ai_category',
  },
  {
    titleKey: 'about_showcase_integration_title',
    descriptionKey: 'about_showcase_integration_description',
    image: new URL('../../assets/images/showcase_integration.png', import.meta.url).href,
    categoryKey: 'about_showcase_integration_category',
  },
];

const teamMembers = [
  {
    name: 'Hoang Nguyen',
    position: 'Frontend Developer',
    image: new URL('../../assets/images/LeKimHoangNguyen.jpg', import.meta.url).href,
  },
  {
    name: 'Duy An',
    position: 'Frontend Developerr',
    image:
      'https://res.cloudinary.com/dfvy81evi/image/upload/v1757342654/z6991026704957_9a602069656ab79c01848a41e6ee1f93_ynrw0g.jpg',
  },
  {
    name: 'Trong Hung',
    position: 'Frontend Developer',
    image: new URL('../../assets/images/PhamTrongHung.jpg', import.meta.url).href,
  },
  {
    name: 'Cong Minh',
    position: 'Backend Developer',
    image: new URL('../../assets/images/HoangCongMinh.jpg', import.meta.url).href,
  },
  {
    name: 'Thai Bao',
    position: 'Backend Developer',
    image: new URL('../../assets/images/PhanQuocThaiBao.jpg', import.meta.url).href,
  },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50  to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t border-blue-100 dark:border-gray-800" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
            variants={containerVariants}
          >
            <motion.div variants={repeatableVariants.slideRepeatLeft} className="space-y-8">
              <motion.div
                variants={repeatableVariants.slideRepeatBottom}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6">
                  {t('navigation_about')}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  {t('about_subtitle')}
                </p>
              </motion.div>
              <motion.div
                variants={repeatableVariants.fadeElastic}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg transition-all duration-300">
                    {t('about_view_platform')}
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-600 dark:text-blue-300"
                  >
                    {t('about_contact_email_title')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Space for Lottie Animation */}
            <motion.div
              variants={repeatableVariants.slideRepeatRight}
              className="flex items-center justify-center min-h-[400px] lg:min-h-[500px]"
            >
              <motion.div
                variants={repeatableVariants.bounceIn}
                transition={{ delay: 0.6 }}
                className="w-full h-full max-w-lg max-h-lg rounded-2xl border-2 border-none flex items-center justify-center backdrop-blur-sm"
                style={{ minHeight: '400px' }}
              >
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <Lottie animationData={AboutUsAnimation} loop={true} className="w-full h-full" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50 dark:bg-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={repeatableVariants.bounceIn} className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">
              {t('about_achievements_title')}
            </h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
            variants={containerVariants}
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={repeatableVariants.slideRepeatBottom}
                custom={index}
                className="text-center"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                  {achievement.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {t(achievement.labelKey)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="py-16 px-4 bg-gradient-to-br bg-white dark:bg-gray-900  border-gray-200 dark:border-gray-700"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={repeatableVariants.fadeElastic} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about_showcase_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about_showcase_description')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
            variants={containerVariants}
          >
            {showcaseImages.map((item, index) => (
              <motion.div
                key={index}
                variants={repeatableVariants.slideRepeatBottom}
                custom={index}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={item.image || '/placeholder.svg'}
                      alt={t(item.titleKey)}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        {t(item.categoryKey)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          size="sm"
                          className="bg-white/90 text-gray-800 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 shadow-lg"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {t('about_view_demo')}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t(item.descriptionKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={scaleVariants} className="text-center mt-12">
            <Button
              size="lg"
              className="px-8 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-105"
            >
              <Eye className="mr-2 h-5 w-5" />
              {t('about_view_all_features')}
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
          >
            <motion.div
              variants={repeatableVariants.slideRepeatLeft}
              whileHover="hover"
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full text-center p-8 border-2 border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                    {t('about_mission_title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t('about_mission_description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={repeatableVariants.slideRepeatBottom}
              whileHover="hover"
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full text-center p-8 border-2 border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                    <Lightbulb className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">
                    {t('about_vision_title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t('about_vision_description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={repeatableVariants.slideRepeatRight}
              whileHover="hover"
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full text-center p-8 border-2 border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                    <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
                    {t('about_values_title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t('about_values_description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-900  border-gray-200 dark:border-gray-700"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={repeatableVariants.bounceIn} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about_features_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about_features_description')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={repeatableVariants.slideRepeatBottom}
                whileHover="hover"
                custom={index}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t(feature.descriptionKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Awards Section */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={repeatableVariants.fadeElastic} className="mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about_awards_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('about_awards_description')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
          >
            <motion.div
              variants={repeatableVariants.slideRepeatLeft}
              className="text-center group"
              transition={{ delay: 0.1 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_award_platform_title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('about_award_platform_source')}
              </p>
            </motion.div>

            <motion.div
              variants={repeatableVariants.slideRepeatBottom}
              className="text-center group"
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_award_innovation_title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('about_award_innovation_source')}
              </p>
            </motion.div>

            <motion.div
              variants={repeatableVariants.slideRepeatRight}
              className="text-center group"
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_award_customer_title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('about_award_customer_source')}
              </p>
            </motion.div>

            <motion.div
              variants={repeatableVariants.fadeElastic}
              className="text-center group"
              transition={{ delay: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-orange-100 dark:bg-orange-900/50 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/70 transition-colors duration-300">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_award_growth_title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('about_award_growth_source')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Developer Section */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-900  border-gray-200 dark:border-gray-700"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={repeatableVariants.bounceIn} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about_team_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about_team_description')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
            variants={containerVariants}
          >
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                variants={repeatableVariants.slideRepeatBottom}
                custom={idx}
                whileHover="hover"
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                  <CardContent className="flex flex-col items-center p-0">
                    <motion.img
                      src={member.image}
                      alt={member.name}
                      className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-blue-200 dark:border-blue-700 shadow"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white text-center">
                      {member.name}
                    </h3>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 text-center">
                      {member.position}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* YouTube Section */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={repeatableVariants.fadeElastic}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 shadow-lg">
              <Youtube className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about_youtube_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('about_youtube_description')}
            </p>
          </motion.div>

          <motion.div variants={repeatableVariants.bounceIn} transition={{ delay: 0.2 }}>
            <Button
              size="lg"
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => window.open('https://www.youtube.com/@YourChannelName', '_blank')}
            >
              <Youtube className="mr-2 h-5 w-5" />
              {t('about_youtube_button')}
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50 dark:bg-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={repeatableVariants.fadeElastic}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('about_contact_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('about_contact_description')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfigs.repeat}
          >
            <motion.div
              variants={repeatableVariants.slideRepeatLeft}
              className="text-center group"
              transition={{ delay: 0.1 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_contact_email_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{t('about_contact_email')}</p>
            </motion.div>

            <motion.div
              variants={repeatableVariants.slideRepeatBottom}
              className="text-center group"
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                <Phone className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_contact_phone_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{t('about_contact_phone')}</p>
            </motion.div>

            <motion.div
              variants={repeatableVariants.slideRepeatRight}
              className="text-center group"
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {t('about_contact_location_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{t('about_contact_location')}</p>
            </motion.div>
          </motion.div>

          <motion.div variants={repeatableVariants.bounceIn} transition={{ delay: 0.4 }}>
            <Button
              size="lg"
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Eye className="mr-2 h-5 w-5" />
              {t('about_start_trial')}
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
