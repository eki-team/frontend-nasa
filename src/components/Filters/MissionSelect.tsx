import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUiStore } from "@/store/useUiStore";

// Mock missions - in real app, fetch from API
const MISSIONS = [
  "ISS", "STS", "Apollo", "Skylab", "Gemini", 
  "Mercury", "SpaceX", "Shuttle", "Mir"
];

export const MissionSelect = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useUiStore();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{t("filters.mission")}</Label>
      
      <Select
        value={filters.mission || "all"}
        onValueChange={(value) => setFilters({ mission: value === "all" ? undefined : value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("filters.allMissions")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allMissions")}</SelectItem>
          {MISSIONS.map((mission) => (
            <SelectItem key={mission} value={mission}>
              {mission}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
