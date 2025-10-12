import React from 'react';
import { useTranslation } from 'react-i18next';

interface MathSpinnerProps {
  text?: string;
  subText?: string;
}

export const MathSpinner: React.FC<MathSpinnerProps> = ({
  text,
  subText = 'Parsing mathematical structures',
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        {/* Outer rotating ring with mathematical symbols */}
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-b-green-500 border-l-orange-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '2s' }}
          ></div>
        </div>

        {/* Inner mathematical symbols */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            ∫
          </div>
        </div>

        {/* Floating mathematical symbols */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 text-blue-500 animate-bounce"
          style={{ animationDelay: '0s' }}
        >
          π
        </div>
        <div
          className="absolute -top-2 -right-2 w-4 h-4 text-purple-500 animate-bounce"
          style={{ animationDelay: '0.5s' }}
        >
          Σ
        </div>
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 text-green-500 animate-bounce"
          style={{ animationDelay: '1s' }}
        >
          α
        </div>
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 text-orange-500 animate-bounce"
          style={{ animationDelay: '1.5s' }}
        >
          β
        </div>
      </div>

      {/* Processing text */}
      <div className="ml-6 text-center">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {text || `${t('dataset_readingFile')}...`}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{subText}</div>
        <div className="flex justify-center mt-3 space-x-1">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MathSpinner;
