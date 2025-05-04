
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { DoctorCasePatient } from "./useDoctorCases";

export function useCaseDetails(caseId: string) {
  const [caseData, setCaseData] = useState<DoctorCasePatient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorDiagnosis, setDoctorDiagnosis] = useState<any>(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          setError("No user email found. Please sign in.");
          setLoading(false);
          return;
        }

        // Call the RPC function with 'email' parameter
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "get_doctor_cases_and_patients",
          {
            email: session.user.email,
          }
        );

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          setError(rpcError.message);
          return;
        }

        // Find the specific case
        const foundCase = rpcData.find(
          (item: DoctorCasePatient) => item.case_id === caseId
        );

        if (foundCase) {
          setCaseData(foundCase);
          // Immediately fetch doctor diagnosis if case is found
          if (foundCase.diagnosis_confirmed_by) {
            fetchDoctorDiagnosis(foundCase.scan_id, foundCase.diagnosis_confirmed_by);
          }
        } else {
          setError("Case not found");
        }
      } catch (err: any) {
        console.error("Error fetching case details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  const fetchDoctorDiagnosis = async (scanId: string, doctorId: string) => {
    if (!scanId || !doctorId) return;
    
    try {
      console.log("Fetching doctor diagnosis with scanId:", scanId, "and doctorId:", doctorId);
      const { data, error } = await supabase
        .from('doctor_diagnoses')
        .select('*')
        .eq('scan_id', scanId)
        .eq('doctor_id', doctorId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching doctor diagnosis:", error);
        return;
      }
      
      console.log("Doctor diagnosis data:", data);
      if (data) {
        setDoctorDiagnosis(data);
      }
    } catch (err) {
      console.error("Error fetching doctor diagnosis:", err);
    }
  };

  const updateCase = async (updates: Partial<DoctorCasePatient>) => {
    try {
      if (!caseData || !caseData.case_id) {
        return { success: false, error: "Case not found" };
      }

      // Update only case status and notes in the cases table
      const { error } = await supabase
        .from('cases')
        .update({
          case_status: updates.case_status,
          updated_at: new Date().toISOString()
        })
        .eq('case_id', caseData.case_id);

      if (error) {
        console.error("Error updating case:", error);
        return { success: false, error: error.message };
      }

      // Update local state
      setCaseData({ ...caseData, ...updates });
      return { success: true, error: null };
    } catch (err: any) {
      console.error("Error updating case:", err);
      return { success: false, error: err.message };
    }
  };

  return { caseData, loading, error, updateCase, doctorDiagnosis };
}
