
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Clock, Calendar } from "lucide-react";

// A simple sparkline chart component
const Sparkline = () => (
  <svg className="h-10 w-20" viewBox="0 0 100 30" preserveAspectRatio="none">
    <path
      d="M0,15 L10,18 L20,10 L30,20 L40,15 L50,25 L60,5 L70,22 L80,15 L90,10 L100,20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-primary"
    />
  </svg>
);

// Timeline component for radiology milestones
const Timeline = () => {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="relative py-8">
      {/* Timeline Bar */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary/30 transform -translate-y-1/2"></div>
      
      {/* Timeline Points */}
      <div className="flex justify-between relative">
        <TimelinePoint 
          year="1895"
          label={isRtl ? "اكتشاف الأشعة السينية" : "X-ray Discovery"} 
          position="start"
        />
        <TimelinePoint 
          year="1972"
          label={isRtl ? "التصوير الرقمي" : "Digital Imaging"} 
          position="middle"
        />
        <TimelinePoint 
          year="2023"
          label={isRtl ? "تشخيص الذكاء الاصطناعي" : "AI Diagnostics"} 
          position="end"
        />
      </div>
    </div>
  );
};

// Timeline point component
const TimelinePoint = ({ year, label, position }: { year: string, label: string, position: 'start' | 'middle' | 'end' }) => (
  <div className="flex flex-col items-center relative">
    <div className="w-4 h-4 rounded-full bg-primary"></div>
    <div className="mt-2 text-xs font-semibold">{year}</div>
    <div className={`text-xs text-muted-foreground max-w-20 text-center mt-1`}>
      {label}
    </div>
  </div>
);

export function DashboardPreview() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-8">
      <Timeline />
      
      <div className="grid gap-4">
        {/* Daily Scan Count Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.totalCases")}</p>
                <h4 className="text-2xl font-bold">128</h4>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        {/* Diagnostic Accuracy Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.avgConfidence")}</p>
                <h4 className="text-2xl font-bold">94%</h4>
              </div>
              <ChartLine className="h-8 w-8 text-primary" />
            </div>
            <Sparkline />
          </CardContent>
        </Card>
        
        {/* Turnaround Time Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{t("login.avgTurnaround")}</p>
                <h4 className="text-2xl font-bold">2.1h</h4>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
