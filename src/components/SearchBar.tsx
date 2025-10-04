import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/UI/input";
import { useUiStore } from "@/store/useUiStore";

export const SearchBar = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useUiStore();
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setFilters({ query: value, q: value, page: 1 }); // Soportar ambos formatos
  };

  return (
    <motion.div 
      className="relative w-full"
      animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        animate={isFocused ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
      >
        <Search className="h-5 w-5 text-primary" />
      </motion.div>
      
      <AnimatePresence>
        {isFocused && (filters.query || filters.q) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-10 pr-10 h-14 text-base bg-card border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
      />
      
      {/* Animated border on focus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 blur-md -z-10"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
