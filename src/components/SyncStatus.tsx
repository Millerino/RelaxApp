/**
 * SyncStatus - Visual indicator for sync state
 *
 * Shows users when their data is syncing, synced, or if there are issues.
 * Inspired by sync indicators in apps like Notion, Obsidian, and Todoist.
 */

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { syncService } from '../services/syncService';

export function SyncStatus() {
  const { isSyncing, lastSyncAt, triggerSync } = useApp();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check pending changes periodically
  useEffect(() => {
    const checkPending = () => {
      setPendingChanges(syncService.getQueueSize());
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  // Don't show for non-logged-in users
  if (!user) {
    return null;
  }

  const formatLastSync = () => {
    if (!lastSyncAt) return 'Never synced';

    const now = new Date();
    const diff = now.getTime() - lastSyncAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastSyncAt.toLocaleDateString();
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return (
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      );
    }

    if (isSyncing) {
      return (
        <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }

    if (pendingChanges > 0) {
      return (
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (pendingChanges > 0) return `${pendingChanges} pending`;
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-amber-500';
    if (isSyncing) return 'text-blue-500';
    if (pendingChanges > 0) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
        title="Sync status"
      >
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </button>

      {/* Details dropdown */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon()}
                <span className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Last sync: {formatLastSync()}</p>
                {pendingChanges > 0 && (
                  <p className="text-amber-600 dark:text-amber-400">
                    {pendingChanges} change{pendingChanges > 1 ? 's' : ''} waiting to sync
                  </p>
                )}
                {!isOnline && (
                  <p className="text-amber-600 dark:text-amber-400">
                    Changes will sync when you're back online
                  </p>
                )}
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  triggerSync();
                  setShowDetails(false);
                }}
                disabled={!isOnline || isSyncing}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact sync indicator for use in headers/toolbars
 */
export function SyncIndicator() {
  const { isSyncing, lastSyncAt } = useApp();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!user) return null;

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1 text-amber-500" title="Offline - changes will sync when online">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1 text-blue-500" title="Syncing...">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-emerald-500" title={`Synced${lastSyncAt ? ` - ${lastSyncAt.toLocaleTimeString()}` : ''}`}>
      <div className="w-2 h-2 rounded-full bg-emerald-500" />
    </div>
  );
}

export default SyncStatus;
