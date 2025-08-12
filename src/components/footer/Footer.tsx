
import { FaReact } from 'react-icons/fa';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const {t}= useTranslation();
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 text-blue-600 dark:text-purple-300 font-bold text-lg">
          <FaReact className="w-6 h-6 animate-spin-slow" />
          <span>DataVis Capstone</span>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center">
          &copy; {new Date().getFullYear()} {t('footer_copyright')}
        </div>

        {/* Theme Indicator */}
        <div className="flex items-center gap-2">
          <BsFillSunFill className="w-4 h-4 text-yellow-400 dark:hidden" title="Light mode" />
          <BsFillMoonStarsFill className="w-4 h-4 text-blue-300 hidden dark:inline" title="Dark mode" />
          <span className="text-xs text-gray-400 dark:text-gray-500">{t('theme_title')}:&nbsp;
            <span className="hidden dark:inline">{t('dark')}</span>
            <span className="inline dark:hidden">{t('light')}</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
