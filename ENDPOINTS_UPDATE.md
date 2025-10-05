# Actualización de Endpoints del Frontend

## 📋 Resumen

Se han actualizado los endpoints del frontend para que coincidan con los endpoints reales disponibles en el backend RAG según la documentación de `API_ENDPOINTS.md`.

## ❌ Endpoints Anteriores (INCORRECTOS)

El frontend estaba intentando consumir endpoints que NO existen en el backend RAG:

```typescript
// ❌ NO EXISTE
GET /studies/{id}

// ❌ NO EXISTE  
GET /graph

// ❌ NO EXISTE
GET /insights/overview

// ❌ NO EXISTE
GET /kpi
```

## ✅ Endpoints Actualizados (CORRECTOS)

Ahora el frontend usa los endpoints reales del backend RAG:

### 1. Chat RAG (ya estaba correcto)
```typescript
✅ POST /api/chat
// Búsqueda semántica con RAG
```

### 2. Detalle de Estudio
```typescript
// ANTES: GET /studies/{id} ❌
// AHORA: GET /api/front/documents/{pk} ✅

export const getStudyById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/front/documents/${id}`);
  const data = await response.json();
  
  // Convierte formato RAG a formato frontend
  return {
    id: data.metadata.pk,
    title: data.metadata.title,
    authors: data.metadata.article_metadata?.authors,
    // ... más campos
  };
}
```

### 3. KPI Data (Estadísticas)
```typescript
// ANTES: GET /kpi ❌
// AHORA: GET /api/front/stats ✅

export const getKpiData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/front/stats`);
  const data = await response.json();
  
  // Convierte formato RAG a formato frontend
  return {
    totalStudies: data.total_documents,
    totalMissions: data.categories_count,
    totalSpecies: data.tags_count,
  };
}
```

### 4. Búsqueda de Estudios
```typescript
// MEJORADO: Usa dos estrategias según el caso

// Con query: POST /api/chat (búsqueda semántica RAG)
if (filters.query) {
  const ragResponse = await searchWithFrontendFilters(query, filters);
  return convertRagResponseToSearchResponse(ragResponse);
}

// Sin query: POST /api/front/documents/search (filtrado simple)
else {
  const response = await fetch(
    `${API_BASE_URL}/api/front/documents/search?skip=${skip}&limit=${limit}`,
    {
      method: 'POST',
      body: JSON.stringify(searchBody)
    }
  );
  return response.json();
}
```

## ⚠️ Endpoints Sin Implementar en Backend

Estos endpoints NO existen en el backend RAG, por lo que siempre usan mock data:

### Knowledge Graph
```typescript
// GET /graph - NO IMPLEMENTADO EN BACKEND ❌
// Solución: Siempre usa mock data
export const getKnowledgeGraph = async () => {
  // Siempre retorna mock data (USE_MOCK_DATA || true)
  return getMockGraph();
}
```

### Insights
```typescript
// GET /insights/overview - NO IMPLEMENTADO EN BACKEND ❌  
// Solución: Siempre usa mock data
export const getInsights = async () => {
  // Siempre retorna mock data (USE_MOCK_DATA || true)
  return getMockInsights();
}
```

## 📊 Mapeo de Datos

### Citations → Studies

El endpoint `/api/chat` retorna citaciones que se convierten a estudios:

```typescript
const studies = ragResponse.citations.map((citation) => ({
  id: citation.source_id,
  title: citation.title,
  year: citation.year,
  abstract: citation.snippet,
  mission: citation.osdr_id,
  doi: citation.doi,
}));
```

### Documents → Studies

El endpoint `/api/front/documents/search` retorna documentos:

```typescript
const studies = data.documents.map((doc) => ({
  id: doc.pk,
  title: doc.title || doc.article_metadata?.title,
  authors: doc.article_metadata?.authors,
  year: doc.article_metadata?.year,
  keywords: doc.tags,
  doi: doc.article_metadata?.doi,
}));
```

### Stats → KPI

El endpoint `/api/front/stats` retorna estadísticas:

```typescript
{
  totalStudies: data.total_documents,
  yearsCovered: "2018-2024", // TODO: calcular desde datos
  totalMissions: data.categories_count,
  totalSpecies: data.tags_count,
}
```

## 🔄 Flujo de Búsqueda

```
Usuario ingresa query
        ↓
¿Tiene query text?
        ↓
    Sí → POST /api/chat (RAG semántico)
    No → POST /api/front/documents/search (filtros)
        ↓
Convierte respuesta a formato Studies
        ↓
Muestra resultados en StudiesGrid
```

## 📝 TODOs

1. **Related Studies**: El endpoint `/api/front/documents/{pk}` no incluye estudios relacionados
   - Solución temporal: Array vacío
   - Solución ideal: Implementar en backend o usar búsqueda adicional

2. **Year Range en KPI**: Actualmente hardcoded "2018-2024"
   - Solución ideal: Calcular desde los datos reales
   - Alternativa: Agregar al endpoint `/api/front/stats`

3. **Mapeo de Filtros**: Los filtros del frontend no mapean perfectamente a los del backend
   - Frontend: `species`, `outcome`, `mission`
   - Backend: `tags`, `category`, `search_text`
   - Necesita mapeo inteligente

4. **Graph e Insights**: Implementar estos endpoints en el backend
   - O mantener solo con mock data si no son críticos

## 🧪 Testing

Para probar con backend real:
```bash
# .env.local
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
VITE_USE_MOCK_DATA=false
```

Para probar con mocks:
```bash
# .env.local
VITE_USE_MOCK_DATA=true
```

## ✅ Verificación

- ✅ Chat RAG funciona con `/api/chat`
- ✅ KPI funciona con `/api/front/stats`
- ✅ Detalle de estudio funciona con `/api/front/documents/{pk}`
- ✅ Búsqueda usa estrategia dual (chat RAG + documents search)
- ⚠️ Graph usa mock data (endpoint no disponible)
- ⚠️ Insights usa mock data (endpoint no disponible)

## 📚 Referencias

- `API_ENDPOINTS.md` - Documentación oficial del backend RAG
- `src/lib/api.ts` - Implementación de cliente API
- `src/lib/api-rag.ts` - Cliente específico de RAG chat

---

**Fecha de actualización:** 4 de octubre de 2025  
**Archivos modificados:** `src/lib/api.ts`
