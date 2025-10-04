import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatQuery, ChatRequest, ChatResponse } from "@/lib/api-rag";
import { useUiStore } from "@/store/useUiStore";

export const useChatRag = () => {
  const { filters } = useUiStore();
  const [chatHistory, setChatHistory] = useState<ChatResponse[]>([]);

  const chatMutation = useMutation({
    mutationFn: (query: string) => {
      // Construir el request con filtros actuales
      const request: ChatRequest = {
        query,
        top_k: 8,
      };

      // Agregar filtros si existen
      if (filters.mission || filters.outcome || filters.yearFrom || filters.yearTo) {
        request.filters = {};

        // Mapear misión a mission_env
        if (filters.mission) {
          request.filters.mission_env = [filters.mission];
        }

        // Mapear year range
        if (filters.yearFrom || filters.yearTo) {
          const yearFrom = filters.yearFrom || 1960;
          const yearTo = filters.yearTo || new Date().getFullYear();
          request.filters.year_range = [yearFrom, yearTo];
        }

        // Mapear outcomes a system (si aplica)
        if (filters.outcome && filters.outcome.length > 0) {
          // Los outcomes podrían mapearse a diferentes filtros según el caso
          // Por ahora los dejamos como están para futura implementación
        }
      }

      return chatQuery(request);
    },
    onSuccess: (data) => {
      // Guardar en historial
      setChatHistory((prev) => [...prev, data]);
    },
  });

  const sendQuery = (query: string) => {
    if (!query || query.trim().length < 3) {
      return;
    }
    chatMutation.mutate(query);
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  return {
    sendQuery,
    clearHistory,
    chatHistory,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
    currentResponse: chatMutation.data,
  };
};
