import { create } from 'zustand';

interface UiState {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Active user role
  currentRole: 'doctor' | 'receptionist' | 'super_admin';
  setCurrentRole: (role: 'doctor' | 'receptionist' | 'super_admin') => void;

  // Token creation drawer
  tokenDrawerOpen: boolean;
  setTokenDrawerOpen: (open: boolean) => void;

  // Global patient search overlay (Cmd+K)
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Patient 360 Workspace active patient
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;

  // Dark Mode Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  initializeTheme: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  currentRole: 'doctor', // Default role is doctor
  setCurrentRole: (role) => set({ currentRole: role }),

  tokenDrawerOpen: false,
  setTokenDrawerOpen: (open) => set({ tokenDrawerOpen: open }),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  activePatientId: null, // Default active patient for initial Patient360 view
  setActivePatientId: (id) => set({ activePatientId: id }),

  darkMode: false,
  toggleDarkMode: () => {
    const nextDark = !get().darkMode;
    set({ darkMode: nextDark });
    if (typeof window !== 'undefined') {
      localStorage.setItem('clinicos_dark_mode', String(nextDark));
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clinicos_dark_mode');
      const isDark = saved ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      set({ darkMode: isDark });
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}));
