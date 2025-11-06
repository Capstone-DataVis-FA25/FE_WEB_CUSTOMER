import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  t: (key: string, fallback?: string) => string;
  editableName: string;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  validationErrors: { name: string; description: string };
  handleNameChange: (v: string) => void;
  handleNameSave: () => void;
  handleNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  nameInputClass: string;

  editableDescription: string;
  setEditableDescription: (v: string) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (v: boolean) => void;
  handleDescriptionChange: (v: string) => void;
  handleDescriptionSave: () => void;
  originalDescription: string;
  setValidationErrors: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;

  createdAt: string;
  updatedAt: string;
  formatDate: (dateString: string) => string;
}

const DatasetInfoCard: React.FC<Props> = ({
  t,
  editableName,
  isEditingName,
  setIsEditingName,
  validationErrors,
  handleNameChange,
  handleNameSave,
  handleNameKeyDown,
  nameInputClass,
  editableDescription,
  setEditableDescription,
  isEditingDescription,
  setIsEditingDescription,
  handleDescriptionChange,
  handleDescriptionSave,
  originalDescription,
  setValidationErrors,
  createdAt,
  updatedAt,
  formatDate,
}) => {
  return (
    <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Database className="h-4 w-4" />
          </div>
          <span className="font-semibold">{t('dataset_information', 'Dataset Information')}</span>
        </CardTitle>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('dataset_name', 'Name')}
            </label>
            {isEditingName ? (
              <div className="space-y-2 mt-2">
                <Input
                  value={editableName}
                  onChange={e => handleNameChange(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className={nameInputClass}
                  placeholder={t('dataset_namePlaceholder', 'Enter dataset name')}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>⚠</span>
                    {validationErrors.name}
                  </p>
                )}
              </div>
            ) : (
              <p
                className="text-gray-900 dark:text-white font-medium mt-1 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors"
                onClick={() => setIsEditingName(true)}
                title={t('dataset_clickToEdit', 'Click to edit')}
              >
                {editableName || t('dataset_noName', 'No name')}
              </p>
            )}
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('dataset_description', 'Description')}
            </label>
            {isEditingDescription ? (
              <div className="space-y-2 mt-2">
                <Textarea
                  value={editableDescription}
                  onChange={e => handleDescriptionChange(e.target.value)}
                  onBlur={handleDescriptionSave}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      setEditableDescription(originalDescription);
                      setIsEditingDescription(false);
                      setValidationErrors(prev => ({ ...prev, description: '' }));
                    }
                  }}
                  autoFocus
                  className={`font-medium min-h-[100px] bg-transparent dark:bg-transparent border-blue-200/50 dark:border-blue-800/50 focus-visible:ring-blue-400/50 dark:focus-visible:ring-blue-500/50 ${validationErrors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('dataset_descriptionPlaceholder', 'Enter dataset description')}
                />
                {validationErrors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>⚠</span>
                    {validationErrors.description}
                  </p>
                )}
              </div>
            ) : (
              <p
                className="text-gray-900 dark:text-white font-medium mt-1 leading-relaxed cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 p-2 rounded transition-colors whitespace-pre-wrap"
                onClick={() => setIsEditingDescription(true)}
                title={t('dataset_clickToEdit', 'Click to edit')}
              >
                {editableDescription || t('dataset_noDescription', 'No description')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-800/30">
              <label className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t('dataset_createdAt', 'Created')}
              </label>
              <p className="text-gray-900 dark:text-white font-medium mt-2">
                {formatDate(createdAt)}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
              <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {t('dataset_updatedAt', 'Last Updated')}
              </label>
              <p className="text-gray-900 dark:text-white font-medium mt-2">
                {formatDate(updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetInfoCard;
