
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type TimeFrame = "hour" | "day" | "week" | "month" | "year";

interface TimeFilterProps {
  onChange: (timeframe: TimeFrame) => void;
  defaultValue?: TimeFrame;
}

export function TimeFilter({ onChange, defaultValue = "day" }: TimeFilterProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<TimeFrame>(defaultValue);

  const handleChange = (timeframe: TimeFrame) => {
    setSelected(timeframe);
    onChange(timeframe);
  };

  return (
    <div className="flex space-x-2 rtl:space-x-reverse">
      <Button
        variant={selected === "hour" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChange("hour")}
        className="h-10"
      >
        {t("filter.hour")}
      </Button>
      <Button
        variant={selected === "day" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChange("day")}
        className="h-10"
      >
        {t("filter.day")}
      </Button>
      <Button
        variant={selected === "week" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChange("week")}
        className="h-10"
      >
        {t("filter.week")}
      </Button>
      <Button
        variant={selected === "month" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChange("month")}
        className="h-10"
      >
        {t("filter.month")}
      </Button>
      <Button
        variant={selected === "year" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChange("year")}
        className="h-10"
      >
        {t("filter.year")}
      </Button>
    </div>
  );
}
