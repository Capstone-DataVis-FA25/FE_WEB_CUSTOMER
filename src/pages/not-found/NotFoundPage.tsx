import React from 'react';
import { Link } from 'react-router-dom';
import { FadeIn, SlideUp, ScaleIn } from '../../theme/animation';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="max-w-md mx-auto text-center">
            <ScaleIn>
              <div className="mb-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-12 h-12 text-primary" />
                </div>
                <div className="text-8xl font-bold text-primary mb-4">404</div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {t('notfound_title')}
                </h1>
                <p className="text-muted-foreground mb-8">{t('notfound_description')}</p>
              </div>
            </ScaleIn>

            <SlideUp delay={0.2}>
              <div className="space-y-4">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>{t('notfound_goHome')}</span>
                </Link>
                <div className="flex justify-center">
                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('notfound_goBack')}</span>
                  </button>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="mt-12">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t('notfound_suggestions')}
                </h2>
                <div className="space-y-2">
                  <Link
                    to="/about"
                    className="block text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('notfound_about')}
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('notfound_contact')}
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

export default NotFoundPage;
