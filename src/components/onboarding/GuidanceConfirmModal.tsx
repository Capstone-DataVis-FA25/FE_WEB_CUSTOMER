import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuidanceConfirmModalProps {
  isOpen: boolean;
  onConfirm: (wantsGuidance: boolean) => void;
}

const GuidanceConfirmModal: React.FC<GuidanceConfirmModalProps> = ({ isOpen, onConfirm }) => {
  const { t } = useTranslation();

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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4"
                >
                  <HelpCircle className="w-7 h-7 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('onboarding_guidance_title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{t('onboarding_guidance_desc')}</p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 space-y-3">
                {/* Yes Button */}
                <Button
                  onClick={() => onConfirm(true)}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {t('onboarding_guidance_yes')}
                </Button>

                {/* No Button */}
                <Button
                  onClick={() => onConfirm(false)}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('onboarding_guidance_no')}
                </Button>

                {/* Info Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <p>
                    {t('onboarding_guidance_info')}{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {t('onboarding_guidance_button')}
                    </span>{' '}
                    {t('onboarding_guidance_location')}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuidanceConfirmModal;
