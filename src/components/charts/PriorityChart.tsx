
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DoctorCasePatient } from "@/hooks/useDoctorCases";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriorityChartProps {
  data: DoctorCasePatient[];
  fullWidth?: boolean;
}

// Priority color mapping
const PRIORITY_COLORS = {
  1: "#FF5C7C", // Critical (Emergency)
  2: "#FFA83F", // High Priority
  3: "#5D87FF", // Low Priority
  4: "#4ECDC4"  // Non-urgent
};

const DEFAULT_COLOR = "#9E9E9E"; // Gray for unknown priority

export function PriorityChart({ data, fullWidth = false }: PriorityChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    // Process data for the chart
    const priorityCounts = data.reduce((acc, row) => {
      const priority = row.ai_priority_rank || 0;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Convert to array format for recharts
    const formattedData = Object.entries(priorityCounts).map(([priorityKey, count]) => {
      const priority = Number(priorityKey);
      const name = t(`priority.${priority}`);
      
      return {
        name,
        value: count,
        color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || DEFAULT_COLOR
      };
    });

    setChartData(formattedData);
  }, [data, t]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.priority")}</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">{t("table.noData")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={fullWidth ? "w-full" : ""}>
      <CardHeader>
        <CardTitle>{t("dashboard.priority")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={fullWidth ? "h-96" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={fullWidth ? 120 : 80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, t("dashboard.cases")]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
