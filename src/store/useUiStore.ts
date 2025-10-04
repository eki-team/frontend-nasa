import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SearchFilters } from "@/lib/types";

export type LanguageCode = "en" | "es" | "fr" | "de" | "pt" | "ja" | "it";

interface UiState {
  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  
  // Language
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  
  // Filters
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  
  // Graph state
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  
  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const defaultFilters: SearchFilters = {
  q: "",
  page: 1,
  pageSize: 12
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        return { theme: newTheme };
      }),
      
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      
      filters: defaultFilters,
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 }
      })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      selectedNode: null,
      setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
      
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    }),
    {
      name: "nasa-bio-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language
      })
    }
  )
);
