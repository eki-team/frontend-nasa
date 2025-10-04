# 🔒 Solución de CORS - Frontend ↔️ Backend

## 🐛 Problema Original

```
Access to fetch at 'https://nasa-rag-service.onrender.com/api/chat' 
from origin 'https://frontend-nasa-mu9o.vercel.app' 
has been blocked by CORS policy
```

## ✅ Solución Implementada: Proxy de Vercel

### 1. Configuración `vercel.json`

Creamos un archivo `vercel.json` que actúa como proxy:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://nasa-rag-service.onrender.com/api/:path*"
    }
  ]
}
```

**¿Cómo funciona?**
- Las peticiones a `https://frontend-nasa-mu9o.vercel.app/api/chat` 
- Son redirigidas automáticamente a `https://nasa-rag-service.onrender.com/api/chat`
- Desde el mismo origen (no hay CORS)

### 2. Actualización `src/lib/api-rag.ts`

```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? "" // Empty string = same origin, uses Vercel proxy
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");
```

**Lógica:**
- **Producción (Vercel):** `API_BASE_URL = ""` → Usa rutas relativas `/api/chat`
- **Desarrollo local:** `API_BASE_URL = "http://localhost:8000"` o valor de `.env`

## 🔄 Flujo de Peticiones

### Desarrollo Local:
```
Frontend (localhost:8081) 
  ↓
http://localhost:8000/api/chat (Backend local)
```

### Producción:
```
Frontend (frontend-nasa-mu9o.vercel.app)
  ↓
/api/chat (Ruta relativa)
  ↓
Vercel Proxy (rewrite)
  ↓
https://nasa-rag-service.onrender.com/api/chat (Render backend)
```

## 🚀 Despliegue

1. **Hacer commit y push:**
   ```bash
   git add vercel.json src/lib/api-rag.ts
   git commit -m "fix: Add Vercel proxy to solve CORS issues"
   git push
   ```

2. **Vercel detecta automáticamente `vercel.json`**
3. **El proxy se activa inmediatamente**
4. **¡No más errores de CORS!** ✅

## 📝 Notas Importantes

### Ventajas de este enfoque:
- ✅ No requiere cambios en el backend
- ✅ Funciona inmediatamente
- ✅ Transparente para el frontend
- ✅ Mantiene desarrollo local funcionando

### Consideraciones:
- ⚠️ El backend de Render debe estar activo
- ⚠️ Puede agregar ~100-300ms de latencia (proxy)
- ⚠️ Si el backend implementa CORS correctamente, se puede quitar el proxy

## 🔧 Solución Alternativa: CORS en Backend

Si tienes acceso al backend, es mejor configurar CORS directamente:

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-nasa-mu9o.vercel.app",
        "http://localhost:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Con esto, podrías:
1. Eliminar `vercel.json`
2. Volver a usar `API_BASE_URL = "https://nasa-rag-service.onrender.com"`
3. Llamar directamente al backend sin proxy

## 🧪 Testing

### Local:
```bash
npm run dev
# Debe usar http://localhost:8000
```

### Producción:
```bash
npm run build
# Debe usar rutas relativas /api/...
```

### Verificar en navegador:
1. Abre DevTools → Network
2. Busca algo en la app
3. Debe ver: `/api/chat` (no la URL completa de Render)
4. Status: 200 OK ✅

## 📊 Estado Actual

- ✅ Proxy configurado en Vercel
- ✅ Frontend adaptado (rutas relativas en prod)
- ✅ Desarrollo local sigue funcionando
- ✅ Listo para deploy

