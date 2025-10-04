import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUiStore } from "@/store/useUiStore";
import { SearchFilters } from "@/lib/types";

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = useUiStore();

  // Sync filters from URL on mount
  useEffect(() => {
    const urlFilters: Partial<SearchFilters> = {};
    
    const q = searchParams.get("q");
    if (q) urlFilters.q = q;
    
    const yearFrom = searchParams.get("yearFrom");
    if (yearFrom) urlFilters.yearFrom = parseInt(yearFrom);
    
    const yearTo = searchParams.get("yearTo");
    if (yearTo) urlFilters.yearTo = parseInt(yearTo);
    
    const mission = searchParams.get("mission");
    if (mission) urlFilters.mission = mission;
    
    const species = searchParams.getAll("species");
    if (species.length) urlFilters.species = species;
    
    const outcome = searchParams.getAll("outcome") as any[];
    if (outcome.length) urlFilters.outcome = outcome;
    
    const page = searchParams.get("page");
    if (page) urlFilters.page = parseInt(page);
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, []);

  // Sync URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.q) params.set("q", filters.q);
    if (filters.yearFrom) params.set("yearFrom", filters.yearFrom.toString());
    if (filters.yearTo) params.set("yearTo", filters.yearTo.toString());
    if (filters.mission) params.set("mission", filters.mission);
    if (filters.species?.length) {
      filters.species.forEach(s => params.append("species", s));
    }
    if (filters.outcome?.length) {
      filters.outcome.forEach(o => params.append("outcome", o));
    }
    if (filters.page && filters.page > 1) {
      params.set("page", filters.page.toString());
    }
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  return { filters, setFilters };
};
