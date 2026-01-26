import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function QuickNotes() {
  const { state, addQuickNote, deleteQuickNote } = useApp();
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const notes = state.quickNotes || [];

  const handleAdd = () => {
    if (newNote.trim()) {
      addQuickNote(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setNewNote('');
      setIsAdding(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200">
          Quick Notes
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 rounded-lg text-lavender-500 hover:bg-lavender-100 dark:hover:bg-lavender-900/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Add new note input */}
      {isAdding && (
        <div className="mb-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a quick thought..."
            className="w-full px-3 py-2 text-sm rounded-lg bg-silver-50 dark:bg-silver-800/50
                     border border-silver-200 dark:border-silver-700 text-silver-800 dark:text-silver-100
                     placeholder-silver-400 focus:outline-none focus:ring-2 focus:ring-lavender-400
                     resize-none transition-all"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAdd}
              disabled={!newNote.trim()}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                        ${newNote.trim()
                          ? 'bg-lavender-500 text-white hover:bg-lavender-600'
                          : 'bg-silver-200 dark:bg-silver-700 text-silver-400 cursor-not-allowed'
                        }`}
            >
              Save
            </button>
            <button
              onClick={() => { setNewNote(''); setIsAdding(false); }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-silver-500 hover:bg-silver-100 dark:hover:bg-silver-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-xs text-silver-400 dark:text-silver-500 text-center py-3">
            {isAdding ? '' : 'Capture quick thoughts throughout your day'}
          </p>
        ) : (
          notes.slice().reverse().map((note) => (
            <div
              key={note.id}
              className="group p-2.5 rounded-lg bg-silver-50 dark:bg-silver-800/30
                       hover:bg-silver-100 dark:hover:bg-silver-800/50 transition-colors"
            >
              <p className="text-sm text-silver-700 dark:text-silver-200 leading-relaxed">
                {note.text}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-silver-400 dark:text-silver-500">
                  {formatTime(note.createdAt)}
                </span>
                <button
                  onClick={() => deleteQuickNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-silver-400 hover:text-red-500
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
