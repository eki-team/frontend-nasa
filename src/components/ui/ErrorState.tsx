import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{t("common.error")}</h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {message || "Something went wrong. Please try again."}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
};
