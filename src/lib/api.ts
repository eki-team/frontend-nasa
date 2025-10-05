import { 
  SearchResponse, 
  StudyDetail, 
  GraphResponse, 
  Insights, 
  SearchFilters,
  KpiData 
} from "./types";
import { 
  searchWithFrontendFilters, 
  ChatResponse, 
  Source,
  healthCheck 
} from "./api-rag";
import {
  getMockStudies,
  getMockStudyById,
  getMockKpiData,
  getMockInsights,
  getMockGraph,
  delay
} from "./mock-data";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Flag para habilitar modo mock
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Helper to build query string (mantenido para compatibilidad)
const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v.toString()));
      } else {
        query.append(key, value.toString());
      }
    }
  });
  
  return query.toString();
};

// Helper para convertir respuesta RAG a formato frontend
const convertRagResponseToSearchResponse = (
  ragResponse: ChatResponse,
  filters: SearchFilters
): SearchResponse => {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;

  // Convertir citations a estudios
  const studies = ragResponse.citations.map((citation, index: number) => ({
    id: citation.source_id || `study-${Date.now()}-${index}`, // ID temporal
    title: citation.title,
    authors: [], // Las citations no tienen authors en la nueva estructura
    year: citation.year || null,
    abstract: citation.snippet,
    mission: citation.osdr_id || filters.mission || "Unknown",
    species: filters.species?.[0] || "Unknown",
    outcomes: filters.outcome || [],
    citations: 0, // Mock 
    doi: citation.doi || null,
    relevanceScore: 0.95, // Mock score
  }));

  return {
    studies,
    total: studies.length,
    page,
    pageSize,
    totalPages: Math.ceil(studies.length / pageSize),
    hasMore: false,
  };
};

// Search studies - NUEVA IMPLEMENTACIÓN CON RAG
export const searchStudies = async (filters: SearchFilters): Promise<SearchResponse> => {
  // Modo mock
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for studies search');
    console.log('[API] Search filters:', filters);
    
    // Simular delay de red
    await delay(300 + Math.random() * 200);
    
    const mockResponse = getMockStudies(filters);
    console.log('[API] Mock studies response:', mockResponse);
    
    return mockResponse;
  }

  // Modo normal con backend
  try {
    // Si no hay query, retornar vacío
    if (!filters.query || filters.query.trim() === "") {
      return {
        studies: [],
        total: 0,
        page: filters.page || 1,
        pageSize: filters.pageSize || 12,
        totalPages: 0,
        hasMore: false,
      };
    }

    // Usar el nuevo cliente RAG
    const ragResponse = await searchWithFrontendFilters(
      filters.query,
      filters,
      filters.pageSize || 12
    );

    // Convertir respuesta RAG al formato esperado por el frontend
    return convertRagResponseToSearchResponse(ragResponse, filters);
  } catch (error) {
    console.error("Search error:", error);
    console.warn('[API] 💡 Tip: Set VITE_USE_MOCK_DATA=true in .env to use mock data while backend is unavailable');
    throw new Error(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Get study detail
export const getStudyById = async (id: string): Promise<StudyDetail> => {
  // Modo mock
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for study detail:', id);
    
    // Simular delay de red
    await delay(200 + Math.random() * 150);
    
    const mockStudy = getMockStudyById(id);
    console.log('[API] Mock study detail:', mockStudy);
    
    return mockStudy;
  }

  // Modo normal con backend
  const response = await fetch(`${API_BASE_URL}/studies/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch study: ${response.statusText}`);
  }
  
  return response.json();
};

// Get knowledge graph
export const getKnowledgeGraph = async (filters?: Partial<SearchFilters>): Promise<GraphResponse> => {
  // Modo mock
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for knowledge graph');
    
    // Simular delay de red
    await delay(400 + Math.random() * 200);
    
    const mockGraph = getMockGraph();
    console.log('[API] Mock graph:', mockGraph);
    
    return mockGraph;
  }

  // Modo normal con backend
  const queryString = buildQueryString(filters || {});
  const response = await fetch(`${API_BASE_URL}/graph?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch graph: ${response.statusText}`);
  }
  
  return response.json();
};

// Get insights/overview
export const getInsights = async (filters?: Partial<SearchFilters>): Promise<Insights> => {
  // Modo mock
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for insights');
    
    // Simular delay de red
    await delay(350 + Math.random() * 150);
    
    const mockInsights = getMockInsights();
    console.log('[API] Mock insights:', mockInsights);
    
    return mockInsights;
  }

  // Modo normal con backend
  const queryString = buildQueryString(filters || {});
  const response = await fetch(`${API_BASE_URL}/insights/overview?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }
  
  return response.json();
};

// Get KPI data
export const getKpiData = async (): Promise<KpiData> => {
  // Modo mock
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for KPIs');
    
    // Simular delay de red
    await delay(150 + Math.random() * 100);
    
    const mockKpi = getMockKpiData();
    console.log('[API] Mock KPI:', mockKpi);
    
    return mockKpi;
  }

  // Modo normal con backend
  const response = await fetch(`${API_BASE_URL}/kpi`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
  }
  
  return response.json();
};

// Export utilities
export const exportToCSV = (data: any[], filename: string = "export.csv") => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === "string" && value.includes(",") 
          ? `"${value}"` 
          : value;
      }).join(",")
    )
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportToJSON = (data: any[], filename: string = "export.json") => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
