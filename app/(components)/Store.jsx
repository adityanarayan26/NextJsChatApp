import { create } from 'zustand';

export const Store = create((set) => ({
  isSidebaropen: false,
  setIsSidebarOpen: (isSidebaropen) => set({ isSidebaropen }),

  SelectedUser: null,
  setSelectedUser: (SelectedUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedUser', JSON.stringify(SelectedUser));
    }
    set({ SelectedUser });
  },

  loadSelectedUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedUser');
      if (stored) {
        set({ SelectedUser: JSON.parse(stored) });
      }
    }
  },
}));
