import { create } from 'zustand';
import { Notification } from '@/features/notifications/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) => 
    set({ notifications, unreadCount }),

  addNotification: (notification) => 
    set((state) => {
      // Avoid duplicates
      if (state.notifications.some(n => n._id === notification._id)) {
        return state;
      }
      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (id) => 
    set((state) => {
      let readCountDiff = 0;
      const newNotifications = state.notifications.map((n) => {
        if (n._id === id && !n.isRead) {
          readCountDiff = -1;
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      });
      return {
        notifications: newNotifications,
        unreadCount: Math.max(0, state.unreadCount + readCountDiff),
      };
    }),

  removeNotification: (id) =>
    set((state) => {
      const notif = state.notifications.find((n) => n._id === id);
      const isUnread = notif ? !notif.isRead : false;
      
      return {
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
