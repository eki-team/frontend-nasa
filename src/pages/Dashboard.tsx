import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Rocket, FlaskConical, Download, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ExpandableSearch";
import { StudiesGrid } from "@/components/Results/StudiesGrid";
import { Pagination } from "@/components/Results/Pagination";
import { KpiCard } from "@/components/ui/KpiCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
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
    if (searchData?.studies) {
      exportToCSV(searchData.studies, "nasa-bio-studies.csv");
    }
  };

  const handleExportJSON = () => {
    if (searchData?.studies) {
      exportToJSON(searchData.studies, "nasa-bio-studies.json");
    }
  };

  return (
    <div className="space-y-8">
      {/* Minimalist Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 py-20 md:py-32 relative overflow-hidden min-h-[60vh] flex flex-col items-center justify-center"
      >
        {/* Subtle Background decoration */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-full blur-3xl"
          />
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6"
        >
          {t("dashboard.title")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 px-4"
        >
          {t("dashboard.subtitle")}
        </motion.p>
      </motion.div>

      {/* Minimalist Search Section - Only Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 -mt-20 relative z-10"
      >
        <ExpandableSearch />
      </motion.div>

      {/* KPIs with stagger animation - Only show when there are results */}
      {(searchData || filters.query || filters.q) && (
        <motion.div 
          initial="hidden"
          animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
      >
        {[
          { title: t("dashboard.totalStudies"), value: kpiData?.totalStudies || 608, icon: BookOpen },
          { title: t("dashboard.yearsCovered"), value: kpiData?.yearsCovered || "1960-2024", icon: Calendar },
          { title: t("dashboard.missions"), value: kpiData?.totalMissions || 12, icon: Rocket },
          { title: t("dashboard.species"), value: kpiData?.totalSpecies || 45, icon: FlaskConical }
        ].map((kpi, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <KpiCard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              isLoading={isLoadingKpi}
            />
          </motion.div>
        ))}
      </motion.div>
      )}

      {/* Results Section - Only show when searching */}
      {(searchData || filters.query || filters.q) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
        {/* Actions Bar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/50 backdrop-blur-sm border rounded-xl p-4"
        >
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {searchData && (
                <span>
                  {searchData.total} resultados
                  {(filters.query || filters.q) && ` para "${filters.query || filters.q}"`}
                </span>
              )}
            </div>
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
        </motion.div>

        {/* Results Grid with AnimatePresence */}
        <AnimatePresence mode="wait">
          {searchError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ErrorState 
                message={searchError.message}
                onRetry={() => refetch()}
              />
            </motion.div>
          ) : searchData?.studies.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StudiesGrid 
                studies={searchData?.studies || []} 
                isLoading={isLoadingSearch}
              />
              
              {searchData && (
                <div className="mt-6">
                  <Pagination
                    total={searchData.total}
                    pageSize={searchData.pageSize}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
