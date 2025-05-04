
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DoctorCasePatient } from "@/hooks/useDoctorCases";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeFrame } from "@/components/ui/TimeFilter";

interface PatientsChartProps {
  data: DoctorCasePatient[];
  timeframe: TimeFrame;
  fullWidth?: boolean;
}

export function PatientsChart({ data, timeframe, fullWidth = false }: PatientsChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<{ name: string; patients: number }[]>([]);

  useEffect(() => {
    // Process data for the chart based on timeframe
    const patientCounts: Record<string, Set<string>> = {};
    
    data.forEach(row => {
      const date = new Date(row.created_at);
      let key: string;
      
      switch (timeframe) {
        case "hour":
          key = `${date.getHours()}:00`;
          break;
        case "day":
          key = date.toLocaleDateString();
          break;
        case "week": {
          // Get day of week
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          key = days[date.getDay()];
          break;
        }
        case "month":
          key = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        case "year":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toLocaleDateString();
      }
      
      if (!patientCounts[key]) {
        patientCounts[key] = new Set();
      }
      
      patientCounts[key].add(row.patient_id);
    });
    
    // Convert to array for recharts with unique patient counts
    const formattedData = Object.entries(patientCounts).map(([name, patients]) => ({
      name,
      patients: patients.size,
    }));
    
    // Sort by name (which is date/time)
    formattedData.sort((a, b) => a.name.localeCompare(b.name));
    
    setChartData(formattedData);
  }, [data, timeframe]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.patients")}</CardTitle>
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
        <CardTitle>{t("dashboard.patients")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={fullWidth ? "h-96" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                allowDecimals={false}
                label={{ 
                  value: t("dashboard.patients"), 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip
                formatter={(value: number) => [value, t("dashboard.patients")]}
              />
              <Bar 
                dataKey="patients" 
                fill="#0e8bf1" 
                name={t("dashboard.patients")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
