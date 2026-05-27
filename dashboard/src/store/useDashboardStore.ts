import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  sidebarOpen: boolean;
  currentPage: string;
  notifications: Notification[];
  theme: 'light' | 'dark';
  
  // Actions
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  addNotification: (notification: Notification) => void;
  dismissNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentPage: 'dashboard',
      notifications: [],
      theme: 'dark',
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentPage: (page) => set({ currentPage: page }),
      addNotification: (notification) => 
        set((state) => ({ notifications: [notification, ...state.notifications] })),
      dismissNotification: (id) =>
        set((state) => ({ 
          notifications: state.notifications.filter((n) => n.id !== id) 
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);