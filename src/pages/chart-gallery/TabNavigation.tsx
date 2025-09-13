import { useTranslation } from 'react-i18next';
import { Grid3X3, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type TabType = 'template' | 'data';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'template' as TabType,
      label: t('chart_gallery_choose_template'),
      icon: Grid3X3,
      description: t('chart_gallery_template_desc'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'data' as TabType,
      label: t('chart_gallery_select_with_data'),
      icon: BarChart3,
      description: t('chart_gallery_data_desc'),
      badge: 'BETA',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="px-8 py-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 1,
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
        {tabs.map((tab, index) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.div
              key={tab.id}
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                {/* Glowing background for active tab */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tab.gradient} opacity-20 blur-xl`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  />
                )}

                <Button
                  variant="ghost"
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative w-full h-auto p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 overflow-hidden
                    ${
                      isActive
                        ? `bg-gradient-to-br ${tab.gradient} text-white border-transparent shadow-xl hover:shadow-2xl`
                        : 'bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{
                          duration: 0.6,
                          repeat: isActive ? Infinity : 0,
                          repeatDelay: 3,
                        }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </motion.div>

                      <span className="font-bold text-lg">{tab.label}</span>

                      {tab.badge && (
                        <div className="relative">
                          <span
                            className={`
                            text-xs px-3 py-1 rounded-full font-bold tracking-wider
                            ${
                              isActive
                                ? 'bg-white/25 text-white'
                                : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 text-purple-700 dark:text-purple-300'
                            }
                          `}
                          >
                            {tab.badge}
                          </span>
                          {isActive && (
                            <motion.div
                              className="absolute -top-1 -right-1"
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sparkles className="w-3 h-3 text-yellow-300" />
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p
                      className={`text-sm text-center leading-relaxed font-medium ${
                        isActive ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>

                  {/* Shine effect */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    />
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
