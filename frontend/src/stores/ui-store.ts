import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  open: boolean;
}

interface UiState {
  toast: Toast;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      toast: { message: '', type: 'info', open: false },
      showToast: (message, type = 'info') => set({ toast: { message, type, open: true } }),
      hideToast: () => set((state) => ({ toast: { ...state.toast, open: false } })),
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
);
