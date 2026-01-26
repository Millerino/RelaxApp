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
      {/* Notebook paper styling */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow-md overflow-hidden
                    border-l-4 border-amber-300 dark:border-amber-700">
        {/* Torn paper edge effect at top */}
        <div className="h-2 bg-gradient-to-b from-amber-100/50 to-transparent dark:from-amber-800/30"
             style={{
               maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q 5 5, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10 L 100 0 L 0 0 Z\' fill=\'white\'/%3E%3C/svg%3E")',
               WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q 5 5, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10 L 100 0 L 0 0 Z\' fill=\'white\'/%3E%3C/svg%3E")'
             }} />

        <div className="p-3">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📝</span>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Quick Thoughts
            </h3>
            <span className="text-xs text-amber-600/60 dark:text-amber-400/60 ml-auto">
              Today
            </span>
          </div>

          {/* Immediate input area - looks like notebook lines */}
          <div className="relative mb-3">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind..."
              className="w-full bg-transparent text-sm text-amber-900 dark:text-amber-100
                       placeholder-amber-400 dark:placeholder-amber-500/50
                       resize-none focus:outline-none min-h-[60px]
                       leading-6"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, rgba(180, 140, 100, 0.2) 24px)',
                backgroundSize: '100% 24px',
              }}
              rows={2}
            />

            {/* Action row */}
            {newNote.trim() && (
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-amber-200/50 dark:border-amber-700/50">
                {/* Emoji selector */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-amber-600/70 dark:text-amber-400/70">Feeling:</span>
                  <div className="flex gap-0.5">
                    {MOOD_EMOJIS.slice(0, 5).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-sm
                                  transition-all hover:scale-110 ${
                          selectedEmoji === emoji
                            ? 'bg-amber-300/50 dark:bg-amber-600/50 scale-110'
                            : 'hover:bg-amber-200/50 dark:hover:bg-amber-700/50'
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
                  className="px-3 py-1 text-xs font-medium rounded-full
                           bg-amber-500 text-white hover:bg-amber-600
                           transition-all hover:scale-105 active:scale-95"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Today's notes */}
          {todayNotes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-amber-200/30 dark:border-amber-700/30">
              {todayNotes.slice().reverse().map((note) => (
                <div
                  key={note.id}
                  className="group flex items-start gap-2 p-2 rounded-lg
                           hover:bg-amber-100/50 dark:hover:bg-amber-800/30 transition-colors"
                >
                  {/* Emoji or bullet */}
                  <div className="relative">
                    {note.emoji ? (
                      <span className="text-sm">{note.emoji}</span>
                    ) : (
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === note.id ? null : note.id)}
                        className="w-5 h-5 rounded-full bg-amber-200/50 dark:bg-amber-700/50
                                 flex items-center justify-center text-[10px] text-amber-600 dark:text-amber-300
                                 hover:bg-amber-300/50 dark:hover:bg-amber-600/50 transition-colors"
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
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                      {note.text}
                    </p>
                    <span className="text-[10px] text-amber-500/60 dark:text-amber-400/50">
                      {formatTime(note.createdAt)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteQuickNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded
                             text-amber-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                             transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state hint */}
          {todayNotes.length === 0 && !newNote && (
            <p className="text-xs text-amber-500/60 dark:text-amber-400/50 text-center italic">
              Jot down thoughts, feelings, or moments throughout your day
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
