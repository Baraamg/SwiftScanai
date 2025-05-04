
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DoctorCasePatient } from "@/hooks/useDoctorCases";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DiseaseChartProps {
  data: DoctorCasePatient[];
  fullWidth?: boolean;
}

// Generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Consistent colors for common diagnoses
const DISEASE_COLORS: Record<string, string> = {
  "Stroke": "#FF5C7C",
  "Tumor": "#FFA83F",
  "Alzheimer's": "#5D87FF",
  "Multiple Sclerosis": "#4ECDC4",
  "Concussion": "#A3A1FB",
  "Epilepsy": "#FF8C42",
  "Migraine": "#8C5E58",
  "Normal": "#75BF72"
};

export function DiseaseChart({ data, fullWidth = false }: DiseaseChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    // Process data for the chart
    const diseaseCounts: Record<string, number> = {};
    const diseaseColors: Record<string, string> = { ...DISEASE_COLORS };
    
    // Count occurrences of each diagnosis
    data.forEach(row => {
      if (row.initial_diagnosis) {
        diseaseCounts[row.initial_diagnosis] = (diseaseCounts[row.initial_diagnosis] || 0) + 1;
        
        // Assign a consistent color if not already assigned
        if (!diseaseColors[row.initial_diagnosis]) {
          diseaseColors[row.initial_diagnosis] = getRandomColor();
        }
      }
    });
    
    // Convert to array format for recharts
    const formattedData = Object.entries(diseaseCounts).map(([name, count]) => ({
      name,
      value: count,
      color: diseaseColors[name]
    }));
    
    // Sort by count (highest first)
    formattedData.sort((a, b) => b.value - a.value);
    
    setChartData(formattedData);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.diseaseTypes")}</CardTitle>
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
        <CardTitle>{t("dashboard.diseaseTypes")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={fullWidth ? "h-96" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={fullWidth ? 120 : 80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name.length > 15 ? name.substring(0, 15) + '...' : name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, t("dashboard.cases")]}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
