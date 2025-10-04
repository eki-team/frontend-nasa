import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/useUiStore";

export const YearRange = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useUiStore();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t("filters.yearRange")}</Label>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="yearFrom" className="text-xs text-muted-foreground">
            {t("filters.from")}
          </Label>
          <Input
            id="yearFrom"
            type="number"
            placeholder="1990"
            value={filters.yearFrom || ""}
            onChange={(e) => setFilters({ yearFrom: e.target.value ? parseInt(e.target.value) : undefined })}
            className="mt-1 bg-background/50 border-border/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
          />
        </div>
        
        <div>
          <Label htmlFor="yearTo" className="text-xs text-muted-foreground">
            {t("filters.to")}
          </Label>
          <Input
            id="yearTo"
            type="number"
            placeholder="2024"
            value={filters.yearTo || ""}
            onChange={(e) => setFilters({ yearTo: e.target.value ? parseInt(e.target.value) : undefined })}
            className="mt-1 bg-background/50 border-border/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
};
