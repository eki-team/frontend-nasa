import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUiStore } from "@/store/useUiStore";
import { OutcomeType } from "@/lib/types";

const OUTCOMES: OutcomeType[] = ["positive", "negative", "mixed", "inconclusive"];

export const OutcomeMultiSelect = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useUiStore();

  const toggleOutcome = (outcome: OutcomeType) => {
    const current = filters.outcome || [];
    const updated = current.includes(outcome)
      ? current.filter(o => o !== outcome)
      : [...current, outcome];
    
    setFilters({ outcome: updated.length ? updated : undefined });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t("filters.outcome")}</Label>
      
      <div className="space-y-2">
        {OUTCOMES.map((outcome) => (
          <div key={outcome} className="flex items-center space-x-2">
            <Checkbox
              id={outcome}
              checked={filters.outcome?.includes(outcome) || false}
              onCheckedChange={() => toggleOutcome(outcome)}
            />
            <Label
              htmlFor={outcome}
              className="text-sm font-normal cursor-pointer"
            >
              {t(`filters.${outcome}`)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
