import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SlideInUp } from '@/theme/animation';
import { Database, ChevronRight, RotateCw, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Dataset } from '@/features/dataset/datasetAPI';
import DatasetSelector from './DatasetSelector';
import Routers from '@/router/routers';
import { useTranslation } from 'react-i18next';

interface Step1SelectDatasetProps {
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
  datasets: Dataset[];
  loadingList: boolean;
  error?: string | null;
  onRefresh: () => void;
  onNext: () => void;
}

const Step1SelectDataset: React.FC<Step1SelectDatasetProps> = ({
  selectedDatasetId,
  setSelectedDatasetId,
  datasets,
  loadingList,
  error,
  onRefresh,
  onNext,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canProceed = !!selectedDatasetId;
  const hasNoDatasets = !loadingList && datasets.length === 0;
  const hasError = !!error;

  return (
    <SlideInUp delay={0.2}>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t('forecast_step1_title')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('forecast_step1_desc')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 overflow-visible">
          {/* Dataset requirements helper */}
          <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-900/40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4">
            {t('forecast_step1_requirements')}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('forecast_step1_datasets')}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loadingList}
                className="flex items-center gap-2"
              >
                <RotateCw
                  className={`w-4 h-4 transition-transform ${loadingList ? 'animate-spin' : ''}`}
                />
                {t('forecast_step1_refresh')}
              </Button>
            </div>

            {/* Error or No Datasets State */}
            {(hasError || hasNoDatasets) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl text-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {hasError ? t('forecast_step1_unable_load') : t('forecast_step1_no_datasets')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {hasError
                        ? typeof error === 'string'
                          ? error
                          : (error as any)?.message || t('forecast_error_failed_load_datasets')
                        : t('forecast_step1_no_datasets_desc')}
                    </p>
                    <Button
                      onClick={() => navigate(Routers.CREATE_DATASET)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      {t('forecast_step1_create_dataset')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dataset Selector */}
            {!hasError && !hasNoDatasets && (
              <DatasetSelector
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelect={setSelectedDatasetId}
                loading={loadingList}
              />
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={onNext}
              disabled={!canProceed || hasError || hasNoDatasets}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('forecast_step1_next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </SlideInUp>
  );
};

export default Step1SelectDataset;
