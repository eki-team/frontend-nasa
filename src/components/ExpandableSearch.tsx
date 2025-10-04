import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "@/components/Filters/FilterPanel";
import { useUiStore } from "@/store/useUiStore";

interface ExpandableSearchProps {
  onSearch?: (query: string) => void;
}

export const ExpandableSearch = ({ onSearch }: ExpandableSearchProps) => {
  const { t } = useTranslation();
  const { filters, setFilters } = useUiStore();
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    setFilters({ query: value, q: value, page: 1 }); // Soportar ambos formatos
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      const query = filters.query || filters.q || "";
      if (query.trim().length >= 3) {
        onSearch(query);
      }
    }
  };

  const handleInputClick = () => {
    if (!showFilters) {
      setShowFilters(true);
      // Esperar a que la animación inicie antes de hacer scroll
      setTimeout(() => {
        if (containerRef.current) {
          const offset = 350; // Espacio desde el top
          const elementPosition = containerRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <div className="absolute left-5 z-10 pointer-events-none">
            <Search className="h-5 w-5 text-primary" />
          </div>
          
          {/* Sparkles Icon */}
          <AnimatePresence>
            {isFocused && (filters.query || filters.q) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute right-20 z-10 pointer-events-none"
              >
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            type="text"
            placeholder={t("dashboard.searchPlaceholder")}
            value={filters.query || filters.q || ""}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-14 pr-16 h-14 text-base glass-card-light border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-full shadow-2xl cursor-pointer placeholder:text-muted-foreground hover:border-primary/30"
          />

          {/* Filters Toggle Button */}
          <div className="absolute right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFilters}
              className="h-10 w-10 rounded-full hover:bg-accent/10 border border-border/30"
            >
              <AnimatePresence mode="wait">
                {showFilters ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="filters"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
          
          {/* Animated border on focus */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-xl -z-10"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hint text - only show when filters are closed */}
      <AnimatePresence>
        {!showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-3"
          >
            <motion.p
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-sm text-white/60 flex items-center justify-center gap-2"
            >
              <ChevronDown className="h-4 w-4 animate-bounce" />
              {t("dashboard.clickToSeeFilters")}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            ref={filtersRef}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              height: "auto", 
              y: 0,
              transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.3, delay: 0.1 },
                y: { duration: 0.3 }
              }
            }}
            exit={{ 
              opacity: 0, 
              height: 0, 
              y: -20,
              transition: {
                height: { duration: 0.3, delay: 0.1 },
                opacity: { duration: 0.2 },
                y: { duration: 0.3 }
              }
            }}
            className="mt-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard.advancedFilters")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.refineSearch")}</p>
                </div>
              </div>
              
              <FilterPanel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
