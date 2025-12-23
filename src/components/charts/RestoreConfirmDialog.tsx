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
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-gray-800 z-50 pointer-events-auto"
        aria-describedby="restore-confirm-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            {t('chartHistory.restoreDialog.title', 'Restore Chart Version')}
          </DialogTitle>
          <DialogDescription id="restore-confirm-description" className="text-muted-foreground">
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
              <div className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                <p>
                  <strong>Created at:</strong> {new Date(versionInfo.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="changeNote">
              {t('chartHistory.restoreDialog.changeNoteLabel', 'Change Note')}
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

        <DialogFooter className="flex gap-3 pt-4 pointer-events-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isRestoring}
            className="rounded-lg pointer-events-auto"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isRestoring}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
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
