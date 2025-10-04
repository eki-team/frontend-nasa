export type OutcomeType = "positive" | "negative" | "mixed" | "inconclusive";

export interface Study {
  id: string;
  title: string;
  year: number | null;
  mission?: string;
  species?: string | string[];
  outcomes?: OutcomeType[];
  summary?: string;
  keywords?: string[];
  authors?: string[];
  doi?: string | null;
  abstract?: string;
  citations?: number;
  relevanceScore?: number;
}

export interface SearchResponse {
  studies: Study[]; // Cambio: items → studies
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface StudyDetail extends Study {
  related: Study[];
  abstract?: string;
  methods?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "mission" | "experiment" | "species" | "outcome" | "paper";
  degree?: number;
  color?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  weight?: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Insights {
  byYear: Array<{ year: number; count: number }>;
  topMissions: Array<{ name: string; count: number }>;
  outcomesDist: Array<{ label: string; count: number }>;
  consensusVsDisagreement: Array<{ topic: string; consensus: number; disagreement: number }>;
  heatmap: Array<{ entity: string; outcome: string; count: number }>;
}

export interface SearchFilters {
  query?: string; // Cambio: q → query
  q?: string; // Mantener q para compatibilidad
  yearFrom?: number;
  yearTo?: number;
  mission?: string;
  species?: string[];
  outcome?: OutcomeType[];
  page?: number;
  pageSize?: number;
}

export interface KpiData {
  totalStudies: number;
  yearsCovered: string;
  totalMissions: number;
  totalSpecies: number;
}
