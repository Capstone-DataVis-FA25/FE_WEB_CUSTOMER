import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();
  const {user}= useAuth();
  console.log('user', user);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto' }}>
            🏠 {t('home_title')}
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter' }}>
            {t('home_subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
