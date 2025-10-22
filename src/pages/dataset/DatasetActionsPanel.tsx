import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, ArrowLeft, Trash2 } from 'lucide-react';

type Props = {
  t: any;
  hasChanges: boolean;
  handleSave: () => void;
  handleReset: () => void;
  handleBack: () => void;
  handleDeleteDataset: () => void;
  deleting: boolean;
};

const DatasetActionsPanel: React.FC<Props> = ({
  t,
  hasChanges,
  handleSave,
  handleReset,
  handleBack,
  handleDeleteDataset,
  deleting,
}) => {
  return (
    <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" />
          </div>
          <span className="font-semibold">Actions</span>
          {hasChanges && <div className="ml-auto"><span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs">{t('unsaved_changes', 'Unsaved changes')}</span></div>}
        </CardTitle>
      </div>
      <CardContent className="p-6 space-y-4">
        {hasChanges && (
          <Button onClick={handleSave} className="w-full h-12 flex items-center justify-start gap-3 bg-gradient-to-r from-green-400 to-emerald-500 shadow-md rounded-lg px-4 group">
            <Save className="w-5 h-5 text-green-700" />
            <span className="text-green-800 font-medium">{t('save', 'Save')}</span>
          </Button>
        )}

        {hasChanges && (
          <Button variant="outline" onClick={handleReset} className="w-full h-12 flex items-center justify-start gap-3 rounded-lg px-4 group">
            <RotateCcw className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700 font-medium">{t('reset', 'Reset')}</span>
          </Button>
        )}

        <Button variant="outline" onClick={handleBack} className="w-full h-12 flex items-center justify-start gap-3 rounded-lg px-4 group">
          <ArrowLeft className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 font-medium">{t('back', 'Back')}</span>
        </Button>

        <Button variant="destructive" onClick={handleDeleteDataset} disabled={deleting} className="w-full h-12 flex items-center justify-start gap-3 rounded-lg px-4 group disabled:opacity-50">
          <Trash2 className="w-5 h-5 text-red-600" />
          <span className="text-red-700 font-medium">{deleting ? 'Deleting...' : t('dataset_delete', 'Delete')}</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatasetActionsPanel;
