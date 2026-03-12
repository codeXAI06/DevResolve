import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  dark: true,

  toggle: () =>
    set((s) => {
      const next = !s.dark;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return { dark: next };
    }),

  hydrate: () => {
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : true;
    document.documentElement.classList.toggle('dark', dark);
    set({ dark });
  },
}));
