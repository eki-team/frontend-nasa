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

// Get study detail - USA CACHÉ o LLAMA AL CHAT RAG PARA OBTENER ABSTRACT
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

  // ✅ SEGUNDO: No existe PK único por paper, usar búsqueda para obtener info
  // Buscar el paper por su título/pk usando el endpoint de búsqueda
  try {
    console.log(`[API] Searching for document with pk: ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/front/documents/search?skip=0&limit=1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search_text: id.replace(/-/g, ' ') // Convertir pk a texto de búsqueda
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const searchData = await response.json();
    console.log('[API] Search result:', searchData);

    if (!searchData.documents || searchData.documents.length === 0) {
      throw new Error(`Document not found with pk: ${id}`);
    }

    const doc = searchData.documents[0];
    const title = doc.article_metadata?.title || doc.title || "Unknown Title";
    
    // ✅ TERCERO: Usar /api/chat para obtener el abstract completo
    // Hacemos una query específica para obtener información del paper
    console.log(`[API] Fetching abstract via chat for: ${title}`);
    
    const chatResponse = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `What is the abstract or summary of the paper titled "${title}"?`,
        top_k: 3
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat API error! status: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    console.log('[API] Chat response received:', chatData);

    // Extraer abstract de las citaciones
    let abstract = "";
    if (chatData.citations && chatData.citations.length > 0) {
      // Buscar la citación que mejor coincida con el título
      const relevantCitation = chatData.citations.find((c: any) => 
        c.metadata?.article_metadata?.title?.toLowerCase().includes(title.toLowerCase()) ||
        c.snippet?.toLowerCase().includes("abstract")
      ) || chatData.citations[0];
      
      abstract = relevantCitation.snippet || relevantCitation.text || "";
      
      // Si el snippet contiene "Abstract:", extraerlo
      const abstractMatch = abstract.match(/Abstract:\s*([\s\S]*?)(?=\n\n|Introduction:|Methods:|$)/i);
      if (abstractMatch) {
        abstract = abstractMatch[1].trim();
      }
    }

    // Si no se encontró abstract en citations, usar la respuesta del chat
    if (!abstract && chatData.answer) {
      abstract = chatData.answer;
    }

    // Construir StudyDetail desde los datos combinados
    const studyDetail: StudyDetail = {
      id: doc.pk,
      title: title,
      year: parseInt(doc.article_metadata?.scraped_at?.substring(0, 4)) || null,
      mission: undefined,
      species: undefined,
      outcomes: doc.tags || [],
      summary: abstract.substring(0, 300) + (abstract.length > 300 ? "..." : ""),
      abstract: abstract || "Abstract not available for this paper.",
      citations: 0,
      keywords: doc.tags || [],
      related: [],
      methods: undefined,
      relevanceScore: undefined,
      authors: doc.article_metadata?.authors || [],
      doi: doc.article_metadata?.doi || null,
    };

    console.log('[API] Study detail constructed:', studyDetail);
    
    // Guardar en caché para futuras consultas
    cacheStudy({
      id: studyDetail.id,
      title: studyDetail.title,
      year: studyDetail.year,
      mission: studyDetail.mission,
      species: studyDetail.species,
      outcomes: studyDetail.outcomes,
      summary: studyDetail.summary,
      abstract: studyDetail.abstract,
      relevanceScore: studyDetail.relevanceScore,
    });

    return studyDetail;
  } catch (error) {
    console.error(`[API] Error fetching study ${id}:`, error);
    console.warn('[API] Falling back to mock data');
    
    // Fallback a mock data si falla la llamada
    return getMockStudyById(id);
  }
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

/**
 * Lista documentos con paginación mejorada (incluye info de páginas)
 */
export interface PaginatedDocumentsResponse extends DocumentsResponse {
  page: number;
  page_size: number;
  total_pages: number;
}

export const listDocumentsPaginated = async (
  page: number = 1,
  pageSize: number = 20,
  category?: string,
  sourceType?: string
): Promise<PaginatedDocumentsResponse> => {
  console.log(`[API] Listing paginated documents: page=${page}, pageSize=${pageSize}, category=${category}`);

  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for paginated documents');
    await delay(300);
    
    const mockStudies = getMockStudies({ page, pageSize });
    const totalPages = Math.ceil(mockStudies.total / pageSize);
    
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
      })),
      page,
      page_size: pageSize,
      total_pages: totalPages
    };
  }

  let url = `${API_BASE_URL}/api/front/documents/paginated?page=${page}&page_size=${pageSize}`;
  if (category) url += `&category=${category}`;
  if (sourceType) url += `&source_type=${sourceType}`;
  
  console.log('[API] Request URL:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch paginated documents: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API] Paginated documents response:', data);

  return data;
};

/**
 * Busca documentos por categoría
 */
export const searchDocumentsByCategory = async (
  category: string,
  skip: number = 0,
  limit: number = 20
): Promise<DocumentsResponse> => {
  console.log(`[API] Searching documents by category: "${category}", skip=${skip}, limit=${limit}`);

  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for documents by category');
    await delay(300);
    
    const mockStudies = getMockStudies({ page: Math.floor(skip / limit) + 1, pageSize: limit });
    return {
      total: mockStudies.total,
      documents: mockStudies.studies.map(study => ({
        pk: study.id,
        title: study.title,
        source_type: "article",
        category: category,
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

  const url = `${API_BASE_URL}/api/front/documents/by-category?category=${encodeURIComponent(category)}&skip=${skip}&limit=${limit}`;
  console.log('[API] Request URL:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to search documents by category: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API] Documents by category response:', data);

  return data;
};

/**
 * Busca documentos por tags
 */
export const searchDocumentsByTags = async (
  tags: string[],
  matchAll: boolean = false,
  skip: number = 0,
  limit: number = 20
): Promise<DocumentsResponse> => {
  console.log(`[API] Searching documents by tags: [${tags.join(", ")}], matchAll=${matchAll}, skip=${skip}, limit=${limit}`);

  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for documents by tags');
    await delay(300);
    
    const mockStudies = getMockStudies({ page: Math.floor(skip / limit) + 1, pageSize: limit });
    return {
      total: mockStudies.total,
      documents: mockStudies.studies.map(study => ({
        pk: study.id,
        title: study.title,
        source_type: "article",
        category: "space",
        tags: tags.slice(0, 3),
        total_chunks: 10,
        article_metadata: {
          title: study.title,
          authors: study.authors,
          doi: study.doi || undefined,
        }
      }))
    };
  }

  const tagsParam = tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
  const url = `${API_BASE_URL}/api/front/documents/by-tags?${tagsParam}&match_all=${matchAll}&skip=${skip}&limit=${limit}`;
  console.log('[API] Request URL:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to search documents by tags: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API] Documents by tags response:', data);

  return data;
};

/**
 * Obtiene valores disponibles para filtros
 */
export interface FilterValues {
  categories: string[];
  tags: string[];
  source_types: string[];
  total_documents: number;
  total_chunks: number;
}

export const getFilterValues = async (): Promise<FilterValues> => {
  console.log('[API] Getting filter values');

  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data for filter values');
    await delay(200);
    
    return {
      categories: ["space", "biology", "physics", "general"],
      tags: ["mice", "mission", "microgravity", "spaceflight", "immune", "bone"],
      source_types: ["article"],
      total_documents: 150,
      total_chunks: 3500
    };
  }

  const url = `${API_BASE_URL}/api/front/filter-values`;
  console.log('[API] Request URL:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch filter values: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API] Filter values response:', data);

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
