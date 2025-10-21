import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { DELIMITER_OPTIONS } from '@/utils/dataProcessors';

interface DelimiterSelectorProps {
  selectedDelimiter: string;
  onDelimiterChange: (delimiter: string) => void;
  disabled?: boolean;
}

function DelimiterSelector({
  selectedDelimiter,
  onDelimiterChange,
  disabled = false,
}: DelimiterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = DELIMITER_OPTIONS.find(option => option.value === selectedDelimiter);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (value: string) => {
    onDelimiterChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Delimiter
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
          rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
          ${disabled ? 'cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedOption?.label}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {selectedOption?.description}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-200 dark:border-gray-600 shadow-lg rounded-lg overflow-hidden">
          {DELIMITER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 
                transition-colors duration-150 flex items-center justify-between
                ${selectedDelimiter === option.value ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-700'}
              `}
            >
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
              </div>
              {selectedDelimiter === option.value && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DelimiterSelector;
