
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { useDoctorCases } from "@/hooks/useDoctorCases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function History() {
  const { t, dir } = useLanguage();
  const { allData, loading, error } = useDoctorCases();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter for cases with status "3" (Closed)
  const closedCases = allData.filter(
    (row) => 
      row.case_status === "3" &&
      (searchTerm === "" || 
        row.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.final_diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.case_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return (
      <Layout>
        <div>
          <h1 className="text-3xl font-bold mb-6">{t("history.title")}</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{t("history.title")}</h1>
          <div className="w-full md:w-1/3">
            <Input
              placeholder={t("history.filter")}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("status.3")} {t("dashboard.cases")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("case.patientName")}</TableHead>
                    <TableHead>{t("case.finalDiagnosis")}</TableHead>
                    <TableHead>{t("case.updated")}</TableHead>
                    <TableHead className="text-right">{t("case.view")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedCases.map(row => (
                    <TableRow key={row.case_id}>
                      <TableCell>{row.patient_name}</TableCell>
                      <TableCell>{row.final_diagnosis || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(row.updated_at), "PPP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/cases/${row.case_id}`}>
                            <span>{t("case.view")}</span>
                            <ArrowRight className={`ml-2 h-4 w-4 ${dir === "rtl" ? "rtl:ml-0 rtl:mr-2 rtl:rotate-180" : ""}`} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {closedCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        {searchTerm ? t("history.noResults") : t("history.noData")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
