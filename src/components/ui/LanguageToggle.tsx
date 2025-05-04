
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-9 w-9 rounded-md"
      title={language === "en" ? t("settings.arabic") : t("settings.english")}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {language === "en" ? t("settings.arabic") : t("settings.english")}
      </span>
    </Button>
  );
}
