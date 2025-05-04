
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { useDoctorCases } from "@/hooks/useDoctorCases";
import { TimeFilter, TimeFrame } from "@/components/ui/TimeFilter";
import { DiseaseChart } from "@/components/charts/DiseaseChart";
import { PatientsChart } from "@/components/charts/PatientsChart";
import { PriorityChart } from "@/components/charts/PriorityChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { FileText, Users, BrainCircuit, Calendar, Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<TimeFrame>("week");
  const [searchQuery, setSearchQuery] = useState("");
  const { allData, loading, error } = useDoctorCases(timeframe);
  const [customView, setCustomView] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to get date range text
  const getDateRangeText = () => {
    const now = new Date();
    
    switch (timeframe) {
      case "hour":
        return format(now, "PPp");
      case "day":
        return format(now, "PPP");
      case "week": {
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }
      case "month":
        return format(now, "MMMM yyyy");
      case "year":
        return format(now, "yyyy");
      default:
        return format(now, "PPP");
    }
  };

  // Get unique patient count
  const uniquePatientIds = new Set(allData.map(row => row.patient_id));
  const patientCount = uniquePatientIds.size;
  
  // Cases by status
  const statusCounts = {
    queued: allData.filter(row => row.case_status === "1").length,
    active: allData.filter(row => row.case_status === "2").length,
    closed: allData.filter(row => row.case_status === "3").length
  };

  // Get average AI confidence score
  const aiDiagnoses = allData.filter(row => row.ai_confidence_score !== null);
  const avgConfidence = aiDiagnoses.length > 0 
    ? (aiDiagnoses.reduce((sum, row) => sum + (row.ai_confidence_score || 0), 0) / aiDiagnoses.length).toFixed(1)
    : "N/A";

  // Cases by priority
  const priorityCounts = {
    critical: allData.filter(row => row.ai_priority_rank === 1).length,
    high: allData.filter(row => row.ai_priority_rank === 2).length,
    low: allData.filter(row => row.ai_priority_rank === 3).length,
    nonUrgent: allData.filter(row => row.ai_priority_rank === 4).length
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-destructive mb-4">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold noto-sans">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground noto-sans">
              {t("dashboard.welcome")} {user?.email?.split('@')[0]}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("dashboard.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <TimeFilter onChange={setTimeframe} defaultValue={timeframe} />
            <Button variant="outline" size="icon" onClick={handleRefresh} className="h-10 w-10">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.date")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDateRangeText()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t(`filter.${timeframe}`)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.patients")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{patientCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(`filter.${timeframe}`)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.aiConfidence")}
              </CardTitle>
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{avgConfidence}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.avgConfidence")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.cases")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{allData.length}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">
                      {statusCounts.active} {t("status.2")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {statusCounts.queued} {t("status.1")}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setCustomView}>
          <TabsList>
            <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
            <TabsTrigger value="patients">{t("dashboard.patients")}</TabsTrigger>
            <TabsTrigger value="diseases">{t("dashboard.diseaseTypes")}</TabsTrigger>
            <TabsTrigger value="priorities">{t("dashboard.priority")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <DiseaseChart data={allData} />
              <PatientsChart data={allData} timeframe={timeframe} />
              <PriorityChart data={allData} />
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.patients")}</CardTitle>
                <CardDescription>
                  {t("dashboard.patientDetails")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientsChart data={allData} timeframe={timeframe} fullWidth={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diseases" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.diseaseTypes")}</CardTitle>
                <CardDescription>
                  {t("dashboard.diseaseDistribution")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiseaseChart data={allData} fullWidth={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="priorities" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.priority")}</CardTitle>
                <CardDescription>
                  {t("dashboard.priorityDistribution")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriorityChart data={allData} fullWidth={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Case Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.caseSummary")}</CardTitle>
            <CardDescription>
              {t("dashboard.statusSummary")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-medium text-secondary-foreground">{t("dashboard.totalCases")}</h3>
                <p className="text-3xl font-bold">{allData.length}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900">
                <h3 className="font-medium text-blue-700 dark:text-blue-300">{t("status.1")}</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{statusCounts.queued}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-amber-100 dark:bg-amber-900">
                <h3 className="font-medium text-amber-700 dark:text-amber-300">{t("status.2")}</h3>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{statusCounts.active}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900">
                <h3 className="font-medium text-green-700 dark:text-green-300">{t("status.3")}</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{statusCounts.closed}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">{t("dashboard.priorityDistribution")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-priority-1/10">
                  <h3 className="font-medium text-priority-1">{t("priority.1")}</h3>
                  <p className="text-3xl font-bold text-priority-1">{priorityCounts.critical}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-priority-2/10">
                  <h3 className="font-medium text-priority-2">{t("priority.2")}</h3>
                  <p className="text-3xl font-bold text-priority-2">{priorityCounts.high}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-priority-3/10">
                  <h3 className="font-medium text-priority-3">{t("priority.3")}</h3>
                  <p className="text-3xl font-bold text-priority-3">{priorityCounts.low}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-priority-4/10">
                  <h3 className="font-medium text-priority-4">{t("priority.4")}</h3>
                  <p className="text-3xl font-bold text-priority-4">{priorityCounts.nonUrgent}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
