import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/UI/button";
import { Card } from "@/components/UI/card";
import { Separator } from "@/components/UI/separator";
import { YearRange } from "./YearRange";
import { MissionSelect } from "./MissionSelect";
import { OutcomeMultiSelect } from "./OutcomeMultiSelect";
import { useUiStore } from "@/store/useUiStore";

export const FilterPanel = () => {
  const { t } = useTranslation();
  const { resetFilters } = useUiStore();

  return (
    <Card className="p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("common.filters")}</h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          {t("common.reset")}
        </Button>
      </div>

      <div className="space-y-6">
        <YearRange />
        <Separator />
        <MissionSelect />
        <Separator />
        <OutcomeMultiSelect />
      </div>
    </Card>
  );
};
