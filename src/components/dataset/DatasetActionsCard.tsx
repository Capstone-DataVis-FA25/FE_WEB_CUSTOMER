import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, ArrowLeft, Trash2, Settings } from 'lucide-react';

interface Props {
  t: (key: string, fallback?: string) => string;
  hasChanges: boolean;
  deleting: boolean;
  onSave: () => void;
  onReset: () => void;
  onBack: () => void;
  onDelete: () => void;
}

const DatasetActionsCard: React.FC<Props> = ({
  t,
  hasChanges,
  deleting,
  onSave,
  onReset,
  onBack,
  onDelete,
}) => {
  return (
    <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <span className="font-semibold">{t('actions')}</span>
          {hasChanges && (
            <Badge className="bg-yellow-500 text-white ml-auto">{t('unsaved_changes')}</Badge>
          )}
        </CardTitle>
      </div>
      <CardContent className="p-6 space-y-4">
        {hasChanges && (
          <Button
            onClick={onSave}
            className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-700/30 dark:to-emerald-800/30 border border-green-300/60 dark:border-green-700/60 hover:from-green-500 hover:to-emerald-600 dark:hover:from-green-800/40 dark:hover:to-emerald-900/40 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4 group"
          >
            <Save className="w-5 h-5 text-green-700 dark:text-green-300 group-hover:text-white transition-colors flex-shrink-0" />
            <span className="text-green-800 dark:text-green-200 font-medium text-left group-hover:text-white">
              {t('dataset_saveConfirmTitle')}
            </span>
          </Button>
        )}
        {hasChanges && (
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-800/50 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-800/30 dark:hover:to-amber-800/30 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4 group"
          >
            <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors flex-shrink-0" />
            <span className="text-orange-700 dark:text-orange-300 font-medium text-left">
              {t('chart_editor_transparent')}
            </span>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4 group"
        >
          <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex-shrink-0" />
          <span className="text-blue-700 dark:text-blue-300 font-medium text-left">
            {t('common_back')}
          </span>
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={deleting}
          className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-800/50 hover:from-red-500 hover:to-pink-600 hover:text-white dark:hover:from-red-600 dark:hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5 text-red-600 dark:text-white group-hover:text-white transition-colors flex-shrink-0" />
          <span className="text-red-700 dark:text-white font-medium group-hover:text-white text-left">
            {deleting ? 'Deleting...' : t('delete')}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatasetActionsCard;
