import React from 'react';
import { Link } from 'react-router-dom';
import { FadeIn, SlideUp, ScaleIn } from '../../theme/animation';
import { Shield, Lock, ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/10 dark:bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Theme and Language Switchers */}
      <div className="absolute top-6 left-8 flex gap-4 z-50">
        <FadeIn delay={0.25}>
          <ThemeSwitcher />
        </FadeIn>
        <FadeIn delay={0.35}>
          <LanguageSwitcher />
        </FadeIn>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <FadeIn>
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <ScaleIn>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">403</div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('forbidden_title')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('forbidden_description')}
                </CardDescription>
              </ScaleIn>
            </CardHeader>

            <CardContent className="space-y-6">
              <SlideUp delay={0.2}>
                <div className="space-y-4">
                  <Button
                    asChild
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link to="/" className='text-white'>
                      <Home className="w-5 h-5 mr-2" />
                      {t('forbidden_goHome')}
                    </Link>
                  </Button>
                  
                  <div className="text-center">
                    <button
                      onClick={() => window.history.back()}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('forbidden_goBack')}
                    </button>
                  </div>
                </div>
              </SlideUp>

              <SlideUp delay={0.3}>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('forbidden_needHelp')}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center leading-relaxed">
                    {t('forbidden_helpDescription')}
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/contact"
                      className="block text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm font-medium py-2 px-4 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {t('forbidden_contactSupport')}
                    </Link>
                    <Link
                      to="/auth"
                      className="block text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm font-medium py-2 px-4 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {t('forbidden_loginAgain')}
                    </Link>
                  </div>
                </div>
              </SlideUp>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default ForbiddenPage;
