import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/useUiStore";

export const SearchBar = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useUiStore();

  const handleSearch = (value: string) => {
    setFilters({ q: value, page: 1 });
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t("dashboard.searchPlaceholder")}
        value={filters.q || ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 h-12 text-base bg-card border-border focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
};
