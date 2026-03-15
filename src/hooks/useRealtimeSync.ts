import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { DayEntry, QuickNote } from '../types';

interface RealtimeSyncCallbacks {
  onEntryChange: (entry: DayEntry) => void;
  onNoteChange: (note: QuickNote) => void;
  onNoteDelete: (noteId: string) => void;
  onProfileChange: (profile: { xp?: number; days_used?: number }) => void;
}

/**
 * Subscribes to Supabase Realtime Postgres Changes for cross-device sync.
 * When another device inserts/updates data, this fires immediately via WebSocket.
 */
export function useRealtimeSync(userId: string | undefined, callbacks: RealtimeSyncCallbacks) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`sync-${userId}`)
      // --- Entries: INSERT and UPDATE ---
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacksRef.current.onEntryChange(rowToEntry(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacksRef.current.onEntryChange(rowToEntry(payload.new));
        }
      )
      // --- Quick Notes: INSERT, UPDATE, DELETE ---
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quick_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacksRef.current.onNoteChange(rowToNote(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quick_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacksRef.current.onNoteChange(rowToNote(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'quick_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // DELETE payloads only include columns in the replica identity (PK by default)
          const old = payload.old as Record<string, unknown>;
          if (old?.id) {
            callbacksRef.current.onNoteDelete(old.id as string);
          }
        }
      )
      // --- Profile: UPDATE (for XP, premium, etc.) ---
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          callbacksRef.current.onProfileChange({
            xp: row.xp as number | undefined,
            days_used: row.days_used as number | undefined,
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase!.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  return channelRef;
}

// --- Row → model converters (match supabase.ts) ---

function rowToEntry(row: Record<string, unknown>): DayEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    mood: row.mood as DayEntry['mood'],
    emotions: (row.emotions as string[]) || [],
    reflection: (row.reflection as string) || '',
    gratitude: (row.gratitude as string) || '',
    goals: (row.goals || []) as DayEntry['goals'],
    activities: (row.activities as string[]) || undefined,
    feelingLevels: (row.feeling_levels || undefined) as DayEntry['feelingLevels'],
    createdAt: row.created_at as number,
  };
}

function rowToNote(row: Record<string, unknown>): QuickNote {
  return {
    id: row.id as string,
    text: row.text as string,
    emoji: (row.emoji as string) || undefined,
    date: row.date as string,
    createdAt: row.created_at as number,
  };
}
