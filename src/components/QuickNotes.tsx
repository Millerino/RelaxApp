import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// More emojis organized by category
const MOOD_EMOJIS = [
  // Happy/Positive
  '😊', '🙂', '😌', '🥰', '😄', '🤗',
  // Thoughtful/Neutral
  '🤔', '😐', '🙃', '💭',
  // Energy
  '💪', '🌟', '✨', '🔥', '⚡',
  // Love/Heart
  '❤️', '💜', '💙', '💚', '🧡',
  // Sad/Difficult
  '😢', '😔', '😤', '😰', '😟',
  // Activities
  '🧘', '🏃', '📖', '🎵', '☕',
];

interface QuickNotesProps {
  dateFilter?: string;
  showAllDates?: boolean;
}

export function QuickNotes({ dateFilter, showAllDates }: QuickNotesProps) {
  const { state, addQuickNote, deleteQuickNote, updateQuickNote, updateQuickNoteEmoji } = useApp();
  const [newNote, setNewNote] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editEmoji, setEditEmoji] = useState<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const todayStr = dateFilter || new Date().toDateString();
  const notes = showAllDates
    ? (state.quickNotes || [])
    : (state.quickNotes || []).filter(n => n.date === todayStr);

  const handleSubmit = (textOverride?: string) => {
    const text = textOverride ?? newNote;
    if (text.trim()) {
      addQuickNote(text.trim(), selectedEmoji || undefined);
      setNewNote('');
      setSelectedEmoji(null);
      setShowInputEmojiPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Use current target value to avoid stale closure
      handleSubmit(e.currentTarget.value);
    }
  };

  const startEditing = (noteId: string, text: string, emoji?: string) => {
    setEditingNote(noteId);
    setEditText(text);
    setEditEmoji(emoji);
  };

  const saveEdit = () => {
    if (editingNote && editText.trim()) {
      updateQuickNote(editingNote, editText.trim(), editEmoji);
      setEditingNote(null);
      setEditText('');
      setEditEmoji(undefined);
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditText('');
    setEditEmoji(undefined);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newNote]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Calm, minimal card design */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl shadow-sm overflow-hidden
                    border border-slate-200/60 dark:border-slate-700/50">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Quick Thoughts
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {showAllDates ? 'All' : 'Today'}
            </span>
          </div>

          {/* Input area - clean minimal design */}
          <div className="relative mb-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Capture a thought..."
                className="w-full bg-white dark:bg-slate-900/50 text-sm text-slate-700 dark:text-slate-200
                         placeholder-slate-400 dark:placeholder-slate-500
                         resize-none focus:outline-none min-h-[52px] px-3 py-2.5
                         rounded-lg border border-slate-200 dark:border-slate-700
                         focus:border-lavender-400 dark:focus:border-lavender-500
                         focus:ring-1 focus:ring-lavender-400/30 dark:focus:ring-lavender-500/30
                         transition-all leading-relaxed"
                rows={2}
              />
              {/* Selected emoji badge */}
              {selectedEmoji && (
                <span className="absolute top-2 right-2 text-lg">{selectedEmoji}</span>
              )}
            </div>

            {/* Action row */}
            {newNote.trim() && (
              <div className="flex items-center justify-between mt-2">
                {/* Emoji selector with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
                              transition-colors ${
                      showInputEmojiPicker || selectedEmoji
                        ? 'bg-lavender-100 dark:bg-lavender-900/50 text-lavender-600 dark:text-lavender-400'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{selectedEmoji || '😊'}</span>
                    <span>Tag</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Emoji dropdown */}
                  {showInputEmojiPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-silver-800
                                  rounded-xl shadow-xl border border-silver-200 dark:border-silver-700 z-20
                                  grid grid-cols-6 gap-1.5 w-56">
                      {/* No emoji option */}
                      <button
                        onClick={() => {
                          setSelectedEmoji(null);
                          setShowInputEmojiPicker(false);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs
                                  transition-colors hover:bg-silver-100 dark:hover:bg-silver-700
                                  ${!selectedEmoji ? 'bg-lavender-100 dark:bg-lavender-900/50' : ''}`}
                      >
                        ✕
                      </button>
                      {MOOD_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            setShowInputEmojiPicker(false);
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none
                                    transition-colors hover:bg-silver-100 dark:hover:bg-silver-700
                                    ${selectedEmoji === emoji ? 'bg-lavender-100 dark:bg-lavender-900/50' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={() => handleSubmit()}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg
                           bg-lavender-500 text-white hover:bg-lavender-600
                           transition-colors"
                >
                  Capture
                </button>
              </div>
            )}
          </div>

          {/* Today's notes - fixed height with scroll */}
          {notes.length > 0 && (
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {notes.slice().reverse().map((note) => (
                <div
                  key={note.id}
                  className="group flex items-start gap-2 p-2.5 rounded-lg
                           bg-white/60 dark:bg-slate-900/30
                           hover:bg-white dark:hover:bg-slate-900/50 transition-colors"
                >
                  {editingNote === note.id ? (
                    // Edit mode
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        {/* Emoji picker for edit */}
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === `edit-${note.id}` ? null : `edit-${note.id}`)}
                          className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700
                                   flex items-center justify-center text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          {editEmoji || '➕'}
                        </button>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 text-sm bg-white dark:bg-slate-800 rounded-lg
                                   border border-slate-200 dark:border-slate-600 px-2 py-1.5
                                   focus:outline-none focus:ring-1 focus:ring-lavender-400"
                          rows={2}
                          autoFocus
                        />
                      </div>
                      {showEmojiPicker === `edit-${note.id}` && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <button
                            onClick={() => { setEditEmoji(undefined); setShowEmojiPicker(null); }}
                            className="w-7 h-7 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                          >
                            ✕
                          </button>
                          {MOOD_EMOJIS.slice(0, 18).map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => { setEditEmoji(emoji); setShowEmojiPicker(null); }}
                              className="w-7 h-7 rounded text-base leading-none hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 text-xs bg-lavender-500 text-white rounded-lg hover:bg-lavender-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      {/* Emoji or add button */}
                      <div className="relative flex-shrink-0">
                        {note.emoji ? (
                          <span className="text-sm">{note.emoji}</span>
                        ) : (
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === note.id ? null : note.id)}
                            className="w-5 h-5 rounded-full bg-slate-200/70 dark:bg-slate-700/70
                                     flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400
                                     hover:bg-slate-300/70 dark:hover:bg-slate-600/70 transition-colors"
                          >
                            +
                          </button>
                        )}

                        {/* Emoji picker dropdown */}
                        {showEmojiPicker === note.id && (
                          <div className="absolute top-full left-0 mt-1 p-1.5 bg-white dark:bg-silver-800
                                        rounded-lg shadow-lg border border-silver-200 dark:border-silver-700 z-10
                                        grid grid-cols-6 gap-1.5 w-48">
                            {MOOD_EMOJIS.slice(0, 18).map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  updateQuickNoteEmoji(note.id, emoji);
                                  setShowEmojiPicker(null);
                                }}
                                className="w-6 h-6 rounded hover:bg-silver-100 dark:hover:bg-silver-700
                                         flex items-center justify-center text-base leading-none transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Note content */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => startEditing(note.id, note.text, note.emoji)}
                      >
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                          {note.text}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatTime(note.createdAt)}
                        </span>
                      </div>

                      {/* Edit & Delete buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(note.id, note.text, note.emoji)}
                          className="p-1 rounded text-slate-400 hover:text-lavender-500 hover:bg-lavender-50 dark:hover:bg-lavender-900/20 transition-all"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteQuickNote(note.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              </div>
              {/* Show more indicator */}
              {notes.length > 3 && (
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                  Scroll to see more thoughts
                </p>
              )}
            </div>
          )}

          {/* Empty state hint */}
          {notes.length === 0 && !newNote && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
              Capture thoughts as they come to you
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
