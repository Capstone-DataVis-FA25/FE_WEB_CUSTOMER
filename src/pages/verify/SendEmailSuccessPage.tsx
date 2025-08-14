import { MdEmail, MdCheckCircle } from 'react-icons/md';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { SlideInDown } from '@/theme/animation';
import { useTranslation } from 'react-i18next';
import { FaSignInAlt } from 'react-icons/fa';
import { logout } from '@/features/auth/authSlice';
import useNavigation from '@/hooks/useNavigation';

const EmailConfirmation = () => {
  const { t } = useTranslation();
  const { goToAuth } = useNavigation();

  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  const handleResendEmail = () => {
    console.log('Resending email...');
  };

  const handleContinueLogin = () => {
    logout();
    goToAuth();
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <SlideInDown>
          <Card className="overflow-hidden bg-primary shadow-2xl border-0">
            {/* Header with gradient */}
            <div className="bg-accent px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ">
                <img
                  src="https://res.cloudinary.com/dfvy81evi/image/upload/v1754886570/circle_logo_uresgo.png"
                  className="p-2"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('sendEmail_title')}</h1>
              <p className="text-blue-100 text-sm">{t('sendEmail_subtitle')}</p>
            </div>

            {/* Content */}
            <CardContent className="px-8 py-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <MdCheckCircle className="w-6 h-6 text-green-800 mr-2" />
                  <span className="text-green-800 font-semibold">{t('sendEmail_sent')}</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">{t('sendEmail_check')}</p>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                    <span>💡</span>
                    {t('sendEmail_tip')}
                  </p>
                </div>
              </div>

              {/* Gmail Button */}
              <Button
                onClick={handleOpenGmail}
                variant="default"
                size="lg"
                className="w-full bg-accent text-primary hover:bg-secondary hover:text-primary py-4 text-base font-semibold transition-all duration-300 transform hover:shadow-lg group mb-4"
              >
                <MdEmail className="w-5 h-5 mr-3" />
                {t('sendEmail_openGmail')}
              </Button>

              <Button
                onClick={handleContinueLogin}
                variant="default"
                size="lg"
                className="w-full bg-accent text-primary hover:bg-secondary hover:text-primary py-4 text-base font-semibold transition-all duration-300 transform hover:shadow-lg group mb-4"
              >
                <FaSignInAlt className="w-5 h-5 mr-3" />
                {t('verifyEmail_continueLogin')}
              </Button>

              {/* Additional Info */}
              <div className="mt-3 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs mb-3">{t('sendEmail_notReceived')}</p>
                  <Button
                    onClick={handleResendEmail}
                    variant="default"
                    className="text-black hover:text-accent text-sm font-medium underline"
                  >
                    {t('sendEmail_resend')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInDown>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">{t('sendEmail_footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
