# NASA Bioscience Publications Explorer 🚀

> Frontend web application to explore 608 NASA bioscience publications through interactive search, knowledge graphs, and insights visualization.

## 🌟 Features

- **🔍 Advanced Search & Filtering**: Full-text search with multi-criteria filtering (year range, mission, species, outcomes)
- **📊 Knowledge Graph Viewer**: Interactive force-directed graph visualization of relationships between missions, experiments, species, and outcomes
- **📈 Insights & Trends**: Timeline analysis, top missions, outcome distribution, consensus vs. disagreement metrics
- **📄 Study Details**: Comprehensive publication view with AI-generated summaries, related publications, and metadata
- **🌐 Internationalization**: Full support for English and Spanish (es/en)
- **🌓 Dark/Light Mode**: Automatic theme detection with manual toggle
- **🔗 Deep Linking**: URL-based state management for sharing filters, searches, and graph selections
- **💾 Export**: CSV and JSON export capabilities for search results

## 🛠 Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS with custom design system
- **State Management**: 
  - React Query (TanStack Query) for server state
  - Zustand for UI state
- **Visualizations**:
  - Recharts for charts and trends
  - react-force-graph-2d for knowledge graph
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **i18n**: react-i18next

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nasa-bio-explorer

# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Configure your backend API URL in .env
# VITE_API_BASE_URL=http://localhost:3000/api

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root (or modify `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Important**: Replace `http://localhost:3000/api` with your actual backend API URL.

### API Endpoints Expected

The frontend expects the following API endpoints from your backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/search` | GET | Search studies with filters |
| `/studies/:id` | GET | Get study details and related publications |
| `/graph` | GET | Get knowledge graph data (nodes & links) |
| `/insights/overview` | GET | Get insights and trend data |
| `/kpi` | GET | Get dashboard KPI metrics |

### Query Parameters for `/search`:

- `q` (string): Search query
- `yearFrom` (number): Start year filter
- `yearTo` (number): End year filter
- `mission` (string): Mission filter
- `species` (string[]): Species filter (multiple)
- `outcome` (string[]): Outcome filter (multiple)
- `page` (number): Page number
- `pageSize` (number): Results per page

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── SearchBar.tsx   # Search input
│   ├── Filters/        # Filter components
│   ├── Results/        # Study cards, grid, pagination
│   ├── UI/             # Generic UI components
│   └── ...
├── pages/              # Route pages
│   ├── Dashboard.tsx   # Main search page
│   ├── StudyDetail.tsx # Study detail page
│   ├── GraphViewer.tsx # Knowledge graph page
│   └── Insights.tsx    # Trends and insights page
├── lib/
│   ├── api.ts          # API client functions
│   ├── types.ts        # TypeScript type definitions
│   └── i18n/           # Internationalization config
├── store/
│   └── useUiStore.ts   # Zustand UI state store
├── hooks/
│   ├── useFilters.ts   # Filter & URL sync hook
│   └── useDeepLink.ts  # Deep linking utilities
└── index.css           # Design system & global styles
```

## 🎨 Design System

The application uses a custom design system defined in `src/index.css` with HSL color tokens:

- **Primary**: Blue (`#3b82f6`) - Main brand color
- **Accent**: Cyan (`#00bcd4`) - Secondary highlights
- **Semantic tokens**: All colors use CSS variables for theme consistency
- **Dark mode**: Automatic with `prefers-color-scheme` detection

## 🌐 Internationalization

Switch languages using the globe icon in the header. Translations are stored in:

- `src/lib/i18n/locales/en.ts` (English)
- `src/lib/i18n/locales/es.ts` (Spanish)

Language preference is persisted in `localStorage`.

## 🔗 Deep Linking

All application state is synchronized with URL parameters:

**Dashboard**: `/?q=cell+biology&yearFrom=2010&yearTo=2020&mission=ISS&page=2`

**Graph**: `/graph` (filterable via controls)

**Study**: `/study/abc-123`

Use the "Copy Link" button to share the current view.

## 📤 Export Functionality

Export search results using the Export buttons in the dashboard:

- **CSV**: Tabular format for spreadsheets
- **JSON**: Structured data for further processing

## 🧪 Development

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

The application is a static SPA and can be deployed to any static hosting service:

```bash
# Build production bundle
npm run build

# The dist/ folder contains the deployable assets
```

### Deployment Options:
- **Vercel**: Connect your Git repo for automatic deployments
- **Netlify**: Drag & drop `dist/` folder or use CLI
- **AWS S3 + CloudFront**: Upload to S3, serve via CloudFront
- **GitHub Pages**: Use `gh-pages` package

**Important**: Make sure to set `VITE_API_BASE_URL` as an environment variable in your hosting platform.

## 🎯 Architecture Decisions

### Why React Query?
- Automatic caching and revalidation
- Built-in loading and error states
- Optimistic updates support
- Query invalidation patterns

### Why Zustand?
- Lightweight (1KB)
- Simple API without boilerplate
- Great for UI-only state (theme, filters)
- Persistence middleware for localStorage

### Why Vite over Next.js?
- Lovable platform constraint (React + Vite only)
- Faster dev server and HMR
- Simpler configuration
- CSR is sufficient for this use case

### Why Force Graph 2D?
- Canvas-based for performance with large graphs
- Built-in physics simulation
- Customizable node/link rendering
- Zoom and pan interactions

## 🔐 Security Considerations

- No sensitive data is stored client-side
- All API calls go through the configured backend
- No authentication implemented (add as needed)
- CORS must be configured on the backend

## 🐛 Troubleshooting

### API calls failing?
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running and accessible
- Check browser console for CORS errors

### Graph not rendering?
- Verify API returns valid `GraphResponse` format
- Check browser console for errors
- Ensure nodes have unique `id` fields

### Translations missing?
- Check `src/lib/i18n/locales/` files
- Ensure keys exist in both `en.ts` and `es.ts`

## 📝 License

MIT

## 🤝 Contributing

This is a generated frontend for a specific backend. Contributions welcome for:
- Bug fixes
- Performance improvements
- New visualizations
- Accessibility enhancements

---

Built with ❤️ using React + Vite + TypeScript
