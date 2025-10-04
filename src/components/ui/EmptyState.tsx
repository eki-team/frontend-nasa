import { FileQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm border border-border/50 mb-4 shadow-lg">
        <FileQuestion className="h-12 w-12 text-accent drop-shadow-lg" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{t("common.noResults")}</h3>
      
      <p className="text-muted-foreground text-center max-w-md">
        {message || t("common.noResultsMessage")}
      </p>
    </div>
  );
};
