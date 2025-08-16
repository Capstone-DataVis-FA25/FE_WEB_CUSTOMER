import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/themeManager';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-3 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group"
    >      
      {/* Theme indicator */}
      <div className="flex items-center gap-1">
        {isDark ? (
          <>
            <Moon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm font-medium">
              {t('dark')}
            </span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm font-medium">
              {t('light')}
            </span>
          </>
        )}
      </div>

      {/* Toggle visual indicator */}
      <div className="relative w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-200">
        <div
          className={`absolute top-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transition-all duration-200 ${
            isDark ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeSwitcher;
