import { create } from 'zustand';

const useUiStore = create((set) => ({
  isSidebarOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
}));

export default useUiStore;
