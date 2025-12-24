import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, ChevronRight, Trash2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useChartNotes, updateNoteLocally } from '@/features/chartNotes';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/features/auth/useAuth';
import Utils from '@/utils/Utils';

interface ChartNoteSidebarProps {
  chartId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const ChartNoteSidebar: React.FC<ChartNoteSidebarProps> = ({ chartId, isOpen, onToggle }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    notes,
    currentChartNotes,
    creating,
    updating,
    deleting,
    toggling,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteCompleted,
    getChartNotes,
    setCurrentNotes,
  } = useChartNotes();

  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [originalEditContent, setOriginalEditContent] = useState('');
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<string | null>(null);
  const [saveConfirmNoteId, setSaveConfirmNoteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fetchedForChartRef = useRef<string | null>(null);

  // Load notes only once per chart when the sidebar is first opened
  // Do NOT fetch here; background prefetch in ChartEditorPage handles network.
  useLayoutEffect(() => {
    if (!chartId || !isOpen) return;

    if (fetchedForChartRef.current === chartId) {
      setCurrentNotes(chartId);
      return;
    }

    const hasPrefetched = Array.isArray(notes[chartId]) && notes[chartId].length > 0;
    if (hasPrefetched) {
      setCurrentNotes(chartId);
      fetchedForChartRef.current = chartId;
      return;
    }

    // No prefetched notes yet; keep UI idle (loading indicator can rely on global loading)
    fetchedForChartRef.current = chartId;
  }, [chartId, isOpen, notes, setCurrentNotes]);

  // Auto scroll to bottom when new notes added
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChartNotes, isOpen]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendNote = async () => {
    if (!chartId || !newNote.trim()) return;

    try {
      await createNote({ chartId, content: newNote.trim() }).unwrap();
      setNewNote('');
      const ta = inputRef.current;
      if (ta) ta.style.height = '40px';
    } catch (error) {
      console.error('[ChartNoteSidebar] Failed to create note:', error);
    }
  };

  const handleStartEdit = (note: (typeof currentChartNotes)[number]) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setOriginalEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
    setOriginalEditContent('');
    setSaveConfirmNoteId(null);
  };

  const handleSaveEditClick = (noteId: string) => {
    // Check if content has actually changed
    if (editContent.trim() === originalEditContent.trim()) {
      // No changes, just cancel edit mode
      handleCancelEdit();
      return;
    }

    // Show confirmation modal
    if (editContent.trim() !== '') {
      setSaveConfirmNoteId(noteId);
    }
  };

  const handleConfirmSaveEdit = async () => {
    if (!chartId || !saveConfirmNoteId || !editContent.trim()) return;

    try {
      // Optimistic update
      dispatch(
        updateNoteLocally({ chartId, noteId: saveConfirmNoteId, content: editContent.trim() })
      );

      await updateNote(saveConfirmNoteId, { content: editContent.trim() }).unwrap();

      setEditingNoteId(null);
      setEditContent('');
      setOriginalEditContent('');
      setSaveConfirmNoteId(null);
    } catch (error) {
      // Refresh to revert optimistic update
      await getChartNotes(chartId);
    }
  };

  const handleCancelSaveEdit = () => {
    setSaveConfirmNoteId(null);
  };

  const handleDeleteNoteClick = (noteId: string) => {
    setDeleteConfirmNoteId(noteId);
  };

  const handleConfirmDelete = async () => {
    if (!chartId || !deleteConfirmNoteId) return;

    try {
      await deleteNote(chartId, deleteConfirmNoteId).unwrap();
      setDeleteConfirmNoteId(null);
    } catch (error) {
      console.error('[ChartNoteSidebar] Failed to delete note:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmNoteId(null);
  };

  const handleToggleCompleted = async (noteId: string) => {
    if (!chartId) return;

    try {
      setTogglingId(noteId);
      await toggleNoteCompleted(noteId).unwrap();
    } catch (error) {
      console.error('[ChartNoteSidebar] Failed to toggle note:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const formatCreatedAt = (createdAt: string) => {
    const date = new Date(createdAt);
    return Utils.getDate(date, 4);
  };

  const isLoading = creating || updating || deleting || toggling;

  return (
    <>
      {/* Toggle Button - Always visible */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[55]"
          >
            <Button
              onClick={onToggle}
              variant="outline"
              size="sm"
              className="rounded-r-none rounded-l-lg bg-white dark:bg-gray-800 border-r-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 pr-3 pl-2 py-6"
            >
              <MessageSquare className="w-5 h-5" />
              {currentChartNotes.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {currentChartNotes.length}
                </span>
              )}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
              onClick={onToggle}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-[65] flex flex-col border-l border-gray-200 dark:border-gray-700"
            >
              {/* Left-edge collapse handle (visible when sidebar is open) */}
              <button
                onClick={onToggle}
                aria-label={t('collapse_notes', 'Collapse notes')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-[70] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:shadow-xl"
                style={{ cursor: 'pointer' }}
              >
                <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              </button>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('chart_notes_title', 'Chart Notes')}
                  </h3>
                  {currentChartNotes.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({currentChartNotes.length})
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {currentChartNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {t(
                        'chart_notes_empty',
                        'No notes yet. Start a conversation about this chart!'
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    {currentChartNotes.map((note, index) => {
                      const isCurrentUser = note.author.id === user?.id;
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-3"
                        >
                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              {/* <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {note.author.firstName} {note.author.lastName}
                              </span> */}
                              {isCurrentUser && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">
                                  {t('you', 'You')}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatCreatedAt(note.createdAt)}
                              </span>
                            </div>

                            {/* Note Content - Editable or Display */}
                            {editingNoteId === note.id ? (
                              // Edit Mode
                              <div className="space-y-2">
                                <textarea
                                  value={editContent}
                                  onChange={e => setEditContent(e.target.value)}
                                  className="w-full bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-blue-500 dark:border-blue-400 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSaveEditClick(note.id)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    {t('save', 'Save')}
                                  </Button>
                                  <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                    {t('cancel', 'Cancel')}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Display Mode
                              <div className="group relative">
                                <div className="flex items-start gap-2">
                                  {/* Checkbox for completed status */}
                                  <div className="relative mt-3 w-4 h-4">
                                    {togglingId === note.id ? (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                                      </div>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={note.isCompleted}
                                        onChange={() => handleToggleCompleted(note.id)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        title={
                                          note.isCompleted
                                            ? t('mark_as_incomplete', 'Mark as incomplete')
                                            : t('mark_as_complete', 'Mark as complete')
                                        }
                                      />
                                    )}
                                  </div>

                                  <div
                                    className={`flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700 ${
                                      note.isCompleted ? 'opacity-60 line-through' : ''
                                    }`}
                                  >
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words break-all w-full">
                                      {note.content}
                                    </p>
                                  </div>
                                </div>

                                {/* Edit/Delete Buttons - Only show for current user's notes (inside bubble top-right) */}
                                {isCurrentUser && (
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button
                                      onClick={() => handleStartEdit(note)}
                                      className="p-1.5 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNoteClick(note.id)}
                                      className="p-1.5 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
                                      title={t('delete', 'Delete')}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-300" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area - auto-resizing textarea */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
                <div className="flex gap-2 items-center">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={newNote}
                    onChange={e => {
                      setNewNote(e.target.value);
                      // auto-resize only if needed
                      const ta = e.target as HTMLTextAreaElement;
                      ta.style.height = '40px'; // reset to base height
                      const scrollHeight = ta.scrollHeight;
                      // Only increase height if content exceeds base height
                      if (scrollHeight > 40) {
                        ta.style.height = `${Math.min(300, scrollHeight)}px`;
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendNote();
                      }
                    }}
                    placeholder={t('chart_notes_placeholder', 'Add a note...')}
                    className="flex-1 h-10 max-h-[300px] resize-none bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
                    disabled={isLoading}
                    aria-label={t('chart_notes_input', 'Add a note')}
                  />

                  <Button
                    onClick={handleSendNote}
                    disabled={!newNote.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 h-10 w-10 flex items-center justify-center p-0"
                    size="sm"
                    aria-label={t('send_note', 'Send note')}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {isLoading
                    ? t('chart_notes_sending', 'Sending...')
                    : t('chart_notes_hint', 'Press Enter to send, Shift+Enter for new line')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmNoteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={handleCancelDelete}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-96 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('delete_note_title', 'Delete Note')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'delete_note_message',
                      'Are you sure you want to delete this note? This action cannot be undone.'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleCancelDelete} size="sm" variant="outline">
                  {t('cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {t('delete', 'Delete')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Save Edit Confirmation Modal */}
      <AnimatePresence>
        {saveConfirmNoteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={handleCancelSaveEdit}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-96 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('save_note_changes_title', 'Save Changes')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'save_note_changes_message',
                      'Do you want to save the changes to this note?'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleCancelSaveEdit} size="sm" variant="outline">
                  {t('cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleConfirmSaveEdit}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  {t('save', 'Save')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChartNoteSidebar;
