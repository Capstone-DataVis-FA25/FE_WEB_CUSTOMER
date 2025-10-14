import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Mail,
  Scale,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  containerVariants,
  repeatableVariants,
  viewportConfigs,
} from '@/theme/animation/animation.config';

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: (
        <div className="space-y-4">
          <p>
            By accessing and using DataVis ("the Service"), you accept and agree to be bound by the
            terms and provision of this agreement. If you do not agree to these terms, please do not
            use the Service.
          </p>
          <p>
            These Terms of Service ("Terms") govern your access to and use of DataVis, including any
            content, functionality, and services offered on or through our platform.
          </p>
        </div>
      ),
    },
    {
      icon: Users,
      title: '2. User Accounts',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Account Creation</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must be at least 13 years old to use this service</li>
            <li>You are responsible for all activities that occur under your account</li>
          </ul>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Account Termination</h4>
          <p className="text-gray-600 dark:text-gray-400">
            We reserve the right to terminate or suspend your account at any time for violations of
            these Terms or for any other reason we deem appropriate.
          </p>
        </div>
      ),
    },
    {
      icon: CheckCircle2,
      title: '3. Acceptable Use',
      content: (
        <div className="space-y-4">
          <p className="font-semibold text-gray-900 dark:text-white">
            You agree to use the Service only for lawful purposes. You agree NOT to:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">Prohibited Actions:</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Violate any laws or regulations</li>
                      <li>Upload malicious code or viruses</li>
                      <li>Attempt to gain unauthorized access</li>
                      <li>Harass or harm other users</li>
                      <li>Use automated systems to scrape data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">Allowed Actions:</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Create and manage datasets</li>
                      <li>Generate data visualizations</li>
                      <li>Share charts publicly or privately</li>
                      <li>Collaborate with team members</li>
                      <li>Export your own data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: '4. Intellectual Property Rights',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Your Content</h4>
          <p className="text-gray-600 dark:text-gray-400">
            You retain all rights to the data and content you upload to DataVis. By uploading
            content, you grant us a license to use, store, and display your content solely for the
            purpose of providing the Service.
          </p>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Our Content</h4>
          <p className="text-gray-600 dark:text-gray-400">
            The Service and its original content, features, and functionality are owned by DataVis
            and are protected by international copyright, trademark, patent, trade secret, and other
            intellectual property laws.
          </p>
        </div>
      ),
    },
    {
      icon: Scale,
      title: '5. Disclaimer of Warranties',
      content: (
        <div className="space-y-4">
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
                    KIND.
                  </p>
                  <p>
                    We do not warrant that the Service will be uninterrupted, secure, or error-free.
                    We make no warranties about the accuracy, reliability, or availability of the
                    Service.
                  </p>
                  <p>
                    Your use of the Service is at your sole risk. We are not responsible for any
                    loss of data or damages resulting from your use of the Service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      icon: AlertTriangle,
      title: '6. Limitation of Liability',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, DATAVIS SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
            REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
            OR OTHER INTANGIBLE LOSSES.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Our total liability to you for any claims arising out of or relating to these Terms or
            the Service shall not exceed the amount you paid us in the twelve (12) months prior to
            the claim.
          </p>
        </div>
      ),
    },
    {
      icon: FileText,
      title: '7. Changes to Terms',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We reserve the right to modify these Terms at any time. We will notify you of any
            changes by posting the new Terms on this page and updating the "Last Updated" date.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Your continued use of the Service after any modifications indicates your acceptance of
            the updated Terms.
          </p>
        </div>
      ),
    },
    {
      icon: Mail,
      title: '8. Contact Information',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            If you have any questions about these Terms, please contact us:
          </p>
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                    <a
                      href="mailto:legal@datavis.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      legal@datavis.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Address</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      123 Tech Street, San Francisco, CA 94105, USA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t border-blue-100 dark:border-gray-800" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={repeatableVariants.fadeElastic}>
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50">
              <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Please read these terms carefully before using DataVis
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: January 9, 2025
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={repeatableVariants.slideRepeatBottom}
              custom={index}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                      <section.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Summary Section */}
      <motion.section
        className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={repeatableVariants.bounceIn}>
            <h2 className="text-3xl font-bold text-white mb-6">Summary</h2>
            <p className="text-xl text-white/90 mb-8">
              By using DataVis, you agree to comply with these Terms of Service. We reserve the
              right to update these terms at any time, and your continued use of the service
              constitutes acceptance of any changes.
            </p>
            <p className="text-white/80 text-sm">
              For questions or concerns, please contact us at{' '}
              <a
                href="mailto:legal@datavis.com"
                className="text-white underline hover:text-white/80"
              >
                legal@datavis.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
