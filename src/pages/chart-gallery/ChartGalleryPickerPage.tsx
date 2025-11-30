import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { containerVariants } from '@/theme/animation/animation.config';
import SelectWithDataTab from './SelectWithDataTab';
import TabNavigation from './TabNavigation';
import ChooseTemplateTab from './ChooseTemplateTab';

type TabType = 'template' | 'data';

export default function ChartGalleryPickerPage() {
  const location = useLocation();

  // Mặc định trỏ vào tab template
  const [activeTab, setActiveTab] = useState<TabType>('template');

  // Lấy data từ state
  const locationState = location.state as { activeTab?: TabType; datasetId?: string } | null;
  const initialActiveTab = locationState?.activeTab;
  const datasetIdFromState = locationState?.datasetId;

  useEffect(() => {
    console.log('ChartGalleryPickerPage - useEffect triggered with:', {
      initialActiveTab,
      datasetIdFromState,
      currentActiveTab: activeTab,
    });

    // Set initial active tab from location state if provided
    if (initialActiveTab) {
      console.log('Setting activeTab from initialActiveTab:', initialActiveTab);
      setActiveTab(initialActiveTab);
    }
    // Remove auto-switch to 'data' tab when datasetId exists
    // Let user choose template first, then proceed with data
  }, [initialActiveTab, activeTab, datasetIdFromState]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/10"></div>

      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col relative z-10"
      >
        {/* Tab Navigation - No padding/margin */}
        <motion.div
          className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </motion.div>

        {/* Tab Content - Full width, no padding */}
        <motion.div
          className="flex-1 overflow-hidden bg-white dark:bg-gray-900"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'template' && <ChooseTemplateTab />}
          {activeTab === 'data' && <SelectWithDataTab />}
        </motion.div>
      </motion.div>
    </div>
  );
}
