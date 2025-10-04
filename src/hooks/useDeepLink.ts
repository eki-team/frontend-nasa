import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useDeepLink = () => {
  const { t } = useTranslation();

  const copyCurrentUrl = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t("common.copyLink"), {
        description: "URL copied to clipboard"
      });
    });
  }, [t]);

  return { copyCurrentUrl };
};
