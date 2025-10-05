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
import { Study } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Flag para habilitar modo mock
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// ==================== CACHÉ DE ESTUDIOS ====================
// Cache en memoria de estudios para poder acceder a los detalles sin hacer llamadas adicionales
const studiesCache = new Map<string, Study>();

/**
 * Guarda un estudio en el caché
 */
export const cacheStudy = (study: Study) => {
  studiesCache.set(study.id, study);
  console.log(`[CACHE] Stored study: ${study.id}`);
};

/**
 * Obtiene un estudio del caché
 */
export const getCachedStudy = (id: string): Study | undefined => {
  const cached = studiesCache.get(id);
  if (cached) {
    console.log(`[CACHE] Found study in cache: ${id}`);
  }
  return cached;
};

/**
 * Guarda múltiples estudios en el caché
 */
export const cacheStudies = (studies: Study[]) => {
  studies.forEach(study => cacheStudy(study));
  console.log(`[CACHE] Stored ${studies.length} studies`);
};

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

  console.log('[API] Converting RAG response to search response');
  console.log('[API] RAG citations:', ragResponse.citations);

  // Convertir citations a estudios
  const studies = ragResponse.citations.map((citation, index: number) => {
    // El título y authors ahora están en metadata.article_metadata
    const articleMetadata = (citation as any).metadata?.article_metadata;
    const title = articleMetadata?.title || citation.title || `Study from ${citation.source_id}`;
    const authors = articleMetadata?.authors || [];

    return {
      id: citation.source_id || `study-${Date.now()}-${index}`,
      title,
      authors,
      year: citation.year || null,
      abstract: citation.snippet,
      mission: citation.osdr_id || undefined, // Dejar undefined si no existe
      species: (citation as any).organism || undefined,
      outcomes: [], // No disponible en citations
      citations: 0, 
      doi: citation.doi || (citation as any).metadata?.article_metadata?.doi || null,
      relevanceScore: (citation as any).final_score || (citation as any).similarity_score || 0.95,
    };
  });

  // ✅ ORDENAR por relevanceScore (final_score) de mayor a menor
  studies.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  console.log('[API] Converted studies (sorted by relevance):', studies);
  console.log(`[API] Top result: ${studies[0]?.title} (score: ${studies[0]?.relevanceScore})`);

  // ✅ CACHEAR ESTUDIOS para poder usarlos en getStudyById
  cacheStudies(studies);

  return {
    studies,
    total: studies.length,
    page,
    pageSize,
    totalPages: Math.ceil(studies.length / pageSize),
    hasMore: false,
  };
};

// Search studies - USA /api/chat para búsqueda semántica o /api/front/documents/search para filtrado
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

  // Modo normal con backend RAG
  try {
    // Si hay query, usar RAG chat para búsqueda semántica
    if (filters.query && filters.query.trim() !== "") {
      console.log('[API] Using RAG chat endpoint for semantic search');
      
      const ragResponse = await searchWithFrontendFilters(
        filters.query,
        filters,
        filters.pageSize || 12
      );

      // Convertir respuesta RAG al formato esperado por el frontend
      return convertRagResponseToSearchResponse(ragResponse, filters);
    }
    
    // Si NO hay query, usar endpoint de documents/search con filtros
    console.log('[API] Using /api/front/documents/search for filtered search');
    
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 12;
    const skip = (page - 1) * pageSize;
    
    // Construir body de búsqueda según filtros disponibles
    const searchBody: any = {};
    
    // El backend usa tags, no species/outcome
    // TODO: mapear correctamente los filtros del frontend a los del backend
    if (filters.species && filters.species.length > 0) {
      searchBody.tags = filters.species;
    }
    
    if (filters.mission) {
      searchBody.search_text = filters.mission;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/front/documents/search?skip=${skip}&limit=${pageSize}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchBody)
      }
    );
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convertir documentos del RAG a estudios
    const studies = data.documents.map((doc: any) => ({
      id: doc.pk,
      title: doc.title || doc.article_metadata?.title,
      authors: doc.article_metadata?.authors || [],
      year: doc.article_metadata?.year || null,
      abstract: doc.article_metadata?.abstract || "",
      mission: doc.article_metadata?.mission || undefined,
      species: doc.article_metadata?.organism || undefined,
      outcomes: [],
      citations: 0,
      doi: doc.article_metadata?.doi || null,
      relevanceScore: 0.90,
      keywords: doc.tags || [],
      summary: doc.article_metadata?.abstract?.substring(0, 300) || "",
    }));
    
    return {
      studies,
      total: data.total,
      page,
      pageSize,
      totalPages: Math.ceil(data.total / pageSize),
      hasMore: skip + studies.length < data.total,
    };
    
  } catch (error) {
    console.error("Search error:", error);
    console.warn('[API] 💡 Tip: Set VITE_USE_MOCK_DATA=true in .env to use mock data while backend is unavailable');
    throw new Error(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Get study detail - USA CACHÉ de búsquedas anteriores
export const getStudyById = async (id: string): Promise<StudyDetail> => {
  console.log(`[API] Fetching study by ID: ${id}`);
  
  // Modo mock
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for study detail:', id);
    
    // Simular delay de red
    await delay(200 + Math.random() * 150);
    
    const mockStudy = getMockStudyById(id);
    console.log('[API] Mock study detail:', mockStudy);
    
    return mockStudy;
  }

  // ✅ PRIMERO: Intentar obtener del caché
  const cachedStudy = getCachedStudy(id);
  if (cachedStudy) {
    console.log(`[API] Using cached study: ${id}`);
    
    // Convertir Study a StudyDetail (agregar campos faltantes)
    return {
      ...cachedStudy,
      summary: cachedStudy.abstract?.substring(0, 300) || "",
      keywords: [],
      related: [],
      methods: undefined,
    };
  }

  // ✅ FALLBACK: Si no está en caché, el endpoint /api/front/documents/{pk} NO EXISTE
  // Retornar error o mock data
  console.warn(`[API] ⚠️ Study ${id} not found in cache and /api/front/documents/{pk} endpoint does not exist`);
  console.warn('[API] 💡 Tip: Make sure to search for studies first, which will populate the cache');
  
  // Opción 1: Retornar mock data como fallback
  console.log('[API] Using mock data as fallback');
  return getMockStudyById(id);
  
  // Opción 2: Lanzar error (comentado por ahora)
  // throw new Error(`Study ${id} not found. Please search for studies first to populate the cache.`);
};

// Get knowledge graph - ENDPOINT NO DISPONIBLE EN RAG BACKEND
// TODO: El backend RAG no tiene endpoint de graph, usar mock data o implementar en backend
export const getKnowledgeGraph = async (filters?: Partial<SearchFilters>): Promise<GraphResponse> => {
  // Siempre usar mock data ya que el endpoint no existe en el backend
  if (USE_MOCK_DATA || true) {
    console.log('[API] Using mock data for knowledge graph (endpoint not available in RAG backend)');
    
    // Simular delay de red
    await delay(400 + Math.random() * 200);
    
    const mockGraph = getMockGraph();
    console.log('[API] Mock graph:', mockGraph);
    
    return mockGraph;
  }

  // Este código nunca se ejecutará hasta que el backend implemente el endpoint
  const queryString = buildQueryString(filters || {});
  const response = await fetch(`${API_BASE_URL}/graph?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch graph: ${response.statusText}`);
  }
  
  return response.json();
};

// Get insights/overview - ENDPOINT NO DISPONIBLE EN RAG BACKEND
// TODO: El backend RAG no tiene endpoint de insights, usar mock data o implementar en backend
export const getInsights = async (filters?: Partial<SearchFilters>): Promise<Insights> => {
  // Siempre usar mock data ya que el endpoint no existe en el backend
  if (USE_MOCK_DATA || true) {
    console.log('[API] Using mock data for insights (endpoint not available in RAG backend)');
    
    // Simular delay de red
    await delay(350 + Math.random() * 150);
    
    const mockInsights = getMockInsights();
    console.log('[API] Mock insights:', mockInsights);
    
    return mockInsights;
  }

  // Este código nunca se ejecutará hasta que el backend implemente el endpoint
  const queryString = buildQueryString(filters || {});
  const response = await fetch(`${API_BASE_URL}/insights/overview?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }
  
  return response.json();
};

// Get KPI data - USANDO ENDPOINT REAL DEL RAG
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

  // Modo normal con backend RAG - usar endpoint correcto
  const response = await fetch(`${API_BASE_URL}/api/front/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Convertir formato del RAG a formato frontend
  return {
    totalStudies: data.total_documents || 0,
    yearsCovered: "2018-2024", // TODO: calcular desde los datos
    totalMissions: data.categories_count || 0,
    totalSpecies: data.tags_count || 0,
  };
};

// ==================== EXPLORAR DOCUMENTOS ====================

export interface Document {
  pk: string;
  title: string;
  source_type: string;
  source_url?: string;
  category: string;
  tags: string[];
  total_chunks: number;
  article_metadata?: {
    url?: string;
    title?: string;
    authors?: string[];
    scraped_at?: string;
    pmc_id?: string;
    doi?: string;
    statistics?: {
      word_count?: number;
      sections?: number;
    };
  };
}

export interface DocumentsResponse {
  total: number;
  documents: Document[];
}

/**
 * Lista todos los documentos con paginación
 */
export const listDocuments = async (
  skip: number = 0,
  limit: number = 20
): Promise<DocumentsResponse> => {
  console.log(`[API] Listing documents: skip=${skip}, limit=${limit}`);

  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for documents list');
    await delay(300);
    
    // Retornar mock data (reutilizar studies como documentos)
    const mockStudies = getMockStudies({ page: Math.floor(skip / limit) + 1, pageSize: limit });
    return {
      total: mockStudies.total,
      documents: mockStudies.studies.map(study => ({
        pk: study.id,
        title: study.title,
        source_type: "article",
        category: "space",
        tags: study.keywords || [],
        total_chunks: 10,
        article_metadata: {
          title: study.title,
          authors: study.authors,
          doi: study.doi || undefined,
        }
      }))
    };
  }

  const url = `${API_BASE_URL}/api/front/documents?skip=${skip}&limit=${limit}`;
  console.log('[API] Request URL:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API] Documents response:', data);

  return data;
};

/**
 * Busca documentos por texto
 */
export const searchDocuments = async (
  searchText: string,
  skip: number = 0,
  limit: number = 20
): Promise<DocumentsResponse> => {
  console.log(`[API] Searching documents: "${searchText}", skip=${skip}, limit=${limit}`);

  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for documents search');
    await delay(300);
    
    const mockStudies = getMockStudies({ query: searchText, page: Math.floor(skip / limit) + 1, pageSize: limit });
    return {
      total: mockStudies.total,
      documents: mockStudies.studies.map(study => ({
        pk: study.id,
        title: study.title,
        source_type: "article",
        category: "space",
        tags: study.keywords || [],
        total_chunks: 10,
        article_metadata: {
          title: study.title,
          authors: study.authors,
          doi: study.doi || undefined,
        }
      }))
    };
  }

  const url = `${API_BASE_URL}/api/front/documents/search?skip=${skip}&limit=${limit}`;
  console.log('[API] Request URL:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      search_text: searchText,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search documents: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API] Search response:', data);

  return data;
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
