import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Utils from '@/utils/Utils';

interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (changeNote?: string) => void;
  isRestoring: boolean;
  versionInfo?: {
    name: string;
    description?: string;
    type: string;
    createdAt: string;
    updatedBy: string;
  };
}

const RestoreConfirmDialog: React.FC<RestoreConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isRestoring,
  versionInfo,
}) => {
  const { t } = useTranslation();
  const [changeNote, setChangeNote] = useState('');

  useEffect(() => {
    if (open && versionInfo) {
      setChangeNote(
        `Restored from version: ${Utils.getDate(versionInfo?.createdAt || new Date(), 4)}`
      );
    }
  }, [open, versionInfo]);

  const handleConfirm = () => {
    onConfirm(changeNote.trim() || undefined);
    setChangeNote('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setChangeNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            {t('chartHistory.restoreDialog.title', 'Restore Chart Version')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'chartHistory.restoreDialog.description',
              'Your current chart will be saved before restoring. This action can be undone by restoring again.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Version Info Preview */}
          {versionInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 space-y-2">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {t('chartHistory.restoreDialog.restoringTo', 'Restoring to:')}
              </p>
              <div className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                <p>
                  <strong>Created at:</strong> {new Date(versionInfo.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="changeNote">
              {t('chartHistory.restoreDialog.changeNoteLabel', 'Change Note (Optional)')}
            </Label>
            <Textarea
              id="changeNote"
              placeholder={t(
                'chartHistory.restoreDialog.changeNotePlaceholder',
                'Describe why you are restoring this version...'
              )}
              value={changeNote}
              onChange={e => setChangeNote(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={true}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(
                'chartHistory.restoreDialog.changeNoteHint',
                'This note will help you track changes in the version history.'
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isRestoring}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isRestoring}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRestoring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('chartHistory.restoreDialog.restoring', 'Restoring...')}
              </>
            ) : (
              t('chartHistory.restoreDialog.confirm', 'Restore Version')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestoreConfirmDialog;
