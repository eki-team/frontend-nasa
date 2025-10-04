# 🤖 Integración Chat RAG - NASA Bio Explorer

## 📋 Resumen

Se ha implementado la integración completa del filtro de búsqueda principal con el endpoint `/api/chat` del backend RAG, permitiendo búsquedas semánticas inteligentes con IA.

---

## ✨ Funcionalidades Implementadas

### 1. **Búsqueda RAG Inteligente**
- ✅ Búsqueda semántica en lenguaje natural
- ✅ Respuestas generadas por IA con citas bibliográficas
- ✅ Filtros avanzados aplicados automáticamente
- ✅ Métricas de rendimiento y calidad

### 2. **Componentes Creados**

#### `useChatRag.ts` (Hook personalizado)
```typescript
const { sendQuery, currentResponse, isLoading } = useChatRag();
```
- Maneja las consultas al endpoint `/api/chat`
- Aplica filtros automáticamente (misión, años, outcomes)
- Mantiene historial de búsquedas
- Gestión de estados de carga y errores

#### `ChatResult.tsx` (Componente de resultados)
- Muestra respuesta de IA con formato elegante
- Tarjetas de citas con información completa
- Métricas de rendimiento (latencia, retrieved_k, grounded_ratio)
- Enlaces a fuentes originales
- Diseño glassmorphism espacial

### 3. **Integración con ExpandableSearch**
- Evento `onKeyDown` para detectar Enter
- Validación mínima de 3 caracteres
- Callback `onSearch` configurable
- Hint visual "Press Enter to search"

---

## 🎯 Flujo de Uso

1. **Usuario escribe una consulta** en el buscador principal
   - Ejemplo: "What are the effects of microgravity on mice?"

2. **Usuario presiona Enter**
   - Se valida que tenga mínimo 3 caracteres
   - Se activa la búsqueda RAG

3. **Sistema construye el request**
   ```json
   {
     "query": "What are the effects of microgravity on mice?",
     "filters": {
       "mission_env": ["ISS"],
       "year_range": [2020, 2024]
     },
     "top_k": 8
   }
   ```

4. **Backend procesa la consulta**
   - Embeddings semánticos
   - Retrieval de chunks relevantes
   - Generación de respuesta con LLM
   - Deduplicación y ranking

5. **Frontend muestra resultados**
   - Respuesta de IA formateada
   - Citas bibliográficas expandibles
   - Métricas de calidad
   - Enlaces a papers originales

---

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos
```
src/
├── hooks/
│   └── useChatRag.ts          ✨ Hook para chat RAG
└── components/
    └── ChatResult.tsx          ✨ Componente de resultados
```

### Archivos Actualizados
```
src/
├── lib/
│   ├── api-rag.ts             ✏️ Tipos actualizados (Citation, ChatResponse)
│   ├── api.ts                 ✏️ Adaptador sources → citations
│   └── i18n/locales/
│       ├── en.ts              ✏️ +9 traducciones (chat.*)
│       ├── es.ts              ✏️ +9 traducciones
│       ├── fr.ts              ✏️ +9 traducciones
│       ├── de.ts              ✏️ +9 traducciones
│       ├── pt.ts              ✏️ +9 traducciones
│       ├── ja.ts              ✏️ +9 traducciones
│       └── it.ts              ✏️ +9 traducciones
├── components/
│   └── ExpandableSearch.tsx   ✏️ +onSearch prop, +handleKeyDown
└── pages/
    └── Dashboard.tsx          ✏️ Integración useChatRag + ChatResult
```

---

## 📊 Estructura de Datos

### Request (ChatRequest)
```typescript
{
  query: string;                    // Consulta en lenguaje natural
  filters?: {
    organism?: string[];            // Ej: ["Mus musculus"]
    mission_env?: string[];         // Ej: ["ISS", "Shuttle"]
    exposure?: string[];            // Ej: ["microgravity"]
    system?: string[];              // Ej: ["immune", "cardiovascular"]
    year_range?: [number, number];  // Ej: [2020, 2024]
    tissue?: string[];              // Ej: ["muscle", "bone"]
    assay?: string[];               // Ej: ["RNA-seq"]
  };
  top_k?: number;                   // Default: 8
  session_id?: string;              // Opcional
}
```

### Response (ChatResponse)
```typescript
{
  answer: string;                   // Respuesta generada por IA
  citations: Citation[];            // Array de citas
  used_filters?: any;               // Filtros aplicados
  metrics?: {
    latency_ms: number;             // Tiempo de respuesta
    retrieved_k: number;            // Chunks recuperados
    grounded_ratio: number;         // % respuesta fundamentada
    dedup_count: number;            // Duplicados eliminados
    section_distribution?: {...};   // Distribución por sección
  };
  session_id?: string;
}
```

### Citation
```typescript
{
  source_id: string;                // ID único del chunk
  doi?: string;                     // DOI del paper
  osdr_id?: string;                 // ID en OSDR (Ej: GLDS-123)
  section?: string;                 // Sección (Results, Discussion, etc.)
  snippet: string;                  // Extracto del texto
  url?: string;                     // URL del paper
  title: string;                    // Título del paper
  year?: number;                    // Año de publicación
}
```

---

## 🌐 Traducciones

Se agregaron **63 traducciones nuevas** (9 keys × 7 idiomas):

```typescript
chat: {
  answer: "AI Answer" | "Respuesta IA" | "Réponse IA" | ...
  citations: "Sources & Citations" | "Fuentes y Citas" | ...
  retrieved: "Retrieved" | "Recuperados" | ...
  latency: "Latency" | "Latencia" | ...
  grounded: "Grounded" | "Fundamentado" | ...
  viewSource: "View Source" | "Ver Fuente" | ...
  searching: "Searching..." | "Buscando..." | ...
  pressEnter: "Press Enter to search" | ...
  minChars: "Minimum 3 characters required" | ...
}
```

---

## 🎨 Diseño Visual

- ✅ Glassmorphism coherente con el resto de la UI
- ✅ Gradientes cyan-blue espaciales
- ✅ Animaciones Framer Motion suaves
- ✅ Cards con hover effects
- ✅ Badges coloridos para metadatos
- ✅ Iconos Lucide temáticos (Sparkles, MessageSquare, FileText)

---

## 🚀 Cómo Usar

### 1. Iniciar el backend RAG
```bash
# En otra terminal, asegúrate de que el backend esté corriendo
# Puerto: 8000
```

### 2. Configurar variable de entorno (opcional)
```env
# .env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Usar la búsqueda
```typescript
// En Dashboard.tsx
const { sendQuery, currentResponse, isLoading } = useChatRag();

// Enviar consulta
sendQuery("What are the effects of microgravity on mice?");

// Mostrar resultados
{currentResponse && <ChatResult response={currentResponse} />}
```

---

## 📈 Métricas Disponibles

El componente muestra automáticamente:

1. **Retrieved** (retrieved_k): Número de chunks recuperados
2. **Latency** (latency_ms): Tiempo de respuesta en milisegundos
3. **Grounded** (grounded_ratio): % de la respuesta fundamentada en sources

---

## 🔗 Endpoints Relacionados

Ver [API_ENDPOINTS.md](./API_ENDPOINTS.md) para documentación completa:

- `POST /api/chat` - Búsqueda RAG principal ✅ **IMPLEMENTADO**
- `GET /api/front/documents` - Listar documentos
- `POST /api/front/documents/search` - Búsqueda alternativa
- `GET /api/front/filters` - Obtener filtros disponibles
- `GET /api/front/stats` - Estadísticas generales

---

## ⚡ Próximos Pasos (Opcional)

1. **Historial de Conversaciones**
   - Implementar chat persistente
   - Botón para ver historial
   - Contexto multi-turn

2. **Filtros Avanzados**
   - Mapear más filtros del frontend al backend
   - organism, exposure, system, tissue, assay

3. **Export de Resultados**
   - Exportar respuesta + citas a PDF
   - Compartir resultados vía URL

4. **Análisis de Citas**
   - Visualización de section_distribution
   - Gráfico de años de publicación
   - Red de papers relacionados

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- ✅ Verificar que el backend esté corriendo en `http://localhost:8000`
- ✅ Revisar CORS en el backend
- ✅ Verificar `VITE_API_BASE_URL` en .env

### Error: "Minimum 3 characters required"
- ✅ La consulta debe tener al menos 3 caracteres
- ✅ Validación client-side en `useChatRag.ts`

### Sin resultados / respuesta vacía
- ✅ Verificar que la base de datos del backend tenga datos
- ✅ Ajustar `top_k` para recuperar más chunks
- ✅ Revisar filtros aplicados

---

## 📝 Notas Técnicas

- **React Query**: Se usa `useMutation` para manejar el POST
- **State Management**: Zustand para filtros, React Query para caché
- **Validaciones**: Mínimo 3 caracteres, query trimming
- **Error Handling**: Estados de error capturados y mostrados
- **Performance**: Latency metric visible al usuario

---

## 🎉 ¡Listo para Usar!

La integración está completa y funcional. Solo necesitas:

1. ✅ Backend RAG corriendo en puerto 8000
2. ✅ Frontend corriendo con `npm run dev`
3. ✅ Escribir una consulta y presionar Enter

**¡Disfruta de la búsqueda semántica inteligente con IA!** 🚀🌌
