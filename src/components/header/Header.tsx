import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  UserCircle,
  Search,
  ChevronDown,
} from 'lucide-react';
import { FadeIn, SlideInDown, AnimatedButton, ScaleIn } from '../../theme/animation';
import useNavigation from '@/hooks/useNavigation';
import { LanguageSwitcher } from '../language-switcher';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  user,
  onLogin,
  onRegister,
  onLogout,
  notificationCount = 0,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { goToAuth } = useNavigation();

  // Navigation items
  const navItems = [{ name: t('navigation_home'), href: '/' }];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
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
            {/* Logo */}
            <SlideInDown className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-500/20 dark:ring-blue-400/30">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DataVis
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {t('common_platform')}
                </p>
              </div>
            </SlideInDown>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <FadeIn key={item.name} delay={index * 0.1}>
                  <a
                    href={item.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium relative group px-3 py-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
                  </a>
                </FadeIn>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <SlideInDown delay={0.2} className="hidden md:flex">
              <div
                className={`relative transition-all duration-300 ${isSearchFocused ? 'w-80' : 'w-64'}`}
              >
                <input
                  type="text"
                  placeholder={t('common_searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              </div>
            </SlideInDown>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <FadeIn delay={0.2}>
                <div className="p-1 rounded-lg bg-white/50 dark:bg-gray-800/50 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                  <LanguageSwitcher />
                </div>
              </FadeIn>

              {/* Theme Switcher */}
              <FadeIn delay={0.25}>
                <div className="p-1 rounded-lg bg-white/50 dark:bg-gray-800/50 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                  <ThemeSwitcher />
                </div>
              </FadeIn>

              {isAuthenticated ? (
                <FadeIn delay={0.3} className="flex items-center space-x-3">
                  {/* Notifications */}
                  <AnimatedButton className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-sm">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <ScaleIn className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-900">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </ScaleIn>
                    )}
                  </AnimatedButton>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <AnimatedButton
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-sm"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.name || 'User'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </AnimatedButton>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <SlideInDown className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 ring-1 ring-black/5 dark:ring-white/5">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 mx-2 rounded-xl">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {user?.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1 px-2">
                          <a
                            href="/profile"
                            className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-xl mx-1 group"
                          >
                            <UserCircle className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            {t('navigation_profile')}
                          </a>
                          <a
                            href="/profile/settings"
                            className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 rounded-xl mx-1 group"
                          >
                            <Settings className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-200" />
                            {t('navigation_settings')}
                          </a>
                          <button
                            onClick={onLogout}
                            className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl mx-1 group"
                          >
                            <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            {t('auth_logout')}
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

              {/* Mobile Menu Button */}
              <AnimatedButton
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-sm"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </AnimatedButton>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <SlideInDown className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
              <div className="px-2 pt-4 pb-3 space-y-1">
                {/* Search Bar - Mobile */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={t('common_searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                </div>

                {/* Navigation Items */}
                {navItems.map((item, index) => (
                  <FadeIn key={item.name} delay={index * 0.05}>
                    <a
                      href={item.href}
                      className="block px-3 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 font-medium"
                    >
                      {item.name}
                    </a>
                  </FadeIn>
                ))}

                {/* Mobile Actions */}
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
