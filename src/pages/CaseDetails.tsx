
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { useCaseDetails } from "@/hooks/useCaseDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ZoomableImage, ImageViewerDialog } from "@/components/ui/aspect-ratio";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabaseClient";
import { 
  ArrowLeft, FileText, Image, Loader2, Calendar, User, Phone, 
  Hash, History, Brain, AlertCircle, Star, 
  Save, CheckSquare, X, Undo, ZoomIn
} from "lucide-react";

// Translation map for diagnoses
const DIAGNOSIS_MAP: Record<string, string> = {
  "ms": "Multiple Sclerosis",
  "alzheimer": "Alzheimer's Disease",
  "cancer": "Brain Cancer"
};

export default function CaseDetails() {
  const { t, dir } = useLanguage();
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { caseData, loading, error, updateCase, doctorDiagnosis } = useCaseDetails(caseId || "");
  
  // Doctor diagnosis form state
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [aiImageRating, setAiImageRating] = useState([3]);
  const [llmNarrativeRating, setLlmNarrativeRating] = useState([3]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [scanData, setScanData] = useState<any>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  // Initialize form once case data is loaded
  useEffect(() => {
    if (caseData) {
      fetchScanData();

      // Load initial values from doctorDiagnosis if available
      if (doctorDiagnosis) {
        setFinalDiagnosis(doctorDiagnosis.final_doctor_diagnosis || "");
        setFeedbackComments(doctorDiagnosis.feedback_comments || "");
        setAiImageRating([doctorDiagnosis.ai_image_analysis_rating || 3]);
        setLlmNarrativeRating([doctorDiagnosis.llm_narrative_rating || 3]);
      }
    }
  }, [caseData, doctorDiagnosis]);

  // Save to local storage whenever user types
  useEffect(() => {
    if (caseId) {
      const savedData = {
        finalDiagnosis,
        feedbackComments,
        aiImageRating,
        llmNarrativeRating
      };
      localStorage.setItem(`case-${caseId}-progress`, JSON.stringify(savedData));
    }
  }, [caseId, finalDiagnosis, feedbackComments, aiImageRating, llmNarrativeRating]);

  // Load from local storage on initial load
  useEffect(() => {
    if (caseId) {
      const savedDataJson = localStorage.getItem(`case-${caseId}-progress`);
      if (savedDataJson) {
        try {
          const savedData = JSON.parse(savedDataJson);
          // Only use localStorage data if we don't have doctor diagnosis data from DB
          if (!doctorDiagnosis) {
            setFinalDiagnosis(savedData.finalDiagnosis || "");
            setFeedbackComments(savedData.feedbackComments || "");
            setAiImageRating(savedData.aiImageRating || [3]);
            setLlmNarrativeRating(savedData.llmNarrativeRating || [3]);
          }
        } catch (err) {
          console.error("Error parsing saved progress:", err);
        }
      }
    }
  }, [caseId, doctorDiagnosis]);

  const fetchScanData = async () => {
    if (!caseData?.scan_id) return;
    
    try {
      setLoadingScan(true);
      
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('scan_id', caseData.scan_id)
        .single();
        
      if (error) {
        console.error("Error fetching scan:", error);
        return;
      }
      
      console.log("Scan data:", data);
      setScanData(data);
    } catch (err) {
      console.error("Error fetching scan data:", err);
    } finally {
      setLoadingScan(false);
    }
  };

  const handleSave = async () => {
    if (!caseData || !caseData.scan_id) return;
    
    setIsSaving(true);
    
    try {
      // Update case status to "Active Care" if not already
      const caseUpdates = {
        case_status: "2" // Set to Active Care
      };
      
      const { success, error: caseError } = await updateCase(caseUpdates);
      
      if (!success) {
        throw new Error(caseError || "Failed to update case");
      }
      
      // Update or create doctor diagnosis in the doctor_diagnoses table
      const diagnosisData = {
        scan_id: caseData.scan_id,
        doctor_id: caseData.diagnosis_confirmed_by,
        ai_diagnosis_id: caseData.ai_diagnosis_id,
        ai_image_analysis_rating: aiImageRating[0],
        llm_narrative_rating: llmNarrativeRating[0],
        final_doctor_diagnosis: finalDiagnosis,
        feedback_comments: feedbackComments,
        created_by: caseData.diagnosis_confirmed_by,
        updated_by: caseData.diagnosis_confirmed_by
      };
      
      if (doctorDiagnosis?.doctor_diagnosis_id) {
        // Update existing diagnosis
        const { error: updateError } = await supabase
          .from('doctor_diagnoses')
          .update({
            ...diagnosisData,
            updated_at: new Date().toISOString()
          })
          .eq('doctor_diagnosis_id', doctorDiagnosis.doctor_diagnosis_id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new diagnosis
        const { error: insertError } = await supabase
          .from('doctor_diagnoses')
          .insert([{
            ...diagnosisData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: t("actions.save"),
        description: t("case.updated"),
      });
      
    } catch (err: any) {
      console.error("Error saving diagnosis:", err);
      toast({
        title: t("errors.saving"),
        description: err.message || t("errors.general"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseCase = async () => {
    if (!caseData) return;
    
    setIsSaving(true);
    
    try {
      // First save any changes
      await handleSave();
      
      // Update case status to "3" (Closed)
      const { success, error } = await updateCase({
        case_status: "3"
      });
      
      if (success) {
        toast({
          title: t("case.closed"),
          description: t("case.closedSuccess"),
        });
        // Navigate back to dashboard
        navigate('/cases');
      } else {
        throw new Error(error || "Failed to close case");
      }
    } catch (err: any) {
      toast({
        title: t("errors.saving"),
        description: err.message || t("errors.general"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReopenCase = async () => {
    if (!caseData) return;
    
    setIsSaving(true);
    
    try {
      // Update case_status to "2" (Active Care)
      const { success, error } = await updateCase({
        case_status: "2"
      });
      
      if (success) {
        toast({
          title: t("actions.reopen"),
          description: t("case.updated"),
        });
        // Navigate back to dashboard to see updated case list
        navigate('/cases');
      } else {
        throw new Error(error || "Failed to reopen case");
      }
    } catch (err: any) {
      toast({
        title: t("errors.saving"),
        description: err.message || t("errors.general"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTranslatedDiagnosis = (diagnosisKey: string) => {
    const lowerKey = diagnosisKey.toLowerCase();
    return DIAGNOSIS_MAP[lowerKey] || diagnosisKey;
  };

  const getPriorityLabel = (priority: number) => {
    return t(`priority.${priority}`);
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
      case "3": // Closed
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">
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

  if (error) {
    return (
      <Layout>
        <div className="space-y-4 animate-fade-in">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className={`me-2 h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
            {t("actions.back")}
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading || !caseData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const isClosed = caseData.case_status === "3";
  const imagePath = scanData?.image_storage_path || "/placeholder.svg";

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className={`me-2 h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
            {t("actions.back")}
          </Button>
          <div className="flex items-center gap-2">
            {isClosed ? (
              <Button 
                variant="secondary" 
                onClick={handleReopenCase} 
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <Undo className="h-4 w-4 me-1" />}
                {t("actions.reopen")}
              </Button>
            ) : (
              <>
                <Button 
                  variant="default" 
                  onClick={handleSave} 
                  disabled={isSaving || !finalDiagnosis}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <Save className="h-4 w-4 me-1" />}
                  {t("actions.save")}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      disabled={isSaving || !finalDiagnosis}
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <CheckSquare className="h-4 w-4 me-1" />}
                      {t("actions.close")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("case.confirmClose")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("case.closeWarning")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-between">
                      <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCloseCase}>
                        {t("actions.confirm")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Top row - Patient Info, Scan, AI Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patient Information */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t("case.patientInformation")}
                </CardTitle>
                {getStatusBadge(caseData.case_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{caseData.patient_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold noto-sans">{caseData.patient_name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {caseData.patient_id.substring(0, 8)}...</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium noto-sans">{t("case.patientDOB")}</span>
                  <span className="text-sm ms-auto noto-sans">
                    {format(new Date(caseData.date_of_birth), "PP")}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium noto-sans">{t("case.patientPhone")}</span>
                  <span className="text-sm ms-auto noto-sans">
                    {caseData.patient_phone_number}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium noto-sans">{t("case.patientNationalID")}</span>
                  <span className="text-sm ms-auto noto-sans">
                    {caseData.national_id}
                  </span>
                </div>
                
                {caseData.gender && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium noto-sans">{t("case.patientGender")}</span>
                    <span className="text-sm ms-auto noto-sans">
                      {caseData.gender}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2 noto-sans">
                  <History className="h-4 w-4 text-muted-foreground" />
                  {t("case.medicalHistory")}
                </h4>
                <ScrollArea className="h-24">
                  <div className="p-3 bg-muted/50 rounded-lg text-sm noto-sans">
                    {caseData.medical_history || t("case.noMedicalHistory")}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Brain Scan - Fixed height */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 noto-sans">
                <Brain className="h-5 w-5 text-primary" />
                {t("case.brainScan")}
              </CardTitle>
              {loadingScan ? (
                <CardDescription className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("case.loadingScan")}
                </CardDescription>
              ) : scanData ? (
                <CardDescription className="noto-sans">
                  {scanData.scan_type} - {format(new Date(scanData.scan_date), "PP")}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)]">
              <div 
                className="h-52 bg-black rounded-lg overflow-hidden cursor-pointer relative group mb-2"
                onClick={() => setImageViewerOpen(true)}
              >
                <img
                  src={imagePath}
                  alt="Brain Scan"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button variant="outline" className="bg-background/30 backdrop-blur-sm">
                    <ZoomIn className="me-2 h-4 w-4" />
                    {t("actions.enlarge")}
                  </Button>
                </div>
              </div>
              
              {scanData?.clinical_notes && (
                <div className="flex-1 overflow-auto">
                  <h4 className="text-sm font-medium mb-2 noto-sans">{t("case.clinicalNotes")}</h4>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm noto-sans">
                    {scanData.clinical_notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Diagnosis */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 noto-sans">
                <Brain className="h-5 w-5 text-primary" />
                {t("case.aiDiagnosis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {caseData.ai_diagnosis ? (
                <>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-semibold noto-sans">
                      {getTranslatedDiagnosis(caseData.ai_diagnosis)}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium noto-sans">{t("case.confidenceScore")}</label>
                        <span className="text-sm font-bold noto-sans">
                          {caseData.ai_confidence_score?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={caseData.ai_confidence_score || 0} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium noto-sans">{t("case.priority")}</span>
                      <span 
                        className={`ms-auto text-sm px-2 py-1 rounded-full ${
                          getPriorityColor(caseData.ai_priority_rank || 4)
                        }`}
                      >
                        {getPriorityLabel(caseData.ai_priority_rank || 4)}
                      </span>
                    </div>
                  </div>
                  
                  {caseData.llm_generated_patient_history && (
                    <>
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2 noto-sans">
                          <History className="h-4 w-4 text-muted-foreground" />
                          {t("case.llmGeneratedHistory")}
                        </h4>
                        <ScrollArea className="h-24">
                          <div className="p-3 bg-muted/50 rounded-lg text-sm noto-sans">
                            {caseData.llm_generated_patient_history}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">{t("case.noAiDiagnosis")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom Section - Doctor Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 noto-sans">
              <User className="h-5 w-5 text-primary" />
              {t("case.doctorDiagnosis")}
            </CardTitle>
            <CardDescription className="noto-sans">
              {isClosed ? t("case.viewDiagnosis") : t("case.editingDiagnosis")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Doctor Diagnosis - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="finalDiagnosis" className="block mb-2 noto-sans">
                  {t("case.finalDoctorDiagnosis")} {!isClosed && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  id="finalDiagnosis"
                  value={finalDiagnosis}
                  onChange={(e) => setFinalDiagnosis(e.target.value)}
                  disabled={isClosed}
                  placeholder={!isClosed ? t("case.enterDiagnosis") : ""}
                  className={`noto-sans h-28 ${!finalDiagnosis && !isClosed ? "italic text-muted-foreground" : ""}`}
                />
                {!finalDiagnosis && !isClosed && (
                  <p className="text-xs text-muted-foreground mt-1 noto-sans">{t("case.noDiagnosisYet")}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="feedbackComments" className="block mb-2 noto-sans">
                  {t("case.feedbackComments")}
                </Label>
                <Textarea
                  id="feedbackComments"
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  disabled={isClosed}
                  placeholder={!isClosed ? t("case.enterFeedback") : ""}
                  className={`noto-sans h-28 ${!feedbackComments && !isClosed ? "italic text-muted-foreground" : ""}`}
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* AI Ratings - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="block mb-2 noto-sans">
                  {t("case.aiImageRating")}
                </Label>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-5 w-5 ${i < aiImageRating[0] 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{aiImageRating[0]}/5</span>
                </div>
                <Slider
                  value={aiImageRating}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={!isClosed ? setAiImageRating : undefined}
                  disabled={isClosed}
                  className={isClosed ? "opacity-70" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="block mb-2 noto-sans">
                  {t("case.llmNarrativeRating")}
                </Label>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-5 w-5 ${i < llmNarrativeRating[0] 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{llmNarrativeRating[0]}/5</span>
                </div>
                <Slider
                  value={llmNarrativeRating}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={!isClosed ? setLlmNarrativeRating : undefined}
                  disabled={isClosed}
                  className={isClosed ? "opacity-70" : ""}
                />
              </div>
            </div>
          </CardContent>
          
          {!isClosed && (
            <CardFooter className="flex justify-end gap-3 bg-muted/30 pt-4">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSaving}
              >
                {t("actions.cancel")}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !finalDiagnosis}
                variant="glow"
                size="lg"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {t("actions.save")}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      <ImageViewerDialog 
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        src={imagePath}
        alt="Brain Scan"
      />
    </Layout>
  );
}
