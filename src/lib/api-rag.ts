// API client para el backend RAG de NASA
// In production (Vercel), use relative URL to leverage Vercel proxy
// In development, use environment variable or localhost
const API_BASE_URL = import.meta.env.PROD 
  ? "" // Empty string = same origin, uses Vercel proxy
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");

// Flag para habilitar modo mock (útil cuando el backend no está disponible)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

import { getMockChatResponse, delay } from './mock-data';

// ==================== TIPOS ====================

export interface ChatRequest {
  query: string;
  filters?: {
    organism?: string[];
    mission_env?: string[];
    exposure?: string[];
    system?: string[];
    year_range?: [number, number];
    tissue?: string[];
    assay?: string[];
  };
  top_k?: number;
  session_id?: string;
}

export interface Citation {
  source_id: string;
  doi?: string;
  osdr_id?: string;
  section?: string;
  snippet: string;
  url?: string;
  title?: string; // Puede estar aquí o en metadata
  year?: number;
  organism?: string;
  similarity_score?: number;
  section_boost?: number;
  final_score?: number;
  relevance_reason?: string;
  metadata?: {
    article_metadata?: {
      title?: string;
      authors?: string[];
      pmc_id?: string;
      doi?: string;
      url?: string;
      scraped_at?: string;
      statistics?: {
        word_count?: number;
        sections?: number;
      };
    };
  };
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  used_filters?: any;
  metrics?: {
    latency_ms: number;
    retrieved_k: number;
    grounded_ratio: number;
    dedup_count: number;
    section_distribution?: Record<string, number>;
  };
  session_id?: string;
}

export interface Source {
  title: string;
  authors?: string[];
  year?: number;
  doi?: string;
  chunk_text: string;
  score: number;
  metadata?: any;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  dimension: number;
}

export interface RetrievalResponse {
  query: string;
  chunks: Source[];
  total_found: number;
}

// ==================== FUNCIONES API ====================

/**
 * Realiza una consulta al sistema RAG con filtros opcionales
 */
export const chatQuery = async (request: ChatRequest): Promise<ChatResponse> => {
  // Modo mock: útil cuando el backend no está disponible
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data mode');
    console.log('[API] Mock request:', JSON.stringify(request, null, 2));
    
    // Simular delay de red (200-400ms aleatorio)
    await delay(200 + Math.random() * 200);
    
    const mockResponse = getMockChatResponse(request.query);
    console.log('[API] Mock response:', mockResponse);
    
    return mockResponse;
  }

  // Modo normal: conectar al backend real
  try {
    const url = `${API_BASE_URL}/api/chat`;
    console.log('[API] Sending request to:', url);
    console.log('[API] Request payload:', JSON.stringify(request, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      
      // Si el backend falla, sugerir usar modo mock
      console.warn('[API] 💡 Tip: Set VITE_USE_MOCK_DATA=true in .env to use mock data while backend is unavailable');
      
      throw new Error(`Chat query failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[API] Success response:', data);
    return data;
  } catch (error) {
    console.error('[API] Exception:', error);
    throw error;
  }
};

/**
 * Health check del servicio
 */
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/diag/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Test de embedding (debug)
 */
export const testEmbedding = async (text: string): Promise<EmbeddingResponse> => {
  const response = await fetch(`${API_BASE_URL}/diag/emb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Embedding test failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Test de retrieval sin LLM (debug)
 */
export const testRetrieval = async (
  query: string,
  top_k: number = 5
): Promise<RetrievalResponse> => {
  const response = await fetch(`${API_BASE_URL}/diag/retrieval`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, top_k }),
  });

  if (!response.ok) {
    throw new Error(`Retrieval test failed: ${response.statusText}`);
  }

  return response.json();
};

// ==================== EJEMPLOS DE USO ====================

/**
 * Ejemplo: Búsqueda simple
 */
export const exampleSimpleQuery = () => {
  return chatQuery({
    query: "What are the effects of microgravity on mice?",
  });
};

/**
 * Ejemplo: Búsqueda con filtros de organismo
 */
export const exampleOrganismFilter = () => {
  return chatQuery({
    query: "How does spaceflight affect immune response?",
    filters: {
      organism: ["Mus musculus"],
    },
    top_k: 8,
  });
};

/**
 * Ejemplo: Búsqueda con múltiples filtros
 */
export const exampleMultipleFilters = () => {
  return chatQuery({
    query: "What are the cardiovascular effects of microgravity?",
    filters: {
      organism: ["Mus musculus", "Homo sapiens"],
      mission_env: ["ISS", "LEO"],
      exposure: ["microgravity"],
      system: ["cardiovascular"],
    },
    top_k: 10,
  });
};

/**
 * Ejemplo: Búsqueda con rango de años
 */
export const exampleYearRange = () => {
  return chatQuery({
    query: "Recent studies on bone loss in space",
    filters: {
      year_range: [2020, 2024],
      system: ["musculoskeletal"],
    },
    top_k: 5,
  });
};

/**
 * Ejemplo: Estudios de radiación
 */
export const exampleRadiation = () => {
  return chatQuery({
    query: "What are the biological effects of space radiation?",
    filters: {
      exposure: ["radiation", "cosmic rays"],
    },
  });
};

/**
 * Ejemplo: Biología de plantas
 */
export const examplePlantBiology = () => {
  return chatQuery({
    query: "How do plants grow in microgravity?",
    filters: {
      organism: ["Arabidopsis thaliana"],
      mission_env: ["ISS"],
    },
  });
};

// ==================== MAPEO DE FILTROS ====================

/**
 * Convierte los filtros del frontend a formato RAG
 */
export const mapFrontendFiltersToRAG = (frontendFilters: any): ChatRequest["filters"] => {
  const ragFilters: ChatRequest["filters"] = {};

  // Mapear especies a organism
  if (frontendFilters.species && frontendFilters.species.length > 0) {
    ragFilters.organism = frontendFilters.species;
  }

  // Mapear misión a mission_env
  if (frontendFilters.mission) {
    ragFilters.mission_env = [frontendFilters.mission];
  }

  // Mapear rango de años
  if (frontendFilters.yearFrom || frontendFilters.yearTo) {
    const yearFrom = frontendFilters.yearFrom || 1960;
    const yearTo = frontendFilters.yearTo || new Date().getFullYear();
    ragFilters.year_range = [yearFrom, yearTo];
  }

  // Mapear outcomes a exposure/system según contexto
  if (frontendFilters.outcome && frontendFilters.outcome.length > 0) {
    // Por ahora, los outcomes los mapeamos a exposure
    ragFilters.exposure = frontendFilters.outcome;
  }

  return ragFilters;
};

/**
 * Realiza una búsqueda adaptando filtros del frontend
 */
export const searchWithFrontendFilters = async (
  query: string,
  frontendFilters: any,
  top_k: number = 12
): Promise<ChatResponse> => {
  const ragFilters = mapFrontendFiltersToRAG(frontendFilters);

  return chatQuery({
    query,
    filters: ragFilters,
    top_k,
  });
};
