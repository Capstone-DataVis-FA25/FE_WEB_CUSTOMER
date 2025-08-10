import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage, type Language } from '../../hooks/useLanguage';
import { Button } from '../ui/button';

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
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-4 h-4 text-accent hover:text-secondary" />
        <span className="text-lg text-accent hover:text-secondary">{currentLangInfo.flag}</span>
        <span className="hidden sm:inline text-accent hover:text-secondary text-sm font-medium">
          {currentLangInfo.nativeName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-accent hover:text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 ${
                currentLanguage === lang.code
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700'
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm text-accent hover:text-accent font-medium">
                  {lang.nativeName}
                </span>
                <span className="text-xs text-gray-500">{lang.name}</span>
              </div>
              {currentLanguage === lang.code && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
