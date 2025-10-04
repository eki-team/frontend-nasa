import { 
  SearchResponse, 
  StudyDetail, 
  GraphResponse, 
  Insights, 
  SearchFilters,
  KpiData 
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Helper to build query string
const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v.toString()));
      } else {
        query.append(key, value.toString());
      }
    }
  });
  
  return query.toString();
};

// Search studies
export const searchStudies = async (filters: SearchFilters): Promise<SearchResponse> => {
  const queryString = buildQueryString(filters);
  const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Get study detail
export const getStudyById = async (id: string): Promise<StudyDetail> => {
  const response = await fetch(`${API_BASE_URL}/studies/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch study: ${response.statusText}`);
  }
  
  return response.json();
};

// Get knowledge graph
export const getKnowledgeGraph = async (filters?: Partial<SearchFilters>): Promise<GraphResponse> => {
  const queryString = buildQueryString(filters || {});
  const response = await fetch(`${API_BASE_URL}/graph?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch graph: ${response.statusText}`);
  }
  
  return response.json();
};

// Get insights/overview
export const getInsights = async (filters?: Partial<SearchFilters>): Promise<Insights> => {
  const queryString = buildQueryString(filters || {});
  const response = await fetch(`${API_BASE_URL}/insights/overview?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }
  
  return response.json();
};

// Get KPI data
export const getKpiData = async (): Promise<KpiData> => {
  const response = await fetch(`${API_BASE_URL}/kpi`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
  }
  
  return response.json();
};

// Export utilities
export const exportToCSV = (data: any[], filename: string = "export.csv") => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === "string" && value.includes(",") 
          ? `"${value}"` 
          : value;
      }).join(",")
    )
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportToJSON = (data: any[], filename: string = "export.json") => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
