import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  UserCircle,
  Search,
  Receipt,
  ChevronDown,
  Globe,
  Palette,
  Clock,
} from 'lucide-react';
import { FadeIn, SlideInDown, AnimatedButton, ScaleIn } from '../../theme/animation';
import useNavigation from '@/hooks/useNavigation';
import { LanguageSwitcher } from '../language-switcher';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/features/auth/authType';
import Routers from '@/router/routers';
import { useAiJobNotification } from '@/features/ai/useAiJobNotification';
import { useForecastCreationProgress } from '@/features/forecast/useForecastCreationProgress';
import { useForecastAnalysisProgress } from '@/features/forecast/useForecastAnalysisProgress';
import { useAiCleaningProgress } from '@/features/ai/useAiCleaningProgress';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: User;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
  _notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  user,
  onLogin,
  onRegister,
  onLogout,
  // notificationCount = 0,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [showAiDropdown, setShowAiDropdown] = useState(false);
  const resourcesCloseTimerRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const aiDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { goToAuth } = useNavigation();
  const userId = user?.id;
  const { pendingJobs, loadingJobId, handleJobClick, setPendingJobs } =
    useAiJobNotification(userId);
  // Get progress hooks to get names for notifications
  const { activeJobs: creationJobs } = useForecastCreationProgress(userId);
  const { activeJobs: analysisJobs } = useForecastAnalysisProgress(userId);
  const { activeJobs: cleaningJobs } = useAiCleaningProgress(userId);

  const navItems = [
    { name: t('navigation_home'), href: '/' },
    ...(isAuthenticated
      ? [
          { name: 'Datasets', href: `${Routers.WORKSPACE_DATASETS}` },
          { name: 'Charts', href: `${Routers.WORKSPACE_CHARTS}` },
          { name: 'Forecast', href: `${Routers.FORECAST}` },
        ]
      : []),
    { name: t('navigation_pricing'), href: '/pricing' },
    { name: t('navigation_about'), href: '/about-us' },
  ];

  const resourcesItems = [
    { name: 'FAQ', href: '/resources/frequent-questions' },
    { name: 'Changelog', href: '/resources/changelog' },
    { name: 'Blog', href: '/resources/blog' },
    { name: 'Docs', href: Routers.ACADEMIC_DOCS },
    { name: 'Community', href: '/resources/community' },
    { name: 'Forum', href: '/resources/forum' },
    { name: 'Careers', href: '/resources/careers' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms Service', href: '/terms-of-service' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (
        resourcesDropdownRef.current &&
        !resourcesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsResourcesDropdownOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target as Node)) {
        setShowAiDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <FadeIn>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 via-blue-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg dark:shadow-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <SlideInDown className="flex items-center space-x-2">
              <Link
                to={isAuthenticated ? `${Routers.HOME}` : '/'}
                className="flex items-center space-x-2 group"
                aria-label="Go to home"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dfvy81evi/image/upload/v1754983215/only_logo-removebg-preview_ncdidg.png"
                    alt="Logo"
                    className="rounded-sm"
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-90">
                    DataVis
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {t('common_platform')}
                  </p>
                </div>
              </Link>
            </SlideInDown>

            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <FadeIn key={item.name} delay={index * 0.1}>
                  <Link
                    to={item.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium relative group px-3 py-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
                  </Link>
                </FadeIn>
              ))}

              <FadeIn delay={0.4}>
                <div
                  className="relative"
                  ref={resourcesDropdownRef}
                  onMouseEnter={() => {
                    if (resourcesCloseTimerRef.current) {
                      window.clearTimeout(resourcesCloseTimerRef.current);
                      resourcesCloseTimerRef.current = null;
                    }
                    setIsResourcesDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    // Delay close slightly to allow moving into submenu area
                    if (resourcesCloseTimerRef.current) {
                      window.clearTimeout(resourcesCloseTimerRef.current);
                    }
                    resourcesCloseTimerRef.current = window.setTimeout(() => {
                      setIsResourcesDropdownOpen(false);
                      resourcesCloseTimerRef.current = null;
                    }, 180);
                  }}
                >
                  <button
                    onClick={() => setIsResourcesDropdownOpen(p => !p)}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium relative group px-3 py-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 flex items-center space-x-1"
                    aria-expanded={isResourcesDropdownOpen}
                    aria-haspopup="menu"
                  >
                    <span>Resources</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isResourcesDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isResourcesDropdownOpen && (
                    <SlideInDown className="absolute left-0 mt-2 w-60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 ring-1 ring-black/5 dark:ring-white/5">
                      <div
                        className="grid grid-cols-2 gap-1 px-2"
                        onMouseEnter={() => {
                          if (resourcesCloseTimerRef.current) {
                            window.clearTimeout(resourcesCloseTimerRef.current);
                            resourcesCloseTimerRef.current = null;
                          }
                          setIsResourcesDropdownOpen(true);
                        }}
                        onMouseLeave={() => {
                          if (resourcesCloseTimerRef.current) {
                            window.clearTimeout(resourcesCloseTimerRef.current);
                          }
                          resourcesCloseTimerRef.current = window.setTimeout(() => {
                            setIsResourcesDropdownOpen(false);
                            resourcesCloseTimerRef.current = null;
                          }, 180);
                        }}
                      >
                        {resourcesItems.map((item, index) => (
                          <FadeIn key={item.name} delay={index * 0.05}>
                            <Link
                              to={item.href}
                              className="block px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-xl font-medium"
                              onClick={() => setIsResourcesDropdownOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </FadeIn>
                        ))}
                      </div>
                    </SlideInDown>
                  )}
                </div>
              </FadeIn>
            </nav>

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <FadeIn delay={0.3} className="flex items-center space-x-3">
                  {/* AI Cleaning Notification Bell */}
                  <div className="relative" ref={aiDropdownRef}>
                    <AnimatedButton
                      className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-sm cursor-pointer"
                      onClick={() => setShowAiDropdown(v => !v)}
                      aria-label="AI Job Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {pendingJobs.length > 0 && (
                        <ScaleIn className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-900">
                          {pendingJobs.length > 9 ? '9+' : pendingJobs.length}
                        </ScaleIn>
                      )}
                    </AnimatedButton>
                    {showAiDropdown && (
                      <SlideInDown className="absolute right-0 mt-2 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-2xl z-50 border border-gray-200/50 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 pt-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              {t('notification_new', 'Thông báo mới')}
                            </h3>
                            {pendingJobs.length > 0 && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                                {pendingJobs.length}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                          {pendingJobs.length === 0 ? (
                            <div className="p-8 text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 mb-3">
                                <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {t('notification_empty', 'Không có thông báo nào')}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2">
                              {/* Reverse order: newest first */}
                              {[...pendingJobs].reverse().map(job => {
                                const getNotificationText = () => {
                                  if (job.type === 'forecast-creation') {
                                    // Get forecast name from progress hook
                                    const progressJob = creationJobs.find(
                                      j =>
                                        j.jobId === job.jobId ||
                                        (job.forecastId && j.forecastId === job.forecastId)
                                    );
                                    const name =
                                      progressJob?.forecastName ||
                                      t('forecast_creation_default_name', 'New Forecast');
                                    return `${name} - ${t('notification_forecast_ready', 'Forecast đã sẵn sàng')}`;
                                  }
                                  if (job.type === 'forecast-analysis') {
                                    // Get forecast name from progress hook
                                    const progressJob = analysisJobs.find(
                                      j =>
                                        j.jobId === job.jobId ||
                                        (job.forecastId && j.forecastId === job.forecastId)
                                    );
                                    const name =
                                      progressJob?.forecastName ||
                                      t('forecast_analysis_job_title', 'Forecast Analysis');
                                    return `${name} - ${t('notification_forecast_analysis_ready', 'Phân tích forecast đã sẵn sàng')}`;
                                  }
                                  // For cleaning, get file name from progress hook
                                  const progressJob = cleaningJobs.find(j => j.jobId === job.jobId);
                                  const fileName =
                                    progressJob?.fileName ||
                                    t('notification_clean_ready', 'Dữ liệu đã clean sẵn sàng');
                                  return `${fileName} - ${t('notification_clean_ready', 'Dữ liệu đã clean sẵn sàng')}`;
                                };

                                const notificationText = getNotificationText();

                                const handleClick = async () => {
                                  if (job.type === 'forecast-creation' && job.forecastId) {
                                    navigate(`/forecast/${job.forecastId}`);
                                    setPendingJobs(jobs => jobs.filter(j => j.jobId !== job.jobId));
                                    setShowAiDropdown(false);
                                  } else if (job.type === 'forecast-analysis' && job.forecastId) {
                                    navigate(`/forecast/${job.forecastId}`);
                                    setPendingJobs(jobs => jobs.filter(j => j.jobId !== job.jobId));
                                    setShowAiDropdown(false);
                                  } else {
                                    await handleJobClick(job.jobId, data => {
                                      navigate('/datasets/create', {
                                        state: { cleanedData: data, jobId: job.jobId },
                                      });
                                      setShowAiDropdown(false);
                                    });
                                  }
                                };

                                const formatTime = (timeStr?: string) => {
                                  if (!timeStr) return '';
                                  const time = timeStr.slice(11, 19);
                                  return time;
                                };

                                return (
                                  <div
                                    key={job.jobId}
                                    onClick={handleClick}
                                    className="group relative mb-2 p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 cursor-pointer"
                                  >
                                    <div className="flex items-start justify-between">
                                      {/* Content - No icon */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          {notificationText}
                                        </p>
                                        {job.time && (
                                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTime(job.time)}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Loading indicator */}
                                      {loadingJobId === job.jobId && (
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent ml-2 flex-shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </SlideInDown>
                    )}
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <AnimatedButton
                      onClick={() => setIsUserDropdownOpen(p => !p)}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-sm"
                    >
                      <Avatar className="w-8 h-8 ring-4 ring-blue-500/20">
                        <AvatarImage src={user?.avatar} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xxl font-bold">
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </AnimatedButton>

                    {isUserDropdownOpen && (
                      <SlideInDown className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50 ring-1 ring-black/5 dark:ring-white/5">
                        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 mx-2 rounded-xl mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {user?.firstName} {user?.lastName}
                                </p>
                                {user?.subscriptionPlan && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm whitespace-nowrap">
                                    {user.subscriptionPlan.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="px-2 py-1 space-y-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-xl group"
                          >
                            <UserCircle className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">{t('navigation_profile')}</span>
                          </Link>
                          <Link
                            to="/profile/settings"
                            className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 rounded-xl group"
                          >
                            <Settings className="w-4 h-4 mr-3 text-purple-500 group-hover:rotate-90 transition-transform duration-200" />
                            <span className="font-medium">{t('navigation_settings')}</span>
                          </Link>
                          <Link
                            to="/transaction-history"
                            className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 rounded-xl group"
                          >
                            <Receipt className="w-4 h-4 mr-3 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Transaction History</span>
                          </Link>
                        </div>

                        <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-700/50"></div>

                        <div className="px-2 py-1 space-y-2">
                          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 mr-3 text-emerald-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('language_title')}
                              </span>
                            </div>
                            <LanguageSwitcher />
                          </div>
                          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
                            <div className="flex items-center">
                              <Palette className="w-4 h-4 mr-3 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('theme_title')}
                              </span>
                            </div>
                            <ThemeSwitcher />
                          </div>
                        </div>

                        <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-700/50"></div>

                        <div className="px-2 py-1">
                          <button
                            onClick={onLogout}
                            className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl group"
                          >
                            <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">{t('auth_logout')}</span>
                          </button>
                        </div>
                      </SlideInDown>
                    )}
                  </div>
                </FadeIn>
              ) : (
                <FadeIn delay={0.3} className="flex items-center space-x-3">
                  <AnimatedButton
                    onClick={() => goToAuth('login')}
                    className="px-4 py-2 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {t('auth_login')}
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => goToAuth('register')}
                    className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 border border-blue-500/20"
                  >
                    {t('auth_register')}
                  </AnimatedButton>
                </FadeIn>
              )}

              <AnimatedButton
                onClick={() => setIsMenuOpen(p => !p)}
                className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-sm"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </AnimatedButton>
            </div>
          </div>

          {isMenuOpen && (
            <SlideInDown className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
              <div className="px-2 pt-4 pb-3 space-y-1">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={t('common_searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                </div>

                {navItems.map((item, index) => (
                  <FadeIn key={item.name} delay={index * 0.05}>
                    <Link
                      to={item.href}
                      className="block px-3 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 font-medium"
                    >
                      {item.name}
                    </Link>
                  </FadeIn>
                ))}

                <FadeIn delay={0.3}>
                  <div className="pt-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resources
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {resourcesItems.map((item, index) => (
                        <FadeIn key={item.name} delay={index * 0.05}>
                          <Link
                            to={item.href}
                            className="block px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 font-medium"
                          >
                            {item.name}
                          </Link>
                        </FadeIn>
                      ))}
                    </div>
                  </div>
                </FadeIn>

                {!isAuthenticated && (
                  <div className="pt-4 space-y-3">
                    <AnimatedButton
                      onClick={onLogin}
                      className="w-full px-3 py-3 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-200 border border-blue-200/50 dark:border-blue-700/50"
                    >
                      {t('auth_login')}
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={onRegister}
                      className="w-full px-3 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg"
                    >
                      {t('auth_register')}
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </SlideInDown>
          )}
        </div>
      </header>
    </FadeIn>
  );
};

export default Header;
