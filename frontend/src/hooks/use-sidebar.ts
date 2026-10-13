import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  collapsed: boolean;
  toggleCollapsed: () => void;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: false,
  collapsed: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
}));
