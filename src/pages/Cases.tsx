
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { useDoctorCases, DoctorCasePatient, SortType } from "@/hooks/useDoctorCases";
import { TimeFilter, TimeFrame } from "@/components/ui/TimeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  ArrowRight, Loader2, Search, Filter, Wand2, 
  ArrowUpDown, ArrowDown, ArrowUp, Calendar, Undo 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Cases() {
  const { t, dir } = useLanguage();
  const [timeframe, setTimeframe] = useState<TimeFrame>("week");
  const { 
    allData, loading, error, 
    savePreviousTimeframe, 
    restorePreviousTimeframe, 
    savePreviousSortType,
    restorePreviousSortType
  } = useDoctorCases(timeframe);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [isAiSortActive, setIsAiSortActive] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10;

  const filteredCases = allData.filter(
    row => (row.case_status === "1" || row.case_status === "2") && 
    (row.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     row.initial_diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     row.case_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedCases = [...filteredCases].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "status":
        return a.case_status.localeCompare(b.case_status);
      case "priority":
        // Fixed: Priority 1 is highest (Critical), 4 is lowest (Non-urgent)
        const aPriority = a.ai_priority_rank || 4;
        const bPriority = b.ai_priority_rank || 4;
        return aPriority - bPriority; // Lower number (1) = higher priority should come first
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Get current page cases
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = sortedCases.slice(indexOfFirstCase, indexOfLastCase);
  
  // Calculate total number of pages
  const totalPages = Math.ceil(sortedCases.length / casesPerPage);

  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    savePreviousTimeframe();
    setTimeframe(newTimeframe);
  };

  const handleSortChange = (value: SortType) => {
    if (isAiSortActive) {
      setIsAiSortActive(false);
    }
    setSortBy(value);
  };

  const handleAISort = () => {
    if (!isAiSortActive) {
      // Save previous sort before changing to AI sort
      savePreviousSortType(sortBy);
      setSortBy("priority");
      setIsAiSortActive(true);
    } else {
      // If AI sort is already active, revert to previous sort
      const previousSort = restorePreviousSortType();
      if (previousSort) {
        setSortBy(previousSort);
      } else {
        setSortBy("newest");
      }
      setIsAiSortActive(false);
    }
  };

  const handleUndoTimeframe = () => {
    const previousTimeframe = restorePreviousTimeframe();
    setTimeframe(previousTimeframe);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-priority-1/10 text-priority-1";
      case 2:
        return "bg-priority-2/10 text-priority-2";
      case 3:
        return "bg-priority-3/10 text-priority-3";
      case 4:
        return "bg-priority-4/10 text-priority-4";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "1": // Queued
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400">
            {t(`status.${status}`)}
          </Badge>
        );
      case "2": // Active Care
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-400">
            {t(`status.${status}`)}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t(`status.${status}`)}
          </Badge>
        );
    }
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case "newest":
        return <ArrowDown className="ml-2 h-4 w-4" />;
      case "oldest":
        return <ArrowUp className="ml-2 h-4 w-4" />;
      case "status":
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
      case "priority":
        return <Wand2 className="ml-2 h-4 w-4" />;
      default:
        return <ArrowDown className="ml-2 h-4 w-4" />;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // Show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show a subset of page numbers
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= maxPageButtons; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage > totalPages - 3) {
        // Show last 5 pages
        for (let i = totalPages - maxPageButtons + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show current page and surrounding pages
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold noto-sans">{t("sidebar.cases")}</h1>
            <p className="text-muted-foreground noto-sans">{t("dashboard.activeCases")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("case.search") || "Search cases..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <TimeFilter onChange={handleTimeframeChange} defaultValue={timeframe} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{t("dashboard.activeCases")}</CardTitle>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1">
                      <Filter className="h-4 w-4 mr-1" />
                      {t("cases.sortBy")}
                      {getSortIcon()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSortChange("newest")}>
                      {t("cases.newest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
                      {t("cases.oldest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("status")}>
                      {t("cases.status")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant={isAiSortActive ? "aiSort" : "outline"}
                  className="flex items-center gap-1"
                  onClick={handleAISort}
                  aria-pressed={isAiSortActive}
                >
                  {isAiSortActive ? (
                    <>
                      <Undo className="h-4 w-4 mr-1" />
                      {t("cases.undoAiSort")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-1" />
                      {t("cases.aiSort")}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("case.patientName")}</TableHead>
                    <TableHead>{t("case.priority")}</TableHead>
                    <TableHead>{t("case.status")}</TableHead>
                    <TableHead>{t("case.initialDiagnosis")}</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {t("case.created")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">{t("case.view")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCases.length > 0 ? (
                    currentCases.map(row => (
                      <TableRow key={row.case_id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{row.patient_name}</div>
                          <div className="text-xs text-muted-foreground">{row.patient_id.substring(0, 8)}...</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(row.ai_priority_rank || 4)}`}>
                            {t(`priority.${row.ai_priority_rank || 4}`)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(row.case_status)}</TableCell>
                        <TableCell>
                          {row.initial_diagnosis 
                            ? t(`condition.${row.initial_diagnosis.toLowerCase()}`) || row.initial_diagnosis 
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(row.created_at), "PPP")}
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Filter className="h-12 w-12 mb-2 opacity-20" />
                          <p className="text-lg font-medium">
                            {searchQuery ? t("table.noResults") : t("table.noData")}
                          </p>
                          <p className="text-sm">
                            {searchQuery 
                              ? t("cases.tryAnotherSearch") 
                              : t("cases.createNewCase")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    {t("cases.page")} {currentPage} {t("cases.of")} {totalPages}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
