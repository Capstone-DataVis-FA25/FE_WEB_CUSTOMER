import React from 'react';
import { Link } from 'react-router-dom';
import { FadeIn, SlideUp, ScaleIn } from '../../theme/animation';
import { Shield, Lock, ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="max-w-md mx-auto text-center">
            <ScaleIn>
              <div className="mb-8">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-8xl font-bold text-red-500 mb-4">403</div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {t('forbidden_title')}
                </h1>
                <p className="text-muted-foreground mb-8">{t('forbidden_description')}</p>
              </div>
            </ScaleIn>

            <SlideUp delay={0.2}>
              <div className="space-y-4">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>{t('forbidden_goHome')}</span>
                </Link>
                <div className="flex justify-center">
                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('forbidden_goBack')}</span>
                  </button>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="mt-12 bg-card rounded-xl p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    {t('forbidden_needHelp')}
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('forbidden_helpDescription')}
                </p>
                <div className="space-y-2">
                  <Link
                    to="/contact"
                    className="block text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    {t('forbidden_contactSupport')}
                  </Link>
                  <Link
                    to="/auth"
                    className="block text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    {t('forbidden_loginAgain')}
                  </Link>
                </div>
              </div>
            </SlideUp>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default ForbiddenPage;
