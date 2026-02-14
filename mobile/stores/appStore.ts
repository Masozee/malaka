import { create } from 'zustand';
import { notificationsApi, messagingApi, actionItemsApi } from '@/services/api';

interface AppState {
  isOnline: boolean;
  pendingApprovals: number;
  unreadMessages: number;
  unreadNotifications: number;

  setOnline: (online: boolean) => void;
  setPendingApprovals: (count: number) => void;
  setUnreadMessages: (count: number) => void;
  setUnreadNotifications: (count: number) => void;

  /** Fetch all badge counts from backend */
  fetchCounts: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  pendingApprovals: 0,
  unreadMessages: 0,
  unreadNotifications: 0,

  setOnline: (isOnline) => set({ isOnline }),
  setPendingApprovals: (pendingApprovals) => set({ pendingApprovals }),
  setUnreadMessages: (unreadMessages) => set({ unreadMessages }),
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),

  fetchCounts: async () => {
    try {
      const results = await Promise.allSettled([
        notificationsApi.getUnreadCount(),
        messagingApi.getUnreadCount(),
        actionItemsApi.get(),
      ]);

      if (results[0].status === 'fulfilled') {
        const d = results[0].value.data?.data ?? results[0].value.data;
        set({ unreadNotifications: d?.count ?? d?.unread_count ?? 0 });
      }

      if (results[1].status === 'fulfilled') {
        const d = results[1].value.data?.data ?? results[1].value.data;
        set({ unreadMessages: d?.count ?? d?.unread_count ?? 0 });
      }

      if (results[2].status === 'fulfilled') {
        const d = results[2].value.data?.data ?? results[2].value.data;
        const approvals = d?.pending_approvals ?? d?.approvals ?? 0;
        set({ pendingApprovals: approvals });
      }
    } catch {
      // Silently fail — counts stay at 0
    }
  },
}));
