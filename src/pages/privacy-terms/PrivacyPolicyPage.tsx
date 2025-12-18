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

import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const sections = [
    {
      icon: Shield,
      title: t('privacy.sections.intro.title'),
      content: (
        <div className="space-y-4">
          <p>{t('privacy.sections.intro.content1')}</p>
          <p>{t('privacy.sections.intro.content2')}</p>
        </div>
      ),
    },
    {
      icon: Database,
      title: t('privacy.sections.infoCollect.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {t('privacy.sections.infoCollect.personalTitle')}
          </h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(
              t('privacy.sections.infoCollect.personalList', { returnObjects: true }) as string[]
            ).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">
            {t('privacy.sections.infoCollect.autoTitle')}
          </h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(t('privacy.sections.infoCollect.autoList', { returnObjects: true }) as string[]).map(
              (item, i) => (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
        </div>
      ),
    },
    {
      icon: Eye,
      title: t('privacy.sections.howUse.title'),
      content: (
        <div className="space-y-4">
          <p className="font-semibold text-gray-900 dark:text-white">
            {t('privacy.sections.howUse.intro')}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {t('privacy.sections.howUse.serviceDelivery.title')}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      {(
                        t('privacy.sections.howUse.serviceDelivery.list', {
                          returnObjects: true,
                        }) as string[]
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
                      {t('privacy.sections.howUse.improvements.title')}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      {(
                        t('privacy.sections.howUse.improvements.list', {
                          returnObjects: true,
                        }) as string[]
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
      icon: Users,
      title: t('privacy.sections.sharing.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('privacy.sections.sharing.intro')}</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(t('privacy.sections.sharing.list', { returnObjects: true }) as string[]).map(
              (item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              )
            )}
          </ul>
        </div>
      ),
    },
    {
      icon: Cookie,
      title: t('privacy.sections.cookies.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('privacy.sections.cookies.intro')}</p>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">
            {t('privacy.sections.cookies.typesTitle')}
          </h4>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(t('privacy.sections.cookies.typesList', { returnObjects: true }) as string[]).map(
              (item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              )
            )}
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            {t('privacy.sections.cookies.control')}
          </p>
        </div>
      ),
    },
    {
      icon: Lock,
      title: t('privacy.sections.security.title'),
      content: (
        <div className="space-y-4">
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('privacy.sections.security.intro')}
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    {(t('privacy.sections.security.list', { returnObjects: true }) as string[]).map(
                      (item, i) => (
                        <li key={i}>{item}</li>
                      )
                    )}
                  </ul>
                  <p className="mt-4">{t('privacy.sections.security.disclaimer')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      icon: CheckCircle2,
      title: t('privacy.sections.rights.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('privacy.sections.rights.intro')}</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(t('privacy.sections.rights.list', { returnObjects: true }) as string[]).map(
              (item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              )
            )}
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            {t('privacy.sections.rights.contact')}
          </p>
        </div>
      ),
    },
    {
      icon: AlertTriangle,
      title: t('privacy.sections.retention.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.retention.intro')}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            {(t('privacy.sections.retention.list', { returnObjects: true }) as string[]).map(
              (item, i) => (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
        </div>
      ),
    },
    {
      icon: Users,
      title: t('privacy.sections.children.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.children.content1')}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.children.content2')}
          </p>
        </div>
      ),
    },
    {
      icon: Shield,
      title: t('privacy.sections.transfer.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.transfer.content1')}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.transfer.content2')}
          </p>
        </div>
      ),
    },
    {
      icon: Shield,
      title: t('privacy.sections.changes.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.changes.content1')}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t('privacy.sections.changes.content2')}
          </p>
        </div>
      ),
    },
    {
      icon: Mail,
      title: t('privacy.sections.contact.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('privacy.sections.contact.intro')}</p>
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {t('privacy.sections.contact.emailLabel')}
                    </p>
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
                      {t('privacy.sections.contact.dpoLabel')}
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
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {t('privacy.sections.contact.addressLabel')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('privacy.sections.contact.addressValue')}
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
              {t('privacy.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{t('privacy.subtitle')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('privacy.lastUpdated')}</p>
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
            <h2 className="text-3xl font-bold text-white mb-6">{t('privacy.summary.title')}</h2>
            <p className="text-xl text-white/90 mb-8">{t('privacy.summary.desc')}</p>
            <p className="text-white/80 text-sm">
              {t('privacy.summary.contactPrefix')}{' '}
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
