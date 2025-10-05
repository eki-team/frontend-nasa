# 📚 NASA RAG Service - Documentación de Endpoints

**Versión:** 1.0.0  
**Base URL Desarrollo:** `http://localhost:8000`  
**Base URL Producción:** `https://nasa-rag-service.onrender.com`  
**Frontend Producción:** `https://frontend-nasa-mu9o.vercel.app`  
**Total de Endpoints:** 13

---

## 🔧 Configuración del Proyecto

### Variables de Entorno

**Desarrollo Local (.env.local):**
```bash
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
VITE_USE_MOCK_DATA=false
```

**Producción (.env.production):**
```bash
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
```

### Proxy Configuration (Vercel)

En producción, Vercel actúa como proxy para evitar CORS:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://nasa-rag-service.onrender.com/api/:path*"
    },
    {
      "source": "/diag/:path*",
      "destination": "https://nasa-rag-service.onrender.com/diag/:path*"
    }
  ]
}
```

**Esto significa:**
- Desarrollo: `http://localhost:8000/api/chat`
- Producción Frontend: `/api/chat` (proxeado por Vercel)
- Producción Directa: `https://nasa-rag-service.onrender.com/api/chat`

---

## 📖 Tabla de Contenidos

- [Configuración del Proyecto](#-configuración-del-proyecto)
- [Integración Frontend](#-integración-frontend)
- [Endpoints Principales](#endpoints-principales)
  - [Root](#1-root)
  - [Health Check](#2-health-check)
- [Chat API](#chat-api)
  - [POST /api/chat](#post-apichat)
- [Frontend API](#frontend-api)
  - [GET /api/front/documents](#get-apifrontdocuments)
  - [POST /api/front/documents/search](#post-apifrontdocumentssearch)
  - [GET /api/front/documents/{pk}](#get-apifrontdocumentspk)
  - [GET /api/front/filters](#get-apifrontfilters)
  - [GET /api/front/stats](#get-apifrontstats)
- [Diagnostic API](#diagnostic-api)
  - [GET /diag/health](#get-diaghealth)
  - [POST /diag/emb](#post-diagemb)
  - [POST /diag/retrieval](#post-diagretrieval)
  - [POST /diag/retrieval_audit](#post-diagretrieval_audit)
  - [GET /diag/mongo/health](#get-diagmongohealth)
- [Sistema de Mock Data](#-sistema-de-mock-data)
- [Troubleshooting](#-troubleshooting)

---

## 🎨 Integración Frontend

### Arquitectura de Conexión

```
┌─────────────────┐
│  Usuario/       │
│  Navegador      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  - Desarrollo: localhost:8081           │
│  - Producción: Vercel                   │
│                                          │
│  Componentes principales:               │
│  ✓ Dashboard.tsx (Chat RAG)             │
│  ✓ ChatResult.tsx (Resultados)          │
│  ✓ ExpandableSearch.tsx (Búsqueda)      │
│  ✓ StudyCard.tsx (Tarjetas)             │
└──────────┬──────────────────────────────┘
           │
           │ API Calls (fetch)
           │
           ▼
┌─────────────────────────────────────────┐
│  API Layer (src/lib/)                   │
│  ✓ api-rag.ts (Chat RAG)                │
│  ✓ api.ts (REST endpoints)              │
│  ✓ mock-data.ts (Testing)               │
└──────────┬──────────────────────────────┘
           │
           │ VITE_API_BASE_URL
           │
           ▼
┌─────────────────────────────────────────┐
│  Backend RAG Service                    │
│  https://nasa-rag-service.onrender.com  │
│                                          │
│  ✓ MongoDB Atlas                        │
│  ✓ OpenAI Embeddings                    │
│  ✓ RAG Pipeline                         │
└─────────────────────────────────────────┘
```

### Cliente API (src/lib/api-rag.ts)

```typescript
// Configuración automática según entorno
const API_BASE_URL = import.meta.env.PROD 
  ? "" // Producción: usa proxy de Vercel
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");

// Función principal de Chat RAG
export const chatQuery = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
};
```

### Uso en Componentes

```typescript
// Dashboard.tsx - Hook personalizado
const { sendQuery, currentResponse, isLoading } = useChatRag();

// Enviar query al RAG
const handleSearch = (query: string) => {
  sendQuery(query);
};

// El componente ChatResult hace scroll automático
<AnimatePresence mode="wait">
  {currentResponse && <ChatResult response={currentResponse} />}
</AnimatePresence>
```

### Mapeo de Datos

El frontend convierte las citaciones del RAG en tarjetas de estudios:

```typescript
// api.ts - Conversión de Citations a Studies
const studies = ragResponse.citations.map((citation) => ({
  id: citation.source_id,
  title: citation.title,
  year: citation.year,
  abstract: citation.snippet,
  mission: citation.osdr_id,
  doi: citation.doi,
  // ... más campos
}));
```

---

## Endpoints Principales

### 1. Root

**Endpoint:** `GET /`

**Descripción:** Endpoint raíz del servicio.

**Request:**
```bash
GET http://localhost:8000/
```

**Response:**
```json
{
  "service": "nasa-rag",
  "version": "1.0.0",
  "status": "running",
  "mode": "nasa-biology",
  "docs": "/docs"
}
```

---

### 2. Health Check

**Endpoint:** `GET /health`

**Descripción:** Verificación simple del estado del servicio.

**Request:**
```bash
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "nasa-rag"
}
```

---

## Chat API

### POST /api/chat

**Endpoint:** `POST /api/chat`

**Descripción:** Endpoint principal de RAG para realizar búsqueda semántica en papers de biología espacial y generar respuestas con citas.

**Headers:**
```
Content-Type: application/json
```

**Request Body Mínimo:**
```json
{
  "query": "What are the effects of microgravity on mice?"
}
```

**Request Body Completo (con filtros):**
```json
{
  "query": "How does spaceflight affect immune response?",
  "filters": {
    "organism": ["Mus musculus"],
    "mission_env": ["ISS"],
    "exposure": ["microgravity"],
    "system": ["immune"],
    "year_range": [2020, 2024],
    "tissue": ["blood"],
    "assay": ["RNA-seq"],
    "tags": ["biomedical", "mice", "space"]
  },
  "top_k": 8,
  "session_id": "user-123-session-456"
}
```

**Parámetros:**

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `query` | string | ✅ Sí | - | Pregunta en lenguaje natural (mín. 3 caracteres) |
| `filters` | object | ❌ No | null | Filtros facetados para retrieval |
| `top_k` | integer | ❌ No | 8 | Número de chunks a recuperar (1-20) |
| `session_id` | string | ❌ No | null | ID para tracking de sesión |

**Filtros Disponibles:**

- `organism`: ["Mus musculus", "Homo sapiens", "Arabidopsis", etc.]
- `mission_env`: ["ISS", "LEO", "Shuttle", "Ground", etc.]
- `exposure`: ["microgravity", "radiation", "spaceflight", etc.]
- `system`: ["immune", "cardiovascular", "musculoskeletal", etc.]
- `year_range`: [año_inicio, año_fin]
- `tissue`: ["muscle", "bone", "blood", etc.]
- `assay`: ["RNA-seq", "proteomics", "microscopy", etc.]
- `tags`: ["biomedical", "bone", "mice", "space", etc.]

**Response:**
```json
{
  "answer": "Studies show that microgravity exposure leads to immune dysregulation in mice [1][2]. RNA-seq analysis revealed significant upregulation of inflammatory markers in peripheral blood cells after spaceflight [1]. The immune response was altered in multiple tissue types, including spleen and thymus [2].",
  "citations": [
    {
      "document_id": "507f1f77bcf86cd799439011",
      "source_id": "GLDS-123_chunk_5",
      "doi": "10.1038/s41526-023-00123-4",
      "osdr_id": "GLDS-123",
      "section": "Results",
      "snippet": "RNA-seq analysis revealed significant upregulation of inflammatory markers in peripheral blood cells...",
      "text": "Full text of the chunk...",
      "url": "https://osdr.nasa.gov/bio/repo/data/studies/GLDS-123",
      "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "year": 2023,
      "venue": "Nature Microgravity",
      "source_type": "article",
      "organism": "Mus musculus",
      "system": "immune",
      "mission_env": "ISS",
      "exposure": "microgravity",
      "assay": "RNA-seq",
      "tissue": "blood",
      "chunk_index": 5,
      "total_chunks": 55,
      "created_at": "2024-01-15T10:30:00Z",
      "similarity_score": 0.87,
      "section_boost": 0.10,
      "final_score": 0.97,
      "relevance_reason": "High similarity (0.87) + Results section boost (+0.10)",
      "metadata": {
        "article_metadata": {
          "title": "Microgravity effects on immune response",
          "authors": ["John Doe", "Jane Smith"],
          "pmc_id": "PMC1234567"
        }
      }
    },
    {
      "document_id": "507f1f77bcf86cd799439012",
      "source_id": "GLDS-456_chunk_12",
      "doi": "10.1038/s41467-023-00456-7",
      "osdr_id": "GLDS-456",
      "section": "Discussion",
      "snippet": "The immune response was altered in multiple tissue types, including spleen and thymus...",
      "url": "https://osdr.nasa.gov/bio/repo/data/studies/GLDS-456",
      "year": 2023,
      "organism": "Mus musculus",
      "similarity_score": 0.82,
      "section_boost": 0.05,
      "final_score": 0.87,
      "relevance_reason": "High similarity (0.82) + Discussion section boost (+0.05)"
    }
  ],
  "used_filters": {
    "organism": ["Mus musculus"],
    "mission_env": ["ISS"]
  },
  "metrics": {
    "latency_ms": 1234.5,
    "retrieved_k": 8,
    "grounded_ratio": 0.92,
    "dedup_count": 2,
    "section_distribution": {
      "Results": 4,
      "Discussion": 3,
      "Introduction": 1
    }
  },
  "session_id": "user-123-session-456"
}
```

**Códigos de Estado:**
- `200 OK`: Respuesta generada exitosamente
- `422 Unprocessable Entity`: Error de validación en el request
- `500 Internal Server Error`: Error interno del servidor

**Campos de las Citaciones (Citations):**

Las citaciones ahora incluyen información extendida y métricas de relevancia:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `document_id` | string | ID del documento en MongoDB |
| `source_id` | string | ✅ Identificador único del chunk |
| `doi` | string | Digital Object Identifier del paper |
| `osdr_id` | string | ID en Open Science Data Repository de NASA |
| `section` | string | Sección del paper (Results, Discussion, etc.) |
| `snippet` | string | ✅ Fragmento relevante del texto |
| `text` | string | Texto completo del chunk |
| `url` | string | URL del estudio/documento |
| `source_url` | string | URL original de la fuente |
| `year` | integer | Año de publicación |
| `venue` | string | Revista o conferencia donde se publicó |
| `source_type` | string | Tipo de fuente (article, etc.) |
| `organism` | string | Organismo estudiado |
| `system` | string | Sistema biológico |
| `mission_env` | string | Entorno de la misión |
| `exposure` | string | Tipo de exposición |
| `assay` | string | Tipo de ensayo realizado |
| `tissue` | string | Tejido analizado |
| `chunk_index` | integer | Índice del chunk en el documento |
| `total_chunks` | integer | Total de chunks del documento |
| `created_at` | string | Fecha de creación del registro |
| `similarity_score` | float | **Score de similitud vectorial (0-1)** |
| `section_boost` | float | **Boost aplicado por sección prioritaria** |
| `final_score` | float | **Score final = similarity + boost** |
| `relevance_reason` | string | **Explicación de por qué fue seleccionado** |
| `metadata` | object | Objeto completo de metadata del documento |

> **Nota:** Los campos marcados con ✅ son obligatorios, el resto son opcionales dependiendo de la metadata disponible.

**Métricas de Retrieval:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `latency_ms` | float | Tiempo total de procesamiento en milisegundos |
| `retrieved_k` | integer | Número de chunks recuperados |
| `grounded_ratio` | float | Porcentaje de claims en la respuesta que tienen cita (0-1) |
| `dedup_count` | integer | Número de chunks duplicados que fueron removidos |
| `section_distribution` | object | Distribución de chunks por sección del paper |

---

## Frontend API

### GET /api/front/documents

**Endpoint:** `GET /api/front/documents`

**Descripción:** Listar todos los documentos únicos (papers) sin duplicados con paginación.

**Query Parameters:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Número de documentos a saltar |
| `limit` | integer | 20 | Número de documentos por página (1-100) |

**Request:**
```bash
GET http://localhost:8000/api/front/documents?skip=0&limit=20
```

**Response:**
```json
{
  "total": 150,
  "documents": [
    {
      "pk": "mice-in-bion-m-1-space-mission",
      "title": "Mice in Bion-M 1 Space Mission: Training and Selection",
      "source_type": "article",
      "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "category": "space",
      "tags": ["mice", "space", "mission", "microgravity"],
      "total_chunks": 55,
      "article_metadata": {
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
        "title": "Mice in Bion-M 1 Space Mission: Training and Selection",
        "authors": ["John Doe", "Jane Smith"],
        "scraped_at": "2024-01-15T10:30:00",
        "pmc_id": "PMC1234567",
        "doi": "10.1371/journal.pone.1234567",
        "statistics": {
          "word_count": 5420,
          "sections": 8
        }
      }
    },
    {
      "pk": "effects-of-spaceflight-on-bone",
      "title": "Effects of Spaceflight on Bone Density",
      "source_type": "article",
      "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7654321/",
      "category": "space",
      "tags": ["bone", "spaceflight", "osteoporosis"],
      "total_chunks": 42,
      "article_metadata": {
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7654321/",
        "title": "Effects of Spaceflight on Bone Density",
        "authors": ["Alice Johnson", "Bob Williams"],
        "scraped_at": "2024-02-20T14:20:00",
        "pmc_id": "PMC7654321",
        "doi": "10.1038/s41526-024-00321-1",
        "statistics": {
          "word_count": 4850,
          "sections": 6
        }
      }
    }
  ]
}
```

---

### POST /api/front/documents/search

**Endpoint:** `POST /api/front/documents/search`

**Descripción:** Buscar documentos aplicando filtros facetados y/o búsqueda de texto (no usa búsqueda vectorial).

**Query Parameters:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Número de documentos a saltar |
| `limit` | integer | 20 | Número de documentos por página (1-100) |

**Request Body:**
```json
{
  "category": "space",
  "tags": ["mice", "mission"],
  "search_text": "microgravity",
  "pmc_id": "PMC1234567",
  "source_type": "article"
}
```

**Filtros Disponibles:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `category` | string | Categoría del documento (space, biology, etc) |
| `tags` | array[string] | Lista de tags para filtrar |
| `search_text` | string | Búsqueda de texto en título/contenido/tags |
| `pmc_id` | string | ID de PubMed Central |
| `source_type` | string | Tipo de fuente (article, etc) |

**Request:**
```bash
POST http://localhost:8000/api/front/documents/search?skip=0&limit=20
Content-Type: application/json

{
  "category": "space",
  "tags": ["mice"],
  "search_text": "microgravity"
}
```

**Response:**
```json
{
  "total": 12,
  "documents": [
    {
      "pk": "mice-in-bion-m-1-space-mission",
      "title": "Mice in Bion-M 1 Space Mission",
      "source_type": "article",
      "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "category": "space",
      "tags": ["mice", "space", "mission", "microgravity"],
      "total_chunks": 55,
      "article_metadata": {
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
        "title": "Mice in Bion-M 1 Space Mission",
        "authors": ["John Doe", "Jane Smith"],
        "scraped_at": "2024-01-15T10:30:00",
        "pmc_id": "PMC1234567",
        "doi": "10.1371/journal.pone.1234567",
        "statistics": {
          "word_count": 5420,
          "sections": 8
        }
      }
    }
  ]
}
```

---

### GET /api/front/documents/{pk}

**Endpoint:** `GET /api/front/documents/{pk}`

**Descripción:** Obtener detalle completo de un documento específico con todos sus chunks y metadata.

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `pk` | string | ID único del documento |

**Request:**
```bash
GET http://localhost:8000/api/front/documents/mice-in-bion-m-1-space-mission
```

**Response:**
```json
{
  "metadata": {
    "pk": "mice-in-bion-m-1-space-mission",
    "title": "Mice in Bion-M 1 Space Mission",
    "source_type": "article",
    "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
    "category": "space",
    "tags": ["mice", "space", "mission"],
    "total_chunks": 55,
    "article_metadata": {
      "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "title": "Mice in Bion-M 1 Space Mission",
      "authors": ["John Doe", "Jane Smith"],
      "scraped_at": "2024-01-15T10:30:00",
      "pmc_id": "PMC1234567",
      "doi": "10.1371/journal.pone.1234567",
      "statistics": {
        "word_count": 5420,
        "sections": 8
      }
    }
  },
  "chunks": [
    {
      "pk": "mice-in-bion-m-1-space-mission",
      "text": "Title: Mice in Bion-M 1 Space Mission: Training and Selection\n\nAbstract: This study presents the methodology for training and selecting mice for the Bion-M 1 space mission...",
      "source_type": "article",
      "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "category": "space",
      "tags": ["mice", "space", "mission"],
      "chunk_index": 0,
      "total_chunks": 55,
      "char_count": 1024,
      "word_count": 180,
      "sentences_count": 8,
      "article_metadata": {
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
        "title": "Mice in Bion-M 1 Space Mission",
        "authors": ["John Doe", "Jane Smith"],
        "scraped_at": "2024-01-15T10:30:00",
        "pmc_id": "PMC1234567",
        "doi": "10.1371/journal.pone.1234567",
        "statistics": {
          "word_count": 5420,
          "sections": 8
        }
      }
    },
    {
      "pk": "mice-in-bion-m-1-space-mission",
      "text": "Introduction: Space missions require careful preparation and selection of biological specimens. In this study, we developed a comprehensive training protocol...",
      "source_type": "article",
      "source_url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "category": "space",
      "tags": ["mice", "space", "mission"],
      "chunk_index": 1,
      "total_chunks": 55,
      "char_count": 980,
      "word_count": 165,
      "sentences_count": 7,
      "article_metadata": {
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
        "title": "Mice in Bion-M 1 Space Mission",
        "authors": ["John Doe", "Jane Smith"],
        "scraped_at": "2024-01-15T10:30:00",
        "pmc_id": "PMC1234567",
        "doi": "10.1371/journal.pone.1234567",
        "statistics": {
          "word_count": 5420,
          "sections": 8
        }
      }
    }
  ],
  "total_chunks": 55
}
```

**Códigos de Estado:**
- `200 OK`: Documento encontrado
- `404 Not Found`: Documento no existe
- `500 Internal Server Error`: Error interno

---

### GET /api/front/filters

**Endpoint:** `GET /api/front/filters`

**Descripción:** Obtener todos los valores únicos disponibles para cada filtro. Útil para poblar dropdowns y selectores en el frontend.

**Request:**
```bash
GET http://localhost:8000/api/front/filters
```

**Response:**
```json
{
  "categories": ["space", "biology", "physics"],
  "tags": [
    "mice",
    "mission",
    "microgravity",
    "spaceflight",
    "immune",
    "bone",
    "muscle",
    "ISS",
    "radiation",
    "RNA-seq"
  ],
  "source_types": ["article"],
  "total_documents": 150,
  "total_chunks": 3500
}
```

---

### GET /api/front/stats

**Endpoint:** `GET /api/front/stats`

**Descripción:** Obtener estadísticas generales de la base de datos.

**Request:**
```bash
GET http://localhost:8000/api/front/stats
```

**Response:**
```json
{
  "total_documents": 150,
  "total_chunks": 3500,
  "categories_count": 3,
  "tags_count": 250,
  "source_types": ["article"],
  "categories": ["space", "biology", "physics"]
}
```

---

## Diagnostic API

### GET /diag/health

**Endpoint:** `GET /diag/health`

**Descripción:** Health check completo del servicio con información de configuración.

**Request:**
```bash
GET http://localhost:8000/diag/health
```

**Response (OK):**
```json
{
  "status": "ok",
  "service": "nasa-rag",
  "vector_backend": "mongodb",
  "models": {
    "chat": "gpt-4",
    "embed": "text-embedding-3-small (OpenAI, 1536D)"
  },
  "nasa_mode": true,
  "guided_enabled": true
}
```

**Response (Degraded/Error):**
```json
{
  "status": "degraded",
  "service": "nasa-rag",
  "vector_backend": "mongodb",
  "models": {},
  "nasa_mode": true,
  "guided_enabled": false
}
```

---

### POST /diag/emb

**Endpoint:** `POST /diag/emb`

**Descripción:** Generar embedding de un texto usando OpenAI (endpoint de debug).

**Request Body:**
```json
{
  "text": "What are the effects of microgravity on bone density?"
}
```

**Request:**
```bash
POST http://localhost:8000/diag/emb
Content-Type: application/json

{
  "text": "What are the effects of microgravity on bone density?"
}
```

**Response:**
```json
{
  "text": "What are the effects of microgravity on bone density?",
  "embedding": [
    0.0234,
    -0.0156,
    0.0421,
    -0.0089,
    0.0167,
    "... (1536 valores en total)"
  ],
  "model": "text-embedding-3-small",
  "dimensions": 1536
}
```

---

### POST /diag/retrieval

**Endpoint:** `POST /diag/retrieval`

**Descripción:** Test de retrieval sin síntesis LLM. Permite probar la búsqueda semántica y ver qué chunks se recuperan.

**Request Body:**
```json
{
  "query": "How does spaceflight affect immune response?",
  "top_k": 8,
  "filters": {
    "organism": ["Mus musculus"],
    "mission_env": ["ISS"]
  }
}
```

**Request:**
```bash
POST http://localhost:8000/diag/retrieval
Content-Type: application/json

{
  "query": "How does spaceflight affect immune response?",
  "top_k": 5
}
```

**Response:**
```json
{
  "query": "How does spaceflight affect immune response?",
  "chunks": [
    {
      "source_id": "GLDS-123_chunk_5",
      "title": "Microgravity effects on immune response",
      "section": "Results",
      "doi": "10.1038/s41526-023-00123-4",
      "osdr_id": "GLDS-123",
      "similarity": 0.87,
      "text": "RNA-seq analysis revealed significant upregulation of inflammatory markers in peripheral blood cells after spaceflight. We observed changes in cytokine expression patterns that suggest immune dysregulation...",
      "metadata": {
        "organism": "Mus musculus",
        "mission_env": "ISS",
        "year": 2023,
        "exposure": "microgravity"
      }
    },
    {
      "source_id": "GLDS-456_chunk_12",
      "title": "Spaceflight impacts on murine immune system",
      "section": "Discussion",
      "doi": "10.1038/s41467-023-00456-7",
      "osdr_id": "GLDS-456",
      "similarity": 0.84,
      "text": "The immune response was altered in multiple tissue types, including spleen and thymus. T-cell populations showed significant changes in composition and function...",
      "metadata": {
        "organism": "Mus musculus",
        "mission_env": "ISS",
        "year": 2023,
        "exposure": "spaceflight"
      }
    }
  ],
  "latency_ms": 245.67,
  "total_found": 5
}
```

---

### POST /diag/retrieval_audit

**Endpoint:** `POST /diag/retrieval_audit`

**Descripción:** Audit de retrieval usando queries doradas. Lee `CONTEXT/golden_queries.json` y evalúa recall@k y precision@k.

**Request:**
```bash
POST http://localhost:8000/diag/retrieval_audit
```

**Response:**
```json
{
  "queries": [
    {
      "query_id": "query-001",
      "recall_at_k": 0.875,
      "precision_at_k": 0.750,
      "retrieved": [
        "GLDS-123_chunk_5",
        "GLDS-456_chunk_12",
        "GLDS-789_chunk_8",
        "GLDS-234_chunk_3",
        "GLDS-567_chunk_15",
        "GLDS-890_chunk_22",
        "GLDS-345_chunk_9",
        "GLDS-678_chunk_17"
      ],
      "expected": [
        "GLDS-123_chunk_5",
        "GLDS-456_chunk_12",
        "GLDS-789_chunk_8",
        "GLDS-234_chunk_3",
        "GLDS-567_chunk_15",
        "GLDS-999_chunk_1",
        "GLDS-888_chunk_4",
        "GLDS-777_chunk_11"
      ],
      "missing": [
        "GLDS-999_chunk_1",
        "GLDS-888_chunk_4",
        "GLDS-777_chunk_11"
      ]
    },
    {
      "query_id": "query-002",
      "recall_at_k": 1.0,
      "precision_at_k": 1.0,
      "retrieved": [
        "GLDS-111_chunk_1",
        "GLDS-222_chunk_2",
        "GLDS-333_chunk_3"
      ],
      "expected": [
        "GLDS-111_chunk_1",
        "GLDS-222_chunk_2",
        "GLDS-333_chunk_3"
      ],
      "missing": []
    }
  ],
  "avg_recall": 0.938,
  "avg_precision": 0.875
}
```

---

### GET /diag/mongo/health

**Endpoint:** `GET /diag/mongo/health`

**Descripción:** Health check detallado de MongoDB. Verifica la conexión, acceso a la base de datos, estado del cluster, colecciones, índices y existencia del índice vectorial.

**Request:**
```bash
GET http://localhost:8000/diag/mongo/health
```

**Response (OK):**
```json
{
  "status": "connected",
  "connection_type": "mongodb",
  "database": "nasakb",
  "collection": "chunks",
  "server_info": {
    "version": "7.0.0",
    "connected_to": "nasakb-shard-00-00.mongodb.net:27017",
    "mongodb_uri": "mongodb+srv://admin:***@cluster.mongodb.net"
  },
  "stats": {
    "collections": 5,
    "collections_list": ["chunks", "metadata", "users", "sessions", "logs"],
    "documents_in_collection": 3500,
    "indexes": 3,
    "index_names": ["_id_", "text_index", "vector_index"],
    "vector_index_exists": true,
    "vector_index_name": "vector_index",
    "database_size_bytes": 52428800,
    "database_size_mb": 50.0
  },
  "latency_ms": 45.2,
  "healthy": true
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "Connection timeout",
  "error_type": "ConnectionError",
  "connection_type": "mongodb",
  "database": "nasakb",
  "collection": "chunks",
  "healthy": false
}
```

**Campos de la respuesta:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Estado de la conexión: "connected" o "error" |
| `connection_type` | string | Tipo de backend: "mongodb" |
| `database` | string | Nombre de la base de datos |
| `collection` | string | Nombre de la colección principal |
| `server_info` | object | Información del servidor MongoDB |
| `server_info.version` | string | Versión de MongoDB |
| `server_info.connected_to` | string | Host al que está conectado |
| `server_info.mongodb_uri` | string | URI de conexión (con password oculto) |
| `stats` | object | Estadísticas de la base de datos |
| `stats.collections` | integer | Número total de colecciones |
| `stats.collections_list` | array | Lista de colecciones (máx. 10) |
| `stats.documents_in_collection` | integer | Número de documentos en la colección principal |
| `stats.indexes` | integer | Número de índices en la colección |
| `stats.index_names` | array | Nombres de todos los índices |
| `stats.vector_index_exists` | boolean | Si existe el índice vectorial |
| `stats.vector_index_name` | string | Nombre configurado para el índice vectorial |
| `stats.database_size_bytes` | integer | Tamaño de la BD en bytes |
| `stats.database_size_mb` | float | Tamaño de la BD en MB |
| `latency_ms` | float | Latencia de la verificación en milisegundos |
| `healthy` | boolean | Estado general de salud (conexión OK y documentos > 0) |

**Códigos de Estado:**
- `200 OK`: Health check completado (puede estar healthy=true o false)

---

## 📝 Notas Adicionales

### Autenticación
Actualmente el servicio no requiere autenticación.

### Rate Limiting
No hay límite de rate implementado actualmente.

### CORS
CORS está habilitado para permitir peticiones desde cualquier origen.

### Documentación Interactiva
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Ejemplos con cURL

**Chat básico:**
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the effects of microgravity on mice?"
  }'
```

**Buscar documentos:**
```bash
curl -X POST "http://localhost:8000/api/front/documents/search?skip=0&limit=10" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "space",
    "search_text": "microgravity"
  }'
```

**Health check:**
```bash
curl -X GET "http://localhost:8000/diag/health"
```

**MongoDB health check detallado:**
```bash
curl -X GET "http://localhost:8000/diag/mongo/health"
```

---

## 🎭 Sistema de Mock Data

El proyecto incluye un sistema completo de datos mock para desarrollo y testing sin necesidad del backend.

### Activación

```bash
# .env.local
VITE_USE_MOCK_DATA=true
```

### Características

- ✅ **10 estudios científicos** completos con metadata realista
- ✅ **5 categorías de respuestas RAG** (microgravity, radiation, bone, immune, general)
- ✅ **Filtros funcionales**: query, mission, species, outcome, year range
- ✅ **Paginación completa**
- ✅ **KPIs, Insights y Knowledge Graph** mock
- ✅ **Latencia simulada** (150-600ms según endpoint)
- ✅ **Logging detallado** para debugging

### Documentación

Ver archivos:
- `MOCK_DATA_SYSTEM.md` - Documentación completa
- `QUICK_START_MOCK.md` - Guía rápida
- `src/lib/mock-data.ts` - Implementación

---

## 🐛 Troubleshooting

### Error: CORS blocked

**Problema:** `Access to fetch at '...' has been blocked by CORS policy`

**Soluciones:**

1. **Desarrollo Local:**
   ```bash
   # .env.local
   VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
   ```

2. **Producción:**
   - Vercel actúa como proxy (ya configurado en `vercel.json`)
   - No se necesita configuración adicional

### Error: Connection refused

**Problema:** `POST http://localhost:8000/api/chat net::ERR_CONNECTION_REFUSED`

**Solución:**
```bash
# Cambiar a backend de Render en .env.local
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com

# O activar mocks
VITE_USE_MOCK_DATA=true
```

### Error: MongoDB connection failed

**Problema:** Backend retorna error 500 con mensaje de MongoDB

**Solución:** Ver `MONGODB_CONNECTION_FIX.md`

1. Configurar `MONGODB_URI` en Render dashboard
2. Verificar Network Access en MongoDB Atlas
3. Redeploy del backend

### Papers muestran "Unknown"

**Problema:** Las tarjetas de estudios muestran campos como "Unknown"

**Solución:**
- Verificado en commit `6860d0c`
- Los campos opcionales ahora son `undefined` cuando no existen
- El componente `StudyCard.tsx` maneja correctamente valores opcionales

### Favicon no se actualiza

**Problema:** Sigue apareciendo el favicon antiguo

**Solución:**
```bash
# Hard refresh en el navegador
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # Mac
```

---

## 🔄 Cambios Recientes

**Última actualización:** 4 de octubre de 2025

### Commit History (últimos cambios):

1. **feat: agregado scroll automático al resultado del chat RAG** (`92bd948`)
   - Scroll automático cuando aparece respuesta
   - Mejora de UX en móviles

2. **fix: actualizado favicon, titulo y mapeo de datos RAG** (`6860d0c`)
   - Favicon: logo_nasa.png
   - Título: "NISCS - NASA Intelligent Science Catalog Search"
   - Removido "Unknown" hardcoded

3. **feat: implementado sistema completo de mock data** (`6993431`)
   - 10 estudios mock + KPIs + Insights + Graph
   - Sistema de filtrado completo
   - Documentación en MOCK_DATA_SYSTEM.md

4. **fix: removido theme toggle, forzado dark mode** (sesión anterior)
   - Solo dark mode (tema espacial)
   - Hero redesign: NISCS en bold
   - Logo oficial en navbar

---

## 📚 Referencias Adicionales

- **Backend RAG:** https://nasa-rag-service.onrender.com
- **Frontend:** https://frontend-nasa-mu9o.vercel.app
- **GitHub:** eki-team/frontend-nasa
- **Colección Postman:** `NASA_RAG.postman_collection.json`

### Documentos Relacionados

- `MOCK_DATA_SYSTEM.md` - Sistema completo de mock data
- `QUICK_START_MOCK.md` - Guía rápida de mocks
- `MONGODB_CONNECTION_FIX.md` - Solución de problemas MongoDB
- `CORS_SOLUTION.md` - Configuración de CORS con Vercel
- `RESUMEN_INTEGRACION_RAG.md` - Resumen de integración RAG

---

**Fin del documento**
