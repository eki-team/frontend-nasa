# Integración con Backend RAG - NASA Bioscience Publications Explorer

## 📋 Resumen de Cambios

Se ha integrado completamente el frontend con el backend RAG (Retrieval-Augmented Generation) de NASA. El backend proporciona búsqueda semántica avanzada sobre publicaciones científicas de biociencias espaciales.

## 🔧 Archivos Modificados

### Nuevos Archivos

#### `src/lib/api-rag.ts`
Cliente API específico para el backend RAG con:
- **Tipos TypeScript**: `ChatRequest`, `ChatResponse`, `Source`, `HealthResponse`, etc.
- **Funciones principales**:
  - `chatQuery()` - Consulta principal al sistema RAG
  - `healthCheck()` - Health check del servicio
  - `testEmbedding()` - Test de embeddings (debug)
  - `testRetrieval()` - Test de retrieval sin LLM (debug)
- **Utilidades**:
  - `mapFrontendFiltersToRAG()` - Mapea filtros del frontend al formato RAG
  - `searchWithFrontendFilters()` - Búsqueda adaptada con filtros del frontend
- **Ejemplos de uso**: 6 ejemplos documentados para diferentes casos de uso

### Archivos Actualizados

#### `.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```
Cambio del puerto 3000 → 8000 para coincidir con el backend RAG.

#### `src/lib/api.ts`
- Importa el nuevo cliente RAG
- Función `searchStudies()` completamente reescrita para usar el endpoint RAG `/api/chat`
- Función `convertRagResponseToSearchResponse()` para adaptar respuestas RAG al formato frontend
- Manejo de búsquedas vacías

#### `src/lib/types.ts`
- **SearchFilters**: Agregado campo `query` (además de `q` para compatibilidad)
- **Study**: 
  - `year` ahora puede ser `number | null`
  - `species` ahora puede ser `string | string[]`
  - `doi` ahora puede ser `string | null`
  - Agregados: `abstract`, `citations`, `relevanceScore`
- **SearchResponse**:
  - `items` renombrado a `studies`
  - Agregados: `totalPages`, `hasMore`

#### `src/hooks/useFilters.ts`
- Soporte para `query` y `q` simultáneamente
- Sincronización bidireccional URL ↔ Estado con ambos formatos

#### `src/pages/Dashboard.tsx`
- Actualizado de `searchData.items` → `searchData.studies`
- Actualizado de `filters.q` → `filters.query || filters.q`

#### `src/components/ExpandableSearch.tsx`
- `handleSearch()` actualizado para soportar ambos formatos (`query` y `q`)
- Input y validaciones actualizados

## 🔌 Estructura del Backend RAG

### Endpoints Disponibles

#### 1. POST `/api/chat` (Principal)
**Request:**
```json
{
  "query": "What are the effects of microgravity on mice?",
  "filters": {
    "organism": ["Mus musculus"],
    "mission_env": ["ISS", "LEO"],
    "exposure": ["microgravity"],
    "system": ["cardiovascular"],
    "year_range": [2020, 2024]
  },
  "top_k": 10
}
```

**Response:**
```json
{
  "answer": "Respuesta generada por LLM...",
  "sources": [
    {
      "title": "Título del paper",
      "authors": ["Autor 1", "Autor 2"],
      "year": 2023,
      "doi": "10.1234/example",
      "chunk_text": "Texto relevante del documento...",
      "score": 0.95,
      "metadata": {...}
    }
  ],
  "query": "query original",
  "filters_applied": {...}
}
```

#### 2. GET `/diag/health`
Health check del servicio.

#### 3. POST `/diag/emb`
Test de embeddings (solo debug).

#### 4. POST `/diag/retrieval`
Test de retrieval sin LLM (solo debug).

## 🗺️ Mapeo de Filtros

| Frontend | Backend RAG | Descripción |
|----------|-------------|-------------|
| `species` | `organism` | Lista de organismos (e.g., "Mus musculus") |
| `mission` | `mission_env` | Misión o entorno (e.g., "ISS", "LEO") |
| `outcome` | `exposure` | Tipo de exposición (e.g., "microgravity", "radiation") |
| - | `system` | Sistema biológico (e.g., "cardiovascular") |
| `yearFrom/yearTo` | `year_range` | Rango de años como `[min, max]` |

## 📝 Ejemplos de Uso

### 1. Búsqueda Simple
```typescript
import { chatQuery } from "@/lib/api-rag";

const response = await chatQuery({
  query: "What are the effects of microgravity on mice?"
});
```

### 2. Búsqueda con Filtro de Organismo
```typescript
const response = await chatQuery({
  query: "How does spaceflight affect immune response?",
  filters: {
    organism: ["Mus musculus"]
  },
  top_k: 8
});
```

### 3. Búsqueda con Múltiples Filtros
```typescript
const response = await chatQuery({
  query: "What are the cardiovascular effects of microgravity?",
  filters: {
    organism: ["Mus musculus", "Homo sapiens"],
    mission_env: ["ISS", "LEO"],
    exposure: ["microgravity"],
    system: ["cardiovascular"]
  },
  top_k: 10
});
```

### 4. Búsqueda con Rango de Años
```typescript
const response = await chatQuery({
  query: "Recent studies on bone loss in space",
  filters: {
    year_range: [2020, 2024],
    system: ["musculoskeletal"]
  },
  top_k: 5
});
```

### 5. Búsqueda desde Filtros del Frontend
```typescript
import { searchWithFrontendFilters } from "@/lib/api-rag";

const frontendFilters = {
  species: ["Mus musculus"],
  mission: "ISS",
  yearFrom: 2020,
  yearTo: 2024
};

const response = await searchWithFrontendFilters(
  "Effects of space radiation",
  frontendFilters,
  12 // top_k
);
```

## 🧪 Testing

### Health Check
```typescript
import { healthCheck } from "@/lib/api-rag";

const status = await healthCheck();
console.log(status); // { status: "ok", message: "..." }
```

### Test de Embedding (Debug)
```typescript
import { testEmbedding } from "@/lib/api-rag";

const result = await testEmbedding("Test text");
console.log(result.dimension); // e.g., 768
```

### Test de Retrieval (Debug)
```typescript
import { testRetrieval } from "@/lib/api-rag";

const result = await testRetrieval("space biology", 5);
console.log(result.chunks); // Array de chunks relevantes
```

## 🚀 Próximos Pasos

### 1. Iniciar el Backend
Asegúrate de que el backend RAG esté corriendo en el puerto 8000:
```bash
# En el directorio del backend
python main.py  # o el comando correspondiente
```

### 2. Verificar Conexión
```typescript
// En la consola del navegador
import { healthCheck } from "@/lib/api-rag";
healthCheck().then(console.log);
```

### 3. Probar una Búsqueda
Ingresa una consulta en la barra de búsqueda del dashboard.

### 4. Endpoints Pendientes
Los siguientes endpoints NO están disponibles en el backend RAG actual:
- `/studies/:id` - Detalle de estudio individual
- `/graph` - Grafo de conocimiento
- `/insights/overview` - Insights analíticos
- `/kpi` - Métricas KPI

**Opciones:**
- Implementar estos endpoints en el backend
- Usar datos mock en el frontend
- Deshabilitar estas funcionalidades temporalmente

## 📊 Valores de Filtros Disponibles

### Organismos (`organism`)
- "Mus musculus" (ratón)
- "Homo sapiens" (humano)
- "Arabidopsis thaliana" (planta modelo)
- "Caenorhabditis elegans" (gusano)
- Otros organismos según la base de datos

### Misiones (`mission_env`)
- "ISS" (Estación Espacial Internacional)
- "LEO" (Low Earth Orbit)
- "Apollo"
- "Space Shuttle"
- Otras misiones

### Exposiciones (`exposure`)
- "microgravity"
- "radiation"
- "cosmic rays"
- "hypergravity"

### Sistemas Biológicos (`system`)
- "cardiovascular"
- "musculoskeletal"
- "nervous"
- "immune"
- "metabolic"

## 🐛 Debugging

### Ver Requests/Responses
Abre las DevTools (F12) → Network → XHR para ver las llamadas a `/api/chat`.

### Verificar Mapeo de Filtros
```typescript
import { mapFrontendFiltersToRAG } from "@/lib/api-rag";

const frontendFilters = { species: ["Mus musculus"], mission: "ISS" };
const ragFilters = mapFrontendFiltersToRAG(frontendFilters);
console.log(ragFilters);
// { organism: ["Mus musculus"], mission_env: ["ISS"] }
```

### Errores Comunes

#### CORS Error
Si ves errores de CORS, verifica que el backend permita requests desde `http://localhost:8081`.

#### Connection Refused
Verifica que el backend esté corriendo en el puerto 8000:
```bash
curl http://localhost:8000/diag/health
```

#### Empty Results
Verifica que la consulta y filtros sean válidos. Prueba con una consulta simple primero:
```typescript
chatQuery({ query: "space biology" })
```

## 📚 Referencias

- [Postman Collection](./NASA_RAG.postman_collection.json) - Documentación completa de la API
- [API Client](./src/lib/api-rag.ts) - Cliente TypeScript con tipos completos
- [Tipos](./src/lib/types.ts) - Interfaces TypeScript actualizadas

---

**Última actualización:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Estado:** ✅ Integración completada, lista para testing
