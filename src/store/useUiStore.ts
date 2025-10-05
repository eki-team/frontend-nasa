import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SearchFilters } from "@/lib/types";
import { ChatResponse } from "@/lib/api-rag";

export type LanguageCode = "en" | "es" | "fr" | "de" | "pt" | "ja" | "it";

interface UiState {
  // Theme (always dark for space theme)
  theme: "dark";
  
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
  
  // Chat RAG state (persiste entre navegaciones)
  currentChatResponse: ChatResponse | null;
  setCurrentChatResponse: (response: ChatResponse | null) => void;
  clearChatResponse: () => void;
}

const defaultFilters: SearchFilters = {
  q: "",
  page: 1,
  pageSize: 12
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Always dark theme for space aesthetic
      theme: "dark",
      
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
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Chat RAG state
      currentChatResponse: null,
      setCurrentChatResponse: (response) => set({ currentChatResponse: response }),
      clearChatResponse: () => set({ currentChatResponse: null })
    }),
    {
      name: "nasa-bio-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        currentChatResponse: state.currentChatResponse // Persistir respuesta del chat
      })
    }
  )
);
