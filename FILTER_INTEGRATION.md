# Integración de Filtros Avanzados en Explorar

## Descripción General

Se han integrado **4 nuevos endpoints del backend RAG** que mejoran significativamente la funcionalidad de la vista "Explorar" con filtros dinámicos y paginación nativa.

## Nuevos Endpoints Implementados

### 1. GET /api/front/documents/paginated
- **Propósito**: Paginación nativa con soporte de filtros
- **Query Parameters**:
  - `page` (1-based): Número de página
  - `page_size` (1-100): Tamaño de página
  - `category` (opcional): Filtrar por categoría
  - `source_type` (opcional): Filtrar por tipo de fuente
- **Response**:
  ```typescript
  {
    total: number;
    documents: Document[];
    page: number;
    page_size: number;
    total_pages: number;
  }
  ```
- **Ventaja**: El backend calcula automáticamente las páginas, eliminando la necesidad de calcular `skip` manualmente.

### 2. GET /api/front/documents/by-category
- **Propósito**: Filtrar documentos por categoría específica
- **Query Parameters**:
  - `category` (requerido): Categoría a filtrar
  - `skip` (opcional): Documentos a saltar
  - `limit` (opcional): Número máximo de resultados
- **Categorías Disponibles**:
  - general
  - mission
  - nasa
  - physics
  - planets
  - science
  - space
  - technology

### 3. GET /api/front/documents/by-tags
- **Propósito**: Filtrar documentos por tags con opción de coincidencia
- **Query Parameters**:
  - `tags[]` (requerido): Array de tags a buscar
  - `match_all` (boolean): 
    - `false`: Coincide con ANY tag (default)
    - `true`: Coincide con ALL tags
  - `skip` (opcional): Documentos a saltar
  - `limit` (opcional): Número máximo de resultados
- **Tags Ejemplo**:
  - mice, mission, microgravity, spaceflight
  - immune, bone, muscle
  - space, astronaut, radiation

### 4. GET /api/front/filter-values
- **Propósito**: Obtener valores disponibles para filtros dinámicos
- **Response**:
  ```typescript
  {
    categories: string[];      // 8 categorías disponibles
    tags: string[];            // ~100+ tags disponibles
    source_types: string[];    // ["article"]
    total_documents: number;   // 536
    total_chunks: number;      // 22674
  }
  ```
- **Ventaja**: Los filtros se poblan dinámicamente desde el backend.

## Implementación Frontend

### Archivo: `src/lib/api.ts`

Se agregaron 4 nuevas funciones con soporte completo de mock data:

```typescript
// 1. Paginación nativa
export const listDocumentsPaginated = async (
  page: number = 1,
  pageSize: number = 20,
  category?: string,
  sourceType?: string
): Promise<PaginatedDocumentsResponse> => { /* ... */ }

// 2. Filtro por categoría
export const searchDocumentsByCategory = async (
  category: string,
  skip: number = 0,
  limit: number = 20
): Promise<DocumentsResponse> => { /* ... */ }

// 3. Filtro por tags
export const searchDocumentsByTags = async (
  tags: string[],
  matchAll: boolean = false,
  skip: number = 0,
  limit: number = 20
): Promise<DocumentsResponse> => { /* ... */ }

// 4. Valores de filtros
export const getFilterValues = async (): Promise<FilterValues> => { /* ... */ }
```

**Nuevos Interfaces:**
```typescript
export interface PaginatedDocumentsResponse extends DocumentsResponse {
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FilterValues {
  categories: string[];
  tags: string[];
  source_types: string[];
  total_documents: number;
  total_chunks: number;
}
```

### Archivo: `src/pages/Explore.tsx`

**Nuevos Estados:**
```typescript
const [filterValues, setFilterValues] = useState<FilterValues | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string>("");
const [selectedTag, setSelectedTag] = useState<string>("");
```

**Lógica de Fetch Condicional (4 Ramas):**
```typescript
useEffect(() => {
  const fetchDocuments = async () => {
    let response;
    
    if (searchQuery.trim()) {
      // 1. Búsqueda por texto (existente)
      response = await searchDocuments(searchQuery, skip, pageSize);
    } else if (selectedTag) {
      // 2. Filtro por tag (nuevo)
      response = await searchDocumentsByTags([selectedTag], false, skip, pageSize);
    } else if (selectedCategory) {
      // 3. Filtro por categoría (nuevo)
      response = await searchDocumentsByCategory(selectedCategory, skip, pageSize);
    } else {
      // 4. Listado completo con paginación (nuevo)
      response = await listDocumentsPaginated(currentPage, pageSize);
    }
    
    setDocuments(response.documents);
    setTotal(response.total);
  };
}, [currentPage, searchQuery, selectedCategory, selectedTag]);
```

**Carga Inicial de Filtros:**
```typescript
useEffect(() => {
  const loadFilterValues = async () => {
    const values = await getFilterValues();
    setFilterValues(values);
  };
  loadFilterValues();
}, []);
```

**Handlers de Filtros:**
```typescript
const handleCategoryChange = (value: string) => {
  setSelectedCategory(value === "all" ? "" : value);
  setCurrentPage(1);
  setSearchQuery("");      // Limpia búsqueda
  setSelectedTag("");      // Limpia tag
};

const handleTagChange = (value: string) => {
  setSelectedTag(value === "all" ? "" : value);
  setCurrentPage(1);
  setSearchQuery("");      // Limpia búsqueda
  setSelectedCategory(""); // Limpia categoría
};
```

**UI de Filtros:**
```tsx
{filterValues && (
  <div className="flex items-center justify-center gap-4 flex-wrap">
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Filters:</span>
    </div>

    {/* Category Filter */}
    <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-[180px] glass-input">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {filterValues.categories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Tag Filter */}
    <Select value={selectedTag || "all"} onValueChange={handleTagChange}>
      <SelectTrigger className="w-[180px] glass-input">
        <SelectValue placeholder="Tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Tags</SelectItem>
        {filterValues.tags.slice(0, 20).map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Clear Filters Button */}
    {(selectedCategory || selectedTag || searchQuery) && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSearchQuery("");
          setSelectedCategory("");
          setSelectedTag("");
          setCurrentPage(1);
        }}
        className="text-xs"
      >
        Clear Filters
      </Button>
    )}
  </div>
)}
```

## Flujo de Filtros

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO EN EXPLORAR                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  ¿Qué acción?    │
                    └──────────────────┘
                              │
            ┌─────────────────┼─────────────────┬─────────────┐
            │                 │                 │             │
            ▼                 ▼                 ▼             ▼
    ┌────────────┐   ┌──────────────┐  ┌──────────────┐  ┌────────┐
    │  Buscar    │   │   Filtrar    │  │   Filtrar    │  │ Listar │
    │  por texto │   │ por Categoría│  │   por Tag    │  │  Todo  │
    └────────────┘   └──────────────┘  └──────────────┘  └────────┘
            │                 │                 │             │
            ▼                 ▼                 ▼             ▼
    searchDocuments  searchByCategory  searchByTags  listPaginated
            │                 │                 │             │
            └─────────────────┴─────────────────┴─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Backend RAG     │
                    │  Procesa query   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Retorna docs    │
                    │  filtrados       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Frontend muestra│
                    │  resultados      │
                    └──────────────────┘
```

## Ventajas de la Implementación

### 1. **Performance Mejorado**
- Queries especializadas reducen la transferencia de datos
- Backend filtra eficientemente en lugar de frontend
- Paginación nativa elimina cálculos manuales

### 2. **Experiencia de Usuario**
- Filtros mutuamente exclusivos (se limpian automáticamente)
- Botón "Clear Filters" cuando hay filtros activos
- Mensajes contextuales en estado vacío (indica qué filtro está activo)
- Feedback visual con iconos y badges

### 3. **Mantenibilidad**
- Backend provee opciones dinámicamente (no hardcodear)
- Mock data support para desarrollo offline
- Logging detallado en cada función
- Interfaces TypeScript bien definidas

### 4. **Escalabilidad**
- Fácil agregar nuevos tipos de filtros
- Estructura modular permite extensiones
- Compatible con filtros combinados futuros

## Características Implementadas

✅ **Paginación Nativa**: Backend calcula páginas automáticamente  
✅ **Filtro por Categoría**: 8 categorías disponibles (space, nasa, physics, etc.)  
✅ **Filtro por Tag**: Búsqueda por tags individuales  
✅ **Valores Dinámicos**: Backend provee lista de opciones  
✅ **Clear Filters**: Botón para limpiar todos los filtros  
✅ **Mock Data Support**: Funciona offline con datos de prueba  
✅ **Estados Vacíos Contextuales**: Mensajes según filtro activo  
✅ **UI Responsive**: Select dropdowns adaptativos  

## Datos del Sistema

- **Total de Endpoints RAG**: 17 (antes 13, +4 nuevos)
- **Total de Documentos**: 536
- **Total de Chunks**: 22,674
- **Categorías Disponibles**: 8
- **Tags Disponibles**: 100+
- **Tipos de Fuente**: 1 (article)

## TODOs Futuros

### Mejoras de UI
- [ ] Contador de resultados por filtro (ej: "Space (42)")
- [ ] Indicador de filtro activo con badge
- [ ] Animaciones de transición entre filtros
- [ ] Loading skeleton específico para filtros

### Funcionalidad Avanzada
- [ ] **Match All Toggle para Tags**: Permitir coincidencia de ALL tags
- [ ] **Filtros Combinados**: Categoría + Tag simultáneamente
- [ ] **Persistencia en URL**: Query params para compartir búsquedas
- [ ] **Historial de Filtros**: Guardar búsquedas recientes
- [ ] **Filtros Guardados**: Bookmark combinaciones comunes

### Performance
- [ ] Debounce en búsqueda por texto
- [ ] Caché de filter values (actualizar cada 5 minutos)
- [ ] Virtualización para lista larga de tags
- [ ] Prefetch de páginas adyacentes

### Backend
- [ ] Endpoint para contar resultados por filtro
- [ ] Endpoint para búsqueda combinada (category + tags)
- [ ] Endpoint para autocompletado de búsqueda
- [ ] Soporte de ordenamiento (por fecha, relevancia, etc.)

## Testing

### Para Probar Localmente

1. **Listado Completo**:
   - Navegar a /explore sin filtros
   - Debería usar `listDocumentsPaginated`
   - Mostrar 536 documentos

2. **Filtro por Categoría**:
   - Seleccionar "space" en dropdown Category
   - Debería filtrar solo documentos de esa categoría
   - Mostrar mensaje si no hay resultados

3. **Filtro por Tag**:
   - Seleccionar "mice" en dropdown Tag
   - Debería filtrar documentos con ese tag
   - Botón "Clear Filters" debe aparecer

4. **Búsqueda por Texto**:
   - Ingresar "nasa" en search bar
   - Debería limpiar filtros y usar `searchDocuments`
   - Mostrar resultados ordenados por relevancia

5. **Clear Filters**:
   - Activar cualquier filtro
   - Click en "Clear Filters"
   - Debería volver al listado completo

### Con Backend Real

```bash
# Verificar que el backend está disponible
curl https://nasa-rag-service.onrender.com/health

# Probar endpoint de filter values
curl https://nasa-rag-service.onrender.com/api/front/filter-values

# Probar paginación
curl "https://nasa-rag-service.onrender.com/api/front/documents/paginated?page=1&page_size=20"

# Probar filtro por categoría
curl "https://nasa-rag-service.onrender.com/api/front/documents/by-category?category=space&limit=10"

# Probar filtro por tags
curl "https://nasa-rag-service.onrender.com/api/front/documents/by-tags?tags=mice&tags=mission&match_all=false"
```

## Archivos Modificados

1. **`src/lib/api.ts`** (+200 líneas):
   - 4 nuevas funciones API
   - 2 nuevos interfaces
   - Mock data support completo

2. **`src/pages/Explore.tsx`** (+80 líneas):
   - 3 nuevos estados
   - 2 nuevos handlers
   - Lógica condicional de fetch (4 ramas)
   - UI de filtros con Select dropdowns

3. **`API_ENDPOINTS.md`** (actualizado por usuario):
   - Documentación de 4 nuevos endpoints
   - Total: 17 endpoints (antes 13)

## Referencias

- **Backend RAG**: https://nasa-rag-service.onrender.com
- **Documentación**: `API_ENDPOINTS.md`
- **Components UI**: shadcn/ui (Select, Button, Input, Card, Badge)
- **Icons**: lucide-react (Search, Filter, BookOpen, ChevronLeft, ChevronRight)

---

**Fecha de Integración**: 2025  
**Versión Frontend**: React 18 + TypeScript + Vite 5.4.19  
**Total Endpoints Integrados**: 17 (13 originales + 4 nuevos)
