import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  cardVariants,
  slideVariants,
  scaleVariants,
  fadeVariants,
  buttonVariants,
} from '@/theme/animation/animation.config';

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideVariants.slideInLeft} className="space-y-8">
              <div>
                <Badge className="mb-4 px-6 py-2 text-lg font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  Industry Leader Since 2019
                </Badge>
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                  DataVis
                </h1>
                <p className="text-2xl text-gray-700 dark:text-gray-200 mb-4 font-medium">
                  Transforming Data Into Actionable Insights
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                  We empower businesses worldwide to make data-driven decisions through cutting-edge
                  visualization technology and intelligent analytics platforms.
                </p>
              </div>

              <motion.div variants={scaleVariants} className="flex gap-4">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Platform
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Schedule Demo
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Space for Lottie Animation */}
            <motion.div
              variants={slideVariants.slideInRight}
              className="flex items-center justify-center min-h-[400px] lg:min-h-[500px]"
            >
              <div
                className="w-full h-full max-w-lg max-h-lg rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm"
                style={{ minHeight: '400px' }}
              >
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Lottie Animation Placeholder</p>
                  <p className="text-sm">Replace this with your Lottie file</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                custom={index}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">{achievement.number}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-800/80"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeVariants} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Product Showcase</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how DataVis transforms complex data into beautiful, actionable insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcaseImages.map((item, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover" custom={index}>
                <Card className="h-full overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" className="bg-white/90 text-gray-800 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 shadow-lg">
                        <Play className="h-4 w-4 mr-2" />
                        View Demo
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

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
        className="py-16 px-4 bg-white dark:bg-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full text-center p-8 border-2 border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To democratize data visualization and make complex analytics accessible to
                    businesses of all sizes, enabling smarter decisions through intuitive insights.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full text-center p-8 border-2 border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                    <Lightbulb className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">Our Vision</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To be the world's leading data visualization platform, transforming how
                    organizations understand and act on their data in the digital age.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full text-center p-8 border-2 border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                    <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Our Values</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Innovation, transparency, and customer success drive everything we do. We
                    believe data should empower, not overwhelm.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeVariants} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose DataVis</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Enterprise-grade features designed for modern data-driven organizations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover" custom={index}>
                <Card className="h-full p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Awards Section */}
      <motion.section
        className="py-16 px-4 bg-white dark:bg-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={fadeVariants} className="mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Industry Recognition</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Trusted by industry leaders and recognized globally
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-4 gap-8">
            <motion.div variants={scaleVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Best Data Platform 2024</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">TechCrunch Awards</p>
            </motion.div>

            <motion.div variants={scaleVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Global Innovation Leader</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Forbes Tech Council</p>
            </motion.div>

            <motion.div variants={scaleVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Customer Choice Award</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gartner Peer Insights</p>
            </motion.div>

            <motion.div variants={scaleVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-orange-100 dark:bg-orange-900/50 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/70 transition-colors duration-300">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Fastest Growing SaaS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inc. 5000</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-800/80"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeVariants}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Ready to Transform Your Data?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of companies already using DataVis to drive growth
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div variants={cardVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-400">hello@datavis.com</p>
            </motion.div>

            <motion.div variants={cardVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors duration-300">
                <Phone className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
            </motion.div>

            <motion.div variants={cardVariants} className="text-center group">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors duration-300">
                <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-400">San Francisco, CA</p>
            </motion.div>
          </motion.div>

          <motion.div variants={scaleVariants}>
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
