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
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-50 to-orange-50">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-secondary/10" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideVariants.slideInLeft} className="space-y-8">
              <div>
                <Badge className="mb-4 px-6 py-2 text-lg font-semibold bg-secondary text-primary">
                  Industry Leader Since 2019
                </Badge>
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                  DataVis
                </h1>
                <p className="text-2xl text-gray-600 mb-4">
                  Transforming Data Into Actionable Insights
                </p>
                <p className="text-lg text-gray-500 max-w-2xl">
                  We empower businesses worldwide to make data-driven decisions through cutting-edge
                  visualization technology and intelligent analytics platforms.
                </p>
              </div>

              <motion.div variants={scaleVariants} className="flex gap-4">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold bg-accent text-primary"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Platform
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold border-2 bg-transparent border-secondary text-secondary"
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
                className="w-full h-full max-w-lg max-h-lg rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50"
                style={{ minHeight: '400px' }}
              >
                <div className="text-center text-gray-400">
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
        className="py-16 px-4 bg-primary"
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
                <div className="text-4xl font-bold mb-2 text-accent">{achievement.number}</div>
                <div className="text-gray-600 font-medium">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeVariants} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-accent">Product Showcase</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how DataVis transforms complex data into beautiful, actionable insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcaseImages.map((item, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover" custom={index}>
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="text-xs font-medium bg-secondary text-primary">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" className="bg-white/90 text-gray-800 hover:bg-white">
                        <Play className="h-4 w-4 mr-2" />
                        View Demo
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-accent">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={scaleVariants} className="text-center mt-12">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-semibold bg-secondary text-primary"
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
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full text-center p-8 border-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-accent">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-accent">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To democratize data visualization and make complex analytics accessible to
                    businesses of all sizes, enabling smarter decisions through intuitive insights.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full text-center p-8 border-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-secondary">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-secondary">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To be the world's leading data visualization platform, transforming how
                    organizations understand and act on their data in the digital age.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="h-full text-center p-8 border-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-500">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-600">Our Values</h3>
                  <p className="text-gray-600 leading-relaxed">
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
        className="py-16 px-4 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeVariants} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-accent">Why Choose DataVis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade features designed for modern data-driven organizations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover" custom={index}>
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-secondary/20">
                      <feature.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-accent">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Awards Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={fadeVariants} className="mb-12">
            <h2 className="text-4xl font-bold mb-4 text-accent">Industry Recognition</h2>
            <p className="text-xl text-gray-600">
              Trusted by industry leaders and recognized globally
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-4 gap-8">
            <motion.div variants={scaleVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-secondary">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Best Data Platform 2024</h3>
              <p className="text-sm text-gray-600">TechCrunch Awards</p>
            </motion.div>

            <motion.div variants={scaleVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-accent">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Global Innovation Leader</h3>
              <p className="text-sm text-gray-600">Forbes Tech Council</p>
            </motion.div>

            <motion.div variants={scaleVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-500">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Customer Choice Award</h3>
              <p className="text-sm text-gray-600">Gartner Peer Insights</p>
            </motion.div>

            <motion.div variants={scaleVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-purple-500">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fastest Growing SaaS</h3>
              <p className="text-sm text-gray-600">Inc. 5000</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeVariants}>
            <h2 className="text-4xl font-bold mb-6 text-accent">Ready to Transform Your Data?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of companies already using DataVis to drive growth
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div variants={cardVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-secondary">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-accent">Email Us</h3>
              <p className="text-gray-600">hello@datavis.com</p>
            </motion.div>

            <motion.div variants={cardVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-accent">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-accent">Call Us</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </motion.div>

            <motion.div variants={cardVariants} className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-500">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-600">Visit Us</h3>
              <p className="text-gray-600">San Francisco, CA</p>
            </motion.div>
          </motion.div>

          <motion.div variants={scaleVariants}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                size="lg"
                className="px-12 py-4 text-lg font-semibold bg-secondary text-primary"
              >
                <Eye className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-semibold mb-2">
            DataVis - Enterprise Data Visualization Platform
          </p>
          <p className="text-gray-400">
            © 2025 DataVis Inc. All rights reserved. Transforming data into insights since 2019.
          </p>
        </div>
      </footer>
    </div>
  );
}
