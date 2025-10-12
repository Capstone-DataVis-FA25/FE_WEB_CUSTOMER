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
} from 'lucide-react';
import {
  containerVariants,
  scaleVariants,
  buttonVariants,
  repeatableVariants,
  viewportConfigs,
} from '@/theme/animation/animation.config';
import Lottie from 'lottie-react';

const features = [
  {
    icon: Database,
    title: 'Advanced Data Processing',
    description: 'Handle massive datasets with our enterprise-grade processing engine',
  },
  {
    icon: BarChart3,
    title: 'Interactive Dashboards',
    description: 'Create stunning, real-time dashboards with drag-and-drop simplicity',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description: 'AI-powered insights that help you stay ahead of trends',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share insights and collaborate seamlessly across your organization',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with SOC 2 compliance and data encryption',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Trusted by companies worldwide with 99.9% uptime guarantee',
  },
];

const achievements = [
  { number: '500K+', label: 'Data Points Processed Daily' },
  { number: '1,200+', label: 'Enterprise Clients' },
  { number: '99.9%', label: 'Uptime Guarantee' },
  { number: '50+', label: 'Countries Served' },
];

const showcaseImages = [
  {
    title: 'Real-time Analytics Dashboard',
    description: 'Monitor your business metrics with live data visualization',
    image: '/placeholder.svg?height=400&width=600',
    category: 'Dashboard',
  },
  {
    title: 'Interactive Data Exploration',
    description: 'Dive deep into your data with intuitive exploration tools',
    image: '/placeholder.svg?height=400&width=600',
    category: 'Analytics',
  },
  {
    title: 'Collaborative Reporting',
    description: 'Share insights across teams with beautiful, automated reports',
    image: '/placeholder.svg?height=400&width=600',
    category: 'Reports',
  },
  {
    title: 'Mobile-First Design',
    description: 'Access your data insights anywhere, on any device',
    image: '/placeholder.svg?height=400&width=600',
    category: 'Mobile',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Let artificial intelligence uncover hidden patterns in your data',
    image: '/placeholder.svg?height=400&width=600',
    category: 'AI',
  },
  {
    title: 'Enterprise Integration',
    description: 'Seamlessly connect with your existing business tools',
    image: '/placeholder.svg?height=400&width=600',
    category: 'Integration',
  },
];

const teamMembers = [
  {
    name: 'Hoang Nguyen',
    position: 'Frontend Developer',
    image:
      'https://scontent.fdad1-4.fna.fbcdn.net/v/t39.30808-6/475829182_631722649229606_2227659801422246226_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeH1Kjolqdx5jSCWpc91pTsaa9vsgT5tL25r2-yBPm0vbpEMuWV4LiPC0zn7Y0CYTv5r7nKUGD96K3TcGZITr_8g&_nc_ohc=hxa9cmAw98QQ7kNvwGd2qw5&_nc_oc=Admw_3gzsJS60gLDESHdV23EMTHUqsIX5Qz_-8hfa_vv3NKEylNG--6B9mhv4aulUBc&_nc_zt=23&_nc_ht=scontent.fdad1-4.fna&_nc_gid=rGLs2_2P23cxOaWiBqkieQ&oh=00_AfY7Q9LxUDuA-8GtSTFKkjrtfoxNvnCxHWud189cfco_FA&oe=68C22608',
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
    image:
      'https://scontent.fdad1-2.fna.fbcdn.net/v/t39.30808-6/507403130_1932224754195013_246730476869903395_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGPbEQXpvm7TJk8Lc1f9T8HlGckoVSJuEaUZyShVIm4RvDKOdOVxuHeQLhLwTVV3gyGG9-MK3BosbqK5oz3etNp&_nc_ohc=tOnGEfFt8OoQ7kNvwEe4c0M&_nc_oc=AdkyVe7qAat0bRhnKkpb2R8P4jkzxcMPDDN1BvikfUiJGdvds_9OpENizdNFiKgNIpU&_nc_zt=23&_nc_ht=scontent.fdad1-2.fna&_nc_gid=ZWzKrnAwFicnD5apw1lWcQ&oh=00_AfZhKKFQ3NblrAouyrjszYgkHR6Gw1P7LdtQaSSI0JTDtQ&oe=68C22085',
  },
  {
    name: 'Cong Minh',
    position: 'Backend Developer',
    image:
      'https://scontent.fdad1-4.fna.fbcdn.net/v/t39.30808-6/458615581_1549152505672648_4478946102712107219_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEIAycEOgea94qofQRgh7HvKIsqqnpSUgAoiyqqelJSAL_n3nxo5st3WddwpE58KyOBB89b4nLdgohTU2k80cpV&_nc_ohc=seGpNyNcrUoQ7kNvwFcjw21&_nc_oc=AdkYKBFhZNp4EXO7ncUjxVBDgVK7ZjdXZ4SIFA4YwPRpDimHXUXa-N-TJ2yGhPxdYao&_nc_zt=23&_nc_ht=scontent.fdad1-4.fna&_nc_gid=w_FBEXGPkwACYCv50-HUBA&oh=00_AfbSpkY3gv3OUfOVOssB7PpguSk1Pb1cv4CjW1ljQEGEWA&oe=68C2113D',
  },
  {
    name: 'Thai Bao',
    position: 'Backend Developer',
    image: '/assets/images/dev5.jpg',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-[var(--gradient-main)]">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t border-blue-100 dark:border-gray-800"/>
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
                  About Us
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Chúng tôi là đội ngũ phát triển DataVis, mang đến giải pháp trực quan hóa dữ liệu
                  hiện đại.
                </p>
              </motion.div>
              <motion.div 
                variants={repeatableVariants.fadeElastic} 
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg transition-all duration-300">
                    Xem sản phẩm
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-600 dark:text-blue-300"
                  >
                    Liên hệ
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
        className="py-16 px-4 bg-foreground dark:bg-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={repeatableVariants.bounceIn} 
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">
              Achievements
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
                  {achievement.label}
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
          <motion.div 
            variants={repeatableVariants.fadeElastic} 
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Product Showcase
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how DataVis transforms complex data into beautiful, actionable insights
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
                      alt={item.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          size="sm"
                          className="bg-white/90 text-gray-800 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 shadow-lg"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          View Demo
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={scaleVariants} className="text-center mt-12">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Eye className="mr-2 h-5 w-5" />
                View All Features
              </Button>
            </motion.div>
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
                    Our Mission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To democratize data visualization and make complex analytics accessible to
                    businesses of all sizes, enabling smarter decisions through intuitive insights.
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
                    Our Vision
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To be the world's leading data visualization platform, transforming how
                    organizations understand and act on their data in the digital age.
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
                    Our Values
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Innovation, transparency, and customer success drive everything we do. We
                    believe data should empower, not overwhelm.
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
          <motion.div 
            variants={repeatableVariants.bounceIn} 
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose DataVis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Enterprise-grade features designed for modern data-driven organizations
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
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
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
          <motion.div 
            variants={repeatableVariants.fadeElastic} 
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Industry Recognition
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Trusted by industry leaders and recognized globally
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
                Best Data Platform 2024
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">TechCrunch Awards</p>
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
                Global Innovation Leader
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Forbes Tech Council</p>
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
                Customer Choice Award
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gartner Peer Insights</p>
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
                Fastest Growing SaaS
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inc. 5000</p>
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
          <motion.div 
            variants={repeatableVariants.bounceIn} 
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Development Team Members
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the web development team behind DataVis
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

      {/* Contact Section */}
      <motion.section
        className="py-16 px-4 bg-foreground dark:bg-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            variants={repeatableVariants.fadeElastic}
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Transform Your Data?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of companies already using DataVis to drive growth
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-400">hello@datavis.com</p>
            </motion.div>

            <motion.div 
              variants={repeatableVariants.slideRepeatBottom} 
              className="text-center group"
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                <Phone className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
            </motion.div>

            <motion.div 
              variants={repeatableVariants.slideRepeatRight} 
              className="text-center group"
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-400">San Francisco, CA</p>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={repeatableVariants.bounceIn}
            transition={{ delay: 0.4 }}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                size="lg"
                className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Eye className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
