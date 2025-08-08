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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <SlideInDown className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">DataVis</span>
            </SlideInDown>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <FadeIn key={item.name} delay={index * 0.1}>
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-secondary transition-colors duration-200 font-medium relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </SlideInDown>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <FadeIn delay={0.2}>
                <LanguageSwitcher />
              </FadeIn>

              {isAuthenticated ? (
                <FadeIn delay={0.3} className="flex items-center space-x-3">
                  {/* Notifications */}
                  <AnimatedButton className="relative p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-full transition-colors duration-200">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <ScaleIn className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </ScaleIn>
                    )}
                  </AnimatedButton>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <AnimatedButton
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user?.name || 'User'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </AnimatedButton>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <SlideInDown className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <a
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <UserCircle className="w-4 h-4 mr-3" />
                            {t('navigation_profile')}
                          </a>
                          <a
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            {t('navigation_settings')}
                          </a>
                          <button
                            onClick={onLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
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
                    className="px-4 py-2 rounded-md text-primary bg-accent hover:text-primary hover:bg-secondary border font-medium transition-colors duration-200"
                  >
                    {t('auth_login')}
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => goToAuth('register')}
                    className="px-4 py-2 rounded-md text-primary bg-secondary hover:text-primary hover:bg-accent font-medium transition-colors duration-200 shadow-sm"
                  >
                    {t('auth_register')}
                  </AnimatedButton>
                </FadeIn>
              )}

              {/* Mobile Menu Button */}
              <AnimatedButton
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </AnimatedButton>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <SlideInDown className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-4 pb-3 space-y-1">
                {/* Search Bar - Mobile */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={t('common_searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>

                {/* Navigation Items */}
                {navItems.map((item, index) => (
                  <FadeIn key={item.name} delay={index * 0.05}>
                    <a
                      href={item.href}
                      className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                    >
                      {item.name}
                    </a>
                  </FadeIn>
                ))}

                {/* Mobile Actions */}
                {!isAuthenticated && (
                  <div className="pt-4 space-y-2">
                    <AnimatedButton
                      onClick={onLogin}
                      className="w-full px-3 py-2 text-center text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors duration-200"
                    >
                      {t('auth_login')}
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={onRegister}
                      className="w-full px-3 py-2 bg-primary text-white text-center rounded-lg hover:bg-primary/90 font-medium transition-colors duration-200"
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
