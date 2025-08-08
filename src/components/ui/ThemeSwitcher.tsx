import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/themeManager';
import { AnimatedButton } from '../../theme/animation';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <AnimatedButton
      onClick={toggleTheme}
      className="relative flex items-center px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300 overflow-hidden border border-gray-300 dark:border-gray-600"
    >
      {/* Background slider */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-white dark:bg-gray-800 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
          isDark ? 'transform translate-x-full' : 'transform translate-x-0'
        }`}
      />

      {/* Light label */}
      <div className="relative z-10 flex items-center space-x-1 px-2">
        <Sun
          className={`w-4 h-4 transition-colors duration-300 ${
            !isDark ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        />
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            !isDark ? 'text-gray-800' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Light
        </span>
      </div>

      {/* Dark label */}
      <div className="relative z-10 flex items-center space-x-1 px-2">
        <Moon
          className={`w-4 h-4 transition-colors duration-300 ${
            isDark ? 'text-blue-400' : 'text-gray-500'
          }`}
        />
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            isDark ? 'text-gray-100' : 'text-gray-500'
          }`}
        >
          Dark
        </span>
      </div>
    </AnimatedButton>
  );
};

export default ThemeSwitcher;
