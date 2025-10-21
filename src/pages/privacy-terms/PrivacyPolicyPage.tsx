import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Mail,
  Cookie,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  containerVariants,
  repeatableVariants,
  viewportConfigs,
} from '@/theme/animation/animation.config';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: '1. Introduction',
      content: (
        <div className="space-y-4">
          <p>
            At DataVis, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our service.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this
            privacy policy, please do not access the site or use our services.
          </p>
        </div>
      ),
    },
    {
      icon: Database,
      title: '2. Information We Collect',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Name and email address when you create an account</li>
            <li>Profile information you choose to provide</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Communications you send to us</li>
          </ul>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">
            Automatically Collected Information
          </h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>IP address and browser type</li>
            <li>Device information and operating system</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </div>
      ),
    },
    {
      icon: Eye,
      title: '3. How We Use Your Information',
      content: (
        <div className="space-y-4">
          <p className="font-semibold text-gray-900 dark:text-white">
            We use the information we collect to:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">Service Delivery:</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Provide and maintain our services</li>
                      <li>Process your transactions</li>
                      <li>Send you technical notices and updates</li>
                      <li>Respond to your inquiries</li>
                      <li>Provide customer support</li>
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
                    <p className="text-gray-900 dark:text-white font-medium">Improvements:</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Improve our services and features</li>
                      <li>Understand usage patterns</li>
                      <li>Develop new features</li>
                      <li>Prevent fraud and abuse</li>
                      <li>Ensure platform security</li>
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
      icon: Users,
      title: '4. Information Sharing',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We do not sell or rent your personal information to third parties. We may share your
            information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <strong>Service Providers:</strong> With trusted third-party service providers who
              help us operate our platform
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition
            </li>
            <li>
              <strong>With Your Consent:</strong> When you explicitly agree to share your
              information
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: Cookie,
      title: '5. Cookies and Tracking',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We use cookies and similar tracking technologies to track activity on our service and
            hold certain information.
          </p>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Types of Cookies:</h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <strong>Essential Cookies:</strong> Required for the service to function properly
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how users interact with our
              service
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings and preferences
            </li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            You can control cookies through your browser settings, but disabling them may affect
            your experience.
          </p>
        </div>
      ),
    },
    {
      icon: Lock,
      title: '6. Data Security',
      content: (
        <div className="space-y-4">
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Secure data centers with restricted access</li>
                    <li>Employee training on data protection</li>
                    <li>Multi-factor authentication options</li>
                  </ul>
                  <p className="mt-4">
                    However, no method of transmission over the internet is 100% secure. While we
                    strive to protect your data, we cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      icon: CheckCircle2,
      title: '7. Your Rights',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Depending on your location, you may have the following rights regarding your personal
            information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <strong>Access:</strong> Request a copy of the personal information we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or incomplete data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal information
            </li>
            <li>
              <strong>Data Portability:</strong> Request transfer of your data to another service
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Withdraw consent for data processing where
              applicable
            </li>
            <li>
              <strong>Object:</strong> Object to certain types of data processing
            </li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </div>
      ),
    },
    {
      icon: AlertTriangle,
      title: '8. Data Retention',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We retain your personal information only for as long as necessary to fulfill the
            purposes outlined in this Privacy Policy, unless a longer retention period is required
            or permitted by law.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Active account data: Retained while your account is active</li>
            <li>Deleted account data: Removed within 90 days of account deletion</li>
            <li>Legal compliance data: Retained as required by applicable laws</li>
            <li>Analytics data: Anonymized and retained for service improvement</li>
          </ul>
        </div>
      ),
    },
    {
      icon: Users,
      title: "9. Children's Privacy",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Our service is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            If you are a parent or guardian and believe your child has provided us with personal
            information, please contact us immediately, and we will take steps to remove that
            information from our systems.
          </p>
        </div>
      ),
    },
    {
      icon: Shield,
      title: '10. International Data Transfers',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Your information may be transferred to and maintained on computers located outside of
            your state, province, country, or other governmental jurisdiction where data protection
            laws may differ.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            We ensure that appropriate safeguards are in place to protect your personal information
            in accordance with this Privacy Policy when transferred internationally.
          </p>
        </div>
      ),
    },
    {
      icon: Shield,
      title: '11. Changes to Privacy Policy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            We encourage you to review this Privacy Policy periodically for any changes. Your
            continued use of the service after changes are posted constitutes your acceptance of the
            updated policy.
          </p>
        </div>
      ),
    },
    {
      icon: Mail,
      title: '12. Contact Us',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            If you have any questions about this Privacy Policy or our data practices, please
            contact us:
          </p>
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                    <a
                      href="mailto:privacy@datavis.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      privacy@datavis.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Data Protection Officer
                    </p>
                    <a
                      href="mailto:dpo@datavis.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      dpo@datavis.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t border-purple-100 dark:border-gray-800" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={repeatableVariants.fadeElastic}>
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
              <Shield className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Your privacy is important to us. Learn how we protect your data.
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
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 flex-shrink-0">
                      <section.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
        className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfigs.repeat}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={repeatableVariants.bounceIn}>
            <h2 className="text-3xl font-bold text-white mb-6">Your Privacy Matters</h2>
            <p className="text-xl text-white/90 mb-8">
              We are committed to protecting your privacy and handling your data with care and
              transparency. If you have any questions or concerns about how we handle your
              information, please don't hesitate to reach out.
            </p>
            <p className="text-white/80 text-sm">
              Contact our privacy team at{' '}
              <a
                href="mailto:privacy@datavis.com"
                className="text-white underline hover:text-white/80"
              >
                privacy@datavis.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
