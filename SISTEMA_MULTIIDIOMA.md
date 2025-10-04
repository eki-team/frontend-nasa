# 🌍 Sistema Multi-idioma - NASA Bioscience Publications Explorer

## 📋 Resumen

Se ha expandido el sistema de internacionalización (i18n) de la aplicación para soportar **7 idiomas**, aumentando la accesibilidad para la comunidad científica internacional.

---

## 🗣️ Idiomas Soportados

| Código | Idioma | Nombre Nativo | Bandera | Agencia Espacial |
|--------|--------|---------------|---------|------------------|
| `en` | English | English | 🇺🇸 | NASA |
| `es` | Spanish | Español | 🇪🇸 | - |
| `fr` | French | Français | 🇫🇷 | ESA/CNES |
| `de` | German | Deutsch | 🇩🇪 | DLR/ESA |
| `pt` | Portuguese | Português | 🇧🇷 | AEB |
| `ja` | Japanese | 日本語 | 🇯🇵 | JAXA |
| `it` | Italian | Italiano | 🇮🇹 | ASI |

---

## 🎯 Características Implementadas

### 1. ✅ Selector de Idioma con Dropdown
- **Ubicación:** Header (esquina superior derecha)
- **Componente:** `LanguageSelector.tsx`
- **UI/UX:**
  - Dropdown elegante con banderas
  - Muestra nombre nativo del idioma
  - Indicador visual del idioma activo (✓)
  - Hover effects y animaciones
  - Ícono de globo con mini-bandera del idioma actual

### 2. ✅ Detección Automática de Idioma
- Detecta el idioma del navegador automáticamente
- Prioriza el idioma guardado en localStorage
- Fallback a inglés si el idioma no está soportado

### 3. ✅ Persistencia
- Preferencia de idioma guardada en localStorage
- Se mantiene entre sesiones
- Sincronizado con Zustand store

### 4. ✅ Traducciones Completas
Todos los textos de la interfaz están traducidos en 7 idiomas:
- Dashboard (título, subtítulo, placeholder de búsqueda)
- Filtros (rangos de años, misiones, especies, resultados)
- Navegación (dashboard, grafo, insights)
- Estudios (detalles, resumen, keywords, autores)
- Grafo de conocimiento (controles, leyenda)
- Insights (análisis, tendencias, gráficos)
- Mensajes del sistema (loading, error, no results)

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

#### Traducciones
- ✅ `src/lib/i18n/locales/fr.ts` - Francés (Français)
- ✅ `src/lib/i18n/locales/de.ts` - Alemán (Deutsch)
- ✅ `src/lib/i18n/locales/pt.ts` - Portugués (Português)
- ✅ `src/lib/i18n/locales/ja.ts` - Japonés (日本語)
- ✅ `src/lib/i18n/locales/it.ts` - Italiano (Italiano)

#### Componentes
- ✅ `src/components/LanguageSelector.tsx` - Selector de idioma con dropdown

### Archivos Modificados

#### Configuración i18n
- ✅ `src/lib/i18n/index.ts` - Agregados 5 nuevos idiomas
  ```typescript
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },  // ✨ NUEVO
    de: { translation: de },  // ✨ NUEVO
    pt: { translation: pt },  // ✨ NUEVO
    ja: { translation: ja },  // ✨ NUEVO
    it: { translation: it }   // ✨ NUEVO
  }
  ```

#### Store
- ✅ `src/store/useUiStore.ts` - Tipo `LanguageCode` expandido
  ```typescript
  export type LanguageCode = "en" | "es" | "fr" | "de" | "pt" | "ja" | "it";
  ```

#### Layout
- ✅ `src/components/Layout.tsx` - Integrado `LanguageSelector`
  - Reemplazado botón simple por dropdown completo
  - Removida función `toggleLanguage()` obsoleta

---

## 🎨 Diseño del Selector

### Vista Colapsada
```
┌─────────────────┐
│   🌐 + 🇺🇸      │  (Ícono globo con mini-bandera)
└─────────────────┘
```

### Vista Expandida (Dropdown)
```
┌──────────────────────────┐
│ 🇺🇸  English         ✓   │
│     English              │
├──────────────────────────┤
│ 🇪🇸  Español             │
│     Spanish              │
├──────────────────────────┤
│ 🇫🇷  Français            │
│     French               │
├──────────────────────────┤
│ 🇩🇪  Deutsch             │
│     German               │
├──────────────────────────┤
│ 🇧🇷  Português           │
│     Portuguese           │
├──────────────────────────┤
│ 🇯🇵  日本語              │
│     Japanese             │
├──────────────────────────┤
│ 🇮🇹  Italiano            │
│     Italian              │
└──────────────────────────┘
```

---

## 💻 Uso Programático

### Cambiar Idioma Manualmente
```typescript
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { i18n } = useTranslation();
  
  const changeToJapanese = () => {
    i18n.changeLanguage("ja");
  };
  
  return <button onClick={changeToJapanese}>日本語</button>;
};
```

### Obtener Idioma Actual
```typescript
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { i18n } = useTranslation();
  
  console.log("Current language:", i18n.language); // e.g., "fr"
  
  return <div>Language: {i18n.language}</div>;
};
```

### Usar Traducciones
```typescript
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.subtitle")}</p>
    </div>
  );
};
```

---

## 🔧 Agregar un Nuevo Idioma

### Paso 1: Crear Archivo de Traducción
Crear `src/lib/i18n/locales/[codigo].ts`:

```typescript
export const zh = { // Ejemplo: Chino
  common: {
    search: "搜索",
    filters: "过滤器",
    // ... resto de traducciones
  },
  // ... resto de secciones
};
```

### Paso 2: Importar en i18n/index.ts
```typescript
import { zh } from "./locales/zh";

// En resources:
resources: {
  // ... idiomas existentes
  zh: { translation: zh }
}
```

### Paso 3: Agregar al Selector
En `LanguageSelector.tsx`:
```typescript
const languages: Language[] = [
  // ... idiomas existentes
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];
```

### Paso 4: Actualizar Tipo
En `useUiStore.ts`:
```typescript
export type LanguageCode = "en" | "es" | "fr" | "de" | "pt" | "ja" | "it" | "zh";
```

---

## 🌐 Cobertura de Traducción

### Secciones Traducidas (100%)
- ✅ **Common** (8 términos)
  - search, filters, reset, loading, error, noResults, export, copyLink
  
- ✅ **Navigation** (3 elementos)
  - dashboard, graph, insights
  
- ✅ **Dashboard** (8 elementos)
  - title, subtitle, searchPlaceholder, totalStudies, yearsCovered, missions, species
  
- ✅ **Filters** (11 elementos)
  - yearRange, mission, species, outcome, from, to, allMissions, allSpecies, positive, negative, mixed, inconclusive
  
- ✅ **Study Details** (9 elementos)
  - details, summary, keywords, authors, related, year, mission, species, outcomes, backToDashboard
  
- ✅ **Knowledge Graph** (7 elementos)
  - title, subtitle, searchNode, filterByType, allTypes, clustering, legend, nodes, links
  
- ✅ **Insights** (6 elementos)
  - title, subtitle, publicationsByYear, topMissions, outcomeDistribution, consensusVsDisagreement, entityOutcomeHeatmap

**Total:** ~52 traducciones × 7 idiomas = **364 textos traducidos**

---

## 🎓 Ejemplos de Textos Traducidos

### Título Principal

| Idioma | Texto |
|--------|-------|
| 🇺🇸 EN | NASA Bioscience Publications Explorer |
| 🇪🇸 ES | Explorador de Publicaciones de Biociencia NASA |
| 🇫🇷 FR | Explorateur de publications de bioscience NASA |
| 🇩🇪 DE | NASA Biowissenschaften Publikations-Explorer |
| 🇧🇷 PT | Explorador de publicações de biociência NASA |
| 🇯🇵 JA | NASA バイオサイエンス出版物エクスプローラー |
| 🇮🇹 IT | Esploratore di pubblicazioni di bioscienza NASA |

### Placeholder de Búsqueda

| Idioma | Texto |
|--------|-------|
| 🇺🇸 EN | Search by title, keywords, species or mission... |
| 🇪🇸 ES | Buscar por título, palabras clave, especies o misión... |
| 🇫🇷 FR | Rechercher par titre, mots-clés, espèces ou mission... |
| 🇩🇪 DE | Suche nach Titel, Schlüsselwörtern, Arten oder Mission... |
| 🇧🇷 PT | Pesquisar por título, palavras-chave, espécies ou missão... |
| 🇯🇵 JA | タイトル、キーワード、種、ミッションで検索... |
| 🇮🇹 IT | Cerca per titolo, parole chiave, specie o missione... |

---

## 🧪 Testing

### Test Manual
1. Abrir la aplicación
2. Hacer clic en el ícono del globo 🌐
3. Seleccionar cada idioma del dropdown
4. Verificar que todos los textos cambien correctamente
5. Recargar la página y verificar que se mantenga el idioma seleccionado

### Test Programático
```typescript
// En la consola del navegador
import i18n from "@/lib/i18n";

// Probar cada idioma
["en", "es", "fr", "de", "pt", "ja", "it"].forEach(lang => {
  i18n.changeLanguage(lang);
  console.log(`${lang}:`, i18n.t("dashboard.title"));
});
```

### Test de Persistencia
```typescript
// Verificar localStorage
localStorage.getItem("i18nextLng"); // Debe mostrar el idioma actual

// Cambiar y verificar
i18n.changeLanguage("ja");
localStorage.getItem("i18nextLng"); // Debe mostrar "ja"
```

---

## 📊 Impacto

### Antes
- 🇺🇸 **2 idiomas** (Inglés, Español)
- Toggle simple entre dos opciones
- ~100 textos traducidos

### Después
- 🌍 **7 idiomas** (EN, ES, FR, DE, PT, JA, IT)
- Selector dropdown elegante
- **364 textos traducidos**
- Cobertura de principales agencias espaciales:
  - 🇺🇸 NASA
  - 🇫🇷 ESA/CNES
  - 🇩🇪 DLR
  - 🇧🇷 AEB
  - 🇯🇵 JAXA
  - 🇮🇹 ASI

### Alcance Global
- **Europa:** Francés, Alemán, Italiano, Español
- **América:** Inglés, Español, Portugués
- **Asia:** Japonés

---

## 🚀 Próximos Pasos Sugeridos

### Corto Plazo
- [ ] Agregar **Chino (中文)** - CNSA
- [ ] Agregar **Ruso (Русский)** - Roscosmos
- [ ] Agregar **Coreano (한국어)** - KARI
- [ ] Agregar **Hindi (हिन्दी)** - ISRO

### Mediano Plazo
- [ ] **Detección automática mejorada** basada en geolocalización
- [ ] **Sugerencia de idioma** en primera visita
- [ ] **A/B testing** de preferencias de idioma
- [ ] **Analytics** de uso por idioma

### Largo Plazo
- [ ] **Traducción automática** de contenido dinámico (títulos de papers, abstracts)
- [ ] **Crowdsourcing** de traducciones
- [ ] **Verificación** por hablantes nativos
- [ ] **Contexto científico** específico por idioma

---

## 🐛 Troubleshooting

### El idioma no cambia
**Problema:** Al seleccionar un idioma, la UI no se actualiza.  
**Solución:** 
1. Verificar que el archivo de traducción esté importado en `i18n/index.ts`
2. Limpiar caché del navegador
3. Verificar la consola por errores de importación

### Textos sin traducir
**Problema:** Algunos textos aparecen en inglés aunque el idioma sea otro.  
**Solución:**
1. Verificar que la key existe en el archivo de traducción
2. Usar `{t("key")}` correctamente en el componente
3. Revisar que la estructura del objeto de traducción sea correcta

### LocalStorage no persiste
**Problema:** El idioma se resetea al recargar.  
**Solución:**
1. Verificar que `i18next-browser-languagedetector` esté configurado
2. Comprobar que el navegador permite localStorage
3. Revisar la configuración de `persist` en Zustand

---

## 📚 Referencias

- **i18next:** https://www.i18next.com/
- **react-i18next:** https://react.i18next.com/
- **Código:** `src/lib/i18n/`
- **Componente:** `src/components/LanguageSelector.tsx`
- **Store:** `src/store/useUiStore.ts`

---

**Estado:** ✅ Implementado y funcional  
**Idiomas:** 7 (EN, ES, FR, DE, PT, JA, IT)  
**Traducciones:** 364 textos  
**Cobertura:** 100%  
**Última actualización:** 4 de octubre de 2025
