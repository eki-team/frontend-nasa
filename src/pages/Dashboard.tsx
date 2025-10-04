import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, Rocket, FlaskConical, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/Filters/FilterPanel";
import { StudiesGrid } from "@/components/Results/StudiesGrid";
import { Pagination } from "@/components/Results/Pagination";
import { KpiCard } from "@/components/UI/KpiCard";
import { ErrorState } from "@/components/UI/ErrorState";
import { EmptyState } from "@/components/UI/EmptyState";
import { searchStudies, getKpiData, exportToCSV, exportToJSON } from "@/lib/api";
import { useFilters } from "@/hooks/useFilters";
import { useDeepLink } from "@/hooks/useDeepLink";

const Dashboard = () => {
  const { t } = useTranslation();
  const { filters } = useFilters();
  const { copyCurrentUrl } = useDeepLink();

  const { data: searchData, isLoading: isLoadingSearch, error: searchError, refetch } = useQuery({
    queryKey: ["search", filters],
    queryFn: () => searchStudies(filters)
  });

  const { data: kpiData, isLoading: isLoadingKpi } = useQuery({
    queryKey: ["kpi"],
    queryFn: getKpiData
  });

  const handleExportCSV = () => {
    if (searchData?.items) {
      exportToCSV(searchData.items, "nasa-bio-studies.csv");
    }
  };

  const handleExportJSON = () => {
    if (searchData?.items) {
      exportToJSON(searchData.items, "nasa-bio-studies.json");
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {t("dashboard.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t("dashboard.totalStudies")}
          value={kpiData?.totalStudies || 608}
          icon={BookOpen}
          isLoading={isLoadingKpi}
        />
        <KpiCard
          title={t("dashboard.yearsCovered")}
          value={kpiData?.yearsCovered || "1960-2024"}
          icon={Calendar}
          isLoading={isLoadingKpi}
        />
        <KpiCard
          title={t("dashboard.missions")}
          value={kpiData?.totalMissions || 12}
          icon={Rocket}
          isLoading={isLoadingKpi}
        />
        <KpiCard
          title={t("dashboard.species")}
          value={kpiData?.totalSpecies || 45}
          icon={FlaskConical}
          isLoading={isLoadingKpi}
        />
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto">
        <SearchBar />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {searchData && (
                <span>
                  {searchData.total} {t("common.search")} results
                  {filters.q && ` for "${filters.q}"`}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyCurrentUrl}>
                <Link2 className="h-4 w-4 mr-1" />
                {t("common.copyLink")}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          {searchError ? (
            <ErrorState 
              message={searchError.message}
              onRetry={() => refetch()}
            />
          ) : searchData?.items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <StudiesGrid 
                studies={searchData?.items || []} 
                isLoading={isLoadingSearch}
              />
              
              {searchData && (
                <Pagination
                  total={searchData.total}
                  pageSize={searchData.pageSize}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
