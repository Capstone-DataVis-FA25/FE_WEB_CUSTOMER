import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Shield, AlertTriangle, Users, Mail, Scale, CheckCircle2 } from 'lucide-react';
import {
  containerVariants,
  repeatableVariants,
  viewportConfigs,
} from '@/theme/animation/animation.config';

import { useTranslation } from 'react-i18next';

export default function TermsOfServicePage() {
  const { t } = useTranslation();
  const sections = [
    {
      icon: FileText,
      title: t('terms.sections.acceptance.title'),
      content: (
        <div className="space-y-4">
          <p>{t('terms.sections.acceptance.content1')}</p>
          <p>{t('terms.sections.acceptance.content2')}</p>
        </div>
      ),
    },
    {
      icon: Users,
      title: t('terms.sections.accounts.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {t('terms.sections.accounts.creationTitle')}
          </h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(t('terms.sections.accounts.creationList', { returnObjects: true }) as string[]).map(
              (item, i) => (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">
            {t('terms.sections.accounts.terminationTitle')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {t('terms.sections.accounts.terminationContent')}
          </p>
        </div>
      ),
    },
    {
      icon: CheckCircle2,
      title: t('terms.sections.use.title'),
      content: (
        <div className="space-y-4">
          <p className="font-semibold text-gray-900 dark:text-white">
            {t('terms.sections.use.intro')}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {t('terms.sections.use.prohibitedTitle')}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      {(
                        t('terms.sections.use.prohibitedList', { returnObjects: true }) as string[]
                      ).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
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
                    <p className="text-gray-900 dark:text-white font-medium">
                      {t('terms.sections.use.allowedTitle')}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      {(
                        t('terms.sections.use.allowedList', { returnObjects: true }) as string[]
                      ).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
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
      title: t('terms.sections.ip.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {t('terms.sections.ip.yourContentTitle')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {t('terms.sections.ip.yourContentText')}
          </p>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">
            {t('terms.sections.ip.ourContentTitle')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {t('terms.sections.ip.ourContentText')}
          </p>
        </div>
      ),
    },
    {
      icon: Scale,
      title: t('terms.sections.warranties.title'),
      content: (
        <div className="space-y-4">
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('terms.sections.warranties.caps')}
                  </p>
                  <p>{t('terms.sections.warranties.text1')}</p>
                  <p>{t('terms.sections.warranties.text2')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      icon: AlertTriangle,
      title: t('terms.sections.liability.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('terms.sections.liability.caps')}</p>
          <p className="text-gray-600 dark:text-gray-400">{t('terms.sections.liability.text')}</p>
        </div>
      ),
    },
    {
      icon: FileText,
      title: t('terms.sections.changes.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('terms.sections.changes.text1')}</p>
          <p className="text-gray-600 dark:text-gray-400">{t('terms.sections.changes.text2')}</p>
        </div>
      ),
    },
    {
      icon: Mail,
      title: t('terms.sections.contact.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('terms.sections.contact.intro')}</p>
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {t('terms.sections.contact.emailLabel')}
                    </p>
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
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {t('terms.sections.contact.addressLabel')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('terms.sections.contact.addressValue')}
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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400 mb-6">
              {t('terms.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{t('terms.subtitle')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('terms.lastUpdated')}</p>
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
            <h2 className="text-3xl font-bold text-white mb-6">{t('terms.summary.title')}</h2>
            <p className="text-xl text-white/90 mb-8">{t('terms.summary.desc')}</p>
            <p className="text-white/80 text-sm">
              {t('terms.summary.contactPrefix')}{' '}
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
