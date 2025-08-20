import { useAuth } from '@/features/auth/useAuth';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn, SlideInUp } from '@/theme/animation';
import { User, BarChart3, Activity, Heart, Star, CheckCircle } from 'lucide-react';

function HomePage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <FadeIn className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl shadow-2xl mb-6">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {t('home_title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            {t('home_subtitle')}
          </p>

          {isAuthenticated && user && (
            <SlideInUp delay={0.2}>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('home_welcome_back')}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('home_status_online')}
                </Badge>
              </div>
            </SlideInUp>
          )}
        </FadeIn>

        {/* Debug Info Card */}
        <SlideInUp delay={0.5}>
          <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {t('home_debug_title')}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t('home_debug_description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('home_debug_usage_title')}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('home_debug_location')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('home_debug_expand')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('home_debug_shortcut')}
                        <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          Ctrl/Cmd + Shift + D
                        </kbd>{' '}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('home_debug_features_title')}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Current Tab:</strong> {t('home_debug_current_tab')}
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Routes Tab:</strong> {t('home_debug_routes_tab')}
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>User Tab:</strong> {t('home_debug_user_tab')}
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>System Tab:</strong> {t('home_debug_system_tab')}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInUp>
      </div>
    </div>
  );
}

export default HomePage;
