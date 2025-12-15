import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import ChartPreview from '@/components/charts/gallery-chart-preview/ChartPreview';
import type { ChartTemplate } from '@/types/chart-gallery-types';

interface ChartTemplateCardProps {
  template: ChartTemplate;
  isSelected: boolean;
  onClick: () => void;
}

const ChartTemplateCard: React.FC<ChartTemplateCardProps> = ({ template, isSelected, onClick }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div
        className={`h-full overflow-hidden transition-all duration-300 cursor-pointer border rounded-xl ${
          isSelected
            ? 'border-gray-400 ring-2 ring-gray-400/20 shadow-lg bg-gray-50/50 dark:bg-gray-800/50'
            : 'border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={onClick}
      >
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          {/* Chart Preview */}
          <div className="absolute inset-0 p-2">
            <ChartPreview
              type={template.type}
              className="w-full h-full border border-gray-200 dark:border-gray-600 rounded-md"
            />
          </div>

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-2 left-2 z-10">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
          {/* No hover actions (Eye/Star) */}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={
                'font-medium line-clamp-1 ' +
                (isSelected
                  ? 'text-accent dark:text-accent-foreground'
                  : 'text-gray-900 dark:text-white')
              }
            >
              {template.name}
            </h3>
            <Badge
              variant="outline"
              className={
                'text-xs shrink-0 capitalize ' +
                (isSelected
                  ? 'border-accent text-accent dark:border-accent dark:text-accent-foreground'
                  : '')
              }
            >
              {template.type}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {template.description}
          </p>

          <button
            onClick={onClick}
            className={
              'w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ' +
              (isSelected
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800')
            }
          >
            {isSelected ? t('chart_gallery_selected') : t('chart_gallery_select')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartTemplateCard;
