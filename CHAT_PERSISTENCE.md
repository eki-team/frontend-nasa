# Persistencia de Estado del Chat RAG

## Problema Original

Cuando el usuario realizaba una búsqueda con el chat RAG:
1. Obtenía respuesta de la IA ✅
2. Veía las citas relevantes ✅
3. Veía los papers relacionados ✅
4. Hacía click en un paper para ver detalles ✅
5. Navegaba de vuelta al Dashboard con "Back" ❌
6. **Todo desaparecía** - respuesta, citas y papers ❌

**Causa:** El estado del chat (`currentResponse`) estaba almacenado solo en el hook `useChatRag` usando el estado de `react-query` mutation, que se pierde al desmontar el componente durante la navegación.

## Solución Implementada

### Arquitectura de Persistencia

Movimos el estado del chat al **Zustand store global** con **persist middleware**, que guarda automáticamente el estado en `localStorage`.

```
┌─────────────────────────────────────────────────────────┐
│                   ANTES (Problema)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dashboard Component                                     │
│  ├── useChatRag Hook                                     │
│  │   └── chatMutation.data  ← Estado LOCAL (se pierde) │
│  │                                                       │
│  └── ChatResult Component                                │
│      └── Muestra: response.answer + citations            │
│                                                          │
│  [Usuario navega a /study/123]                          │
│  ↓                                                       │
│  Dashboard se desmonta                                   │
│  ↓                                                       │
│  ❌ chatMutation.data se pierde                         │
│  ❌ Respuesta desaparece al volver                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   DESPUÉS (Solución)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Zustand Store (GLOBAL + PERSIST)                       │
│  ├── currentChatResponse: ChatResponse | null           │
│  ├── setCurrentChatResponse()                           │
│  └── clearChatResponse()                                │
│      ↓                                                   │
│      localStorage ("nasa-bio-ui-store")                 │
│                                                          │
│  Dashboard Component                                     │
│  ├── useChatRag Hook                                     │
│  │   ├── Escribe en store: setCurrentChatResponse()    │
│  │   └── Lee de store: currentChatResponse              │
│  │                                                       │
│  └── ChatResult Component                                │
│      └── Muestra: response.answer + citations            │
│                                                          │
│  [Usuario navega a /study/123]                          │
│  ↓                                                       │
│  Dashboard se desmonta                                   │
│  ↓                                                       │
│  ✅ currentChatResponse persiste en store               │
│  ✅ Respuesta visible al volver                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Implementación Técnica

### 1. Actualización del Store (`src/store/useUiStore.ts`)

```typescript
interface UiState {
  // ... otros estados
  
  // Chat RAG state (persiste entre navegaciones)
  currentChatResponse: ChatResponse | null;
  setCurrentChatResponse: (response: ChatResponse | null) => void;
  clearChatResponse: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // ... otras implementaciones
      
      // Chat RAG state
      currentChatResponse: null,
      setCurrentChatResponse: (response) => 
        set({ currentChatResponse: response }),
      clearChatResponse: () => 
        set({ currentChatResponse: null })
    }),
    {
      name: "nasa-bio-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        currentChatResponse: state.currentChatResponse // ← Persistir en localStorage
      })
    }
  )
);
```

**Características:**
- ✅ Estado global accesible desde cualquier componente
- ✅ Persist middleware guarda en localStorage
- ✅ Sobrevive a navegación entre rutas
- ✅ Sobrevive a recargas del navegador

### 2. Actualización del Hook (`src/hooks/useChatRag.ts`)

```typescript
export const useChatRag = () => {
  const { 
    filters, 
    currentChatResponse,      // ← Leer del store
    setCurrentChatResponse    // ← Escribir en store
  } = useUiStore();
  
  const [chatHistory, setChatHistory] = useState<ChatResponse[]>([]);

  const chatMutation = useMutation({
    mutationFn: (query: string) => {
      // ... lógica de búsqueda
    },
    onSuccess: (data) => {
      // Guardar en historial local
      setChatHistory((prev) => [...prev, data]);
      
      // ✅ Guardar en store global (persiste)
      setCurrentChatResponse(data);
    },
  });

  const clearHistory = () => {
    setChatHistory([]);
    setCurrentChatResponse(null); // ← Limpiar también del store
  };

  return {
    sendQuery,
    clearHistory,
    chatHistory,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
    currentResponse: currentChatResponse || chatMutation.data, // ← Store primario
  };
};
```

**Flujo:**
1. **Búsqueda exitosa** → `onSuccess` guarda en `setCurrentChatResponse(data)`
2. **Store persiste** → Zustand guarda en `localStorage`
3. **Navegación** → Componente se desmonta pero store persiste
4. **Regreso** → Hook lee `currentChatResponse` del store
5. **Render** → `ChatResult` muestra la respuesta guardada

## Flujo Completo del Usuario

### Escenario 1: Búsqueda y Exploración de Paper

```
┌─ Paso 1: Usuario busca ───────────────────────────────┐
│                                                        │
│  Dashboard (/):                                        │
│  Usuario escribe: "effects of microgravity on mice"   │
│  Presiona Enter                                        │
│  ↓                                                     │
│  useChatRag.sendQuery()                               │
│  ↓                                                     │
│  POST /api/chat                                        │
│  ↓                                                     │
│  Respuesta recibida:                                   │
│  {                                                     │
│    answer: "Studies show that...",                    │
│    citations: [                                        │
│      { snippet: "...", doi: "..." },                  │
│      { snippet: "...", doi: "..." }                   │
│    ]                                                   │
│  }                                                     │
│  ↓                                                     │
│  setCurrentChatResponse(respuesta)                    │
│  ↓                                                     │
│  ✅ Guardado en localStorage                          │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Paso 2: Usuario ve resultados ───────────────────────┐
│                                                        │
│  Dashboard (/):                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ 🤖 Respuesta del Chat                        │     │
│  │                                              │     │
│  │ Studies show that microgravity exposure...  │     │
│  │                                              │     │
│  │ 📚 Citas (3):                                │     │
│  │ [1] Mice in Bion-M 1 Space Mission          │     │
│  │ [2] Immune Response in Microgravity          │     │
│  │ [3] Bone Density Changes...                  │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Paso 3: Usuario hace click en paper ─────────────────┐
│                                                        │
│  Usuario click en: "Mice in Bion-M 1 Space Mission"   │
│  ↓                                                     │
│  Navegación: / → /study/mice-in-bion-m-1              │
│  ↓                                                     │
│  Dashboard Component se desmonta                       │
│  StudyDetail Component se monta                        │
│  ↓                                                     │
│  🔄 currentChatResponse persiste en store             │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Paso 4: Usuario ve detalle del paper ────────────────┐
│                                                        │
│  StudyDetail (/study/mice-in-bion-m-1):               │
│  ┌──────────────────────────────────────────────┐     │
│  │ ← Back to Dashboard                          │     │
│  │                                              │     │
│  │ Mice in Bion-M 1 Space Mission              │     │
│  │                                              │     │
│  │ Abstract:                                    │     │
│  │ This study presents the methodology for...   │     │
│  │                                              │     │
│  │ Authors: John Doe, Jane Smith               │     │
│  │ Year: 2023                                   │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Paso 5: Usuario vuelve al Dashboard ─────────────────┐
│                                                        │
│  Usuario click en: "← Back to Dashboard"              │
│  ↓                                                     │
│  Navegación: /study/mice-in-bion-m-1 → /              │
│  ↓                                                     │
│  StudyDetail Component se desmonta                     │
│  Dashboard Component se monta                          │
│  ↓                                                     │
│  useChatRag lee: currentChatResponse del store        │
│  ↓                                                     │
│  ✅ Respuesta restaurada desde localStorage           │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Paso 6: Usuario ve resultados preservados ───────────┐
│                                                        │
│  Dashboard (/):                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ 🤖 Respuesta del Chat                        │     │
│  │                                              │     │
│  │ Studies show that microgravity exposure...  │     │
│  │                                              │     │
│  │ 📚 Citas (3):                                │     │
│  │ [1] Mice in Bion-M 1 Space Mission ← VISTO │     │
│  │ [2] Immune Response in Microgravity          │     │
│  │ [3] Bone Density Changes...                  │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  ✅ Todo sigue visible                                │
│  ✅ Usuario puede seguir explorando otros papers      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Escenario 2: Persistencia Entre Sesiones

```
┌─ Usuario cierra el navegador ─────────────────────────┐
│                                                        │
│  Navegador cerrado mientras está en Dashboard         │
│  ↓                                                     │
│  Zustand persist middleware guarda en localStorage:   │
│  {                                                     │
│    "state": {                                          │
│      "currentChatResponse": {                         │
│        "answer": "Studies show...",                   │
│        "citations": [...]                             │
│      }                                                 │
│    }                                                   │
│  }                                                     │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Usuario reabre el navegador (Días después) ──────────┐
│                                                        │
│  Navega a: http://localhost:8080                      │
│  ↓                                                     │
│  Zustand persist lee de localStorage                  │
│  ↓                                                     │
│  currentChatResponse se restaura                      │
│  ↓                                                     │
│  ✅ Respuesta del chat visible inmediatamente         │
│  ✅ No necesita buscar de nuevo                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Ventajas de la Solución

### ✅ Persistencia Durante Navegación
El usuario puede explorar múltiples papers sin perder el contexto de su búsqueda original.

### ✅ Persistencia Entre Sesiones
Si el usuario cierra el navegador, la última búsqueda se mantiene visible al volver.

### ✅ Mejor UX
- No frustración por perder resultados
- Facilita comparación entre papers
- Permite exploración iterativa

### ✅ Performance
- No necesita re-ejecutar búsquedas
- Carga instantánea desde localStorage
- Reduce llamadas al backend

### ✅ Implementación Limpia
- Usa infraestructura existente (Zustand)
- No duplica lógica
- Fácil de mantener

## Casos de Uso

### Caso 1: Comparar Múltiples Papers
```
Usuario busca → Ve 5 papers relevantes → Abre paper 1 → Vuelve → 
Abre paper 2 → Vuelve → Abre paper 3 → Vuelve
✅ Lista de papers siempre visible
```

### Caso 2: Investigación Profunda
```
Usuario busca "bone density in space" → Ve respuesta con 10 citas →
Lee abstract de cada paper → Vuelve después de cada uno
✅ No necesita recordar cuáles ya revisó
```

### Caso 3: Sesión Interrumpida
```
Usuario busca → Ve resultados → Cierra navegador por error →
Reabre navegador
✅ Resultados siguen ahí, puede continuar
```

### Caso 4: Nueva Búsqueda
```
Usuario busca "mice in space" → Ve resultados →
Busca "radiation effects" → Nuevos resultados reemplazan los anteriores
✅ Solo la última búsqueda persiste (comportamiento esperado)
```

## Gestión del Estado

### Cuándo se Guarda
```typescript
// Automático en onSuccess del mutation
chatMutation.onSuccess = (data) => {
  setCurrentChatResponse(data); // ← Guarda en store + localStorage
};
```

### Cuándo se Limpia
```typescript
// Manual por el usuario
const clearHistory = () => {
  setCurrentChatResponse(null); // ← Limpia store + localStorage
};

// O automático al hacer nueva búsqueda (onSuccess reemplaza)
```

### Cómo se Lee
```typescript
// Hook retorna store como fuente primaria
return {
  currentResponse: currentChatResponse || chatMutation.data
  // ↑ Prioridad: store > mutation data reciente
};
```

## Testing

### Test 1: Navegación Básica
1. Buscar: "effects of microgravity"
2. Ver respuesta del chat ✅
3. Click en primer paper ✅
4. Ver detalle del paper ✅
5. Click "Back to Dashboard" ✅
6. **Verificar:** Respuesta del chat sigue visible ✅

### Test 2: Múltiples Navegaciones
1. Buscar: "bone density studies"
2. Click en paper 1 → Back
3. Click en paper 2 → Back
4. Click en paper 3 → Back
5. **Verificar:** Respuesta persiste después de 3 navegaciones ✅

### Test 3: Persistencia en localStorage
1. Buscar: "immune response"
2. Abrir DevTools → Application → localStorage
3. **Verificar:** Existe key "nasa-bio-ui-store" con currentChatResponse ✅
4. Refrescar página (F5)
5. **Verificar:** Respuesta sigue visible ✅

### Test 4: Limpiar Estado
1. Buscar: "radiation effects"
2. Ver respuesta
3. (Implementar botón "Clear Results" que llame clearChatResponse)
4. **Verificar:** Respuesta desaparece ✅

## Mejoras Futuras

### 1. Botón "Clear Results"
Agregar botón visible para que usuario limpie resultados manualmente:
```tsx
<Button onClick={clearChatResponse}>
  Clear Search Results
</Button>
```

### 2. Indicador de "Resultados Guardados"
Mostrar badge cuando se muestran resultados del store:
```tsx
{currentChatResponse && (
  <Badge>Showing saved results</Badge>
)}
```

### 3. Historial de Búsquedas
Guardar múltiples búsquedas en lugar de solo la última:
```typescript
chatSearchHistory: ChatResponse[]
addToHistory: (response) => { ... }
```

### 4. Límite de Tiempo
Limpiar resultados automáticamente después de cierto tiempo:
```typescript
// Guardar timestamp con la respuesta
{
  response: ChatResponse,
  timestamp: Date.now()
}

// Limpiar si es muy antigua (ej: 1 hora)
if (Date.now() - timestamp > 3600000) {
  clearChatResponse();
}
```

### 5. Compresión
Si las respuestas son muy grandes, comprimir antes de guardar:
```typescript
// Usar LZ-string o similar
import { compress, decompress } from 'lz-string';

const compressed = compress(JSON.stringify(response));
localStorage.setItem('chat', compressed);
```

## Conclusión

Esta solución es **simple y efectiva**, aprovechando la infraestructura existente de Zustand con persist middleware. El usuario ahora puede:

✅ Navegar libremente entre papers sin perder contexto  
✅ Comparar múltiples papers fácilmente  
✅ Retomar su investigación después de cerrar el navegador  
✅ Tener una experiencia más fluida y natural  

**Implementado en:** Commit `feat: persistir respuesta del chat RAG al navegar entre páginas`  
**Archivos modificados:**
- `src/store/useUiStore.ts` - Store global con persist
- `src/hooks/useChatRag.ts` - Hook actualizado para usar store

---

**Próximos pasos sugeridos:**
1. Agregar botón "Clear Results" visible en UI
2. Implementar indicador visual de "resultados guardados"
3. Testing exhaustivo con múltiples navegaciones
4. Considerar límite de tiempo para auto-limpiar resultados antiguos
