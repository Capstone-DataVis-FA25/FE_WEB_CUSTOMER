import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage, type Language } from '../../hooks/useLanguage';

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentLanguage, changeLanguage, getCurrentLanguageInfo, languages } = useLanguage();

  const currentLangInfo = getCurrentLanguageInfo();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: Language) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Switcher Button */}
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-lg">{currentLangInfo.flag}</span>
        <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm font-medium">
          {currentLangInfo.nativeName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-all duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/5">
          <div className="py-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 transition-all duration-200 group ${
                  currentLanguage === lang.code
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-r-2 border-emerald-500'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                  {lang.flag}
                </span>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
                </div>
                {currentLanguage === lang.code && (
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-sm"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
