# Sistema de Mock Data para Testing UI

## 📋 Descripción

Este sistema permite visualizar y probar la interfaz de usuario sin necesidad de tener el backend funcionando. Es útil para:

- Desarrollo del frontend independiente del backend
- Testing de UI y UX sin depender de servicios externos
- Demos y presentaciones sin conectividad
- Visualización de cómo se verán los resultados reales

## 🚀 Cómo Activar el Modo Mock

### Opción 1: Archivo .env.local (Recomendado)

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Asegúrate de que contenga:
   ```env
   VITE_USE_MOCK_DATA=true
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Opción 2: Editar .env.local manualmente

Si ya tienes un archivo `.env.local`, simplemente agrega o modifica:
```env
VITE_USE_MOCK_DATA=true
```

## 🔄 Cambiar Entre Mock y Backend Real

### Usar datos mock:
```env
VITE_USE_MOCK_DATA=true
```

### Usar backend real:
```env
VITE_USE_MOCK_DATA=false
```

O simplemente comenta la línea:
```env
# VITE_USE_MOCK_DATA=true
```

**Importante:** Después de cambiar el archivo `.env.local`, debes reiniciar el servidor de desarrollo (`npm run dev`).

## 📊 Datos Mock Disponibles

El sistema incluye datos mock completos para todas las funcionalidades de la aplicación:

### 1. **Chat RAG - Respuestas Inteligentes**

#### Búsqueda General (Default)
- Query: Cualquier búsqueda general
- Respuesta: Overview completo de efectos biológicos del espacio
- 5 citaciones de diferentes estudios
- Métricas simuladas

#### Microgravity
- Keywords: "microgravity", "gravity", "plant"
- Respuesta: Efectos celulares y en plantas
- 2 citaciones relevantes

#### Radiation
- Keywords: "radiation", "cosmic", "dna"
- Respuesta: Efectos de radiación y reparación de ADN
- 1 citación especializada

#### Bone
- Keywords: "bone", "density", "skeleton"
- Respuesta: Pérdida de densidad ósea en espacio
- 1 citación sobre metabolismo óseo

#### Immune
- Keywords: "immune", "immunity", "infection"
- Respuesta: Adaptación del sistema inmune
- 1 citación sobre función inmune

### 2. **Estudios (Studies) - 10 Estudios Mock Completos**

El sistema incluye 10 estudios científicos mock realistas con:
- **IDs reales**: OSD-001, OSD-047, OSD-123, etc.
- **Títulos científicos**: Basados en investigación real de NASA
- **Metadata completa**: Autores, año, DOI, misión, especies
- **Abstracts detallados**: Resúmenes científicos realistas
- **Keywords**: Palabras clave relevantes
- **Citations count**: Número de citaciones simulado
- **Outcomes**: positive, negative, mixed, inconclusive

#### Estudios Disponibles:
1. **OSD-001**: Transcriptional Response of Human Cells to Microgravity (2019)
2. **OSD-047**: Effects of Long-Duration Spaceflight on Bone Metabolism (2020)
3. **OSD-123**: Immune System Adaptation in Space Environment (2021)
4. **OSD-201**: Genomic Responses to Cosmic Radiation Exposure (2022)
5. **OSD-089**: Plant Adaptation Mechanisms in Microgravity (2018)
6. **OSD-302**: Cardiovascular Adaptations During Extended Spaceflight (2023)
7. **OSD-415**: Muscle Atrophy Mechanisms in Microgravity (2021)
8. **OSD-528**: Microbiome Changes in Closed Space Environments (2022)
9. **OSD-634**: Neural Plasticity and Cognition in Space (2023)
10. **OSD-745**: Sleep Architecture Alterations in Microgravity (2020)

#### Filtros Soportados:
- ✅ **Query**: Búsqueda por texto (título, abstract, keywords)
- ✅ **Mission**: Filtrar por misión (ej: "ISS Expedition 45")
- ✅ **Species**: Filtrar por especie (Homo sapiens, Mus musculus, etc.)
- ✅ **Outcome**: Filtrar por tipo de resultado (positive, negative, mixed)
- ✅ **Year Range**: Filtrar por rango de años (yearFrom, yearTo)
- ✅ **Paginación**: page y pageSize funcionales

### 3. **Study Detail - Detalles Completos**

Cada estudio tiene un detalle expandido con:
- Todos los campos del estudio base
- **Related studies**: 3 estudios relacionados
- **Methods**: Descripción de metodología
- Información completa de autores y referencias

### 4. **KPIs - Métricas Clave**

```typescript
{
  totalStudies: 10,
  yearsCovered: "2018-2023",
  totalMissions: 8,
  totalSpecies: 4
}
```

### 5. **Insights - Análisis Estadístico**

- **byYear**: Distribución de estudios por año (2018-2023)
- **topMissions**: Top 5 misiones con más estudios
- **outcomesDist**: Distribución de outcomes (positive: 3, negative: 4, mixed: 6)
- **consensusVsDisagreement**: 4 tópicos con niveles de consenso
- **heatmap**: Matriz de entidad × outcome con conteos

### 6. **Knowledge Graph - Grafo de Conocimiento**

- **10 nodos**: Misiones, especies, outcomes, papers
- **9 enlaces**: Relaciones entre entidades
- Tipos de nodo: mission, species, outcome, paper
- Atributos: degree, color
- Relaciones: studies, affected, analyzed, measured

## 🎯 Ejemplos de Búsquedas para Probar

### Chat RAG:
```
1. "What are the effects of microgravity on human cells?"
   → Respuesta sobre microgravity

2. "How does cosmic radiation affect DNA?"
   → Respuesta sobre radiation

3. "What happens to bone density in space?"
   → Respuesta sobre bone

4. "How does the immune system change in space?"
   → Respuesta sobre immune

5. "Space exploration biological effects"
   → Respuesta general (default)
```

### Búsqueda de Estudios:

#### Sin filtros:
```
Query: "microgravity"
→ Retorna estudios sobre microgravedad (OSD-001, OSD-089)
```

#### Con filtros de misión:
```
Query: "bone"
Mission: "ISS"
→ Retorna estudios de ISS relacionados con huesos
```

#### Con filtros de especie:
```
Query: "immune"
Species: ["Homo sapiens"]
→ Retorna estudios en humanos sobre sistema inmune
```

#### Con filtros de outcome:
```
Query: "spaceflight"
Outcome: ["negative"]
→ Retorna estudios con outcomes negativos
```

#### Con rango de años:
```
Query: "space"
YearFrom: 2020
YearTo: 2023
→ Retorna estudios de 2020-2023
```

### Detalles de Estudio:
```
Navigate to: /study/OSD-001
→ Muestra detalle completo con estudios relacionados
```

### Insights y Gráficos:
```
Go to: /insights
→ Visualiza estadísticas mock

Go to: /graph
→ Visualiza grafo de conocimiento mock
```

## 📁 Archivos del Sistema Mock

### `src/lib/mock-data.ts` (Ampliado)
- **Mock Chat Responses**: 5 categorías de respuestas RAG
- **Mock Studies**: 10 estudios científicos completos
- **Mock Study Details**: Detalles expandidos con estudios relacionados
- **Mock KPIs**: Métricas clave del dashboard
- **Mock Insights**: Análisis estadístico completo
- **Mock Graph**: Grafo de conocimiento con nodos y enlaces
- Funciones de selección inteligente según query y filtros
- Simulación de latencia de red (150-600ms según endpoint)

#### Funciones Principales:
- `getMockChatResponse(query)`: Retorna respuesta RAG según query
- `getMockStudies(filters)`: Retorna estudios con filtros y paginación
- `getMockStudyById(id)`: Retorna detalle de un estudio específico
- `getMockKpiData()`: Retorna métricas KPI
- `getMockInsights()`: Retorna análisis estadístico
- `getMockGraph()`: Retorna grafo de conocimiento
- `delay(ms)`: Simula latencia de red

### `src/lib/api-rag.ts` (Modificado)
- Cliente API para backend RAG
- Lee variable `VITE_USE_MOCK_DATA` del entorno
- Detecta automáticamente y usa mock cuando está habilitado
- Mantiene compatibilidad total con backend real
- Logging detallado para debugging

### `src/lib/api.ts` (Modificado)
- Cliente API para endpoints REST
- Soporta modo mock en todos los endpoints:
  - `searchStudies()`: Búsqueda con filtros
  - `getStudyById()`: Detalle de estudio
  - `getKnowledgeGraph()`: Grafo de conocimiento
  - `getInsights()`: Análisis estadístico
  - `getKpiData()`: Métricas KPI
- Mantiene compatibilidad total con backend real
- Logging detallado para cada operación mock

## 🔍 Logs y Debugging

Cuando el modo mock está activado, verás en la consola del navegador:

### Para Chat RAG:
```
[API] Using mock data mode
[API] Mock request: { query: "...", filters: {...} }
[API] Mock response: { answer: "...", citations: [...] }
```

### Para Studies Search:
```
[API] Using mock data for studies search
[API] Search filters: { query: "...", mission: "...", ... }
[API] Mock studies response: { studies: [...], total: 10, ... }
```

### Para Study Detail:
```
[API] Using mock data for study detail: OSD-001
[API] Mock study detail: { id: "OSD-001", title: "...", ... }
```

### Para KPIs:
```
[API] Using mock data for KPIs
[API] Mock KPI: { totalStudies: 10, yearsCovered: "2018-2023", ... }
```

### Para Insights:
```
[API] Using mock data for insights
[API] Mock insights: { byYear: [...], topMissions: [...], ... }
```

### Para Graph:
```
[API] Using mock data for knowledge graph
[API] Mock graph: { nodes: [...], links: [...] }
```

Esto te permite:
- ✅ Verificar que el modo mock está activo
- ✅ Ver qué datos se están retornando
- ✅ Debuggear filtros y queries
- ✅ Medir tiempos de respuesta simulados

## 🏗️ Estructura de Datos Mock

### Respuesta Chat RAG:
```typescript
{
  answer: string;                    // Respuesta generada (markdown)
  citations: Citation[];             // Array de citaciones
  used_filters?: any;               // Filtros aplicados
  metrics?: {                       // Métricas simuladas
    latency_ms: number;
    retrieved_k: number;
    grounded_ratio: number;
    dedup_count: number;
    section_distribution?: Record<string, number>;
  };
  session_id?: string;              // ID de sesión mock
}
```

### Citación:
```typescript
{
  source_id: string;                // ID único del estudio
  doi?: string;                     // DOI del paper
  osdr_id?: string;                 // ID en OSDR
  section?: string;                 // Sección del paper
  snippet: string;                  // Fragmento relevante
  url?: string;                     // URL al estudio completo
  title: string;                    // Título del estudio
  year?: number;                    // Año de publicación
}
```

### Estudio:
```typescript
{
  id: string;                       // ID único (ej: "OSD-001")
  title: string;                    // Título del estudio
  year: number | null;              // Año de publicación
  mission?: string;                 // Misión (ej: "ISS Expedition 45")
  species?: string | string[];      // Especie(s) estudiada(s)
  outcomes?: OutcomeType[];         // ["positive", "negative", "mixed", "inconclusive"]
  summary?: string;                 // Resumen breve
  keywords?: string[];              // Palabras clave
  authors?: string[];               // Lista de autores
  doi?: string | null;              // DOI
  abstract?: string;                // Abstract completo
  citations?: number;               // Número de citaciones
  relevanceScore?: number;          // Score de relevancia (0-1)
}
```

### Study Detail (extiende Study):
```typescript
{
  ...Study,                         // Todos los campos de Study
  related: Study[];                 // Estudios relacionados (3)
  methods?: string;                 // Descripción de metodología
}
```

### Search Response:
```typescript
{
  studies: Study[];                 // Array de estudios
  total: number;                    // Total de resultados
  page: number;                     // Página actual
  pageSize: number;                 // Tamaño de página
  totalPages: number;               // Total de páginas
  hasMore: boolean;                 // Hay más páginas?
}
```

### KPI Data:
```typescript
{
  totalStudies: number;             // Total de estudios
  yearsCovered: string;             // Rango de años (ej: "2018-2023")
  totalMissions: number;            // Total de misiones
  totalSpecies: number;             // Total de especies
}
```

### Insights:
```typescript
{
  byYear: Array<{                   // Distribución por año
    year: number;
    count: number;
  }>;
  topMissions: Array<{              // Top misiones
    name: string;
    count: number;
  }>;
  outcomesDist: Array<{             // Distribución de outcomes
    label: string;
    count: number;
  }>;
  consensusVsDisagreement: Array<{  // Consenso vs desacuerdo
    topic: string;
    consensus: number;
    disagreement: number;
  }>;
  heatmap: Array<{                  // Heatmap entidad × outcome
    entity: string;
    outcome: string;
    count: number;
  }>;
}
```

### Graph:
```typescript
{
  nodes: Array<{                    // Nodos del grafo
    id: string;
    label: string;
    type: "mission" | "experiment" | "species" | "outcome" | "paper";
    degree?: number;                // Número de conexiones
    color?: string;                 // Color del nodo
  }>;
  links: Array<{                    // Enlaces del grafo
    source: string;                 // ID del nodo origen
    target: string;                 // ID del nodo destino
    relation: string;               // Tipo de relación
    weight?: number;                // Peso de la conexión
  }>;
}
```

## 🎨 Ventajas del Sistema Mock

1. **Desarrollo Independiente:** Trabaja en el frontend sin esperar al backend
2. **Testing UI/UX:** Prueba diferentes layouts y estilos con datos realistas
3. **Demos:** Presenta el proyecto sin depender de servicios externos
4. **Performance:** Respuestas instantáneas para testing rápido
5. **Datos Consistentes:** Mismas respuestas para testing de regresión
6. **Educativo:** Los datos mock contienen información científica real
7. **Cobertura Completa:** Todos los endpoints tienen datos mock
8. **Filtros Funcionales:** Sistema de filtrado completo implementado
9. **Paginación Real:** Sistema de paginación totalmente funcional
10. **Grafos Visualizables:** Datos de grafo listos para visualización

## ⚙️ Personalizar Datos Mock

### Agregar Nuevos Estudios:

1. Abre `src/lib/mock-data.ts`
2. Agrega un nuevo estudio al array `mockStudies`:

```typescript
{
  id: "OSD-999",
  title: "Tu Nuevo Estudio",
  year: 2024,
  mission: "Artemis I",
  species: "Homo sapiens",
  outcomes: ["positive"],
  summary: "Descripción breve del estudio...",
  keywords: ["keyword1", "keyword2"],
  authors: ["Autor, A.", "Autor, B."],
  doi: "10.1234/example.2024",
  abstract: "Abstract completo del estudio...",
  citations: 0,
  relevanceScore: 0.90
}
```

3. Opcionalmente, agrega detalles en `mockStudyDetails`:

```typescript
"OSD-999": {
  ...mockStudies[X], // Índice del nuevo estudio
  related: [mockStudies[0], mockStudies[1]],
  methods: "Descripción de metodología..."
}
```

### Agregar Nuevas Respuestas RAG:

1. Crea nueva respuesta en `mockResponses`:

```typescript
myTopic: {
  answer: `Tu respuesta en markdown...`,
  citations: [mockCitations[X], mockCitations[Y]],
  metrics: {
    latency_ms: 200,
    retrieved_k: 5,
    grounded_ratio: 0.90,
    dedup_count: 1
  }
}
```

2. Actualiza `getMockChatResponse()`:

```typescript
if (lowerQuery.includes('mytopic') || lowerQuery.includes('keyword')) {
  return mockResponses.myTopic;
}
```

### Modificar KPIs, Insights o Graph:

Edita las funciones correspondientes en `mock-data.ts`:
- `getMockKpiData()`
- `getMockInsights()`
- `getMockGraph()`

## 🚨 Notas Importantes

1. **Los datos mock NO se usan en producción** por defecto (solo en desarrollo local)
2. **Siempre reinicia el servidor** después de cambiar `.env.local`
3. **El archivo `.env.local` no se sube a Git** (está en `.gitignore`)
4. **Los datos mock son para testing UI**, no para producción
5. **La latencia simulada** ayuda a probar estados de loading

## 📝 Checklist para Usar Mock Data

- [ ] Copiar `.env.local.example` a `.env.local`
- [ ] Verificar que `VITE_USE_MOCK_DATA=true` esté en `.env.local`
- [ ] Reiniciar servidor de desarrollo (`Ctrl+C` y `npm run dev`)
- [ ] Abrir consola del navegador para ver logs
- [ ] **Probar Chat RAG** con diferentes queries
- [ ] **Probar búsqueda de estudios** con y sin filtros
- [ ] **Probar filtros**: mission, species, outcome, years
- [ ] **Probar paginación** de estudios
- [ ] **Ver detalle de un estudio** (click en cualquier estudio)
- [ ] **Ver estudios relacionados** en detalle
- [ ] **Ver Dashboard** con KPIs mock
- [ ] **Ver Insights** con gráficos estadísticos
- [ ] **Ver Graph** con visualización de red
- [ ] Verificar que todos los datos se muestren correctamente
- [ ] Verificar tiempos de carga (simulated network delay)

## 🔄 Volver al Backend Real

Cuando el backend esté disponible:

1. Edita `.env.local`:
   ```env
   VITE_USE_MOCK_DATA=false
   ```

2. O simplemente comenta la línea:
   ```env
   # VITE_USE_MOCK_DATA=true
   ```

3. Reinicia el servidor de desarrollo

4. Verifica en consola que las requests van al backend real

## 🎯 Estado del Proyecto

- ✅ Sistema de mock data implementado
- ✅ **Chat RAG**: 5 categorías + default con respuestas inteligentes
- ✅ **Studies Search**: 10 estudios científicos completos
- ✅ **Study Detail**: Detalles expandidos con estudios relacionados
- ✅ **Filtros**: query, mission, species, outcome, years - TOTALMENTE FUNCIONALES
- ✅ **Paginación**: Sistema completo de paginación
- ✅ **KPIs**: Métricas del dashboard
- ✅ **Insights**: Análisis estadístico con 5 visualizaciones
- ✅ **Knowledge Graph**: Grafo con 10 nodos y 9 enlaces
- ✅ Citaciones realistas con datos NASA
- ✅ Métricas simuladas
- ✅ Delay de red simulado (150-600ms según endpoint)
- ✅ Logs de debugging completos
- ✅ Documentación completa
- ✅ Compatible con backend real
- ✅ **TODA LA APLICACIÓN ES FUNCIONAL EN MODO MOCK**

## 🤝 Contribuir

Para agregar más datos mock realistas:

1. Investiga en https://osdr.nasa.gov/bio/repo/
2. Agrega citaciones basadas en estudios reales
3. Mantén el formato consistente
4. Actualiza esta documentación si agregas nuevas categorías

---

**Tip:** El sistema mock es ideal para trabajar en el frontend mientras el equipo del backend resuelve el problema de conexión a MongoDB. ¡Ahora puedes ver cómo se verán los resultados reales! 🚀
