# 📋 Actualización de Estructura de Citations

**Fecha:** 5 de octubre de 2025  
**Commit:** Adaptación a nueva estructura del RAG backend

---

## 🔄 Cambio en la Estructura

### Antes (estructura antigua)

```json
{
  "citations": [
    {
      "source_id": "GLDS-123_chunk_5",
      "title": "Microgravity effects on immune response",
      "snippet": "RNA-seq analysis revealed...",
      "doi": "10.1038/s41526-023-00123-4",
      "year": 2023
    }
  ]
}
```

### Ahora (estructura actual del RAG)

```json
{
  "citations": [
    {
      "source_id": "GLDS-123_chunk_5",
      "snippet": "RNA-seq analysis revealed...",
      "doi": "10.1038/s41526-023-00123-4",
      "osdr_id": "GLDS-123",
      "year": 2023,
      "organism": "Mus musculus",
      "similarity_score": 0.87,
      "section_boost": 0.10,
      "final_score": 0.97,
      "relevance_reason": "High similarity (0.87) + Results section boost (+0.10)",
      "metadata": {
        "article_metadata": {
          "title": "Microgravity effects on immune response",
          "authors": ["John Doe", "Jane Smith"],
          "pmc_id": "PMC1234567",
          "doi": "10.1038/s41526-023-00123-4",
          "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
          "scraped_at": "2024-01-15T10:30:00",
          "statistics": {
            "word_count": 5420,
            "sections": 8
          }
        }
      }
    }
  ]
}
```

---

## 📝 Cambios Implementados

### 1. Actualización del tipo `Citation` en `api-rag.ts`

**Archivo:** `src/lib/api-rag.ts`

**Cambios:**
- ✅ `title` ahora es opcional (puede estar en el nivel raíz o en `metadata.article_metadata`)
- ✅ Agregados campos de scoring: `similarity_score`, `section_boost`, `final_score`
- ✅ Agregado campo `relevance_reason` para explicación de relevancia
- ✅ Agregado campo `organism` para filtrado
- ✅ Agregado objeto `metadata.article_metadata` con:
  - `title` (string)
  - `authors` (array de strings)
  - `pmc_id` (string)
  - `doi` (string)
  - `url` (string)
  - `scraped_at` (string)
  - `statistics` (object)

```typescript
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
```

### 2. Actualización de `convertRagResponseToSearchResponse` en `api.ts`

**Archivo:** `src/lib/api.ts`

**Cambios:**
- ✅ Extrae `title` desde `metadata.article_metadata.title` con fallback a `citation.title`
- ✅ Extrae `authors` desde `metadata.article_metadata.authors`
- ✅ Usa `final_score` o `similarity_score` para `relevanceScore`
- ✅ Extrae `doi` desde `metadata.article_metadata.doi` con fallback
- ✅ Extrae `organism` para el campo `species`

```typescript
const convertRagResponseToSearchResponse = (
  ragResponse: ChatResponse,
  filters: SearchFilters
): SearchResponse => {
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
      mission: citation.osdr_id || undefined,
      species: (citation as any).organism || undefined,
      outcomes: [],
      citations: 0, 
      doi: citation.doi || (citation as any).metadata?.article_metadata?.doi || null,
      relevanceScore: (citation as any).final_score || (citation as any).similarity_score || 0.95,
    };
  });
  
  return { studies, total: studies.length, ... };
};
```

### 3. Actualización del componente `ChatResult.tsx`

**Archivo:** `src/components/ChatResult.tsx`

**Cambios:**
- ✅ Extrae título desde `metadata.article_metadata.title` con fallback
- ✅ Extrae autores desde `metadata.article_metadata.authors`
- ✅ Muestra lista de autores (máximo 3, con indicador de "más")
- ✅ Mantiene compatibilidad con estructura antigua

```tsx
{response.citations.map((citation, index) => {
  // Extraer el título desde metadata.article_metadata o usar fallback
  const articleMetadata = (citation as any).metadata?.article_metadata;
  const title = articleMetadata?.title || citation.title || `Source ${citation.source_id}`;
  const authors = articleMetadata?.authors || [];
  
  return (
    <motion.div key={citation.source_id}>
      <Card>
        <h5>{title}</h5>
        
        {/* Mostrar autores si están disponibles */}
        {authors.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {authors.slice(0, 3).join(", ")}
            {authors.length > 3 && ` +${authors.length - 3} more`}
          </p>
        )}
        
        {/* ... resto del componente ... */}
      </Card>
    </motion.div>
  );
})}
```

---

## 🎯 Beneficios de los Cambios

### 1. **Más Información Disponible**
- Ahora mostramos los **autores** de cada paper
- Acceso a **metadata completa** del artículo
- **Scores de relevancia** (similarity, boost, final)

### 2. **Mejor UX**
- Los usuarios pueden ver quién escribió el paper
- Información más rica en las citations
- Mejor contexto científico

### 3. **Compatibilidad Retroactiva**
- Los cambios incluyen fallbacks para estructura antigua
- Si `metadata.article_metadata` no existe, usa campos del nivel raíz
- El sistema sigue funcionando con respuestas antiguas del RAG

### 4. **Preparado para Futuras Expansiones**
- Estructura extensible para agregar más metadata
- Fácil agregar estadísticas de los papers
- Listo para mostrar relevance_reason en el futuro

---

## 🧪 Testing

### Verificar en el Frontend

1. **Búsqueda con RAG Chat:**
   ```
   Query: "What are the effects of microgravity on mice?"
   ```
   - ✅ Debe mostrar títulos de papers correctamente
   - ✅ Debe mostrar autores debajo del título
   - ✅ Snippet debe estar visible

2. **Verificar en Consola del Navegador:**
   ```javascript
   // Debe verse la estructura completa de citations
   console.log('[API] RAG citations:', ragResponse.citations);
   ```

3. **Verificar Fallback:**
   - Si el backend retorna estructura antigua (sin metadata)
   - Frontend debe seguir funcionando con fallbacks

---

## 📊 Estructura Completa de Datos

### Citation Completa (Ejemplo Real)

```json
{
  "document_id": "507f1f77bcf86cd799439011",
  "source_id": "GLDS-123_chunk_5",
  "doi": "10.1038/s41526-023-00123-4",
  "osdr_id": "GLDS-123",
  "section": "Results",
  "snippet": "RNA-seq analysis revealed significant upregulation...",
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
      "pmc_id": "PMC1234567",
      "doi": "10.1038/s41526-023-00123-4",
      "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/",
      "scraped_at": "2024-01-15T10:30:00",
      "statistics": {
        "word_count": 5420,
        "sections": 8
      }
    }
  }
}
```

### Mapeo a Study (Frontend)

```typescript
{
  id: "GLDS-123_chunk_5",
  title: "Microgravity effects on immune response",
  authors: ["John Doe", "Jane Smith"],
  year: 2023,
  abstract: "RNA-seq analysis revealed significant upregulation...",
  mission: "GLDS-123",
  species: "Mus musculus",
  outcomes: [],
  citations: 0,
  doi: "10.1038/s41526-023-00123-4",
  relevanceScore: 0.97
}
```

---

## 🔗 Referencias

- **API Documentation:** `API_ENDPOINTS.md` (líneas 145-180)
- **RAG Endpoint:** `POST /api/chat`
- **Backend Base URL:** https://nasa-rag-service.onrender.com

---

## ✅ Checklist de Implementación

- [x] Actualizado tipo `Citation` en `api-rag.ts`
- [x] Actualizado `convertRagResponseToSearchResponse` en `api.ts`
- [x] Actualizado componente `ChatResult.tsx`
- [x] Compilación exitosa sin errores TypeScript
- [x] Documentación creada (`CITATIONS_STRUCTURE_UPDATE.md`)
- [ ] Testing con backend real
- [ ] Verificar visualización de autores
- [ ] Verificar fallbacks funcionando

---

**Última actualización:** 5 de octubre de 2025

**Archivos modificados:**
- `src/lib/api-rag.ts` (tipo Citation)
- `src/lib/api.ts` (convertRagResponseToSearchResponse)
- `src/components/ChatResult.tsx` (UI de citations)
- `CITATIONS_STRUCTURE_UPDATE.md` (esta documentación)
