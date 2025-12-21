import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import type { ExperienceLevel } from '@/hooks/useOnboarding';

interface ExperienceLevelModalProps {
  isOpen: boolean;
  onSelect: (level: ExperienceLevel) => void;
}

const ExperienceLevelModal: React.FC<ExperienceLevelModalProps> = ({ isOpen, onSelect }) => {
  const { t } = useTranslation();

  const levels: Array<{
    id: ExperienceLevel;
    icon: React.ReactNode;
    titleKey: string;
    descKey: string;
    color: string;
    gradient: string;
  }> = [
    {
      id: 'beginner',
      icon: <Sparkles className="w-8 h-8" />,
      titleKey: 'onboarding_experience_beginner_title',
      descKey: 'onboarding_experience_beginner_desc',
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      id: 'experienced',
      icon: <TrendingUp className="w-8 h-8" />,
      titleKey: 'onboarding_experience_experienced_title',
      descKey: 'onboarding_experience_experienced_desc',
      color: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      id: 'professional',
      icon: <Zap className="w-8 h-8" />,
      titleKey: 'onboarding_experience_professional_title',
      descKey: 'onboarding_experience_professional_desc',
      color: 'text-orange-600 dark:text-orange-400',
      gradient: 'from-orange-500/10 to-red-500/10',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={e => e.stopPropagation()}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 pb-6 text-center border-b border-gray-200 dark:border-gray-700">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('onboarding_experience_title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('onboarding_experience_subtitle')}
                </p>
              </div>

              {/* Experience Level Cards */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {levels.map((level, index) => (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(level.id)}
                      className={`
                        relative overflow-hidden rounded-xl p-6 text-left
                        bg-gradient-to-br ${level.gradient}
                        border-2 border-gray-200 dark:border-gray-700
                        hover:border-gray-300 dark:hover:border-gray-600
                        transition-all duration-300
                        group
                      `}
                    >
                      {/* Icon */}
                      <div
                        className={`
                        inline-flex items-center justify-center w-14 h-14 rounded-xl
                        bg-white dark:bg-gray-800 shadow-lg mb-4
                        ${level.color}
                        group-hover:scale-110 transition-transform duration-300
                      `}
                      >
                        {level.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t(level.titleKey)}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t(level.descKey)}
                      </p>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 dark:from-black/0 dark:to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExperienceLevelModal;
