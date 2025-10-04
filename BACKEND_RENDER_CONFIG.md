# 🚀 Configuración del Backend RAG

## Backend Desplegado en Render

**URL de Producción:** https://nasa-rag-service.onrender.com

## Archivos de Configuración

### `.env` (Desarrollo Local)
```env
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
```

### `.env.production` (Producción en Vercel)
```env
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
```

## Endpoints Disponibles

### 1. Chat RAG
- **Endpoint:** `POST /api/chat`
- **Uso:** Búsqueda conversacional con filtros
- **Implementado en:** `src/hooks/useChatRag.ts`

### 2. Health Check
- **Endpoint:** `GET /diag/health`
- **Uso:** Verificar estado del servicio

### 3. Retrieve
- **Endpoint:** `POST /api/retrieve`
- **Uso:** Búsqueda vectorial directa

### 4. Embed
- **Endpoint:** `POST /api/embed`
- **Uso:** Generar embeddings

### 5. Facets
- **Endpoint:** `POST /api/facets`
- **Uso:** Obtener opciones de filtros

### 6. Sources
- **Endpoint:** `GET /api/sources`
- **Uso:** Listar fuentes disponibles

## 🔄 Cómo Funciona la Conexión

1. El frontend lee `VITE_API_BASE_URL` desde las variables de entorno
2. En desarrollo: usa `.env`
3. En producción (Vercel): usa `.env.production`
4. Todas las llamadas API van a través de `src/lib/api-rag.ts`

## 🧪 Probar la Conexión

### Opción 1: Desde el navegador
1. Ejecuta `npm run dev`
2. Ve a http://localhost:8081
3. Haz una búsqueda en la barra principal
4. Verás los resultados del backend de Render

### Opción 2: Health Check Manual
```bash
curl https://nasa-rag-service.onrender.com/diag/health
```

## 📝 Notas Importantes

- ⚠️ **Render Free Tier:** El backend puede tardar ~30-60 segundos en iniciar si estuvo inactivo
- ✅ El `.env` está en `.gitignore` (no se sube a GitHub)
- ✅ El `.env.production` NO está en `.gitignore` (se sube para Vercel)
- 🔒 No hay API keys requeridas actualmente

## 🚀 Deploy a Vercel

Cuando hagas push a GitHub y despliegues en Vercel:
1. Vercel automáticamente usará `.env.production`
2. La URL ya estará configurada: `https://nasa-rag-service.onrender.com`
3. No necesitas configurar variables de entorno manualmente en Vercel

## 🛠️ Cambiar entre Local y Render

Para usar el backend local (si lo tienes corriendo):
```env
# .env
VITE_API_BASE_URL=http://localhost:8000
```

Para usar Render:
```env
# .env
VITE_API_BASE_URL=https://nasa-rag-service.onrender.com
```

Luego ejecuta:
```bash
npm run dev
```

## ✅ Estado Actual

- ✅ Backend desplegado en Render
- ✅ Frontend configurado para conectar a Render
- ✅ Variables de entorno configuradas
- ✅ Build exitoso
- ✅ Listo para deploy en Vercel

