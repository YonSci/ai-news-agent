import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  refreshIntervalMinutes: number;
  defaultRegion: string;
  defaultTopic: string;
  setRefreshIntervalMinutes: (minutes: number) => void;
  setDefaultRegion: (region: PreferencesState['defaultRegion']) => void;
  setDefaultTopic: (topic: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      refreshIntervalMinutes: 15,
      defaultRegion: 'all',
      defaultTopic: 'all',
      setRefreshIntervalMinutes: (minutes) => set({ refreshIntervalMinutes: Math.max(1, minutes) }),
      setDefaultRegion: (region) => set({ defaultRegion: region }),
      setDefaultTopic: (topic) => set({ defaultTopic: topic || 'all' }),
    }),
    {
      name: 'dashboard-preferences',
    }
  )
);