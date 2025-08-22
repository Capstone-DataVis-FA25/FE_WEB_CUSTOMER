import type React from 'react';
import { FaCheckCircle, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import useNavigation from '@/hooks/useNavigation';
import { useAuth } from '@/features/auth/useAuth';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '@/theme/animation';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';

interface EmailVerificationSuccessProps {
  onBackToConfirmation?: () => void;
}

const EmailVerificationSuccess: React.FC<EmailVerificationSuccessProps> = ({
  onBackToConfirmation,
}) => {
  const { t } = useTranslation();
  const { goToAuth } = useNavigation();
  const { logout } = useAuth();

  const handleContinueLogin = () => {
    logout();
    goToAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
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

      <div className="w-full max-w-md relative z-10">
        <FadeIn>
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('verifyEmail_title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                {t('verifyEmail_subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-green-800 dark:text-green-300 font-medium">{t('verifyEmail_success')}</p>
                    <p className="text-green-600 dark:text-green-400 text-sm">{t('verifyEmail_ready')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleContinueLogin}
                  variant="default"
                  size="lg"
                  className="w-full py-3 px-6 font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaSignInAlt className="text-lg" />
                  <span>{t('verifyEmail_continueLogin')}</span>
                </Button>

                <Button
                  onClick={onBackToConfirmation}
                  variant="outline"
                  size="lg"
                  className="w-full py-3 px-6 font-semibold text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <FaArrowLeft className="text-sm" />
                  <span>{t('verifyEmail_back')}</span>
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('verifyEmail_redirect')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('verifyEmail_support')}{' '}
            <a
              href="mailto:support@datavis.com"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
            >
              {t('verifyEmail_contact')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
