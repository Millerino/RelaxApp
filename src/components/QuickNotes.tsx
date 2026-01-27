import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const MOOD_EMOJIS = ['😊', '😌', '🥰', '😤', '😢', '😰', '🤔', '💪', '🌟', '❤️'];

export function QuickNotes() {
  const { state, addQuickNote, deleteQuickNote, updateQuickNoteEmoji } = useApp();
  const [newNote, setNewNote] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const todayStr = new Date().toDateString();
  const todayNotes = (state.quickNotes || []).filter(n => n.date === todayStr);

  const handleSubmit = () => {
    if (newNote.trim()) {
      addQuickNote(newNote.trim());
      setNewNote('');
      setSelectedEmoji(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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
              Today
            </span>
          </div>

          {/* Input area - clean minimal design */}
          <div className="relative mb-3">
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

            {/* Action row */}
            {newNote.trim() && (
              <div className="flex items-center justify-between mt-2">
                {/* Emoji selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tag:</span>
                  <div className="flex gap-0.5">
                    {MOOD_EMOJIS.slice(0, 5).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm
                                  transition-all hover:scale-105 ${
                          selectedEmoji === emoji
                            ? 'bg-lavender-100 dark:bg-lavender-900/50 ring-1 ring-lavender-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSubmit}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg
                           bg-lavender-500 text-white hover:bg-lavender-600
                           transition-all hover:scale-105 active:scale-95"
                >
                  Capture
                </button>
              </div>
            )}
          </div>

          {/* Today's notes - fixed height with scroll */}
          {todayNotes.length > 0 && (
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {todayNotes.slice().reverse().map((note) => (
                <div
                  key={note.id}
                  className="group flex items-start gap-2 p-2.5 rounded-lg
                           bg-white/60 dark:bg-slate-900/30
                           hover:bg-white dark:hover:bg-slate-900/50 transition-colors"
                >
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
                                    flex gap-1 flex-wrap w-32">
                        {MOOD_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              updateQuickNoteEmoji(note.id, emoji);
                              setShowEmojiPicker(null);
                            }}
                            className="w-6 h-6 rounded hover:bg-silver-100 dark:hover:bg-silver-700
                                     flex items-center justify-center text-sm transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Note content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {note.text}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatTime(note.createdAt)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteQuickNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded
                             text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20
                             transition-all flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              </div>
              {/* Show more indicator */}
              {todayNotes.length > 3 && (
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                  Scroll to see more thoughts
                </p>
              )}
            </div>
          )}

          {/* Empty state hint */}
          {todayNotes.length === 0 && !newNote && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
              Capture thoughts as they come to you
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
