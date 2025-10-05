# 🚀 Inicio Rápido - Sistema Mock Data

## ¿Qué es esto?

El sistema de mock data te permite **visualizar y probar TODA la aplicación** sin necesitar el backend funcionando. Esto incluye:
- ✅ **Chat RAG**: Respuestas inteligentes con citaciones
- ✅ **Búsqueda de Estudios**: 10 estudios científicos completos
- ✅ **Detalle de Estudios**: Información completa + estudios relacionados
- ✅ **Filtros**: Por misión, especie, outcome, años - TODOS FUNCIONALES
- ✅ **Dashboard**: KPIs y métricas
- ✅ **Insights**: Gráficos estadísticos
- ✅ **Knowledge Graph**: Visualización de red
- ✅ **Paginación**: Sistema completo

Perfecto para:
- Desarrollar y probar la UI
- Hacer demos y presentaciones
- Trabajar sin conexión al backend
- Testing de features

## ✅ Ya está activado!

El archivo `.env.local` ya está configurado con:
```
VITE_USE_MOCK_DATA=true
```

## 🎯 Cómo probar

1. **El servidor ya está corriendo** en: http://localhost:8081/

2. **Prueba el Chat RAG:**

   En el Dashboard (página principal), haz búsquedas:
   ```
   🔬 "What are the effects of microgravity on human cells?"
   ☢️ "How does cosmic radiation affect DNA?"
   🦴 "What happens to bone density in space?"
   🛡️ "How does the immune system change in space?"
   🌌 "Space exploration biological effects"
   ```

3. **Prueba la búsqueda de estudios:**

   Navega a la sección de búsqueda y prueba:
   ```
   Query: "microgravity"
   → Verás estudios sobre microgravedad
   
   Query: "bone" + Filter Mission: "ISS"
   → Estudios de ISS sobre huesos
   
   Query: "immune" + Filter Species: "Homo sapiens"
   → Estudios en humanos sobre sistema inmune
   
   Filter Outcome: "negative" + Years: 2020-2023
   → Estudios recientes con outcomes negativos
   ```

4. **Haz click en cualquier estudio** para ver:
   - Abstract completo
   - Autores y DOI
   - Metodología
   - 3 estudios relacionados

5. **Explora otras secciones:**
   - **Dashboard**: Verás KPIs mock (10 estudios, 2018-2023)
   - **Insights**: Gráficos estadísticos con datos mock
   - **Graph**: Visualización de red de conocimiento

6. **Abre la consola del navegador** (F12) para ver los logs detallados:
   ```
   [API] Using mock data mode
   [API] Mock request: ...
   [API] Mock response: ...
   ```

## 🔄 Para volver al backend real

Cuando el backend esté funcionando, edita `.env.local`:

```env
VITE_USE_MOCK_DATA=false
```

Y reinicia el servidor (`Ctrl+C` y `npm run dev`)

## 📚 Documentación completa

Lee `MOCK_DATA_SYSTEM.md` para más detalles sobre:
- Cómo funciona el sistema
- Cómo agregar más datos mock
- Estructura de las respuestas
- Tips y trucos

---

**¡Disfruta probando la UI con datos realistas!** 🎉
