import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type RealtimePayload = {
  new: any;
  old: any;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

interface UseRealtimeDeliveriesArgs {
  onInsert?: (payload: RealtimePayload) => void;
  onUpdate?: (payload: RealtimePayload) => void;
  onDelete?: (payload: RealtimePayload) => void;
  enabled?: boolean;
}

export function useRealtimeDeliveries({
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeDeliveriesArgs) {
  useEffect(() => {
    if (!enabled) return;

    // Create a robust channel targeting the 'deliveries' table
    const channel = supabase
      .channel('public:deliveries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deliveries' },
        (payload) => {
          if (onInsert) onInsert(payload as RealtimePayload);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deliveries' },
        (payload) => {
          if (onUpdate) onUpdate(payload as RealtimePayload);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'deliveries' },
        (payload) => {
          if (onDelete) onDelete(payload as RealtimePayload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Automatically subscribed to deliveries!');
        }
      });

    // Cleanup subscription cleanly on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, onInsert, onUpdate, onDelete]);
}
